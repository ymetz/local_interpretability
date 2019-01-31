import tcav
from tcav.tcav import TCAV
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
    bottlenecks = ['Mixed_5d']  # @param

    utils.make_dir_if_not_exists(activation_dir)
    utils.make_dir_if_not_exists(cav_dir)

    # this is a regularizer penalty parameter for linear classifier to get CAVs.
    alphas = [0.1]
    # a folder that random images are stored
    random_counterpart = 'random_images'
    target = 'zebra'
    concepts = ["dotted", "striped", "zigzagged", "irregular pattern", "gradient", "single color"]
    test_concepts = [concepts[0]]

    #crawl images for concepts and target class
    for concept in concepts:
        if not os.path.isdir(os.path.join(concept_directory, concept)):
            image_crawler.crawl_images(concept_directory, concept, N=50)
        # if not os.path.isdir(os.path.join(concept_directory, random_counterpart)):
        #    image_crawler.crawl_images(concept_directory, 'image', N=500)
    if not os.path.isdir(os.path.join(target_directory, target)):
        image_crawler.crawl_images(target_directory, target, N=50)

    the_model = cm.InceptionV3Wrapper_custom(model.session,
                                             model,
                                             labels)

    act_generator = act_gen.ImageActivationGenerator(the_model, concept_directory, activation_dir, max_examples=100)

    tf.logging.set_verbosity(0)

    mytcav = TCAV(model.session,
                  target,
                  test_concepts,
                  bottlenecks,
                  act_generator,
                  alphas,
                  random_counterpart,
                  cav_dir=cav_dir,
                  num_random_exp=15)

    results = mytcav.run()

    print(results)
    utils.print_results(results)


def jsonKeys2int(x):
    if isinstance(x, dict):
            return {int(k):v for k,v in x.items()}
    return x


run_tcav()



