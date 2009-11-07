<?php
session_start();

require_once('restapi.php');

$restapi =& new restapi();
$restapi->exec();

/*
var_dump($restapi->output);
*/

?>
