<?php

require_once(__DIR__.'/session.php');
require_once(__DIR__.'/wikiclient.php');

if (!isset($_GET['page']))
    die('Missing required parameters');

if (!$W->page_del($_GET['page'])->deleted)
    die('Delete failed');

header('Location: ../dashboard.php');

?>