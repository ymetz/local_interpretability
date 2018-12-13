import ReactModal from 'react-modal';
import React from 'react';
import {Button, Glyphicon} from 'react-bootstrap';
import '../../public/css/Overlay.css';
ReactModal.setAppElement('#content');

const overlayComponent = (props) => {

    let image = props.selectedElements[0];
    let image_name = image.src.split("/").pop();
    let image_label = props.labels[image_name];
    console.log(image_label);

    return (
        <ReactModal 
            isOpen={true}
           contentLabel="onRequestClose Example"
           style={{overlay:{zIndex:2}}}>
            <div>
                <h2>Detail Interpretabilty View
                <Button styleName="closeButton" onClick={props.close_it}><Glyphicon glyph="remove" /></Button>
                </h2>
                <hr></hr>
            </div>
            <div style={{overflow:'hidden'}}>
                <div style={{display: 'inline-block'}}>
                    <img src={image.src}></img>
                </div>
                <div style={{display: 'inline-block',verticalAlign:'top', marginLeft:'10px'}}>
                    <p><b>{image_name}</b></p>
                    <p>Class:{image_label[1]} ({image_label[0]})</p>
                    <p>Original Width:{image.width}</p>
                    <p>Original Height:{image.height}</p>
                </div>
            </div>
        </ReactModal>
    );
};

export default overlayComponent;