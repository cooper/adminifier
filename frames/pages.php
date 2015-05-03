<meta data-nav="pages" data-title="Pages" data-icon="file-text" />
<?

require_once(__DIR__.'/../functions/utils.php');
$pages = $W->page_list('a+')->pages;

?>

<table id="page-list">
<thead>
    <th class="checkbox"><input type="checkbox" value="0" /></th>
    <th><a href="#">Title</a></th>
</thead>
<tbody>
<?

foreach ($pages as $page) {
    echo
    '<tr><td class="checkbox"><input type="checkbox" value="0" /></td><td>' .
    '<a class="frame-click" href="#!/edit-page?page='.urlencode($page->file).'">' .
    $page->title .
    '</td></tr>';
}

?>
</tbody>
</table>