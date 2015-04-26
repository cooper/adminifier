<?php

$PUBLIC_PAGE = true;
require_once('wikiclient.php');
require_once('session.php');

// already logged in
if (isset($_SESSION['logged_in'])) {
    header('Location: dashboard.php');
    die();
}

// no username/password
if (!isset($_POST['username']) || !isset($_POST['password']))
    die('Credentials not specified');

// attempt login
if ($W->login($_POST['username'], $_POST['password'], session_id())->logged_in) {
    $_SESSION['logged_in'] = true;
    header('Location: dashboard.php');
}

// login failed
else header('Location: index.php');

?>