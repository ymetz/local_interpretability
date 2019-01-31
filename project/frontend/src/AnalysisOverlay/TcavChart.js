import React, {Component} from 'react';
import * as d3 from 'd3';

export default class TcavChart extends Component {

    componentDidMount() {
        this.draw(this.props)
    }
    componentDidUpdate(prevProps){
      //this makes sure we don't redraw unnecessarily --
      //only when we add a new shape
      if(this.props.conceptData !== prevProps.conceptData){
        d3.select('.viz > *').remove();
        this.draw(this.props)
      }
  
    }
  
  
    render() {
      return (
        <div className="viz" />
      )
    }

    draw = (props) => {
        console.log("drawing");
        //const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        //const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const width = 1550, height = 300;
        const margin = ({top: 20, right: 0, bottom: 30, left: 40})
        const svg = d3.select('.viz').append('svg')
        .attr('height', height)
        .attr('width', width)
        .attr('id', 'svg-viz');
    
       const  yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove());

        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
            .tickSizeOuter(0));

        const y = d3.scaleLinear()
            .domain([0, d3.max([3,4,8,12,15])]).nice()
            .range([height - margin.bottom, margin.top]);

        const x = d3.scaleBand()
            .domain(['concept_A','concept_B','concept_C'])
            .range([margin.left, width - margin.right])
            .padding(0.1);

        svg.append("g")
            .attr("fill", "steelblue")
          .selectAll("rect").data(props.conceptData).enter().append("rect")
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth());
        
        svg.append("g")
            .call(xAxis);
        
        svg.append("g")
            .call(yAxis);

      }
}