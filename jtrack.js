/* jTracker (c) Jonathan Kempson 2013 */
var map;
var jKey;
var marker;
var startLatLng = new google.maps.LatLng(50, -3);
var allowMapMove = true;
var dragEpoch = 0;
var posX = 0;
var posY = 0;
var zoomX = 0;
var zoomY = 0;
var posS = 0;
var posT = "";
var posE;
var dispX = 0;
var dispY = 0;
var setZoom = 1;
var x_Velocity = 0;
var y_Velocity = 0;
var autoZoom = false;
var autoZoomName = "checkboxG1";

var directionsService
var directionsDisplay;

function start() {
    jKey = document.f.key.value;
    offset = document.f.offset.value;
    if (!document.getElementById) {
        return;
    }
    // Set map options
    var myOptions = {
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        center: startLatLng,
        streetViewControl: false,
        panControl: false,
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }],
        }]
    }

    // Create map, map
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    loadMapState();

    //var letter = String.fromCharCode("Z".charCodeAt(0));
    //zoom_marker = new google.maps.Marker({
    //    position: startLatLng,
    //    icon: "https://maps.google.com/mapfiles/marker" + letter + ".png",
    //});
    //zoom_marker.setVisible(true);

    //zoom_marker.setMap(map);

    var letter = String.fromCharCode("J".charCodeAt(0));
    // Create marker, marker
    marker = new google.maps.Marker({
        position: startLatLng,
        icon: "https://maps.google.com/mapfiles/marker" + letter + ".png",
    });
    marker.setMap(map);
    
    
    // Enable traffic layer
    trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    google.maps.event.addListener(map, "zoom_changed", function() {
        saveMapState();
        var center = new google.maps.LatLng(posX, posY);
        map.panTo(center);
    })

    google.maps.event.addListener(map, "maptypeid_changed", function() {
        saveMapState();
        var center = new google.maps.LatLng(posX, posY);
        map.panTo(center);
    })

    google.maps.event.addListener(map, "dragstart", function(event) {
        allowMapMove = false;
        dragEpoch = (new Date).getTime();
    })

    google.maps.event.addListener(map, "dragend", function(event) {
        allowMapMove = true;
        dragEpoch = (new Date).getTime();
    })

    setInterval("updateData()", 1000);
    setInterval("mainLoop()", 100);
}

function mainLoop() {

    // google maps object setup?
    if (!map) return;

    // has there been any data from rtt yet?
    if (posE == 0) return;

    var intPoint = [];
    var gap = (Date.now() - posE);

    if ((dispX) && gap < 5000) {
        dispX = cdsX(posX, dispX, 0.050)
    } else {
        dispX = posX
    };
    if ((dispY) && gap < 5000) {
        dispY = cdsY(posY, dispY, 0.050)
    } else {
        dispY = posY
    };

    var posLatLng = new google.maps.LatLng(parseFloat(dispX), parseFloat(dispY));
    marker.setPosition(posLatLng);

    if ((allowMapMove) && (((new Date).getTime() - dragEpoch) > 8000)) {
        map.panTo(marker.getPosition());
    }

}

function cdsX(a_Target, a_Current, a_TimeStep) {
    var spring_constant = 1;

    var currentToTarget = a_Target - a_Current;
    var springForce = currentToTarget * spring_constant;
    var dampingForce = -x_Velocity * 2 * Math.sqrt(spring_constant);
    var force = springForce + dampingForce;
    x_Velocity += force * a_TimeStep;
    var displacement = x_Velocity * a_TimeStep;
    return a_Current + displacement;
}

function cdsY(a_Target, a_Current, a_TimeStep) {
    var spring_constant = 1;

    var currentToTarget = a_Target - a_Current;
    var springForce = currentToTarget * spring_constant;
    var dampingForce = -y_Velocity * 2 * Math.sqrt(spring_constant);
    var force = springForce + dampingForce;
    y_Velocity += force * a_TimeStep;
    var displacement = y_Velocity * a_TimeStep;
    return a_Current + displacement;
}

function updateData() {
    var stream;
    stream = new XMLHttpRequest();

    stream.open("GET", "rtt.php?key=" + jKey + "&offset=" + offset, true);
    stream.send(null);

    stream.onreadystatechange = function() {
        if (stream.readyState == 4) {
            var tryStream;
            try {
                tryStream = stream.status;
            } catch (e) {
                document.getElementById("error").innerHTML = "Service is unavailable";
                return;
            }

            if (stream.status == 200) {
                var streamData = stream.responseText;
                var posArr = streamData.split("|");

                if (posT != posArr[5]) {
                    posE = Date.now();
                    posT = posArr[5];
                }

                posX = parseFloat(posArr[1]);
                posY = parseFloat(posArr[2]);
                
                if (autoZoom == true) {
                    zoomX = parseFloat(posArr[3]);
                    zoomY = parseFloat(posArr[4]);

                    var radius = google.maps.geometry.spherical.computeDistanceBetween (new google.maps.LatLng(posX, posY), new google.maps.LatLng(zoomX, zoomY));
                    console.log("Radius: "+radius);
                    var circleOptions = {
                        center: new google.maps.LatLng(posX, posY),
                        fillOpacity: 0,
                        strokeOpacity:0,
                        map: map,
                        radius: radius * 2.5
                    }
                    
                    var myCircle = new google.maps.Circle(circleOptions);
                    ////var posLatLng = new google.maps.LatLng(parseFloat(zoomX), parseFloat(zoomY));
                    //zoom_marker.setPosition(posLatLng);

                    //var bounds = new google.maps.LatLngBounds();
                    //bounds.extend(new google.maps.LatLng(posX, posY));
                    //bounds.extend(new google.maps.LatLng(zoomX, zoomY));
                    
                    
                    new_zoom = getZoomByBounds(map, myCircle.getBounds());                    
                    if (map.getZoom() != new_zoom) { map.setZoom(new_zoom); }
                } 
                
                
                // Populate HTML elements
                document.getElementById("time").innerHTML = posArr[0];
                document.getElementById("error").innerHTML = "";


            } else if (stream.status == 400) {
                document.getElementById("error").innerHTML = "Unknown error";
            } else {
                document.getElementById("error").innerHTML = "Service is unavailable";
            }
        }
    };
}

function saveMapState() {
    var mapZoom = map.getZoom();
    var mapType = map.getMapTypeId();
    var cookiestring = mapZoom + "_" + mapType+"_"+document.getElementById(autoZoomName).checked;
    console.log("Saving cookie " + cookiestring);
    setCookie("jTrackerCookie", cookiestring, 30);
}

function loadMapState() {
    var gotCookieString = getCookie("jTrackerCookie");
    console.log("Loading cookie " + gotCookieString);

    var splitStr = gotCookieString.split("_");
    var savedMapZoom = parseFloat(splitStr[0]);
    var savedMapType = (splitStr[1]);
    var savedAutoZoom = (splitStr[2])
    if ((!isNaN(savedMapZoom)) && (savedMapType) && (savedAutoZoom)) {
        map.setMapTypeId(google.maps.MapTypeId[savedMapType.toUpperCase()]);
        map.setZoom(savedMapZoom);
        if (savedAutoZoom == "false") {
            document.getElementById(autoZoomName).checked=false;
            autoZoom=false;
        } else {
            document.getElementById(autoZoomName).checked=true;
            autoZoom=true;
        }
    } else {
        map.setZoom(17);
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        document.getElementById(autoZoomName).checked=true;
    }
    
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
    return "";
}

function check() {
    if(document.getElementById(autoZoomName).checked==false) { 
        autoZoom=false;
    } else {
        autoZoom=true;
    }
    saveMapState();
}


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function getZoomLevel(radius) {
    var scale = radius / 500;
    zoomLevel = Math.round(16 - Math.log(scale) / Math.log(2));
    return zoomLevel;
}

function getZoomByBounds( map, bounds ){
  //var MAX_ZOOM = map.mapTypes.get( map.getMapTypeId() ).maxZoom || 15 ;
  //var MIN_ZOOM = map.mapTypes.get( map.getMapTypeId() ).minZoom || 3 ;
  var MAX_ZOOM = 18;
  var MIN_ZOOM = 3;
    
  var ne= map.getProjection().fromLatLngToPoint( bounds.getNorthEast() );
  var sw= map.getProjection().fromLatLngToPoint( bounds.getSouthWest() ); 

  var worldCoordWidth = Math.abs(ne.x-sw.x);
  var worldCoordHeight = Math.abs(ne.y-sw.y);

  //Fit padding in pixels 
  var FIT_PAD = 40;

  for( var zoom = MAX_ZOOM; zoom >= MIN_ZOOM; --zoom ){ 
      if( worldCoordWidth*(1<<zoom)+2*FIT_PAD < document.getElementById("map").offsetWidth && 
          worldCoordHeight*(1<<zoom)+2*FIT_PAD < document.getElementById("map").offsetHeight )
          return zoom;
  }
  return 0;
}
