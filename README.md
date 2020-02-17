# Local intepretability for global trust

Interactive Tool for local interpretability with TCAV, LIME, LRP & Co.

Contains server backend to load Tensorflow Models, Datasets and run background analysis.
React-Based Frontend to browse image datasets, and apply local interpretabilty methods.



## Project Code-Structure

```
.
├── LICENSE
├── README.md
├── datasets
├── models
├── project
  ├── frontend
  │   ├── public
  │   │   ├── css
  │   │   │   ├── App.css
  │   │   │   ├── ConceptTree.css
  │   │   │   ├── FilteringOptions.css
  │   │   │   ├── ImageComponent.css
  │   │   │   ├── InfoFooter.css
  │   │   │   ├── Navbar.css
  │   │   │   ├── Overlay.css
  │   │   │   ├── SettingsView.css
  │   │   │   ├── global_style.css
  │   │   │   └── materialize.min.css
  │   │   ├── dist
  │   │   │   ├── bundle.css
  │   │   │   └── bundle.js
  │   │   ├── images
  │   │   ├── local_data
  │   │   │   └── temp_tree_data.js
  │   │   └── templates
  │   │       └── index.html
  │   └── webpack.config.js
  └── server
    ├── app.py
    ├── data_handling
    │   ├── data_routing.py
    │   ├── dataservice.py
    │   └── dataset.py
    ├── explanations
    │   ├── lime_explainer.py
    │   ├── lrp_explainer.py
    │   └── tcav_explainer.py
    ├── models
    │   ├── classifier.py
    │   ├── model.py
    │   └── tensorflow_models.py
    ├── tcav
    │   ├── activation_generator.py
    │   ├── cav.py
    │   ├── custom_model.py
    │   ├── model.py
    │   ├── run_params.py
    │   ├── tcav.py
    │   └── utils.py
    ├── test_images
    └── utils
        └── image_crawler.py
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

