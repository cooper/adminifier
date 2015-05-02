<?php

require_once(__DIR__.'/utils.php');

if (!isset($_POST['content']) || !isset($_POST['page']))
    json_error('Missing required parameters');

if (!$W->page_save($_POST['page'], $_POST['content'])->saved)
    json_error('Save failed');

json_success();

?>