import React, { Component, PureComponent } from "react";
import Gallery from 'react-photo-gallery';
import SelectedImage from './ImageComponent';


export default class imageGallery extends Component {

    /**
     * Only update and render the Component when all required data for the image component is loaded.
     * Reduces loading time on change of displayed images significantly.
     * @param {*} nextProps 
     * @param {*} nextState 
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props !== nextProps) {
            if (nextProps.images.length !== 0 
                && nextProps.topPredictions.length !== 0 
                && nextProps.labels.length !== 0){
                return true;
            }
        }
        
        return false;
    }

    getClassifierScoresForComponent(image_list, classifier_results, labels) {
        if (image_list === undefined || classifier_results === undefined || labels === undefined)
            return [];

        let classifier_scores = [];
        image_list.forEach( image => {
            let classifier_result = {};
            let photo_name = image.src.split('/').pop();
            let preds = classifier_results[photo_name];
            let result = { score: 0.0, label_correct: false};
            let image_prediction = preds.find((pred,index) => {
                if (pred.class == labels[photo_name][0]){
                    if (index === preds.length-1){
                        result.label_correct = true;
                    }
                    return true;
                }
            });
            if (image_prediction !== undefined)
                result.score = image_prediction.score;
            
            classifier_scores.push(result);
        });

        return classifier_scores;
    }

    render(){
        let photoClassificationResults = this.getClassifierScoresForComponent(this.props.images,
            this.props.topPredictions,
            this.props.labels);

        return (
            <Gallery photos={this.props.images} onClick={this.props.onClick} 
                    ImageComponent={({...nativeProps}) => <SelectedImage {...nativeProps}
                                                           classificationResults={photoClassificationResults}/>}
            />
        );
    }
};