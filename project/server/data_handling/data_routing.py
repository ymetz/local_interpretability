from flask import Blueprint, jsonify, request, send_from_directory
from data_handling.dataservice import *
from data_handling.dataset import encode_dataset
from model_handling.classifier import create_top_5_predictions, check_classifier_performance
from explanations.tcav_explainer import load_tcavs
from explanations.lrp_explainer import initialize_lrp_model, create_lrp_explanation
from explanations.lime_explainer import create_lime_explanations

'''
    data_routing.py
    Contains the logic for all routing calls made by clients to the server as well as calls to data intialization
'''

# Global variables that store the state of the web server, could be extended in the future to enables multiple states
# for different sessions
datasets = []
models = []
active_dataset = None
active_model = None
tcav_scores = None
top_preds_for_active_model_dataset = None
classifier_performance_for_active_model_dataset = None
tcav_concept_examples = None
lrp_model, lrp_session, lrp_explainer = None, None, None

# this enables the routing functions to be called with prefix get_data/, e.g. localhost:5000/get_data/...
get_data = Blueprint('get_data', __name__)


@get_data.route("/get_datasets")
def get_datasets():
    '''
    Get information about all available datasets, e.g. dataset size, contained files etc.
    :return:
    '''
    return jsonify([encode_dataset(ds) for ds in datasets])


# Custom static data: This enables to send a file from a different directory from the server that is not inside
# the root directory of the web server.
@get_data.route('/dataset/<path:filename>')
def custom_static(filename):
    '''
    Get an element from the current dataset, normally an image, from the dataset directory
    :param filename: name of file we want to receive
    :return: img src that can be displayed in the web browser
    '''
    return send_from_directory(active_dataset.dataset_path, filename)


@get_data.route('/dataset_explanation/<path:filename>')
def custom_explanation_static(filename):
    '''
    Get an explanation image (e.g. LIME or LRP generated) from a specific directory holding explanation images
    :param filename: name of file we want to receive
    :return: img src that can be displayed in the web browser
    '''
    return send_from_directory(os.path.join(active_dataset.dataset_path, 'current_explanations'), filename)


@get_data.route('/tcav_concepts/<path:filename>')
def custom_tcav_concept_static(filename):
    '''
    Images used for the generation of TCAV concepts lie at a a specific directory
    :param filename: name of file we want to receive
    :return: img src that can be displayed in the web browser
    '''
    print(os.path.join("../../datasets/", 'tcav_concepts'))
    return send_from_directory(os.path.join("../../datasets/", 'tcav_concepts'), filename)


@get_data.route("/get_image")
def get_image():
    '''
    Get the source path of a single requested image. The subsequent call to the source made by the web browser is
    then processed by the custom static directory routines
    :return: the image source for a specific image called by id
    '''
    iid = request.args.get('id', default=0, type=int)
    i_path = "get_data/dataset/" + active_dataset.file_list[iid]
    return i_path


@get_data.route("/get_tcav_scores")
def tcav_scores_for_class():
    '''
    As there is only one TCAV score object at a time, just return the currently available
    :return: The TCAV scores dict as a JSON document
    '''
    return jsonify(tcav_scores)


@get_data.route("/get_explanation_image")
def get_explanation_image():
    '''
    Returns the source [similar to get_image()] for an explanation image, depending on the name of the original image,
    the method we want to retrieve an explanation image from (LIME or LRP) and the class we want the explanation image
    for.
    :return: the image source to be called by the web browser
    '''
    name = request.args.get('id', default="", type=str)
    method = request.args.get('method', default=0, type=str)
    img_class = request.args.get('class', default=0, type=int)
    if method == 'elrp':
        # Create the LRP explanation image on the fly as the method is fast enough
        create_lrp_explanation(datasets[0], [name], lrp_session, lrp_model, lrp_explainer,
                               top_preds_for_active_model_dataset, img_class=img_class)
    i_path = "get_data/dataset_explanation/" + method + '_' + str(img_class) + '_' + name
    return i_path


@get_data.route("/get_image_list")
def get_image_list():
    '''
    Get a list of all available images of the currently active dataset, including the image src and the dimensions of
    the images. Dimensions required for website layout creation
    :return: JSON containing an array of all available images in the dataset
    '''
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"],
                       "height": file["height"], "label": active_dataset.labels[file["src"]][0]}
                      for file in datasets[0].file_list]
    return jsonify(out_image_list)


@get_data.route("/get_labels")
def get_labels():
    '''
    Labels of currently active dataset.
    :return: JSON containing the ground truth label for the dataset objects
    '''
    return jsonify(active_dataset.labels)


@get_data.route("/get_id_to_label")
def get_id_to_label():
    '''
    Returns the dictionary that maps from numeric id to label names
    :return: JSON containing an object with numeric class ids as keys and human readable names as values
    '''
    return jsonify(active_dataset.id_to_label)


@get_data.route("/get_single_classification")
def get_single_classifications():
    '''
    Calls the active model to classify a single image
    :return: JSON containing the results of the classifier results for a single image (not bound to top5 predictions)
    '''
    iname = request.args.get('id', default=0, type=str)
    class_result = active_model.classify_single_image(active_dataset.dataset_path, iname)
    return jsonify(class_result)


@get_data.route("/get_top_classifications")
def get_top_classifications():
    '''
    Return the dictionary that contains the top5 predictions for the dataset elements, as returned by the classifier
    :return: JSON encoding the dictionary that contains the top 5 predictions for each dataset element
    '''
    return jsonify(top_preds_for_active_model_dataset)


@get_data.route("/get_classifier_performance")
def get_classifier_performance():
    '''
    Return the list that contains the classifier performance results for each class
    :return: JSON encoding the list that contains the performance for every class and the number of classified elements
    per class
    '''
    return jsonify(classifier_performance_for_active_model_dataset)


@get_data.route("/get_related_images")
def get_related_images():
    '''

    :return:
    '''
    image = request.args.get('image', default="", type=str)
    label = active_dataset.labels[image][0]
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"], "height": file["height"],
                       "label": active_dataset.labels[file["src"]][0]} for file in datasets[0].file_list
                      if file["src"] in datasets[0].label_to_elements[label] and file['src'] != image][:5]
    return jsonify(out_image_list)


@get_data.route("/get_all_class_images")
def get_all_class_images():
    '''

    :return:
    '''
    img_class = request.args.get('class', default=0, type=int)
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"], "height": file["height"],
                       "label": active_dataset.labels[file["src"]][0]} for file in datasets[0].file_list
                      if file["src"] in datasets[0].label_to_elements[img_class]]
    return jsonify(out_image_list)


@get_data.route("get_tcav_concept_examples")
def get_tcav_concept_examples():
    '''

    :return:
    '''
    concept = request.args.get('concept', default="", type=str)
    out_image_list = [{"src": "/get_data/tcav_concepts/" + file["src"], "width": file["width"],
                       "height": file["height"]} for file in tcav_concept_examples[concept]]
    return jsonify(out_image_list)


def init_data():
    '''
    Loads all necessary data, in current prototype version only for one given model/dataset.
    :return: void
    '''
    global datasets
    global models
    global active_dataset
    global active_model
    global tcav_scores
    global top_preds_for_active_model_dataset
    global classifier_performance_for_active_model_dataset
    global tcav_concept_examples
    global lrp_session, lrp_model, lrp_explainer

    datasets = get_dataset_list("../../datasets/")

    # global_tensorflow_session = tf.Session()
    models = get_model_list("../../models/")

    print("Available datasets: {}".format(len(datasets)))
    for dataset in datasets:
        print(dataset.dataset_id, dataset.dataset_name, dataset.num_elements, dataset.dataset_path, dataset.label_path)

    active_dataset = datasets[0]

    print("Available models: {}".format(len(models)))
    for model in models:
        print(model.model_id, model.model_name, model.model_path, model.logdir)

    active_model = models[0]

    print("Predict images & evaluate Classifier")
    top_preds_for_active_model_dataset = create_top_5_predictions(active_dataset, active_model)
    classifier_performance_for_active_model_dataset = check_classifier_performance(active_dataset,
                                                                                   top_preds_for_active_model_dataset)

    tcav_scores = load_tcavs(active_model, active_dataset)
    tcav_concept_examples = get_tcav_concept_example_images("../../datasets/tcav_concepts/")
    print("Available TCAV concepts:")
    print(tcav_scores.keys())

    print("Initialize E-LRP explainer module")
    lrp_model, lrp_session, lrp_explainer = initialize_lrp_model()
    # create_lrp_explanation(active_dataset, active_dataset.file_list[:25], lrp_session, lrp_model,
    #                        top_preds_for_active_model_dataset)

    print("Creating Lime explanations")
    # create_lime_explanations(active_dataset, active_model, top_preds_for_active_model_dataset)
