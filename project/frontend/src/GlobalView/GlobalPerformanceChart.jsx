import React, { PureComponent } from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

/**
 * Component to draw the zoomable global performance bar chart displaying the classifier performance
 * for subgroups of classes distributed by the classification result quality.
 */
export default class GlobalPerformanceChart extends PureComponent {

  tooltip = null;

  componentDidMount() {
    //in case we dont provide concept data for this class, dont't render a diagram
    if (this.props.classifierPerformance !== undefined) {
      this.draw(this.props.classifierPerformance);
    }
  }

  componentDidUpdate(prevProps) {
    //this makes sure we don't redraw unnecessarily
    if ((this.props !== prevProps) && this.props.conceptData !== undefined) {
      d3.select('.viz > *').remove();
      this.draw(this.props.classifierPerformance);
    }

  }

  groupSortingFunction(a, b) {
    if ((a.top_predicted + a.top5_predicted) !== a.n || (b.top_predicted + b.top5_predicted) !== b.n)
      return (a.top_predicted + a.top5_predicted) / a.n - (b.top_predicted + b.top5_predicted) / b.n
    else
      return a.top_predicted / a.n - b.top_predicted / b.n
  }

  /**
   * Group the raw single class performance data into group of size n each. The classes are sorted by
   * the classifier performance. 
   * @param {Array} data 
   * @param {Number} n 
   */
  groupData(data, n) {
    let groupedData = [], groupedClasses = [];
    const sortedClasses = data.sort((a, b) => this.groupSortingFunction(a, b));
    for (let i = 0; i < sortedClasses.length; i += n) {
      groupedData.push(
        sortedClasses.slice(i, i + n).reduce(function (prev, curr) {
          return {
            top_predicted: (prev.top_predicted + curr.top_predicted),
            top5_predicted: (prev.top5_predicted + curr.top5_predicted),
            n: (prev.n + curr.n),
            class: (i / sortedClasses.length)
          }
        })
      );
      groupedClasses.push(sortedClasses.slice(i, i + n).map(d => d.class));
    }
    return { data: groupedData, classes: groupedClasses };
  }

  componentWillUnmount() {

    if (this.tooltip)
      this.tooltip.destroy();
  }

  render() {
    return (
      <div className="global-viz" />
    )
  }


  draw = (props) => {

    let _self = this;

    // For different zoom levels we change the granularity of the class grouping.
    // zoomIntervals is the index for the array corresponding to the number of classes per bar.
    const zoomIntervals = [20, 10, 5];
    let currentZoomStage = 0;

    /**
     * Returns a zoom stage for a particular zoom level of the bar chart.
     * @param {Number} k 
     */
    const getZoomStages = (k) => {
      if (k < 6)
        return 0;
      if (k >= 6 && k < 10)
        return 1;
      if (k >= 10)
        return 2;
    }

    const topLineColors = { top1: 'rgba(20, 94, 255, 0.5)', top5: 'rgba(152, 178, 230, 0.5)' };

    let combinedData = this.groupData(props, 20);
    let data = combinedData.data;

    const width = 1600, height = 600;
    const margin = { top: 10, right: 0, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right, innerHeight = height - margin.top - margin.bottom;
    const svg = d3.select('.global-viz').append('svg')
      .attr('height', height)
      .attr('width', width)
      .attr('id', 'svg-viz');

    this.tooltip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([100, 0])
      .html(function (d) {
        return "<div style='margin-left: 5px;'>"
          + "<b>top </b>" + (d.class * 100).toFixed(0) + "% of classes <br>"
          + "<b>#Classses: </b>" + zoomIntervals[currentZoomStage] + "<br>"
          + "<b>#Entries: </b>" + d.n + "<br>"
          + "<b>misclassified: </b>" + (d.n - d.top_predicted - d.top5_predicted)
          + "</div>";
      });

    svg.append("g")
      .call(this.tooltip);

    const y = d3.scaleLinear()
      .domain([0.0, 1.0]).nice()
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
      .call(d3.axisBottom(x).tickSizeOuter(10).tickFormat(d3.format(".00%")))

    const extent = [[0, margin.top], [(width - margin.right), height - margin.top]];

    const zoom = d3.zoom()
      .scaleExtent([1, 12])
      .translateExtent(extent)
      //.extent(extent)
      .on("zoom", zoomed);

    svg.call(zoom);

    const barGroup = svg.append("g");

    let drawBars = () => {
      barGroup.selectAll('*').remove();

      barGroup.append("g")
        .attr("fill", "rgb(0,255,0)")
        .attr("clip-path", "url(#clip)")
        .style("clip-path", "url(#clip)")
        .selectAll("rect").data(data).enter().append("rect")
        .attr("class", "rect")
        .attr("x", d => x(d.class))
        .attr("y", d => y(d.top_predicted / d.n))
        .attr("height", d => y(0) - y(d.top_predicted / d.n))
        .attr("width", x.bandwidth())
        .on('mouseover', this.tooltip.show)
        .on('mouseout', this.tooltip.hide);

      barGroup.append("g")
        .attr("fill", "rgb(209, 244, 66)")
        .attr("clip-path", "url(#clip)")
        .style("clip-path", "url(#clip)")
        .selectAll("rect").data(data).enter().append("rect")
        .attr("class", "rect")
        .attr("x", d => x(d.class))
        .attr("y", d => y((d.top5_predicted + d.top_predicted) / d.n))
        .attr("height", d => y(0) - y(d.top5_predicted / d.n))
        .attr("width", x.bandwidth())
        .on('mouseover', this.tooltip.show)
        .on('mouseout', this.tooltip.hide);

      barGroup.append("g")
        .attr("fill", "rgba(255, 0, 0, 0.5)")
        .attr("clip-path", "url(#clip)")
        .style("clip-path", "url(#clip)")
        .selectAll("rect").data(data).enter().append("rect")
        .attr("class", "rect")
        .attr("x", d => x(d.class))
        .attr("y", d => y(1))
        .attr("height", d => y(0) - y((d.n - d.top_predicted - d.top5_predicted) / d.n))
        .attr("width", x.bandwidth())
        .on('mouseover', this.tooltip.show)
        .on('mouseout', this.tooltip.hide);

      barGroup.selectAll("rect")
        .on("click", function (d, i) {
          _self.props.clickHandler(combinedData.classes[i % combinedData.classes.length]);
        })

      svg.append("g")
        .attr("clip-path", "url(#clip)")
        .style("clip-path", "url(#clip)")
        .append("g")
        .attr("class", "x-axis")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

      barGroup.append("g")
        .selectAll("line").data(Object.keys(this.props.overallAccuracies)).enter().append("line")
        .attr("x1", (margin.left - 70))
        .attr("y1", d => y(this.props.overallAccuracies[d]))
        .attr("x2", (width - margin.right))
        .attr("y2", d => y(this.props.overallAccuracies[d]))
        .attr("stroke", d => topLineColors[d]);

      barGroup.append("g")
        .selectAll("text").data(Object.keys(this.props.overallAccuracies)).enter().append("text")
        .attr("x", (margin.left - 75))
        .attr("y", d => y(this.props.overallAccuracies[d]) - 2.0)
        .text(d => (this.props.overallAccuracies[d] * 100).toFixed(2) + '%')
        .attr("stroke", d => topLineColors[d]);

      let defs = svg.append("defs");

      //Add the clip path for the main bar chart
      defs.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    drawBars();

    function zoomed() {
      let zS = getZoomStages(d3.event.transform.k);
      if (zS !== currentZoomStage) {
        currentZoomStage = zS;
        combinedData = _self.groupData(props, zoomIntervals[zS]);
        data = combinedData.data;
        x.domain(data.map(x => x['class']));
        drawBars();
      }
      x.range([margin.left, (width - margin.right)].map(d => d3.event.transform.applyX(d)));
      svg.selectAll(".rect").attr("x", d => x(d.class)).attr("width", x.bandwidth());
      svg.selectAll(".x-axis").call(xAxis);
    }

  }

}