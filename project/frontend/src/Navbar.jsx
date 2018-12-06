import React from "react";
import {Navbar} from 'react-bootstrap';
import {config} from './app_config'; 

const navbar = (props) => {
    return (
        <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                <a href="#home">{config.app_name}</a>
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

export default navbar;