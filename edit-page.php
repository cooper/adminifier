<?

require_once('functions/session.php');
require_once('functions/wikiclient.php');

if (!isset($_GET['page']))
    die('No page requested');

$result = $W->page_code($_GET['page']);
print_r($result);

?>

<textarea style="font-family: monospace;"><?= $result->content ?></textarea>