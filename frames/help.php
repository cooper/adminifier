<meta
      data-nav="help"
      data-title="Help"
      data-icon="question-circle"
      data-scripts="help"
      data-styles=""
      data-flags=""
/>

<link rel="stylesheet" type="text/css" href="http://chromeless.wikifier.notroll.net/static/wiki.css" />

<?

if (!isset($_GET['page']))
    $_GET['page'] = '';

$html = file_get_contents('http://chromeless.wikifier.notroll.net/'.$_GET['page']);
$html = preg_replace('/"\\/page\\//',     '"#!/help?page=/page/',   $html);
$html = preg_replace('/"\\/topic\\//',    '"#!/help?page=/topic/',  $html);
$html = preg_replace('/href="http/',  'target="_blank" href="http', $html);
$html = preg_replace('/href="#(.+)"/', 'href="javascript:goToHelpAnchor(\'$1\')"', $html);

echo $html;

?>
