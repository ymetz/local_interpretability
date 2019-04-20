import tensorflow as tf
import os
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "0"  # bzw 1
config = tf.ConfigProto()
config.gpu_options.allow_growth = True
session = tf.Session(config=config)
from tcav.tcav import TCAV
import tcav.model as cm
import tcav.utils as utils
import pickle
from dataservice import get_dataset_list
from tensorflow_models import InceptionModel, TCAVInceptionWrapperSlim
import tcav.activation_generator as act_gen
from prepare_tcav_diretories import create_tcav_dirs

model = InceptionModel(0, "model/inception_v3", "inception_v3", session=session, graph=session.graph)
dataset = get_dataset_list("../../datasets")[0]


def load_tcavs(model, dataset):
    '''
    Load existing tcav scores from file
    :param model: Use model name to follow common naming convention
    :param dataset: Use dataset name for naming convention
    :return: imported tcav scores as dict
    '''
    tcav_scores = {}
    tcav_file_path = os.path.join("models", dataset.dataset_name + model.model_name + '-tcavscores-1' + '.pkl')
    if os.path.isfile(tcav_file_path):
        with open(tcav_file_path, 'rb') as f:
            tcav_scores = pickle.load(f)

    return tcav_scores


def run_tcav(model, dataset, previous_tcav_dict=None):
    '''

    :param model:
    :param dataset:
    :param previous_tcav_dict:
    :return:
    '''
    dataset_name = dataset.dataset_name
    id_to_labels = dataset.id_to_label

    tcav_dir = "models/tensorflow_inception_v3_tcav_temps"

    # where activations are stored (only if your act_gen_wrapper does so)
    activation_dir = os.path.join(tcav_dir, 'activations/')
    # where CAVs are stored.
    # You can say None if you don't wish to store any.
    cav_dir = os.path.join(tcav_dir, 'cavs/')

    concept_directory = "datasets/tcav_concepts"
    target_directory = "datasets/image_ILSVRC2012_validation"
    bottlenecks = ['Mixed_5d', 'Mixed_7c']  # @param

    create_tcav_dirs(dataset=dataset,
                     model=model,
                     concept_dir=concept_directory,
                     tcav_dir=tcav_dir,
                     nr_of_random_experiments=12,
                     concepts=["glossy surface", "matt surface", "uneven texture", "wrinkled object",
                               "rectangle pattern",
                               "transparent object", "translucent", "rectangular", "round", "triangular",
                               "complex shape",
                               "spiky surface", "tree", "flower", "plant", "grass,moss", "machine", "machine device",
                               "architecture", "clothes", "animal fur", "fabric,clothes", "inside lighting", "nature",
                               "beach", "underwater", "sky"],
                     nr_imgs_per_concept=50,
                     nr_random_images=500)

    # this is a regularizer penalty parameter for linear classifier to get CAVs.
    alphas = [0.1]
    # a folder that random images are stored
    random_counterpart = 'random_images'
    # targets = random.sample(id_to_labels.keys(), 10)
    targets = [65, 970, 230, 809, 516, 57, 334, 415, 674, 332, 109]
    if -1 in targets:
        targets.remove(-1)
    print(targets)

    concepts = [dI for dI in os.listdir(concept_directory)
                if os.path.isdir(os.path.join(concept_directory, dI)) and "random" not in dI and "." not in dI]

    the_model = TCAVInceptionWrapperSlim(model.session,
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
        print("create tcavs for:", target)
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
        
        print('Run TCAV creation')

        results = mytcav.run(run_parallel=True, num_workers=5)
        
        print('Finished tcav creation')

        tcav_dict = utils.print_results(results, class_id=target, result_dict=tcav_dict)
        
        print('Saved dict')

        tcav_file_path = os.path.join(model.model_path, dataset_name + model.model_name + '-tcavscores' + '.pkl')
        with open(tcav_file_path, 'wb') as f:
            pickle.dump(tcav_dict, f, pickle.HIGHEST_PROTOCOL)
            
        print('Saved to file')

    return tcav_dict


tcav_dict = load_tcavs(model, dataset)
run_tcav(model, dataset, tcav_dict)
