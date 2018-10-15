/* @flow */
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import {stateFromHTML} from 'draft-js-import-html';
import {stateToMarkdown} from 'draft-js-export-markdown';
import {stateFromMarkdown} from 'draft-js-import-markdown';
import {LinkDecorator} from "./decorators/link/decorator";


export default class EditorValue {
    _editorState;

    constructor(editorState) {
        this._editorState = editorState;
    }

    getEditorState() {
        return this._editorState;
    }

    setEditorState(editorState) {
        return (this._editorState === editorState) ? this : new EditorValue(editorState);
    }

    toString(format) {

        return toString(this.getEditorState(), format, null);
    }


static createEmpty(decorator = LinkDecorator) {
    let editorState = EditorState.createEmpty(decorator);
    return new EditorValue(editorState);
}

static createFromState(editorState) {
    return new EditorValue(editorState);
}

static createFromString(markup, format, decorator = LinkDecorator, options = null) {
    let contentState = fromString(markup, format, options);
    let editorState = EditorState.createWithContent(contentState, decorator);
    return new EditorValue(editorState);
}
}

function toString(editorState, format, options = null) {
    let contentState = editorState.getCurrentContent();
    switch (format) {
        case 'html': {
            return stateToHTML(contentState, options);
        }
        case 'markdown': {
            return stateToMarkdown(contentState);
        }
        case 'raw': {
            return JSON.stringify(convertToRaw(contentState));
        }
        default: {
            throw new Error('Format not supported: ' + format);
        }
    }
}

function fromString(markup, format, options = null) {
    switch (format) {
        case 'html': {
            return stateFromHTML(markup, options);
        }
        case 'markdown': {
            return stateFromMarkdown(markup, options);
        }
        case 'raw': {
            return convertFromRaw(JSON.parse(markup));
        }
        default: {
            throw new Error('Format not supported: ' + format);
        }
    }
}
