import React from "react";
import {fontSizeForBtn} from "../utils/constants";

import classnames from "classnames"
import  style from "../App.css"

export class MediaButton extends React.Component {
    constructor() {
        super();
        this.onButtonClick = (e) => {
            e.preventDefault();
            this.props.onMediaButtonClick(this.props.mediaType);
        };
    }

    render() {
        let className = classnames({

        });
        if (this.props.active && this.props.mediaType === "link") {
            className += ' richEditorActiveButton';
        } else {
            if (this.props.disabled) {
                className = className + ' ' + 'richEditorDisableButton';
            }
        }
        className = className + ' ' + this.props.icon;
        let fontSize = {
            fontSize: fontSizeForBtn
        };
        return (
            <i style={fontSize} title={this.props.label} className={className} onClick={this.onButtonClick}/>
        );
    }
}