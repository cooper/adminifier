<?php

$API = true;
require_once(__DIR__.'/utils.php');

if (!isset($_POST['content']) || !isset($_POST['page']))
    json_error('Missing required parameters');

$method = isset($_GET['model']) ? 'model_save' : 'page_save';
$res = $W->$method($_POST['page'], $_POST['content'], $_POST['message']);

if (!$res->saved)
    json_error('Save failed', (array)$res);

json_success((array)$res);

?>
