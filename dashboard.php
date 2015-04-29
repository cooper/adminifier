<?
    require_once(__DIR__.'/functions/session.php');
    require_once(__DIR__.'/functions/wikiclient.php');
?>

<link type="text/css" rel="stylesheet" href="style/navigation.css" />
<link href='http://fonts.googleapis.com/css?family=Open+Sans:300,400,600' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />

<div id="top-bar">
    <span class="account-title"><?= $_SESSION['username'] ?></span>
    <span class="wiki-title"><?= $config->wiki_name ?></span>
    <span class="page-title"><i class="fa fa-home"></i> Dashboard</span>
</div>

<div id="navigation-sidebar">
    <ul id="navigation">
        <li class="active"><a href="pages.php"><i class="fa fa-home"></i> Dashboard</a></li>
        <li><a href="pages.php"><i class="fa fa-file-text"></i> Pages</a></li>
        <li><a href="categories.php"><i class="fa fa-list"></i> Categories</a></li>
        <li><a href="images.php"><i class="fa fa-picture-o"></i> Images</a></li>
        <li><a href="settings.php"><i class="fa fa-cog"></i> Settings</a></li>
        <li><a href="logout.php"><i class="fa fa-arrow-circle-left"></i> Logout</a></li>
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