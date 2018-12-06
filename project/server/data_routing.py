from flask import Blueprint, jsonify, request, render_template, send_from_directory
from dataservice import *
from dataset import encode_dataset

datasets = []
models = []

get_data = Blueprint('get_data', __name__)

@get_data.route("/get_datasets")
def get_models():
    return jsonify([encode_dataset(ds) for ds in datasets])

# Custom static data
@get_data.route('/dataset/<path:filename>')
def custom_static(filename):
    return send_from_directory(datasets[0].dataset_path, filename)

@get_data.route("/get_image")
def get_image():
    iid = request.args.get('id', default=0, type=int)
    i_path = "dataset/" + datasets[0].file_list[iid]
    return i_path

@get_data.route("/get_image_list")
def get_image_list():
    return jsonify(datasets[0].file_list)

@get_data.route("/get_labels")
def get_labels():
    return jsonify(datasets[0].labels)


def init_data():
    global datasets
    global models

    datasets = get_dataset_list("../../datasets/")
    models = get_model_list("../../models/")

    print("Available datasets: {}".format(len(datasets)))
    for dataset in datasets:
        print(dataset.dataset_id, dataset.dataset_name, dataset.num_elements, dataset.dataset_path, dataset.label_path)
        #sel_img = dataset.file_list[6]
        #img_path = os.path.join(dataset.dataset_path,sel_img)
        #img = Image.open(img_path)
        #img.show()
        #print(dataset.labels[sel_img])

    print("Available models: {}".format(len(models)))
    for model in models:
        print(model.model_id, model.model_name, model.model_path, model.logdir)
