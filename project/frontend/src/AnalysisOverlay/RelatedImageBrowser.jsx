import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import Gallery from 'react-photo-gallery';
import axios from "axios";
import '../../public/css/Overlay.css';

/**
 * Component displaying other images in the same ckass as the given image (props.imageName).
 * Is used with different column numbers in bottom row of e.g. LIME/LRP and as class preview in TCAV tab.
 */
export default class RelatedImageBrowser extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            related_images: []
        }

    }

    componentDidMount() {
        axios.get('/get_data/get_related_images?image=' + this.props.imageName)
            .then(res => {
                let images = res.data;
                if (this.props.tcavModeImage !== null)
                    images.unshift(this.props.tcavModeImage)
                this.setState({ related_images: images });
            })
    }

    render() {
        return (
            <div styleName={(this.props.mainDisplay) ? "main_related_image_container" : "related_image_container"}>
                {(this.props.showHeader) ? <p>Class Represenatives</p> : null}
                <Gallery photos={this.state.related_images} columns={this.props.columns} onClick={this.props.onClick}></Gallery>
            </div>
        )
    }
}