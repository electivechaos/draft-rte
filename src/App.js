import React from 'react';
import {Editor, EditorState,RichUtils,AtomicBlockUtils,CompositeDecorator} from 'draft-js';
import './App.css'
// import ImageDecorator from './ImageDecorator.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {editorState: EditorState.createEmpty()};
        this.onChange = (editorState) => this.setState({editorState});
    }
    _onBoldClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
    }

    _onImageLinkClick() {



        const {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            "image",
            "MUTABLE",
            {src: 'http://www.lens-rumors.com/wp-content/uploads/2014/10/Nikon-AF-S-DX-Nikkor-18-140mm-f3.5-5.6G-ED-VR-sample-images1.jpg',width: "100px"}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );

        this.setState({
            editorState: AtomicBlockUtils.insertAtomicBlock(
                newEditorState,
                entityKey,
                ' '
            )
        });
    }

    render() {
        return (
            <div style={styles.editor}>
                <button onClick={this._onBoldClick.bind(this)}>Bold</button>
                <button onClick={this._onItalicClick.bind(this)}>Italic</button>
                <button onClick={this._onImageLinkClick.bind(this)}>Image</button>
            <Editor
                blockRendererFn={this.blockRendererFn}
                editorState={this.state.editorState}
                onChange={this.onChange} />
            </div>
        );
    }

    blockRendererFn(block) {
        console.log("TYPE"+block.getType());
        if (block.getType() === 'atomic') {
            return {
                component: Media,
                editable: true,
            };
        }

        return null;
    }
}
const Media = (props) => {
    debugger
    let media;
    if( props.block.getEntityAt(0) != null ){
        const entity = props.contentState.getEntity(
            props.block.getEntityAt(0)
        );
        const {src,width, height} = entity.getData();
        const type = entity.getType();


        if (type === 'image') {
            media = <Image src={src} width={width} height={height}/>;
        }

        return media;
    }
    return null;

};
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
        minHeight: 80,
        padding: 10,
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

