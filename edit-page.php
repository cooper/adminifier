<?

require_once('functions/session.php');
require_once('functions/wikiclient.php');

if (!isset($_GET['page']))
    die('No page requested');

$result = $W->page_code($_GET['page']);
print_r($result);

?>

<br />
<textarea style="font-family: monospace; width: 500px; height: 500px;">
<?= htmlspecialchars($result->content) ?>
</textarea>