<?php

require_once(__DIR__.'/session.php');
require_once(__DIR__.'/../private/config.php');
require_once(__DIR__.'/wikiclient.php');

if (!isset($_GET['page']))
    die('Missing required parameters');

if (!$W->page_del($_GET['page'])->deleted)
    die('Delete failed');

header('Location: ..'.$config->admin_root.'/');

?>