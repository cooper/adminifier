(function (a, exports) {
    
if (!a.currentJSONMetadata)
    return;

if (a.currentJSONMetadata.results)
a.currentJSONMetadata.results.each(function (imageData) {
    imageData.dimension = imageData.width < imageData.height ? 'height' : 'width';
    imageData.dimValue  = imageData[imageData.dimension];
    
    if (imageData.dimValue < 300)
        imageData.dimValue = 0;
    
    var div = new Element('div', {
        class: 'image-grid-item',
        html:   tmpl('tmpl-image-grid-item', imageData)
    });
    $('content').appendChild(div);
});

})(adminifier, window);
