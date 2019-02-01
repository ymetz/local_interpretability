// App.jsx
import React, { Component } from "react";
import Tree from 'react-d3-tree';
import {Button} from 'react-bootstrap';
import {config} from './app_config'; 

/**
 * View showing global statistics.
 * 
 */
export default class GlobalView extends Component {
  constructor(props) {
    super(props);

    this.state = {
        data: {},
        conceptHierarchy: {}
    }
  }

  componentDidMount() {

  }

  render() {
    let treeData = {
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
                    "name": "irregular",
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
                {"name": "flat colors"},
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

      return(
          <div>
              <h3>Classifier Performance & TCAV</h3>
              <div id="treeWrapper" style={{width: '960px', height:'750px'}}>
                <Tree data={treeData} />
              </div>
          </div>
      )
  }
}