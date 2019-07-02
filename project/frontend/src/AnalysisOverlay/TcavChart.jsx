import React, { Component } from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';


/**
 * Contains code to create and render the scrolable bar chart containing tcav concept scores.
 * D3 code is not natively integrated in the native react udpate mechanisms, so meassures have
 * to be taken to stop unnecessary updates and re-renders.
 */
export default class TcavChart extends Component {

  tooltip = null;
  random_tooltip = null;

  componentDidMount() {
    //in case we dont provide concept data for this class, dont't render a diagram
    if (this.props.conceptData !== undefined) {
      const filtered_concept_data = (this.props.activeLayers === 'combined')
        ? this.combineLayerScores(this.props.conceptData)
        : this.props.conceptData.filter(x => x.bottleneck === this.props.activeLayers);
      this.draw(filtered_concept_data);
    }
  }

  componentDidUpdate(prevProps) {
    //this makes sure we don't redraw unnecessarily
    if ((this.props !== prevProps) && this.props.conceptData !== undefined) {
      const filtered_concept_data = (this.props.activeLayers === 'combined')
        ? this.combineLayerScores(this.props.conceptData)
        : this.props.conceptData.filter(x => x.bottleneck === this.props.activeLayers);
      d3.select('.viz > *').remove();
      this.draw(filtered_concept_data);
    }

  }

  componentWillUnmount() {

    if (this.tooltip)
      this.tooltip.destroy();
    if (this.random_tooltip)
      this.random_tooltip.destroy();
  }

  /**
   * Averages the concept scores over data from different network layers.
   * @param {Array} conceptData 
   */
  combineLayerScores(conceptData) {
    let outData = [];
    let uniqueConcepts = [...new Set(conceptData.map(x => x.concept))];
    uniqueConcepts.forEach(concept => {
      let singleConceptScores = conceptData.filter(x => x.concept === concept);
      outData.push({
        concept: concept, score: singleConceptScores.map(x => x.score)
          .reduce(function (a, b) { return a + b; }) / singleConceptScores.length
        , random_score: singleConceptScores[0].random_score, p_val: singleConceptScores
          .map(x => x.p_val).reduce((a, b) => { return a + b }) / singleConceptScores.length
        , estimated_p_val: singleConceptScores.map(x => x.estimated_p_val).some(epv => epv === true)

      });
    });
    return outData;
  }

  render() {
    return (
      <div className="viz" />
    )
  }

  /**
   * draw contains plain d3 code (in contranst to react specific code outside) and is called with the respective
   * data when mounted/updated. Draws the bar chart for the concept scores.
   */
  draw = (props) => {

    const data = props.sort(function (a, b) { return b.score - a.score });
    console.log(data);

    const width = 950, height = 280;
    const margin = { top: 10, right: 0, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right, innerHeight = height - margin.top - margin.bottom;
    const svg = d3.select('.viz').append('svg')
      .attr('height', height)
      .attr('width', width)
      .attr('id', 'svg-viz');

    this.tooltip = d3Tip()
      .attr('class', 'd3-tip')
      .html(function (d) { return "<b>Concept: </b>" + d.concept + "<br>" + "<b>Score: </b>" + d.score.toFixed(3)
                  + "<br>" + "<b>P-Value:</b>" + d.p_val.toFixed(3) ;});

    this.random_tooltip = d3Tip()
      .attr('class', 'd3-tip')
      .html(function (d) { return "<b>Random Score:</b>" + d.random_score.toFixed(3); });

    svg.append("g")
      .call(this.tooltip)
      .call(this.random_tooltip);

    const y = d3.scaleLinear()
      .domain([0.0, 1.0]).nice()
      .range([height - margin.bottom, margin.top]);

    const x = d3.scaleBand()
      .domain(data.map(x => x['concept']))
      .range([margin.left, (width - margin.right) * 4])
      .align(0)
      .padding(0.2);

    const yAxis = g => g
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())

    const xAxis = g => g
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(d3.axisBottom(x).tickSizeOuter(10))

    const extent = [[0, margin.top], [(width - margin.right) * 4, height - margin.top]];

    const zoom = d3.zoom()
      .scaleExtent([0.5, 1])
      .translateExtent(extent)
      //.extent(extent)
      .on("zoom", zoomed);

    svg.append("rect")
      .style("cursor", "ew-resize")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    svg.append("g")
      .attr("fill", "orange")
      .attr("clip-path", "url(#clip)")
      .style("clip-path", "url(#clip)")
      .selectAll("rect").data(data).enter().append("rect")
      .attr("class", "random-rect")
      .attr("x", d => (x(d.concept)) + 10)
      .attr("y", d => y(d.random_score))
      .attr("height", d => y(0) - y(d.random_score))
      .attr("width", x.bandwidth())
      .on('mouseover', this.random_tooltip.show)
      .on('mouseout', this.random_tooltip.hide);

    svg.append("g")
      .attr("fill", "steelblue")
      .attr("clip-path", "url(#clip)")
      .style("clip-path", "url(#clip)")
      .selectAll("rect").data(data).enter().append("rect")
      .attr("class", "concept-rect")
      .attr("x", d => x(d.concept))
      .attr("y", d => y(d.score))
      .attr("height", d => y(0) - y(d.score))
      .attr("width", x.bandwidth())
      .attr("opacity", x => (x.p_val < 0.05) ? 1.0 : 0.3)
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
      .attr("x", width - margin.right - 50)
      .attr("y", margin.top)
      .attr("height", height - margin.bottom)
      .attr("width", 50)
      .attr("fill", "rgba(255,255,255,0.5)");

    let defs = svg.append("defs")

    //Add the clip path for the main bar chart
    defs.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function zoomed() {
      x.range([margin.left, (width - margin.right) * 4].map(d => d3.event.transform.applyX(d)));
      svg.selectAll(".concept-rect").attr("x", d => x(d.concept)).attr("width", x.bandwidth());
      svg.selectAll(".random-rect").attr("x", d => x(d.concept) + 10).attr("width", x.bandwidth());
      svg.selectAll(".x-axis").call(xAxis);
    }

  }

}