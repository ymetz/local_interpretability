import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import axios from "axios";
import treeData from '../../public/local_data/temp_tree_data';
import ConceptPreviewModal from './ConceptPreviewModal';
import { Dropdown, DropdownButton, MenuItem } from 'react-bootstrap';
import '../../public/css/Overlay.css';
import clone from 'clone';
import { interpolateOrRd } from 'd3';

/**
 * The detail concept tree is a visualization for the concept hierarchy and scores for a particual class.
 * If no concept data is available, all nodes are colored uniformely. If data is available, nodes are
 * colored according to TCAV score.
 */
export default class DetailConceptTree extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tcavLayers: (props.conceptData) ? [...new Set(props.conceptData.map(x => x.bottleneck))] : undefined,
            tcav_active_layers: 'Mixed_7c',
            show_concept_preview_modal: false,
            concept_preview_modal_data: null

        }
    }

    /**
     * Traverse the default concept tree (treeData) and fill in scores from tht TCAV concept data,
     * propagate maximum values
     * @param {object} treeData Parsed from JSON-file or response. Contains the tree layout
     * @param {object} conceptData Scores for concepts & random counterpart, used to fill the tree
     */
    getConceptTree(treeData, conceptData) {
        // Recursively call this function to  iterate through the concept tree and tcav values at available nodes
        let loopConceptData = (obj) => {
            if ((typeof obj === "object"))
                obj.scoreSum = { scores: [], n: 0 };
            for (var k in obj) {
                if (k === "scoreSum")
                    continue;
                if (Array.isArray(obj)) {
                    let scoreSum = loopConceptData(obj[k]).scoreSum;
                    obj.scoreSum.scores.push(...scoreSum.scores); obj.scoreSum.n += scoreSum.n;
                }
                else if (typeof obj === "object" && k === "name") {
                    if (conceptData.map(x => x.concept).includes(obj.name)) {
                        let filteredConceptData = conceptData.filter(x => x.concept === obj.name);
                        let p_val = filteredConceptData[0].p_val;
                        let conceptLayerSum = filteredConceptData.map(x => x.score).reduce(function (a, b) { return a + b; });
                        obj.scoreSum.scores.push(conceptLayerSum / filteredConceptData.length);
                        obj.scoreSum.n += 1;
                        obj.nodeSvgShape = {
                            shapeProps: {
                                fill: interpolateOrRd(obj.scoreSum.scores[0]),
                                strokeDasharray: (p_val > 0.05) ? '5,5' : '0',
                                r: "12px"
                            }
                        }
                        obj.leafNode = true;
                    }
                }
                else if (typeof obj === "object" && k === "children") {
                    let scoreSum = loopConceptData(obj[k]).scoreSum;
                    obj.scoreSum.scores = scoreSum.scores; obj.scoreSum.n = scoreSum.n;
                    obj.nodeSvgShape = {
                        shapeProps: {
                            fill: interpolateOrRd(Math.max(...obj.scoreSum.scores)),
                            opacity: (obj.name.startsWith('(')) ? 0.75 : 1.0,
                            r: "12px"
                        }
                    }
                    obj.leafNode = false;
                }
            }
            return obj;
        }
        return loopConceptData(treeData);
    }

    /**
     * Averages the concept scores over data from different network layers if 'combined' option is selected.
     * @param {Array} conceptData 
     */
    processLayerScores(conceptData) {
        if (conceptData === undefined)
            return undefined;
        if (this.state.tcav_active_layers !== 'combined')
            return this.props.conceptData.filter(x => x.bottleneck === this.state.tcav_active_layers);
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

    onConceptTreeNodeClick(node, event) {
        if (!node.leafNode)
            return;
        //Set the concept preview data, wait for callback to only render when data is available
        axios.get('/get_data/get_tcav_concept_examples?'
            + 'concept=' + node.name)
            .then(res => {
                const examplImgs = res.data;
                this.setState({
                    concept_preview_modal_data: { node: node, event: event, example_images: examplImgs },
                    show_concept_preview_modal: true
                });
            })
    }

    closeModal() {
        this.setState({ show_concept_preview_modal: false, concept_preview_modal_data: null });
    }

    changeTcavLayers(active_type) {
        this.setState({ tcav_active_layers: active_type });
        this.props.changeTcavLayers(active_type);
    }

    getOptionsForLayers = (options, activeLayers) => {
        if (options !== undefined) {
            return options.map(function (option) {
                return <MenuItem active={option === activeLayers} eventKey={option} key={option}>{option}</MenuItem>;
            })
        }
    }

    render() {
        const svgNode = {
            shape: 'circle',
            shapeProps: {
                r: '12px',
                fill: 'rgb(113, 149, 206)'

            }
        }

        const filtered_concept_data = this.processLayerScores(this.props.conceptData);

        return (
            <div>
                <div styleName='activation_layer_dropdown'>
                    <DropdownButton id="dropdown-basic-button" title="TCAV Activation Layer" onSelect={this.changeTcavLayers.bind(this)}>
                        <MenuItem active={"combined" === this.state.tcav_active_layers} eventKey="combined">Combined</MenuItem>
                        {this.getOptionsForLayers(this.state.tcavLayers, this.state.activeLayers)}
                    </DropdownButton>
                </div>
                <div styleName="treeContainer" id="treeWrapper" style={{ width: '100%', height: '85%' }}>
                    <Tree
                        // clone() creates a deep clone of the tree object, so we don't modify the original tree
                        data={(filtered_concept_data) ? this.getConceptTree(clone(treeData), filtered_concept_data) : treeData}
                        zoom={4}
                        translate={{ x: 25, y: 400 }}
                        initialDepth={2}
                        onClick={this.onConceptTreeNodeClick.bind(this)}
                        nodeSize={{ x: 120, y: 50 }}
                        transitionDuration={0}
                        nodeSvgShape={svgNode} />
                </div>
                {this.state.show_concept_preview_modal ? <ConceptPreviewModal previewData={this.state.concept_preview_modal_data}
                    closeModal={this.closeModal.bind(this)}
                ></ConceptPreviewModal> : null}
            </div>
        )
    }
}