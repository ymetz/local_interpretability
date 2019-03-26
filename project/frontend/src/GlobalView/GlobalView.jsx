// App.jsx
import React, { Component } from "react";
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import GlobalPerformanceChart from './GlobalPerformanceChart';
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
              <h3>Classifier Performance</h3>
                <p>Global Classifier Performance | Top-1-Acurracy: 90.4% | Top-5-Acurracy: 93.8%</p>
                <GlobalPerformanceChart classifierPerformance={this.props.classifierPerformance}></GlobalPerformanceChart>
              <h3>TCAV</h3>
              <div id="treeWrapper" style={{width: '1200px', height:'750px'}}>
                <Tree 
                  data={treeData} 
                  zoom={4} 
                  translate={{x: 50, y: 375}}
                  initialDepth={3} 
                  nodeSize={{x: 150, y: 50}}
                  transitionDuration={250}/>
              </div>
          </div>
      )
  }
}