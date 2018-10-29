import React from 'react';
import {AtomicBlockUtils, convertFromRaw, Editor, EditorState, RichUtils} from 'draft-js';
import './App.css'
import getEntityAtCursor from './utils/getEntityAtCursor.js'
import decorateComponentWithProps from "decorate-component-with-props";
import {LinkDecorator} from "./decorators/link/decorator.js";
import {InlineStyleControls} from "./ui/inlineStyleControls.js";
import {BlockStyleControls} from "./ui/blockStyleControls.js";
import {MediaControls} from "./ui/mediaControls.js";
import {UndoRedoControls} from "./ui/undoRedoControls";
import {stateFromHTML} from "draft-js-import-html";

import {stateFromMarkdown} from 'draft-js-import-markdown'
import EditorValue from "./editorValue";
import {RTE_DEFAULT_CONFIG} from "./utils/constants";

class RichTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty(LinkDecorator)};
        this.rteConfig = this.props.rteConfig || RTE_DEFAULT_CONFIG;
        this.focus = () => this.refs.editor.focus();
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
        this.onImageDimensionUpdate = (data) => this._onImageDimensionUpdate(data);
    }


    static createEmptyValue(){
        let editorState = EditorState.createEmpty(LinkDecorator);
        return  new EditorValue(editorState);
    }
    static createValueFromString(markup, format) {
        let contentState = fromString(markup, format, null);
        let editorState = EditorState.createWithContent(contentState, LinkDecorator);
        return new EditorValue(editorState);
    }
    static createValueFromJson(rawContent) {

        if(rawContent){
            const rawContentFromDb = convertFromRaw(JSON.parse(rawContent));
            if(rawContentFromDb){
                return new EditorValue(EditorState.createWithContent(rawContentFromDb,LinkDecorator));
            }
        }
        return new EditorValue(EditorState.createEmpty(LinkDecorator));

    }


    _onImageDimensionUpdate(data) {
        console.log("data",data);
        const entityKey = data.contentBlock.getEntityAt(0);
        if (entityKey) {
            console.log("entityKey",entityKey);
            const editorState = this.state.editorState;
            const contentState = editorState.getCurrentContent();
            contentState.mergeEntityData(entityKey, data.pos);
            this.onChange(EditorState.forceSelection(editorState, editorState.getSelection()));
        }
    }
    _onChange(editorState){
        this.setState({
            editorState
        });
        if(this.props.onChange){
            this.props.onChange(new EditorValue(editorState));
        }
    }
    _onMediaButtonClick(type) {
        if (type === "image") {
            this._onImageClick("https://images.pexels.com/photos/257360/pexels-photo-257360.jpeg?auto=compress&cs=tinysrgb&h=350","https://images.pexels.com/photos/257360/pexels-photo-257360.jpeg?auto=compress&cs=tinysrgb&h=350","Image","https://images.pexels.com/photos/257360/pexels-photo-257360.jpeg?auto=compress&cs=tinysrgb&h=350");
            if(this.props.onMediaButtonClick){
                this.props.onMediaButtonClick("Image");
            }
        } else if (type === "video") {
            if(this.props.onMediaButtonClick) {
                this.props.onMediaButtonClick("Video");
            }
        } else if (type === "audio") {
            if(this.props.onMediaButtonClick) {
                this.props.onMediaButtonClick("Audio");
            }
        } else if (type === "document") {
            if(this.props.onMediaButtonClick) {
                this.props.onMediaButtonClick("Document");
            }
        } else if (type === "video-link") {
            if(this.props.onMediaButtonClick) {
                this.props.onMediaButtonClick("Link");
            }
        } else if (type === "link") {
            this.onLinkClick();
        } else if(type === "undo"){
            this.undo();
        } else if(type === "redo"){
            this.redo();
        }

    }
    _undo() {

        this.onChange(
            EditorState.undo(this.state.editorState)
        );
    }
    _redo() {
        this.onChange(
            EditorState.redo(this.state.editorState)
        );
    }
    _onImageClick(contentUrl, playerUrl,type,viewURI) {
        const contentState = this.state.editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', {
            src: contentUrl,
            width: "100px",
            height: "100px",
            "data-type": type,
            "data-player-url": playerUrl,
            "data-view-uri":viewURI
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

    }
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

    }
    /*Here we get the entity at the current cursor position
    If null means no entity is present so we can add the link entity else remove it*/
    _onLinkClick() {

        const selection = this.state.editorState.getSelection();

        let entity = getEntityAtCursor(this.state.editorState);
        if (!entity) {

            let linkPromptOutput = prompt("Please enter valid link url", "");
            if (linkPromptOutput != null && isValidURL(linkPromptOutput)) {
                const contentState = this.state.editorState.getCurrentContent();
                const contentStateWithEntity = contentState.createEntity(
                    'LINK',
                    'MUTABLE',
                    {url: linkPromptOutput}
                );

                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const newEditorState = EditorState.set(this.state.editorState, {currentContent: contentStateWithEntity});
                this.onChange(
                    RichUtils.toggleLink(
                        newEditorState,
                        newEditorState.getSelection(),
                        entityKey
                    )
                );
            }
        } else {
            this.onChange(
                RichUtils.toggleLink(
                    this.state.editorState,
                    selection,
                    null
                )
            );
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


        let {editorState} = this.state;

        const value = this.props.value;
        if(value){
            editorState = value.getEditorState();
        }
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
                    rteConfig={this.rteConfig}
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <MediaControls
                    rteConfig={this.rteConfig}
                    editorState={editorState}
                    onMediaButtonClick={this.onMediaButtonClick}
                />
                <BlockStyleControls
                    rteConfig={this.rteConfig}
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <UndoRedoControls
                    rteConfig={this.rteConfig}
                    editorState={editorState}
                    onMediaButtonClick={this.onMediaButtonClick}/>

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
                {/*<div id="htmlString" >*/}
                {/*</div>*/}
            </div>
        );
    }

    blockRendererFn(block) {

        if (block.getType() === 'atomic') {
            const contentState = this.state.editorState.getCurrentContent();
            const entityKey = block.getEntityAt(0);
            if (!entityKey) return null;
            const type = contentState.getEntity(entityKey).getType();
            const entityData = contentState.getEntity(entityKey).getData();
            entityData.onImageDimensionUpdate = this.onImageDimensionUpdate;
            if (type === 'IMAGE' || type === 'image' || type === 'AUDIO' || type === 'audio' || type === 'VIDEO' || type === 'video') {
                const DecoratedImageComponent = decorateComponentWithProps(Image, entityData);
                return {
                    component: DecoratedImageComponent,
                    editable: false

                };
            }
            //  else if (type === 'VIDEO' || type === 'video') {
            //
            //      if(entityData.src.indexOf(".mpd") > 0){
            //          const DecoratedVideoComponent = decorateComponentWithProps(Video, entityData);
            //          return {
            //              component: DecoratedVideoComponent,
            //              editable: false,
            //
            //          };
            //      }else{
            //          const DecoratedVideoComponent = decorateComponentWithProps(YouTubeVideo, entityData);
            //          return {
            //              component: DecoratedVideoComponent,
            //              editable: false,
            //
            //          };
            //      }
            //
            // }
            //     else if (type === 'AUDIO' || type === 'audio') {
            //     const DecoratedAudioComponent = decorateComponentWithProps(Audio, entityData);
            //     return {
            //         component: DecoratedAudioComponent,
            //         editable: false,
            //
            //     };
            // }
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

// const Image = (props) => {
//
// };

function roundedMaxVal(val) {
    return Math.round(Math.max(0, val));
}

class  Image extends React.Component{
    constructor(props) {

        console.log("IMAGE, component props",props);
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
        this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
        this.startPosition = {
            width: -1,
            height: -1,
            x: -1,
            y: -1
        }
    }

    onMouseDown(e){
        document.addEventListener("mousemove",this.onDocumentMouseMove, false);
        this.startPosition = {
            width: e.target.width,
            height: e.target.height,
            x: e.clientX,
            y: e.clientY
        };
        if(this.startPosition.width === undefined || isNaN(this.startPosition.width)){
            this.startPosition.width = e.target.offsetWidth;
        }
        if(this.startPosition.height === undefined || isNaN(this.startPosition.height)){
            this.startPosition.height = e.target.offsetHeight;
        }
    }

    onDocumentMouseUp(event){
        event.stopPropagation();
        event.preventDefault();
        document.removeEventListener("mousemove",this.onDocumentMouseMove);
    }

    onDocumentMouseMove(event){
        event.stopPropagation();
        event.preventDefault();

        let pos = {
            width: Math.max(0, this.startPosition.width + (event.clientX - this.startPosition.x)),
            height: Math.max(0, this.startPosition.height + (event.clientY - this.startPosition.y))
        };
        this.props.onImageDimensionUpdate({pos:pos,contentBlock:this.props.block});
    }



    componentDidMount(){
        document.addEventListener("mouseup",this.onDocumentMouseUp, false);
    }
    render(){
        const  dataPlayerUrl = this.props["data-player-url"];
        const  dataType = this.props["data-type"];
        return <img  onMouseDown={(e) => this.onMouseDown(e)} src={this.props.src} alt="Thumb for content" data-player-url={dataPlayerUrl} data-type={dataType} width={this.props.width} height={this.props.height} />;
    }

}
// const Video = (props) => {
//     return(<video controls={true}>
//     <source src={props.src} type="video" />
//     </video>);
// };
// const YouTubeVideo = (props) => {
//     return(<iframe src={props.src}></iframe>);
// };
// const Audio = (props) => {
//   return (<audio controls={true} src={props.src}></audio>);
// };


function fromString(markup, format, options) {
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

/**
 * @return {boolean}
 */
function isValidURL(str) {
    let pattern = new RegExp('^((https?:)?\\/\\/)?'+ // protocol
        '(?:\\S+(?::\\S*)?@)?' + // authentication
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
    if (!pattern.test(str)) {
        return false;
    } else {
        return true;
    }
}
export default RichTextEditor;


