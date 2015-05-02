<?php
    session_start();
    if (!isset($PUBLIC_PAGE) && !isset($_SESSION['logged_in'])) {
    header('Location: '.$config->admin_root.'/logout.php');
        die();
    }
?>