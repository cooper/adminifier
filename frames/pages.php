<meta data-nav="pages" data-title="Pages" data-icon="file-text" />
<?

require_once(__DIR__.'/../functions/session.php');
//require_once(__DIR__.'/../private/config.php');
require_once(__DIR__.'/../functions/wikiclient.php');

$pages = $W->page_list('a+')->pages;

echo '<table>';
foreach ($pages as $page) {
    echo
    '<tr><td>' .
    '<a href="edit-page.php?page='.urlencode($page->file).'">' .
    $page->title .
    '</td></tr>';
}
echo '</table>';

?>