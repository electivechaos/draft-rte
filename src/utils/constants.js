export  const  fontSizeForBtn = "18px";

export let RTE_DEFAULT_CONFIG = {
    BLOCK_TYPE_HEADINGS : [
        { label: "H1", style: "header-one" },
        { label: "H2", style: "header-two" },
        { label: "H3", style: "header-three" },
        { label: "H4", style: "header-four" },
        { label: "H5", style: "header-five" },
        { label: "H6", style: "header-six" }
    ],
    MEDIA_CONTROLS : [
        {label: 'Image', icon: 'fa fa-image', mediaType: "image"},
        {label: 'Link', icon: 'fa fa-link', mediaType: "link"},
        {label: 'Video', icon: 'fa fa-play', mediaType: "video"},
        {label: 'Video Link', icon: 'fa fa-link rotate-minus-45', mediaType: "video-link"},
        {label: 'Audio', icon: 'fa fa-headphones', mediaType: "audio"},
        {label: 'Document', icon: 'fa fa-file-pdf-o', mediaType: "document"}
    ],BLOCK_TYPES : [
        {label: 'UL', style: 'unordered-list-item', icon: 'fa fa-list-ul'},
        {label: 'OL', style: 'ordered-list-item', icon: 'fa fa-list-ol'}
    ],
    INLINE_STYLES : [
        {label: 'Bold', style: 'BOLD', icon: 'fa fa-bold'},
        {label: 'Italic', style: 'ITALIC', icon: 'fa fa-italic'},
        {label: 'Underline', style: 'UNDERLINE', icon: 'fa fa-underline'},
    ],
    UNDO_REDO_STYLES: [
        {label: 'Undo', icon: 'fa fa-undo', mediaType: "undo"},
        {label: 'Redo', icon: 'fa fa-repeat', mediaType: "redo"}
    ]
};