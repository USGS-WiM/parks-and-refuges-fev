var stnServicesURL = 'https://stn.wim.usgs.gov/STNServices';
//var stnServicesURL = 'https://stntest.wim.usgs.gov/STNServices2'; //test URL
var sensorPageURLRoot = "https://stn.wim.usgs.gov/STNPublicInfo/#/SensorPage?Site=";
var hwmPageURLRoot = "https://stn.wim.usgs.gov/STNPublicInfo/#/HWMPage?Site=";
var flattenedPoly;
/* var regionBoundaries;
var regions = []; */
var parks;
var refuges;
var fwsInterest;
var bufferPoly;
var searchResults;
var searchObject;
var currentParkOrRefuge = "";
var identifiedPeaks = [];
var identifiedMarks = [];
var fev = fev || {
	data: {
		events: [],
		eventTypes: [],
		states: [],
		counties: [],
		sensorTypes: [],
		sensorStatusTypes: [],
		collectionConditions: [],
		deploymentTypes: [],
		hwmTypes: [],
		hwmQualities: []
	},
	urls: {
		jsonSensorsURLRoot: stnServicesURL + '/Instruments/FilteredInstruments.json',
		xmlSensorsURLRoot: stnServicesURL + '/Instruments/FilteredInstruments.xml',
		csvSensorsURLRoot: stnServicesURL + '/Instruments/FilteredInstruments.csv',

		jsonHWMsURLRoot: stnServicesURL + '/HWMs/FilteredHWMs.json',
		xmlHWMsURLRoot: stnServicesURL + '/HWMs/FilteredHWMs.xml',
		csvHWMsURLRoot: stnServicesURL + '/HWMs/FilteredHWMs.csv',
		hwmFilteredGeoJSONViewURL: stnServicesURL + '/HWMs/FilteredHWMs.geojson',
		hwmGeoJSONViewURL: stnServicesURL + '/hwms.geojson',

		xmlPeaksURLRoot: stnServicesURL + '/PeakSummaries/FilteredPeaks.xml',
		jsonPeaksURLRoot: stnServicesURL + '/PeakSummaries/FilteredPeaks.json',
		csvPeaksURLRoot: stnServicesURL + '/PeakSummaries/FilteredPeaks.csv',
		peaksFilteredGeoJSONViewURL: stnServicesURL + '/PeakSummaries/FilteredPeaks.geojson',

		baroGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=baro_view&',
		metGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=met_view&',
		rdgGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=rdg_view&',
		stormtideGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=stormtide_view&',
		waveheightGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=waveheight_view&'
	},
	queryStrings: {
	},
	vars: {
		currentEventName: "",
		currentEventID_str: "",
		currentEventStartDate_str: "",
		currentEventEndDate_str: "",
		currentBufferSelection: 20,
		currentEventActive: false,
		extentNorth: 71.3888898,  // north lat: Point Barrow Alaska
		extentWest: -179.148611, //west long: Amatignak Island, Alaska
		extentEast: -66.947028, //east long: Sail Rock, Maine
		extentSouth: 18.910833  //south lat: Ka Lae. Hawaii
	},
	layerList: [
		{
			"ID": "baro",
			"Name": "Barometric Pressure Sensor",
			"Type": "sensor",
			"Category": "observed"
		},
		{
			"ID": "stormtide",
			"Name": "Storm Tide Sensor",
			"Type": "sensor",
			"Category": "observed"
		},
		{
			"ID": "met",
			"Name": "Meteorological Sensor",
			"Type": "sensor",
			"Category": "observed"
		},
		{
			"ID": "waveheight",
			"Name": "Wave Height Sensor",
			"Type": "sensor",
			"Category": "observed"
		},
		{
			"ID": "rdg",
			"Name": "Rapid Deployment Gage",
			"Type": "sensor",
			"Category": "real-time"
		},
		{
			"ID": "hwm",
			"Name": "High Water Mark",
			"Type": "observed",
			"Category": "observed"
		},
		{
			"ID": "peak",
			"Name": "Peak Summary",
			"Type": "interpreted",
			"Category": "interpreted"
		},
		{
			"ID": "int",
			"Name": "Interest Boundaries",
			"Type": "fws",
			"Category": "fws"
		},
		{
			"ID": "appr",
			"Name": "Approved Acquisition Boundaries",
			"Type": "fws",
			"Category": "fws"
		},
		{
			"ID": "tracts",
			"Name": "Park Tracts",
			"Type": "nps",
			"Category": "nps"
		},
		{
			"ID": "bounds",
			"Name": "Park Boundaries",
			"Type": "nps",
			"Category": "nps"
		},
		{
			"ID": "doiRegions",
			"Name": "DOI Regions",
			"Type": "doi",
			"Category": "doi"
		}
	],
	csvHWMColumns: [
		{ fieldName: 'STN Site No.', colName: "STN Site No." },
		{ fieldName: 'HWM Label', colName: "HWM Label" },
		{ fieldName: 'Elevation(ft)', colName: "Elevation(ft)" },
		{ fieldName: 'Vertical Datum', colName: "Vertical Datum" },
		{ fieldName: 'Vertical Method', colName: "Vertical Method" },
		{ fieldName: 'Horizontal Datum', colName: "Horizontal Datum" },
		{ fieldName: 'Horizontal Method', colName: "Horizontal Method" },
		{ fieldName: 'Type', colName: "Type" },
		{ fieldName: 'Quality', colName: "Quality" },
		{ fieldName: 'Waterbody', colName: "Waterbody" },
		{ fieldName: 'Permanent Housing', colName: "Permanent Housing" },
		{ fieldName: 'County', colName: "County" },
		{ fieldName: 'State', colName: "State" },
		{ fieldName: 'Latitude, Longitude(DD)', colName: "Latitude, Longitude(DD)" },
		{ fieldName: 'Site Description', colName: "Site Description" },
		{ fieldName: 'Location Description', colName: "Location Description" },
		{ fieldName: 'Survey Date', colName: "Survey Date" },
		{ fieldName: 'Bank', colName: "Bank" },
		{ fieldName: 'Environment', colName: "Environment" },
		{ fieldName: 'Flag Date', colName: "Flag Date" },
		{ fieldName: 'Stillwater', colName: "Stillwater" },
		{ fieldName: 'Uncertainty', colName: "Uncertainty" },
		{ fieldName: 'HWM Uncertainty', colName: "HWM Uncertainty" },
	],
	csvPeaksColumns: [
		{ fieldName: 'Site Number', colName: "Site Number" },
		{ fieldName: 'Description', colName: "Description" },
		{ fieldName: 'State', colName: "State" },
		{ fieldName: 'County', colName: "County" },
		{ fieldName: 'Peak Stage', colName: "Peak Stage" },
		{ fieldName: 'Peak Estimated', colName: "Peak Estimated" },
	],

};

//L.esri.Support.cors = true;

var map;
var reviewMap;
var markerCoords = [];
var oms;
var mapImage;

var baroMarkerIcon = L.icon({ className: 'baroMarker', iconUrl: 'images/baro.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var metMarkerIcon = L.icon({ className: 'metMarker', iconUrl: 'images/met.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var rdgMarkerIcon = L.icon({ className: 'rdgMarker', iconUrl: 'images/rdg.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var stormtideMarkerIcon = L.icon({ className: 'stormtideMarker', iconUrl: 'images/stormtide.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var waveheightMarkerIcon = L.icon({ className: 'waveheightMarker', iconUrl: 'images/waveheight.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [12, 12] });
var hwmMarkerIcon = L.icon({ className: 'hwmMarker', iconUrl: 'images/hwm.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var peakMarkerIcon = L.icon({ className: 'peakMarker', iconUrl: 'images/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var nwisMarkerIcon = L.icon({ className: 'nwisMarker', iconUrl: 'images/nwis.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var nwisRainMarkerIcon = L.icon({ className: 'nwisMarker', iconUrl: 'images/rainIcon.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [30, 30] });

//sensor subgroup layerGroups for sensor marker cluster group(layerGroup has no support for mouse event listeners)
var baro = L.layerGroup();
var stormtide = L.layerGroup();
var met = L.layerGroup();
var waveheight = L.layerGroup();
var hwm = L.layerGroup();
var peak = L.layerGroup();
var appr = L.layerGroup();
var int = L.layerGroup();
var tracts = L.layerGroup();
var bounds = L.layerGroup();
var doiRegions = L.layerGroup();
var parksLayerGroup = L.layerGroup();

var hwmCSVData = [];
var peaksCSVData = [];


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
	success: function (data) {
		if (data[0].label == "No active advisories at this time") {
			noAdvisories = true;
			test = data;
			console.log(noAdvisories);
		} else {
			//interpretedOverlays["NOAA Tropical Cyclone Forecast Track"] = "noaaService";
			//noaaService = noaaTrack;
			console.log("noaa layer added");
			var noaaCheckBox = document.getElementById("noaaToggle");
			noaaCheckBox.checked = true;
			if (noaaStart == 0) {
				$('#noaaCycloneSymbology').append(noaaCycloneSymbologyInterior);
				noaaStart = 1;
			}
		}
	}
});

//rdg and USGSrtGages layers must be featureGroup type to support mouse event listeners
var rdg = L.featureGroup();
var USGSRainGages = L.featureGroup();
var USGSrtGages = L.featureGroup();
var noaaService = L.esri.dynamicMapLayer({
	url: "https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
	opacity: 0.5,
	f: 'image'
})

var noAdvisories = false;
var test;

$.ajax({
	url: "https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time",
	async: false,
	dataType: 'json',
	success: function (data) {
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

// NPS Tracts 
var tracts = L.esri.featureLayer({
	useCors: false,
	url: "https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/1",
	//opacity: 0.5,
	//minZoom: 9,
	style: function (feature) {
		if (feature.properties.Interest === 'Federal Land (Fee)') {
			return { color: 'green', weight: 2 };
		} if (feature.properties.Interest === 'Federal Land (Less than Fee)') {
			return { color: 'yellow', weight: 2 };
		} if (feature.properties.Interest === 'Public') {
			return { color: 'orange', weight: 2 };
		} if (feature.properties.Interest === 'Private') {
			return { color: 'blue', weight: 2 };
		} if (feature.properties.Interest === 'Other Federal Land') {
			return { color: 'purple', weight: 2 };
		} if (feature.properties.Interest === 'Acquisition Deferred') {
			return { color: 'pink', weight: 2 };
		} if (feature.properties.Interest === 'No Info In Database') {
			return { color: 'black', weight: 2 };
		} else {
			return { color: 'black', weight: 2 };
		}
	}
});

// NPS Boundaries 
var bounds = L.esri.featureLayer({
	useCors: false,
	url: "https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2",
	//opacity: 0.5,
	//minZoom: 9,
	/* style: function (feature) {
		return { color: 'brown', weight: 2 };
	} */
})

// Style for NPS Networks layer
var npsNetStyle = {
	"color": 'orange',
	"fillOpacity": 0,
	"opacity": 0.65,
	"weight": 4
};

// NPS Networks
var npsNetworks = L.esri.featureLayer({
	useCors: false,
	url: "https://irmaservices.nps.gov/arcgis/rest/services/NPSData/NPS_MonitoringNetworks/MapServer/0",
	style: npsNetStyle
});


// FWS Approved Acquisition Boundaries 
var appr = L.esri.featureLayer({
	useCors: false,
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved/FeatureServer/1",
	//opacity: 0.5,
	//minZoom: 9,
	style: function (feature) {
		return { color: 'brown', weight: 2 };
	}
});


// FWS Approved Interest Boundaries 
var int = L.esri.featureLayer({
	useCors: false,
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSInterest_Simplified_Authoritative/FeatureServer/1",
	//opacity: 0.5,
	//minZoom: 9,
	style: function (feature) {
		if ((feature.properties.INTTYPE1 == 'Fee') || (feature.properties.INTTYPE1 === 'O')) {
			return { color: 'green', weight: 2, fillOpacity: 0 };
		} if (feature.properties.INTTYPE1 == 'Secondary') {
			return { color: 'purple', weight: 2, fillOpacity: 0 };
		} if (feature.properties.INTTYPE1 == 'Easement') {
			return { color: 'orange', weight: 2, fillOpacity: 0 };
		} if (feature.properties.INTTYPE1 == 'Lease') {
			return { color: 'yellow', weight: 2, fillOpacity: 0 };
		} if (feature.properties.INTTYPE1 == 'Agreement') {
			return { color: 'beige', weight: 2, fillOpacity: 0 };
		} if (feature.properties.INTTYPE1 == 'Partial Interest') {
			return { color: 'blue', weight: 2, fillOpacity: 0 };
		} if (feature.properties.INTTYPE1 == 'Permit') {
			return { color: 'red', weight: 2, fillOpacity: 0 };
		} else {
			return { color: 'black', weight: 2, fillOpacity: 0 };
		}
	}
})



// FWS Legacy Regions
var fwsLegacyRegions = L.esri.featureLayer({
	useCors: false,
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_Legacy_Regional_Boundaries/FeatureServer/0",
	//opacity: 0.5,
	minZoom: 5,
	style: function (feature) {
		return { color: 'blue', weight: 2, fillOpacity: 0 };
	}
});

// Style for DOI layer
var doiStyle = {
	"color": "#209D64",
	"fillOpacity": 0,
	"opacity": 0.65,
	"weight": 4
};

// DOI Regions
var doiRegions = L.esri.featureLayer({
	useCors: false,
	style: doiStyle,
	url: "https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/DOI_Unified_Regions/FeatureServer/0",
	//opacity: 0.5,
	minZoom: 5
})

int.bindPopup(function (layer) {
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
$(document).ready(function () {
	//for jshint
	'use strict';

	$('#peakDatePicker .input-daterange').datepicker({
		format: "yyyy-mm-dd",
		endDate: "today",
		startView: 2,
		maxViewMode: 3,
		todayBtn: true,
		clearBtn: true,
		multidate: false,
		autoclose: true,
		todayHighlight: true
	});

	//welcomeModal: set search for 'Go' click 
	submitSearch($('#btnSubmitEvent'), '#evtSelect_welcomeModal', '#welcomeModal', '#evtSelect_filterModal');
	//updateFiltersModal MODAL: set search for 'Go' click 
	submitSearch($('#btnSubmitEvent_filter'), '#evtSelect_updateFiltersModal', '#updateFiltersModal', '#evtSelect_filterModal');

	//set search for 'Go' click
	function submitSearch(submitButton, evtSelect_Modal_Primary, chooseModal, evtSelect_Modal_Secondary) {
		submitButton.click(function () {
			//check if an event has been selected
			if (($(evtSelect_Modal_Primary).val() !== null) && (searchResults !== undefined)) {
				//if event selected, hide welcome modal and begin filter process
				$(chooseModal).modal('hide');
				var eventID = $(evtSelect_Modal_Primary).val()[0];
				$(evtSelect_Modal_Secondary).val([eventID]).trigger("change");
				//Clear layers (removes buffer and parks/refuges selection from last search)
				map.eachLayer(function (layer) {
					map.removeLayer(layer);
				});
				//add the basemap back in 
				L.esri.basemapLayer('Topographic').addTo(map);
				//retrieve event details
				$.getJSON('https://stn.wim.usgs.gov/STNServices/events/' + eventID + '.json', {})
					.done(function (data) {
						setEventVars(data.event_name, data.event_id, data.event_status_id, data.event_start_date, data.event_end_date);
					})
					.fail(function () {
						console.log("Request Failed. Most likely invalid event name.");
					});
				//populateEventDates(eventID);
				filterMapData(eventID, false);
				searchComplete();
			} else {
				//if no event selected, warn user with alert
				// Also accounting for having an event selected but no parkref
				if (($(evtSelect_Modal_Primary).val() !== null)) {
					$('.eventSelectAlert').hide();
				} else {
					$('.eventSelectAlert').show();
				}
			}
			if (searchResults !== undefined) {
			} else {
				$('.parkRefSelectAlert').show();
			}
		});
	}

	$('#print').click(function () {
		printReport();
	});

	//Corresponds with the 'HWM CSV' button on the report modal
	$('#saveHWMCSV').click(function () {
		//if there is a hwm table, download as csv
		if (hwmCSVData.length > 0) {
			downloadCSV("hwm");
		}
		//if there are no hwm markers within the buffer, exit
		else {
			console.log("There are no hwm datapoints.")
		}
	});

	$('#savePeakCSV').click(function () {
		//if there is a hwm table, download as csv
		if (peaksCSVData.length > 0) {
			downloadCSV("peaks");
		}
		//if there are no peak markers within the buffer, exit
		else {
			console.log("There are no peak datapoints.")
		}
	});


	//'listener' for URL event params - sets event vars and passes event id to filterMapData function
	if (window.location.hash) {
		//user has arrived with an event name after the hash on the URL
		//grab the hash value, remove the '#', leaving the event name parameter
		var eventParam = window.location.hash.substring(1);
		//retrieve event details
		$.getJSON('https://stn.wim.usgs.gov/STNServices/events/' + eventParam + '.json', {})
			.done(function (data) {
				var eventID = data.event_id.toString();
				setEventVars(data.event_name, data.event_id, data.event_status_id, data.event_start_date, data.event_end_date);
				//call filter function, passing the eventid parameter string and 'true' for the 'isUrlParam' boolean argument
				filterMapData(eventID, true);
			})
			.fail(function () {
				console.log("Request Failed. Most likely invalid event name.");
			});

	} else {
		//show modal and set options - disallow user from bypassing
		$('#welcomeModal').modal({ backdrop: 'static', keyboard: false });
	}

	function setEventVars(event_name, event_id, event_status_id, event_start_date, event_end_date) {
		//set event name in URL, using regex to remove spaces
		history.pushState(null, null, '#' + (event_name.replace(/\s+/g, '')));
		//set current event name
		fev.vars.currentEventName = event_name;
		//set current event id string
		fev.vars.currentEventID_str = event_id.toString();
		//set currentEventActive boolean var based on event_status_id value
		event_status_id == 1 ? fev.vars.currentEventActive = true : fev.vars.currentEventActive = false;
		//set event date string vars, cutting off time portion and storing date only; check for undefined because services do not return the property if it has no value
		fev.vars.currentEventStartDate_str = (event_start_date == undefined ? '' : event_start_date.substr(0, 10));
		fev.vars.currentEventEndDate_str = (event_end_date == undefined ? '' : event_end_date.substr(0, 10));
		console.log("Selected event is " + event_name + ". START date is " + fev.vars.currentEventStartDate_str + " and END date is " + fev.vars.currentEventEndDate_str + ". Event is active = " + fev.vars.currentEventActive)
		setEventIndicators(event_name, event_id, fev.vars.currentEventStartDate_str, fev.vars.currentEventEndDate_str);
	}

	function setEventIndicators(eventName, eventID, eventStartDateStr, eventEndDateStr) {
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
	map = L.map('mapDiv', {
		maxZoom: 15
	}).setView([39.833333, -98.583333], 4);

	var layer = L.esri.basemapLayer('Topographic').addTo(map);
	var layerLabels;
	L.Icon.Default.imagePath = './images';
	setSearchAPI("search");
	setSearchAPI("search_filter");


	//attach the listener for data disclaimer button after the popup is opened - needed b/c popup content not in DOM right away
	map.on('popupopen', function () {
		$('.data-disclaim').click(function (e) {
			$('#aboutModal').modal('show');
			$('.nav-tabs a[href="#disclaimerTabPane"]').tab('show');
		});
	});

	map.on({
		overlayadd: function (e) {
			if (e.name.indexOf('Stream Gage') !== -1) {
				if (map.getZoom() < 9) USGSrtGages.clearLayers();
				if (map.hasLayer(USGSrtGages) && document.getElementById("streamGageToggle").checked == true && map.getZoom() >= 9) {
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
		overlayadd: function (e) {
			if (e.name.indexOf('Rain Gage') !== -1) {
				if (map.getZoom() < 9) USGSRainGages.clearLayers();
				if (map.hasLayer(USGSRainGages) && document.getElementById("rainGageToggle").checked == true && map.getZoom() >= 9) {
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
		overlayremove: function (e) {
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
		"<img class='legendSwatch' src='images/nwis.png'>&nbsp;Real-time Stream Gage": USGSrtGages,
		"<img class='legendSwatch' src='images/rainIcon.png'>&nbsp;Real-time Rain Gage": USGSRainGages
	};



	//define observed overlay and interpreted overlay, leave blank at first
	var labelOverlays = {};
	var noaaOverlays = {};


	labelOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'></img>&nbsp;" + layer.Name] = window[layer.ID];

	if (noAdvisories) {
		var div = document.getElementById('noTrackAdvisory');
		div.innerHTML += "No Active Advisories";
	} else {
		noaaOverlays = {
			"NOAA Tropical Cyclone Forecast Track": noaaService
		};
	}

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
	$('.dataTypeRadio').each(function () {
		//for the clicked radio
		$(this).on('click', function () {
			var radioId = $(this).attr('id');
			var formToShow = $('#' + radioId + 'Form');
			formToShow.show();
			$('.hiddenForm').not(formToShow).hide();
		});
	});

	//toggle the appearance of the check box on click, including toggling the check icon
	$('.check').on('click', function () {
		$(this).find('span').toggle();
	});

	function showGeosearchModal() {
		$('#geosearchModal').modal('show');

		search_api.create("searchMap", {

			// appearance
			size: "lg", // sizing option, one of "lg" (large), "md" (medium), "sm" (small), "xs" (extra small)
			width: 500,  // width of the widget [px]
			placeholder: "Search for a location", // text box placeholder prompt to display when no text is entered
			/* // search area
			lat_min       : bounds.getSouth(), // minimum latitude
			lat_max       : bounds.getNorth(), // maximum latitude
			lon_min       : bounds.getWest(),  // minimum longitude
			lon_max       : bounds.getEast(),  // maximum longitude
			search_states : "tx,ok,nm",        // csv list of 1 or more U.S. States or Territories */

			// suggestion menu
			menu_min_char: 2,     // minimum number of characters required before attempting to find menu suggestions
			menu_max_entries: 50,    // maximum number of menu items to display
			menu_height: 400,   // maximum height of menu [px]

			include_gnis_major: true,  // whether to include GNIS places as suggestions in the menu: major categories (most common)...
			include_gnis_minor: false,  // ...minor categories (less common)

			include_state: true,  // whether to include U.S. States and Territories as suggestions in the menu
			include_zip_code: false,  // whether to include 5-digit zip codes as suggestions in the menu
			include_area_code: false,  // whether to include 3-digit area codes as suggestions in the menu

			include_usgs_sw: false,  // whether to include USGS site numbers as suggestions in the menu: surface water...
			include_usgs_gw: false,  // ...ground water
			include_usgs_sp: false,  // ...spring
			include_usgs_at: false,  // ...atmospheric
			include_usgs_ot: false,  // ...other

			include_huc2: false,  // whether to include Hydrologic Unit Code (HUC) numbers as suggestions in the menu: 2-digit...
			include_huc4: false,  // ... 4-digit
			include_huc6: false,  // ... 6-digit
			include_huc8: false,  // ... 8-digit
			include_huc10: false,  // ...10-digit
			include_huc12: false,  // ...12-digit

			// event callback functions
			// function argument "o" is widget object
			// "o.result" is geojson point feature of search result with properties

			// function to execute when a search is started
			// triggered when the search textbox text changes
			on_search: function (o) {
				//console.warn(o.id + ": my 'on_search' callback function - a search is started");
				map.closePopup(); // close any previous popup when user searches for new location
			},

			// function to execute when the suggestion menu is updated
			on_update: function (o) {
				// update geojson layer with menu suggestions
				suggestion_layer.clearLayers().addData(o.getSuggestions());

				// zoom to layer if there are any points
				// pad left so open menu does not cover any points
				if (suggestion_layer.getBounds().isValid()) {
					map.fitBounds(suggestion_layer.getBounds().pad(0.4), { paddingTopLeft: [350, 0] });
				}

				// find corresponding map marker by lat-lon when mouse enters a menu item
				// open the marker popup and set opaque
				$(".search-api-menu-item").off("mouseenter").on("mouseenter", function () {
					var Lat = $(this).data("properties").Lat;
					var Lon = $(this).data("properties").Lon;
					/*suggestion_layer.eachLayer(function (lyr) {
						if (Lat === lyr.feature.properties.Lat && Lon === lyr.feature.properties.Lon) {
							lyr.setOpacity(1.0).openPopup();
						} else {
							lyr.setOpacity(0.4).closePopup();
						} 
					});*/
				});

				// close popups and set markers semi-transparent when mouse leaves a menu item
				$(".search-api-menu-item").off("mouseleave").on("mouseleave", function () {
					map.closePopup();
					suggestion_layer.eachLayer(function (lyr) { lyr.setOpacity(0.4); });
				});
			},

			// function to execute when a suggestion is chosen
			// triggered when a menu item is selected
			on_result: function (o) {
				console.warn(o.id + ": my 'on_result' callback function - a menu item was selected");
				searchResults = o;
				$('#geosearchModal').modal('hide');
				geosearchComplete();
			},

			// function to execute when no suggestions are found for the typed text
			// triggered when services return no results or time out
			on_failure: function (o) {
				console.warn(o.id + ": my 'on_failure' callback function - the services returned no results or timed out");
			},

			// miscellaneous
			verbose: false // whether to set verbose mode on (true) or off (false)
		});
	}
	$('#geosearchNav').click(function () {
		showGeosearchModal();
		
	});
	function showPrintModal() {
		$('#printModal').modal('show');

		/* setTimeout(() => {
			reviewMap = L.map('reviewMap').setView([39.833333, -98.583333], 4);
			L.esri.basemapLayer('Topographic').addTo(reviewMap);
		}, 500); */
	}

	function showRegionalModal() {
		$('#regionalModal').modal('show');

		/* setTimeout(() => {
			reviewMap = L.map('reviewMap').setView([39.833333, -98.583333], 4);
			L.esri.basemapLayer('Topographic').addTo(reviewMap);
		}, 500); */
	}

	$('#regionalReportNav').click(function () {
		showRegionalModal();
	});
	var pdfMapUrl;
	var legendUrl;
	
	$('#printNav').click(function () {
		showPrintModal();
		$("#reportFooter").hide();

		var mapPreview = document.getElementById('reviewMap');
		var legendPreview = document.getElementById('legendImage');
		/* mapPreview.innerHTML='Loading Map...'
		mapPreview.innerHTML='Loading Map...'
		 */
		if (peakTableData > 0) {
			//If peak table data does not clear from buffer, this will clear it now
			peakTableData.length = 0;
		}

		// setting up peak data for table
		var peakTableData = [];


		for (var i in identifiedPeaks) {
			var peakEstimated = "";
			if (identifiedPeaks[i].feature.properties.is_peak_stage_estimated === 0) {
				peakEstimated = "no";
			} else {
				peakEstimated = "yes"
			}

			peakTableData.push({
				"Site Number": identifiedPeaks[i].feature.properties.site_no,
				"Description": identifiedPeaks[i].feature.properties.description,
				"State": identifiedPeaks[i].feature.properties.state,
				"County": identifiedPeaks[i].feature.properties.county,
				"Peak Stage": identifiedPeaks[i].feature.properties.peak_stage,
				"Peak Estimated": peakEstimated
			});
		}
		peaksCSVData = peakTableData;

		console.log(peakTableData)


		// Builds the HTML Table for peaks
		function buildHtmlTable() {
			//Empty text from previous report, if it was run
			$("#peakTable").find("b").empty();
			$("#peakTable").prepend("<p>" + "<b>" + "Peak Summary Site Information" + "</b>" + "</p>")

			//Empty peak data table from previous report, if it was run
			$("#peakDataTable").empty();

			var columns = addAllColumnHeaders(peakTableData);

			for (var i = 0; i < peakTableData.length; i++) {
				var row$ = $('<tr/>');
				for (var colIndex = 0; colIndex < columns.length; colIndex++) {
					var cellValue = peakTableData[i][columns[colIndex]];

					if (cellValue == null) { cellValue = ""; }

					row$.append($('<td/>').html(cellValue));
				}
				$("#peakDataTable").append(row$);
			}
		}

		function addAllColumnHeaders(peakTableData) {
			var columnSet = [];
			var headerTr$ = $('<tr/>');

			for (var i = 0; i < peakTableData.length; i++) {
				var rowHash = peakTableData[i];
				for (var key in rowHash) {
					if ($.inArray(key, columnSet) == -1) {
						columnSet.push(key);
						headerTr$.append($('<th/>').html(key));
					}
				}
			}
			$("#peakDataTable").append(headerTr$);
			return columnSet;
		}

		if (peakTableData.length > 0) {
			buildHtmlTable();
		}

		//setting up HWM data for table
		var hwmTableData = [];
		var hwmCaptionData = [];
		hwmTableData.length = 0;
		for (var i in identifiedMarks) {
			hwmCaptionData.push({
				"STN Site No.": identifiedMarks[i].feature.properties.site_no
			})
		}
		for (var i in identifiedMarks) {
			hwmTableData.push({
				"STN Site No.": identifiedMarks[i].feature.properties.site_no,
				"HWM Label": identifiedMarks[i].feature.properties.hwm_label,
				"Elevation(ft)": identifiedMarks[i].feature.properties.elev_ft,
				"Vertical Datum": identifiedMarks[i].feature.properties.verticalDatumName,
				"Vertical Method": identifiedMarks[i].feature.properties.verticalMethodName,
				"Horizontal Datum": identifiedMarks[i].feature.properties.horizontalDatumName,
				"Horizontal Method": identifiedMarks[i].feature.properties.horizontalMethodName,
				//"Approval Status": identifiedMarks[i].feature.properties,
				"Type": identifiedMarks[i].feature.properties.hwmTypeName,
				//"Marker": identifiedMarks[i].feature.properties,
				"Quality": identifiedMarks[i].feature.properties.hwmQualityName,
				"Waterbody": identifiedMarks[i].feature.properties.waterbody,
				"Permanent Housing": identifiedMarks[i].feature.properties.sitePermHousing,
				"County": identifiedMarks[i].feature.properties.countyName,
				"State": identifiedMarks[i].feature.properties.stateName,
				"Latitude, Longitude(DD)": identifiedMarks[i].feature.properties.latitude + ", " + identifiedMarks[i].feature.properties.longitude,
				"Site Description": identifiedMarks[i].feature.properties.siteDescription,
				"Location Description": identifiedMarks[i].feature.properties.hwm_locationdescription,
				"Survey Date": identifiedMarks[i].feature.properties.survey_date,
				"Bank": identifiedMarks[i].feature.properties.bank,
				"Environment": identifiedMarks[i].feature.properties.hwm_environment,
				"Flag Date": identifiedMarks[i].feature.properties.flag_date,
				"Stillwater": identifiedMarks[i].feature.properties.stillwater,
				"Uncertainty": identifiedMarks[i].feature.properties.uncertainty,
				"HWM Uncertainty": identifiedMarks[i].feature.properties.hwm_uncertainty
			})
		}
		var chunks = [];
		hwmCSVData = hwmTableData;

		console.log(hwmTableData)

		//console.log("hwmTableData", hwmCSVData);
		//console.log("length of hwm data", hwmCSVData.length);

		/* //Messing around with taking chunks of the table data... 
		$.each(hwmTableData, function (index, value) {
			//console.log(value)
			var chunkSize = 11;
			for (var cols = Object.entries(value); cols.length;)
				chunks.push(cols.splice(0, chunkSize).reduce((o, [k, v]) => (o[k] = v, o), {}));
			//console.log(chunks);
		});
		//$.each(chunks, function(index, value) {}); */

		//build HTML Table for HWMs
		function buildHwmHtmlTable() {
			//Empty text from previous report, if was run
			$("#hwmTable").find("b").empty();
			$("#hwmTable").prepend("<p>" + "<b>" + "High Water Mark Site Information" + "</b>" + "</p>")

			//Empty hwm data table from previous report, if it was run
			$("#hwmDataTable").empty();

			var columns = addHwmColumnHeaders(hwmTableData);

			for (var i = 0; i < hwmTableData.length; i++) {
				var row$ = $('<tr/>');
				for (var colIndex = 0; colIndex < columns.length; colIndex++) {
					var cellValue = hwmTableData[i][columns[colIndex]];

					if (cellValue == null) { cellValue = ""; }

					row$.append($('<td/>').html(cellValue));
				}
				$("#hwmDataTable").append(row$);
			}
		}

		function addHwmColumnHeaders(hwmTableData) {
			var columnSet = [];
			var headerTr$ = $('<tr/>');

			for (var i = 0; i < hwmTableData.length; i++) {
				var rowHash = hwmTableData[i];
				for (var key in rowHash) {
					if ($.inArray(key, columnSet) == -1) {
						columnSet.push(key);
						headerTr$.append($('<th/>').html(key));
					}
				}
			}
			$("#hwmDataTable").append(headerTr$);

			return columnSet;
		}

		if (hwmTableData.length > 0) {
			buildHwmHtmlTable();
		}

		//test function 
		function export_table_to_csv() {
			var csv = [];
			var rows = hwmDataTable.querySelectorAll("table tr");
			console.log("rows here:", rows);
			/*
			console.log("here are the rows:", rows);
			var cols = hwmDataTable.querySelectorAll("tr td");
			console.log("here are the cols:", cols);
		*/
			for (var i = 0; i < rows.length; i++) {
				var row = [];
				var cols = rows[i].querySelectorAll("tr td");
				console.log("cols here:", cols);
				/*
				for (var j = 0; j < cols.length; j++) 
					row.push(cols[j].innerText);
					console.log("new line", row );
					*/

				//csv.push(row.join(","));

			}

			//console.log("csv in table:", csv);
		}
		export_table_to_csv();


		var hwmCSV = hwmDataTable.table2csv;
		console.log("hwmDataTable", hwmDataTable);
		console.log("hwmCSV", hwmCSV);

		setTimeout(() => {
			let mapPane;
			mapPane = $('.leaflet-map-pane')[0];
			const mapTransform = mapPane.style.transform.split(',');
			// const mapX = parseFloat(mapTransform[0].split('(')[1].replace('px', ''));
			let mapX;

			// fix for firefox
			if (mapTransform[0] === undefined) {
				mapX = '';
			} if (mapTransform[0].split('(')[1] === undefined) {
				mapX = '';
			} else {
				mapX = parseFloat(mapTransform[0].split('(')[1].replace('px', ''));
			}

			let mapY;
			if (mapTransform[1] === undefined) {
				mapY = '';
			} else {
				mapY = parseFloat(mapTransform[1].replace('px', ''));
			}

			mapPane.style.transform = '';
			mapPane.style.left = mapX + 'px';
			mapPane.style.top = mapY + 'px';

			const myTiles = $('img.leaflet-tile');
			const tilesLeft = [];
			const tilesTop = [];
			const tileMethod = [];
			for (let i = 0; i < myTiles.length; i++) {
				if (myTiles[i].style.left !== '') {
					tilesLeft.push(parseFloat(myTiles[i].style.left.replace('px', '')));
					tilesTop.push(parseFloat(myTiles[i].style.top.replace('px', '')));
					tileMethod[i] = 'left';
				} else if (myTiles[i].style.transform !== '') {
					const tileTransform = myTiles[i].style.transform.split(',');
					tilesLeft[i] = parseFloat(tileTransform[0].split('(')[1].replace('px', ''));
					tilesTop[i] = parseFloat(tileTransform[1].replace('px', ''));
					myTiles[i].style.transform = '';
					tileMethod[i] = 'transform';
				} else {
					tilesLeft[i] = 0;
					// tilesRight[i] = 0;
					tileMethod[i] = 'neither';
				}
				myTiles[i].style.left = (tilesLeft[i]) + 'px';
				myTiles[i].style.top = (tilesTop[i]) + 'px';
			}

			const myDivicons = $('.leaflet-marker-icon');
			const dx = [];
			const dy = [];
			const mLeft = [];
			const mTop = [];
			for (let i = 0; i < myDivicons.length; i++) {
				const curTransform = myDivicons[i].style.transform;
				const splitTransform = curTransform.split(',');
				if (splitTransform[0] === '') {

				} else {
					dx.push(parseFloat(splitTransform[0].split('(')[1].replace('px', '')));
				}
				if (splitTransform[0] === '') {

					// when printing without reloading the style.transform property is blank
					// but the values we need are in the style.cssText string
					// so with the code below I'm manipulating those strings to get the values we need

					dx.push(myDivicons[i].style.cssText.split(' left: ')[1].split('px')[0]);
					dy.push(myDivicons[i].style.cssText.split('top')[1].replace('px;', ''));
				} else {
					dy.push(parseFloat(splitTransform[1].replace('px', '')));
				}
				// dx.push(parseFloat(splitTransform[0].split('(')[1].replace('px', '')));
				// dy.push(parseFloat(splitTransform[1].replace('px', '')));
				myDivicons[i].style.transform = '';
				myDivicons[i].style.left = dx[i] + 'px';
				myDivicons[i].style.top = dy[i] + 'px';
			}

			const mapWidth = parseFloat($('#mapDiv').css('width').replace('px', ''));
			const mapHeight = parseFloat($('#mapDiv').css('height').replace('px', ''));

			/* const linesLayer = $('svg.leaflet-zoom-animated')[0];
			const oldLinesWidth = linesLayer.getAttribute('width');
			const oldLinesHeight = linesLayer.getAttribute('height');
			const oldViewbox = linesLayer.getAttribute('viewBox');
			linesLayer.setAttribute('width', mapWidth.toString());
			linesLayer.setAttribute('height', mapHeight.toString());
			linesLayer.setAttribute('viewBox', '0 0 ' + mapWidth + ' ' + mapHeight);
			const linesTransform = linesLayer.style.transform.split(',');
			const linesX = parseFloat(linesTransform[0].split('(')[1].replace('px', ''));
			const linesY = parseFloat(linesTransform[1].replace('px', ''));
			linesLayer.style.transform = '';
			linesLayer.style.left = '';
			linesLayer.style.top = ''; */

			const options = {
				useCORS: true,
			};

			for (let i = 0; i < myTiles.length; i++) {
				if (tileMethod[i] === 'left') {
					myTiles[i].style.left = (tilesLeft[i]) + 'px';
					myTiles[i].style.top = (tilesTop[i]) + 'px';
				} else if (tileMethod[i] === 'transform') {
					myTiles[i].style.left = '';
					myTiles[i].style.top = '';
					myTiles[i].style.transform = 'translate(' + tilesLeft[i] + 'px, ' + tilesTop[i] + 'px)';
				} else {
					myTiles[i].style.left = '0px';
					myTiles[i].style.top = '0px';
					myTiles[i].style.transform = 'translate(0px, 0px)';
				}
			}
			for (let i = 0; i < myDivicons.length; i++) {
				myDivicons[i].style.transform = 'translate(' + dx[i] + 'px, ' + dy[i] + 'px, 0)';
				myDivicons[i].style.marginLeft = mLeft[i] + 'px';
				myDivicons[i].style.marginTop = mTop[i] + 'px';
			}
			/* linesLayer.style.transform = 'translate(' + (linesX) + 'px,' + (linesY) + 'px)';
			linesLayer.setAttribute('viewBox', oldViewbox);
			linesLayer.setAttribute('width', oldLinesWidth);
			linesLayer.setAttribute('height', oldLinesHeight); */
			mapPane.style.transform = 'translate(' + (mapX) + 'px,' + (mapY) + 'px)';
			mapPane.style.left = '';
			mapPane.style.top = '';

			// Hiding Legend for canvas event
			$("#legendElement").hide();

			var mapEvent;
			html2canvas(document.getElementById('mapDiv'), options)
				.then(function (canvas) {
					mapEvent = new Event('map_ready');
					/* canvas[0].drawImage */
					canvas.style.width = '700px';
					canvas.style.height = '450px';
					mapPreview.append(canvas);
					//mapImage = canvas.get(0).toDataUrl('image/png');
					pdfMapUrl = canvas.toDataURL('image/png');
					window.dispatchEvent(mapEvent);
					// Showing Legend once canvas event complete
					$("#legendElement").show();
				})
		}, 3000);

		setTimeout(() => {
			document.getElementById('loader').remove();
			document.getElementById('loadingMessage').remove();
		}, 3001);
		
		// Get legend for print preview
		html2canvas(document.getElementById('legendDiv'))
		.then(function (canvas) {
			legendPreview.append(canvas);
			legendUrl = canvas.toDataURL('image/png');
		});	

		setTimeout(() => {
			$("#reportFooter").show();
		}, 4500);
	});

	/* $('#printModal').bind('load',  function(){
		reviewMap = L.map('reviewMap').setView([39.833333, -98.583333], 4);
		L.esri.basemapLayer('Topographic').addTo(reviewMap);
	}) */

	// reloading the page at the moment because icons displaced when zooming after printing. 
	//Need to figure out how to fix this, maybe just reintialize the map? we did have to fix 
	//this in whispers too but can't remember what I did off hand
	$("#printModal").on("hidden.bs.modal", function () {

		// leaving this in until we have 
		location.reload();

		document.getElementById('reviewMap').innerHTML = ""; // deletes the image so that there aren't multiple on the next print
		/* USGSrtGages.clearLayers();
		USGSRainGages.clearLayers(); */
		//refreshMapData(); function to reset map data
	});


	function showAboutModal() {
		$('#aboutModal').modal('show');
	}
	$('#aboutNav').click(function () {
		showAboutModal();
	});

	function showFiltersModal() {
		$('#updateFiltersModal').modal('show');
	}
	$('#btnChangeFilters').click(function () {
		//parks.clearLayers();
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

	$('.basemapBtn').on('click', function () {
		var baseMap = this.id.replace('btn', '');

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
	/* var searchScript = document.createElement('script');
	searchScript.src = 'https://txpub.usgs.gov/DSS/search_api/1.1/api/search_api.min.js';
	searchScript.onload = function () {
		setSearchAPI();
	};
	document.body.appendChild(searchScript); */

	function refreshMapData() {
		displaySensorGeoJSON();
		displayHWMGeoJSON();
		displayPeaksGeoJSON();
		populateEventDates();
		checkLayerCount();
		filterMapData();
		queryNWISRainGages();
		queryNWISrtGages();
		queryNWISgraphRDG();
		queryNWISgraph();
		queryNWISRaingraph();
		//clickPeakLabels();
	}
	// setting checked values for Welcome Modal buffer radio buttons
	document.getElementById('tenKm').checked = false;
	document.getElementById('twentyKm').checked = true;
	document.getElementById('thirtyKm').checked = false;
	document.getElementById('fiftyKm').checked = false;
	// 10 kilometers
	$('#tenKm').click(function () {
		console.log("10 button clicked");
		document.getElementById('twentyKm').checked = false;
		document.getElementById('thirtyKm').checked = false;
		document.getElementById('fiftyKm').checked = false;
		fev.vars.currentBufferSelection = 10;
	});
	// 20 kilometers
	$('#twentyKm').click(function () {
		console.log("20 button clicked");
		document.getElementById('tenKm').checked = false;
		document.getElementById('thirtyKm').checked = false;
		document.getElementById('fiftyKm').checked = false;
		fev.vars.currentBufferSelection = 20;
	});
	// 30 kilometers
	$('#thirtyKm').click(function () {
		console.log("30 button clicked");
		document.getElementById('twentyKm').checked = false;
		document.getElementById('tenKm').checked = false;
		document.getElementById('fiftyKm').checked = false;
		fev.vars.currentBufferSelection = 30;
	});
	// 50 kilometers
	$('#fiftyKm').click(function () {
		console.log("50 button clicked");
		document.getElementById('tenKm').checked = false;
		document.getElementById('twentyKm').checked = false;
		document.getElementById('tenKm').checked = false;
		fev.vars.currentBufferSelection = 50;
	});

	// setting checked values for Filter Modal buffer radio buttons
	document.getElementById('tenKmFilter').checked = false;
	document.getElementById('twentyKmFilter').checked = true;
	document.getElementById('thirtyKmFilter').checked = false;
	document.getElementById('fiftyKmFilter').checked = false;
	// 10 kilometers
	$('#tenKmFilter').click(function () {
		document.getElementById('twentyKmFilter').checked = false;
		document.getElementById('thirtyKmFilter').checked = false;
		document.getElementById('fiftyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 10;
	});
	// 20 kilometers
	$('#twentyKmFilter').click(function () {
		document.getElementById('tenKmFilter').checked = false;
		document.getElementById('thirtyKmFilter').checked = false;
		document.getElementById('fiftyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 20;
	});
	// 30 kilometers
	$('#thirtyKmFilter').click(function () {
		document.getElementById('twentyKmFilter').checked = false;
		document.getElementById('tenKmFilter').checked = false;
		document.getElementById('fiftyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 30;
	});
	// 50 kilometers
	$('#fiftyKmFilter').click(function () {
		document.getElementById('twentyKmFilter').checked = false;
		document.getElementById('tenKmFilter').checked = false;
		document.getElementById('thirtyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 50;
	});




	// add empty geojson layer that will contain suggested locations on update
	var suggestion_layer = L.geoJson(null, {
		pointToLayer: function (feature, latlng) {
			return (
				L.marker(latlng, {
					opacity: 0.4
				})
					.bindPopup(
						// popup content
						'<div style="text-align:center;">' +
						'<b>' + feature.properties.Label + '</b><br/>' +
						feature.properties.Category +
						'</div>',
						// options
						{ autoPan: false } // do not pan map to popup when opens
					)
					.on("mouseover", function () {
						// make marker opaque and open popup when mouse is over marker
						this.setOpacity(1.0).openPopup();
					})
					.on("mouseout", function () {
						// make marker semi-transparent and close popup when mouse exits marker
						this.setOpacity(0.4).closePopup();
					})
					.on("click", function () {
						// set result with the marker feature and trigger result event to select the location when the marker is clicked
						searchObj.result = feature;
						searchObj.val("").trigger("result");
					})
			);
		}
	}).addTo(map);

	function setSearchAPI(searchTerm) {
		// create search_api widget
		searchObject = search_api.create(searchTerm, {

			// appearance
			size: "lg", // sizing option, one of "lg" (large), "md" (medium), "sm" (small), "xs" (extra small)
			width: 500,  // width of the widget [px]
			placeholder: "Search for a Park or Refuge", // text box placeholder prompt to display when no text is entered
			/* // search area
			lat_min       : bounds.getSouth(), // minimum latitude
			lat_max       : bounds.getNorth(), // maximum latitude
			lon_min       : bounds.getWest(),  // minimum longitude
			lon_max       : bounds.getEast(),  // maximum longitude
			search_states : "tx,ok,nm",        // csv list of 1 or more U.S. States or Territories */

			// suggestion menu
			menu_min_char: 2,     // minimum number of characters required before attempting to find menu suggestions
			menu_max_entries: 50,    // maximum number of menu items to display
			menu_height: 400,   // maximum height of menu [px]

			include_gnis_major: true,  // whether to include GNIS places as suggestions in the menu: major categories (most common)...
			include_gnis_minor: false,  // ...minor categories (less common)

			include_state: true,  // whether to include U.S. States and Territories as suggestions in the menu
			include_zip_code: false,  // whether to include 5-digit zip codes as suggestions in the menu
			include_area_code: false,  // whether to include 3-digit area codes as suggestions in the menu

			include_usgs_sw: false,  // whether to include USGS site numbers as suggestions in the menu: surface water...
			include_usgs_gw: false,  // ...ground water
			include_usgs_sp: false,  // ...spring
			include_usgs_at: false,  // ...atmospheric
			include_usgs_ot: false,  // ...other

			include_huc2: false,  // whether to include Hydrologic Unit Code (HUC) numbers as suggestions in the menu: 2-digit...
			include_huc4: false,  // ... 4-digit
			include_huc6: false,  // ... 6-digit
			include_huc8: false,  // ... 8-digit
			include_huc10: false,  // ...10-digit
			include_huc12: false,  // ...12-digit

			// event callback functions
			// function argument "o" is widget object
			// "o.result" is geojson point feature of search result with properties

			// function to execute when a search is started
			// triggered when the search textbox text changes
			on_search: function (o) {
				//console.warn(o.id + ": my 'on_search' callback function - a search is started");
				map.closePopup(); // close any previous popup when user searches for new location
			},

			// function to execute when the suggestion menu is updated
			on_update: function (o) {
				/* // update geojson layer with menu suggestions
				suggestion_layer.clearLayers().addData(o.getSuggestions());

				// zoom to layer if there are any points
				// pad left so open menu does not cover any points
				if (suggestion_layer.getBounds().isValid()) {
					map.fitBounds(suggestion_layer.getBounds().pad(0.4), { paddingTopLeft: [350, 0] });
				} */

				// find corresponding map marker by lat-lon when mouse enters a menu item
				// open the marker popup and set opaque
				$(".search-api-menu-item").off("mouseenter").on("mouseenter", function () {
					var Lat = $(this).data("properties").Lat;
					var Lon = $(this).data("properties").Lon;
					suggestion_layer.eachLayer(function (lyr) {
						if (Lat === lyr.feature.properties.Lat && Lon === lyr.feature.properties.Lon) {
							lyr.setOpacity(1.0).openPopup();
						} else {
							lyr.setOpacity(0.4).closePopup();
						}
					});
				});

				// close popups and set markers semi-transparent when mouse leaves a menu item
				$(".search-api-menu-item").off("mouseleave").on("mouseleave", function () {
					map.closePopup();
					suggestion_layer.eachLayer(function (lyr) { lyr.setOpacity(0.4); });
				});
			},



			// function to execute when a suggestion is chosen
			// triggered when a menu item is selected
			on_result: function (o) {
				console.warn(o.id + ": my 'on_result' callback function - a menu item was selected");
				searchResults = o;

				// populates the search with the selected park
				o.val(searchResults.result.properties.Name);
			},

			// function to execute when no suggestions are found for the typed text
			// triggered when services return no results or time out
			on_failure: function (o) {
				console.warn(o.id + ": my 'on_failure' callback function - the services returned no results or timed out");
			},

			// miscellaneous
			verbose: false // whether to set verbose mode on (true) or off (false)
		});
	}

	function searchComplete() {
		// Clearing identified peaks and identified marks arrays before buffer runs if array had previous values
		identifiedPeaks.length = 0;
		identifiedMarks.length = 0;

		map
			.fitBounds([ // zoom to location
				[searchResults.result.properties.LatMin, searchResults.result.properties.LonMin],
				[searchResults.result.properties.LatMax, searchResults.result.properties.LonMax]
			]);

		// getting and setting park name from search
		var name = searchResults.result.properties.Name;

		// setting the current Park or Refuge selected for the report
		currentParkOrRefuge = name;
		console.log(currentParkOrRefuge);

		// formatiing park name for use in esri leaflet query
		name = "'" + name + "'";

		// setting buffer style
		var bufferStyle = {
			"color": "#0000cc",
			"fillOpacity": 0,
			"opacity": 0.65,
			"weight": 4
		};

		// setting park style
		var parkStyle = {
			"color": "#0000cc",
			"weight": 2,
			"opacity": 100
		};

		// setting the where class for the query
		// UNIT_NAME holds gnis major value of park name (I think)
		var where = "1=1";
		var polys = [];
		var buffer;
		var regionName;

		where = "UNIT_NAME=" + name;
		parks = L.esri.featureLayer({
			useCors: false,
			url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2',
			simplifyFactor: 0.5,
			precision: 4,
			where: "UNIT_NAME=" + name,
			onEachFeature: function (feature, latlng) {
				var popupContent = '<p>' + feature.properties.UNIT_NAME + '</p>';
				latlng.bindPopup(popupContent);
				polys = feature.geometry;
				// flattening the geometry for use in turf
				flattenedPoly = turf.flatten(polys);
				regionName = feature.properties.REGION;
				if (regionName == "PW") {
					regionName = "Pacific West";
				}
				if (regionName == "IM") {
					regionName = "Intermountain";
				}
				if (regionName == "MW") {
					regionName = "Midwest";
				}
				if (regionName == "NE") {
					regionName = "Northeast";
				}
				if (regionName == "SE") {
					regionName = "Southeast";
				}
				if (regionName == "AK") {
					regionName = "Alaska";
				}
				if (regionName == "NC") {
					regionName = "National Capital";
				}
			},
			style: parkStyle
		}).addTo(map);
		parksLayerGroup.addLayer(parks);


		var refCount = [];
		where = "ORGNAME=" + name;
		refuges = L.esri.featureLayer({
			useCors: false,
			url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved/FeatureServer/1',
			simplifyFactor: 0.5,
			precision: 4,
			where: "ORGNAME=" + name,
			onEachFeature: function (feature, latlng) {
				var popupContent = '<p>' + feature.properties.UNIT_NAME + '</p>';
				latlng.bindPopup(popupContent);
				polys = feature.geometry;
				// flattening the geometry for use in turf
				flattenedPoly = turf.flatten(polys);
				refCount = 1;
				regionName = feature.properties.FWSREGION;
				if (regionName == "1") {
					regionName = "Pacific";
				}
				if (regionName == "2") {
					regionName = "Southwest";
				}
				if (regionName == "3") {
					regionName = "Midwest";
				}
				if (regionName == "4") {
					regionName = "Southeast";
				}
				if (regionName == "5") {
					regionName = "Northeast";
				}
				if (regionName == "6") {
					regionName = "Mountain-Prairie";
				}
				if (regionName == "7") {
					regionName = "Alaska";
				}
				if (regionName == "8") {
					regionName = "California";
				}
			},
			style: parkStyle
		}).addTo(map);

		//if there was a name match with the refuge layer, this will not run
		setTimeout(() => {
			if (refCount !== 1) {
				where = "ORGNAME=" + name;
				fwsInterest = L.esri.featureLayer({
					useCors: false,
					url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSInterest_Simplified_Authoritative/FeatureServer/1',
					simplifyFactor: 0.5,
					precision: 4,
					where: "ORGNAME=" + name,
					onEachFeature: function (feature, latlng) {
						var popupContent = '<p>' + feature.properties.UNIT_NAME + '</p>';
						latlng.bindPopup(popupContent);
						polys = feature.geometry;
						// flattening the geometry for use in turf
						flattenedPoly = turf.flatten(polys);
						refCount = 1;
						regionName = feature.properties.FWSREGION;
					},
					style: parkStyle
				}).addTo(map);
			}
		}, 1000);


		setTimeout(() => {
			var buffered = turf.buffer(flattenedPoly, fev.vars.currentBufferSelection, { units: 'kilometers' });
			var polysCount = flattenedPoly.features.length;
			buffer = buffered;

			// if there is more than one poly for a park we merge the buffers made for each park. can only do two at a time
			if (polysCount >= 1) {
				buffer = buffered.features[0];

				// cycling through features
				for (var i = 0; i < buffered.features.length; i++) {
					// not cycling through if we're on the last one
					if (i === (polysCount - 1)) {

					} else {

						// getting the index of the next feature to use in the union
						var nextFeatureIndex = i + 1;
						var nextFeature = buffered.features[nextFeatureIndex];

						// unifying or merging the buffer
						buffer = turf.union(buffer, nextFeature);
					}
				}
			}

			// adding the buffer to the map
			bufferPoly = L.geoJson(buffer, {
				style: bufferStyle,
				pointToLayer: function (feature, latlng) {
					return L.circleMarker(latlng, labelMarkerOptions);
				},
			}).addTo(map);
			map.fitBounds(bufferPoly.getBounds());

			// cycling through each peak and seeing if it's inside the buffer
			for (var i in peak._layers) {

				// formatting point for turf
				var cords = ([peak._layers[i]._latlng.lng, peak._layers[i]._latlng.lat]);

				var isItInside = turf.booleanPointInPolygon(cords, buffer);

				// if true add it to an array containing all the 'true' peaks
				if (isItInside) {
					identifiedPeaks.push(peak._layers[i])
				}
			}

			//cycling through each HWM to see if inside the buffer
			for (var i in hwm._layers) {
				var cords = ([hwm._layers[i]._latlng.lng, hwm._layers[i]._latlng.lat]);
				var isItInside = turf.booleanPointInPolygon(cords, buffer);
				if (isItInside) {
					identifiedMarks.push(hwm._layers[i])
				}
			}

			//location popup
			map.openPopup(
				"<b>" + searchResults.result.properties.Name + "</b><br/>" +
				searchResults.result.properties.County + ", " + searchResults.result.properties.State + "</b><br/>" +
				"Buffer Distance: " + fev.vars.currentBufferSelection + "km" + "</b><br/>" +
				"Region: " + regionName + "</b><br/>",
				[searchResults.result.properties.Lat, searchResults.result.properties.Lon]
			);

		}, 1001);
		//$(inputModal).modal('hide');

	}

	//the geosearch (in the navbar) zooms to the input location and returns a popup with location name, county, state
	function geosearchComplete() {
		map
			.fitBounds([ // zoom to location
				[searchResults.result.properties.LatMin, searchResults.result.properties.LonMin],
				[searchResults.result.properties.LatMax, searchResults.result.properties.LonMax]
			]);

		//location popup
		map.openPopup(
			"<b>" + searchResults.result.properties.Name + "</b><br/>" +
			searchResults.result.properties.County + ", " + searchResults.result.properties.State,
			[searchResults.result.properties.Lat, searchResults.result.properties.Lon]
		);

	}
	//end of search api





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
	map.on('load moveend zoomend', function (e) {

		var foundPopup;
		$.each(USGSrtGages.getLayers(), function (index, marker) {
			var popup = marker.getPopup();
			if (popup) {
				foundPopup = popup._isOpen;
			}
		})

		$.each(USGSRainGages.getLayers(), function (index, marker) {
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

			//Remove layers from map
			appr.removeFrom(map);
			int.removeFrom(map);
			tracts.removeFrom(map);
			bounds.removeFrom(map);

			//Prevent check boxes from being checked
			var approvedFWSCheckBox = document.getElementById("approvedFWSToggle");
			approvedFWSCheckBox.checked = false;

			var interestFWSCheckBox = document.getElementById("interestFWSToggle");
			interestFWSCheckBox.checked = false;

			var tractCheckBox = document.getElementById("tractToggle");
			tractCheckBox.checked = false;

			var parkBoundsCheckBox = document.getElementById("parkBoundsToggle");
			parkBoundsCheckBox.checked = false;

			var streamgageCheckBox = document.getElementById("streamGageToggle");
			streamgageCheckBox.checked = false;

			var raingageCheckBox = document.getElementById("rainGageToggle");
			raingageCheckBox.checked = false;

			//Remove item from legend
			$('#approvedFWSSymbology').children().remove();
			$('#interestFWSSymbology').children().remove();
			$('#parkTractsSymbology').children().remove();
			$('#parkBoundsSymbology').children().remove();
			$('#streamGageSymbology').children().remove();
			$('#rainGageSymbology').children().remove();
		}
		//Remove peak labels and turn off/disable toggle when zoom is less than 8
		if (map.getZoom() < 8) {
			//Remove labels
			peak.eachLayer(function (myMarker) {
				myMarker.hideLabel();
				var checkBox = document.getElementById("peakCheckbox");
				//Change toggle to 'off' position
				checkBox.checked = false;
			});
		}
		if (map.getZoom() >= 9) {
			$('#rtScaleAlert').hide();
		}
		if (map.hasLayer(USGSrtGages) && document.getElementById("streamGageToggle").checked == true && map.getZoom() >= 9 && !foundPopup) {
			//USGSrtGages.clearLayers();
			$('#nwisLoadingAlert').show();
			var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
			queryNWISrtGages(bbox);
			queryNWISRainGages(bbox);
			if (map.hasLayer(USGSrtGages) && map.hasLayer(USGSRainGages)) {
				USGSRainGages.bringToFront();
			}
		}
		if (map.hasLayer(USGSRainGages) && document.getElementById("rainGageToggle").checked == true && map.getZoom() >= 9 && !foundPopup) {
			//USGSrtGages.clearLayers();
			$('#nwisLoadingAlert').show();
			var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
			queryNWISRainGages(bbox);
			if (map.hasLayer(USGSRainGages) && map.hasLayer(USGSRainGages)) {
				USGSRainGages.bringToFront();
			}
		}
	});

	USGSrtGages.on('click', function (e) {
		queryNWISgraph(e);

	});

	USGSRainGages.on('click', function (e) {
		queryNWISRaingraph(e);

	});

	rdg.on('click', function (e) {
		queryNWISgraphRDG(e);
	});

	//begin latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////

	//displays map scale on map load
	//map.on( 'load', function() {
	map.whenReady(function () {
		var mapScale = scaleLookup(map.getZoom());
		$('#scale')[0].innerHTML = mapScale;
		console.log('Initial Map scale registered as ' + mapScale, map.getZoom());

		var initMapCenter = map.getCenter();
		$('#latitude').html(initMapCenter.lat.toFixed(4));
		$('#longitude').html(initMapCenter.lng.toFixed(4));
	});

	//displays map scale on scale change (i.e. zoom level)
	map.on('zoomend', function () {
		var mapZoom = map.getZoom();
		var mapScale = scaleLookup(mapZoom);
		$('#scale')[0].innerHTML = mapScale;
		$('#zoomLevel')[0].innerHTML = mapZoom;
	});

	//updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes 'map center' label
	map.on('mousemove', function (cursorPosition) {
		$('#mapCenterLabel').css('display', 'none');
		if (cursorPosition.latlng !== null) {
			$('#latitude').html(cursorPosition.latlng.lat.toFixed(4));
			$('#longitude').html(cursorPosition.latlng.lng.toFixed(4));
		}
	});
	//updates lat/lng indicator to map center after pan and shows 'map center' label.
	map.on('dragend', function () {
		//displays latitude and longitude of map center
		$('#mapCenterLabel').css('display', 'inline');
		var geographicMapCenter = map.getCenter();
		$('#latitude').html(geographicMapCenter.lat.toFixed(4));
		$('#longitude').html(geographicMapCenter.lng.toFixed(4));
	});

	//Begin data prep for pdf print out

	//Get peak summary data into table for pdf report
	var peaksPdfData = [];	
	function bodyData() {
		for (var i in identifiedPeaks) {
			var peakEstimated = "";
			if (identifiedPeaks[i].feature.properties.is_peak_stage_estimated === 0) {
				peakEstimated = "no";
			} else {
				peakEstimated = "yes"
			}

			peaksPdfData.push({
				"Site Number": identifiedPeaks[i].feature.properties.site_no,
				"Description": identifiedPeaks[i].feature.properties.description,
				"State": identifiedPeaks[i].feature.properties.state,
				"County": identifiedPeaks[i].feature.properties.county,
				"Peak Stage": identifiedPeaks[i].feature.properties.peak_stage,
				"Peak Estimated": peakEstimated
			});
		}
		return peaksPdfData;
	}


	function buildTableBody(data, columns) {
		var body = [];
		body.push(columns);
		data.forEach(function (row) {
			var dataRow = [];
			columns.forEach(function (column) {
				dataRow.push(row[column].toString());
			})
			body.push(dataRow);
		});
		return body;
	}

	function peakTable(data, columns) {
		return {
			table: {
				headerRows: 1,
				widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
				body: buildTableBody(data, columns),
			},
			layout: 'lightHorizontalLines',
			style: 'smaller',
			margin: [0, 0, 0, 15]
		};
	}

	//adding HWM table to pdf report
	function buildHwmTableBody() {
		var body = [];
		for (var i in identifiedMarks) {
			var hwmUncertainty = "";
			var uncertainty = "";
			if (identifiedMarks[i].feature.properties.hwm_uncertainty == null) {
				hwmUncertainty = "n/a";
			}
			if (identifiedMarks[i].feature.properties.uncertainty == null) {
				uncertainty = "n/a";
			}
			body.push([
				{ rowSpan: 10, style: 'tableHeader', text: 'STN Site No.: ' + identifiedMarks[i].feature.properties.site_no },
				{ text: 'HWM Label', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwm_label,
				{ text: 'Elevation(ft)', style: 'tableHeader' }, identifiedMarks[i].feature.properties.elev_ft
			],
				[
					{},
					{ text: 'Vertical Datum, Method', style: 'tableHeader' }, identifiedMarks[i].feature.properties.verticalDatumName + ", " + identifiedMarks[i].feature.properties.verticalMethodName,
					{ text: 'Horizontal Datum, Method', style: 'tableHeader' }, identifiedMarks[i].feature.properties.horizontalDatumName + ", " + identifiedMarks[i].feature.properties.horizontalMethodName
				],
				[
					{},
					{ text: 'Type', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwmTypeName,
					{ text: 'Quality', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwmQualityName
				],
				[
					{},
					{ text: 'Waterbody', style: 'tableHeader' }, identifiedMarks[i].feature.properties.waterbody,
					{ text: 'Permanent Housing', style: 'tableHeader' }, identifiedMarks[i].feature.properties.sitePermHousing
				],
				[
					{},
					{ text: 'County', style: 'tableHeader' }, identifiedMarks[i].feature.properties.countyName,
					{ text: 'State', style: 'tableHeader' }, identifiedMarks[i].feature.properties.stateName
				],
				[
					{},
					{ text: 'Latitude, Longitude(DD)', style: 'tableHeader' }, identifiedMarks[i].feature.properties.latitude + ", " + identifiedMarks[i].feature.properties.longitude,
					{ text: 'Site Description', style: 'tableHeader' }, identifiedMarks[i].feature.properties.siteDescription
				],
				[
					{},
					{ text: 'Location Description', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwm_locationdescription,
					{ text: 'Survey Date', style: 'tableHeader' }, identifiedMarks[i].feature.properties.survey_date
				],
				[
					{},
					{ text: 'Bank', style: 'tableHeader' }, identifiedMarks[i].feature.properties.bank,
					{ text: 'Environment', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwm_environment
				],
				[
					{},
					{ text: 'Flag Date', style: 'tableHeader' }, identifiedMarks[i].feature.properties.flag_date,
					{ text: 'Stillwater', style: 'tableHeader' }, identifiedMarks[i].feature.properties.stillwater
				],
				[
					{},
					{ text: 'Uncertainty', style: 'tableHeader' }, uncertainty,
					{ text: 'HWM Uncertainty', style: 'tableHeader' }, hwmUncertainty
				]
			);
		}
		return body;
	}

	function hwmTable() {
		return {
			table: {
				widths: ['auto', 'auto', '*', 'auto', '*'],
				body: buildHwmTableBody(),
			},
			layout: {
				hLineWidth: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 1 : 1;
				},
				vLineWidth: function (i, node) {
					return (i === 0 || i === node.table.widths.length) ? 1 : 1;
				},
				hLineColor: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
				},
				vLineColor: function (i, node) {
					return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
				},
			},
			style: 'smaller',
			margin: [0, 0, 0, 15],
		};
	}

	//This runs when clicking the 'Peak CSV' or 'HWM CSV' button on the Report modal
	function downloadCSV(type) {
		//Format name of park or refuge
		var siteName = searchResults.result.properties.Name.split(" ").join("_");

		switch (type) {
			//If 'HWM CSV' is clicked, download the HWM table
			case "hwm":
				generateCSV({
					filename: siteName + "_HWM.csv",
					data: hwmCSVData,
					headers: fev.csvHWMColumns
				});
				break;
			//If 'Peak CSV' is clicked, download the Peak table
			case "peaks":
				generateCSV({
					filename: siteName + "_Peak.csv",
					data: peaksCSVData,
					headers: fev.csvPeaksColumns
				});
				break;
			default:
				break;
		}
	}

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
					alignment: 'center',
					text: 'Page ' + currentPage.toString()
				}
			},
			content: [
				{ text: 'Data Summaries for ' + currentParkOrRefuge + ' within a ' + fev.vars.currentBufferSelection + ' Kilometer Buffer', style: 'header', margin: [0, 0, 0, 10] },
				//{ image: pdfMapUrl, width: 300, height: 200, margin: [0,0,0,15] },
				//{ image: legendUrl, width: 200, height: 200 },
				{
					table: {
						body: [
							['', ''],
							[{image: pdfMapUrl, width: 300, height: 200}, {image: legendUrl, width: 150, height: 200}]
						]
					},
					layout: 'noBorders',
					margin: [0, 0, 0, 15]
				},
				{ text: 'Peak Summary Data', style: 'subHeader', margin: [0, 0, 0, 5], alignment: 'center' },
				peakTable(bodyData(), ['Site Number', 'Description', 'State', 'County', 'Peak Stage', 'Peak Estimated']),
				{ text: 'High Water Mark Data', style: 'subHeader', margin: [0, 0, 0, 5], alignment: 'center' },
				hwmTable(),
			],
			styles: {
				header: {
					fontSize: 15,
					bold: true
				},
				tableHeader: {
					fontSize: 10,
					bold: true,
				},
				subHeader: {
					fontSize: 12,
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

//function for toggling peak labels
function clickPeakLabels() {
	var checkBox = document.getElementById("peakCheckbox");
	//Prevent user from using toggle when zoom is less than 8
	if (map.getZoom() < 8) {
		checkBox.checked = false;
	}
	//Display peak labels when toggle is on
	if (checkBox.checked == true) {
		peak.eachLayer(function (myMarker) {
			myMarker.showLabel();
		});
		//Remove peak labels when toggle is off
	} else {
		peak.eachLayer(function (myMarker) {
			myMarker.hideLabel();
		});
	}
}

//Create legend symbols for each layer
var PeakSummarySymbologyInterior = "<div> <img class='legendSwatch' src='images/peak.png'></img> <b>Peak Summary</b> </div>";
var streamGageSymbologyInterior = "<div> <img class='legendSwatch' src='images/nwis.png'></img> <b>Real-time Stream Gage</b> </div>";
var rainGageSymbologyInterior = "<div> <img class='legendSwatch' src='images/rainIcon.png'></img> <b>Real-time Rain Gage<b> </div>";
var barometricSymbologyInterior = "<div> <img class='legendSwatch' src='images/baro.png'></img> <b>Barometric Pressure Sensor</b> </div>";
var stormTideSymbologyInterior = "<div> <img class='legendSwatch' src='images/stormtide.png'></img> <b>Storm Tide Sensor</b> </div>";
var meteorlogicalSymbologyInterior = "<div> <img class='legendSwatch' src='images/met.png'></img> <b>Meteorlogical Sensor</b> </div>";
var waveHeightSymbologyInterior = "<div> <img class='legendSwatch' src='images/waveheight.png'></img> <b>Wave Height Sensor</b> </div>";
var rdgSymbologyInterior = "<div> <img class='legendSwatch' src='images/rdg.png'></img> <b>Rapid Deployment Gage</b> </div>";
var highWaterSymbologyInterior = "<div> <img class='legendSwatch' src='images/hwm.png'></img> <b>High Water Mark</b> </div>";
var parkBoundsSymbologyInterior = "<div> <img class='squareDiv parkBoundsColor'></img> <b>Park Boundaries</b> </div>";
var npsNetworksSymbologyInterior = "<div> <img class='squareDiv npsNetColor'></img> <b>NPS Networks</b> </div>";
var parkTractsSymbologyInterior = "<div> <b>Park Tracts</b> <br> <img class='squareDivInterest federalFeeColor'></img> Federal Land (Fee) <br> <img class='squareDivInterest federalLessFeeColor'></img> Federal Land (Less than Fee) <br> <img class='squareDivInterest publicColor'></img> Public <br> <img class='squareDivInterest privateColor'></img> Private <br> <img class='squareDivInterest otherFederalColor'></img> Other Federal Land <br> <img class='squareDivInterest aquisitionColor'></img> Aquisition Deferred <br> <img class='squareDivInterest noInfoColor'></img> Unknown <div>";
var approvedFWSSymbologyInterior = "<div> <img class='squareDiv approvedAquiColor'></img> <b>Approved Aquisition Boundaries</b> </div>";
var interestFWSSymbologyInterior = "<div> <b>Interest Boundaries</b> <br> <img class='squareDivInterest intFee'></img> Fee <br> <img class='squareDivInterest intSecondary'></img> Secondary <br> <img class='squareDivInterest intEasement'></img> Easement <br> <img class='squareDivInterest intLease'></img> Lease <br> <img class='squareDivInterest intAgreement'></img> Agreement <br> <img class='squareDivInterest intPartial'></img> Partial Interest <br> <img class='squareDivInterest intPermit'></img> Permit <br> <img class='squareDivInterest intUnknown'></img> Unknown <div>";
var doiSymbologyInterior = "<div> <img class='squareDiv doiRegionsColor'></img> <b>DOI Regions</b>";
var noaaCycloneSymbologyInterior = "<div> <img class='squareDiv parksColor'></img> <b>NOAA Tropical Cyclone Forecast Track</b> </div>";

//Display peak layer and legend item when peak box is checked
function clickPeaks() {
	var peaksCheckBox = document.getElementById("peaksToggle");
	if (peaksCheckBox.checked == true) {
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (peakStart == 0 || peakStart == 3) {
			//Add symbol and layer name to legend
			$('#PeakSummarySymbology').append(PeakSummarySymbologyInterior);
		}
		//When checkbox is checked, add layer to map
		displayPeaksGeoJSON("peak", "Peak Summary", fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peakMarkerIcon);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (peaksCheckBox.checked == false) {
		$('#PeakSummarySymbology').children().remove();
		peak.clearLayers();
		peakStart = 3;
	}
}

//Display rain gage layer and legend item when rain gage box is checked
function clickRainGage() {
	var raingageCheckBox = document.getElementById("rainGageToggle");
	//Prevent user from using toggle when zoom is less than 9
	if (map.getZoom() < 9) {
		raingageCheckBox.checked = false;
	}
	if (raingageCheckBox.checked == true) {
		//Add symbol and layer name to legend
		$('#rainGageSymbology').append(rainGageSymbologyInterior);
		//var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
		//queryNWISRainGages(bbox);
		//When checkbox is checked, add layer to map
		USGSRainGages.addTo(map);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (raingageCheckBox.checked == false) {
		$('#rainGageSymbology').children().remove();
		USGSRainGages.clearLayers(map);
	}
}

//Display stream gage layer and legend item when rain gage box is checked
function clickStreamGage() {
	var streamgageCheckBox = document.getElementById("streamGageToggle");
	//Prevent user from using toggle when zoom is less than 9
	if (map.getZoom() < 9) {
		streamgageCheckBox.checked = false;
	}
	if (streamgageCheckBox.checked == true) {
		//var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
		//queryNWISrtGages(bbox);
		//When checkbox is checked, add layer to map
		USGSrtGages.addTo(map);
		//Add symbol and layer name to legend
		$('#streamGageSymbology').append(streamGageSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (streamgageCheckBox.checked == false) {
		USGSrtGages.clearLayers(map);
		$('#streamGageSymbology').children().remove();
	}
}

//Display barometric pressure sensor layer and legend item when corresponding box is checked
function clickBaro() {
	var baroCheckBox = document.getElementById("baroToggle");
	if (baroCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displaySensorGeoJSON("baro", "Barometric Pressure Sensor", fev.urls["baro" + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window["baro" + 'MarkerIcon']);
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (baroStart == 0 || baroStart == 3) {
			//Add symbol and layer name to legend
			$('#barometricSymbology').append(barometricSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (baroCheckBox.checked == false) {
		baro.clearLayers(map);
		$('#barometricSymbology').children().remove();
		baroStart = 3;
	}
}

//Display storm tide sensor layer and legend item when corresponding box is checked
function clickStormTide() {
	var stormTideCheckBox = document.getElementById("stormTideToggle");
	if (stormTideCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displaySensorGeoJSON("stormtide", "Storm Tide Sensor", fev.urls["stormtide" + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window["stormtide" + 'MarkerIcon']);
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (stormtideStart == 0 || stormtideStart == 3) {
			//Add symbol and layer name to legend
			$('#stormTideSymbology').append(stormTideSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (stormTideCheckBox.checked == false) {
		stormtide.clearLayers(map);
		$('#stormTideSymbology').children().remove();
		stormtideStart = 3;
	}
}

//Display meteorological layer and legend item when corresponding box is checked
function clickMet() {
	var metCheckBox = document.getElementById("metToggle");
	if (metCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displaySensorGeoJSON("met", "Meteorlogical Sensor", fev.urls["met" + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window["met" + 'MarkerIcon']);
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (metStart == 0 || metStart == 3) {
			//Add symbol and layer name to legend
			$('#meteorlogicalSymbology').append(meteorlogicalSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (metCheckBox.checked == false) {
		met.clearLayers(map);
		$('#meteorlogicalSymbology').children().remove();
		metStart = 3;
	}
}

//Display waveheight layer and legend item when corresponding box is checked
function clickWaveHeight() {
	var waveHeightCheckBox = document.getElementById("waveHeightToggle");
	if (waveHeightCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displaySensorGeoJSON("waveheight", "Wave Height Sensor", fev.urls["waveheight" + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window["waveheight" + 'MarkerIcon']);
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (waveheightStart == 0 || waveheightStart == 3) {
			//Add symbol and layer name to legend
			$('#waveHeightSymbology').append(waveHeightSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (waveHeightCheckBox.checked == false) {
		waveheight.clearLayers(map);
		$('#waveHeightSymbology').children().remove();
		waveheightStart = 3;
	}
}

//Display high water mark layer and legend item when corresponding box is checked
function clickHWM() {
	var HWMCheckBox = document.getElementById("HWMToggle");
	if (HWMCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displayHWMGeoJSON("hwm", "High Water Mark", fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString, hwmMarkerIcon);
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (hwmStart == 0 || hwmStart == 3) {
			//Add symbol and layer name to legend
			$('#highWaterSymbology').append(highWaterSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (HWMCheckBox.checked == false) {
		hwm.clearLayers(map);
		$('#highWaterSymbology').children().remove();
		hwmStart = 3;
	}
}

//Display rapid deployment gage layer and legend item when corresponding box is checked
function clickRdg() {
	var rdgCheckBox = document.getElementById("rdgToggle");
	if (rdgCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displaySensorGeoJSON("rdg", "Rapid Deployment Gage", fev.urls["rdg" + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window["rdg" + 'MarkerIcon']);
		//Layers that appear on initial load are assigined a value of 0, and then a value of 1 when the map is first loaded
		//When they are turned off, they are given a value of 3
		//Values of 0 or 3 indicate that symbol and name in legend is off 
		if (rdgStart == 0 || rdgStart == 3) {
			//Add symbol and layer name to legend
			$('#rdgSymbology').append(rdgSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (rdgCheckBox.checked == false) {
		rdg.clearLayers(map);
		$('#rdgSymbology').children().remove();
		rdgStart = 3;
	}
}

//Display park boundaries layer and legend item when corresponding box is checked
function clickBounds() {
	var parkBoundsCheckBox = document.getElementById("parkBoundsToggle");
	//Prevent user from using toggle when zoom is less than 9
	if (map.getZoom() < 9) {
		parkBoundsCheckBox.checked = false;
	}
	if (parkBoundsCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		bounds.addTo(map);
		//Add symbol and layer name to legend
		$('#parkBoundsSymbology').append(parkBoundsSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (parkBoundsCheckBox.checked == false) {
		bounds.removeFrom(map);
		$('#parkBoundsSymbology').children().remove();
	}
}

//Display park tracts layer and legend item when corresponding box is checked
function clickTracts() {
	var tractCheckBox = document.getElementById("tractToggle");
	//Prevent user from using toggle when zoom is less than 9
	if (map.getZoom() < 9) {
		tractCheckBox.checked = false;
	}
	if (tractCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		tracts.addTo(map);
		//Add symbol and layer name to legend
		$('#parkTractsSymbology').append(parkTractsSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (tractCheckBox.checked == false) {
		tracts.removeFrom(map);
		$('#parkTractsSymbology').children().remove();
	}
}

//Display NPS Network layer and legend item when corresponding box is checked
function clickNPSNetworks() {
	var netCheckBox = document.getElementById("npsNetToggle");
	if (netCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		npsNetworks.addTo(map);
		//Add symbol and layer name to legend
		$('#npsNetworksSymbology').append(npsNetworksSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (netCheckBox.checked == false) {
		npsNetworks.removeFrom(map);
		$('#npsNetworksSymbology').children().remove();
	}
}

//Display FWS interest boundaries layer and legend item when corresponding box is checked
function clickInterestFWS() {
	var interestFWSCheckBox = document.getElementById("interestFWSToggle");
	//Prevent user from using toggle when zoom is less than 9
	if (map.getZoom() < 9) {
		interestFWSCheckBox.checked = false;
	}
	if (interestFWSCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		int.addTo(map);
		//Add symbol and layer name to legend
		$('#interestFWSSymbology').append(interestFWSSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (interestFWSCheckBox.checked == false) {
		int.removeFrom(map);
		$('#interestFWSSymbology').children().remove();
	}
}

//Display FWS approved aquisition boundaries layer and legend item when corresponding box is checked
function clickApprovedFWS() {
	var approvedFWSCheckBox = document.getElementById("approvedFWSToggle");
	//Prevent user from using toggle when zoom is less than 9
	if (map.getZoom() < 9) {
		approvedFWSCheckBox.checked = false;
	}
	if (approvedFWSCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		appr.addTo(map);
		//Add symbol and layer name to legend
		$('#approvedFWSSymbology').append(approvedFWSSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (approvedFWSCheckBox.checked == false) {
		appr.removeFrom(map);
		$('#approvedFWSSymbology').children().remove();
	}
}

//Display DOI Region layer and legend item when corresponding box is checked
function clickDOI() {
	var doiCheckBox = document.getElementById("doiToggle");
	//Prevent user from using toggle when zoom is less than 8
	if (map.getZoom() < 6) {
		doiCheckBox.checked = false;
	}
	if (doiCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		doiRegions.addTo(map);
		//Add symbol and layer name to legend
		$('#doiSymbology').append(doiSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (doiCheckBox.checked == false) {
		doiRegions.removeFrom(map);
		$('#doiSymbology').children().remove();
	}
}

//Display NOAA Tropical Cyclone Forecast Track layer and legend item when corresponding box is checked
function clickNOAA() {
	var noaaCheckBox = document.getElementById("noaaToggle");
	if (noaaCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		noaaService.addTo(map);
		//Add symbol and layer name to legend
		if (noaaStart == 0 || noaaStart == 3) {
			$('#noaaCycloneSymbology').append(noaaCycloneSymbologyInterior);
		}
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (noaaCheckBox.checked == false) {
		noaaService.removeFrom(map);
		$('#noaaCycloneSymbology').children().remove();
		noaaStart = 3;
	}
}



