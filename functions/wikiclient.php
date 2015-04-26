<?

require_once(__DIR__.'/../private/config.php');
require_once($config->wikiclient_path);

// FIXME: temporarily hardcoded stuff
require_once('/home/www/wikifier/interfaces/PHP/Wikiclient.php');
$W = new Wikiclient($config->wiki_sock, $config->wiki_name, $config->wiki_pass, isset($_SESSION['logged_in']) ? session_id() : null);

?>