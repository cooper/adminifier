<?

// list view
if (isset($_GET['mode']) && $_GET['mode'] == 'list') {
    $list_type = 'images';
    require_once(__DIR__.'/pages.php');
    die();
}

// grid view

require_once(__DIR__.'/../functions/utils.php');
$images = $W->image_list($sort.$order)->images;

echo '<pre>'
print_r($images);
echo '</pre>';


?>
<!--JSON
<?= json_encode(array(
    'results'       => $images,
    'sort_types'    => array('a', 'c', 'u', 'm', 'd');
)) ?>

-->

<meta
    data-nav="images"
    data-title="Images"
    data-icon="picture-o"
    data-buttons="image-mode"
    data-button-image-mode="{'title': 'List view', 'icon': 'list', 'href': '#!/pages?mode=list'}"
    data-scripts="file-list file-list/images"
    data-styles="file-list"
    data-flags="no-margin search buttons"
    data-search="fileSearch"
    data-sort="<?= $sort.$order ?>"
/>
