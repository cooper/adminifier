<?

require_once('functions/session.php');
require_once('functions/wikiclient.php');

print_r($W->page('members'));
print_r($W->catposts('news', 1));

?>