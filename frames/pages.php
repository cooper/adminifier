<meta data-nav="pages" data-title="Pages" data-icon="file-text" />
<?

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