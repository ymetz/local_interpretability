const treeData = {
    "name": "root",
    "children": [
        {
          "name": "textures",
          "children": [
            {
              "name": "smooth",
              "children": [
                  {
                      "name": "smooth texture"
                  },
                  {
                      "name": "gradient"
                  }
              ]
            },
            {
              "name": "pattern",
              "children": [
                  {"name": "dotted"},
                  {"name": "striped"},
                  {"name": "zigzagged"},
              ]
            },
            {
                "name": "irregular pattern",
                "children": [
                  {"name": "noise texture"},
                  {"name": "random pattern"},
                  {"name": "chaos texture"}
                ]
              }
          ]
        },
        {
          "name": "(color balance)",
          "children": [
            {"name": "colorful"},
            {"name": "single colors"},
            {"name": "monochrome"}
          ]
        },
        {
            "name": "(conturs)",
            "children": [
              {"name": "defined"},
              {"name": "washed out"}
            ]
        },
        {
            "name": "(image type)",
            "children": [
              {"name": "photo"},
              {"name": "drawing"}
            ]
        },
        {
            "name": "(category)",
            "children": [
              {"name": "Object",
               "children":[
                {"name": "(material)",
                 "children": [
                     {"name":"wood"},
                     {"name":"metal material"},
                     {"name":"plastic"},
                     {"name":"concrete"}
                 ]},
                 {"name": "(type)",
                 "children": [
                     {"name":"food"},
                     {"name":"furniture"},
                     {"name":"plastic"}
                 ]}
               ]
              },
              {"name": "Creature",
               "children": [
                  {"name":"human",
                  "children": [
                    {"name":"child"},
                    {"name":"woman"},
                    {"name":"man"}
                ]},
                  {"name": "animal",
                    "children": [
                      {"name":"land animal"},
                      {"name":"bird"},
                      {"name":"water animal"}
                  ]},
               ]},
              {"name": "abstract"}
            ]
        }
      ]
    };

export default treeData;