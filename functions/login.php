<?php

$API = true;
$PUBLIC_PAGE = true;
require_once(__DIR__.'/utils.php');

// already logged in
if (isset($_SESSION['logged_in'])) {
    header('Location: ..'.$config->admin_root.'/');
    die();
}

// no username/password
if (!isset($_POST['username']) || !isset($_POST['password']))
    die('Credentials not specified');


// attempt login
$username  = $_POST['username'];
$user_info = $W->login($username, $_POST['password'], session_id());
if ($user_info->logged_in) {
    $_SESSION['logged_in'] = true;
    $_SESSION['username']  = $username;
    $_SESSION['realname']  = $user_info->name ? $user_info->name : $username;
    header('Location: ..'.$config->admin_root.'/');
}

// login failed
else header('Location: ../login.php');

?>
