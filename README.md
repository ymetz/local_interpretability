# interVis
Bachelor-Project



## Project Code-Structure

```
.
├── LICENSE
├── README.md
├── datasets
├── models
├── project
│   ├── server
│   │   ├── __init__.py
│   │   ├── __pycache__
│   │   │   ├── dataservice.cpython-36.pyc
│   │   │   ├── dataset.cpython-36.pyc
│   │   │   └── model.cpython-36.pyc
│   │   ├── app.py
│   │   ├── dataservice.py
│   │   ├── dataset.py
│   │   ├── model.py
│   │   └── tensorflow_connector.py
│   └── static
│       ├── css
│       │   └── style.css
│       ├── dist
│       │   └── bundle.js
│       ├── images
│       ├── index.html
│       ├── js
│       │   ├── App.jsx
│       │   ├── d3-test.js
│       │   └── index.jsx
│       ├── package-lock.json
│       ├── package.json
│       ├── templates
│       └── webpack.config.js
└── requirements
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

