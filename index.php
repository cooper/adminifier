<?
    require_once(__DIR__.'/functions/session.php');
    require_once(__DIR__.'/private/config.php');
    require_once(__DIR__.'/functions/wikiclient.php');
?>
<!doctype html>
<html>
<head>

<title><?= $config->wiki_name ?> admin</title>
<link type="text/css" rel="stylesheet" href="style/main.css" />
<link type="text/css" rel="stylesheet" href="style/navigation.css" />
<link type="text/css" rel="stylesheet" href="style/page-list.css" />
<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
<script type="text/javascript">

var adminifier = {
    adminRoot:      '<?= addslashes($config->admin_root) ?>',
    wikiName:       '<?= addslashes($config->wiki_name) ?>',
    wikiPageRoot:   '<?= addslashes($config->wiki_page_root) ?>'
};

</script>
<script type="text/javascript" src="script/mootools.js"></script>
<script type="text/javascript" src="script/tmpl.min.js"></script>
<script type="text/javascript" src="script/adminifier.js"></script>
<meta charset="utf-8" />

</head>
<body>

<div id="top-bar">
    <span class="top-title account-title"><a href="#"><i class="fa fa-user"></i> <?= $_SESSION['username'] ?></a></span>
    <span class="top-title create-title"><a class="frame-click" href="#!/create-page"><i class="fa fa-plus-circle"></i> New page</a><br /></span>
    <span class="top-title wiki-title"><?= $config->wiki_name ?></span>
    <span id="page-title" class="top-title page-title"><i class="fa fa-home"></i> Dashboard</span>
</div>

<div id="navigation-sidebar">
    <ul id="navigation">
        <li data-nav="dashboard" class="active"><a class="frame-click" href="#!/dashboard"><i class="fa fa-home"></i> <span>Dashboard</span></a></li>
        <li data-nav="pages"><a class="frame-click" href="#!/pages"><i class="fa fa-file-text"></i> <span>Pages</span></a></li>
        <li data-nav="categories"><a class="frame-click" href="#!/categories"><i class="fa fa-list"></i> <span>Categories</span></a></li>
        <li data-nav="images"><a class="frame-click" href="#!/images"><i class="fa fa-picture-o"></i> <span>Images</span></a></li>
        <li data-nav="settings"><a class="frame-click" href="#!/settings"><i class="fa fa-cog"></i> <span>Settings</a></li>
        <li><a href="logout.php"><i class="fa fa-arrow-circle-left"></i> <span>Logout</span></a></li>
    </ul>
</div>

<div id="content">
</div>

<script type="text/x-tmpl" id="tmpl-link-helper">
    <div id="editor-link-type-internal" class="editor-link-type active" title="Page"><i class="fa fa-file-text"></i></div>
    <div id="editor-link-type-external" class="editor-link-type" title="External wiki page"><i class="fa fa-globe"></i></div>
    <div id="editor-link-type-category" class="editor-link-type" title="Category"><i class="fa fa-list"></i></div>
    <div id="editor-link-type-url" class="editor-link-type" title="External URL"><i class="fa fa-external-link"></i></div>
    <div style="clear: both;"></div>
    <div id="editor-link-wrapper">
    <span id="editor-link-title1">Page target</span><br />
    <input id="editor-link-target" class="editor-full-width-input" type="text" placeholder="My Page" />
    <span id="editor-link-title2">Display text</span><br />
    <input id="editor-link-display" class="editor-full-width-input" type="text" placeholder="Click here" /><br/>
    </div>
    <div id="editor-link-insert" class="editor-tool-large-button">Insert page link</div>
</script>

<script type="text/x-tmpl" id="tmpl-save-helper">
    <div id="editor-save-wrapper">
    Edit summary<br />
    <input id="editor-save-message" class="editor-full-width-input" type="text" placeholder="Updated {%= o.file %}" /> \
    </div>
    <div id="editor-save-commit" class="editor-tool-large-button">Commit changes</div>
</script>

<script type="text/x-tmpl" id="tmpl-save-spinner">
    <div style="text-align: center; line-height: 60px; height: 60px;"><i class="fa fa-spinner fa-3x fa-spin center"></i></div>
</script>

</body>
</html>
