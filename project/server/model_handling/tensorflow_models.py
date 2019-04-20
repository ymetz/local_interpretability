import tensorflow as tf

slim = tf.contrib.slim

import os
import sys

# add model directory to import path
from sys import platform

if platform == "win32":
    sys.path.insert(0, "..\..\models")
else:
    sys.path.insert(0, "../../models")

from model_handling.model import ModelPrototype

# import specific model (may be done by importlib in future version)
from tensorflow_inception_v3 import inception_v3 as inception
from preprocessing import inception_preprocessing

#import tcav wrapper
from tcav.model import PublicImageModelWrapper

"""
    tensorflow_models.py
"""
class TensorflowSlimModel(ModelPrototype):

    def __init__(self, *args, graph=tf.Graph(), session=None, mode='prediction', tensorflow_slim_model=None,
                 model_preprocessing_function=None, scope="", slim_arg_scope="", image_size=0, logit_shift=0,
                 checkpoint_dir="",
                 **kwargs):
        """
        Base Class for Tensorflow Slim Models
        :param args: ModelPrototype Args
        :param graph: current graph to build the model in
        :param session: current tensorflow session to build the model in
        :param mode: available modes 'prediction'/'lrp' for prediction or generation of lrp images
        :param tensorflow_slim_model: the specification of a tensorflow slim model
        :param model_preprocessing_function: the preprocessing function corresponding to the model
        :param scope: the name of the variable scope
        :param slim_arg_scope: specific tf-slim paramter
        :param image_size: height/width of the image for quadratic images
        :param logit_shift: if network outputs are shifted in comparison to groundtruth labels
        :param checkpoint_dir: where to find the checkpoint file to initialize weights
        :param kwargs: further arguments passed to ModelPrototype Class
        """
        super(TensorflowSlimModel, self).__init__(*args, **kwargs)
        self.logdir = os.path.join(self.model_path, 'logdir')

        self.graph = graph
        if session is None:
            self.session = tf.Session(graph=self.graph)
        else:
            self.session = session
        self.scope = scope
        self.mode = mode
        self.image_size = image_size
        # For the inception model, logits are shifted by one compared to groundtruth labels
        # e.g. class 465 has the target logit 466. 0 is reserved for the background class
        self.logit_shift = logit_shift
        self.model_preprocessing_function = model_preprocessing_function
        self.tensorflow_slim_model = tensorflow_slim_model
        self.slim_arg_scope = slim_arg_scope
        self.checkpoint_dir = checkpoint_dir

        self.prepare_model()

    def transform_images(self, path_list):
        with self.graph.as_default():
            out = []
            for f in path_list:
                image_raw = tf.image.decode_jpeg(open(f, 'rb').read(), channels=3)
                image = self.model_preprocessing_function.preprocess_image(image_raw,
                                                                           self.image_size,
                                                                           self.image_size,
                                                                           is_training=False)
                out.append(image)
            return self.session.run([out])[0]

    def prepare_model(self):
        """
        Builds the model in the given graph and session context. As LRP requires a different endpoint,
        a switch is included
        :return:
        """
        with self.graph.as_default():
            self.processed_images = tf.placeholder(tf.float32, shape=(None, self.image_size, self.image_size, 3))

            with slim.arg_scope(self.slim_arg_scope):
                logits, end_points = self.tensorflow_slim_model\
                                         .inception_v3(self.processed_images, num_classes=1001, is_training=False)

            if self.mode == 'lrp':
                self.logits = end_points['Logits']
                self.probabilities = tf.argmax(logits, 1)
            else:
                self.end_points = end_points
                self.probabilities = tf.nn.softmax(logits)

            init_fn = slim.assign_from_checkpoint_fn(self.checkpoint_dir, slim.get_model_variables(self.scope))
            init_fn(self.session)

    def predict_images(self, images):
        with self.graph.as_default():
            return self.session.run(self.probabilities, feed_dict={self.processed_images: images})

    def classify_single_image(self, dataset_path, image_name):
        with self.graph.as_default():
            image_raw = os.path.join(dataset_path, image_name)
            preprossed_image = inception_preprocessing.preprocess_image(image_raw,
                                                                        self.image_size,
                                                                        self.image_size,
                                                                        is_training=False)
            return self.session.run(self.probabilities, feed_dict={self.processed_images: preprossed_image})


class InceptionModel(TensorflowSlimModel):
    """
    This is the the specific inception model. Specifiers have to be imported before calling
    """
    def __init__(self, *args, graph=tf.Graph(), session=None, mode='prediction', **kwargs):

        super(InceptionModel, self).__init__(*args,
                                             graph=graph,
                                             session=session,
                                             mode=mode,
                                             tensorflow_slim_model=inception,
                                             model_preprocessing_function=inception_preprocessing,
                                             scope="InceptionV3",
                                             slim_arg_scope=inception.inception_v3_arg_scope(),
                                             image_size=inception.inception_v3.default_image_size,
                                             logit_shift=1,
                                             checkpoint_dir='../../models/tensorflow_inception_v3/inception_v3.ckpt',
                                             **kwargs)


class TCAVInceptionWrapperSlim(PublicImageModelWrapper):
    '''
    The wrapper used for TCAV. Necessary as endpoint names vary from model to model.
    '''
    def __init__(self, sess, model, labels):
        self.image_value_range = (-1, 1)
        image_shape = [299, 299, 3]
        endpoints = dict(
            input='Mul:0',
            pre_avgpool='Mixed_7c/join:0',
        )
        endpoint_external = dict(
            input=model.processed_images,
            logit=model.end_points['Logits'],
            prediction=model.end_points['Predictions']
        )
        self.sess = sess
        self.scope = model.scope
        super(TCAVInceptionWrapperSlim, self).__init__(sess,
                                                       model,
                                                       labels,
                                                       image_shape,
                                                       endpoints,
                                                       endpoint_external,
                                                       scope=self.scope)
        self.model_name = 'InceptionV3_Slim'

