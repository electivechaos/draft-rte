import {INLINE_STYLES} from "../utils/constants.js";
import React from "react";
import {StyleButton} from "./styleButton.js";
import style from "../App.css";

export  const InlineStyleControls = (props) => {
    let currentStyle = props.editorState.getCurrentInlineStyle();
    return (
        <div className={style.richEditorControls}>
            {INLINE_STYLES.map(type =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    icon={type.icon}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};