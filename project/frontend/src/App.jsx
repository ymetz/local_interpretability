// App.jsx
import React, { Component } from "react";
import Navbar from './Navbar';
import Gallery from './ImageGallery/ImageGallery';
import {Button} from 'react-bootstrap';
import axios from "axios";
import OverlayComponent from './AnalysisOverlay/OverlayComponent';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.selectPhoto = this.selectPhoto.bind(this);

    this.state = {
      dataset: {},
      image_list: [],
      labels: [],
      show_overlay : false
    }
  }

  componentDidMount() {
    axios.get('/get_data/get_datasets')
      .then(res => {
        const dsets = res.data;
        this.setState( {dataset: dsets[0]} );
      })

    axios.get('/get_data/get_image_list')
      .then(res => {
        const image_paths = res.data;
        this.setState( {image_list: image_paths} );
      }

    axios.get('/get_data/get_labels')
      .then(res => {
        const labels = res.data;
        this.setState( {labels: labels} );
      })
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  selectPhoto(event, obj) {
    let image_list = this.state.image_list;
    image_list[obj.index].selected = !image_list[obj.index].selected;
    this.setState({ image_list: image_list });
  }

  toogleOverlay() {
    let showOverlay = !this.state.show_overlay;
    this.setState({show_overlay: showOverlay});
  }

  render () {
    //return <p> Hello React! It actually works!</p>;
    return(
      <div>
        <Navbar 
          dataset_name={this.state.dataset.dataset_name} 
          num_elements={this.state.dataset.num_elements}
          dataset_path={this.state.dataset.dataset_path}
        />
        <div>
          <p>This web application let's you browse local explanation for a classifier preddiction.</p>
          <p>
            Select a <b>single</b> image for a detailed explanation or <b>two</b> for a comparison:
            <Button bsStyle="primary" onClick={this.toogleOverlay.bind(this)} disabled={this.state.image_list.filter(im => im.selected).length != 1}>Explanation</Button> 
            <Button bsStyle="primary" onClick={this.toogleOverlay.bind(this)} disabled={this.state.image_list.filter(im => im.selected).length != 2}>Comparison</Button>
          </p>
        </div>
        <div>
          <Gallery images={this.state.image_list} onClick={this.selectPhoto}/>
        </div>
        {this.state.show_overlay ? <OverlayComponent selectedElements={this.state.image_list.filter(im => im.selected)} close_it={this.toogleOverlay.bind(this)} labels={this.state.labels}/> : null}
      </div>
    )
  }
}