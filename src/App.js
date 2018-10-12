import React from 'react';
import {AtomicBlockUtils, Editor, EditorState, RichUtils} from 'draft-js';
import './App.css'
import getEntityAtCursor from './utils/getEntityAtCursor.js'
import decorateComponentWithProps from "decorate-component-with-props";
import {LinkDecorator} from "./decorators/link/decorator.js";
import {InlineStyleControls} from "./ui/inlineStyleControls.js";
import {BlockStyleControls} from "./ui/blockStyleControls.js";
import {MediaControls} from "./ui/mediaControls.js";

class FloraEditor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {editorState: EditorState.createEmpty(LinkDecorator)};
        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({editorState});
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.onTab = (e) => this._onTab(e);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.onMediaButtonClick = (e) => this._onMediaButtonClick(e);
        this.onImageClick = () => this._onImageClick();
        this.onLinkClick = () => this._onLinkClick();
        this.blockRendererFn = this.blockRendererFn.bind(this);
        this.getBlockStyle = this.getBlockStyle.bind(this);
    }

    _onMediaButtonClick(type) {
        if (type === "image") {
            this.onImageClick();
        } else if (type === "link") {
            this.onLinkClick();
        }

    }

    _onImageClick() {
        const contentState = this.state.editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', {
            src: "https://i.ytimg.com/vi/DNcvi7Vpha0/maxresdefault.jpg",
            width: "100px",
            height: "100px"
        });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        );
        this.onChange(EditorState.forceSelection(
            newEditorState,
            newEditorState.getCurrentContent().getSelectionAfter()
        ));
    }

    /*Here we get the entity at the current cursor position
    If null means no entity is present so we can add the link entity else remove it*/
    _onLinkClick() {

        const selection = this.state.editorState.getSelection();

        let entity = getEntityAtCursor(this.state.editorState);
        if (!entity) {
            const contentState = this.state.editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity(
                'LINK',
                'MUTABLE',
                {url: "www.facebook.com"}
            );

            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const newEditorState = EditorState.set(this.state.editorState, {currentContent: contentStateWithEntity});
            this.setState({
                editorState: RichUtils.toggleLink(
                    newEditorState,
                    newEditorState.getSelection(),
                    entityKey
                )
            });
        } else {
            this.setState({
                editorState: RichUtils.toggleLink(
                    this.state.editorState,
                    selection,
                    null
                )
            });
        }


    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _onTab(e) {
        const maxDepth = 4;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    render() {


        const {editorState} = this.state;
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        let contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }
        return (
            <div className="RichEditor-root">

                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <MediaControls
                    editorState={editorState}
                    onMediaButtonClick={this.onMediaButtonClick}
                />
                <div className={className} onClick={this.focus}>
                    <Editor
                        blockRendererFn={this.blockRendererFn}
                        blockStyleFn={this.getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        onTab={this.onTab}
                        placeholder="Enter your comment here..."
                        ref="editor"
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }

    blockRendererFn(block) {

        if (block.getType() === 'atomic') {
            const contentState = this.state.editorState.getCurrentContent();
            const entitykey = block.getEntityAt(0);
            if (!entitykey) return null;
            const type = contentState.getEntity(entitykey).getType();
            const entityData = contentState.getEntity(entitykey).getData();

            if (type === 'IMAGE' || type === 'image') {
                const DecoratedImageComponent = decorateComponentWithProps(Image, entityData);
                return {
                    component: DecoratedImageComponent,
                    editable: false,

                };
            }
            return null;
        }

        return null;
    }

    getBlockStyle(block) {
        switch (block.getType()) {
            case 'blockquote':
                return 'RichEditor-blockquote';
            case 'code-block':
                return 'RichEditor-code-block';
            case 'atomic':
                const contentState = this.state.editorState.getCurrentContent();
                const entitykey = block.getEntityAt(0);
                if (!entitykey) return null;
                const type = contentState.getEntity(entitykey).getType();
                if (type === 'IMAGE' || type === 'image') {
                    return 'RichEditor-image-container';
                }
                break;
            default:
                return null;
        }
    }
}


const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};

const Image = (props) => {
    return <img src={props.src} alt="Imported" width={props.width} height={props.height}/>;
};
export default FloraEditor;


