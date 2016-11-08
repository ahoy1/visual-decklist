<?php
$cardname = (isset($_POST['cardname'])) ? $_POST['cardname'] : 'no name';
$cardurl = (isset($_POST['cardurl'])) ? $_POST['cardurl'] : 'no name';
$cardurl = str_replace("%26", "&", $cardurl);

$ch = curl_init($cardurl);
$fp = fopen('img/' . $cardname . '.jpg', 'wb');
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_exec($ch);
curl_close($ch);
fclose($fp);
echo '<br>finished up <br>';

?>

