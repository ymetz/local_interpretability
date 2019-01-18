from flask import Blueprint, jsonify, request, render_template, send_from_directory
from dataservice import *
from dataset import encode_dataset
import tensorflow as tf
from classifier import create_top_5_predictions
from lime_explainer import create_explanation_images
from lrp_explainer import create_lrp_explanation

datasets = []
models = []
active_dataset = None
active_model = None

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

@get_data.route("/get_explanation_image")
def get_explanation_image():
    iid = request.args.get('id', default="", type=str)
    method = request.args.get('method', default=0, type=str)
    imgClass = request.args.get('class', default=0, type=int)
    if method == 'elrp':
        # Create the LRP explanation image on the fly
        create_lrp_explanation(datasets[0], iid, imgClass)
    i_path = "get_data/dataset_explanation/" + method + '_' + str(imgClass) + '_' + iid
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


def init_data():
    global datasets
    global models
    global active_dataset
    global active_model

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

    active_models = models[0]

    create_top_5_predictions(datasets[0], models[0])

    print("Creating Lime explanations")
    #create_explanation_images(datasets[0], models[0])
