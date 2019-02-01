import React, {Component} from 'react';
import * as d3 from 'd3';
import '../public/css/ConceptTree.css';

export default class ConceptTreeView extends Component {

    componentDidMount() {
        this.draw(this.props)
    }
    componentDidUpdate(prevProps){
      //this makes sure we don't redraw unnecessarily --
      //only when we add a new shape
      if(this.props.conceptData !== prevProps.conceptData){
        d3.select('.tree > *').remove();
        this.draw(this.props)
      }
  
    }

    render() {
      return (
        <div className="tree" />
      )
    }

    draw = (props) => {
        let treeData = {
            "name": "root",
            "children": [
                {
                  "name": "textures",
                  "children": [
                    {
                      "name": "smooth",
                      "children": [
                          {
                              "name": "planar"
                          },
                          {
                              "name": "gradient"
                          }
                      ]
                    },
                    {
                      "name": "pattern",
                      "children": [
                          {"name": "dotted"},
                          {"name": "striped"},
                          {"name": "zigzagged"},
                      ]
                    },
                    {
                        "name": "irregular",
                        "children": [
                          {"name": "noisy"}
                        ]
                      }
                  ]
                },
                {
                  "name": "(color balance)",
                  "children": [
                    {"name": "colorful"},
                    {"name": "flat colors"},
                    {"name": "muted"}
                  ]
                },
                {
                    "name": "(conturs)",
                    "children": [
                      {"name": "defined"},
                      {"name": "washed out"}
                    ]
                },
                {
                    "name": "(image type)",
                    "children": [
                      {"name": "realistic"},
                      {"name": "drawing"},
                      {"name": "animation"}
                    ]
                },
                {
                    "name": "(category)",
                    "children": [
                      {"name": "Object",
                       "children":[
                        {"name": "(material)",
                         "children": [
                             {"name":"wood"},
                             {"name":"metal"},
                             {"name":"plastic"},
                             {"name":"concrete"}
                         ]}
                       ]
                      },
                      {"name": "Creature"},
                      {"name": "Abstract Shape"}
                    ]
                }
              ]
            };

          let width = 960;
          let dy = width / 6, dx = 30;

          const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

          const tree = d3.tree().nodeSize([dx, dy]);

          const margin = ({top: 10, right: 120, bottom: 10, left: 40});

          const root = d3.hierarchy(treeData);

            root.x0 = dy / 2;
            root.y0 = 0;
            root.descendants().forEach((d, i) => {
                d.id = i;
                d._children = d.children;
                if (d.depth && d.data.name.length !== 7) d.children = null;
            });

            const svg = d3.select('.tree').append('svg')
                .attr("width", width)
                .attr("height", dx)
                .attr("viewBox", [-margin.left, -margin.top, width, dx])
                .style("font", "10px sans-serif")
                .style("user-select", "none");

            const gLink = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "#555")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5);

            const gNode = svg.append("g")
                .attr("cursor", "pointer");

            function update(source) {
                const duration = d3.event && d3.event.altKey ? 2500 : 250;
                const nodes = root.descendants().reverse();
                const links = root.links();

                // Compute the new tree layout.
                tree(root);

                let left = root;
                let right = root;
                root.eachBefore(node => {
                if (node.x < left.x) left = node;
                if (node.x > right.x) right = node;
                });

                const height = right.x - left.x + margin.top + margin.bottom;

                const transition = svg.transition()
                    .duration(duration)
                    .attr("height", height)
                    .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

                // Update the nodes…
                const node = gNode.selectAll("g")
                .data(nodes, d => d.id);

                // Enter any new nodes at the parent's previous position.
                const nodeEnter = node.enter().append("g")
                    .attr("class","style.node")
                    .attr("transform", d => `translate(${source.y0},${source.x0})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0)
                    .on("click", d => {
                    d.children = d.children ? null : d._children;
                    update(d);
                    });

                nodeEnter.append("circle")
                    .attr("r", 2.5)
                    .attr("fill", d => d._children ? "#555" : "#999");

                nodeEnter.append("text")
                    .attr("dy", "0.35em")
                    .attr("x", d => d._children ? -6 : 6)
                    .attr("text-anchor", d => d._children ? "end" : "start")
                    .text(d => d.data.name)
                .clone(true).lower()
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .attr("stroke", "white");

                // Transition nodes to their new position.
                const nodeUpdate = node.merge(nodeEnter).transition(transition)
                    .attr("transform", d => `translate(${d.y},${d.x})`)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                const nodeExit = node.exit().transition(transition).remove()
                    .attr("transform", d => `translate(${source.y},${source.x})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);

                // Update the links…
                const link = gLink.selectAll("path")
                .data(links, d => d.target.id);

                // Enter any new links at the parent's previous position.
                const linkEnter = link.enter().append("path")
                    .attr("d", d => {
                    const o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                    });

                // Transition links to their new position.
                link.merge(linkEnter).transition(transition)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition(transition).remove()
                    .attr("d", d => {
                    const o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                    });

                // Stash the old positions for transition.
                root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
                });
            }

            update(root);
          
    }
}