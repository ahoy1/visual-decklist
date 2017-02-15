<?php
// function mergeImages($filename_x, $filename_y, $filename_result) {

//  // Get dimensions for specified images

//  list($width_x, $height_x) = getimagesize($filename_x);
//  list($width_y, $height_y) = getimagesize($filename_y);

//  // Create new image with desired dimensions

//  $image = imagecreatetruecolor($width_x + $width_y, $height_x);

//  // Load images and then copy to destination image

//  $image_x = imagecreatefromjpeg($filename_x);
//  $image_y = imagecreatefromgif($filename_y);

//  imagecopy($image, $image_x, 0, 0, 0, 0, $width_x, $height_x);
//  imagecopy($image, $image_y, $width_x, 0, 0, 0, $width_y, $height_y);

//  // Save the resulting image to disk (as JPEG)

//  imagejpeg($image, $filename_result);

//  // Clean up

//  imagedestroy($image);
//  imagedestroy($image_x);
//  imagedestroy($image_y);

// }

$cardnames = (isset($_POST['cardnames'])) ? $_POST['cardnames'] : 'no name';
/*$cardnames = str_replace('%20', '', $cardnames);
$cardnames = str_replace('%27', '', $cardnames);
*/$cardnames = explode(',', $cardnames);

$cardurls = (isset($_POST['cardurls'])) ? $_POST['cardurls'] : 'no name';
$cardurls = str_replace('%26', '&', $cardurls);
$cardurls = explode(',', $cardurls);

for ($i=0; $i < count($cardnames); $i++) { 

$filename = 'img/' . $cardnames[$i] . '.jpg';

	if (file_exists(!$filename)) {
		//file doenst exist yet, lets save it
		$ch = curl_init($cardurls[$i]);
		$fp = fopen('img/' . $cardnames[$i] . '.jpg', 'wb');
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_exec($ch);
		curl_close($ch);
		fclose($fp);

		//merge('images/gradient-overlay.png', 'img/' . $cardnames[$i] . '.jpg', 'images/' . $cardnames[$i] . '_dark	.jpg');
	}
}





echo 'finished saving card images';

