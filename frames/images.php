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

?>
<!--JSON
<?= json_encode(array(
    'results'       => $images,
    'sort_types'    => array('a', 'c', 'u', 'm', 'd')
)) ?>

-->

<meta
    data-nav="images"
    data-title="Images"
    data-icon="picture-o"
    data-buttons="image-mode"
    data-button-image-mode="{'title': 'List view', 'icon': 'list', 'href': '#!/images?mode=list'}"
    data-scripts="image-grid"
    data-styles="image-grid"
    data-flags="no-margin search buttons"
    data-search="fileSearch"
    data-sort="<?= $sort.$order ?>"
/>

<? require(__DIR__.'/../templates/image-grid-tmpl.php'); ?>
