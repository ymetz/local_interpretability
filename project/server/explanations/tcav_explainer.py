from tcav.tcav import TCAV
import tcav.custom_model as cm
import tcav.utils as utils
import os
import pickle
from utils import image_crawler
from data_handling.dataservice import get_model_list, get_dataset_list
import tcav.activation_generator as act_gen
import tensorflow as tf


def load_tcavs(model, dataset):

    tcav_scores = {}
    tcav_file_name = os.path.join(model.model_path, dataset.dataset_name + model.model_name
                                      + '-tcavscores' + '.pkl')
    if os.path.isfile(tcav_file_name):
        with open(tcav_file_name, 'rb') as f:
            tcav_scores = pickle.load(f)

    return tcav_scores


def run_tcav():
    model = get_model_list("../../models/")[0]
    dataset = get_dataset_list("../../datasets")[0]

    dataset_name = dataset.dataset_name
    id_to_labels = dataset.id_to_label

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
    targets = ['zebra']
    concepts = ["dotted", "striped", "zigzagged", "irregular pattern", "gradient", "single color"]

    #crawl images for concepts and target class
    for concept in concepts:
        if not os.path.isdir(os.path.join(concept_directory, concept)):
            image_crawler.crawl_images(concept_directory, concept, N=50)
        # if not os.path.isdir(os.path.join(concept_directory, random_counterpart)):
        #    image_crawler.crawl_images(concept_directory, 'image', N=500)
    for target in targets:
        if not os.path.isdir(os.path.join(target_directory, target)):
            image_crawler.crawl_images(target_directory, target, N=50)

    the_model = cm.InceptionV3Wrapper_custom(model.session,
                                             model,
                                             id_to_labels)

    act_generator = act_gen.ImageActivationGenerator(the_model, concept_directory, activation_dir, max_examples=100)

    tf.logging.set_verbosity(0)

    tcav_dict = {}

    for target in targets:
        mytcav = TCAV(model.session,
                      target,
                      concepts,
                      bottlenecks,
                      act_generator,
                      alphas,
                      random_counterpart,
                      cav_dir=cav_dir,
                      num_random_exp=5)

        results = mytcav.run()

        # we have to subtract 1 from the target class, as it corresponds with our ground truth labels,
        # internally the network outputs are shifted by one, as 0 represents the background class instead of -1
        summary = utils.print_results(results, class_id=the_model.label_to_id(target)-1, result_dict=tcav_dict)

    tcav_file_path = os.path.join(model.model_path, dataset_name + model.model_name + '-tcavscores' + '.pkl')
    with open(tcav_file_path, 'wb') as f:
        pickle.dump(tcav_dict, f, pickle.HIGHEST_PROTOCOL)



def jsonKeys2int(x):
    if isinstance(x, dict):
            return {int(k):v for k,v in x.items()}
    return x




