// App.jsx
import React, { Component } from "react";
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import GlobalPerformanceChart from './GlobalPerformanceChart';
import '../../public/css/GlobalView.css';
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

      const overallPerformance = this.props.classifierPerformance.overall_performance;
      const top1_accuarcy = (overallPerformance.top_predicted / overallPerformance.n);
      const top5_accuarcy = ((overallPerformance.top_predicted + overallPerformance.top5_predicted) / overallPerformance.n);

      return(
          <div styleName="global_content">
              <h3>Classifier Performance</h3>
                <p><b>Global Classifier Performance</b>
                  | <b>Top-1-Acurracy:</b> {top1_accuarcy * 100}% 
                  | <b>Top-5-Acurracy:</b> {top5_accuarcy * 100}% </p>
                <div style={{marginTop: '50px'}}>
                <GlobalPerformanceChart classifierPerformance={this.props.classifierPerformance.class_performances}
                                        overallAccuracies = {{top1: top1_accuarcy, top5: top5_accuarcy}}></GlobalPerformanceChart>
                </div>
              <h3>TCAV</h3>
              <div id="treeWrapper" style={{width: '1200px', height:'750px'}}>
                <Tree 
                  data={treeData} 
                  zoom={4} 
                  translate={{x: 50, y: 375}}
                  initialDepth={4} 
                  nodeSize={{x: 150, y: 50}}
                  transitionDuration={250}/>
              </div>
          </div>
      )
  }
}