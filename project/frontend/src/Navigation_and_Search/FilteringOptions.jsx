import React from "react";
import {Navbar, Button, Glyphicon, label} from 'react-bootstrap';
import Select from 'react-select';
import Slider, { Range } from 'rc-slider';
import {config} from '../app_config';
import style from '../../public/css/FilteringOptions.css';

const getClasses = (labels) => {
    let classes = [];
    for (var class_entry in labels) {
        classes.push({value:class_entry, label:labels[class_entry]})
    }
    return classes;
};

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
                        <Range min={0} max={1.0} step={0.05} defaultValue={[0, 1.0]} marks={{0.0:0.0, 0.2 : 0.2 ,0.4 : 0.4, 0.6:0.6, 0.8:0.8, 1.0:1.0}}/>
                    </div>
                </Navbar.Form>
                <Navbar.Form pullRight>
                    <Button styleName='style.action_btn' bsStyle="default" onClick={props.onViewModeChange}>
                        <Glyphicon glyph="stats" /> Global View
                    </Button>   
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