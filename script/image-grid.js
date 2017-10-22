(function (a, exports) {
    
if (!a.currentJSONMetadata)
    return;

if (a.currentJSONMetadata.results)
a.currentJSONMetadata.results.each(function (imageData) {
    var div = new Element('div', { text: JSON.encode(imageData) });
    $('content').appendChild(div);
});

})(adminifier, window);
