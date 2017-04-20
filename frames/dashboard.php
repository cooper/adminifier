<meta data-nav="dashboard" data-title="Dashboard" data-icon="home" />
<pre>
<?
require_once(__DIR__.'/../functions/utils.php');

$lines = $W->logs()->logs;
foreach ($lines as $line)
    echo "$line\n";
?>
</pre>
