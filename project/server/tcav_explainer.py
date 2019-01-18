import tcav
import tcav.tcav
import tcav.custom_model as cm
import tcav.utils as utils
import json
import os
import image_crawler
from dataservice import get_model_list
import tcav.activation_generator as act_gen
import tensorflow as tf


def run_tcav():
    model = get_model_list("../../models/")[0]
    with open("../../datasets/image_imagenet_sample/id_to_label.json") as ifile:
        labels = json.load(ifile, object_hook=jsonKeys2int)

    model_to_run = 'inception_v3'
    tcav_dir = "../../models/tensorflow_inception_v3"

    # where activations are stored (only if your act_gen_wrapper does so)
    activation_dir = os.path.join(tcav_dir, 'activations/')
    # where CAVs are stored.
    # You can say None if you don't wish to store any.
    cav_dir = os.path.join(tcav_dir, 'cavs/')

    concept_directory = "../../datasets/tcav_concepts"
    target_directory = "../../datasets/targets"
    bottlenecks = ['mixed4d']  # @param

    utils.make_dir_if_not_exists(activation_dir)
    utils.make_dir_if_not_exists(cav_dir)

    # this is a regularizer penalty parameter for linear classifier to get CAVs.
    alphas = [0.1]
    # a folder that random images are stored
    random_counterpart = 'random_images'
    target = 'zebra'
    concepts = ["dotted", "striped", "zigzagged"]

    #crawl images for concepts and target class
    for concept in concepts:
        if not os.path.isdir(os.path.join(concept_directory, concept)):
            image_crawler.crawl_images(concept_directory, concept)
    if not os.path.isdir(os.path.join(target_directory, target)):
        image_crawler.crawl_images(target_directory, target)

    the_model = cm.InceptionV3Wrapper_custom(model.session,
                                             model,
                                             labels)

    act_generator = act_gen.ImageActivationGenerator(the_model, concept_directory, activation_dir, max_examples=100)

    tf.logging.set_verbosity(0)

    mytcav = tcav.TCAV(model.sess,
                       target,
                       concepts,
                       bottlenecks,
                       act_generator,
                       alphas,
                       random_counterpart,
                       cav_dir=cav_dir,
                       num_random_exp=10)

    results = mytcav.run()


def jsonKeys2int(x):
    if isinstance(x, dict):
            return {int(k):v for k,v in x.items()}
    return x


run_tcav()



