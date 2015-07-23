<?

// find the sort method
$valid_types = array('a', 'c', 'u'); // TODO: the rest
$sort  = 'c';
$order = '-';
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
    global $sort, $order;
    if ($type == $sort)
        return $order == '-' ? $type.'%2B' : $type.'-';
    return $type.'-';
}

?>

<meta
      data-nav="pages"
      data-title="Pages"
      data-icon="file-text"
      data-scripts="page-list"
      data-flags="no-margin"
      data-sort="<?= $sort.$order ?>"
/>

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
    <tr></tr>
<? foreach ($pages as $page): ?>
    <tr>
        <td class="checkbox">
            <input type="checkbox" value="0" />
        </td>
        <td class="title">
            <a class="frame-click" href="#!/edit-page?page=<?= urlencode($page->file) ?>">
                <?=
                    isset($page->title)
                        && strlen(trim($page->title)) ?
                    $page->title    :
                    $page->file
                ?>
            </a>
        </td>
        <td class="author info">
            <?=
                isset($page->author) ?
                htmlspecialchars($page->author) : ''
            ?>
        </td>
        <td class="created info">
            <?=
                isset($page->created) ?
                date('M j Y'/*g:i a'*/, $page->created) : ''
            ?>
        </td>
    </tr>
<? endforeach; ?>

</tbody>
</table>