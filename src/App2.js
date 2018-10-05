import React from 'react';
import {Editor, EditorState,RichUtils,AtomicBlockUtils} from 'draft-js';
import './App2.css'
import  'draft-js/dist/Draft.css'
import decorateComponentWithProps from 'decorate-component-with-props';
import {DefaultDraftBlockRenderMap} from 'draft-js';
import {Map} from 'immutable';
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {editorState: EditorState.createEmpty()};
        this.onChange = (editorState) => this.setState({editorState});
        this.blockRendererFn = this.blockRendererFn.bind(this);
        this.myBlockStyleFn = this.myBlockStyleFn.bind(this);
        this.blockRenderMap = DefaultDraftBlockRenderMap.merge(
            this.customBlockRendering(props)
        );
    }
    _onBoldClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
    }

    _onImageLinkClick() {

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

    render() {
        return (
            <div style={styles.editor}>
                <button onClick={this._onBoldClick.bind(this)}>Bold</button>
                <button onClick={this._onItalicClick.bind(this)}>Italic</button>
                <button onClick={this._onImageLinkClick.bind(this)}>Image</button>
                <Editor
                    blockStyleFn={this.myBlockStyleFn}
                    blockRenderMap={this.blockRenderMap}
                    blockRendererFn={this.blockRendererFn}
                    editorState={this.state.editorState}
                    onChange={this.onChange} />
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
            const DecoratedImageComponent = decorateComponentWithProps(Image, entityData);
            if (type === 'IMAGE' || type === 'image') {
                return {
                    component: DecoratedImageComponent ,
                    editable: false,

                };
            }
            return null;
        }

        return null;
    }


    myBlockStyleFn(contentBlock) {
        const type = contentBlock.getType();
        if (type === 'atomic') {
            return 'superFancyBlockquote';
        }
    }
    customBlockRendering = props => {
        const {blockTypes} = props;
        var newObj = {
            'paragraph': {
                element: 'div',
            },
            'unstyled': {
                element: 'div',
            },
            'atomic': {
                element: 'div',
            },
            'block-image': {
                element: 'div',
            },
            'block-table': {
                element: 'div',
            }
        };
        for (let key in blockTypes) {
            newObj[key] = {
                element: 'div'
            };
        }
        return Map(newObj);
    }
}
const Image = (props) => {
    return <img src={props.src}  alt="Imported" width={props.width} height={props.height}/>;
};



const styles = {
    root: {
        fontFamily: '\'Georgia\', serif',
        padding: 20,
        width: 600,
    },
    buttons: {
        marginBottom: 10,
    },
    urlInputContainer: {
        marginBottom: 10,
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3,
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 100,
        height:'auto',
        padding: 10
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};


export default App;

