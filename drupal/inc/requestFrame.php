<?php

$url_string = $_GET['url'];

if(isset($url_string)) {
	$frame = "<img src=" . $url_string . ">";
	print $frame;
}

else {
	echo "The feed $url_string was unavailable.";
}

?>
