import ReactModal from 'react-modal';
import React from 'react';
import {Button, Glyphicon} from 'react-bootstrap';
ReactModal.setAppElement('#content');

const overlayComponent = (props) => {

    let image = props.selectedElements[0];
    console.log(image);

    return (
        <ReactModal 
            isOpen={true}
           contentLabel="onRequestClose Example"
           style={{overlay:{zIndex:2}}}>
            <div>
                <h2>Detail Interpretabilty View
                <Button class="closeButton" onClick={props.close_it} style={{float : 'right'}}><Glyphicon glyph="remove" /></Button>
                </h2>
                <img src={image.src}></img>
            </div>
        </ReactModal>
    );
};

export default overlayComponent;