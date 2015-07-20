<?

require_once(__DIR__.'/../functions/utils.php');

if (!isset($_GET['page']))
    die('No page requested');

$result = $W->page_code($_GET['page']);
if ($result->type != 'page_code')
    die('Page does not exist.');

/*
echo '<a href="functions/delete-page.php?page='.urlencode($_GET['page']).'">Delete</a>';
*/

?>

<meta
      data-nav="pages"
      data-title="<?= htmlspecialchars($_GET['page']) ?>" 
      data-icon="edit"
      data-scripts="ace editor"
      data-styles="editor"
      data-flags="no-margin compact-sidebar"
/>

<? /*
    $short_page = substr_compare(
        $_GET['page'],
        '.page',
        strlen($_GET['page']) - strlen('.page'),
        strlen($_GET['page'])
    ) == 0 ?
        substr($_GET['page'], 0, -strlen('.page')) :
    $_GET['page']
*/ ?>
<? /*
<form action="functions/move-page.php" method="post">
    <input type="hidden" value="<?= htmlspecialchars($_GET['page']) ?>" name="page" />
    <input type="text" value="<?= htmlspecialchars($short_page) ?>" name="new_name" />
    <input type="submit" value="Rename" name="submit" />
</form>

<br />
*/ ?>

<div class="editor-toolbar-wrapper">
    <ul class="editor-toolbar">
        
        <li data-action="save" class="right"><i class="fa right fa-save"></i> Save</li>
        <li data-action="delete" class="right"><i class="fa right fa-trash"></i> Delete</li>
        <li id="toolbar-redo" data-action="redo" class="right disabled"><i class="fa right fa-repeat"></i> Redo</li>
        <li id="toolbar-undo" data-action="undo" class="right disabled"><i class="fa right fa-undo"></i> Undo</li>
        
        <!--
            <li style="float: right;"><i class="fa fa-paste"></i> Paste</li>
            <li style="float: right;"><i class="fa fa-copy"></i> Copy</li>
            <li style="float: right;"><i class="fa fa-cut"></i> Cut</li>
        -->

        <li data-action="bold"><i class="fa fa-bold"></i> Bold</li>
        <li data-action="italic"><i class="fa fa-italic"></i> Italic</li>
        <li data-action="underline"><i class="fa fa-underline"></i> Underline</li>
        <li data-action="strike"><i class="fa fa-strikethrough"></i> Strike</li>
        <li data-action="font"><i class="fa fa-font"></i> Font</li>
        <li data-action="header"><i class="fa fa-header"></i> Header</li>
        <li data-action="image"><i class="fa fa-picture-o"></i> Image</li>
        <li data-action="link"><i class="fa fa-link"></i> Link</li>
        <li data-action="file"><i class="fa fa-paperclip"></i> File</li>
        <li data-action="list"><i class="fa fa-list-ul"></i> List</li>
        <li data-action="infobox"><i class="fa fa-info-circle"></i> Infobox</li>
        <li data-action="history"><i class="fa fa-history"></i> History</li>
        <li data-action="code"><i class="fa fa-code"></i> Code</li>
        <li data-action="cite"><i class="fa fa-copyright"></i> Citation</li>
        
    </ul>
</div>
<div id="editor"><?= htmlspecialchars($result->content) ?></div>

<? /*
<form action="functions/write-page.php" method="post">
    <input type="hidden" value="<?= htmlspecialchars($_GET['page']) ?>" name="page" />
    <textarea name="content" style="font-family: monospace; width: 1000px; height: 500px;"><?= htmlspecialchars($result->content) ?></textarea>
    <input type="submit" name="submit" value="Save" />
</form>
*/ ?>