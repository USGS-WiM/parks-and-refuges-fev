var stnServicesURL = 'https://stn.wim.usgs.gov/STNServices';
//var stnServicesURL = 'https://stntest.wim.usgs.gov/STNServices2'; //test URL
var sensorPageURLRoot = "https://stn.wim.usgs.gov/STNPublicInfo/#/SensorPage?Site=";
var hwmPageURLRoot = "https://stn.wim.usgs.gov/STNPublicInfo/#/HWMPage?Site=";

var fev = fev || {
	data: {
		events: [],
		eventTypes: [],
		states: [],
		counties : [],
		sensorTypes : [],
		sensorStatusTypes : [],
		collectionConditions: [],
		deploymentTypes : [],
		hwmTypes: [],
		hwmQualities : []
	},
	urls: {
		jsonSensorsURLRoot : stnServicesURL + '/Instruments/FilteredInstruments.json',
		xmlSensorsURLRoot: stnServicesURL + '/Instruments/FilteredInstruments.xml',
		csvSensorsURLRoot : stnServicesURL + '/Instruments/FilteredInstruments.csv',

		jsonHWMsURLRoot : stnServicesURL + '/HWMs/FilteredHWMs.json',
		xmlHWMsURLRoot : stnServicesURL + '/HWMs/FilteredHWMs.xml',
		csvHWMsURLRoot : stnServicesURL + '/HWMs/FilteredHWMs.csv',
		hwmFilteredGeoJSONViewURL: stnServicesURL + '/HWMs/FilteredHWMs.geojson',
		hwmGeoJSONViewURL: stnServicesURL + '/hwms.geojson',

		xmlPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.xml',
		jsonPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.json',
		csvPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.csv',
		peaksFilteredGeoJSONViewURL: stnServicesURL + '/PeakSummaries/FilteredPeaks.geojson',

		baroGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=baro_view&',
		metGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=met_view&',
		rdgGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=rdg_view&',
		stormtideGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=stormtide_view&',
		waveheightGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=waveheight_view&'
	},
	queryStrings: {
	},
	vars : {
		currentEventName:"",
		currentEventID_str: "",
		currentEventStartDate_str : "",
		currentEventEndDate_str : "",
		currentEventActive : false,
		extentNorth : 71.3888898,  // north lat: Point Barrow Alaska
		extentWest : -179.148611, //west long: Amatignak Island, Alaska
		extentEast :  -66.947028, //east long: Sail Rock, Maine
		extentSouth :  18.910833  //south lat: Ka Lae. Hawaii
	},
	layerList: 	[
		{
			"ID": "baro",
			"Name": "Barometric Pressure Sensor",
			"Type":"sensor",
			"Category": "observed"
		},
		{
			"ID": "stormtide",
			"Name": "Storm Tide Sensor",
			"Type":"sensor",
			"Category": "observed"
		},
		{
			"ID": "met",
			"Name": "Meteorological Sensor",
			"Type":"sensor",
			"Category": "observed"
		},
		{
			"ID": "waveheight",
			"Name": "Wave Height Sensor",
			"Type":"sensor",
			"Category": "observed"
		},
		{
			"ID": "rdg",
			"Name": "Rapid Deployment Gage",
			"Type":"sensor",
			"Category": "real-time"
		},
		{
			"ID": "hwm",
			"Name": "High Water Mark",
			"Type":"observed",
			"Category": "observed"
		},
		{
			"ID": "peak",
			"Name": "Peak Summary",
			"Type":"interpreted",
			"Category": "interpreted"
		},
		{
			"ID": "int",
			"Name": "Interest Boundaries",
			"Type":"fws",
			"Category": "fws"
		},
		{
			"ID": "appr",
			"Name": "Approved Acquisition Boundaries",
			"Type":"fws",
			"Category": "fws"
		}
	]
};

//L.esri.Support.cors = true;

var map;
var markerCoords = [];
var oms;

var baroMarkerIcon = L.icon({className: 'baroMarker', iconUrl: 'images/baro.png',  iconAnchor: [7, 10], popupAnchor: [0, 2]});
var metMarkerIcon = L.icon({className: 'metMarker', iconUrl: 'images/met.png',  iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16,16]});
var rdgMarkerIcon = L.icon({className: 'rdgMarker', iconUrl: 'images/rdg.png',  iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16,16]});
var stormtideMarkerIcon = L.icon({className: 'stormtideMarker', iconUrl: 'images/stormtide.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16,16]});
var waveheightMarkerIcon = L.icon({className: 'waveheightMarker', iconUrl: 'images/waveheight.png',  iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [12,12]});
var hwmMarkerIcon = L.icon({className: 'hwmMarker', iconUrl: 'images/hwm.png', iconAnchor: [7, 10], popupAnchor: [0, 2]});
var peakMarkerIcon = L.icon({className: 'peakMarker', iconUrl: 'images/peak.png',  iconAnchor: [7, 10], popupAnchor: [0, 2]});
var nwisMarkerIcon = L.icon({className: 'nwisMarker', iconUrl: 'images/nwis.png',  iconAnchor: [7, 10], popupAnchor: [0, 2]});
var nwisRainMarkerIcon = L.icon({className: 'nwisMarker', iconUrl: 'images/rainIcon.png',  iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [30,30]});

//sensor subgroup layerGroups for sensor marker cluster group(layerGroup has no support for mouse event listeners)
var	baro = L.layerGroup();
var stormtide = L.layerGroup();
var	met = L.layerGroup();
var	waveheight = L.layerGroup();
var hwm = L.layerGroup();
var peak = L.layerGroup();
var appr = L.layerGroup();
var int = L.layerGroup();

// refuge layer
/* var refuges = L.esri.dynamicMapLayer({
	url: "https://gis.fws.gov/arcgis/rest/services/FWS_Refuge_Boundaries/MapServer",
	//opacity: 0.5,
	//f:'image'
}); */

// regions
/* var regions = L.esri.dynamicMapLayer({
	url: "https://gis.fws.gov/ArcGIS/rest/services/FWS_Regional_Boundaries/MapServer",
	//opacity: 0.5,
	//f:'image'
}); */

$.ajax({
	url: "https://gis.fws.gov/arcgis/rest/services/FWS_Refuge_Boundaries/MapServer/2",
	async: false,
	dataType: 'json',
	success: function(data) {
		if (data[0].label == "No active advisories at this time") {
			noAdvisories = true;
			test = data;
			console.log(noAdvisories);
		} else {
			//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
			//noaaService = noaaTrack;
			console.log("noaa layer added");
		}
	}
});

//rdg and USGSrtGages layers must be featureGroup type to support mouse event listeners
var rdg = L.featureGroup();
var USGSRainGages = L.featureGroup();
var USGSrtGages = L.featureGroup();
var noaaService = L.esri.dynamicMapLayer({
	url:"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
	opacity: 0.5,
	f:'image'
})

var noAdvisories = false;
var test;

$.ajax({
	url: "https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time",
	async: false,
	dataType: 'json',
	success: function(data) {
		if (data[0].label == "No active advisories at this time") {
			noAdvisories = true;
			test = data;
			console.log(noAdvisories);
		} else {
			//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
			//noaaService = noaaTrack;
			console.log("noaa layer added");
		}
	}
});

// FWS Approved Acquisition Boundaries 
var appr = L.esri.featureLayer({
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved/FeatureServer/1",
	//opacity: 0.5,
	minZoom: 9,
	style: function (feature) {
		return { color: 'brown', weight: 2 };
	}
})

var int = L.esri.featureLayer({
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSInterest_Simplified_Authoritative/FeatureServer/1",
	//opacity: 0.5,
	minZoom: 9,
	style: function (feature) {
		if ((feature.properties.INTTYPE1 === 'F') || (feature.properties.INTTYPE1 === 'O')) {
			return { color: 'green', weight: 2 };
		}  if (feature.properties.INTTYPE1 === 'S') {
			return { color: 'purple', weight: 2 };
		}  if (feature.properties.INTTYPE1 === 'E') {
			return { color: 'orange', weight: 2 };
		}  if (feature.properties.INTTYPE1 === 'L') {
			return { color: 'yellow', weight: 2 };
		}  if (feature.properties.INTTYPE1 === 'S') {
			return { color: 'beige', weight: 2 };
		}  if (feature.properties.INTTYPE1 === 'P') {
			return { color: 'blue', weight: 2 };
		}  if (feature.properties.INTTYPE1 === 'U') {
			return { color: 'red', weight: 2 };
		} else {
			return { color: 'black', weight: 2 };
		}
	}
})

int.bindPopup(function(layer){
	return L.Util.template('<p>INTTYPE1: {INTTYPE1}', layer.properties);
})


/* $.getJSON('https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time', {
	async: false,
})
	.done(function (data) {
		//if any results (features in the bounding box), then add forecast track layer to map, add toggle to interpreted data category.

			if (data[0].label == "No active advisories at this time") {
				noAdvisories = true;
				console.log(noAdvisories);
			} else {
				//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
				//noaaService = noaaTrack;
				console.log("noaa layer added");
			}
	})
	.fail(function () {
		console.log("NOAA Tropical Cyclone legend retrieve failed.");
	}); */

	/* function callbackFuncWithData(data)
		{
			if (data[0].label == "No active advisories at this time") {
				noAdvisories = true;
				console.log(test);
			} else {
				//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
				//noaaService = noaaTrack;
				console.log("noaa layer added");
			}
		} */

/////markercluster code, can remove eventually
// Marker Cluster Group for sensors
// var sensorMCG = L.markerClusterGroup({
// 	//options here
// 	disableClusteringAtZoom: 8,
// 	spiderfyOnMaxZoom: false,
// 	zoomToBoundsOnClick: true
// });
// var	baro = L.featureGroup.subGroup(sensorMCG);
// var stormTide = L.featureGroup.subGroup(sensorMCG);
// var	met = L.featureGroup.subGroup(sensorMCG);
// var rdg = L.featureGroup.subGroup(sensorMCG);
// var	waveHeight = L.featureGroup.subGroup(sensorMCG);

// Marker Cluster Group for HWMs
// var hwmMCG = L.markerClusterGroup({
// 	//options here
// 	disableClusteringAtZoom: 8,
// 	spiderfyOnMaxZoom: false,
// 	zoomToBoundsOnClick: true,
// 	//create custom icon for HWM clusters
// 	iconCreateFunction: function (cluster) {
// 		return L.divIcon({ html: '<div style="display: inline-block"><span style="display: inline-block" class="hwmClusterText">' + cluster.getChildCount() + '</span></div>',  className: 'hwmClusterMarker' });
// 	}
// });
// var hwm = L.featureGroup.subGroup(hwmMCG);

///end markercluster code//////////////////////////////////////////////////////////////

//main document ready function
$( document ).ready(function() {
	//for jshint
	'use strict';

	$('#peakDatePicker .input-daterange').datepicker({
		format:  "yyyy-mm-dd",
		endDate: "today",
		startView: 2,
		maxViewMode: 3,
		todayBtn: true,
		clearBtn: true,
		multidate: false,
		autoclose: true,
		todayHighlight: true
	});

	//listener for submit event button on welcome modal - sets event vars and passes event id to filterMapData function
	$('#btnSubmitEvent').click(function(){
		//check if an event has been selected
		if ($('#evtSelect_welcomeModal').val() !== null) {
			//if event selected, hide welcome modal and begin filter process
			$('#welcomeModal').modal('hide');
			var eventID = $('#evtSelect_welcomeModal').val()[0];
			$('#evtSelect_filterModal').val([eventID]).trigger("change");
			//retrieve event details
			$.getJSON( 'https://stn.wim.usgs.gov/STNServices/events/' + eventID + '.json', {} )
				.done(function( data ) {
					setEventVars(data.event_name, data.event_id, data.event_status_id, data.event_start_date, data.event_end_date);
				})
				.fail(function() {
					console.log( "Request Failed. Most likely invalid event name." );
				});
			//populateEventDates(eventID);
			filterMapData(eventID, false);
		} else {
			//if no event selected, warn user with alert
			//alert("Please choose an event to proceed.")
			$('.eventSelectAlert').show();
		}
	});

	//listener for submit filters button on filters modal - sets event vars and passes event id to filterMapData function
	$('#btnSubmitFilters').on('click', function() {

		if ($('#evtSelect_filterModal').val() !== null) {
			//if event selected, hide welcome modal and begin filter process
			$('#welcomeModal').modal('hide');
			var eventID = $('#evtSelect_filterModal').val()[0];
			//$('#evtSelect_filterModal').val([eventValue]).trigger("change");
			//retrieve event details
			for (var i = 0; i < fev.data.events.length; i++) {
				if (fev.data.events[i].event_id == eventID) {
					//set currentEventActive boolean var based on event_status_id value
					setEventVars(fev.data.events[i].event_name, fev.data.events[i].event_id, fev.data.events[i].event_status_id, fev.data.events[i].event_start_date, fev.data.events[i].event_end_date);
				}
			}
			filterMapData(eventID, false);
			$('.eventSelectAlert').hide();
			$('#filtersModal').modal('hide');
		} else {
			//if no event selected, warn user with alert
			//alert("Please choose an event to proceed.")
			$('.eventSelectAlert').show();
		}
	});

	$('#print').click(function(){
		printReport();
	});

	//'listener' for URL event params - sets event vars and passes event id to filterMapData function
	if (window.location.hash){
		//user has arrived with an event name after the hash on the URL
		//grab the hash value, remove the '#', leaving the event name parameter
		var eventParam = window.location.hash.substring(1);
		//retrieve event details
		$.getJSON( 'https://stn.wim.usgs.gov/STNServices/events/' + eventParam + '.json', {} )
			.done(function( data ) {
				var eventID = data.event_id.toString();
				setEventVars(data.event_name, data.event_id, data.event_status_id, data.event_start_date, data.event_end_date);
				//call filter function, passing the eventid parameter string and 'true' for the 'isUrlParam' boolean argument
				filterMapData(eventID, true);
			})
			.fail(function() {
				console.log( "Request Failed. Most likely invalid event name." );
			});

	} else {
		//show modal and set options - disallow user from bypassing
		$('#welcomeModal').modal({backdrop: 'static', keyboard: false});
	}

	function setEventVars (event_name, event_id, event_status_id, event_start_date, event_end_date) {
		//set event name in URL, using regex to remove spaces
		history.pushState(null, null, '#' + (event_name.replace(/\s+/g, '')));
		//set current event name
		fev.vars.currentEventName = event_name;
		//set current event id string
		fev.vars.currentEventID_str = event_id.toString();
		//set currentEventActive boolean var based on event_status_id value
		event_status_id == 1 ? fev.vars.currentEventActive = true :   fev.vars.currentEventActive = false;
		//set event date string vars, cutting off time portion and storing date only; check for undefined because services do not return the property if it has no value
		fev.vars.currentEventStartDate_str = (event_start_date == undefined ? '' : event_start_date.substr(0,10));
		fev.vars.currentEventEndDate_str = (event_end_date == undefined ? '' : event_end_date.substr(0,10));
		console.log("Selected event is " + event_name + ". START date is " + fev.vars.currentEventStartDate_str + " and END date is " + fev.vars.currentEventEndDate_str + ". Event is active = " + fev.vars.currentEventActive)
		setEventIndicators(event_name, event_id, fev.vars.currentEventStartDate_str, fev.vars.currentEventEndDate_str);
	}

	function setEventIndicators (eventName, eventID, eventStartDateStr, eventEndDateStr) {
		$('#eventNameDisplay').html(eventName);
		$('#largeEventNameDisplay').html(eventName);
		//TODO: determine why this is not working, though its same code and input as in the btnSubmitEvent function above
		var eventValue = [eventID.toString()];
		$('#evtSelect_filterModal').val([eventValue]).trigger("change");

		//set the event display, only if both date strings are not empty
		if (eventStartDateStr == '' && eventEndDateStr == '') {
			return
		} else if (eventEndDateStr == '') {
			//if no end date, only show begin date
			$('#largeEventDateRangeDisplay').html(moment(eventStartDateStr).format("D MMM YYYY"));
		} else {
			//if both start and end date, show beginDate thru endDate
			$('#largeEventDateRangeDisplay').html(moment(eventStartDateStr).format("D MMM YYYY") + " thru " + moment(eventEndDateStr).format("D MMM YYYY"));
		}
	}

	/* create map */
	map = L.map('mapDiv').setView([39.833333, -98.583333], 4);
	var layer = L.esri.basemapLayer('Topographic').addTo(map);
	var layerLabels;
	L.Icon.Default.imagePath = './images';

	//attach the listener for data disclaimer button after the popup is opened - needed b/c popup content not in DOM right away
	map.on('popupopen', function() {
		$('.data-disclaim').click(function(e){
			$('#aboutModal').modal('show');
			$('.nav-tabs a[href="#disclaimerTabPane"]').tab('show');
		});
	});

	map.on({
		overlayadd: function(e) {
			if (e.name.indexOf('Stream Gage') !== -1) {
				if (map.getZoom() < 9) USGSrtGages.clearLayers();
				if (map.hasLayer(USGSrtGages) && map.getZoom() >= 9) {
					//USGSrtGages.clearLayers();
					$('#nwisLoadingAlert').show();
					var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
					queryNWISrtGages(bbox);
					/* if (map.hasLayer(USGSrtGages) && map.hasLayer(USGSRainGages)){
						
					} */
				}
				/* if (map.hasLayer(USGSRainGages) && map.getZoom() >= 9) {
					
				} */
			}
		},
		overlayadd: function(e) {
			if (e.name.indexOf('Rain Gage') !== -1) {
				if (map.getZoom() < 9) USGSRainGages.clearLayers();
				if (map.hasLayer(USGSRainGages) && map.getZoom() >= 9) {
					//USGSrtGages.clearLayers();
					$('#nwisLoadingAlert').show();
					var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
					queryNWISRainGages(bbox);
					USGSRainGages.bringToFront();

					/* if (map.hasLayer(USGSrtGages) && map.hasLayer(USGSRainGages)){
						
					} */
				}
				/* if (map.hasLayer(USGSRainGages) && map.getZoom() >= 9) {
					
				} */
			}
		},
		overlayremove: function(e) {
			if (e.name === 'Cities') alert('removed');
		}
	});

	//add sensor markercluster group to the map
	//sensorMCG.addTo(map);
	//add sensor subgroups to the map
	//baro.addTo(map);
	//stormTide.addTo(map);
	//met.addTo(map);
	//waveHeight.addTo(map);
	//add hwm markercluster group to the map
	//hwmMCG.addTo(map);
	// add hwm subgroup to the map
	//hwm.addTo(map);
	//peak.addTo(map);
	//add USGS rt gages to the map
	//rdg.addTo(map);

	//display USGS rt gages by default on map load
	// USGSrtGages.addTo(map);
	noaaService.addTo(map);

	//define layer 'overlays' (overlay is a leaflet term)
	//define the real-time overlay and manually add the NWIS RT gages to it
	var realTimeOverlays = {
		"<img class='legendSwatch' src='images/nwis.png'>&nbsp;Real-time Stream Gage" : USGSrtGages,
		"<img class='legendSwatch' src='images/rainIcon.png'>&nbsp;Real-time Rain Gage" : USGSRainGages
	};
	//define observed overlay and interpreted overlay, leave blank at first
	var observedOverlays = {};
	var interpretedOverlays = {};
	var noaaOverlays = {};
	var fwsOverlays = {};

	if (noAdvisories) {
		var div = document.getElementById('noTrackAdvisory');
		div.innerHTML += "No Active Advisories";
	} else {
		noaaOverlays = {
			"<img class='legendSwatch' src='images/noaa.png'>&nbsp;NOAA Tropical Cyclone Forecast Track" : noaaService
		};
	}

	fwsOverlays = {
		"<img class='legendSwatch' src='images/noaa.png'>&nbsp;appr" : appr,
		"<img class='legendSwatch' src='images/noaa.png'>&nbsp;Int" : int,
	}
	
	
	//loop thru layer list and add the legend item to the appropriate heading
	$.each(fev.layerList, function( index, layer ) {
		if(layer.Category == 'real-time') realTimeOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'>&nbsp;" + layer.Name] = window[layer.ID];
		if(layer.Category == 'observed') observedOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'>&nbsp;" + layer.Name] = window[layer.ID];
		if(layer.Category == 'interpreted') interpretedOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'></img>&nbsp;" + layer.Name] = window[layer.ID];
		if(layer.Category == 'noaa') noaaOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'></img>&nbsp;" + layer.Name] = window[layer.ID];
		if(layer.Category == 'fws') fwsOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'></img>&nbsp;" + layer.Name] = window[layer.ID];
	});

	// set up a toggle for the sensors layers and place within legend div, overriding default behavior
	var realTimeToggle = L.control.layers(null, realTimeOverlays, {collapsed: false});
	realTimeToggle.addTo(map);
	$('#realTimeToggleDiv').append(realTimeToggle.onAdd(map));

	// var rtScaleAlertMarkup = "<div class='alert alert-warning' role='alert'>Please zoom in to refresh</div>";
	// $('#realTimeToggleDiv').append(rtScaleAlertMarkup);

	$('.leaflet-top.leaflet-right').hide();

	// set up toggle for the observed layers and place within legend div, overriding default behavior
	var observedToggle = L.control.layers(null, observedOverlays, {collapsed: false});
	observedToggle.addTo(map);
	$('#observedToggleDiv').append(observedToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

	// set up toggle for the interpreted layers and place within legend div, overriding default behavior
	var interpretedToggle = L.control.layers(null, interpretedOverlays, {collapsed: false});
	interpretedToggle.addTo(map);
	$('#interpretedToggleDiv').append(interpretedToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

	var noaaToggle = L.control.layers(null, noaaOverlays, {collapsed: false});
	noaaToggle.addTo(map);
	$('#noaaToggleDiv').append(noaaToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

	// set up toggle for the observed layers and place within legend div, overriding default behavior
	var fwsToggle = L.control.layers(null, fwsOverlays, {collapsed: false});
	fwsToggle.addTo(map);
	$('#fwsToggleDiv').append(fwsToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

	//overlapping marker spidifier
	oms = new OverlappingMarkerSpiderfier(map, {
		keepSpiderfied: true
	});

	//experimental - untested against actual hurricane track published by NOAA
	//make request for tropical cyclones layer legend. if label = "No active advisories at this time", no data to show. else, add forecast track layer to map. This method suggested by NOAA developer Jason Greenlaw. See below for alternate Identify method
	/* $.getJSON( 'https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time', {} )
		.done(function( data ) {
			//if any results (features in the bounding box), then add forecast track layer to map, add toggle to interpreted data category.
			if (data[0].label == "No active advisories at this time"){
				return
			} else {
				var noaaTrack = L.esri.dynamicMapLayer({
					url:"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
					opacity: 0.5,
					f:'image'
				}).addTo(map);
				interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaTrack";
			}
		})
		.fail(function() {
			console.log( "NOAA Tropical Cyclone legend retrieve failed." );
		}); */

	//experimental - untested against actual hurricane track published by NOAA
	//run identify operation against the NOAA tropical cyclone service to check if any features exist within a bounding box around US and into hurricane formation territory of Atlantic Ocean. Suspended in favor of legend check method above.
	// $.getJSON( 'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/identify?geometry=%7B%22rings%22%3A%5B%5B%5B1095773.4076228663%2C-2264052.666983325%5D%2C%5B-16260935.479144061%2C1853127.202922333%5D%2C%5B-16280503.35838506%2C9515810.636098623%5D%2C%5B880526.735971868%2C9554946.394580625%5D%2C%5B1095773.4076228663%2C-2264052.666983325%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D%7D&geometryType=esriGeometryPolygon&sr=&layers=&layerDefs=&time=&layerTimeOptions=&tolerance=1&mapExtent=%7B%22xmin%22%3A-18853651.648703426%2C%22ymin%22%3A-6174306.988588039%2C%22xmax%22%3A7739096.239815462%2C%22ymax%22%3A11123698.260455891%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D&imageDisplay=600%2C550%2C96&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson', {} )
	// 	.done(function( data ) {
	// 		//if any results (features in the bounding box), then add forecast track layer to map, add toggle to interpreted data category.
	// 		if (data.results.length > 0 ){
	// 			var noaaTrack = L.esri.dynamicMapLayer({
	// 				url:"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
	// 				opacity: 0.5,
	// 				f:'image'
	// 			}).addTo(map);
	// 			interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaTrack";
	// 			//below is older logic, for a dedicated NOAA overlays group. replaced in favor of appending NOAA layer to 'Interpreted Data'
	// 			// var noaaOverlays = {
	// 			// 	"NOAA Tropical Cyclone Forecast Track" : noaaTrack
	// 			// 	//"National Geodetic Survey Imagery": noaaImagery
	// 			// };
	// 			// set up toggle for the noaa layers and place within legend div, overriding default behavior
	// 			// var noaaToggle = L.control.layers(null, noaaOverlays, {collapsed: false});
	// 			// noaaToggle.addTo(map);
	// 			// $('#noaaToggleDiv').append(noaaToggle.onAdd(map));
	// 			// $('.leaflet-top.leaflet-right').hide();
	// 		}
	// 	})
	// 	.fail(function() {
	// 		console.log( "NOAA Tropical Cyclone layer identify operation failed." );
	// 	});

	//populate initial unfiltered download URLs
	$('#sensorDownloadButtonCSV').attr('href', fev.urls.csvSensorsURLRoot);
	$('#sensorDownloadButtonJSON').attr('href', fev.urls.jsonSensorsURLRoot); 
	$('#sensorDownloadButtonXML').attr('href', fev.urls.xmlSensorsURLRoot);
	$('#hwmDownloadButtonCSV').attr('href', fev.urls.csvHWMsURLRoot);
	$('#hwmDownloadButtonJSON').attr('href', fev.urls.jsonHWMsURLRoot); 
	$('#hwmDownloadButtonXML').attr('href', fev.urls.xmlHWMsURLRoot);
	$('#peaksDownloadButtonCSV').attr('href', fev.urls.csvPeaksURLRoot);
	$('#peaksDownloadButtonJSON').attr('href', fev.urls.jsonPeaksURLRoot); 
	$('#peaksDownloadButtonXML').attr('href', fev.urls.xmlPeaksURLRoot);

	/* sets up data type radio buttons to hide/show the respective forms*/
	$('.dataTypeRadio').each(function(){
		//for the clicked radio
		$(this).on('click', function() {
			var radioId = $(this).attr('id');
			var formToShow = $('#' + radioId + 'Form');
			formToShow.show();
			$('.hiddenForm').not(formToShow).hide();
		});
	});


	

	//toggle the appearance of the check box on click, including toggling the check icon
	$('.check').on('click', function(){
		$(this).find('span').toggle();
	});

	function showGeosearchModal() {
		$('#geosearchModal').modal('show');
	}
	$('#geosearchNav').click(function(){
		showGeosearchModal();
	});

	function showAboutModal () {
		$('#aboutModal').modal('show');
	}
	$('#aboutNav').click(function(){
		showAboutModal();
	});

	function showFiltersModal () {
		$('#filtersModal').modal('show');
	}
	$('#btnChangeFilters').click(function(){
		//update the event select within the filters modal to reflect current event
		$('#evtSelect_filterModal').val([fev.vars.currentEventID_str]).trigger("change");
		showFiltersModal();
	});

	/* begin basemap controller */
	function setBasemap(basemap) {
	    if (layer) {
	      map.removeLayer(layer);
	    }
	    layer = L.esri.basemapLayer(basemap);
	    map.addLayer(layer);
	    if (layerLabels) {
	      map.removeLayer(layerLabels);
	    }

	    if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {

	      layerLabels = L.esri.basemapLayer(basemap + 'Labels');
	      map.addLayer(layerLabels);
	    }
	}

	$('.basemapBtn').on('click',function() {
	  	var baseMap = this.id.replace('btn','');

	  	// https://github.com/Esri/esri-leaflet/issues/504 submitted issue that esri-leaflet basemaps dont match esri jsapi

	  	switch (baseMap) {
		    case 'Streets': baseMap = 'Streets'; break;
		    case 'Satellite': baseMap = 'Imagery'; break;
		    case 'Topo': baseMap = 'Topographic'; break;
		    case 'Terrain': baseMap = 'ShadedRelief'; break;
		    case 'Gray': baseMap = 'Gray'; break;
		    case 'NatGeo': baseMap = 'NationalGeographic'; break;
		}

		setBasemap(baseMap);

	});
  	/* end basemap controller */

	/* geocoder control */
	//import USGS search API

	/*
	var searchScript = document.createElement('script');
	searchScript.src = 'https://txpub.usgs.gov/DSS/search_api/1.1/api/search_api.min.js';
	searchScript.onload = function() {
		setSearchAPI();
	};
	document.body.appendChild(searchScript); */



	function setSearchAPI() {
		search_api.create( "search", {
                
			// appearance
			size        : "lg", // sizing option, one of "lg" (large), "md" (medium), "sm" (small), "xs" (extra small)
			width       : 500,  // width of the widget [px]
			placeholder : "Search for a place in TX, OK, or NM", // text box placeholder prompt to display when no text is entered
			tooltip     : "Search-able places are:\n" +
				"* Major and minor GNIS locations,\n" +
				"* U.S. States or Territories,\n" +
				"* numeric 5-digit ZIP or 3-digit area codes," +
				"* numeric USGS site numbers,\n" +
				"* numeric Hydologic Unit Codes (HUCs), and\n" +
				"* latitude-longitude coordinates (e.g. '32.4 -100.1')",
			

			// suggestion menu
			menu_min_char      : 2,     // minimum number of characters required before attempting to find menu suggestions
			menu_max_entries   : 50,    // maximum number of menu items to display
			menu_height        : 400,   // maximum height of menu [px]
			
			include_gnis_major : true,  // whether to include GNIS places as suggestions in the menu: major categories (most common)...
			include_gnis_minor : true,  // ...minor categories (less common)
			
			include_state      : true,  // whether to include U.S. States and Territories as suggestions in the menu
			include_zip_code   : true,  // whether to include 5-digit zip codes as suggestions in the menu
			include_area_code  : true,  // whether to include 3-digit area codes as suggestions in the menu
			
			include_usgs_sw    : true,  // whether to include USGS site numbers as suggestions in the menu: surface water...
			include_usgs_gw    : true,  // ...ground water
			include_usgs_sp    : true,  // ...spring
			include_usgs_at    : true,  // ...atmospheric
			include_usgs_ot    : true,  // ...other
			
			include_huc2       : true,  // whether to include Hydrologic Unit Code (HUC) numbers as suggestions in the menu: 2-digit...
			include_huc4       : true,  // ... 4-digit
			include_huc6       : true,  // ... 6-digit
			include_huc8       : true,  // ... 8-digit
			include_huc10      : true,  // ...10-digit
			include_huc12      : true,  // ...12-digit
			
			// event callback functions
			// function argument "o" is widget object
			// "o.result" is geojson point feature of search result with properties
			
			// function to execute when a search is started
			// triggered when the search textbox text changes
			on_search: function(o) {
				console.warn(o.id+": my 'on_search' callback function - a search is started");
				map.closePopup(); // close any previous popup when user searches for new location
			},
			
			// function to execute when the suggestion menu is updated
			// triggered when new items are displayed in the menu and when the menu closes
			on_update: function(o) {
				console.warn(o.id+": my 'on_update' callback function - the menu was updated");
			},
			
			// function to execute when a suggestion is chosen
			// triggered when a menu item is selected
			on_result: function(o) {
				console.warn(o.id+": my 'on_result' callback function - a menu item was selected");
				map
					.fitBounds([ // zoom to location
						[ o.result.properties.LatMin, o.result.properties.LonMin ],
						[ o.result.properties.LatMax, o.result.properties.LonMax ]
					])
					.openPopup(  // open popup at location listing all properties
						$.map( Object.keys(o.result.properties), function(property) {
							return "<b>" + property + ": </b>" + o.result.properties[property];
						}).join("<br/>"),
						[ o.result.properties.Lat, o.result.properties.Lon ]
					);
			},
			
			// function to execute when no suggestions are found for the typed text
			// triggered when services return no results or time out
			on_failure: function(o){
				console.warn(o.id+": my 'on_failure' callback function - the services returned no results or timed out");
			},
			
			// miscellaneous
			verbose : true // whether to set verbose mode on (true) or off (false)
		});
	
	}

	/* geocoder control */

	/* legend control */
	$('#legendButtonNavBar, #legendButtonSidebar').on('click', function () {
        $('#legend').toggle();
        //return false;
    });
    $('#legendClose').on('click', function () {
        $('#legend').hide();
    });
    /* legend control */

    // map.on('moveend', function(e) {
    //     USGSrtGages.clearLayers();
    //     if (map.hasLayer(USGSrtGages) && map.getZoom() >= 10) {
    //         var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
    //         queryNWISrtGages(bbox);
    //     }
    // });

	///fix to prevent re-rendering nwis rt gages on pan
	map.on('load moveend zoomend', function(e) {
		
		var foundPopup;
		$.each(USGSrtGages.getLayers(), function( index, marker ) {
			var popup = marker.getPopup();
			if (popup) {
				foundPopup = popup._isOpen;
			}
		})

		$.each(USGSRainGages.getLayers(), function( index, marker ) {
			var popup = marker.getPopup();
			if (popup) {
				foundPopup = popup._isOpen;
			}
		})
		//USGSrtGages.clearLayers();
		if (map.getZoom() < 9) {
			USGSrtGages.clearLayers();
			USGSRainGages.clearLayers();
			$('#rtScaleAlert').show();
		}

		if (map.getZoom() >= 9){
			$('#rtScaleAlert').hide();
		}
		if (map.hasLayer(USGSrtGages) && map.getZoom() >= 9 && !foundPopup) {
			//USGSrtGages.clearLayers();
			$('#nwisLoadingAlert').show();
			var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
			queryNWISrtGages(bbox);
			queryNWISRainGages(bbox);
			if (map.hasLayer(USGSrtGages) && map.hasLayer(USGSRainGages)){
				USGSRainGages.bringToFront();
			}
		}
		if (map.hasLayer(USGSRainGages) && map.getZoom() >= 9 && !foundPopup) {
			//USGSrtGages.clearLayers();
			$('#nwisLoadingAlert').show();
			var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
			queryNWISRainGages(bbox);
			if (map.hasLayer(USGSRainGages) && map.hasLayer(USGSRainGages)){
				USGSRainGages.bringToFront();
			}
		}
	});

	USGSrtGages.on('click', function(e) {
		queryNWISgraph(e);

	});
	
	USGSRainGages.on('click', function(e) {
		queryNWISRaingraph(e);

	});

	rdg.on('click', function(e) {
		queryNWISgraphRDG(e);
	});

    //begin latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////

	//displays map scale on map load
	//map.on( 'load', function() {
	map.whenReady( function() {
		var mapScale =  scaleLookup(map.getZoom());
		$('#scale')[0].innerHTML = mapScale;
		console.log('Initial Map scale registered as ' + mapScale, map.getZoom());

		var initMapCenter = map.getCenter();
		$('#latitude').html(initMapCenter.lat.toFixed(4));
		$('#longitude').html(initMapCenter.lng.toFixed(4));
	});

//displays map scale on scale change (i.e. zoom level)
	map.on( 'zoomend', function () {
		var mapZoom = map.getZoom();
		var mapScale = scaleLookup(mapZoom);
		$('#scale')[0].innerHTML = mapScale;
		$('#zoomLevel')[0].innerHTML = mapZoom;
	});

//updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes 'map center' label
	map.on( 'mousemove', function (cursorPosition) {
		$('#mapCenterLabel').css('display', 'none');
		if (cursorPosition.latlng !== null) {
			$('#latitude').html(cursorPosition.latlng.lat.toFixed(4));
			$('#longitude').html(cursorPosition.latlng.lng.toFixed(4));
		}
	});
//updates lat/lng indicator to map center after pan and shows 'map center' label.
	map.on( 'dragend', function () {
		//displays latitude and longitude of map center
		$('#mapCenterLabel').css('display', 'inline');
		var geographicMapCenter = map.getCenter();
		$('#latitude').html(geographicMapCenter.lat.toFixed(4));
		$('#longitude').html(geographicMapCenter.lng.toFixed(4));
	});

	function printReport() {
		const docDefinition = {
			pageOrientation: 'landscape',
			pageMargins: [20, 20, 20, 35],
			footer: function (currentPage, pageCount) {
				return {
					margin: [20, 0, 20, 0],
					style: 'footer',
					columns: [
						{
							width: 700,
							text: ['Report generated ']
						}
					]
				},
				{
					width: 50,
					alignment: 'right',
					text: 'Page ' + currentPage.toString()
				}

			},
			content: [
				{
					alignment: 'justify',
					text: 'hi'
				}
			],
			images: {},
			styles: {
				header: {
					fontSize: 15,
					bold: true
				},
				bigger: {
					fontSize: 18,
					bold: true
				},
				explanation: {
					fontSize: 9
				},
				smaller: {
					fontSize: 10
				},
				smallest: {
					fontSize: 8
				},
				footer: {
					fontSize: 9
				},
				definitionsTable: {
					fontSize: 9
				}
			},
			defaultStyle: {
				columnGap: 20
			}
		};
		pdfMake.createPdf(docDefinition).download('report.pdf');
	}

	function scaleLookup(mapZoom) {
		switch (mapZoom) {
			case 19: return '1,128';
			case 18: return '2,256';
			case 17: return '4,513';
			case 16: return '9,027';
			case 15: return '18,055';
			case 14: return '36,111';
			case 13: return '72,223';
			case 12: return '144,447';
			case 11: return '288,895';
			case 10: return '577,790';
			case 9: return '1,155,581';
			case 8: return '2,311,162';
			case 7: return '4,622,324';
			case 6: return '9,244,649';
			case 5: return '18,489,298';
			case 4: return '36,978,596';
			case 3: return '73,957,193';
			case 2: return '147,914,387';
			case 1: return '295,828,775';
			case 0: return '591,657,550';
		}
	}
	//end latLngScale utility logic/////////
});