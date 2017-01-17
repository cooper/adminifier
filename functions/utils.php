<?

require_once(__DIR__.'/session.php');
require_once(__DIR__.'/../private/config.php');
require_once(__DIR__.'/wikiclient.php');

function json_error ($msg = 'Unknown', $other_opts) {
    $ary = array(
        'error'   => $msg,
        'success' => false
    );
    if ($other_opts)
        $ary = array_merge($ary, $other_opts);
    header('Content-Type: application/json');
    echo json_encode($ary);
    die();
}

function json_success ($other_opts) {
    $ary = array('success' => true);
    if ($other_opts)
        $ary = array_merge($ary, $other_opts);
    header('Content-Type: application/json');
    echo json_encode($ary);
}

?>
