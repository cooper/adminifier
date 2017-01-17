<?php

$API = true;
require_once(__DIR__.'/utils.php');

if (!isset($_POST['page']))
    json_error('Missing required parameters');

if (!$W->page_del($_POST['page'])->deleted)
    json_error('Delete failed');

json_success();

?>
