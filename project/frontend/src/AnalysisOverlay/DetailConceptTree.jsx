import React from 'react';
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import {Dropdown, DropdownButton, MenuItem} from 'react-bootstrap';
import '../../public/css/Overlay.css';
import clone from 'clone';
import {interpolateOrRd} from 'd3';

const DetailConceptTree = (props) => {

    const svgNode = {
        shape: 'circle',
        shapeProps: {
          r : '12px',
          fill: 'rgb(113, 149, 206)'

        }
      }

    // Recursively itterate through the concept tree and tcav values at available nodes
    function loopConceptData(obj)
    {
        for (var k in obj)
        {
            if ((typeof obj === "object") && k === "name"){
                if (props.conceptData.map(x => x.concept).includes(obj.name)) {
                    obj.nodeSvgShape = {
                        shapeProps: {
                            fill: interpolateOrRd(props.conceptData.find(x => x.concept === obj.name).score),
                            r: "12px"
                        }
                    }
                }     
            }
            if (typeof obj === "object" && k === "children") {
                loopConceptData(obj[k]);
            } else if (Array.isArray(obj)) {
                loopConceptData(obj[k]);                    
            }
        }
        return obj;
    }

    return(
        <div>
            <div styleName='activation_layer_dropdown'>
                <DropdownButton id="dropdown-basic-button" title="TCAV Activation Layer" onSelect={props.changeTcavLayers}>
                    <MenuItem active={"combined" === props.activeLayers} eventKey="combined">Combined</MenuItem>
                    <MenuItem active={"low_layer" === props.activeLayers} eventKey="low_layer">Lower Layer</MenuItem>
                    <MenuItem active={"high_layer" === props.activeLayers} eventKey="high_layer">Higher Layer</MenuItem>
                </DropdownButton>
            </div>
            <div styleName="treeContainer" id="treeWrapper" style={{width: '100%', height:'85%'}}>
              <Tree 
                // clone() creates a deep clone of the tree object, so we don't modify the original tree
                data={(props.conceptData) ? loopConceptData(clone(treeData)) : treeData} 
                zoom={4} 
                translate={{x: 25, y: 400}}
                initialDepth={2} 
                nodeSize={{x: 120, y: 50}}
                transitionDuration={200}
                nodeSvgShape={svgNode}/>
            </div>
        </div>
    )
}

export default DetailConceptTree;