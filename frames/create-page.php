<?

/*
    these links are relative to frames directory,
    but the links in HTML are relative to index.php
*/

require_once(__DIR__.'/../functions/utils.php');

// create a random page name
$new_page = 'untitled_'.uniqid().'.page';

// set fake post variables
$_POST = array();
$_POST['page'] = $new_page;
$_POST['content'] = '';

// write the blank page
require_once(__DIR__.'/../functions/write-page.php');

// redirect to edit the new page
header('Location: edit-page.php?page='.$new_page);

?>