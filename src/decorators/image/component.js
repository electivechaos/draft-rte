import React from "react";

export  const Link = (props) => {
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
