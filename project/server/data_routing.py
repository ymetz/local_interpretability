from flask import Blueprint, jsonify, request, render_template, send_from_directory
from dataservice import *
from dataset import encode_dataset
from lime_explainer import create_explanation_images

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

@get_data.route("/get_image")
def get_image():
    iid = request.args.get('id', default=0, type=int)
    i_path = "dataset/" + active_dataset.file_list[iid]
    return i_path

@get_data.route("/get_image_list")
def get_image_list():
    out_image_list = [{"src": "/get_data/dataset/" + file["src"], "width": file["width"],
                              "height": file["height"]} for file in datasets[0].file_list]
    return jsonify(out_image_list)

@get_data.route("/get_labels")
def get_labels():
    return jsonify(active_dataset.labels)

@get_data.route("/get_top_classifications")
def get_top_classification():
    iname = request.args.get('id', default=0, type=str)
    class_result = active_model.classify_single_image(active_dataset.dataset_path, iname)
    return jsonify(class_result)


def init_data():
    global datasets
    global models
    global active_dataset
    global active_model

    datasets = get_dataset_list("../../datasets/")
    models = get_model_list("../../models/")

    print("Available datasets: {}".format(len(datasets)))
    for dataset in datasets:
        print(dataset.dataset_id, dataset.dataset_name, dataset.num_elements, dataset.dataset_path, dataset.label_path)

    active_dataset = datasets[0]

    print("Available models: {}".format(len(models)))
    for model in models:
        print(model.model_id, model.model_name, model.model_path, model.logdir)

<<<<<<< HEAD
    active_models = models[0]

    #print("Creating Lime explanations")
    #create_explanation_images(datasets[0],models[0])
=======
    # print("Creating Lime explanations")
    # create_explanation_images(datasets[0],models[0])
>>>>>>> 75ff8418839decef72672228e0fecdfb3f657a4b
