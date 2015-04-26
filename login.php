<?php

$PUBLIC_PAGE = true;
require_once('functions/session.php');

if (!isset($_POST['username']) || !isset($_POST['password']))
    die('Credentials not specified');

if ($WIKI->verify_login($_POST['username'], $_POST['password'])) {
    $_SESSION['logged_in'] = true;
    header('Location: dashboard.php');
}
else header('Location: index.php');

?>