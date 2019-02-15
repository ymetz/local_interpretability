import React from 'react';
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
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

      console.log(props.conceptData.map(x => x.concept));
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

    // clone() creates a deep clone of the tree object, so we don't modify the original tree
    let newTreeData = loopConceptData(clone(treeData));

    return(
        <div>
            <div id="treeWrapper" style={{width: '100%', height:'100%'}}>
              <Tree 
                data={newTreeData} 
                zoom={4} 
                translate={{x: 250, y: 200}}
                initialDepth={2} 
                nodeSize={{x: 120, y: 50}}
                transitionDuration={200}
                nodeSvgShape={svgNode}/>
            </div>
        </div>
    )
}

export default DetailConceptTree;