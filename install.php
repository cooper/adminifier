<?

$config = __DIR__.'/private/config.json';

// already set up
if (file_exists($config)) {
    header('Location: index.php');
    die();
}

// write config
if ($_POST['wiki_name']) {
    $json = json_encode($_POST);
    $fh = fopen($config, 'w') or die("Unable to write $config");
    fputs($fh, $json);
    fclose($fh);
    header('Location: login.php');
    die();
}

$dir  = dirname($_SERVER['DOCUMENT_ROOT']);
$dirs = explode('/', $dir);
$dir  = $dirs[0]; // get first dir

?>
<!doctype html>
<html>
<head>
    <meta charset="utf-8" data-wredirect="login.php" />
    <title>adminifier setup</title>
    <link rel="icon" type="image/png" href="images/favicon.png" />
    <link href='http://fonts.googleapis.com/css?family=Open+Sans:300,400,600' rel='stylesheet' type='text/css' />
    <link type="text/css" rel="stylesheet" href="style/main.css" />
    <style type="text/css">
        body {
            background-color: #333;
            font-family: 'Open Sans', sans-serif;
            text-align: center;
        }
        
        #logo {
            width: 300px;
            border: none;
        }
        
        #setup-window {
            width: 800px;
            padding: 30px;
            border: 1px solid #999;
            background-color: white;
            margin: 50px auto;
        }
        
        #setup-window td {
            text-align: left;
            font-size: larger;
        }

        #setup-window input {
            font-family: 'Open Sans', sans-serif;
        }

        #setup-window input[type=text], input[type=password] {
            width: 500px;
            margin-left: 20px;
            border: 1px solid #999;
        }

        #setup-window input[type=submit] {
            width: 50px;
            margin-top: 10px;
            height: 25px;
            background-color: #fff;
            border: 1px solid #999;
        }

        #setup-window input[type=submit]:hover,
        #setup-window input[type=submit]:active {
            background-color: #eee;
            color: #000;
        }

        #setup-window table {
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0 8px;
            width: 90%;
            margin: auto;
        }

        #setup-window td.left {
            width: 200px;
            color: #111;
        }
        
    </style>
</head>
<body>
    <div id="setup-window">
        <div style="text-align: center; margin-bottom: 20px;">
            <?
                if (file_exists(__DIR__.'/images/logo.png'))
                    echo '<img src="images/logo.png" alt="adminifier" id="logo" />';
                else
                    echo '<h1>'.$config->wiki_name.'</h1>';
            ?>
        </div>
        Please configure your adminifier instance:
        <form action="install.php" method="post">
            <table>
                <tr>
                    <td class="left">Wikiclient path</td>
                    <td><input type="text" name="wikiclient_path" value="<?= htmlspecialchars(__DIR__.'/php-wikiclient/Wikiclient.php') ?>"/></td>
                </tr>
                <tr>
                    <td class="left">wikiserver socket path</td>
                    <td><input type="text" name="wiki_sock" /></td>
                </tr>
                <tr>
                    <td class="left">wiki shortname</td>
                    <td><input type="text" name="wiki_name" /></td>
                </tr>
                <tr>
                    <td class="left">wiki password</td>
                    <td><input type="password" name="wiki_pass" /></td>
                </tr>
                <tr>
                    <td class="left">wiki page root</td>
                    <td><input type="text" name="wiki_root" /></td>
                </tr>
                <tr>
                    <td class="left">adminifier web root</td>
                    <td><input type="text" name="wiki_page_root" value="<?= htmlspecialchars($dir) ?>"/></td>
                </tr>
                <tr>
                    <td><input type="submit" name="submit" value="Install" /></td>
                </tr>
            </table>
        </form>
    </div>
</body>
</html>
