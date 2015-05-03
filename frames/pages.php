<?

// find the sort method
$valid_types = array('a', 'c'); // TODO: the rest
$sort  = 'a';
$order = '+';
if (isset($_GET['sort'])) {
    $parts = str_split($_GET['sort']);
    $sort  = in_array($parts[0], $valid_types) ? $parts[0] : 'a';
    $order = $parts[1] == '+' ? '+' : '-';
}

require_once(__DIR__.'/../functions/utils.php');
$pages = $W->page_list($sort.$order)->pages;

// if the current sort method is the same as the one passed,
// this returns the opposite direction for the same method.
// if the sort method is different, it returns descending.
function sort_method ($type) {
    if ($type == $sort)
        return $order == '-' ? $type.'+' : $type.'-';
    return $type.'-';
}

?>

<meta data-nav="pages" data-title="Pages" data-icon="file-text" data-scripts="page-list" data-sort="a+" />

<table id="page-list">
<thead>
    <th class="checkbox"><input type="checkbox" value="0" /></th>
    <th class="title" data-sort="a">
        <a class="frame-click" href="#!/pages?sort=<?= sort_method('a') ?>">Title</a>
    </th>
    <th class="author info" data-sort="u">
        <a class="frame-click" href="#!/pages?sort=<?= sort_method('u') ?>">Author</a>
    </th>
    <th class="created info" data-sort="c">
        <a class="frame-click" href="#!/pages?sort=<?= sort_method('c') ?>">Created</a>
    </th>
</thead>
<tbody>
<? foreach ($pages as $page): ?>
    <tr>
        <td class="checkbox">
            <input type="checkbox" value="0" />
        </td>
        <td class="title">
            <a class="frame-click" href="#!/edit-page?page=<?= urlencode($page->file) ?>">
                <?= htmlspecialchars($page->title) ?>
            </a>
        </td>
        <td class="author info">
            <?= htmlspecialchars($page->author) ?>
        </td>
        <td class="created info">
            <?= date('M j Y'/*g:i a'*/, $page->created) ?>
        </td>
    </tr>
<? endforeach; ?>

</tbody>
</table>