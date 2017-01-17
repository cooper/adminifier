<?php

$API = true;
require_once(__DIR__.'/utils.php');

$res = $W->command("ping", array());
if (!$res->connected)
    json_error('Not connected', $res);
    
?>
