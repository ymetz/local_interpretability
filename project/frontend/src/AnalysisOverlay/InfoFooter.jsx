import React from 'react';
import '../../public/css/InfoFooter.css';

const infoFooter = (props) => {

    if (props.method === 'lime')
        return(
            <div styleName='overlay_footer'>
                <p>This view provides an explanation image created by <b>LIME</b> (Local Interpretable Model-agnostic Explanations) 
                    as explained by Ribeiro, Sing and Guestrin (2016)</p>
            </div>
        )
    if (props.method === 'elrp')
        return(
            <div styleName='overlay_footer'>
                <p>This view provides an explanation image created by <b>LRP</b> (Layerwise-Relevance Propagation), initially described by Bach, Binder et. Al. (2015)</p>
            </div>
        )
    if (props.method === 'tcav')
        return(
            <div styleName='overlay_footer'>
                <p>This view provides an implementation of <b>TCAV</b> (Testing with Concept Activation Vectors), as described by Kim et. Al. (2017)</p>
            </div>
        )
}

export default infoFooter;

