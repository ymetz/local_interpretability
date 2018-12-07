# server.py
from flask import Flask, render_template
from data_routing import get_data, init_data

app = Flask(__name__, static_folder="../frontend/public", template_folder="../frontend/public/templates")
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.register_blueprint(get_data, url_prefix="/get_data")

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":

    init_data()

    app.run()
