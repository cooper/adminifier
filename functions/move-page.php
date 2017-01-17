<?php

$API = true;
require_once(__DIR__.'/utils.php');

if (!isset($_POST['page']) || !isset($_POST['new_name']))
    die('Missing required parameters');

if (!$W->page_move($_POST['page'], $_POST['new_name'])->moved)
    die('Move failed');

header('Location: ..'.$config->admin_root.'/');

?>
