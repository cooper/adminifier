<?php
    require_once(__DIR__.'/../private/config.php');
    session_start();
    if (!isset($PUBLIC_PAGE) && !isset($_SESSION['logged_in'])) {
    header('Location: '.$config->admin_root.'/login.php');
        // this must go to login.php because at this point if
        // logged_in is not set, they have been logged out already
        session_destroy();
        die();
    }
?>
