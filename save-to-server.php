<?php
$cardnames = (isset($_POST['cardnames'])) ? $_POST['cardnames'] : 'no name';
/*$cardnames = str_replace('%20', '', $cardnames);
$cardnames = str_replace('%27', '', $cardnames);
*/$cardnames = explode(',', $cardnames);

$cardurls = (isset($_POST['cardurls'])) ? $_POST['cardurls'] : 'no name';
$cardurls = str_replace('%26', '&', $cardurls);
$cardurls = explode(',', $cardurls);

for ($i=0; $i < count($cardnames); $i++) { 
	$ch = curl_init($cardurls[$i]);
	$fp = fopen('img/' . $cardnames[$i] . '.jpg', 'wb');
	curl_setopt($ch, CURLOPT_FILE, $fp);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_exec($ch);
	curl_close($ch);
	fclose($fp);
}

echo 'finished saving card images';

?>

