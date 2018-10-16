import {UNDO_REDO_STYLES} from "../utils/constants";
import React from "react";
import {MediaButton} from "./mediaButton.js";
import classnames from "classnames"
import  style from "../App.css"
export const UndoRedoControls = (props) => {

    return (
        <div className={classnames(style.richEditorControls)}>
            {UNDO_REDO_STYLES.map(type =>
                <MediaButton
                    key={type.label}
                    label={type.label}
                    icon={type.icon}
                    active={false}
                    disabled={false}
                    mediaType={type.mediaType}
                    onMediaButtonClick={props.onMediaButtonClick}
                />
            )}
        </div>
    );
};