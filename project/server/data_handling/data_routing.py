from flask import Blueprint, jsonify, request, send_from_directory
from data_handling.dataservice import *
from data_handling.dataset import encode_dataset
import tensorflow as tf
from model_handling.classifier import create_top_5_predictions
from explanations.tcav_explainer import load_tcavs
from explanations.lrp_explainer import create_lrp_explanation

datasets = []
models = []
active_dataset = None
active_model = None
tcav_scores = None

get_data = Blueprint('get_data', __name__)

@get_data.route("/get_datasets")
def get_models():
    return jsonify([encode_dataset(ds) for ds in datasets])

# Custom static data
@get_data.route('/dataset/<path:filename>')
def custom_static(filename):
    return send_from_directory(active_dataset.dataset_path, filename)

@get_data.route('/dataset_explanation/<path:filename>')
def custom_explanation_static(filename):
    print(os.path.join(active_dataset.dataset_path, 'current_explanations'))
    return send_from_directory(os.path.join(active_dataset.dataset_path, 'current_explanations'), filename)

@get_data.route("/get_image")
def get_image():
    iid = request.args.get('id', default=0, type=int)
    i_path = "get_data/dataset/" + active_dataset.file_list[iid]
    return i_path

@get_data.route("/get_tcav_scores")
def tcav_scores_for_class():
    return jsonify(tcav_scores)

@get_data.route("/get_explanation_image")
def get_explanation_image():
    iid = request.args.get('id', default="", type=str)
    method = request.args.get('method', default=0, type=str)
    img_class = request.args.get('class', default=0, type=int)
    # if method == 'elrp':
        # Create the LRP explanation image on the fly
    #     create_lrp_explanation(datasets[0], iid, img_class)
    i_path = "get_data/dataset_explanation/" + method + '_' + str(img_class) + '_' + iid
    return i_path

@get_data.route("/get_image_list")
def get_image_list():
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"],
                              "height": file["height"]} for file in datasets[0].file_list]
    return jsonify(out_image_list)

@get_data.route("/get_labels")
def get_labels():
    return jsonify(active_dataset.labels)

@get_data.route("/get_id_to_label")
def get_id_to_label():
    return jsonify(active_dataset.id_to_label)

@get_data.route("/get_single_classification")
def get_single_classifications():
    iname = request.args.get('id', default=0, type=str)
    class_result = active_model.classify_single_image(active_dataset.dataset_path, iname)
    return jsonify(class_result)

@get_data.route("/get_top_classifications")
def get_top_classifications():
    return jsonify(active_dataset.top_predictions)

@get_data.route("/get_related_images")
def get_related_images():
    image = request.args.get('image', default="", type=str)
    label = active_dataset.labels[image][0]
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"],
                              "height": file["height"]} for file in datasets[0].file_list
                      if file["src"] in datasets[0].label_to_elements[label] and file['src'] != image][:5]
    return jsonify(out_image_list)

@get_data.route("/get_all_class_images")
def get_all_class_images():
    img_class = request.args.get('class', default=0, type=int)
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"],
                              "height": file["height"]} for file in datasets[0].file_list
                      if file["src"] in datasets[0].label_to_elements[img_class]]
    return jsonify(out_image_list)


def init_data():
    global datasets
    global models
    global active_dataset
    global active_model
    global tcav_scores

    datasets = get_dataset_list("../../datasets/")

    global_tensorflow_session = tf.Session()
    models = get_model_list("../../models/")

    print("Available datasets: {}".format(len(datasets)))
    for dataset in datasets:
        print(dataset.dataset_id, dataset.dataset_name, dataset.num_elements, dataset.dataset_path, dataset.label_path)

    active_dataset = datasets[0]

    print("Available models: {}".format(len(models)))
    for model in models:
        print(model.model_id, model.model_name, model.model_path, model.logdir)

    active_model = models[0]

    create_top_5_predictions(active_dataset, active_model)

    tcav_scores = load_tcavs(active_model, active_dataset)
    print(tcav_scores)

    print("Creating Lime explanations")
    #create_explanation_images(datasets[0], models[0])
