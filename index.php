<?
    require_once(__DIR__.'/functions/session.php');
    require_once(__DIR__.'/private/config.php');
    require_once(__DIR__.'/functions/wikiclient.php');

    function option_if_set (&$opt) {
        if (!isset($opt)) return 'null';
        return json_encode($opt);
    }
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title><?= htmlspecialchars($wiki_name) ?></title>
<link type="text/css" rel="stylesheet" href="style/main.css" />
<link type="text/css" rel="stylesheet" href="style/navigation.css" />
<link type="text/css" rel="stylesheet" href="style/notifications.css" />
<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
<script type="text/javascript">

var adminifier = {
    adminRoot:      <?= option_if_set($config->admin_root)      ?>,
    wikiShortName:  <?= option_if_set($config->wiki_name)       ?>,
    wikiName:       <?= option_if_set($wiki_name)               ?>,
    wikiPageRoot:   <?= option_if_set($config->wiki_page_root)  ?>,
    themeName:      <?= option_if_set($user_info->theme)        ?>,
    autosave:       <?= 5 * 60 * 1000 ?>

};

</script>
<script type="text/javascript" src="script/mootools.js"></script>
<script type="text/javascript" src="script/tmpl.min.js"></script>
<script type="text/javascript" src="script/adminifier.js"></script>
<script type="text/javascript" src="script/notifications.js"></script>
<script type="text/javascript" src="script/modal-window.js"></script>

</head>
<body>

<div id="top-bar">
    <span class="top-title account-title"><a href="#"><i class="fa fa-user"></i> <?= $user_info->realname ?></a></span>
    <span class="top-title top-button"><a class="frame-click" href="#!/create-page"><i class="fa fa-plus-circle"></i> New page</a></span>
    <input id="top-search" type="text" placeholder="Search..." />
    <span class="top-title wiki-title"><?= $wiki_name ?></span>
    <span id="page-title" class="top-title page-title"><i class="fa fa-home"></i> <span></span></span>
</div>

<div id="navigation-sidebar">
    <ul id="navigation">
        <li data-nav="dashboard"><a class="frame-click" href="#!/dashboard"><i class="fa fa-home"></i> <span>Dashboard</span></a></li>
        <li data-nav="pages"><a class="frame-click" href="#!/pages"><i class="fa fa-file-text"></i> <span>Pages</span></a></li>
        <li data-nav="categories"><a class="frame-click" href="#!/categories"><i class="fa fa-list"></i> <span>Categories</span></a></li>
        <li data-nav="images"><a class="frame-click" href="#!/images"><i class="fa fa-picture-o"></i> <span>Images</span></a></li>
        <li data-nav="models"><a class="frame-click" href="#!/models"><i class="fa fa-cube"></i> <span>Models</span></a></li>
        <li data-nav="settings"><a class="frame-click" href="#!/settings"><i class="fa fa-cog"></i> <span>Settings</a></li>
        <li data-nav="help"><a class="frame-click" href="#!/help"><i class="fa fa-question-circle"></i> <span>Help</a></li>
        <li><a href="logout.php"><i class="fa fa-arrow-circle-left"></i> <span>Logout</span></a></li>
    </ul>
</div>

<div id="content">
</div>

<?
    require_once(__DIR__.'/templates/adminifier-tmpl.php');
    require_once(__DIR__.'/templates/login-tmpl.php');
    require_once(__DIR__.'/templates/editor-tmpl.php');
?>

</body>
</html>
