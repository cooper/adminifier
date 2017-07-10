(function (a, exports) {
    
if (!FileList || !a.currentJSONMetadata)
    return;

var pageList = new FileList({
    columns: ['Title', 'Author', 'Created', 'Modified'],
    columnData: {
        Title:      { sort: 'a', isTitle: true },
        Author:     { sort: 'u' },
        Created:    { sort: 'c', fixer: prettifyDate },
        Modified:   { sort: 'm', fixer: prettifyDate }
    }
});

a.currentJSONMetadata['results'].each(function (pageData) {
    var entry = new FileListEntry({
        Title:      pageData.title || pageData.file,
        Author:     pageData.author,
        Created:    pageData.created,
        Modified:   pageData.mod_unix
    });
    entry.link = '#!/edit-page?page=' + encodeURIComponent(pageData.file);
    pageList.addEntry(entry);
});

pageList.draw($('content'));

function prettifyDate (text) {
    if (typeof text != 'string' || !text.length)
        return;
    return dateToHRTimeAgo(text);
}

})(adminifier, window);
