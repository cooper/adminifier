<script type="text/x-tmpl" id="tmpl-link-helper">
    <div id="editor-link-type-internal" class="editor-link-type active" title="Page"><i class="fa fa-file-text"></i></div>
    <div id="editor-link-type-external" class="editor-link-type" title="External wiki page"><i class="fa fa-globe"></i></div>
    <div id="editor-link-type-category" class="editor-link-type" title="Category"><i class="fa fa-list"></i></div>
    <div id="editor-link-type-url" class="editor-link-type" title="External URL"><i class="fa fa-external-link"></i></div>
    <div style="clear: both;"></div>
    <div id="editor-link-wrapper">
    <span id="editor-link-title1">Page target</span><br />
    <input id="editor-link-target" class="editor-full-width-input" type="text" placeholder="My Page" />
    <span id="editor-link-title2">Display text</span><br />
    <input id="editor-link-display" class="editor-full-width-input" type="text" placeholder="Click here" /><br/>
    </div>
    <div id="editor-link-insert" class="editor-tool-large-button">Insert page link</div>
</script>

<script type="text/x-tmpl" id="tmpl-save-helper">
    <div id="editor-save-wrapper">
    Edit summary<br />
    <input id="editor-save-message" class="editor-full-width-input" type="text" placeholder="Updated {%= o.file %}" />
    </div>
    <div id="editor-save-commit" class="editor-tool-large-button">Commit changes</div>
</script>

<script type="text/x-tmpl" id="tmpl-save-spinner">
    <div style="text-align: center; line-height: 60px; height: 60px;"><i class="fa fa-spinner fa-3x fa-spin center"></i></div>
</script>

<script type="text/x-tmpl" id="tmpl-delete-confirm">
    <div id="editor-delete-wrapper">
        <i class="fa fa-3x center fa-question-circle"></i>
    </div>
    <div id="editor-delete-button" class="editor-tool-large-button">Are you sure?</div>
</script>

<script type="text/x-tmpl" id="tmpl-color-name">
    <span style="padding-left: 10px;">{%= o.colorName %}</span>
</script>

<script type="text/x-tmpl" id="tmpl-page-options">
    <h3>Settings</h3>
    <table><tbody>
        <tr>
            <td class="left"><span title="Human-readable page title.">Title</span></td>
            <td><input class="title" type="text" value="{%= o.title %}" /></td>
        </tr>
        <tr>
            <td class="left"><span title="Page author. Not used for revision tracking but may be displayed on the page.">Author</span></td>
            <td><input class="author" type="text" value="{%= o.author %}" /></td>
        </tr>
        <tr>
            <td class="left"><span title="Marks the page as a draft; unauthenticated users may not view it.">Draft</span></td>
            <td><input class="draft" type="checkbox"{%= o.draft ? ' checked' : '' %} /></td>
        </tr>
    </tbody></table>
    <h3>Categories</h3>
    <table><tbody>
        <tr class="add-category"><td>
            <i class="fa fa-plus-circle" style="color: #00B545;"></i>
            <input type="text" />
        </td></tr>
    </tbody></table>
</script>
