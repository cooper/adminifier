<?
    require_once(__DIR__.'/functions/session.php');
    require_once(__DIR__.'/functions/wikiclient.php');
?>
<!doctype html>
<html>
<head>
    
<title><?= $config->wiki_name ?> admin</title>
<link type="text/css" rel="stylesheet" href="style/main.css" />
<link type="text/css" rel="stylesheet" href="style/navigation.css" />
<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
<script type="text/javascript" src="script/mootools.js"></script>
<script type="text/javascript" src="script/adminifier.js"></script>
<meta charset="utf-8" />

</head>
<body>
    
<div id="top-bar">
    <span class="top-title account-title"><a href="#"><i class="fa fa-user"></i> <?= $_SESSION['username'] ?></a></span>
    <span class="top-title create-title"><a class="frame-click" href="#!/create-page"><i class="fa fa-plus-circle"></i> New page</a><br /></span>
    <span class="top-title wiki-title"><?= $config->wiki_name ?></span>
    <span class="top-title page-title"><i class="fa fa-home"></i> Dashboard</span>
</div>

<div id="navigation-sidebar">
    <ul id="navigation">
        <li class="active"><a href="<?= $config->admin_root ?>/"><i class="fa fa-home"></i> Dashboard</a></li>
        <li><a class="frame-click" href="#!/pages"><i class="fa fa-file-text"></i> Pages</a></li>
        <li><a class="frame-click" href="#!/categories"><i class="fa fa-list"></i> Categories</a></li>
        <li><a class="frame-click" href="#!/images"><i class="fa fa-picture-o"></i> Images</a></li>
        <li><a class="frame-click" href="#!/settings"><i class="fa fa-cog"></i> Settings</a></li>
        <li><a href="logout.php"><i class="fa fa-arrow-circle-left"></i> Logout</a></li>
    </ul>
</div>

<div id="content">
    
<?

$pages = $W->page_list('a+')->pages;

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
    
</body>
</html>