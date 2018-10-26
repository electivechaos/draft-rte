import React from "react";
import {MediaButton} from "./mediaButton.js";

export const UndoRedoControls = (props) => {

    return (
        <div className="RichEditor-controls">
            {props.rteConfig.UNDO_REDO_STYLES.map(type =>
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