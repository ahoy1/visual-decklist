<?php 
$bg   = imagecreatefromjpeg('img/shock.jpg');
$over = imagecreatefrompng('images/gradient-overlay.png');
 
imagealphablending($bg, false);
imagesavealpha($bg, true);
 
imagecopy($bg, $over, 276, 300, 0, 0, 123, 119);
imagepng($bg, 'images/shock_dark.png');

 ?>