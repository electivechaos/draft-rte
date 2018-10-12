import React from "react";

export class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }

    render() {
        let fontSize = {
            fontSize: "32px"
        };
        let className = '';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }
        className += ' ' + this.props.icon;
        return (
            <i style={fontSize} title={this.props.label} className={className} onMouseDown={this.onToggle}/>
        );
    }
}