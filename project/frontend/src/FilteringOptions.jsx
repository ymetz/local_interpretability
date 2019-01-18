import React from "react";
import {Navbar, Button, FormControl, FormGroup} from 'react-bootstrap';
import Select from 'react-select';
import Slider, { Range } from 'rc-slider';
import {config} from './app_config';
import style from '../public/css/FilteringOptions.css';
import rc_style from 'rc-slider/assets/index.css'; 

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
                        className="style.basic-multi-select"
                        classNamePrefix="style.select"
                        styleName="style.class_select"
                    />
                </Navbar.Form>
                <Navbar.Form pullLeft>
                    <div>
                        <Slider styleName='rc_style.rc-slider' />
                        <Range />
                    </div>
                </Navbar.Form>
                <Navbar.Form pullRight>
                    <Button styleName='style.action_btn' bsStyle="primary" onClick={props.onAnalysisButtonClick} 
                                                                     disabled={props.selectedList.filter(im => im.selected).length != 1}>Explanation
                    </Button> 
                    <Button styleName='style.action_btn' bsStyle="primary" onClick={props.onAnalysisButtonClick} 
                                                                     disabled={props.selectedList.filter(im => im.selected).length != 2}>Comparison
                    </Button>
                </Navbar.Form>
                <Navbar.Text pullRight>Show Detailed Analysis:</Navbar.Text>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Second_Navbar;