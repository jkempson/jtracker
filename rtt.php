<?php
include "security.php";

$offset    = 0;
$average_period = 180;
$epoch_avg = time() - $average_period;

if ((isset($_GET['offset'])) && ($_GET['offset'] > 0)) {
    $offset    = $_GET['offset'];
    $epoch_avg = time() - ($offset * 60) - $average_period;
    
    $epoch       = time() - ($offset * 60);
    $epoch_query = "WHERE epoch<=$epoch";
    $hist_query  = "AND epoch<=$epoch";
} else {
    $epoch_query = "";
    $hist_query  = "";
}

$db = new mysqli('fda.cvynmay4jozo.eu-west-1.rds.amazonaws.com', 'jon', '!upAVYC7f36!', 'jTracker');

$result = $db->query("SELECT epoch, lat, lon FROM log $epoch_query ORDER BY epoch DESC LIMIT 1");
$i      = $result->fetch_row();

# Convert epochs to human readable
$epoch = $i[0];
if (isset($i[0])) {
    if (((time() - ($offset *60)) - $i[0]) <= 10) {
        $i[0] = "Live";    
    } else {
        $i[0] = "Last signal ".secs_to_str((time() - ($offset * 60)) - $i[0])." ago";
        #$i[0] = convEpoch($i[0]);
    }
    if ($offset != 0) {
        $i[0] .= "<br>".convEpoch(time() - ($offset * 60));
    }
} else {
    $i[0] = "";
}

#$result = $db->query("SELECT lat, lon FROM log WHERE epoch>=$epoch_avg $hist_query");
$result = $db->query("SELECT lat, lon, epoch FROM log WHERE epoch>=$epoch_avg ORDER BY epoch ASC LIMIT 1");
$s = $result->fetch_row();
if ($s[0] != "") {
    $i[3] = $s[0];
    $i[4] = $s[1];
} else {
    $i[3] = $i[1];
    $i[4] = $i[2];
}
$i[5] = $epoch;
print join("|", $i);

function convEpoch($epoch)
{
    date_default_timezone_set('Europe/London');
    #return date("D, d M Y H:i" . $seconds, $epoch);
    return date("jS M Y - g:i:s a", $epoch);

}


function calcDistance(
  $latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000)
{
  // convert from degrees to radians
  $latFrom = deg2rad($latitudeFrom);
  $lonFrom = deg2rad($longitudeFrom);
  $latTo = deg2rad($latitudeTo);
  $lonTo = deg2rad($longitudeTo);

  $latDelta = $latTo - $latFrom;
  $lonDelta = $lonTo - $lonFrom;

  $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
    cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
  return $angle * $earthRadius;
}

function secs_to_str ($duration)
{
    $periods = array(
        'day' => 86400,
        'hour' => 3600,
        'minute' => 60,
        'second' => 1
    );
 
    $parts = array();
 
    foreach ($periods as $name => $dur) {
        $div = floor($duration / $dur);
 
        if ($div == 0)
            continue;
        else
            if ($div == 1)
                $parts[] = $div . " " . $name;
            else
                $parts[] = $div . " " . $name . "s";
        $duration %= $dur;
    }
 
    $last = array_pop($parts);
 
    if (empty($parts))
        return $last;
    else
        //return join(', ', $parts) . " and " . $last;
        return join(' ', $parts);
}
?>
