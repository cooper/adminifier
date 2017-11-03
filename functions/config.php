<?

$config = __DIR__.'/../private/config.json';

// not set up
if (!file_exists($config)) {
    header('Location: install.php');
    die();
}

$config = json_decode(file_get_contents($config));
if (!$config)
    die('JSON configuation error');

?>
