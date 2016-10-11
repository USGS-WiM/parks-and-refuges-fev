var stnServicesURL = 'https://stn.wim.usgs.gov/STNServices';
var stnServicesTestURL = 'https://stntest.wim.usgs.gov/STNServices2';
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
		jsonSensorsURLRoot : stnServicesURL + '/Instruments.json',
		xmlSensorsURLRoot: stnServicesURL + '/Instruments.xml',
		csvSensorsURLRoot : stnServicesURL + '/Instruments.csv',

		jsonHWMsURLRoot : stnServicesURL + '/HWMs/FilteredHWMs.json',
		xmlHWMsURLRoot : stnServicesURL + '/HWMs/FilteredHWMs.xml',
		csvHWMsURLRoot : stnServicesURL + '/HWMs/FilteredHWMs.csv',
		hwmFilteredGeoJSONViewURL: stnServicesTestURL + '/HWMs/FilteredHWMs.geojson',
		hwmGeoJSONViewURL: stnServicesURL + '/hwms.geojson',

		xmlPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.xml',
		jsonPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.json',
		csvPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.csv',
		peaksFilteredGeoJSONViewURL: stnServicesURL + '/PeakSummaries/FilteredPeaks.geojson',

		baroGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=baro_view&',
		metGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=met_view&',
		rdgGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=rdg_view&',
		stormTideGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=stormtide_view&',
		waveHeightGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=waveheight_view&'
	},
	queryStrings: {
	},
	vars : {
		currentEventName:"",
		currentEventID_str: "",
		currentEventStartDate_str : "",
		currentEventEndDate_str : "",
		currentEventActive : false
	},
	layerList: 	[
		{
			"ID": "baro",
			"Name": "Barometric Pressure Sensor",
			"Type":"sensor"
		},
		{
			"ID": "stormTide",
			"Name": "Storm Tide Sensor",
			"Type":"sensor"
		},
		{
			"ID": "met",
			"Name": "Meteorological Sensor",
			"Type":"sensor"
		},
		{
			"ID": "waveHeight",
			"Name": "Wave Height Sensor",
			"Type":"sensor"
		},
		{
			"ID": "rdg",
			"Name": "Rapid Deployment Gage",
			"Type":"sensor"
		},
		{
			"ID": "hwm",
			"Name": "High Water Mark",
			"Type":"observed"
		},
		{
			"ID": "peak",
			"Name": "Peak Summary",
			"Type":"observed"
		}
	]
};

//L.esri.Support.cors = true;

var map;
var markerCoords = [];
var oms;

var baroMarkerIcon = L.divIcon({className: 'baroMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var metMarkerIcon = L.divIcon({className: 'metMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var rdgMarkerIcon = L.divIcon({className: 'rdgMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var stormTideMarkerIcon = L.divIcon({className: 'stormTideMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var waveHeightMarkerIcon = L.divIcon({className: 'waveHeightMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var hwmMarkerIcon = L.divIcon({className: 'hwmMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var peakMarkerIcon = L.divIcon({className: 'peakMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});
var nwisMarkerIcon  = L.divIcon({className: 'nwisMarker', iconAnchor: [8, 24], popupAnchor: [0, 0]});

//sensor subgroup layerGroups for sensor marker cluster group(layerGroup has no support for mouse event listeners)
var	baro = L.layerGroup();
var stormTide = L.layerGroup();
var	met = L.layerGroup();
var	waveHeight = L.layerGroup();
var hwm = L.layerGroup();
var peak = L.layerGroup();

//rdg and USGSrtGages layers must be featureGroup type to support mouse event listeners
var rdg = L.featureGroup();
var USGSrtGages = L.featureGroup();

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
	var layer = L.esri.basemapLayer('Gray').addTo(map);
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
				if (map.getZoom() < 8) USGSrtGages.clearLayers();
				if (map.hasLayer(USGSrtGages) && map.getZoom() >= 8) {
					//USGSrtGages.clearLayers();
					$('#nwisLoadingAlert').show();
					var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
					queryNWISrtGages(bbox);
				}
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

	//USGSrtGages.addTo(map);
	//define layer 'overlays' (leaflet term)
	var sensorOverlays = {
		"<i class='nwisMarker'></i>&nbsp;Real-time Stream Gage *" : USGSrtGages
	};
	var observedOverlays = {};
	$.each(fev.layerList, function( index, layer ) {
		if(layer.Type == 'sensor') sensorOverlays["<i class='" + layer.ID + "Marker'></i>&nbsp;" + layer.Name] = window[layer.ID]
		if(layer.Type != 'sensor') observedOverlays["<i class='" + layer.ID + "Marker'></i>&nbsp;" + layer.Name] = window[layer.ID]
	});

	// set up a toggle for the sensors layers and place within legend div, overriding default behavior
	var sensorsToggle = L.control.layers(null, sensorOverlays, {collapsed: false});
	sensorsToggle.addTo(map);
	$('#sensorsToggleDiv').append(sensorsToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

	// set up toggle for the observed layers and place within legend div, overriding default behavior
	var observedToggle = L.control.layers(null, observedOverlays, {collapsed: false});
	observedToggle.addTo(map);
	$('#observedToggleDiv').append(observedToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

	//overlapping marker spidifier
	oms = new OverlappingMarkerSpiderfier(map, {
		keepSpiderfied: true
	});


	var noaaTrack = L.esri.dynamicMapLayer({
		url:"https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
		opacity: 0.5,
		f:'image'
	}).addTo(map);

	var noaaOverlays = {
		"Tropical Cyclone Track" : noaaTrack
	}

	// set up toggle for the noaa layers and place within legend div, overriding default behavior
	var noaaToggle = L.control.layers(null, noaaOverlays, {collapsed: false});
	noaaToggle.addTo(map);
	$('#noaaToggleDiv').append(noaaToggle.onAdd(map));
	$('.leaflet-top.leaflet-right').hide();

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
		    //case 'Hybrid': baseMap = 'ImageryLabels'; break;
		    case 'Topo': baseMap = 'Topographic'; break;
		    case 'Terrain': baseMap = 'ShadedRelief'; break;
		    case 'Gray': baseMap = 'Gray'; break;
		    // case 'OSM': baseMap = 'n/a'; break;
		    case 'NatGeo': baseMap = 'NationalGeographic'; break;
		    // case 'NatlMap': baseMap = 'n/a'; break;
		}

		setBasemap(baseMap);

	});
  	/* end basemap controller */

	/* geocoder control */
	//import USGS search API
	var searchScript = document.createElement('script');
	searchScript.src = 'http://txpub.usgs.gov/DSS/search_api/1.1/api/search_api.min.js';
	searchScript.onload = function() {
		setSearchAPI();
	};
	document.body.appendChild(searchScript);

	function setSearchAPI() {
		// setup must be done after the search_api is loaded and ready ('load' event triggered)
		search_api.on('load', function() {

			$('#chkExtent').change(function(){
				if($(this).is(':checked')){
					console.log('Checked',map.getBounds().getSouth(),map.getBounds().getNorth(),map.getBounds().getWest(),map.getBounds().getEast());
					var mapBounds = map.getBounds();

					search_api.setOpts({
						'LATmin' : mapBounds.getSouth(),
						'LATmax' : mapBounds.getNorth(),
						'LONmin' : mapBounds.getWest(),
						'LONmax' : mapBounds.getEast()
					});
				}
			});

			search_api.setOpts({
				'textboxPosition': 'user-defined',
				'theme': 'user-defined',
				'DbSearchIncludeUsgsSiteSW': true,
				'DbSearchIncludeUsgsSiteGW': true,
				'DbSearchIncludeUsgsSiteSP': true,
				'DbSearchIncludeUsgsSiteAT': true,
				'DbSearchIncludeUsgsSiteOT': true
			});
			
			// define what to do when a location is found
			search_api.on('location-found', function(lastLocationFound) {

				$('#geosearchModal').modal('hide');

				var zoomlevel = 14;
				if (lastLocationFound.Category === 'U.S. State or Territory') zoomlevel = 9;

				map.setView([lastLocationFound.y, lastLocationFound.x], zoomlevel);

				L.popup()
					.setLatLng([lastLocationFound.y,lastLocationFound.x])
					.setContent(
						'<p>' +
							'<b>' + lastLocationFound.label + '</b> '                + '<br/>' +
							'<br/>' +
							'<b>NAME:            </b> ' + lastLocationFound.name     + '<br/>' +
							'<b>CATEGORY:        </b> ' + lastLocationFound.category + '<br/>' +
							'<b>STATE:           </b> ' + lastLocationFound.state    + '<br/>' +
							'<b>COUNTY:          </b> ' + lastLocationFound.county   + '<br/>' +
							'<br/>' +
							'<b>LATITUDE:        </b> ' + lastLocationFound.y        + '<br/>' +
							'<b>LONGITUDE:       </b> ' + lastLocationFound.x        + '<br/>' +
							'<b>ELEVATION (FEET):</b> ' + lastLocationFound.elevFt   + '<br/>' +
							'<br/>' +
							'<b>PERCENT MATCH:   </b> ' + lastLocationFound.pctMatch + '<br/>' +
						'</p>'
					)
					.openOn(map);

			});
			
			// define what to do when no location is found
			search_api.on('no-result', function() {
				// show alert dialog
				console.error('No location matching the entered text could be found.');
			});
			
			// define what to do when a search times out
			search_api.on('timeout', function() {
				// show alert dialog
				console.error('The search operation timed out.');
			});
		});


		$('#searchSubmit').on('click', function(){
			console.log('in search submit');
			$('#sapi-searchTextBox').keyup();
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
		//USGSrtGages.clearLayers();
		if (map.getZoom() < 8) USGSrtGages.clearLayers();
		if (map.hasLayer(USGSrtGages) && map.getZoom() >= 8 && !foundPopup) {
			//USGSrtGages.clearLayers();
			$('#nwisLoadingAlert').show();
			var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
			queryNWISrtGages(bbox);
		}
	});

	USGSrtGages.on('click', function(e) {
		queryNWISgraph(e);

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