<meta data-nav="pages" data-title="Pages" data-icon="file-text" />
<?

require_once(__DIR__.'/../functions/utils.php');
$pages = $W->page_list('a+')->pages;

?>

<table id="page-list">
<thead>
    <th class="checkbox"><input type="checkbox" value="0" /></th>
    <th><a href="#">Title</a></th>
    <th class="author info"><a href="#">Author</a></th>
    <th class="created info"><a href="#">Created</a></th>
</thead>
<tbody>
<? foreach ($pages as $page): ?>
    <tr>
        <td class="checkbox">
            <input type="checkbox" value="0" />
        </td>
        <td>
            <a class="frame-click" href="#!/edit-page?page=<?= urlencode($page->file) ?>">
                <?= htmlspecialchars($page->title) ?>
            </a>
        </td>
        <td class="author info">
            <?= htmlspecialchars($page->author) ?>
        </td>
        <td class="created info">
            <?= date('D M j Y g:i a', $page->created) ?>
        </td>
    </tr>
<? endforeach; ?>

</tbody>
</table>