import React from "react";
import {Navbar, Button, Glyphicon, label} from 'react-bootstrap';
import Select from 'react-select';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import {config} from '../app_config';
import style from '../../public/css/Navbar.css';

const getClasses = (labels) => {
    let classes = [];
    for (var class_entry in labels) {
        classes.push({value:class_entry, label:labels[class_entry]})
    }
    return classes;
};

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

/**
 * Provides a filtering options for the data browser. Namely
 * - Select : Filtering by specific class affiliation
 * - Range: Filtering by classifier score confidence
 * The Second navbar also has buttons for the toggle of the analysis overlay and the global view/data browser
 * @param {*} props 
 */
const Second_Navbar = (props) => {
    const class_list = getClasses(props.labels);

    return (
        <Navbar fixedTop fluid styleName='style.second_navbar'>
            <Navbar.Header>
                <Navbar.Text styleName='style.filtering_label'>
                    Dataset Filtering:
                </Navbar.Text>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Navbar.Form pullLeft>
                    <Select
                        isMulti
                        name="class_selection"
                        options={class_list}
                        onChange={props.onSearchSubmit}
                        className="style.basic-multi-select"
                        classNamePrefix="style.select"
                        styleName="style.class_select"
                    />
                </Navbar.Form>
                <Navbar.Form pullLeft>
                    <div styleName="style.range_slider">
                        <Range
                            min={0} 
                            max={1.0} 
                            step={0.05} 
                            defaultValue={[0, 1.0]} 
                            tipFormatter={value => `${value}%`}
                            marks={{0.0:0.0, 0.25 : 0.25 ,0.5 : 0.5, 0.75:0.75, 1.0:1.0}}
                            onAfterChange={props.onIntervallChange}/>
                    </div>
                </Navbar.Form>
                <Navbar.Text pullLeft>
                #Filtered Images: {props.imgCount}
                </Navbar.Text>
                <Navbar.Form pullRight>
                    {(props.showGallery) ?
                    <Button styleName='style.action_btn' bsStyle="default" onClick={props.onViewModeChange}>
                        <Glyphicon glyph="stats" /> Global View
                    </Button> :
                    <Button styleName='style.action_btn' bsStyle="default" onClick={props.onViewModeChange}>
                        <Glyphicon glyph="th" /> Data Browser
                    </Button>}  
                </Navbar.Form>
                <Navbar.Form pullRight>
                    <label styleName="style.filtering_label">Show Detailed Analysis:</label>
                    <Button styleName='style.action_btn' bsStyle="primary" onClick={props.onAnalysisButtonClick} 
                                                                     disabled={props.selectedList.length != 1}>Explanation
                    </Button> 
                    <Button styleName='style.action_btn' bsStyle="primary" onClick={props.onAnalysisButtonClick} 
                                                                     disabled={props.selectedList.length != 2}>Comparison
                    </Button>
                </Navbar.Form>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Second_Navbar;