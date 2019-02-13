// App.jsx
import React, { Component } from "react";
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import {Button} from 'react-bootstrap';
import {config} from '../app_config'; 

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

      return(
          <div>
              <h3>Classifier Performance & TCAV</h3>
              <div id="treeWrapper" style={{width: '960px', height:'750px'}}>
                <Tree 
                  data={treeData} 
                  zoom={4} 
                  translate={{x: 50, y: 375}}
                  initialDepth={1} 
                  nodeSize={{x: 150, y: 50}}
                  transitionDuration={250}/>
              </div>
          </div>
      )
  }
}