<?

require_once(__DIR__.'/session.php');
require_once(__DIR__.'/../private/config.php');
require_once(__DIR__.'/wikiclient.php');

function json_error ($msg = 'Unknown') {
    die(json_encode(array(
        'error'   => $msg,
        'success' => false
    )));
}

function json_success () {
    echo json_encode(array('success' => true));
}

?>