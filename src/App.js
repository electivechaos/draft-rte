import React from 'react';
import {AtomicBlockUtils, Editor, EditorState, RichUtils,CompositeDecorator} from 'draft-js';
import './App.css'
import getEntityAtCursor from './getEntityAtCursor.js'
import decorateComponentWithProps from "decorate-component-with-props";
      class FloraEditor extends React.Component {
        constructor(props) {
          super(props);

        const decorator = new CompositeDecorator([
            {
                strategy: findLinkEntities,
                component: Link
            }
        ]);
          this.state = {editorState: EditorState.createEmpty(decorator)};
          this.focus = () => this.refs.editor.focus();
          this.onChange = (editorState) => this.setState({editorState});
          this.handleKeyCommand = (command) => this._handleKeyCommand(command);
          this.onTab = (e) => this._onTab(e);
          this.toggleBlockType = (type) => this._toggleBlockType(type);
          this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
          this.onButtonClick = (e) => this._onButtonClick(e);
          this.onImageClick = () => this._onImageClick();
          this.onLinkClick = () => this._onLinkClick();
          this.blockRendererFn = this.blockRendererFn.bind(this);
          this.getBlockStyle = this.getBlockStyle.bind(this);
        }
          _onButtonClick(type){
            if(type === "image"){
                this.onImageClick();
            }else  if(type === "link"){
               this.onLinkClick();
            }

          }

          _onImageClick() {

              const urlType = 'IMAGE';
              const contentState = this.state.editorState.getCurrentContent();
              const contentStateWithEntity = contentState.createEntity(urlType, 'IMMUTABLE', { src: "https://i.ytimg.com/vi/DNcvi7Vpha0/maxresdefault.jpg", width:"100px", height:"100px" });
              const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
              const newEditorState = AtomicBlockUtils.insertAtomicBlock(
                  this.state.editorState,
                  entityKey,
                  ' '
              );
              this.onChange( EditorState.forceSelection(
                  newEditorState,
                  newEditorState.getCurrentContent().getSelectionAfter()
              ));
          }

          _onLinkClick() {

            const selection = this.state.editorState.getSelection();

            let entity = getEntityAtCursor(this.state.editorState);
            if(!entity){
                const contentState = this.state.editorState.getCurrentContent();
                const contentStateWithEntity = contentState.createEntity(
                    'LINK',
                    'MUTABLE',
                    {url: "www.facebook.com"}
                );

                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const newEditorState = EditorState.set(this.state.editorState, { currentContent: contentStateWithEntity });
                this.setState({
                    editorState: RichUtils.toggleLink(
                        newEditorState,
                        newEditorState.getSelection(),
                        entityKey
                    )});
            }else{
                this.setState({
                    editorState: RichUtils.toggleLink(
                        this.state.editorState,
                        selection,
                        null
                    )});
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
              <BlockStyleControls
                editorState={editorState}
                onToggle={this.toggleBlockType}
              />
              <InlineStyleControls
                editorState={editorState}
                onToggle={this.toggleInlineStyle}
              />
                <MediaControls
                    editorState={editorState}
                    onButtonClick={this.onButtonClick}
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
      // Custom overrides for "code" style.
      const styleMap = {
        // CODE: {
        //   backgroundColor: 'rgba(0, 0, 0, 0.05)',
        //   fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        //   fontSize: 16,
        //   padding: 2,
        // },
      };


      class StyleButton extends React.Component {
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
            className += ' '+this.props.icon;
          return (
            <i style={fontSize} title={this.props.label} className={className} onMouseDown={this.onToggle}/>
          );
        }
      }
      const BLOCK_TYPES = [
          {label: 'Blockquote', style: 'blockquote', icon: 'fa fa-quote-left'},
          {label: 'UL', style: 'unordered-list-item', icon: 'fas fa-list-ul'},
          {label: 'OL', style: 'ordered-list-item', icon: 'fa fa-list-ol'},
          {label: 'Code Block', style: 'code-block', icon: 'fas fa-code'},
      ];

      const BlockStyleControls = (props) => {
        const {editorState} = props;
        const selection = editorState.getSelection();
        const blockType = editorState
          .getCurrentContent()
          .getBlockForKey(selection.getStartKey())
          .getType();

        return (
          <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
              <StyleButton
                key={type.label}
                active={type.style === blockType}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
                icon={type.icon}
              />
            )}
          </div>
        );
      };
      let INLINE_STYLES = [
        {label: 'Bold', style: 'BOLD',icon:'fas fa-bold'},
        {label: 'Italic', style: 'ITALIC',icon:'fas fa-italic'},
        {label: 'Underline', style: 'UNDERLINE',icon:'fas fa-underline'},
      ];

      const InlineStyleControls = (props) => {
        let currentStyle = props.editorState.getCurrentInlineStyle();
        return (
          <div className="RichEditor-controls">
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

let MEDIA_CONTROLS = [
    {label: 'Image', icon:'far fa-image', mediaType: "image"},
    {label: 'Link', icon:'fas fa-link', mediaType: "link"}
];

const MediaControls = (props) => {
    let selection = props.editorState.getSelection();
    let hasSelection = !selection.isCollapsed();
    let isCursorOnLink = false;

    if(getEntityAtCursor(props.editorState)) {

        let {entityKey} = getEntityAtCursor(props.editorState);


        let contentState = props.editorState.getCurrentContent();
        let entity = contentState.getEntity(entityKey);

        isCursorOnLink = (entity !== null && entity.type === "LINK");
    }
    let shouldActiveLinkButton = hasSelection && isCursorOnLink;
    let shouldDisableLinkButton = !hasSelection;

    return (
        <div className="RichEditor-controls">
            {MEDIA_CONTROLS.map(type =>
                <MediaButton
                    key={type.label}
                    label={type.label}
                    icon={type.icon}
                    active={type.mediaType === "link" &&  shouldActiveLinkButton}
                    disabled={type.mediaType === "link" &&  shouldDisableLinkButton}
                    mediaType={type.mediaType}
                    onButtonClick={props.onButtonClick}
                />
            )}
        </div>
    );
};

class MediaButton extends React.Component {
    constructor() {
        super();
        this.onButtonClick = (e) => {
            e.preventDefault();
            this.props.onButtonClick(this.props.mediaType);
        };
    }

    render() {
        let className = '';
        if (this.props.active && this.props.mediaType === "link") {
            className += ' RichEditor-activeButton';
        }else{
            if(this.props.disabled){
                className = className+ ' '+'RichEditor-disableButton';
            }
        }
        className = className +' '+ this.props.icon;
        let fontSize = {
            fontSize: "32px"
        };
        return (
            <i style={fontSize} title={this.props.label} className={className} onClick={this.onButtonClick}/>
        );
    }
}

const Image = (props) => {
    return <img src={props.src}  alt="Imported" width={props.width} height={props.height}/>;
};

function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'LINK'
            );
        },
        callback
    );
}
const Link = (props) => {
    const {url} = props.contentState.getEntity(props.entityKey).getData();
    let styles = {
        link: {
            color: '#3b5998',
            textDecoration: 'underline',
        }
    };

    return (
        <a href={url} style={styles.link}>
            {props.children}
        </a>
    );
};




export default FloraEditor;


