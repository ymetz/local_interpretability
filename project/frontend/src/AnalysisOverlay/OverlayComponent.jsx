import ReactModal from 'react-modal';
import React, {Component} from 'react';
import {Button, Glyphicon, ButtonToolbar, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import '../../public/css/Overlay.css';
import axios from "axios";
import TopPredictionTable from './Top_Prediction_Table';
import InfoFooter from './InfoFooter';
import TcavChart from './TcavChart';
ReactModal.setAppElement('#content');

/**
 * Overlay Compoment that is displayed to analyse a single image.
 */
export default class overlayComponent extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          current_image : this.props.selectedElements[0],
          current_image_name : this.props.selectedElements[0].src.split("/").pop(),
          current_image_label: this.props.appState.labels[this.props.selectedElements[0].src.split("/").pop()],
          current_image_class: -1,
          method: 'lime',
          show_explanation_image: false,
          concept_data : {}
       }

    }

    componentDidMount() {
        /*axios.get('/get_data/get_single_classification?image='+this.state.current_image_name)
        .then(res => {
          const preds = res.data;
          this.setState( {current_image_predictions: preds} );
        })*/
    }

    methodChange(method) {
        this.setState({ method: method });
    }

    toggleExplanationImage(imgClass) {
        if (this.state.method === 'tcav')
            return;
        axios.get('/get_data/get_explanation_image?id='+this.state.current_image_name
        +'&method='+ this.state.method
        +'&class='+ imgClass)
        .then(res => {
            const preds = res.data;
            this.setState( {current_explanation_src: preds, show_explanation_image: true, 
                current_image_class: imgClass } );
        })
    }

    render() {
        return (
            <ReactModal 
                isOpen={true}
                contentLabel="onRequestClose Example"
                style={{overlay:{zIndex:1040}}}>
                <div>
                    <h2>Detail Interpretabilty View
                    <Button styleName="close_button" onClick={this.props.close_it}><Glyphicon glyph="remove" /></Button>
                    </h2>
                    <hr></hr>
                </div>
                <div styleName='overlay_content'>
                    <div styleName='image_container'>
                        <div styleName='method_selection'>
                            <ButtonToolbar>
                                <ToggleButtonGroup type='radio' name='options' value={this.state.method} onChange={this.methodChange.bind(this)} justified>
                                <ToggleButton value={'lime'}>LIME</ToggleButton>
                                <ToggleButton value={'elrp'}>LRP</ToggleButton>
                                <ToggleButton value={'tcav'}>TCAV</ToggleButton>
                                </ToggleButtonGroup>
                            </ButtonToolbar>
                        </div>
                        <img styleName='image_display' src={this.state.show_explanation_image ? 
                                                            this.state.current_explanation_src : this.state.current_image.src}></img>
                    </div>
                    <div styleName='image_details'>
                        <p><b>{this.state.current_image_name}</b></p>
                        <p>Class: {this.state.current_image_label[1]} ({this.state.current_image_label[0]})</p>
                        <p>Original Dimensions: {this.state.current_image.width} x {this.state.current_image.height} (Width x Height)</p>
                        <TopPredictionTable data={this.props.appState.top_classes[this.state.current_image_name]} 
                                            id_to_label={this.props.appState.id_to_label}
                                            correct_class={this.state.current_image_label[0]}
                                            onSelect={this.toggleExplanationImage.bind(this)}/>
                    </div>
                    { (this.state.method === 'tcav') ? <TcavChart conceptData={this.props.appState.tcav_scores[this.state.current_image_label[0]]}/> : null}
                    <InfoFooter method={this.state.method}/>
                </div>
            </ReactModal>
        )
    }
};