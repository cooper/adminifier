<meta
    data-nav="dashboard"
    data-title="Dashboard"
    data-icon="home"
    data-styles="dashboard"
    data-flags="buttons"
    data-buttons="date-selection"
    data-button-date-selection="{'title': 'Last 30 days', 'icon': 'calendar', 'func': 'displayDateSelector'}"
/>
<h2>Server logs</h2>
<pre id="server-logs">
<?
require_once(__DIR__.'/../functions/utils.php');

$lines = $W->logs()->logs;
foreach ($lines as $line)
    echo "$line\n";
?>
</pre>
