(function (a) {
    
if (!FileList || !a.currentJSONMetadata)
    return;
    
var pageList = new FileList({
    columns: ['Title', 'Author', 'Created', 'Modified']
});

a.currentJSONMetadata['results'].each(function (pageData) {
    var entry = new FileListEntry({
        Title:      pageData.title,
        Author:     pageData.author,
        Created:    pageData.created,
        Modified:   pageData.mod_unix
    });
    pageList.addEntry(entry);
});

pageList.draw($('content'));

})(adminifier);
