import React, {Component} from 'react';
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import {Dropdown, DropdownButton, MenuItem} from 'react-bootstrap';
import '../../public/css/Overlay.css';
import clone from 'clone';
import {interpolateOrRd} from 'd3';

export default class DetailConceptTree extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tcavLayers : (props.conceptData) ? [...new Set(props.conceptData.map(x => x.bottleneck))] : undefined ,
            tcav_active_layers: 'combined'
        }
    }

    getConceptTree(treeData, conceptData) {
            // Recursively itterate through the concept tree and tcav values at available nodes. Sum up
            // the scores and propagate them to higher nodes
            let loopConceptData = (obj) =>
            {
                if ((typeof obj === "object"))
                    obj.scoreSum = {sum: 0.0, n: 0};
                for (var k in obj)
                {
                    if (k === "scoreSum")
                        continue;
                    if (Array.isArray(obj)) {
                        let scoreSum = loopConceptData(obj[k]).scoreSum;
                        obj.scoreSum.sum += scoreSum.sum; obj.scoreSum.n += scoreSum.n;       
                    }
                    else if (typeof obj === "object" && k === "name"){
                        if (conceptData.map(x => x.concept).includes(obj.name)) {
                            let filteredConceptData = conceptData.filter(x => x.concept === obj.name);
                            let conceptLayerSum = filteredConceptData.map(x => x.score).reduce(function(a, b) { return a + b; });
                            obj.scoreSum.sum += conceptLayerSum / filteredConceptData.length;
                            obj.scoreSum.n += 1;
                            obj.nodeSvgShape = {
                                shapeProps: {
                                    fill: interpolateOrRd(obj.scoreSum.sum),
                                    r: "12px"
                                }
                            }
                        }     
                    }
                    else if (typeof obj === "object" && k === "children") {
                        let scoreSum = loopConceptData(obj[k]).scoreSum;
                        obj.scoreSum.sum = scoreSum.sum; obj.scoreSum.n = scoreSum.n;
                        obj.nodeSvgShape = {
                            shapeProps: {
                                fill: interpolateOrRd(obj.scoreSum.sum/Math.max(obj.scoreSum.n,1)),
                                r: "12px"
                            }
                        }
                    }
                }
                return obj;
            }

            return loopConceptData(treeData);
        
    }

    changeTcavLayers(active_type) {
        this.setState({ tcav_active_layers : active_type});
        this.props.changeTcavLayers(active_type);
    }

    getOptionsForLayers = (options, activeLayers) => {
        if (options !== undefined){
            return options.map(function(option){
                return <MenuItem active={option === activeLayers} eventKey={option} key={option}>{option}</MenuItem>;
            })
        }
    }

    render() {
        const svgNode = {
            shape: 'circle',
            shapeProps: {
              r : '12px',
              fill: 'rgb(113, 149, 206)'
    
            }
        }

        const filtered_concept_data = (this.state.tcav_active_layers === 'combined') 
                                        ?  this.props.conceptData 
                                        : this.props.conceptData.filter(x => x.bottleneck === this.state.tcav_active_layers);

        return(
            <div>
                <div styleName='activation_layer_dropdown'>
                    <DropdownButton id="dropdown-basic-button" title="TCAV Activation Layer" onSelect={this.changeTcavLayers.bind(this)}>
                        <MenuItem active={"combined" === this.state.tcav_active_layers} eventKey="combined">Combined</MenuItem>
                        {this.getOptionsForLayers(this.state.tcavLayers, this.state.activeLayers)}
                    </DropdownButton>
                </div>
                <div styleName="treeContainer" id="treeWrapper" style={{width: '100%', height:'85%'}}>
                <Tree 
                    // clone() creates a deep clone of the tree object, so we don't modify the original tree
                    data={(filtered_concept_data) ? this.getConceptTree(clone(treeData),filtered_concept_data) : treeData} 
                    zoom={4} 
                    translate={{x: 25, y: 400}}
                    initialDepth={2} 
                    nodeSize={{x: 120, y: 50}}
                    transitionDuration={0}
                    nodeSvgShape={svgNode}/>
                </div>
            </div>
        )
    }
}