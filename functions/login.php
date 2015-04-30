<?php

$PUBLIC_PAGE = true;
require_once(__DIR__.'/session.php');
require_once(__DIR__.'/wikiclient.php');

// already logged in
if (isset($_SESSION['logged_in'])) {
    header('Location: ..'.$config->admin_root.'/');
    die();
}

// no username/password
if (!isset($_POST['username']) || !isset($_POST['password']))
    die('Credentials not specified');

// attempt login
if ($W->login($_POST['username'], $_POST['password'], session_id())->logged_in) {
    $_SESSION['logged_in'] = true;
    $_SESSION['username']  = $_POST['username'];
    header('Location: ..'.$config->admin_root.'/');
}

// login failed
else header('Location: ../login.php');

?>