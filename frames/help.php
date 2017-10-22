<meta
      data-nav="help"
      data-title="Help"
      data-icon="question-circle"
      data-scripts=""
      data-styles=""
      data-flags=""
/>

<?

if (!isset($_GET['page']))
    $_GET['page'] = '';

echo file_get_contents('http://chromeless.wikifier.notroll.net/'.$_GET['page']);

?>
