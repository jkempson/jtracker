<?php 
#include "security.php"; 
if (isset($_GET[ 'offset'])) { $offset=$_GET[ 'offset']; } else { $offset=0; } 
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <title>jTracker</title>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?amp;key=AIzaSyDjrq-vrcneeuQNHY92jCUurHZt-3Q8vQk&libraries=geometry"></script>
    <meta name="viewport" content="width = device-width, initial-scale = 0.9, user-scalable = no" />
    <link href="favicon.ico" rel="icon" type="image/x-icon" />
    <style type="text/css">
        #data {
            background-color: black;
            color: white;
            opacity: 0.7;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            text-align: left;
            width: 100%;
            vertical-align: middle;
            z-index: 100;
            position: fixed;
            left: -5px;
            right: 5px;
            bottom: 0px;
            z-index: 1;
            display: block;
            padding-left: 10px;
            padding-right: 10px;
            display: table;

        }

        .column {
            display: table-cell;
            float: left;
            vertical-align: middle;
        }

        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 0;
        }
        #map label {
            width: auto;
            display: inline;
        }
        #map img {
            max-height: none;
            max-width: none;
        }
        input[type=checkbox].css-checkbox {
            position: absolute;
            z-index: -1000;
            left: -1000px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            height: 1px;
            width: 1px;
            margin: -1px;
            padding: 0;
            border: 0;
        }
        input[type=checkbox].css-checkbox + label.css-label {
            padding-left: 35px;
            display: inline-block;
            line-height: 30px;
            background-repeat: no-repeat;
            background-position: 0 0;
            vertical-align: middle;
            cursor: pointer;
        }
        input[type=checkbox].css-checkbox:checked + label.css-label {
            background-position: 0 -30px;
        }
        label.css-label {
            background-image: url(checkbox.png);
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    </style>

</head>

<body onload="start()" onunload="GUnload()">
    <script src="jtrack.js" type="text/javascript"></script>
    <script type="text/javascript"></script>
    <noscript>
        <p>Please enable JavaScript.</p>
    </noscript>
    <div id="data">

                <div class="column" style="width: 50%"><span id="time"></div>
                <div class="column" style="width: 49%; text-align:right">
                    <input type="checkbox" name="checkboxG1" id="checkboxG1" class="css-checkbox" onchange=check() />
                    <label for="checkboxG1" class="css-label">Autozoom</label>
                </div>
                <div class="column" style="width: 49%"></div>

        <form name="f" style="margin-top: 0px">
            <input type="hidden" id="key" value="<?= $key ?>" />
            <input type="hidden" id="offset" value="<?= $offset ?>" />
            <span class="value" id="error"></span>
        </form>
    </div>

    <div id="map" style="width:100%; height:100%"></div>

</body>

</html>
