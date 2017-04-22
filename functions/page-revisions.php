<?php

require_once(__DIR__.'/utils.php');

if (!isset($_POST['page']))
    json_error('Missing required parameters');

$res = $W->page_revs($_POST['page']);

if (!$res->response != 'page_revs')
    json_error('Failed to fetch revision history');

json_success((array)$res);

?>
