# server.py
from flask import Flask, render_template
from data_routing import get_data, init_data
from PIL import Image

app = Flask(__name__, static_folder="../frontend/public", template_folder="../frontend/templates")

app.register_blueprint(get_data, url_prefix="/get_data")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/hello")
def hello():
    return "Hello World!"

if __name__ == "__main__":

    init_data()

    app.run()
