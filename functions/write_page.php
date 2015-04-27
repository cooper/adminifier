<?php

require_once(__DIR__.'/wikiclient.php');
require_once(__DIR__.'/session.php');

if (!isset($_POST['content']) || !isset($_POST['page']))
    die('Missing required parameters');

if (!$W->page_save($_POST['page'], $_POST['content'])->saved)
    die('Save failed');

header('Location: edit-page.php?page='.urlencode($_POST['page']));

?>