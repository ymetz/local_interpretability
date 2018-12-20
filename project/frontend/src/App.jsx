// App.jsx
import React, { Component } from "react";
import Navbar from './Navbar';
import Gallery from './ImageGallery/ImageGallery';
import {Button} from 'react-bootstrap';
import axios from "axios";
import OverlayComponent from './AnalysisOverlay/OverlayComponent';
import '../public/css/App.css';

/**
 * App Component of the React App.
 * Contains the general App state, e.g. the dataset, list of images, if we show an overlay etc.
 * Serves as main class for the React App and provides the default view.
 * 
 */
export default class App extends Component {
  constructor(props) {
    super(props);
    this.selectPhoto = this.selectPhoto.bind(this);

    /**
     * The App state contains:
     * - Information about the dataset we are analysing
     * - A list of images, which we may want to display includign their path and dimensions
     * - labels is a list of the correct class for each individual image in the dataset
     * - show_overlay defines whether we want to show the overlay for detail analysis
     * - top_classes contains the five classes with the 
     *   highest prediction probability by the classifier for each image
     * - id_to_label is used to translate the numeric class id to a human readable name
     */
    this.state = {
      dataset: {},
      image_list: [],
      labels: [],
      show_overlay : false
    }
  }

  /**
   * Is called when the Component is rendered initially. Loads all necessary data for the Application
   * and sets the corresponding state variables.
   */
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
      })

    axios.get('/get_data/get_labels')
      .then(res => {
        const labels = res.data;
        this.setState( {labels: labels} );
      })

    axios.get('/get_data/get_top_classifications')
      .then(res => {
        const preds = res.data;
        this.setState( {top_classes: preds} );
      })

    axios.get('/get_data/get_id_to_label')
      .then(res => {
        const id_to_label = res.data;
        this.setState( {id_to_label: id_to_label} );
      })
  }

  /**
   * Is called when an image has been selected. Toggles the list of selected images.
   * @param {Event} event Click Event. Not used in this case
   * @param {Object} obj Contains information about the selected image.
   */
  selectPhoto(event, obj) {
    let image_list = this.state.image_list;
    image_list[obj.index].selected = !image_list[obj.index].selected;
    this.setState({ image_list: image_list });
  }

  /**
   * When the Explanation button is pushed, open the detail analysis overview. 
   * When the close button in the overlay window is pushed, change the state variable and 
   * and reset the image selection.
   */
  toogleOverlay() {
    if (this.state.show_overlay === true){
      let image_list = this.state.image_list;
      image_list.map((elem) => {elem.selected = false; return elem;})
      this.setState({ image_list: image_list });      
    }
    let showOverlay = !this.state.show_overlay;
    this.setState({show_overlay: showOverlay});
  }

  getImagePredictions() {
    let image_name = this.state.current_image_name;
    axios.get('/get_data/get_prediction?name='+ image_name)
    .then(res => {
      const pred = res.data;
      this.setState( {current_image_prediction: pred} );
    })
  }

  /**
   * Main rendering method that each React Component has to provide.
   * Defines what actually is displayed on the web page.
   * In this case many other component like the Navbar are called, and only the info text is rendered in this
   * component.
   */
  render () {
    return(
      <div>
        <Navbar 
          dataset_name={this.state.dataset.dataset_name} 
          num_elements={this.state.dataset.num_elements}
          dataset_path={this.state.dataset.dataset_path}
        />
        <div styleName='intro_text'>
          <p>This web application let's you browse local explanation for a classifier prediction.</p>
          <p>
            Select a <b>single</b> image for a detailed explanation or <b>two</b> for a comparison:
            <Button styleName='action_btn' bsStyle="primary" onClick={this.toogleOverlay.bind(this)} disabled={this.state.image_list.filter(im => im.selected).length != 1}>Explanation</Button> 
            <Button styleName='action_btn' bsStyle="primary" onClick={this.toogleOverlay.bind(this)} disabled={this.state.image_list.filter(im => im.selected).length != 2}>Comparison</Button>
          </p>
        </div>
        <div>
          <Gallery images={this.state.image_list} onClick={this.selectPhoto}/>
        </div>
        {this.state.show_overlay ? <OverlayComponent selectedElements={this.state.image_list.filter(im => im.selected)} close_it={this.toogleOverlay.bind(this)} appState={this.state}/> : null}
      </div>
    )
  }
}