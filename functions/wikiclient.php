<?

$API = true;
require_once(__DIR__.'/../private/config.php');
require_once($config->wikiclient_path);

// create wikiclient. use session ID if logged in.
$W = new Wikiclient(
    $config->wiki_sock,
    $config->wiki_name,
    $config->wiki_pass,
    $user_info->logged_in ? session_id() : null
);

// login again
$W->login_again_cb = function () {
    header('Location: '.$config->admin_root.'/logout.php');
    die();
};

?>
