import React, {PureComponent} from 'react';
import {Button} from 'react-bootstrap';
import Gallery from 'react-photo-gallery';
import axios from "axios";
import '../../public/css/Overlay.css';

export default class RelatedImageBrowser extends PureComponent {

    constructor(props){
        super(props);
        this.state = {
            related_images : []
        }

    }

    componentDidMount() {
        axios.get('/get_data/get_related_images?image='+this.props.imageName)
        .then(res => {
          const images = res.data;
          this.setState( {related_images: images} );
        })
    }

    render() {
        return (
            <div styleName={(this.props.mainDisplay) ? "main_related_image_container" : "related_image_container"}>
                {(this.props.showHeader) ? <p>Class Represenatives</p>: null}
                <Gallery photos={this.state.related_images} columns={this.props.columns} onClick={this.props.onClick}></Gallery>
            </div>
        )
    }
}