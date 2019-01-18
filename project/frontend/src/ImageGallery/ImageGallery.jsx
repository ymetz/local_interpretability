import React from 'react';
import Gallery from 'react-photo-gallery';
import SelectedImage from './ImageComponent';

const imageGallery = (props) => {
    return (
        <Gallery photos={props.images} onClick={props.onClick} ImageComponent={SelectedImage}/>
    );
};

export default imageGallery;