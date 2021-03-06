(function (a, exports) {
    
if (!FileList || !a.currentJSONMetadata)
    return;

var pageList = new FileList({
    root: '#!/pages',
    columns: ['Title', 'Author', 'Created', 'Modified'],
    columnData: {
        Title:      { sort: 'a', isTitle: true },
        Author:     { sort: 'u' },
        Created:    { sort: 'c', fixer: dateToHRTimeAgo, tooltipFixer: dateToPreciseHR, dataType: 'date' },
        Modified:   { sort: 'm', fixer: dateToHRTimeAgo, tooltipFixer: dateToPreciseHR, dataType: 'date' }
    }
});

if (a.currentJSONMetadata.results)
a.currentJSONMetadata.results.each(function (pageData) {
    var entry = new FileListEntry({
        Title:      pageData.title || pageData.file,
        Author:     pageData.author,
        Created:    pageData.created,
        Modified:   pageData.mod_unix
    });
    entry.setInfoState('Generated', pageData.generated);
    entry.setInfoState('Draft', pageData.draft);
    entry.link = '#!/edit-page?page=' + encodeURIComponent(pageData.file);
    pageList.addEntry(entry);
});

pageList.draw($('content'));

})(adminifier, window);
