// App.jsx
import React, { Component } from "react";
import GlobalPerformanceChart from './GlobalPerformanceChart';
import tcavEvaluationChart from './TcavEvaluationChart';
import '../../public/css/GlobalView.css';
import TcavEvaluationView from "./TcavEvaluationView";

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

    return (
      <div styleName="global_content">
        <h3>Classifier Performance</h3>
        <p style={{ color: 'rgba(100,100,100,1.0)' }}>The chart shows the performance for groups of classes. According to the zoom level,
                  one bar representes a different number of classes. By clicking on bar, you can inspect the contained images.</p>
        <p><b>Global Classifier Performance </b>
          | <b>Top-1-Acurracy:</b> {top1_accuarcy * 100}%
                  | <b>Top-5-Acurracy:</b> {top5_accuarcy * 100}% </p>
        <GlobalPerformanceChart classifierPerformance={this.props.classifierPerformance.class_performances}
          overallAccuracies={{ top1: top1_accuarcy, top5: top5_accuarcy }}
          clickHandler={this.props.performanceChartClick}></GlobalPerformanceChart>
        <h3>TCAV Evaluation</h3>
        <p style={{ color: 'rgba(100,100,100,1.0)' }}>The following visualization is supposed to help the user to assess the #
        validity and robustness of TCAV as an interpretability method. The tree shows the concepts that are available for TCAV testing. By clicking
              on a leaf node, you can inspect some exemplary images for each concept.</p>
        <div id="tcavEvaluationChart">
          <TcavEvaluationView/> 
        </div>
      </div>

    )
  }
}