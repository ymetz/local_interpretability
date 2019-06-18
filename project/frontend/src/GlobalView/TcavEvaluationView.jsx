// App.jsx
import React, { Component } from "react";
import '../../public/css/GlobalView.css';
import Tree from 'react-d3-tree';
import treeData from '../../public/local_data/temp_tree_data';
import ConceptPreviewModal from '../AnalysisOverlay/ConceptPreviewModal';
import axios from 'axios';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import TcavEvaluationChart from "./TcavEvaluationChart";

/**
 * View showing global statistics.
 * 
 */
export default class TcavEvaluationView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            available_exps: '',
            active_experiment: undefined,
            show_concept_preview_modal: false,
            concept_preview_modal_data: undefined,
            experiment_data: undefined
        }

    }

    componentDidMount() {
        this.getExperiments();
    }

    getExperiments() {
        //Set the concept preview data, wait for callback to only render when data is available
        axios.get('/get_data/get_tcav_experiment_list')
            .then(res => {
                const exps = res.data;
                this.setState({
                    avaialable_experiments: exps,
                    active_experiment: exps[0]
                }, () => this.getExperimentData());
            })
    }

    getExperimentData() {
        //Set the concept preview data, wait for callback to only render when data is available
        axios.get('/get_data/get_tcav_experiment_result?'+'exp_key='+ this.state.active_experiment)
            .then(res => {
                const exp_data = res.data;
                this.setState({
                    experiment_data: exp_data
                });
            })
    }

    changeExperiment(expName) {
        this.setState({
            active_experiment: expName
        }, () => this.getExperimentData())
    }


    getOptionsForExperiments(options, activeExperiment) {
        if (options !== undefined) {
            console.log(options);
            return options.map(function (option) {
                return <MenuItem active={option === activeExperiment} eventKey={option} key={option}>{option}</MenuItem>;
            })
        }
    }

    onConceptTreeNodeClick(node, event) {
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

    render() {

        return (
            <div styleName="tcav_eva_container">
                <div styleName='data_dropdown'>
                    <div styleName='dropdown_div'>
                        <DropdownButton id="dropdown-basic-button" title="TCAV Evaluation Experiments" onSelect={this.changeExperiment.bind(this)}>
                            {this.getOptionsForExperiments(this.state.avaialable_experiments, this.state.active_experiment)}
                        </DropdownButton>
                    </div>
                    <div styleName='description_div'>
                        <p>Experiment: {this.state.active_experiment} | Description: {(this.state.experiment_data) ? this.state.experiment_data.exp_info.description : '-'}</p>
                    </div>
                </div>
                <div styleName="tcav_eva_chart_container">
                    <TcavEvaluationChart experimentData={this.state.experiment_data}/>
                </div>
                <div styleName="treeWrapper" style={{ width: '600px', height: '600px' }}>
                    <Tree
                        data={treeData}
                        zoom={4}
                        translate={{ x: 50, y: 375 }}
                        initialDepth={5}
                        nodeSize={{ x: 200, y: 40 }}
                        transitionDuration={250}
                        onClick={this.onConceptTreeNodeClick.bind(this)} />
                    </div>
                    {this.state.show_concept_preview_modal ? <ConceptPreviewModal previewData={this.state.concept_preview_modal_data}
                    closeModal={this.closeModal.bind(this)}>
                    </ConceptPreviewModal> : null}
            </div>
        )
    }
}