import React from 'react';
import {
    AtomicBlockUtils,
    Editor,
    EditorState,
    RichUtils,
    convertFromRaw
} from 'draft-js';
import style from './App.css'
import getEntityAtCursor from './utils/getEntityAtCursor.js'
import decorateComponentWithProps from "decorate-component-with-props";
import {
    LinkDecorator
} from "./decorators/link/decorator.js";
import {
    InlineStyleControls
} from "./ui/inlineStyleControls.js";
import {
    BlockStyleControls
} from "./ui/blockStyleControls.js";
import {
    MediaControls
} from "./ui/mediaControls.js";
import {
    stateToHTML
} from 'draft-js-export-html';
import {
    UndoRedoControls
} from "./ui/undoRedoControls";
import {
    stateFromHTML
} from "draft-js-import-html";

import {
    stateFromMarkdown
} from 'draft-js-import-markdown'
import EditorValue from "./editorValue";

class RichTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(LinkDecorator),
            showURLInput: false,
            urlValue: ""
        };
        this.onChange = (editorState) => this._onChange(editorState);
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.onTab = (e) => this._onTab(e);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.onMediaButtonClick = (e) => this._onMediaButtonClick(e);
        this.onImageClick = () => this._onImageClick();
        this.onVideoClick = () => this._onVideoClick();
        this.onAudioClick = () => this._onAudioClick();
        this.onLinkClick = () => this._onLinkClick();
        this.blockRendererFn = this.blockRendererFn.bind(this);
        this.getBlockStyle = this.getBlockStyle.bind(this);
        this.undo = () => this._undo();
        this.redo = () => this._redo();
        this.onURLChange = e => this.setState({
            urlValue: e.target.value
        });
        this.confirmLink = this._confirmLink.bind(this);
        this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
    }



    _onLinkInputKeyDown(e) {
        if (e.which === 13) {
            this._confirmLink(e);
        }
    }

    static createEmptyValue() {
        let editorState = EditorState.createEmpty(LinkDecorator);
        return new EditorValue(editorState);
    }
    static createValueFromString(markup, format) {
        let contentState = fromString(markup, format, null);
        let editorState = EditorState.createWithContent(contentState, LinkDecorator);
        return new EditorValue(editorState);
    }

    _confirmLink(e) {
        e.preventDefault();
        const {
            editorState,
            urlValue
        } = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            "LINK",
            "MUTABLE", {
                url: urlValue
            }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, {
            currentContent: contentStateWithEntity
        });
        this.setState({
                editorState: RichUtils.toggleLink(
                    newEditorState,
                    newEditorState.getSelection(),
                    entityKey
                ),
                showURLInput: false,
                urlValue: ""
            },

        );
    }

    _onChange(editorState) {
        this.setState({
            editorState
        });
        let contentState = editorState.getCurrentContent();
        console.log(new EditorValue(editorState).toString('html'));
        if (this.props.onChange) {
            console.log(new EditorValue(editorState).toString('html'));
            this.props.onChange(new EditorValue(editorState));
        }
        document.getElementById("htmlString").innerHTML = stateToHTML(contentState, null);
    } // render html fn

    _onMediaButtonClick(type) {
        if (type === "image") {
            this.onImageClick();
        } else if (type === "video") {
            this.onVideoClick();
        } else if (type === "audio") {
            this.onAudioClick();
        } else if (type === "link") {
            this.onLinkClick();
        } else if (type === "undo") {
            this.undo();
        } else if (type === "redo") {
            this.redo();
        }

    } // check type and call that fn 

    _undo() {

        this.onChange(
            EditorState.undo(this.state.editorState)
        );
    } // undo fn

    _redo() {
        this.onChange(
            EditorState.redo(this.state.editorState)
        );
    } // redo fn

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
    } // onImage fn

    _onVideoClick() {

        const contentState = this.state.editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('VIDEO', 'IMMUTABLE', {
            src: "https://www.youtube.com/embed/wwNZKfBLAsc",
            width: "300px",
            height: "auto"
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

    } // OnVideo Fn

    _onAudioClick() {

        const contentState = this.state.editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('AUDIO', 'IMMUTABLE', {
            src: "http://www.largesound.com/ashborytour/sound/brobob.mp3",
            width: "300px",
            height: "auto"
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

    } // onAudio Fn
    /*Here we get the entity at the current cursor position
    If null means no entity is present so we can add the link entity else remove it*/

    _onLinkClick() {
        const {
            editorState
        } = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            const contentState = editorState.getCurrentContent();
            const startKey = editorState.getSelection().getStartKey();
            const startOffset = editorState.getSelection().getStartOffset();
            const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
            const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
            let url = "";
            if (linkKey) {
                const linkInstance = contentState.getEntity(linkKey);
                url = linkInstance.getData().url;
            }
            this.setState({
                    editorState: RichUtils.toggleLink(editorState, selection, null),

                    showURLInput: true,
                    urlValue: url
                },

            );
        }

    } // On link button 





    _handleKeyCommand(command) {
        const {
            editorState
        } = this.state;
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

        let urlInput;
        if (this.state.showURLInput) {
            urlInput = ( <
                div style = {
                    styles.urlInputContainer
                } >
                <
                input onChange = {
                    this.onURLChange
                }
                ref = "url"
                style = {
                    styles.urlInput
                }
                type = "text"
                value = {
                    this.state.urlValue
                }
                onKeyDown = {
                    this.onLinkInputKeyDown
                }
                /> <
                button onMouseDown = {
                    this.confirmLink
                } > Confirm < /button> <
                /div>
            );
        }
        let {
            editorState
        } = this.state;
        const value = this.props.value;
        if (value) {
            editorState = value.getEditorState();
        }
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = style["richEditorEditor"];
        let contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' richEditorHidePlaceholder';
            }
        }
        return ( <
            div className = "richEditorRoot" >

            <
            InlineStyleControls editorState = {
                editorState
            }
            onToggle = {
                this.toggleInlineStyle
            }
            />

            <
            MediaControls editorState = {
                editorState
            }
            onMediaButtonClick = {
                this.onMediaButtonClick
            }
            /> <
            BlockStyleControls editorState = {
                editorState
            }
            onToggle = {
                this.toggleBlockType
            }
            /> <
            UndoRedoControls editorState = {
                editorState
            }
            onMediaButtonClick = {
                this.onMediaButtonClick
            }
            />

            <
            div className = {
                className
            }
            onClick = {
                this.focus
            } >
            <
            div style = {
                styles.buttons
            } >

            <
            /div> {
                urlInput
            } <
            Editor blockRendererFn = {
                this.blockRendererFn
            }
            blockStyleFn = {
                this.getBlockStyle
            }
            customStyleMap = {
                styleMap
            }
            editorState = {
                editorState
            }
            handleKeyCommand = {
                this.handleKeyCommand
            }
            onChange = {
                this.onChange
            }
            onTab = {
                this.onTab
            }
            placeholder = "Enter your comment here..."
            // ref="editor"
            spellCheck = {
                true
            }
            /> <
            /div> <
            div id = "htmlString" >
            <
            /div> <
            /div>
        );
    }

    blockRendererFn(block) {

        if (block.getType() === 'atomic') {
            const contentState = this.state.editorState.getCurrentContent();
            const entityKey = block.getEntityAt(0);
            if (!entityKey) return null;
            const type = contentState.getEntity(entityKey).getType();
            const entityData = contentState.getEntity(entityKey).getData();

            if (type === 'IMAGE' || type === 'image') {
                const DecoratedImageComponent = decorateComponentWithProps(Image, entityData);
                return {
                    component: DecoratedImageComponent,
                    editable: false,

                };
            } else if (type === 'VIDEO' || type === 'video') {

                if (entityData.src.indexOf(".mpd") > 0) {
                    const DecoratedVideoComponent = decorateComponentWithProps(Video, entityData);
                    return {
                        component: DecoratedVideoComponent,
                        editable: false,

                    };
                } else {
                    const DecoratedVideoComponent = decorateComponentWithProps(YouTubeVideo, entityData);
                    return {
                        component: DecoratedVideoComponent,
                        editable: false,

                    };
                }

            } else if (type === 'AUDIO' || type === 'audio') {
                const DecoratedAudioComponent = decorateComponentWithProps(Audio, entityData);
                return {
                    component: DecoratedAudioComponent,
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
                return 'richEditorBlockQuote';
            case 'code-block':
                return 'richEditorCodeBlock';
            case 'atomic':
                const contentState = this.state.editorState.getCurrentContent();
                const entityKey = block.getEntityAt(0);
                if (!entityKey) return null;
                const type = contentState.getEntity(entityKey).getType();
                if (type === 'IMAGE' || type === 'image') {
                    return 'richEditorImageContainer';
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
    return <img src = {
        props.src
    }
    alt = "Image"
    width = {
        props.width
    }
    height = {
        props.height
    }
    />;
};
const Video = (props) => {
        return ( < video controls = {
                true
            } >
            <
            source src = {
                props.src
            }
            type = "video" / >
            <
            /video>);
        };
        const YouTubeVideo = (props) => {
                return ( < iframe src = {
                        props.src
                    }
                    />);
                };
                const Audio = (props) => {
                        return ( < audio controls = {
                                true
                            }
                            src = {
                                props.src
                            }
                            />);
                        };


                        function fromString(markup, format, options) {
                            switch (format) {
                                case 'html':
                                    {
                                        return stateFromHTML(markup, options);
                                    }
                                case 'markdown':
                                    {
                                        return stateFromMarkdown(markup, options);
                                    }
                                case 'raw':
                                    {
                                        return convertFromRaw(JSON.parse(markup));
                                    }
                                default:
                                    {
                                        throw new Error('Format not supported: ' + format);
                                    }
                            }
                        }

                        function findLinkEntities(contentBlock, callback, contentState) {
                            contentBlock.findEntityRanges(character => {
                                const entityKey = character.getEntity();
                                return (
                                    entityKey !== null &&
                                    contentState.getEntity(entityKey).getType() === "LINK"
                                );
                            }, callback);
                        }
                        const Link = props => {
                            const {
                                url
                            } = props.contentState.getEntity(props.entityKey).getData();
                            return ( <
                                a href = {
                                    url
                                }
                                style = {
                                    styles.link
                                } > {
                                    props.children
                                } <
                                /a>
                            );
                        };
                        const styles = {
                            root: {
                                fontFamily: "'Georgia', serif",
                                padding: 20,
                                width: 600
                            },
                            buttons: {
                                marginBottom: 10
                            },
                            urlInputContainer: {
                                marginBottom: 10
                            },
                            urlInput: {
                                fontFamily: "'Georgia', serif",
                                marginRight: 10,
                                padding: 3
                            },
                            editor: {
                                border: "1px solid #ccc",
                                cursor: "text",
                                minHeight: 80,
                                padding: 10
                            },
                            button: {
                                marginTop: 10,
                                textAlign: "center"
                            },
                            link: {
                                color: "#3b5998",
                                textDecoration: "underline"
                            }
                        };
                        export default RichTextEditor;