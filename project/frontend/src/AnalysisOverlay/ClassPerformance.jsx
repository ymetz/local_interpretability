import React, {Component} from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

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
        //let data = d3.stack().keys(["top5_predicted", "top_predicted"])(props.classPerformance);
        const classLabel = props.currentLabel;

        const width = 250, height = 450;
        const margin = ({top: 10, right: 0, bottom: 10, left: 10})
        const svg = d3.select('.performance_viz').append('svg')
        .attr('height', height)
        .attr('width', width)
        .attr('id', 'svg-viz');
        const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

        this.tooltip = d3Tip()
                    .attr('class', 'd3-tip')
                    .html(function(d) { return "Score:" + d.score; });

        // set x scale
        var x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05)
        .align(0.1);

        // set y scale
        var y = d3.scaleLinear()
        .rangeRound([height, 0]);

        // set the colors
        var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6"]);

        var keys = ['top5_predicted','top_predicted'];

        x.domain(data.map(function(d) { return d.class; }));
        y.domain([0, d3.max(data, function(d) { return d.n; })]).nice();
        z.domain(keys);

        g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data))
                .enter().append("g")
                .attr("fill", function(d) { return z(d.key); })
                .selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                    .attr("x", function(d) { return x(d.class); })
                    .attr("y", function(d) { return y(d[1]); })
                    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                    .attr("width", x.bandwidth());

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start");


    }

}