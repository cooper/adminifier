<?

/*
    these links are relative to frames directory,
    but the links in HTML are relative to index.php
*/

require_once(__DIR__.'/../functions/session.php');
require_once(__DIR__.'/../private/config.php');
require_once(__DIR__.'/../functions/wikiclient.php');

?>

<meta data-nav="pages" data-title="Page creator" data-icon="plus-circle" />

<br />
<form action="functions/write-page.php" method="post">
    <input type="text" name="page" />
    <textarea name="content" style="font-family: monospace; width: 1000px; height: 500px;"></textarea>
    <input type="submit" name="submit" />
</form>