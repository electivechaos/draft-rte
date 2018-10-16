import getEntityAtCursor from "../utils/getEntityAtCursor";
import {MEDIA_CONTROLS} from "../utils/constants";
import React from "react";
import {MediaButton} from "./mediaButton.js";
import classnames from "classnames"
import  style from "../App.css"

export const MediaControls = (props) => {
    let selection = props.editorState.getSelection();
    let hasSelection = !selection.isCollapsed();
    let isCursorOnLink = false;

    if (getEntityAtCursor(props.editorState)) {
        let {entityKey} = getEntityAtCursor(props.editorState);
        let contentState = props.editorState.getCurrentContent();
        let entity = contentState.getEntity(entityKey);
        isCursorOnLink = (entity !== null && entity.type === "LINK");
    }
    let shouldActiveLinkButton = hasSelection && isCursorOnLink;
    let shouldDisableLinkButton = !hasSelection;

    return (
        <div className={style.richEditorControls}>
            {MEDIA_CONTROLS.map(type =>
                <MediaButton
                    key={type.label}
                    label={type.label}
                    icon={type.icon}
                    active={type.mediaType === "link" && shouldActiveLinkButton}
                    disabled={type.mediaType === "link" && shouldDisableLinkButton}
                    mediaType={type.mediaType}
                    onMediaButtonClick={props.onMediaButtonClick}
                />
            )}
        </div>
    );
};