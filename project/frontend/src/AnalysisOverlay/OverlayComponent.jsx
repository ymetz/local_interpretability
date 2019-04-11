import ReactModal from 'react-modal';
import React, {Component} from 'react';
import {Button, Glyphicon, ButtonToolbar, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import '../../public/css/Overlay.css';
import axios from "axios";
import TopPredictionTable from './Top_Prediction_Table';
import InfoFooter from './InfoFooter';
import TcavChart from './TcavChart';
import RelatedImageBrowser from './RelatedImageBrowser';
import DetailConceptTree from './DetailConceptTree';
import ClassPerformance from './ClassPerformance';
ReactModal.setAppElement('#content');

/**
 * Overlay Compoment that is displayed to analyse a single image.
 */
export default class OverlayComponent extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          current_image : this.props.selectedElements[0],
          current_image_name : this.props.selectedElements[0].src.split("/").pop(),
          current_image_label: this.props.appState.labels[this.props.selectedElements[0].src.split("/").pop()],
          current_image_class: -1,
          method: 'lime',
          show_explanation_image: false,
          concept_data : {},
          tcav_active_layers: 'combined'
       }

    }

    setNewImage(event, image) {
        this.setState({
            current_image: image.photo,
            current_image_name: image.photo.src.split("/").pop(),
            current_image_label: this.props.appState.labels[image.photo.src.split("/").pop()],
            current_image_class: -1,
            show_explanation_image: false
        })
    }

    methodChange(method) {
        this.setState({ method: method });
    }

    changeTcavLayers(active_type) {
        this.setState({ tcav_active_layers : active_type});
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
                    <h2 styleName="top_heading">Detail Interpretabilty View
                    <span styleName="close_button" onClick={this.props.closeModal}><Glyphicon glyph="remove" /></span>
                    </h2>
                    <hr style={{marginTop : '4px'}}></hr>
                </div>
                <div styleName='overlay_content'>
                    <div styleName="left_content">
                        <div styleName='image_container'>
                            <div styleName='method_selection'>
                                <ButtonToolbar>
                                    <ToggleButtonGroup type='radio' name='options' value={this.state.method} onChange={this.methodChange.bind(this)} justified>
                                    <ToggleButton value={'lime'}>LIME</ToggleButton>
                                    <ToggleButton value={'tcav'}>TCAV</ToggleButton>
                                    <ToggleButton value={'elrp'}>LRP</ToggleButton>
                                    </ToggleButtonGroup>
                                </ButtonToolbar>
                            </div>
                            {(this.state.method === 'tcav') ?
                            <div>
                                <RelatedImageBrowser key={this.state.current_image_name}
                                    imageName={this.state.current_image_name} 
                                    imageLabel={this.state.current_image_label} 
                                    explanationClass={this.state.current_image_class}
                                    onClick={this.setNewImage.bind(this)}
                                    columns={2}
                                    mainDisplay={true}
                                    showHeader={false}/>
                            </div> : 
                            <img styleName='image_display' src={this.state.show_explanation_image ? 
                                                                this.state.current_explanation_src : this.state.current_image.src}></img>
                            }
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
                        <div>
                        { (this.state.method === 'tcav') ? <TcavChart conceptData={this.props.appState.tcav_scores[this.state.current_image_label[0]]}
                                                                      activeLayers={this.state.tcav_active_layers}/> :
                                                            <RelatedImageBrowser key={this.state.current_image_name}
                                                                                    imageName={this.state.current_image_name} 
                                                                                    imageLabel={this.state.current_image_label} 
                                                                                    explanationClass={this.state.current_image_class}
                                                                                    onClick={this.setNewImage.bind(this)}
                                                                                    columns={4}
                                                                                    mainDisplay={false}
                                                                                    showHeader={true}/>}
                        </div>
                    </div>
                    <div styleName='additional_info_vis'>
                            {(this.state.method === 'tcav') ? <DetailConceptTree conceptData={this.props.appState.tcav_scores[this.state.current_image_label[0]]}
                                                                                 changeTcavLayers={this.changeTcavLayers.bind(this)}/>
                                                            : <ClassPerformance classPerformance={this.props.appState.classifier_performance} 
                                                                                currentLabel={this.state.current_image_label}/>}
                    </div>
                    <InfoFooter method={this.state.method}/>
                </div>
            </ReactModal>
        )
    }
};