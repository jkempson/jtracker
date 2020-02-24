<?php
if (isset($_GET['key'])) {

$key=$_GET['key'];
$link = mysql_connect("db_url_or_ip", "username", "password") or die(mysql_error()); 
mysql_select_db("jTracker") or die(mysql_error()); 
$data = mysql_query("SELECT securekey FROM data WHERE id='1'");
$i = mysql_fetch_array( $data ); 
mysql_close($link);

if ($key != $i[0]) { echo "Authentication failure - invalid key :("; die(); }
} else {
echo "Authentication failure - no key specified :(";
die();
}
?>
