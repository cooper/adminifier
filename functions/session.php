<?php
    session_start();
    if (!isset($PUBLIC_PAGE) && !isset($_SESSION['logged_in'])) {
        header('Location: login.php');
        die();
    }
?>