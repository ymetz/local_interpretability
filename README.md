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
│   │   ├── package.json
│   │   ├── public
│   │   │   ├── css
│   │   │   ├── dist
│   │   │   │   └── bundle.js
│   │   │   ├── images
│   │   │   └── templates
│   │   │       └── index.html
│   │   ├── src
│   │   │   ├── AnalysisOverlay
│   │   │   │   └── OverlayComponent.jsx
│   │   │   ├── App.jsx
│   │   │   ├── ImageGallery
│   │   │   │   ├── ImageComponent.jsx
│   │   │   │   └── ImageGallery.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── app_config.js
│   │   │   └── index.jsx
│   │   └── webpack.config.js
│   └── server
│       ├── app.py
│       ├── data_routing.py
│       ├── dataservice.py
│       ├── dataset.py
│       ├── model.py
│       └── tensorflow_connector.py
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

