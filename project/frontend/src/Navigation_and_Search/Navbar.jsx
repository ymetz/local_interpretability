import React from "react";
import {Navbar, Button, Glyphicon, FormControl, FormGroup} from 'react-bootstrap';
import Select from 'react-select';
import {config} from '../app_config';
import '../../public/css/Navbar.css';  


const TopNavbar = (props) => {
    return (
        <Navbar fixedTop inverse styleName='top_navbar'>
            <Navbar.Header>
                <Navbar.Brand>
                <a href="/">{config.app_name}</a>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Navbar.Text>
                Dataset Name: <Navbar.Link href="#">{props.dataset_name+' '}</Navbar.Link>
                <span className="glyphicon glyphicon-picture" aria-hidden="true"></span>
                </Navbar.Text>
                <Navbar.Text>
                #Elements: {props.num_elements}
                </Navbar.Text>
                <Navbar.Text>
                Dataset Path: <Navbar.Link href="#">{props.dataset_path}</Navbar.Link>
                </Navbar.Text>
                <Navbar.Text pullRight>Demo v{config.version_number}</Navbar.Text>
            </Navbar.Collapse>
        </Navbar>
    );
};



export default TopNavbar;

/*
                <Navbar.Form pullRight>
                    <Button styleName='action_btn' bsStyle="default" onClick={props.onSettingButtonClick}>
                        <span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
                    </Button>
                </Navbar.Form>*/