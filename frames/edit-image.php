<?

require_once(__DIR__.'/../functions/utils.php');

if (!isset($_GET['image']))
    die('No image requested');

$safe_image = htmlspecialchars($_GET['image']);

?>

<meta
      data-nav="images"
      data-icon="picture-o"
      data-title="<?= $safe_image ?>"
/>

<img alt="<?= $safe_image ?>" src="functions/image.php?file=<? $safe_image ?>" />
