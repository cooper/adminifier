<?php

$PUBLIC_PAGE = true;
require_once(__DIR__.'/functions/session.php');
require_once(__DIR__.'/private/config.php');

// already logged in
if (isset($_SESSION['logged_in'])) {
    header('Location: dashboard.php');
    die();
}

?>
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title><?= $config->wiki_name ?> login</title>
    <link rel="icon" type="image/png" href="images/favicon.png" />
    <style type="text/css">
        body {
            background-color: #333;
            font-family: sans-serif;
            text-align: center;
        }
        #logo {
            width: 300px;
            border: none;
        }
        td {
            text-align: left;
            font-size: larger;
        }
        input[type=text], input[type=password] {
            width: 200px;
            height: 25px;
            font-size: 20px;
            margin-left: 20px;
            border: 1px solid #999;
        }
        input[type=submit] {
            width: 50px;
            margin-top: 10px;
            height: 25px;
            background-color: #fff;
            border: 1px solid #999;
        }
        input[type=submit]:hover {
            background-color: #eee;
        }
        #box {
            width: 400px;
            padding: 30px;
            border: 1px solid #999;
            background-color: white;
            margin: 50px auto;
        }
        table {
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0 5px;
            width: 100%;
        }
        td.left {
            width: 100px;
            color: #111;
        }
    </style>
</head>
<body>
    <div id="box">
        <div style="text-align: center; margin-bottom: 20px;">
            <?
                if (file_exists(__DIR__.'/images/logo.png'))
                    echo '<img src="images/logo.png" alt="adminifier" id="logo" />';
                else
                    echo '<h1>adminifier</h1>';
            ?>
        </div>
        <form action="functions/login.php" method="post">
            <table>
                <tr>
                    <td class="left">Username</td>
                    <td><input type="text" name="username" /></td>
                </tr>
                <tr>
                    <td class="left">Password</td>
                    <td><input type="password" name="password" /></td>
                </tr>
                <tr>
                    <td><input type="submit" name="submit" value="Login" /></td>
                </tr>
            </table>
        </form>
    </div>
</body>
</html>