import React, { Component, PureComponent } from "react";
import Gallery from 'react-photo-gallery';
import {config} from '../app_config';
import SelectedImage from './ImageComponent';

export default class imageGallery extends PureComponent {

    render(){
        return (
            <Gallery photos={this.props.images} onClick={this.props.onClick} 
                    ImageComponent={({...nativeProps}) => <SelectedImage {...nativeProps} 
                                                    classResult={this.props.topPredictions}
                                                    labels={this.props.labels} />}
            />
        );
    }
};