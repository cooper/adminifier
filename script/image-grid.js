(function (a, exports) {
    
if (!a.currentJSONMetadata)
    return;
    
var container = new Element('div', { class: 'image-grid' });
$('content').appendChild(container);

if (a.currentJSONMetadata.results)
a.currentJSONMetadata.results.each(function (imageData) {
    
    // the larger dimension dictates the image size
    imageData.dimension = imageData.width < imageData.height ?
        'height' : 'width';
    
    // max is 300
    imageData.dimValue  = imageData[imageData.dimension];
    if (imageData.dimValue > 300)
        imageData.dimValue = 300;
    
    var div = new Element('div', {
        class: 'image-grid-item',
        html:   tmpl('tmpl-image-grid-item', imageData)
    });
    container.appendChild(div);
});

})(adminifier, window);
