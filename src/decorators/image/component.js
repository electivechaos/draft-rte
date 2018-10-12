import React from "react";

export const Image = (props) => {
    const {src,width,height} = props.contentState.getEntity(props.entityKey).getData();
    return <img src={src} alt="Imported" width={width} height={height}/>;
};
