import React, {Component} from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

/**
 * Two charts visualizing the classifier performance for the current class as well as a comparison of the
 * performance with other classes in the  dataset.
 * PieChart visualzation heavily influenced by: https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2
 */
export default class ClassPerformance extends Component {

    tooltips = null;

    componentDidMount() {
        //in case we dont provide concept data for this class, dont't render a diagram
        if (this.props !== undefined)
          this.draw(this.props)
    }

    componentDidUpdate(prevProps){
      //this makes sure we don't redraw unnecessarily
      if(this.props !== prevProps){
        d3.select('.performance_viz > *').remove();
        this.draw(this.props);
      }
  
    }

    componentWillUnmount() {
    
        if (this.tooltips)
            this.tooltips.destroy();
    }

    render() {
        return (
          <div className="performance_viz"/>
        )
      }

    draw = (props) => {

        const data = props.classPerformance;
        const classLabel = props.currentLabel;
        const currentClassData = props.classPerformance.class_performances.find(d => d.class === classLabel);

        const pieData = [currentClassData.top_predicted, currentClassData.top5_predicted, 
                         currentClassData.n - currentClassData.top_predicted - currentClassData.top5_predicted];

        const width = 450, height = 450;
        const margin = ({top: 10, right: 0, between: 20, bottom: 10, left: 10})
        const svg = d3.select('.performance_viz').append('svg')
        .attr('height', height)
        .attr('width', width);

        // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
        var radius = Math.min(width, height) / 2;

        // creates a new pie generator
        var pie = d3.pie()
            .value(function(d) { return floatFormat(d[variable]); })
            .sort(null);

        // contructs and arc generator. This will be used for the donut. The difference between outer and inner
        // radius will dictate the thickness of the donut
        var arc = d3.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.6);

        const pieChartG = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    }

}