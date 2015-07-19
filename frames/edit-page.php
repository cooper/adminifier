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
      data-title="Editing <?= htmlspecialchars($_GET['page']) ?>" 
      data-icon="edit"
      data-scripts="ace edit-page"
      data-styles="editor"
      data-flags="no-margin"
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

<!--<div class="editor-toolbar"></div>-->
<div id="editor"><?= htmlspecialchars($result->content) ?></div>

<? /*
<form action="functions/write-page.php" method="post">
    <input type="hidden" value="<?= htmlspecialchars($_GET['page']) ?>" name="page" />
    <textarea name="content" style="font-family: monospace; width: 1000px; height: 500px;"><?= htmlspecialchars($result->content) ?></textarea>
    <input type="submit" name="submit" value="Save" />
</form>
*/ ?>