import React from "react";


class DropDown extends React.Component {

    onToggle = (event) => {
        let value = event.target.value
        this.props.onToggle(value)
    }
    render() {
        let className = "richEditorStyleButton";
        if (this.props.active) {
            className += " richEditorActiveButton";
        }
        return (
        <select className={'richEditorSelectDropDown'} value={this.props.active} onChange={this.onToggle}>
        <option value=''>Normal</option>
            {this.props.options.map((option) => {
                return <option key={option.style} className={this.props.active === option.style ? className : ''} value={option.style}>{option.label}</option>
            })}
        </select>
        )
    }
}

export default DropDown;