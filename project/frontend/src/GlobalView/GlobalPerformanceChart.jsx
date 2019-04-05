import React, {PureComponent} from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default class GlobalPerformanceChart extends PureComponent {

    tooltip = null;

    componentDidMount() {
        //in case we dont provide concept data for this class, dont't render a diagram
        if (this.props.classifierPerformance !== undefined){
          const groupedData = this
          this.draw(this.props.classifierPerformance);
        }
    }

    componentDidUpdate(prevProps){
      //this makes sure we don't redraw unnecessarily
      if((this.props !== prevProps) && this.props.conceptData !== undefined){
        d3.select('.viz > *').remove();
        this.draw(this.props.classifierPerformance);
      }
  
    }

    groupData(data, n) {
        let groupedData = []
        const sortedClasses = data.sort(function(a,b){ return ((a.top_predicted + a.top5_predicted)/a.n-(b.top_predicted + b.top5_predicted)/b.n)});
        for (let i = 0; i < sortedClasses.length; i += n){
            groupedData.push(
              sortedClasses.slice(i, i+n).reduce( function(prev, curr){ return {top_predicted: (prev.top_predicted + curr.top_predicted), 
                                                                    top5_predicted: (prev.top5_predicted + curr.top5_predicted),
                                                                    n: (prev.n + curr.n),
                                                                    class: i}})
            );
        }
        return groupedData;
    }

    componentWillUnmount() {
    
        if (this.tooltip)
            this.tooltip.destroy();
    }
  
    render() {
      return (
        <div className="global-viz"/>
      )
    }

    draw = (props) => {
        let _self = this;

        let data = this.groupData(props, 20);

        //const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        //const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const width = 1600, height = 600;
        const margin = {top: 10, right: 0, bottom: 40, left: 80};
        const innerWidth = width - margin.left - margin.right, innerHeight = height - margin.top - margin.bottom;
        const svg = d3.select('.global-viz').append('svg')
        .attr('height', height)
        .attr('width', width)
        .attr('id', 'svg-viz');

        this.tooltip = d3Tip()
                    .attr('class', 'd3-tip')
                    .html(function(d) { console.log("bla"); return "<b>Concept: </b>" + d.class + "<br>" + "<b>#Entries: </b>" + d.n; });

        svg.append("g")
            .call(this.tooltip);

        const y = d3.scaleLinear()
            .domain([0.0,1.0]).nice()
            .range([height - margin.bottom, margin.top]);

        const x = d3.scaleBand()
            .domain(data.map(x => x['class']))
            .range([margin.left, (width - margin.right)])
            .align(0)
            .padding(0.2);

        const yAxis = g => g
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())

        const xAxis = g => g
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(x).tickSizeOuter(10))

        const extent = [[0, margin.top], [(width - margin.right), height - margin.top]];

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            //.extent(extent)
            .on("zoom", zoomed);

        let drawBars = () => {
          svg.selectAll('*').remove();

          svg.append("g")
              .attr("fill", "rgb(0,255,0)")
              .attr("clip-path", "url(#clip)")
              .style("clip-path", "url(#clip)")
            .selectAll("rect").data(data).enter().append("rect")
              .attr("class","rect")
              .attr("x", d => x(d.class))
              .attr("y", d => y(d.top_predicted / d.n))
              .attr("height", d => y(0) - y(d.top_predicted / d.n))
              .attr("width", x.bandwidth())
              .on('mouseover', this.tooltip.show)
              .on('mouseout', this.tooltip.hide);

          svg.append("g")
              .attr("fill", "rgb(209, 244, 66)")
              .attr("clip-path", "url(#clip)")
              .style("clip-path", "url(#clip)")
            .selectAll("rect").data(data).enter().append("rect")
              .attr("class","rect")
              .attr("x", d => x(d.class))
              .attr("y", d => y((d.top5_predicted + d.top_predicted) / d.n))
              .attr("height", d => y(0) - y(d.top5_predicted / d.n))
              .attr("width", x.bandwidth())
              .on('mouseover', this.tooltip.show)
              .on('mouseout', this.tooltip.hide);

          svg.append("g")
              .attr("fill", "rgba(255, 0, 0, 0.5)")
              .attr("clip-path", "url(#clip)")
              .style("clip-path", "url(#clip)")
            .selectAll("rect").data(data).enter().append("rect")
              .attr("class","rect")
              .attr("x", d => x(d.class))
              .attr("y", d => y(1))
              .attr("height", d => y(0) - y((d.n - d.top_predicted - d.top5_predicted) / d.n))
              .attr("width", x.bandwidth())
              .on('mouseover', this.tooltip.show)
              .on('mouseout', this.tooltip.hide);
          
          svg.append("g")
            .attr("clip-path", "url(#clip)")
            .style("clip-path", "url(#clip)")
            .append("g")
              .attr("class", "x-axis")
              .call(xAxis);
        
          svg.append("g")
              .attr("class", "y-axis")
              .call(yAxis);

          svg.append("rect")
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr("width", width)
          .attr("height", height)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(zoom);

        let defs = svg.append("defs")
        
        //Add the clip path for the main bar chart
        defs.append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", innerWidth)
          .attr("height", height)
          .attr("transform", "translate("+ margin.left + "," + margin.top + ")");
        }

        drawBars();

        function zoomed() {
          if (d3.event.transform.k > 4.0){
            data = _self.groupData(props, 10);
            x.domain(data.map(x => x['class']));
            drawBars();
          }
          x.range([margin.left, (width - margin.right)].map(d => d3.event.transform.applyX(d)));
          svg.selectAll(".rect").attr("x", d => x(d.class)).attr("width", x.bandwidth());
          svg.selectAll(".x-axis").call(xAxis);
        }

      }

}