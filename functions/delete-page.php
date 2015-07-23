<?php

require_once(__DIR__.'/utils.php');

if (!isset($_GET['page']))
    json_error('Missing required parameters');

if (!$W->page_del($_GET['page'])->deleted)
    json_error('Delete failed');

json_success();

?>