<?

if (!isset($list_type))
    $list_type = 'pages';

// find the sort method
$valid_types = array('a', 'c', 'u', 'm');
if ($list_type == 'images')
    array_push($valid_types, 'd');
$sort  = 'm';
$order = '-';
if (isset($_GET['sort'])) {
    $parts = str_split($_GET['sort']);
    if (in_array($parts[0], $valid_types))
        $sort = $parts[0];
    $order = $parts[1] == '+' ? '+' : '-';
}

require_once(__DIR__.'/../functions/utils.php');

// page or model
$pages = array();
switch ($list_type) {
    case 'pages':       $pages = $W->page_list($sort.$order)->pages;      break;
    case 'models':      $pages = $W->model_list($sort.$order)->models;    break;
    case 'images':      $pages = $W->image_list($sort.$order)->images;    break;
    case 'categories':  $pages = $W->cat_list($sort.$order)->categories;  break;
}

?>
<!--JSON
<?= json_encode(array(
    'results'       => $pages,
    'sort_types'    => $valid_types
)) ?>

-->

<meta
<? if ($list_type == 'models'): ?>
    data-nav="models"
    data-title="Models"
    data-icon="cube"
    data-scripts="file-list file-list/models"
<? elseif ($list_type == 'categories'): ?>
    data-nav="categories"
    data-title="Categories"
    data-icon="list"
    data-scripts="file-list file-list/categories"
<? elseif ($list_type == 'images'): ?>
    data-nav="images"
    data-title="Images"
    data-icon="picture-o"
    data-buttons="image-mode"
    data-button-image-mode="List imageModeToggle list"
    data-scripts="file-list file-list/images"
<? else: ?>
    data-nav="pages"
    data-title="Pages"
    data-icon="file-text"
    data-scripts="file-list file-list/pages"
<? endif; ?>
    data-styles="file-list"
    data-flags="no-margin search buttons"
    data-search="fileSearch"
    data-sort="<?= $sort.$order ?>"
/>
