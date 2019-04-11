import React from 'react';
import ReactModal from 'react-modal';
import {Glyphicon} from 'react-bootstrap';
import Gallery from 'react-photo-gallery';
import '../../public/css/ConceptPreviewModal.css';

const ConceptPreviewModal = (props) => {
    const node = props.previewData.node;
    if (node.scoreSum === undefined)
        node.scoreSum = { sum: '-'}
    const event = props.previewData.event;
    const example_images = props.previewData.example_images;
    return (
        <ReactModal
            isOpen={true}
            contentLabel="onRequestClose ConceptPreview"
            style={{overlay:{zIndex:1050, 
                             top:event.screenY - 300, 
                             left:event.screenX -600, 
                             bottom: 0, 
                             right: 20, 
                             width: 600, 
                             height: 500, 
                             backgroundColor: 'rgba(255, 255, 255, 0.5)'}}}
        >
            <div styleName="top_div">
                <h4 styleName="concept_name">"{node.name}" concept</h4>
                <span styleName="close_button" onClick={props.closeModal}><Glyphicon glyph="remove"/></span>
            </div>
            <div styleName="content_div">
                <p><b>Concept Score for current class:</b>{node.scoreSum.sum}</p>
            </div>
            <div>
                <Gallery photos={example_images} columns={2}></Gallery>
            </div>
        </ReactModal>
    );
};



export default ConceptPreviewModal;