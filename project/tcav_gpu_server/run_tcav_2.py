import tensorflow as tf
import os
os.environ["CUDA_DEVICE_ORDER"]="PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"]="1" # bzw 0
config = tf.ConfigProto()
config.gpu_options.allow_growth = True
session = tf.Session(config=config)
import shutil
import tcav
from tcav.tcav import TCAV
import tcav.custom_model as cm
import tcav.utils as utils
import json
import os
import pickle
from dataservice import get_model_list, get_dataset_list
from tensorflow_models import InceptionModel
import tcav.activation_generator as act_gen
import random

model = InceptionModel(0, "model/inception_v3", "inception_v3",session=session, graph=session.graph)
dataset = get_dataset_list("datasets")[0]

def load_tcavs(model, dataset):

    tcav_scores = {}
    tcav_file_path = os.path.join("models", dataset.dataset_name + model.model_name + '-tcavscores-2' + '.pkl')
    if os.path.isfile(tcav_file_path):
        with open(tcav_file_path, 'rb') as f:
            tcav_scores = pickle.load(f)

    return tcav_scores


def run_tcav(model, dataset, previous_tcav_dict=None):
    
    dataset_name = dataset.dataset_name
    id_to_labels = dataset.id_to_label
    
    model_to_run = 'inception_v3'
    tcav_dir = "models/tensorflow_inception_v3_tcav_temps"

    # where activations are stored (only if your act_gen_wrapper does so)
    activation_dir = os.path.join(tcav_dir, 'activations/')
    # where CAVs are stored.
    # You can say None if you don't wish to store any.
    cav_dir = os.path.join(tcav_dir, 'cavs/')

    concept_directory = "datasets/tcav_concepts"
    target_directory = "datasets/image_ILSVRC2012_validation"
    bottlenecks = ['Mixed_5d','Mixed_7c']  # @param

    utils.make_dir_if_not_exists(activation_dir)
    utils.make_dir_if_not_exists(cav_dir)

    # this is a regularizer penalty parameter for linear classifier to get CAVs.
    alphas = [0.1]
    # a folder that random images are stored
    random_counterpart = 'random_images'
    #targets = random.sample(id_to_labels.keys(), 50)
    targets = [286, 370, 757, 595, 147, 108, 478, 517, 334, 173, 948, 727, 23]
    if -1 in targets:
        targets.remove(-1)
    print(targets)

    concepts = [dI for dI in os.listdir(concept_directory) if os.path.isdir(os.path.join(concept_directory,dI)) and "random" not in dI and "." not in dI]

    the_model = cm.InceptionV3Wrapper_custom(model.session,
                                             model,
                                             id_to_labels)

    act_generator = act_gen.ImageActivationGenerator(the_model, 
                                                     concept_directory, 
                                                     activation_dir, 
                                                     max_examples=100,
                                                     target_dir=target_directory, 
                                                     label_to_element_dict=dataset.label_to_elements )

    tf.logging.set_verbosity(0)

    if previous_tcav_dict == None:
        tcav_dict = previous_tcav_dict
    else:
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
                      num_random_exp=19,
                      use_numeric_class_label=True)

        results = mytcav.run(run_parallel=True, num_workers=5)

        tcav_dict = utils.print_results(results, class_id=target, result_dict=tcav_dict)

        tcav_file_path = os.path.join("models", dataset_name + model.model_name + '-tcavscores-2' + '.pkl')
        with open(tcav_file_path, 'wb') as f:
            pickle.dump(tcav_dict, f, pickle.HIGHEST_PROTOCOL)

    return tcav_dict

def jsonKeys2int(x):
    if isinstance(x, dict):
            return {int(k):v for k,v in x.items()}
    return x

tcav_dict = load_tcavs(model, dataset)
run_tcav(model, dataset, tcav_dict)