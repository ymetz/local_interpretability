import React, { Component } from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

const pick = (...props) => o => props.reduce((a, e) => ({ ...a, [e]: o[e] }), {});

/**
 * Contains code to create and render the scrolable bar chart containing tcav concept scores.
 * D3 code is not natively integrated in the native react udpate mechanisms, so meassures have
 * to be taken to stop unnecessary updates and re-renders.
 */
export default class TcavEvaluationChart extends Component {

    tooltip = null;

    componentDidMount() {
        //in case we dont provide concept data for this class, dont't render a diagram
        if (this.props.experimentData !== undefined) {
            this.draw(this.props.experimentData, this.props.selectedClasses, this.props.toggleAnalysisOverlay);
        }
    }

    componentDidUpdate(prevProps) {
        //this makes sure we don't redraw unnecessarily
        if (this.props.experimentData !== prevProps.experimentData ||
            this.props.selectedClasses !== prevProps.selectedClasses
            && this.props.experimentData !== undefined) {
            this.draw(this.props.experimentData, this.props.selectedClasses, this.props.toggleAnalysisOverlay);
        }

    }

    componentWillUnmount() {

        if (this.tooltip)
            this.tooltip.destroy();
    }

    render() {
        return (
            <div className="tcav_eva_viz" />
        )
    }

    /**
     * draw contains plain d3 code (in contranst to react specific code outside) and is called with the respective
     * data when mounted/updated. Draws the bar chart for the concept scores.
     */
    draw = (props, selectedClasses, clickFunction) => {
        d3.select('.tcav_eva_viz').selectAll("*").remove();
        let data = undefined;
        let total_dists = undefined;
        let class_list = [];
        let bottleneck_list = [];
        let rd_exp_iter_list = [];
        let colorScale = undefined;
        if (props.exp_info.name === 'wordnet correlation scores') {
            data = [];
            for (let key in props.exp_result) {
                data.push({ concept: key, corrScore: props.exp_result[key] });
            }
            data.sort((a, b) => a.corrScore - b.corrScore).reverse();
        } else {
            data = props.exp_result;
            total_dists = props.exp_result.total_dist;
            let ordered_data = {};
            Object.keys(data).sort((a, b) => total_dists[a] - total_dists[b]).forEach(function (key) {
                ordered_data[key] = data[key];
            })
            data = ordered_data;
            delete data.total_dist;
            // get all classes in one result object for a concept
            if (selectedClasses.length > 0) {
                const result_class_list = Object.keys(data[Object.keys(data)[0]]).map(key => Number(key));
                class_list = selectedClasses.filter(value => result_class_list.includes(value));
            } else {
                class_list = Object.keys(data[Object.keys(data)[0]]).map(key => Number(key));
            }
            if (class_list.length > 0){
                // get all unqiue bottlenecks we find in one result object (based on existing class_id)
                bottleneck_list = [...new Set(data[Object.keys(data)[0]][class_list[0]].map(score => score.bottleneck))];
                // get list of different iteration runs
                if (props.exp_info.name === 'random experiment iterations')
                    rd_exp_iter_list = [...new Set(data[Object.keys(data)[0]][class_list[0]].map(score => score.nr_iter))];
            } else {
                bottleneck_list = [];
            }
            colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        }
        console.log(class_list, total_dists, data)

        const width = 950, height = 600;
        const margin = { top: 10, right: 0, bottom: 40, left: 80 };
        const innerWidth = width - margin.left - margin.right, innerHeight = height - margin.top - margin.bottom;
        const svg = d3.select('.tcav_eva_viz').append('svg')
            .attr('height', height)
            .attr('width', width)
            .attr('id', 'svg-eva-viz');

        if (props.exp_info.name === 'wordnet correlation scores') {
            this.tooltip = d3Tip()
                .attr('class', 'd3-tip')
                .html(function (d) { return "<b>Concept: </b>" + d.concept + "<br>" + "<b>Corr.Coeff.: </b>" + d.corrScore; });
        } else if (props.exp_info.name === 'random experiment iterations') {
            this.tooltip = d3Tip()
                .attr('class', 'd3-tip')
                .html(function (d) { return "<b>Concept: </b>" + d.concept + "<br>" + "<b>Score: </b>" + d.score.toFixed(3) + "<br>" + "<b>Class: </b>" + d.class + "<br>" + "<b>#Iter: </b>" + d.nr_iter; });      
        } else {
            this.tooltip = d3Tip()
                .attr('class', 'd3-tip')
                .html(function (d) { return "<b>Concept: </b>" + d.concept + "<br>" + "<b>Score: </b>" + d.score.toFixed(3) + "<br>" + "<b>Class: </b>" + d.class; });
        }

        svg.append("g")
            .call(this.tooltip);

        const y = d3.scaleLinear()
            .domain([0.0, 1.0]).nice()
            .range([height - margin.bottom, margin.top]);

        let stretch_factor = 1;

        let x = d3.scaleBand()
            .align(0)
        if (props.exp_info.name === 'wordnet correlation scores') {
            stretch_factor = 4;
            x.range([margin.left, (width - margin.right) * stretch_factor]);
            x.padding(0.3);
            x.domain(data.map(x => x.concept));
        } else if (props.exp_info.name === 'layer scores') {
            stretch_factor = 8;
            x.range([margin.left, (width - margin.right) * stretch_factor]);
            x.paddingInner(0);
            x.paddingOuter(0.3);
            x.domain(Object.keys(data));
        } else {
            stretch_factor = 2;
            x.range([margin.left, (width - margin.right) * stretch_factor]);
            x.paddingInner(0);
            x.paddingOuter(0.3);
            x.domain(Object.keys(data));
        }

        const yAxis = g => g
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())

        const xAxis = g => g
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(x).tickSizeOuter(10))

        const extent = [[0, margin.top], [(width - margin.right) * stretch_factor, height - margin.top]];

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


        /*svg.append("g")
        .attr("fill", "steelblue")
        .attr("clip-path", "url(#clip)")
        .style("clip-path", "url(#clip)")
        .selectAll(".class-g").data(data).enter().append("g")
        .attr("className", "class-g")
        .selectAll("circle").data(d => d).enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => (x(d.concept)) + 10)
        .attr("cy", d => y(d.score))
        .attr("r", "2.0")
        .on('mouseover', this.tooltip.show)
        .on('mouseout', this.tooltip.hide);*/

        // divide each concept width by available classes, ad two for padding left and right
        const class_width = x.bandwidth() / (class_list.length + 2);

        let data_g = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .style("clip-path", "url(#clip)")
            .selectAll(".concept-g").data(Object.values(data)).enter().append("g")
            .attr("class", "concept-g")
            .selectAll(".class_g").data(d => Object.values(pick(...class_list)(d))).enter().append("g");

        if (props.exp_info.name === 'wordnet correlation scores') {
            svg.append("g")
                .attr("fill", d => 'steelblue')
                .attr("clip-path", "url(#clip)")
                .style("clip-path", "url(#clip)")
                .selectAll("rect").data(data).enter().append("rect")
                .attr("class", "concept-rect")
                .attr("x", d => x(d.concept))
                .attr("y", d => y(d.corrScore))
                .attr("height", d => y(0) - y(d.corrScore))
                .attr("width", x.bandwidth())
                .on('mouseover', this.tooltip.show)
                .on('mouseout', this.tooltip.hide);
        } else if (props.exp_info.name === 'layer scores') {

            data_g.selectAll(".concept-circle").data(d => d.sort((a, b) => bottleneck_list.indexOf(a.bottleneck) - bottleneck_list.indexOf(b.bottleneck))).enter().append("circle")
                .attr("class", "concept-circle")
                .attr("cx", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1))
                .attr("cy", d => y(d.score))
                .attr("fill", d => colorScale(bottleneck_list.indexOf(d.bottleneck)))
                .attr("r", "2.5")
                .on('mouseover', this.tooltip.show)
                .on('mouseout', this.tooltip.hide)
                .on('click', d => clickFunction(d.class));

            data_g.selectAll(".ls-random-line").data(d => d).enter().append("line")
                .attr("class", "ls-random-line")
                .attr("x1", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1) -3)
                .attr("x2", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1) + 3)
                .attr("y1", d => y(d.random_score))
                .attr("y2", d => y(d.random_score))
                .attr("stroke", d => colorScale(bottleneck_list.indexOf(d.bottleneck)));

            data_g
                .append("line")
                .attr("class", "ls-seperator-line")
                .attr("x1", d => x(d[0].concept))
                .attr("x2", d => x(d[1].concept))
                .attr("y1", y(0))
                .attr("y2", y(1))
                .attr("stroke", "rgba(128,128,128,0.5)");

            data_g
                .append("line")
                .attr("class", "ls-concept-line")
                .attr("x1", d => (x(d[0].concept) + class_width * (class_list.indexOf(d[0].class) + 1)))
                .attr("x2", d => (x(d[1].concept) + class_width * (class_list.indexOf(d[1].class) + 1)))
                .attr("y1", d => y(d[0].score))
                .attr("y2", d => y(d[1].score))
                .attr("stroke", d => ((d[0].score - d[1].score) < 0.0) ? "#f44941" : "#a3f441")
                .attr("stroke-width", "2px")
                .attr("opacity", d => Math.abs(d[0].score - d[1].score));
        } else if (props.exp_info.name === 'random experiment iterations') {

            data_g.selectAll(".concept-circle").data(d => d).enter().append("circle")
                .attr("class", "concept-circle")
                .attr("cx", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1))
                .attr("cy", d => y(d.score))
                .attr("fill", d => colorScale(rd_exp_iter_list.indexOf(d.nr_iter)))
                .attr("r", "2.5")
                .on('mouseover', this.tooltip.show)
                .on('mouseout', this.tooltip.hide)
                .on('click', d => clickFunction(d.class));

            data_g.selectAll(".ls-random-line").data(d => d).enter().append("line")
                .attr("class", "ls-random-line")
                .attr("x1", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1) -3)
                .attr("x2", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1) + 3)
                .attr("y1", d => y(d.random_score))
                .attr("y2", d => y(d.random_score))
                .attr("stroke", d => colorScale(rd_exp_iter_list.indexOf(d.nr_iter)));

            data_g
                .append("line")
                .attr("class", "ls-seperator-line")
                .attr("x1", d => x(d[0].concept))
                .attr("x2", d => x(d[1].concept))
                .attr("y1", y(0))
                .attr("y2", y(1))
                .attr("stroke", "rgba(128,128,128,0.5)");

            data_g
                .append("line")
                .attr("class", "ls-concept-line")
                .attr("x1", d => (x(d[0].concept) + class_width * (class_list.indexOf(d[0].class) + 1)))
                .attr("x2", d => (x(d[1].concept) + class_width * (class_list.indexOf(d[1].class) + 1)))
                .attr("y1", d => y(Math.min(...d.map(x => x.score))))
                .attr("y2", d => y(Math.max(...d.map(x => x.score))))
                .attr("stroke-width", "2px")
                .attr("stroke", "gray")
                .attr("opacity", d => Math.max(...d.map(x => x.score)) - Math.min(...d.map(x => x.score)));

        } else if (props.exp_info.name === "stratified concept sampling") {

            data_g
                .selectAll(".scc-seperator-line").data(d => d.filter(a => a.bottleneck == 'Mixed_7c' && class_list.indexOf(a.class) === 0)).enter()
                .append("line")
                .attr("class", "scc-seperator-line")
                .attr("x1", d => x(d.concept))
                .attr("x2", d => x(d.concept))
                .attr("y1", y(0))
                .attr("y2", y(1))
                .attr("stroke", "rgba(128,128,128,0.5)");

            data_g.selectAll(".concept-circle").data(d => d.filter(a => a.bottleneck == 'Mixed_7c')).enter().append("circle")
                .attr("class", "strat-concept-circle")
                .attr("cx", d => x(d.concept.split('_')[0]) + class_width * (class_list.indexOf(d.class) + 1))
                .attr("cy", d => y(d.score))
                .attr("fill", d => (!d.concept.includes('_')) ? 'rgb(244, 83, 66)' : 'rgb(65, 146, 244)')
                .attr("r", "2.5")
                .on('mouseover', this.tooltip.show)
                .on('mouseout', this.tooltip.hide)
                .on('click', d => clickFunction(d.class));

            data_g
                .append("line")
                .attr("class", "scc-random-line")
                .attr("x1", d => x(d[0].concept.split('_')[0]) + class_width * (class_list.indexOf(d[0].class) + 1) -3)
                .attr("x2", d => x(d[1].concept.split('_')[0]) + class_width * (class_list.indexOf(d[1].class) + 1) + 3)
                .attr("y1", d => y(d[0].random_score))
                .attr("y2", d => y(d[0].random_score))
                .attr("stroke", "blue");

            data_g
                .append("line")
                .attr("class", "scc-concept-line")
                .attr("x1", d => x(d[0].concept.split('_')[0]) + class_width * (class_list.indexOf(d[0].class) + 1))
                .attr("x2", d => x(d[1].concept.split('_')[0]) + class_width * (class_list.indexOf(d[1].class) + 1))
                .attr("y1", d => y(Math.min(...d.map(x => x.score))))
                .attr("y2", d => y(Math.max(...d.map(x => x.score))))
                .attr("stroke-width", "2px")
                .attr("stroke", "gray")
                .attr("opacity", d => Math.max(...d.map(x => x.score)) - Math.min(...d.map(x => x.score)));
        }

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
            const sf = stretch_factor;
            x.range([margin.left, (width - margin.right) * sf].map(d => d3.event.transform.applyX(d)));
            svg.selectAll(".concept-circle").attr("cx", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1));
            svg.selectAll(".strat-concept-circle").attr("cx", d => x(d.concept.split('_')[0]) + class_width * (class_list.indexOf(d.class) + 1))
            svg.selectAll(".concept-rect").attr("x", d => x(d.concept));
            svg.selectAll(".ls-concept-line").attr("x1", d => (x(d[0].concept) + class_width * (class_list.indexOf(d[0].class) + 1)))
                .attr("x2", d => (x(d[1].concept) + class_width * (class_list.indexOf(d[1].class) + 1)));
            svg.selectAll(".ls-random-line").attr("x1", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1) -3)
            .attr("x2", d => x(d.concept) + class_width * (class_list.indexOf(d.class) + 1) + 3);
            svg.selectAll(".scc-random-line").attr("x1", d => x(d[0].concept) + class_width * (class_list.indexOf(d[0].class) + 1) -3)
            .attr("x2", d => x(d[0].concept) + class_width * (class_list.indexOf(d[0].class) + 1) + 3);
            svg.selectAll(".scc-seperator-line").attr("x1", d => x(d.concept)).attr("x2", d => x(d.concept));
            svg.selectAll(".ls-seperator-line").attr("x1", d => (x(d[0].concept))).attr("x2", d => (x(d[1].concept)));
            svg.selectAll(".scc-concept-line").attr("x1", d => x(d[0].concept.split('_')[0]) + class_width * (class_list.indexOf(d[0].class) + 1))
                .attr("x2", d => x(d[0].concept.split('_')[0]) + class_width * (class_list.indexOf(d[0].class) + 1))
            svg.selectAll(".x-axis").call(xAxis);
        }

    }

}