// App.jsx
import React, { Component } from "react";
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import GlobalPerformanceChart from './GlobalPerformanceChart';
import ConceptPreviewModal from '../AnalysisOverlay/ConceptPreviewModal';
import '../../public/css/GlobalView.css';
import axios from 'axios';
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
        conceptHierarchy: {},
        show_concept_preview_modal: false,
        concept_preview_modal_data: null
    }
  }

  componentDidMount() {

  }

  onConceptTreeNodeClick(node, event) {
    //Set the concept preview data, wait for callback to only render when data is available
    axios.get('/get_data/get_tcav_concept_examples?'
    +'concept='+ node.name)
    .then(res => {
        const examplImgs = res.data;
        this.setState({concept_preview_modal_data: {node: node, event: event, example_images: examplImgs}, 
                       show_concept_preview_modal: true});
    })
  }

  closeModal() {
      this.setState({show_concept_preview_modal: false, concept_preview_modal_data: null});
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
                                        overallAccuracies = {{top1: top1_accuarcy, top5: top5_accuarcy}}
                                        clickHandler={this.props.performanceChartClick}></GlobalPerformanceChart>
                </div>
              <h3>TCAV</h3>
              <div id="treeWrapper" style={{width: '1600px', height:'750px'}}>
                <Tree 
                  data={treeData}
                  zoom={4} 
                  translate={{x: 50, y: 375}}
                  initialDepth={4} 
                  nodeSize={{x: 200, y: 40}}
                  transitionDuration={250}
                  onClick={this.onConceptTreeNodeClick.bind(this)}/>
              </div>
              {this.state.show_concept_preview_modal ? <ConceptPreviewModal previewData={this.state.concept_preview_modal_data}
                                                                              closeModal={this.closeModal.bind(this)}>
                                                        </ConceptPreviewModal> : null}
          </div>
          
      )
  }
}