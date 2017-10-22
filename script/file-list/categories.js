(function (a, exports) {
    
if (!FileList || !a.currentJSONMetadata)
    return;

var catList = new FileList({
    root: '#!/cats',
    columns: ['Title', 'Author', 'Created', 'Modified'],
    columnData: {
        Title:      { sort: 'a', isTitle: true },
        Author:     { sort: 'u' },
        Created:    { sort: 'c', fixer: dateToHRTimeAgo, tooltipFixer: dateToPreciseHR },
        Modified:   { sort: 'm', fixer: dateToHRTimeAgo, tooltipFixer: dateToPreciseHR }
    }
});

if (a.currentJSONMetadata.results)
a.currentJSONMetadata.results.each(function (catData) {
    var entry = new FileListEntry({
        Title:      catData.title || catData.file,
        Author:     catData.author,
        Created:    catData.created,
        Modified:   catData.mod_unix
    });
    entry.setInfoState('Generated', catData.generated);
    entry.setInfoState('Draft', catData.draft);
    entry.link = '#!/edit-cat?cat=' + encodeURIComponent(catData.file);
    catList.addEntry(entry);
});

catList.draw($('content'));

})(adminifier, window);
