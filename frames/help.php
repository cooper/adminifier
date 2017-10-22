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
    $_GET['page'] = '/page/adminifier/help';

// fetch from wikifier chromeless site
$html = file_get_contents('http://chromeless.wikifier.notroll.net/'.$_GET['page']);

// rewrite wiki links
$html = preg_replace('/"\\/page\\//',     '"#!/help?page=/page/',   $html);
$html = preg_replace('/"\\/topic\\//',    '"#!/help?page=/topic/',  $html);

// rewrite external links
$html = preg_replace('/href="http/',  'target="_blank" href="http', $html);

// rewrite anchors
$html = preg_replace(
    '/href="#([\w\-]+)"/',
    'href="javascript:goToHelpAnchor(\'$1\')"',
    $html
);

// rewrite image targets
$html = preg_replace(
    '/src="\//',
    'src="http://chromeless.wikifier.notroll.net/',
    $html
);

echo $html;

?>
