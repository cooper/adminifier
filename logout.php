<?php

require_once(__DIR__.'/functions/session.php');
require_once(__DIR__.'/functions/config.php');

session_unset();
session_destroy();

header('Location: '.$config->admin_root.'/');

?>
