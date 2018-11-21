# server.py
from flask import Flask, render_template
from dataservice import *
from PIL import Image

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/hello")
def hello():
    return "Hello World!"

if __name__ == "__main__":
    datasets = get_dataset_list("../../datasets/")
    models = get_model_list("../../models/")

    print("Available datasets: {}".format(len(datasets)))
    for dataset in datasets:
        print(dataset.dataset_id, dataset.dataset_name, dataset.num_elements, dataset.dataset_path, dataset.label_path)
        sel_img = dataset.file_list[6]
        img_path = os.path.join(dataset.dataset_path,sel_img)
        img = Image.open(img_path)
        img.show()
        print(dataset.labels[sel_img])

    print("Available models: {}".format(len(models)))
    for model in models:
        print(model.model_id, model.model_name, model.model_path, model.logdir)

    #app.run()
