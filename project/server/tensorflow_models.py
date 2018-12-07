import tensorflow as tf
slim = tf.contrib.slim

import os
import sys

#add model directory to import path
sys.path.insert(0, "../../models")

from model import ModelPrototype

from tensorflow_inception_v3 import inception_v3 as inception
from preprocessing import inception_preprocessing

import matplotlib.pyplot as plt
import numpy as np


class InceptionModel(ModelPrototype):

    def __init__(self, *args, **kwargs):
        super(InceptionModel, self).__init__(*args, **kwargs)
        self.logdir = os.path.join(self.model_path, 'logdir')

        self.session = tf.Session()
        self.image_size = inception.inception_v3.default_image_size

        self.prepare_model()


    def transform_images(self,path_list):
        out = []
        for f in path_list:
            image_raw = tf.image.decode_jpeg(open(f, 'rb').read(), channels=3)
            image = inception_preprocessing.preprocess_image(image_raw,
                                                             self.image_size, self.image_size, is_training=False)
            out.append(image)
        return self.session.run([out])[0]

    def prepare_model(self):
        self.processed_images = tf.placeholder(tf.float32, shape=(None, 299, 299, 3))

        with slim.arg_scope(inception.inception_v3_arg_scope()):
            logits, _ = inception.inception_v3(self.processed_images, num_classes=1001, is_training=False)
        self.probabilities = tf.nn.softmax(logits)

        checkpoints_dir = '../../models/'
        init_fn = slim.assign_from_checkpoint_fn(
            os.path.join(checkpoints_dir, 'tensorflow_inception_v3/inception_v3.ckpt'),
            slim.get_model_variables('InceptionV3'))
        init_fn(self.session)

    def predict_images(self, images):
        return self.session.run(self.probabilities, feed_dict={self.processed_images: images})
