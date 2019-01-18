// App.jsx
import React, { Component } from "react";
import Navbar from './Navbar';
import FilteringOptions from './FilteringOptions';
import Gallery from './ImageGallery/ImageGallery';
import {Button} from 'react-bootstrap';
import axios from "axios";
import OverlayComponent from './AnalysisOverlay/OverlayComponent';
import '../public/css/App.css';
import {config} from './app_config'; 

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
     * - A list of all available images
     * - A list of images that we actually want to display (e.g. because some are filtered out)
     * - Image Display Options defines the filtering options for said images
     * - labels is a list of the correct class for each individual image in the dataset
     * - show_overlay defines whether we want to show the overlay for detail analysis
     * - top_classes contains the five classes with the 
     *   highest prediction probability by the classifier for each image
     * - id_to_label is used to translate the numeric class id to a human readable name
     */
    this.state = {
      dataset: {},
      image_list: [],
      images_on_display: [],
      image_display_options: {},
      labels: [],
      id_to_label: [],
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
        this.setState( {image_list: image_paths, images_on_display: image_paths.slice(0,config.nr_of_displayed_images),
                        image_display_options : {indices : [0,config.nr_of_displayed_images]}
                       });
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

  toggleDisplayedImages(event,obj) {
    //creating copy of object
    let image_display_options = Object.assign({}, this.state.image_display_options);
    let images_on_display = this.state.images_on_display;
    //updating value
    image_display_options.indices[1] = image_display_options.indices[1] + config.show_more_expansion_size;
    images_on_display = this.state.image_list.slice(image_display_options.indices[0],
                                                    image_display_options.indices[1])
    this.setState({image_display_options, images_on_display: images_on_display});

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
        <FilteringOptions onAnalysisButtonClick={this.toogleOverlay.bind(this)} selectedList={this.state.image_list.filter(im => im.selected)} labels={this.state.id_to_label}/>
        <div styleName="content_main">
          <Gallery images={this.state.images_on_display} onClick={this.selectPhoto}/>
          <Button styleName='show_more_button' bsStyle="default" onClick={this.toggleDisplayedImages.bind(this)}>Show More</Button>
        </div>
        {this.state.show_overlay ? <OverlayComponent selectedElements={this.state.image_list.filter(im => im.selected)} close_it={this.toogleOverlay.bind(this)} appState={this.state}/> : null}
      </div>
    )
  }
}