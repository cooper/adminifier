<?php

$API = true;
require_once(__DIR__.'/utils.php');

$res = $W->ping();
if (!$res->connected)
    json_error('Not connected', (array)$res);

json_success((array)$res);

?>
