import React from "react";
import {fontSizeForBtn} from "../utils/constants";


export class MediaButton extends React.Component {
    constructor() {
        super();
        this.onButtonClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onMediaButtonClick(this.props.mediaType);
        };
    }

    render() {
        let className = '';
        if (this.props.active && this.props.mediaType === "link") {
            className += ' RichEditor-activeButton';
        } else {
            if (this.props.disabled) {
                className = className + ' RichEditor-disableButton';
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