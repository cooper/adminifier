<?php

require_once(__DIR__.'/utils.php');

if (!isset($_GET['file']))
    die('Missing required parameters');

$res = $W->command('image', array(
    'name'          => $_GET['file'],
    'width'         => $_GET['width'],
    'height'        => $_GET['height'],
    'gen_override'  => true
));

// some error occured
if ($res->type == 'not found')
    text_error($res->error);

// something else happened
if ($res->type != 'image')
    text_error('Unknown type');

// not modified
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) &&
    strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= $res->mod_unix) {
    header_remove('Cache-Control');
    header_remove('Pragma');
    header('HTTP/1.0 304 Not Modified');
    die();
}
    
// send image
header('Content-Length: '.$res->length);
header('Content-Type: '. $res->mime);
header('Last-Modified: '.$res->modified);
echo file_get_contents($res->path);

function text_error ($error) {
    header('Content-Type: text/plain');
    die($error);
}

?>
