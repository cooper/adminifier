<?
    require_once(__DIR__.'/functions/session.php');
    require_once(__DIR__.'/functions/wikiclient.php');
?>

<link type="text/css" rel="stylesheet" href="style/navigation.css" />
<link href='http://fonts.googleapis.com/css?family=Open+Sans:300,400,600' rel='stylesheet' type='text/css' />

<div id="top-bar">
    <span class="wiki-title"><?= $config->wiki_name ?></span>
    <span class="page-title">Dashboard</span>
</div>

<div id="navigation-sidebar">
    <ul id="navigation">
        <li class="active"><a href="pages.php">Dashboard</a></li>
        <li><a href="pages.php">Pages</a></li>
        <li><a href="categories.php">Categories</a></li>
        <li><a href="images.php">Images</a></li>
        <li><a href="settings.php">Settings</a></li>
        <li><a href="logout.php">Logout</a></li>
    </ul>
</div>

<div id="content">
    
<?

$pages = $W->page_list('a+')->pages;
echo "Hi {$_SESSION['username']}<br />";
echo '<a href="logout.php">Logout</a><br />';
echo '<a href="create-page.php">New page</a><br />';

echo '<table>';
foreach ($pages as $page) {
    echo
    '<tr><td>' .
    '<a href="edit-page.php?page='.urlencode($page->file).'">' .
    $page->title .
    '</td></tr>';
}
echo '</table>';

?>
</div>