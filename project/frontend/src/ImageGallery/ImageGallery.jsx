import React from 'react';
import Gallery from 'react-photo-gallery';
import {config} from '../app_config';
import SelectedImage from './ImageComponent';

const imageGallery = (props) => {

    let result_array = [];
    for (let image in props.images) {
        let image_name = props.images[image]
        let top_pred = props.topPredictions[image_name][config.nr_of_top_predictions-1];
        let result = top_pred.class == props.labels[image_name];
        result_array.push({img:image_name, score:top_pred.score, result:result})
    }

    return (
        <Gallery photos={props.images} onClick={props.onClick} 
                 ImageComponent={({...props}) => <SelectedImage {...props} 
                                                                classResult={class_results} />}
        />
    );
};

export default imageGallery;