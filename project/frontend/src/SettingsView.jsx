import React from "react";
import {Button, Glyphicon, FormControl, FormGroup} from 'react-bootstrap';
import ReactModal from 'react-modal';
import ConceptTreeView from './ConceptTreeView'
import {config} from './app_config';
import '../public/css/SettingsView.css';  

const SettingsView = (props) => {

    return (
        <ReactModal
            isOpen={true}
            contentLabel="onRequestClose Settings"
            style={{overlay:{zIndex:1050}}}>
                <div>
                    <h2>Settings
                    <Button styleName="close_button" onClick={props.close_it}><Glyphicon glyph="remove" /></Button>
                    </h2>
                    <hr></hr>
                </div>
                <div>
                    <h3>General</h3>
                    <p>General Settings</p>
                    <h3>LIME</h3>
                    <p>Lime settings</p>
                    <h3>LRP</h3>
                    <p>LRP settings</p>
                    <h3>TCAV</h3>
                    <FormGroup>
                        Examine & Modify available TCAV
                        <Button 
                            styleName='action_btn' 
                            bsStyle="default">
                            <Glyphicon glyph="menu-down"/> Expand Tree
                        </Button>
                    </FormGroup>
                    {props.appSettings.show_tcav_tree ? 
                        <ConceptTreeView conceptData={props.conceptHierarchy}/>
                    : null}
                </div>
        </ReactModal>
    )
};

export default SettingsView;