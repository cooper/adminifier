<?

// models.php includes this with $model true.
$model = isset($model);

// find the sort method
$valid_types = array('a', 'c', 'u', 'm'); // TODO: the rest
$sort  = 'm';
$order = '-';
if (isset($_GET['sort'])) {
    $parts = str_split($_GET['sort']);
    if (in_array($parts[0], $valid_types))
        $sort = $parts[0];
    $order = $parts[1] == '+' ? '+' : '-';
}

require_once(__DIR__.'/../functions/utils.php');
$method = 'page_list'; // FIXME
$pages = $W->$method($sort.$order)->pages;

// if the current sort method is the same as the one passed,
// this returns the opposite direction for the same method.
// if the sort method is different, it returns descending.
function sort_method ($type) {
    global $sort, $order;
    $prefix = '#!'.($model ? 'models' : 'pages').'?sort=';
    if ($type == $sort)
        return $order == '-' ? $prefix.$type.'%2B' : $prefix.$type.'-';
    return $prefix.$type.'-';
}

?>

<? if ($model): ?>
<meta
      data-nav="models"
      data-title="Models"
      data-icon="cube"
      data-scripts="page-list"
      data-styles="page-list"
      data-flags="no-margin"
      data-sort="<?= $sort.$order ?>"
/>
<? else: ?>
<meta
      data-nav="pages"
      data-title="Pages"
      data-icon="file-text"
      data-scripts="page-list"
      data-styles="page-list"
      data-flags="no-margin"
      data-sort="<?= $sort.$order ?>"
/>
<? endif; ?>

<table id="page-list">
<thead>
    <th class="checkbox"><input type="checkbox" value="0" /></th>
    <th class="title" data-sort="a">
        <a class="frame-click" href="<?= sort_method('a') ?>">Title</a>
    </th>
    <th class="author info" data-sort="u">
        <a class="frame-click" href="<?= sort_method('u') ?>">Author</a>
    </th>
    <th class="created info" data-sort="c">
        <a class="frame-click" href="<?= sort_method('c') ?>">Created</a>
    </th>
    <th class="created info" data-sort="m">
        <a class="frame-click" href="<?= sort_method('m') ?>">Modified</a>
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
                isset($page->created)           ?
                date('M j Y', $page->created)   : ''
            ?>
        </td>
        <td class="modified info">
            <?=
                isset($page->mod_unix)         ?
                date('M j Y', $page->mod_unix) : ''
            ?>
        </td>
    </tr>
<? endforeach; ?>

</tbody>
</table>
