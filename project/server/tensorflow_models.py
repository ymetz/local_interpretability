import tensorflow as tf
slim = tf.contrib.slim

import os
import sys

#add model directory to import path
sys.path.insert(0, "../../models")

from model import ModelPrototype

from tensorflow_inception_v3 import inception_v3 as inception
from preprocessing import inception_preprocessing, imagenet


class InceptionModel(ModelPrototype):

    def __init__(self, *args, graph=tf.Graph(), session=None, using_lrp=False, **kwargs):
        super(InceptionModel, self).__init__(*args, **kwargs)
        self.logdir = os.path.join(self.model_path, 'logdir')

        self.graph = graph
        if session == None:
            self.session = tf.Session(graph=self.graph)
        else:
            self.session = session
        self.scope = "InceptionV3"
        self.using_lrp = using_lrp
        self.image_size = inception.inception_v3.default_image_size

        self.prepare_model()


    def transform_images(self,path_list):
        with self.graph.as_default():
            out = []
            for f in path_list:
                image_raw = tf.image.decode_jpeg(open(f, 'rb').read(), channels=3)
                image = inception_preprocessing.preprocess_image(image_raw,
                                                                 self.image_size, self.image_size, is_training=False)
                out.append(image)
            return self.session.run([out])[0]

    def prepare_model(self):
        with self.graph.as_default():
            self.processed_images = tf.placeholder(tf.float32, shape=(None, 299, 299, 3))

            with slim.arg_scope(inception.inception_v3_arg_scope()):
                logits, end_points = inception.inception_v3(self.processed_images, num_classes=1001, is_training=False)

            if self.using_lrp:
                self.logits = end_points['Logits']
                self.probabilities = tf.argmax(logits, 1)
            else:
                self.end_points = end_points
                self.probabilities = tf.nn.softmax(logits)

            checkpoints_dir = '../../models/'
            init_fn = slim.assign_from_checkpoint_fn(
                os.path.join(checkpoints_dir, 'tensorflow_inception_v3/inception_v3.ckpt'),
                slim.get_model_variables(self.scope))
            init_fn(self.session)

    def predict_images(self, images):
        with self.graph.as_default():
            return self.session.run(self.probabilities, feed_dict={self.processed_images: images})

    def get_label_names(self):
        with self.graph.as_default():
            return imagenet.create_readable_names_for_imagenet_labels()

    def classify_single_image(self, dataset_path, image_name):
        with self.graph.as_default():
            image_raw = os.path.join(dataset_path, image_name)
            preprossed_image = inception_preprocessing.preprocess_image(image_raw,
                                                                 self.image_size, self.image_size, is_training=False)
            return self.session.run(self.probabilities, feed_dict={self.processed_images: preprossed_image})

