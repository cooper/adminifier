<?php
    require_once(__DIR__.'/../private/config.php');
    session_start();
    if (!isset($PUBLIC_PAGE) && !$user_info->logged_in && !isset($API)) {
        header('Location: '.$config->admin_root.'/login.php');
        // this must go to login.php because at this point if
        // logged_in is not set, they have been logged out already
        die();
    }

    $user_info = $_SESSION['user_info'];
    if (!$user_info)
        $user_info = new stdClass;

    $wiki_conf = $user_info->conf;
    if (!$wiki_conf)
        $wiki_conf = new stdClass;

    // fall back to wiki shortname if no name is set
    $wiki_name = isset($wiki_conf->name) ?
        $wiki_conf->name : $config->wiki_name;

?>
