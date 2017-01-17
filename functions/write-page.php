<?php

require_once(__DIR__.'/utils.php');

if (!isset($_POST['content']) || !isset($_POST['page']))
    json_error('Missing required parameters');

$res = $W->page_save($_POST['page'], $_POST['content'], $_POST['message']);
if (!$res->saved)
    json_error('Save failed', array(
        'rev_error'  => $res->rev_error,
        'rev_errors' => $res->rev_errors,
        'error'      => $res->error
    ));

json_success(array(
    'rev_info' => $res->rev_latest
));

?>
