<?

// list view
if (isset($_GET['mode']) && $_GET['mode'] == 'list') {
    $list_type = 'images';
    require_once(__DIR__.'/pages.php');
    die();
}

// grid view

$images = $W->image_list($sort.$order)->images;
echo '<pre>'
print_r($images);
echo '</pre>';

?>
