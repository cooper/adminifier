<?php

require_once(__DIR__.'/utils.php');

if (!isset($_POST['page']))
    json_error('Missing required parameters');

$method = isset($_GET['model']) ? 'model_del' : 'page_del';
if (!$W->$method($_POST['page'])->deleted)
    json_error('Delete failed');

json_success();

?>
