# server.py
from flask import Flask, render_template
from data_handling.data_routing import get_data, init_data


'''
    app.py
    Main entry point for the server. Start the application with python app.py
    Loads the index.html from the frontend/templates directory that leads as the entry point for the web application
    Loads the routing api from data_routing and initializes the data before starting the web server
'''

app = Flask(__name__, static_folder="../frontend/public", template_folder="../frontend/public/templates")
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.register_blueprint(get_data, url_prefix="/get_data")

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":

    init_data()

    app.run()
