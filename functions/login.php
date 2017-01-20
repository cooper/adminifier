<?php

$API = true;
$PUBLIC_PAGE = true;
require_once(__DIR__.'/utils.php');

$is_api = $_GET['remote'];

// already logged in
if ($user_info->logged_in) {
    if ($is_api)
        json_success();
    else
        header('Location: ..'.$config->admin_root.'/');
    die();
}

// no username/password
if (!isset($_POST['username']) || !isset($_POST['password'])) {
    if ($is_api)
        json_error('Credentials not specified');
    die('Credentials not specified');
}


// attempt login
$username  = $_POST['username'];
$user_info = $W->login($username, $_POST['password'], session_id());
if ($user_info->logged_in) {
    $user_info->realname = $user_info->name ? $user_info->name : $username;
    $user_info->username = $username;
    $_SESSION['user_info'] = $user_info;
    
    if ($is_api)
        json_success();
    else
        header('Location: ..'.$config->admin_root.'/');
}

// login failed
elseif ($is_api)
    json_error('Login failed');
else
    header('Location: ../login.php');

?>
