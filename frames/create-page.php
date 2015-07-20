<?

/*
    these links are relative to frames directory,
    but the links in HTML are relative to index.php
*/

require_once(__DIR__.'/../functions/utils.php');

// create a random page name
$new_page = 'untitled_'.uniqid().'.page';

$_time   = time();
$_author = $_SESSION['username'];

// set fake post variables
$_POST = array(
    'page'    => $new_page,
    'content' => <<<EOF
@page.title:   ;
@page.created: $_time;
@page.atuhor:  $_author;

EOF
);

// write the blank page
ob_start();
require_once(__DIR__.'/../functions/write-page.php');
ob_end_clean();

// redirect to edit the new page
header('Location: edit-page.php?page='.$new_page);

?>