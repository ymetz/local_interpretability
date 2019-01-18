# local intepretability for global trust
Bachelor-Project



## Project Code-Structure

```
.
├── LICENSE
├── README.md
├── datasets
├── models
├── project
│   ├── frontend
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── public
│   │   │   ├── css
│   │   │   │   ├── App.css
│   │   │   │   ├── FilteringOptions.css
│   │   │   │   ├── InfoFooter.css
│   │   │   │   ├── Navbar.css
│   │   │   │   ├── Overlay.css
│   │   │   │   ├── materialize.min.css
│   │   │   │   └── style.css
│   │   │   ├── dist
│   │   │   │   ├── bundle.css
│   │   │   │   └── bundle.js
│   │   │   ├── images
│   │   │   └── templates
│   │   │       └── index.html
│   │   └── webpack.config.js
│   └── server
│       ├── __init__.py
│       ├── __pycache__
│       ├── app.py
│       ├── classifier.py
│       ├── data_routing.py
│       ├── dataservice.py
│       ├── dataset.py
│       ├── image_crawler.py
│       ├── lime_explainer.py
│       ├── lrp_explainer.py
│       ├── model.py
│       ├── tcav
│       │   ├── README.md
│       │   ├── __init__.py
│       │   ├── __pycache__
│       │   ├── activation_generator.py
│       │   ├── cav.py
│       │   ├── custom_model.py
│       │   ├── model.py
│       │   ├── run_params.py
│       │   ├── tcav.py
│       │   ├── utils.py
│       ├── tcav_explainer.py
│       ├── tensorflow_models.py
│       └── test_images
└── requirements.txt
```

'server' contains all server-side python code, based on Flask.
'static' contains all client-side code for the web interface. Used frameworks: React, d3.



## Setup

Prerequisite: Python 3.6 or higher (e.g. as virtualenv), Node.js + npm (Node Package Manager)

1. clone the respository
2. run `pip install -r requirements`
3. switch into the project directory `cd project/static`
4. run `npm run build` to build the project and create a single Javascript fie
5. run `python ../server/app.py to run the webserver
6. access the tool in your browser at `localhost:5000`

