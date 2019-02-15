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
                      "name": "planar"
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
                  {"name": "noisy"}
                ]
              }
          ]
        },
        {
          "name": "(color balance)",
          "children": [
            {"name": "colorful"},
            {"name": "single colors"},
            {"name": "muted"}
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
              {"name": "realistic"},
              {"name": "drawing"},
              {"name": "animation"}
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
                     {"name":"metal"},
                     {"name":"plastic"},
                     {"name":"concrete"}
                 ]}
               ]
              },
              {"name": "Creature"},
              {"name": "Abstract Shape"}
            ]
        }
      ]
    };

export default treeData;