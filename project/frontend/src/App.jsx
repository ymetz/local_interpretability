// App.jsx
import React, { Component } from "react";
import Navbar from './Navigation_and_Search/Navbar';
import FilteringOptions from './Navigation_and_Search/FilteringOptions';
import Gallery from './ImageGallery/ImageGallery';
import {Button} from 'react-bootstrap';
import axios from "axios";
import OverlayComponent from './AnalysisOverlay/OverlayComponent';
import '../public/css/App.css';
import {config} from './app_config'; 
import GlobalView from "./GlobalView/GlobalView";
import SelectedImage from "./ImageGallery/ImageComponent";

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
     * - app_settings contains settings that may be used across components in the app
     */
    this.state = {
      dataset: {},
      image_list: [],
      images_on_display: [],
      image_display_options: {
        indices: [0,config.nr_of_displayed_images],
        prediction_interval: [0,1],
        display_image_classes: []
      },
      expand_button_disabled: false,
      labels: [],
      top_classes: {},
      classifier_performance: [],
      id_to_label: [],
      tcav_scores: {},
      show_gallery: true,
      show_overlay : false,
      tcav_concept_hierarchy: {}
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
        this.setState( {image_list: image_paths, 
                        images_on_display: image_paths.slice(0,config.nr_of_displayed_images)});
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

    axios.get('get_data/get_classifier_performance')
      .then(res => {
        const classifierPerformance = res.data;
        this.setState( {classifier_performance: classifierPerformance} );
      })

    axios.get('/get_data/get_id_to_label')
      .then(res => {
        const id_to_label = res.data;
        this.setState( {id_to_label: id_to_label} );
      })

    axios.get('/get_data/get_tcav_scores')
    .then(res => {
        const scores = res.data;
        this.setState( {tcav_scores: scores} );
    })    
  }

  /**
   * Is called when an image has been selected. Toggles the list of selected images.
   * @param {Event} event Click Event. Not used in this case
   * @param {Object} obj Contains information about the selected image.
   */
  selectPhoto(event, obj) {
    let images_on_display = this.state.images_on_display;
    images_on_display[obj.index].selected = !images_on_display[obj.index].selected;
    this.setState({ images_on_display: images_on_display });
  }

  /**
   * When the Explanation button is pushed, open the detail analysis overview. 
   * When the close button in the overlay window is pushed, change the state variable and 
   * and reset the image selection.
   */
  toogleOverlay() {
    if (this.state.show_overlay === true){
      let images_on_display = this.state.images_on_display;
      images_on_display.map((elem) => {elem.selected = false; return elem;})
      this.setState({ images_on_display: images_on_display });      
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
   *  Update the list of display images. Get's called when relevant properties change. */
  updateImageList() {
    let image_display_options = Object.assign({}, this.state.image_display_options);
    const selectedClasses = image_display_options.display_image_classes;
    const predictionInterval = image_display_options.prediction_interval;
    const indices = image_display_options.indices;
    const image_paths = this.state.image_list;
    let displayed_images = [];

    //First, get images of selected classes only
    if (selectedClasses.length === 0) {
      displayed_images = image_paths;
    } else {
      displayed_images = image_paths.filter(x => selectedClasses.includes(x.label));
    }

    // Secondly, only choose images inside prediction score interval
    if (!(predictionInterval[0] === 0 && predictionInterval[1] === 1)){
      const topClasses = this.state.top_classes;
      displayed_images = displayed_images.filter(function(x)
                                                { const image_name = x.src.split("/").pop();
                                                  const pred_score = topClasses[image_name].find(y => y.class === x.label);
                                                  let score = 0.0;
                                                  if (pred_score !== undefined){
                                                    score = pred_score.score;
                                                  }
                                                  if (score >= predictionInterval[0] && score <= predictionInterval[1]) {
                                                        return true;
                                                      }
                                                  return false;
                                                })
    }

    if (displayed_images.length > indices[1])
      this.setState({expand_button_disabled: false})
    else
      this.setState({expand_button_disabled: true})

    // At last, slice it to chosen number of images
    console.log(displayed_images.length);
    displayed_images = displayed_images.slice(indices[0],indices[1])

    this.setState({images_on_display: displayed_images});

  }

  expandDisplayedImages(event,obj) {
    //creating copy of object
    let image_display_options = Object.assign({}, this.state.image_display_options);
    let images_on_display = this.state.images_on_display;
    //updating value
    image_display_options.indices[1] = image_display_options.indices[1] + config.show_more_expansion_size;
    this.setState({image_display_options: image_display_options}, () => this.updateImageList());

  }

  updateDisplayImagesByClass(event, obj) {
    let image_display_options = Object.assign({}, this.state.image_display_options);
    image_display_options.display_image_classes = event.map(x => Number(x.value));
    this.setState( {image_display_options: image_display_options}, () => this.updateImageList());
  }

  changeInterval(interval) {
    let image_display_options = Object.assign({}, this.state.image_display_options);
    image_display_options.prediction_interval = interval;
    this.setState( {image_display_options: image_display_options}, () => this.updateImageList());
  }

  toggleViewMode() {
    let showGallery = !this.state.show_gallery;
    this.setState({show_gallery: showGallery});
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
        <FilteringOptions 
          onAnalysisButtonClick={this.toogleOverlay.bind(this)} 
          selectedList={this.state.images_on_display.filter(im => im.selected)}
          onSearchSubmit={this.updateDisplayImagesByClass.bind(this)}
          onIntervallChange={this.changeInterval.bind(this)}
          labels={this.state.id_to_label}
          onViewModeChange={this.toggleViewMode.bind(this)}
        />
        <div styleName="content_main">
          { (this.state.show_gallery) ? 
          <div>
            <Gallery 
              images={this.state.images_on_display} 
              onClick={this.selectPhoto.bind(this)} 
              topPredictions={this.state.top_classes} 
              labels={this.state.labels}
            />
            <Button 
              styleName='show_more_button' 
              bsStyle="default"
              disabled={this.state.expand_button_disabled} 
              onClick={this.expandDisplayedImages.bind(this)}>Show More</Button>
          </div> : <GlobalView/> }
        </div>
        {this.state.show_overlay ? <OverlayComponent 
                                      selectedElements={this.state.images_on_display.filter(im => im.selected)} 
                                      close_it={this.toogleOverlay.bind(this)} 
                                      appState={this.state}/> : null}
      </div>
    )
  }
}