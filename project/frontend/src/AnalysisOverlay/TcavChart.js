import React, {Component} from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default class TcavChart extends Component {

    tooltips = null;
    random_tooltip = null;

    componentDidMount() {
        //in case we dont provide concept data for this class, dont't render a diagram
        if (this.props.conceptData !== undefined)
          this.draw(this.props)
    }

    componentDidUpdate(prevProps){
      //this makes sure we don't redraw unnecessarily
      if((this.props.conceptData !== prevProps.conceptData) && this.props.conceptData !== undefined){
        d3.select('.viz > *').remove();
        this.draw(this.props);
      }
  
    }

    componentWillUnmount() {
    
        if (this.tooltips)
            this.tooltips.destroy();
        if (this.random_tooltip)
            this.random_tooltip.destroy(); 
    }
  
    render() {
      return (
        <div className="viz"/>
      )
    }

    draw = (props) => {

      let data = props.conceptData.sort(function(a,b){return b.score - a.score});

        //const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        //const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const width = 950, height = 280;
        const margin = ({top: 10, right: 0, bottom: 25, left: 80})
        const svg = d3.select('.viz').append('svg')
        .attr('height', height)
        .attr('width', width)
        .attr('id', 'svg-viz');

        this.tooltip = d3Tip()
                    .attr('class', 'd3-tip')
                    .html(function(d) { return "Score:" + d.score; });

        this.random_tooltip = d3Tip()
            .attr('class', 'd3-tip')
            .html(function(d) { return "Random Score:" + d.random_score; });

        svg.append("g")
            .call(this.tooltip)
            .call(this.random_tooltip);
    
       const  yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove());

        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
            .tickSizeOuter(0));

        const y = d3.scaleLinear()
            .domain([0.0, 1.0]).nice()
            .range([height - margin.bottom, margin.top]);

        const x = d3.scaleBand()
            .domain(data.map(x => x['concept']))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        svg.append("g")
            .attr("fill", "orange")
          .selectAll("rect").data(data).enter().append("rect")
            .attr("x", d => (x(d.concept)+10))
            .attr("y", d => y(d.random_score))
            .attr("height", d => y(0) - y(d.random_score))
            .attr("width", x.bandwidth())
            .on('mouseover', this.random_tooltip.show)
            .on('mouseout', this.random_tooltip.hide);

        svg.append("g")
            .attr("fill", "steelblue")
          .selectAll("rect").data(data).enter().append("rect")
            .attr("x", d => x(d.concept))
            .attr("y", d => y(d.score))
            .attr("height", d => y(0) - y(d.score))
            .attr("width", x.bandwidth())
             .on('mouseover', this.tooltip.show)
             .on('mouseout', this.tooltip.hide);
        
        svg.append("g")
            .call(xAxis);
        
        svg.append("g")
            .call(yAxis);

      }
}