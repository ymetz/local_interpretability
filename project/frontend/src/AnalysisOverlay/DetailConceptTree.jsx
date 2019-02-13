import React from 'react';
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';

const DetailConceptTree = (props) => {

    return(
        <div>
            <div id="treeWrapper" style={{width: '100%', height:'100%'}}>
              <Tree 
                data={treeData} 
                zoom={2} 
                translate={{x: 250, y: 200}}
                initialDepth={1} 
                nodeSize={{x: 120, y: 75}}
                transitionDuration={200}/>
            </div>
        </div>
    )
}

export default DetailConceptTree;