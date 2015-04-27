<?

require_once('functions/session.php');
require_once('functions/wikiclient.php');

$pages = $W->page_list('a+');

echo '<table>';
foreach ($pages as $page) {
    echo
    '<tr><td>' .
    '<a href="edit-page.php?page="'.$page->file.'">' .
    $page->name .
    '</td></tr>';
}
echo '</table>';

?>