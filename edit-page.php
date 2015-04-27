<?

require_once(__DIR__.'/functions/session.php');
require_once(__DIR__.'/functions/wikiclient.php');

if (!isset($_GET['page']))
    die('No page requested');

$result = $W->page_code($_GET['page']);
print_r($result);

?>

<br />

<form action="functions/write_page.php" method="post">
    <input type="hidden" value="<?= htmlspecialchars($_GET['page']) ?>" name="page" />
    <textarea name="content" style="font-family: monospace; width: 1000px; height: 500px;">
<?= htmlspecialchars($result->content) ?>
    </textarea>
    <input type="submit" name="submit" />
</form>