<?php

// TODO: $_GET['model']

require_once(__DIR__.'/utils.php');

if (!isset($_POST['page']) || !isset($_POST['from']))
    json_error('Missing required parameters');

$res = $W->page_diff($_POST['page'], $_POST['from'], $_POST['to']);

if ($res->response != 'page_diff')
    json_error('Failed to fetch page diff');

json_success((array)$res);

?>
