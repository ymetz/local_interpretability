const treeData = {
    "name": "root",
    "children": [
      {
        "name": "(visual property)",
        "children": [
          {
            "name": "(surface texture)",
            "children": [
              {
                "name": "even texture",
                "children": [
                  {"name": "smooth texture"},
                  {"name": "glossy"},
                  {"name": "matt"}
                ]
              },
              {
                "name": "uneven texture",
                "children": [
                  {"name": "uneven texture"},
                  {"name": "wrinkled"},
                  {"name": "spiky"}
                ]
              },
              {
                "name": "patterned",
                "children": [
                  {"name": "regular",
                   "children": [
                     {"name": "dotted"},
                     {"name": "striped"},
                     {"name": "zigzagged"}
                   ]},
                  {"name": "irregular",
                   "children": [
                     {"name": "irregular pattern"},
                     {"name": "chaos texture"}
                  ]},
                  {"name": "translucent",
                  "children": [
                    {"name": "transparent"},
                    {"name": "semi-translucent"}
                 ]},
                ]
              }
            ]
          },
          {
            "name": "(colors)",
            "children": [
              {"name": "colorful"},
              {"name": "single color"},
              {"name": "monochrome"}
            ]
          },
          {
            "name": "(shape)",
            "children": [
              {"name": "rectangular"},
              {"name": "round"},
              {"name": "triangular"},
              {"name": "complex shape"}

            ] 
          }
        ]
      },
      {"name": "(category)",
       "children": [
         {
           "name": "alive",
           "children": [
             {
               "name": "plant",
               "children": [
                  {"name": "tree"},
                  {"name": "flower"},
                  {"name": "grass-moss"}
               ]
             },
             {
               "name": "animal",
               "children": [
                 {"name": "land animal"},
                 {"name": "water animal"},
                 {"name": "bird"}
               ]
             },
             {
               "name": "human",
               "children": [
                 {"name": "man"},
                 {"name": "woman"},
                 {"name": "child"}
               ]
             }
           ]
         },
         {
           "name": "object",
           "children": [
             {"name": "machine-device"},
             {"name": "building"},
             {"name": "clothes"},
             {"name": "food"},
             {"name": "furniture"}
           ]
         },
         { "name" : "abstract"}
       ]},
      {
        "name": "(material)",
        "children": [
          {"name": "concrete"},
          {"name": "wood"},
          {"name": "metal material"},
          {"name": "plastic"},
          {"name": "fur"},
          {"name": "fabric"}
        ]
      },
      {
        "name": "(setting)",
        "children": [
          {"name": "inside"},
          {"name": "outside",
           "children": [
             {"name": "beach"},
             {"name": "nature"},
             {"name": "underwater"},
             {"name": "sky"}
           ]},

        ]
      }
    ]
}

export default treeData;