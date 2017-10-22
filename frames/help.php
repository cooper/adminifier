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

$html = file_get_contents('http://chromeless.wikifier.notroll.net/'.$_GET['page']);
$html = preg_replace('"/page/',     '"#!/help?page=/page/',         $html);
$html = preg_replace('"/topic/',    '"#!/help?page=/topic/',        $html);
$html = preg_replace('href="http',  'target="_blank" href="http',   $html);

echo $html;

?>
