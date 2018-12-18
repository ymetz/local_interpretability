import ReactModal from 'react-modal';
import React, {Component} from 'react';
import {Button, Glyphicon} from 'react-bootstrap';
import '../../public/css/Overlay.css';
import axios from "axios";
ReactModal.setAppElement('#content');

export default class overlayComponent extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          current_image : this.props.selectedElements[0],
          current_image_name : this.props.selectedElements[0].src.split("/").pop(),
          current_image_label: this.props.labels[this.props.selectedElements[0].src.split("/").pop()]
       }
    }

    componentDidMount() {
        axios.get('/get_data/get_top_classifications?image='+this.state.current_image_name)
        .then(res => {
          const preds = res.data;
          this.setState( {current_image_predictions: preds} );
        })
        console.log(this.state.current_image_predictions);
    }


    render() {
        return (
            <ReactModal 
                isOpen={true}
            contentLabel="onRequestClose Example"
            style={{overlay:{zIndex:2}}}>
                <div>
                    <h2>Detail Interpretabilty View
                    <Button styleName="closeButton" onClick={this.props.close_it}><Glyphicon glyph="remove" /></Button>
                    </h2>
                    <hr></hr>
                </div>
                <div style={{overflow:'hidden'}}>
                    <div style={{display: 'inline-block'}}>
                        <img src={this.state.current_image.src}></img>
                    </div>
                    <div style={{display: 'inline-block',verticalAlign:'top', marginLeft:'10px'}}>
                        <p><b>{this.state.current_image_name}</b></p>
                        <p>Class:{this.state.current_image_label[1]} ({this.state.current_image_label[0]})</p>
                        <p>Original Width:{this.state.current_image.width}</p>
                        <p>Original Height:{this.state.current_image.height}</p>
                    </div>
                </div>
            </ReactModal>
        )
    }
};