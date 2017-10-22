(function (a, exports) {
    
if (!FileList || !a.currentJSONMetadata || !a.currentJSONMetadata)
    return;

var modelList = new FileList({
    root: '#!/models',
    columns: ['Title', 'Author', 'Created', 'Modified'],
    columnData: {
        Title:      { sort: 'a', isTitle: true },
        Author:     { sort: 'u' },
        Created:    { sort: 'c', fixer: dateToHRTimeAgo, tooltipFixer: dateToPreciseHR },
        Modified:   { sort: 'm', fixer: dateToHRTimeAgo, tooltipFixer: dateToPreciseHR }
    }
});

if (a.currentJSONMetadata.results)
a.currentJSONMetadata.results.each(function (modelData) {
    var entry = new FileListEntry({
        Title:      modelData.title,
        Author:     modelData.author,
        Created:    modelData.created,
        Modified:   modelData.mod_unix
    });
    entry.link = '#!/edit-model?page=' + encodeURIComponent(modelData.file);
    modelList.addEntry(entry);
});

modelList.draw($('content'));

})(adminifier, window);
