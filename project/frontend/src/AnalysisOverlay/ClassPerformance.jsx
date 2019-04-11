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
          <div>
            <div>Class Performance</div>
            <div className="performance_viz"/>
          </div>
        )
      }

    draw = (props) => {

        const data = props.classPerformance;
        const classLabel = props.currentLabel;
        const currentClassData = props.classPerformance.class_performances.find(d => d.class === classLabel);

        const pieData = [{name: 'top predicted', value: currentClassData.top_predicted}, 
                         {name: 'top5 predicted', value: currentClassData.top5_predicted}, 
                         {name: 'falsely predicted', value: currentClassData.n - currentClassData.top_predicted - currentClassData.top5_predicted}];

        const width = 450, height = 450;
        const margin = ({top: 10, right: 0, between: 20, bottom: 10, left: 10})
        const svg = d3.select('.performance_viz').append('svg')
        .attr('height', height)
        .attr('width', width);

        // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
        const radius = Math.min(width, height) / 4;
        const donutWidth = 50;
        const color = (name) => {
          switch(name) {
            case 'top predicted':  return 'rgb(0,255,0)';
            case 'top5 predicted': return 'rgb(209, 244, 66)';
            case 'falsely predicted': return 'rgba(255, 0, 0, 0.5)';
          }
        }

        // creates a new pie generator
        const pie = d3.pie()
            .value(function(d) { return d.value; })
            .sort(null);

        // contructs and arc generator. This will be used for the donut. The difference between outer and inner
        // radius will dictate the thickness of the donut
        const arc = d3.arc()
            .outerRadius(radius)
            .innerRadius(radius - donutWidth);

        const pieChartG = svg.append("g").attr("transform", "translate(" + (width/2) + "," + (radius + margin.top) + ")");

        let path = pieChartG.selectAll('path')
          .data(pie(pieData))
          .enter()
          .append("g")  
          .append('path')
          .attr('d', arc)
          .attr('fill', d => color(d.data.name))
          .style('opacity', 1.0)
          .style('stroke', 'white')
          /*.on("mouseover", function(d) {
              d3.selectAll('path')
                .style("opacity", otherOpacityOnHover);
              d3.select(this) 
                .style("opacity", opacityHover);*

              let g = d3.select("svg")
                .style("cursor", "pointer")
                .append("g")
                .attr("class", "tooltip")
                .style("opacity", 0);
        
              g.append("text")
                .attr("class", "name-text")
                .text(`${d.data.name} (${d.data.value})`)
                .attr('text-anchor', 'middle');
            
              let text = g.select("text");
              let bbox = text.node().getBBox();
              let padding = 2;
              g.insert("rect", "text")
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding)
                .attr("width", bbox.width + (padding*2))
                .attr("height", bbox.height + (padding*2))
                .style("fill", "white")
                .style("opacity", 0.75);
            })
          .on("mousemove", function(d) {
                let mousePosition = d3.mouse(this);
                let x = mousePosition[0] + width/2;
                let y = mousePosition[1] + height/2 - tooltipMargin;
            
                let text = d3.select('.tooltip text');
                let bbox = text.node().getBBox();
                if(x - bbox.width/2 < 0) {
                  x = bbox.width/2;
                }
                else if(width - x - bbox.width/2 < 0) {
                  x = width - bbox.width/2;
                }
            
                if(y - bbox.height/2 < 0) {
                  y = bbox.height + tooltipMargin * 2;
                }
                else if(height - y - bbox.height/2 < 0) {
                  y = height - bbox.height/2;
                }
            
                d3.select('.tooltip')
                  .style("opacity", 1)
                  .attr('transform',`translate(${x}, ${y})`);
            })
          .on("mouseout", function(d) {   
              d3.select("svg")
                .style("cursor", "none")  
                .select(".tooltip").remove();
            d3.selectAll('path')
                .style("opacity", opacity);
            })
          .on("touchstart", function(d) {
              d3.select("svg")
                .style("cursor", "none");    
          })
          .each(function(d, i) { this._current = i; });

        const legend = d3.select("#chart").append('div')
              .attr('class', 'legend')
              .style('margin-top', margin.top);

        let keys = legend.selectAll('.key')
              .data(pieData)
              .enter().append('div')
              .attr('class', 'key')
              .style('display', 'flex')
              .style('align-items', 'center')
              .style('margin-right', '20px');

            keys.append('div')
              .attr('class', 'symbol')
              .style('height', '10px')
              .style('width', '10px')
              .style('margin', '5px 5px')
              .style('background-color', (d, i) => color(i));

            keys.append('div')
              .attr('class', 'name')
              .text(d, i => `${i} (${d})`);

            keys.exit().remove();*/



    }

}