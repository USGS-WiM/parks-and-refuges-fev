var stnServicesURL = 'https://stn.wim.usgs.gov/STNServices';
//var stnServicesURL = 'https://stntest.wim.usgs.gov/STNServices2'; //test URL
var flattenedPoly;
/* var regionBoundaries;
var regions = []; */
var pdfMapUrl;
var legendUrl;
var parks;
var siteSelected = false;
var refuges;
var alreadyLoaded = false;
var fwsInterest;
var bufferPoly;
var searchResults;
var searchObject;
var bbox;
var graphCounter = 0;
var currentParkOrRefuge = "";
var identifiedPeaks = [];
var identifiedMarks = [];
var allStreamGages = [];
var identifiedST = [];
var hydroUrls = [];
var buffer;
var selectedEvent;
var selectedBuffer;
var welcomeBuffer;
var welcomeSite = "";
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
		},
		{
			"ID": "tides",
			"Name": "NOAA Tides and Currents Stations",
			"Type": "supporting",
			"Category": "supporting"
		}
	],
	csvHWMColumns: [
		{ fieldName: 'STN Site No.', colName: "STN Site No." },
		{ fieldName: 'HWM Label', colName: "HWM Label" },
		{ fieldName: 'Elevation (ft)', colName: "Elevation (ft)" },
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
		{ fieldName: 'Latitude (DD)', colName: "Latitude (DD)" },
		{ fieldName: 'Longitude (DD)', colName: "Longitude (DD)" },
		{ fieldName: 'Site Description', colName: "Site Description" },
		{ fieldName: 'Location Description', colName: "Location Description" },
		{ fieldName: 'Survey Date/Time', colName: "Survey Date/Time" },
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
		{ fieldName: 'Peak Stage (ft)', colName: "Peak Stage (ft)" },
		{ fieldName: 'Peak Date/Time', colName: "Peak Date/Time" },
		{ fieldName: 'Peak Estimated', colName: "Peak Estimated" },
	],

};

//L.esri.Support.cors = true;

var map;
var reviewMap;
var markerCoords = [];
var oms;
var mapImage;

var baroMarkerIcon = L.icon({ className: 'baroMarker', iconUrl: 'images/markers/baro.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var metMarkerIcon = L.icon({ className: 'metMarker', iconUrl: 'images/markers/met.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var rdgMarkerIcon = L.icon({ className: 'rdgMarker', iconUrl: 'images/markers/rdg.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var stormtideMarkerIcon = L.icon({ className: 'stormtideMarker', iconUrl: 'images/markers/stormtide.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var waveheightMarkerIcon = L.icon({ className: 'waveheightMarker', iconUrl: 'images/markers/waveheight.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [12, 12] });
var hwmMarkerIcon = L.icon({ className: 'hwmMarker', iconUrl: 'images/markers/hwm.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var peakMarkerIcon = L.icon({ className: 'peakMarker', iconUrl: 'images/markers/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var nwisMarkerIcon = L.icon({ className: 'nwisMarker', iconUrl: 'images/markers/nwis.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var nwisRainMarkerIcon = L.icon({ className: 'nwisMarker', iconUrl: 'images/markers/rainIcon.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [30, 30] });
var crmsIcon = L.icon({ className: 'nwisMarker', iconUrl: 'images/markers/crms.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [14, 14] });
var tidesMarkerIcon = L.icon({ className: 'tideMarker', iconUrl: 'images/markers/bluepushpin.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [10, 20] });

//sensor subgroup layerGroups for sensor marker cluster group(layerGroup has no support for mouse event listeners)
var baro = L.layerGroup();
var stormtide = L.layerGroup();
var met = L.layerGroup();
var waveheight = L.layerGroup();
var hwm = L.layerGroup();
var peak = L.layerGroup();
var bufferPeak = L.layerGroup();
var bufferHWM = L.layerGroup();
var appr = L.layerGroup();
var int = L.layerGroup();
var tracts = L.layerGroup();
var bounds = L.layerGroup();
var doiRegions = L.layerGroup();
var parksLayerGroup = L.featureGroup();

var hwmCSVData = [];
var peaksCSVData = [];

// bounds of the continental US
var usBounds = [
	[20.499550, -130.276413], //Southwest
	[55.162102, -52.233040]  //Northeast
];

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

//rdg and USGSrtGages layers must be featureGroup type to support mouse event listeners
var rdg = L.featureGroup();
var USGSRainGages = L.featureGroup();
var USGSrtGages = L.featureGroup();
var tides = L.layerGroup();
var identifiedUSGSrtGage = L.featureGroup();
var identifiedUSGSrtGageArray = [];

var noaaService = L.esri.dynamicMapLayer({
	url: "https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer",
	opacity: 0.5,
	f: 'image'
});


var noAdvisories = false;
var test;


var noaaLegend = $.ajax({
	url: "https://nowcoast.noaa.gov/layerinfo?request=legend&format=json&service=wwa_meteocean_tropicalcyclones_trackintensityfcsts_time",
	dataType: 'json',
	timeout: 10000,
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
	url: "https://gis1.wim.usgs.gov/server/rest/services/DOIFEV/DOI_FEV/MapServer/1",
	//opacity: 0.5,
	//minZoom: 9,
	/* style: function (feature) {
		return { color: 'brown', weight: 2 };
	} */
});

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
	url: "https://gis1.wim.usgs.gov/server/rest/services/DOIFEV/DOI_FEV/MapServer/0",
	//opacity: 0.5,
	//minZoom: 9,
	style: function (feature) {
		return { color: 'brown', weight: 2 };
	}
});


// FWS Approved Interest Boundaries 
var int = L.esri.featureLayer({
	useCors: false,
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSInterest_Simplified_Authoritative/FeatureServer/0",
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
});



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

var crms = L.esri.featureLayer({
url: 'https://cimsgeo3.coastal.louisiana.gov/arcgis/rest/services/prot_rest/crms_points/MapServer/0',
	pointToLayer: function (geojson, latlng) {
		return L.marker(latlng, {
		icon: crmsIcon
		});
	}, 
	onEachFeature: function (feature, layer) {
		var crmsPopup = '<table class="table table-hover table-striped table-condensed wim-table">' +
		'<caption class="popup-title">' + "Coastwide Reference Monitoring System" + '</caption>' +
		'<col style="width:50%"> <col style="width:50%">' +
		'<tr><td><strong>Soil Type: </strong></td><td><span>' + feature.properties.SOIL_TYPE + '</span></td></tr>' +
		'<tr><td><strong>Vegetation Type: </strong></td><td><span id="hwmLabel">' + feature.properties.VEGTYPE + '</span></td></tr>' +
		'<tr><td><strong>Parish: </strong></td><td><span>' + feature.properties.PARISH_NAM + '</span></td></tr>' +
		'</table>';
		layer.bindPopup(crmsPopup)
	}
}); 

var fiman = L.esri.featureLayer({
	url: 'https://spartagis.ncem.org/arcgis/rest/services/FIMAN/GAGES_ALL/MapServer/0', 
		 onEachFeature: function (feature, layer) {
			layer.setIcon(L.divIcon({ className: 'defaultFIMAN ' }));
			var fimanPopup = '<span><a target="_blank" href="https://fiman.nc.gov/">' + "Data from https://fiman.nc.gov/" +
        "</a></span>";
			layer.bindPopup(fimanPopup)
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
});

int.bindPopup(function (layer) {
	return L.Util.template('<p>INTTYPE1: {INTTYPE1}', layer.properties);
});

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

	$('#btnChooseSite').click(function () {
		$('#updateFiltersModal').modal('show');
		$('#welcomeModal').modal('hide');
	});
	$('#btnChooseRegion').click(function () {
		$('#regionalModal').modal('show');
	});

	//updateFiltersModal: set search for 'Explore Map' click 
	submitSearch($('#btnSubmitEvent_filter'), '#evtSelect_updateFiltersModal', '#updateFiltersModal', '#evtSelect_filterModal', '#typeSelect_filterModal', '#siteSelect_filterModal', true, true);
	//updateFiltersModal: set search for 'Generate Report' click 
	submitSearch($('#btnActiveSiteReport'), '#evtSelect_updateFiltersModal', '#updateFiltersModal', '#evtSelect_filterModal', '#typeSelect_filterModal', '#siteSelect_filterModal', true, false);

	function submitSearch(submitButton, evtSelect_Modal_Primary, chooseModal, evtSelect_Modal_Secondary, typeSelect, siteSelect, runningFilter, exploreMap) {
		submitButton.click(function () {
			siteSelected = true;
			$('#siteReportLoading').modal('show', { backdrop: 'static', keyboard: false });

			//check if an event has been selected
			if ((($(evtSelect_Modal_Primary).val() !== null) && ($(typeSelect).val() !== null) && ($(siteSelect).val() !== null))) {
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
				filterMapData(eventID, false, runningFilter, exploreMap);
			} else {
				//if no event selected, warn user with alert
				// Also accounting for having an event selected but no parkref
				if ((($(evtSelect_Modal_Primary).val() !== null) && ($(typeSelect).val() !== null) && ($(siteSelect).val() !== null))) {
					$('#filtersModalError').hide();
				} else {
					$('#filtersModalError').show();
				}
			}

			//reset identified gages
			identifiedUSGSrtGage = L.featureGroup();
			identifiedUSGSrtGageArray = [];

			//If the box is checked, re-add the rain or stream gages to the map when running Filters Modal
			var streamgageCheckBox = document.getElementById("streamGageToggle");
			var raingageCheckBox = document.getElementById("rainGageToggle");
			if (raingageCheckBox.checked == true) {
				USGSRainGages.clearLayers(map);
				var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
				queryNWISRainGages(bbox);
				USGSRainGages.addTo(map);
			}
			if (streamgageCheckBox.checked == true) {
				USGSrtGages.clearLayers(map);
				var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
				queryNWISrtGages(bbox);
				USGSrtGages.addTo(map);
			}

			//$('siteReportLoading').modal('show');
			//Give the map elements time to load before creating site report
			/* if (exploreMap == false) {
				//show load warning message while waiting for layers to load and report to generate
				$('#siteReportLoading').modal('show', { backdrop: 'static', keyboard: false });
				setTimeout(() => {
					//remove loading message, show site report modal
					$('#siteReportLoading').modal('hide');
					$('#printModal').modal('show');
					generateSiteReport();
				}, 20000);
			} */
		});
	}

	$('#print').click(function () {
		printReport();
	});



	$('#printClose').click(function () {
		location.reload();
		location.href = window.location.origin + window.location.pathname;
	});

	$('#printCloseTop').click(function () {
		location.reload();
		location.href = window.location.origin + window.location.pathname;
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
		//history.pushState(null, null, '#' + (event_name.replace(/\s+/g, '')));
		//set current event name
		fev.vars.currentEventName = event_name;
		selectedEvent = event_name;
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

	function setEventIndicators(eventName, eventID, eventStartDateStr, eventEndDateStr, siteName) {
		$('#eventNameDisplay').html(eventName);
		$('#largeEventNameDisplay').html(eventName);
		$('#largeSiteNameDisplay').html(currentParkOrRefuge);
		// Show/hide site label if site name exists
		if (currentParkOrRefuge == "") {
			$('#sidebarSiteLabel').addClass("hidden");
		} else {
			$('#sidebarSiteLabel').removeClass("hidden");
		}
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
			//if both start and end date, show beginDate - endDate
			$('#largeEventDateRangeDisplay').html("From <b>" + moment(eventStartDateStr).format("D MMM YYYY") + "</b> to <b>" + moment(eventEndDateStr).format("D MMM YYYY") + "</b>");
		}
	}

	/* create map */
	map = L.map('mapDiv', {
		maxZoom: 15
	}).setView([39.833333, -98.583333], 4);

	// adds scale bar to map
	L.control.scale().addTo(map);

	var layer = L.esri.basemapLayer('Topographic').addTo(map);
	var layerLabels;
	L.Icon.Default.imagePath = './images';
	/* setSearchAPI("search");
	setSearchAPI("search_filter"); */

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
	noaaService.metadata(function (err, response) {
		if (response) {
			noaaService.addTo(map);
		}
	});
	if (map.hasLayer(noaaService)) {
		var noaaCheckBox = document.getElementById("noaaToggle");
		noaaCheckBox.checked = true;
		if (noaaStart == 0) {
			$('#noaaCycloneSymbology').append(noaaCycloneSymbologyInterior);
			noaaStart = 1;
		}
	}

	//define layer 'overlays' (overlay is a leaflet term)
	//define the real-time overlay and manually add the NWIS RT gages to it
	var realTimeOverlays = {
		"<img class='legendSwatch' src='images/markers/nwis.png'>&nbsp;Real-time Stream Gage": USGSrtGages,
		"<img class='legendSwatch' src='images/markers/rainIcon.png'>&nbsp;Real-time Rain Gage": USGSRainGages
		
	};



	//define observed overlay and interpreted overlay, leave blank at first
	var labelOverlays = {};
	var noaaOverlays = {};


	labelOverlays["<img class='legendSwatch' src='images/" + layer.ID + ".png'/>&nbsp;" + layer.Name] = window[layer.ID];

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
			$('form.hidden').not(formToShow).hide();
		});
	});

	//toggle the appearance of the check box on click, including toggling the check icon
	$('.check').on('click', function () {
		$(this).find('span').toggle();
	});

	function showGeosearchModal() {
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
		var isItUP = true;
		try {
			search_api
		}
		catch (err) {
			isItUP = false;
		}
		if (isItUP) {
		showGeosearchModal();
		} else {
			showsearchDownModal();
		}

		function showsearchDownModal() {
			$('#searchDownModal').modal('show');
		}
	});

	function showRegionalModal() {
		$('#regionalModal').modal('show');

		/* setTimeout(() => {
			reviewMap = L.map('reviewMap').setView([39.833333, -98.583333], 4);
			L.esri.basemapLayer('Topographic').addTo(reviewMap);
		}, 500); */
	}

	//var pdfRegionalMapUrl;

	$('#printNav').click(function () {
		map.dragging.disable();
		$('#printModal').modal('show');
		generateSiteReport();
	});

	function getRegionalMap() {
		USGSrtGages.clearLayers(map);
		let mapPane;
		//mapPane = $('.leaflet-map-pane')[0];
		mapPane = $('#regionalMap')[0].children[0];
		const mapTransform = mapPane.style.transform.split(',');
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
			myDivicons[i].style.transform = '';
			myDivicons[i].style.left = dx[i] + 'px';
			myDivicons[i].style.top = dy[i] + 'px';
		}

		const mapWidth = parseFloat($('#regionalMap').css('width').replace('px', ''));
		const mapHeight = parseFloat($('#regionalMap').css('height').replace('px', ''));

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

		mapPane.style.transform = 'translate(' + (mapX) + 'px,' + (mapY) + 'px)';
		mapPane.style.left = '';
		mapPane.style.top = '';

		var mapEvent;
		/* html2canvas(document.getElementById('regionalMap'), options).then(function (canvas) {
			mapEvent = new Event('map_ready');
			canvas.style.width = '700px';
			canvas.style.height = '450px';
			pdfRegionalMapUrl = canvas.toDataURL('image/png');
			window.dispatchEvent(mapEvent);
		}); */
	};

	$('#printRegionalReport').click(function () {
		getRegionalMap();

		//// Get Summary Information Table data to put into pdfMake table ////
		var summaryRows = [];
		var peakSummaryRows = [];
		var hwmSummaryRows = [];
		var sumHeaders = [];
		// Get table values from summary information table
		function summaryInfo() {
			sumHeaders = [];
			summaryRows = [];
			$('#summaryDataTableEOne th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#summaryDataTableEOne tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				summaryRows.push(arrayItem);
			});
			return summaryRows;
		};
		function summaryPeaksRangeInfo() {
			sumHeaders = [];
			summaryRows = [];
			$('#eventsSummaryTable th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#eventsSummaryTable tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				summaryRows.push(arrayItem);
			});
			return summaryRows;
		};
		function summaryInfoTwo() {
			sumHeaders = [];
			summaryRows = [];
			$('#summaryDataTableETwo th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#summaryDataTableETwo tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				summaryRows.push(arrayItem);
			});
			return summaryRows;
		};
		function summaryPeakInfo() {
			peakSummaryRows = [];
			sumHeaders = [];
			$('#siteSummaryPeakDataTableEOne th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#siteSummaryPeakDataTableEOne tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				peakSummaryRows.push(arrayItem);
			});
			return peakSummaryRows;
		};
		function summaryPeakInfoTwo() {
			sumHeaders = [];
			peakSummaryRows = [];
			$('#siteSummaryPeakDataTableETwo th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#siteSummaryPeakDataTableETwo tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				peakSummaryRows.push(arrayItem);
			});
			return peakSummaryRows;
		};
		function summaryHWMInfo() {
			hwmSummaryRows = [];
			sumHeaders = [];
			$('#siteSummaryHWMDataTableEOne th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#siteSummaryHWMDataTableEOne tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				hwmSummaryRows.push(arrayItem);
			});
			return hwmSummaryRows;
		};
		function summaryHWMInfoTwo() {
			sumHeaders = [];
			hwmSummaryRows = [];
			$('#siteSummaryHWMDataTableETwo th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#siteSummaryHWMDataTableETwo tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				hwmSummaryRows.push(arrayItem);
			});
			return hwmSummaryRows;
		};
		// Build the table body for pdfMake of summary information
		function buildSummaryBody(data, columns) {
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
		};
		// Insert tably body into pdfMake formatted table
		function summaryTable(data, columns) {
			return {
				table: {
					headerRows: 1,
					widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
					body: buildSummaryBody(data, ['Type', 'Total Sites', 'Standard Dev (ft)', 'Min (ft)', 'Median (ft)', 'Mean (ft)', 'Max (ft)', 'Max Date/Time', '90% Conf Low', '90% Conf High']),
				},
				layout: 'lightHorizontalLines',
				style: 'smaller',
				margin: [0, 0, 0, 15]
			};
		};
		function eventSummaryTable(data, columns) {
			return {
				table: {
					headerRows: 1,
					widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
					body: buildSummaryBody(data, ['Type', 'Total Sites', 'Standard Dev (ft)', 'Min (ft)', 'Median (ft)', 'Mean (ft)', 'Max (ft)', '90% Conf Low', '90% Conf High']),
				},
				layout: 'lightHorizontalLines',
				style: 'smaller',
				margin: [0, 0, 0, 15]
			};
		};
		function summaryPeakTable(data, columns) {
			return {
				table: {
					headerRows: 1,
					widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
					body: buildSummaryBody(data, ['Site Name', 'Type', 'Total Peaks', 'Standard Dev (ft)', 'Min (ft)', 'Median (ft)', 'Mean (ft)', 'Max (ft)', '90% Conf Low', '90% Conf High']),
				},
				layout: 'lightHorizontalLines',
				style: 'smaller',
				margin: [0, 0, 0, 15]
			};
		};
		function summaryEventsTable(data, columns) {
			return {
				table: {
					headerRows: 1,
					widths: [200, 100, 100],
					body: buildSummaryBody(data, ['Site Name', document.querySelector("#eventsSummaryTable > tbody > tr:nth-child(1) > th:nth-child(2)").innerText, document.querySelector("#eventsSummaryTable > tbody > tr:nth-child(1) > th:nth-child(3)").innerText]),
				},
				layout: 'lightHorizontalLines',
				style: 'smaller',
				margin: [175, 0, 0, 0]
			};
		};
		function summaryHWMTable(data, columns) {
			var body = [];
			if (data.length === 0) {
				body.push([
					{
						text: 'There is no HWM data based on selections.',
						margin: [0, 0, 0, 15]
					}
				])
				return body
			}
			else {
				return {
					table: {
						headerRows: 1,
						widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
						body: buildSummaryBody(data, ['Site Name', 'Type', 'Total HWMs', 'Standard Dev (ft)', 'Min (ft)', 'Median (ft)', 'Mean (ft)', 'Max (ft)', '90% Conf Low', '90% Conf High']),
					},
					layout: 'lightHorizontalLines',
					style: 'smaller',
					margin: [0, 0, 0, 15]
				};
			}
		};
		//// End of Summary Information table build ////

		//// Get Peak Table information data to put into pdfMake /////
		var peakData = [];
		var peakHeaders = [];
		// Get table values from peak table
		function getPeaksData() {
			peakData = allPeaksEOne;
			return peakData;
		};
		function getPeaksDataTwo() {
			peakData = allPeaksETwo;
			return peakData;
		};
		// Build the table body for pdfMake of peak table information
		function buildPeaksBody(data, columns) {
			var body = [];
			if (allPeaksEOne.length === 0) {
				body.push([
					{ text: 'There is no Peak data based on selections.' }
				])
			} else {
				body.push(columns);
				data.forEach(function (row) {
					var dataRow = [];
					columns.forEach(function (column) {
						dataRow.push(row[column].toString());
					})
					body.push(dataRow);
				});
			};
			return body;
		};
		// Insert table body into pdfMake formatted table
		function peaksTable(data, columns) {
			if (data.length === 0) {
				return {
					table: {
						body: buildPeaksBody(data)
					},
					layout: 'noBorders',
					style: 'smaller',
					margin: [0, 0, 0, 15],
				};
			} else {
				return {
					table: {
						headerRows: 1,
						widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
						body: buildPeaksBody(data, ['Site Name', 'Event', 'Peak Stage (ft)', 'Peak Date/Time', 'County', 'Latitude (DD)', 'Longitude (DD)', 'Site Number', 'Waterbody']),
					},
					layout: 'lightHorizontalLines',
					style: 'smaller',
					margin: [0, 0, 0, 15]
				};
			};
		};
		//// End of Peak Table information build ////

		//// Get HWM Table information data to put into pdfMake /////
		var hwmDataEOne;
		hwmDataEOne = allHWMEOne;
		// Data has some undefined and null values, this replaces those values with empty string/no value
		for (var obj of hwmDataEOne) {
			if (typeof obj !== 'object') continue;
			for (var k in obj) {
				if (!obj.hasOwnProperty(k)) continue;
				var v = obj[k];
				if (v === null || v === undefined) {
					obj[k] = "";
				}
			}
		}
		var hwmDataETwo;
		hwmDataETwo = allHWMETwo;
		// Data has some undefined and null values, this replaces those values with empty string/no value
		for (var obj of hwmDataETwo) {
			if (typeof obj !== 'object') continue;
			for (var k in obj) {
				if (!obj.hasOwnProperty(k)) continue;
				var v = obj[k];
				if (v === null || v === undefined) {
					obj[k] = "";
				}
			}
		}
		// Build the table body for pdfMake of hwm table information
		function buildHwmsTable(eNumber) {
			var num = eNumber;
			var data;
			if (num == 1) {
				data = hwmDataEOne
			}
			if (num == 2) {
				data = hwmDataETwo
			}
			var body = [];
			if (data.length === 0) {
				body.push([
					{ text: 'There is no HWM data based on selections.' }
				])
			} else {
				for (var i in data) {
					body.push([
						{ rowSpan: 11, style: 'tableHeader', text: 'Site No.: ' + data[i]['Site Number'] },
						{ text: 'HWM Label', style: 'tableHeader' }, data[i]['HWM Label'],
						{ text: 'Elevation (ft)', style: 'tableHeader' }, data[i]['Elevation (ft)']
					],
						[
							{},
							{ text: 'Event', style: 'tableHeader' }, data[i]['Event'],
							{ text: 'Site Name', style: 'tableHeader' }, data[i]['Site Name']
						],
						[
							{},
							{ text: 'Vertical Datum, Method', style: 'tableHeader' }, data[i]['Vertical Datum'] + ", " + data[i]['Vertical Method'],
							{ text: 'Horizontal Datum, Method', style: 'tableHeader' }, data[i]['Horizontal Datum'] + ", " + data[i]['Horizontal Datum']
						],
						[
							{},
							{ text: 'Type', style: 'tableHeader' }, data[i]['HWM Type'],
							{ text: 'Quality', style: 'tableHeader' }, data[i]['HWM Quality']
						],
						[
							{},
							{ text: 'Waterbody', style: 'tableHeader' }, data[i]['Waterbody'],
							{ text: 'Permanent Housing', style: 'tableHeader' }, data[i]['Site Perm Housing']
						],
						[
							{},
							{ text: 'County', style: 'tableHeader' }, data[i]['County'],
							{ text: 'State', style: 'tableHeader' }, data[i]['State']
						],
						[
							{},
							{ text: 'Latitude (DD)', style: 'tableHeader' }, data[i]['Latitude (DD)'],
							{ text: 'Longitude (DD)', style: 'tableHeader' }, data[i]['Longitude (DD)']

						],
						[
							{},
							{ text: 'Location Description', style: 'tableHeader' }, data[i]['Location Description'],
							{ text: 'Survey Date/Time', style: 'tableHeader' }, data[i]['Survey Date/Time']
						],
						[
							{},
							{ text: 'Bank', style: 'tableHeader' }, data[i]['Bank'],
							{ text: 'Environment', style: 'tableHeader' }, data[i]['Environment']
						],
						[
							{},
							{ text: 'Flag Date', style: 'tableHeader' }, data[i]['Flag Date'],
							{ text: 'Stillwater', style: 'tableHeader' }, data[i]['Stillwater']
						],
						[
							{},
							{ text: 'Uncertainty', style: 'tableHeader' }, data[i]['Uncertainty'],
							{ text: 'HWM Uncertainty', style: 'tableHeader' }, data[i]['HWM Uncertainty']
						],
						[
							{},
							{ text: 'Site Description', style: 'tableHeader' }, data[i]['Site Description'],
							{ text: '', style: 'tableHeader' }, ''
						]);
				}
			}
			return body;
		};
		// Insert table body into pdfMake formatted table
		function hwmsTable(event) {
			var lengthCheck;
			var eNumber = event;
			if (event == 1) {
				lengthCheck = allHWMEOne;
			} else if (event == 2) {
				lengthCheck = allHWMETwo;
			}
			if (lengthCheck.length === 0) {
				return {
					table: {
						body: buildHwmsTable(eNumber),
					},
					layout: 'noBorders',
					style: 'smaller',
					margin: [0, 0, 0, 15],
				};
			} else {
				return {
					table: {
						widths: ['auto', 'auto', '*', 'auto', '*'],
						body: buildHwmsTable(eNumber),
					},
					style: 'smaller',
					margin: [0, 0, 0, 15]
				};
			};
		};
		//// End of HWM Table information build ////

		//// Get date and time of print click //// 
		var date = new Date();
		// For today's date
		Date.prototype.today = function () {
			return (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + this.getFullYear();
		}
		// For current time
		Date.prototype.timeNow = function () {
			return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
		}
		var todayDate = date.today() + " at " + date.timeNow();
		//// End of date/time ////

		var selectionVarLen = $(".select2-selection__choice").length;

		//// Get summary of search selections ////
		//If there are existing event names, etc. saved from the welcome or filter modal, retrieve the variables from the end of the array
		if (selectionVarLen > 5) {
			var landType = $(".select2-selection__choice")[selectionVarLen - 6].title;
			var regionSubType = $(".select2-selection__choice")[selectionVarLen - 5].title;
			var event = $(".select2-selection__choice")[selectionVarLen - 3].title;
			var bufferReg = $(".select2-selection__choice")[selectionVarLen - 2].title;
		}
		//If the map is refreshed, there won't be search info added to .select2, so there will be only 5 items
		if (selectionVarLen <= 5) {
			var event;
			if (selectedEvents.length == 2) {
				event = $(".select2-selection__choice")[3].title + ', ' + $(".select2-selection__choice")[2].title;
			} else {
				var event = $(".select2-selection__choice")[2].title;
			}
			var landType = $(".select2-selection__choice")[0].title;
			var regionSubType = $(".select2-selection__choice")[1].title;
			if (selectedEvents.length == 2) {
				var bufferReg = $(".select2-selection__choice")[4].title;
			} else {
				var bufferReg = $(".select2-selection__choice")[3].title;
			}

		}

		// Build summary selections table
		function selectionsTable() {
			return {
				table: {
					widths: ['auto', 'auto'],
					body: [
						[{ colSpan: 2, border: [false, false, false, true], text: 'Regional Report Selections: ', style: 'subHeader' }, ''],
						[{ text: 'Land Type: ', style: 'selectHeader', alignment: 'right' }, landType],
						[{ text: 'Region: ', style: 'selectHeader', alignment: 'right' }, regionSubType],
						[{ text: 'Event: ', style: 'selectHeader', alignment: 'right' }, event],
						[{ text: 'Buffer Size: ', style: 'selectHeader', alignment: 'right' }, bufferReg]
					]
				},
				layout: {
					defaultBorder: false,
				}
			};
		}
		//// End of summary for search selections ////

		//// Build legend ////
		// Convert peak image to dataURL for pdfMake
		var peakImg = [];
		function peakToBase64() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			var base_image = new Image();
			canvas.width = 10;
			canvas.height = 10;
			base_image.src = './images/markers/peak.png';
			ctx.drawImage(base_image, 0, 0, 10, 10);
			var dataURL = canvas.toDataURL();
			peakImg.push(dataURL);
		}
		peakToBase64();
		// Convert hwm image to dataURL for pdfMake
		var hwmImg = [];
		function hwmToBase64() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			var base_image = new Image();
			canvas.width = 10;
			canvas.height = 10;
			base_image.src = './images/markers/hwm.png';
			ctx.drawImage(base_image, 0, 0, 10, 10);
			var dataURL = canvas.toDataURL();
			hwmImg.push(dataURL);
		}
		hwmToBase64();
		// Convert buffer style to dataURL for pdfMake, change this if symbology changes
		var bufferImg = [];
		function bufferToBase64() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			canvas.width = 10;
			canvas.height = 10;
			ctx.beginPath();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = "rgba(0, 0, 204, .8)";
			ctx.rect(0, 0, 10, 10);
			ctx.stroke();
			var dataURL = canvas.toDataURL();
			bufferImg.push(dataURL);
		}
		bufferToBase64();
		// Convert park polygon to dataURL for pdfMake, change this if symbology changes
		var parkImg = [];
		function parkToBase64() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			canvas.width = 10;
			canvas.height = 10;
			ctx.beginPath();
			ctx.rect(0, 0, 10, 10);
			ctx.fillStyle = "rgba(0, 0, 204, .3)";
			ctx.fill();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = "rgba(0, 0, 204, 1)";
			ctx.stroke();
			var dataURL = canvas.toDataURL();
			parkImg.push(dataURL);
		}
		parkToBase64();
		// Convert region polygon to dataURL for pdfMake, change this if symbology changes
		var regionImg = [];
		function regionToBase64() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			canvas.width = 10;
			canvas.height = 10;
			ctx.beginPath();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = "rgba(153, 51, 255, 1)";
			ctx.rect(0, 0, 10, 10);
			ctx.stroke();
			var dataURL = canvas.toDataURL();
			regionImg.push(dataURL);
		}
		regionToBase64();
		// Build legend table
		function legendTable() {
			if ((allPeaksEOne.length > 0) || (allPeaksETwo.length > 0)) {
				return {
					table: {
						widths: ['auto', 'auto'],
						body: [
							[{ colSpan: 2, border: [false, false, false, true], text: 'Layer Explanation:', style: 'subHeader' }, ''],
							[{ image: peakImg }, { text: 'Peak Location', alignment: 'left' }],
							//[{ image: hwmImg }, { text: 'High Water Mark', alignment: 'left' }],
							[{ image: parkImg }, { text: landType + ' Boundary', alignment: 'left' }],
							//[{ image: bufferImg }, { text: 'Buffer Extent', alignment: 'left' }],
							[{ image: regionImg }, { text: 'Region Boundary', alignment: 'left' }],
						]
					},
					layout: {
						defaultBorder: false,
					}
				};
			} else {
				return {
					table: {
						widths: ['auto', 'auto'],
						body: [
							[{ colSpan: 2, border: [false, false, false, true], text: 'Layer Explanation:', style: 'subHeader' }, ''],
							//[{ image: hwmImg }, { text: 'High Water Mark', alignment: 'left' }],
							[{ image: parkImg }, { text: landType + ' Boundary', alignment: 'left' }],
							//[{ image: bufferImg }, { text: 'Buffer Extent', alignment: 'left' }],
							[{ image: regionImg }, { text: 'Region Boundary', alignment: 'left' }],
						]
					},
					layout: {
						defaultBorder: false,
					}
				};
			}

		}
		//// End of Legend build ////

		function getContent() {
			// returning appropriate tables based on number of events selected
			var siteType = $('#typeSelect_regionalModal').val()[0];
			if (siteType === "NPS") {
				siteType = "NPS Sites"
			}
			var eventOne;
			var eventTwo;
			var eventOneNum = 1;
			var eventTwoNum = 2;
			if (allPeaksEOne.length > 0) {
				eventOne = allPeaksEOne[0].Event
			}
			if (allPeaksETwo.length > 0) {
				eventTwo = allPeaksETwo[0].Event
			}
			if (selectedEvents.length === 1) {
				return [
					//{ text: 'Regional Report - Printed: ' + todayDate, style: 'header', alignment: 'center', margin: [0, 0, 0, 15] },
					{
						table: {
							widths: ['*'],
							body: [
								[{
									border: [false, false, false, true],
									text: 'Summary of Peak Water Levels within ' + bufferSize + ' km of ' + siteType + ' during ' + eventOne,
									style: 'header', alignment: 'center'
								}]
							]
						},
						margin: [0, 0, 0, 15]
					},
					/* {
						image: pdfRegionalMapUrl,
						width: 800,
						height: 500,
						pageBreak: 'after'
					}, */
					{
						table: {
							widths: ['*'],
							body: [
								[{ border: [false, false, false, true], text: 'Printed: ' + todayDate, style: 'header', alignment: 'center' }]
							]
						},
						margin: [0, 0, 0, 15]
					},
					{
						//table with columns: selections table, map image, legend
						table: {
							body: [
								[
									selectionsTable(),
									//{ image: pdfRegionalMapUrl, width: 300, height: 200 },
									//legendTable()
								],
							]
						},
						layout: 'noBorders',
						margin: [0, 0, 0, 15]
					},
					//{ image: pdfRegionalMapUrl, width: 300, height: 200, margin: [0,0,0,15] },
					{ text: 'Region-wide Summary for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryTable(summaryInfo()),
					{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
					{ text: 'Summary of Calculated Peak Water Levels for each Site within the ' + bufferSize + ' km Buffer for each ' + siteType + ' for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryPeakTable(summaryPeakInfo()),
					{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
					{ text: 'Summary of High Water Marks (HWM) measured within ' + bufferSize + ' km Buffer of each ' + siteType + ' Impacted by ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryHWMTable(summaryHWMInfo()),
					{ text: 'Peak Data Measured in Feet Above NAVD88 Calculated for each Monitoring Site within the ' + siteType + ' Boundary for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					//peaksTable(peaksData(), ['Site Name', 'Event', 'Peak Stage', 'County', 'Latitude (dd)', 'Logitude (dd)', 'Site Number','Waterbody']),
					peaksTable(getPeaksData()),
					{ text: 'High Water Mark data Measured in Feet Above NAVD88 Datum within the ' + bufferSize + ' km buffer of each ' + siteType + ' for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					hwmsTable(eventOneNum),
				]
			} else if (selectedEvents.length === 2) {
				return [
					{
						table: {
							widths: ['*'],
							body: [
								[{
									border: [false, false, false, true],
									text: 'Summary of Peak Water Levels within ' + bufferSize + ' km of ' + siteType + ' during ' + eventOne + ' & ' + eventTwo,
									style: 'header', alignment: 'center'
								}]
							]
						},
						margin: [0, 0, 0, 15]
					},
					/* {
						image: pdfRegionalMapUrl,
						width: 800,
						height: 500,
						pageBreak: 'after'
					}, */
					{
						table: {
							widths: ['*'],
							body: [
								[{ border: [false, false, false, true], text: 'Printed: ' + todayDate, style: 'header', alignment: 'center' }]
							]
						},
						margin: [0, 0, 0, 15]
					},
					{
						//table with columns: selections table, map image, legend
						table: {
							body: [
								[
									selectionsTable(),
									//{ image: pdfRegionalMapUrl, width: 300, height: 200 },
									//legendTable()
								],
							]
						},
						layout: 'noBorders',
						margin: [0, 0, 0, 15]
					},
					//{ image: pdfRegionalMapUrl, width: 300, height: 200, margin: [0,0,0,15] },
					//summaryEventsPeakTable(),
					{ text: 'Summary of Peaks measured within a ' + bufferSize + 'km Buffer for ' + eventOne + ' and ' + eventTwo, style: 'subHeader', margin: [150, 0, 0, 5] },
					summaryEventsTable(summaryPeaksRangeInfo()),
					{ text: 'Region-wide Summary for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryTable(summaryInfo()),
					{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
					{ text: 'Region-wide Summary for ' + eventTwo, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryTable(summaryInfoTwo()),
					{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
					{ text: 'Summary of Calculated Peak Water Levels for each Site within the ' + bufferSize + ' km Buffer for each ' + siteType + ' for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryPeakTable(summaryPeakInfo()),
					{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
					{ text: 'Summary of Calculated Peak Water Levels for each Site within the ' + bufferSize + ' km Buffer for each ' + siteType + ' for ' + eventTwo, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryPeakTable(summaryPeakInfoTwo()),
					{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
					{ text: 'Summary of High Water Marks (HWM) measured within ' + bufferSize + ' km Buffer of each ' + siteType + ' Impacted by ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryHWMTable(summaryHWMInfo()),
					{ text: 'Summary of High Water Marks (HWM) measured within ' + bufferSize + ' km Buffer of each ' + siteType + ' Impacted by ' + eventTwo, style: 'subHeader', margin: [0, 0, 0, 5] },
					summaryHWMTable(summaryHWMInfoTwo()),
					{ text: 'Peak Data Measured in Feet Above NAVD88 Calculated for each Monitoring Site within the ' + siteType + ' Boundary for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					peaksTable(getPeaksData()),
					{ text: 'Peak Data Measured in Feet Above NAVD88 Calculated for each Monitoring Site within the ' + siteType + ' Boundary for ' + eventTwo, style: 'subHeader', margin: [0, 0, 0, 5] },
					peaksTable(getPeaksDataTwo()),
					{ text: 'High Water Mark data Measured in Feet Above NAVD88 Datum within the ' + bufferSize + ' km buffer of each ' + siteType + ' for ' + eventOne, style: 'subHeader', margin: [0, 0, 0, 5] },
					hwmsTable(eventOneNum),
					{ text: 'High Water Mark data Measured in Feet Above NAVD88 Datum within the ' + bufferSize + ' km buffer of each' + siteType + ' for ' + eventTwo, style: 'subHeader', margin: [0, 0, 0, 5] },
					hwmsTable(eventTwoNum)
				]

			}
		}

		//// Function to create pdfMake pdf of Regional Report ////
		function printRegionalReport() {
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
						text: ['Page ' + currentPage.toString() + ' | Consult the ', { text: 'HWM Data Dictionary', link: 'https://stn.wim.usgs.gov/STNWeb/datadictionary/FilteredHWMs.csv', color: '#0000EE' }, ' or ', { text: 'Peak Data Dictionary', link: 'https://stn.wim.usgs.gov/STNWeb/datadictionary/FilteredPeaks.csv', color: '#0000EE' }, ' for more field information.'],
					}
				},
				content: getContent(),
				styles: {
					header: {
						fontSize: 13,
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
					selectHeader: {
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
						fontSize: 8
					},
					definitionsTable: {
						fontSize: 9
					}
				},
				defaultStyle: {
					columnGap: 20
				}
			};
			pdfMake.createPdf(docDefinition).download('regional_report.pdf');
		}

		setTimeout(() => {
			printRegionalReport();
		}, 3500)

	});

	// Accordion Toggles
	$(".accordion-header").click(function () {
		$(this).parent().toggleClass("expanded");
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
		//location.reload();

		//document.getElementById('reviewMap').innerHTML = ""; // deletes the image so that there aren't multiple on the next print

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
		//$('#updateFiltersModal').modal('show');
		$('#updateFiltersModal').modal('show');
	}
	$('#btnChangeFilters').click(function () {
		//update the event select within the filters modal to reflect current event
		$('#evtSelect_filterModal').val([fev.vars.currentEventID_str]).trigger("change");
		showFiltersModal();
	});
	$('#btnStartOver').click(function () {
		location.reload();
	});
	$('#goBackButton').click(function () {
		$('#updateFiltersModal').modal('hide');
		$('#welcomeModal').modal('show');
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

	$('.basemap-button').on('click', function () {
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


	// setting checked values for Filter Modal buffer radio buttons
	document.getElementById('tenKmFilter').checked = false;
	document.getElementById('twentyKmFilter').checked = false;
	document.getElementById('thirtyKmFilter').checked = true;
	selectedBuffer = "30km";
	fev.vars.currentBufferSelection = 30;
	document.getElementById('fiftyKmFilter').checked = false;
	// 10 kilometers
	$('#tenKmFilter').click(function () {
		document.getElementById('twentyKmFilter').checked = false;
		document.getElementById('thirtyKmFilter').checked = false;
		document.getElementById('fiftyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 10;
		selectedBuffer = "10km";
	});
	// 20 kilometers
	$('#twentyKmFilter').click(function () {
		document.getElementById('tenKmFilter').checked = false;
		document.getElementById('thirtyKmFilter').checked = false;
		document.getElementById('fiftyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 20;
		selectedBuffer = "20km";
	});
	// 30 kilometers
	$('#thirtyKmFilter').click(function () {
		document.getElementById('twentyKmFilter').checked = false;
		document.getElementById('tenKmFilter').checked = false;
		document.getElementById('fiftyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 30;
		selectedBuffer = "30km";
	});
	// 50 kilometers
	$('#fiftyKmFilter').click(function () {
		document.getElementById('twentyKmFilter').checked = false;
		document.getElementById('tenKmFilter').checked = false;
		document.getElementById('thirtyKmFilter').checked = false;
		fev.vars.currentBufferSelection = 50;
		selectedBuffer = "50km";
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

			/* include_state: true,  // whether to include U.S. States and Territories as suggestions in the menu
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
			include_huc12: false,  // ...12-digit */

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

	//$('#btnSubmitEvent_filter').click(function() 

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
	$('#legendButtonNavBar').on('click', function () {
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
		var mapZoom = map.getZoom();
		var mapScale = scaleLookup(map.getZoom());
		$('#scale')[0].innerHTML = mapScale;
		$('.zoom-level').text(mapZoom);
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
		$('.zoom-level').text(mapZoom);
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

	//// Begin data prep for pdf print out ////

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
				"Peak Stage (ft)": identifiedPeaks[i].feature.properties.peak_stage,
				"Peak Date/Time": moment(identifiedPeaks[i].feature.properties.peak_date).format("MM/DD/YYYY, h:mm a"),
				"Peak Estimated": peakEstimated
			});
		}
		return peaksPdfData;
	};
	//Build the body of table with data, if present
	function buildTableBody(data, columns) {
		var body = [];
		if (identifiedPeaks.length === 0) {
			body.push([
				{ text: 'There are no Peaks at this Site.' }
			])
		} else {
			body.push(columns);
			data.forEach(function (row) {
				var dataRow = [];
				columns.forEach(function (column) {
					dataRow.push(row[column].toString());
				})
				body.push(dataRow);
			});
		};
		return body;
	};

	// code for converting hydroImages to dataurls
	function getBase64Image(image) {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		make_base();

		function make_base() {
			var base_image = new Image();
			base_image.src = 'https://stn.wim.usgs.gov/STNServices/Files/118901/Item';
			base_image.onload = function () {
				ctx.drawImage(base_image, 0, 0);
			}
		}
		var jpegUrl = canvas.toDataURL("image/jpeg");
		var pngUrl = canvas.toDataURL("image/png");
		return pngUrl;
	}

	//Put table body within pdfMake formatted table
	function peakTable(data, columns) {
		if (identifiedPeaks.length === 0) {
			return {
				table: {
					body: buildTableBody(data)
				},
				layout: 'noBorders',
				style: 'smaller',
				margin: [0, 0, 0, 15],
			};
		} else {
			return {
				table: {
					headerRows: 1,
					widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
					body: buildTableBody(data, ['Site Number', 'Description', 'State', 'County', 'Peak Stage (ft)', 'Peak Date/Time', 'Peak Estimated']),
				},
				layout: 'lightHorizontalLines',
				style: 'smaller',
				margin: [0, 0, 0, 15]
			};
		};
	};

	// Adding HWM data a table body for pdf report
	function buildHwmTableBody() {
		var body = [];
		if (identifiedMarks.length === 0) {
			body.push([
				{ text: 'There are no High Water Marks at this Site.' }
			])
		} else {
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
						{ text: 'Latitude (DD)', style: 'tableHeader' }, identifiedMarks[i].feature.properties.latitude,
						{ text: 'Longitude (DD)', style: 'tableHeader' }, identifiedMarks[i].feature.properties.longitude
					],
					[
						{},
						{ text: 'Location Description', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwm_locationdescription,
						{ text: 'Survey Date/Time', style: 'tableHeader' }, moment(identifiedMarks[i].feature.properties.survey_date).format("MM/DD/YYYY, h:mm a")
					],
					[
						{},
						{ text: 'Bank', style: 'tableHeader' }, identifiedMarks[i].feature.properties.bank,
						{ text: 'Environment', style: 'tableHeader' }, identifiedMarks[i].feature.properties.hwm_environment
					],
					[
						{},
						{ text: 'Flag Date', style: 'tableHeader' }, moment(identifiedMarks[i].feature.properties.flag_date).format("MM/DD/YYYY"),
						{ text: 'Stillwater', style: 'tableHeader' }, identifiedMarks[i].feature.properties.stillwater
					],
					[
						{},
						{ text: 'Uncertainty', style: 'tableHeader' }, uncertainty,
						{ text: 'HWM Uncertainty', style: 'tableHeader' }, hwmUncertainty
					],
					[
						{},
						{ text: 'Site Description', style: 'tableHeader' }, identifiedMarks[i].feature.properties.siteDescription,
						{ text: '', style: 'tableHeader' }, ''
					]);
			}
		}
		return body;
	};
	//Put table body within pdfMake formatted table
	function hwmTable() {
		if (identifiedMarks.length === 0) {
			return {
				table: {
					body: buildHwmTableBody(),
				},
				layout: 'noBorders',
				style: 'smaller',
				margin: [0, 0, 0, 15],
			};
		} else {
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
		};
	};

	//This runs when clicking the 'Peak CSV' or 'HWM CSV' button on the Report modal
	function downloadCSV(type) {
		//Format name of park or refuge
		var siteName = currentParkOrRefuge.split(" ").join("_");

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
		//var hydro = getBase64Image();
		var summaryRows = [];
		var sumHeaders = [];
		function reportSummaryInfo() {
			$('#reportSummaryDataTable th').each(function (index, item) {
				sumHeaders[index] = $(item).html();
			});
			$('#reportSummaryDataTable tr').has('td').each(function () {
				var arrayItem = {};
				$('td', $(this)).each(function (index, item) {
					arrayItem[sumHeaders[index]] = $(item).html();
				});
				summaryRows.push(arrayItem);
			});
			return summaryRows;
		};
		// Build the table body for pdfMake of summary information
		function buildSummaryBody(data, columns) {
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
		};
		function summaryTable(data, columns) {
			return {
				table: {
					headerRows: 1,
					widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
					body: buildSummaryBody(data, ['Type', 'Total Sites', 'Standard Dev (ft)', 'Min (ft)', 'Median (ft)', 'Mean (ft)', 'Max (ft)', 'Max Date/Time', '90% Conf Low', '90% Conf High']),
				},
				layout: 'lightHorizontalLines',
				style: 'smaller',
				margin: [0, 0, 0, 15]
			};
		};
		//// Get date and time of print click //// 
		var date = new Date();
		// For today's date
		Date.prototype.today = function () {
			return (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + this.getFullYear();
		}
		// For current time
		Date.prototype.timeNow = function () {
			return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
		}
		var todayDate = date.today() + " at " + date.timeNow();
		//// End of date/time ////


		// Report selections table
		//Prints park/refuge, event, and buffer distance on left side of report
		function reportSelectionsTable() {
			var siteType = $(".select2-selection__choice")[0].title
			if (siteType === "NPS") {
				siteType = "NPS Site"
			}
			return {
				table: {
					widths: ['auto', 'auto'],
					body: [
						[{ colSpan: 2, border: [false, false, false, true], text: 'Report Selections: ', style: 'subHeader' }, ''],
						[{ text: 'Event: ', alignment: 'right' }, selectedEvent],
						[{ text: siteType + ': ', alignment: 'right' }, currentParkOrRefuge],
						[{ text: 'Buffer: ', alignment: 'right' }, selectedBuffer]
					]
				},
				layout: {
					defaultBorder: false,
				}
			};
		}
		//// End of summary for search selections ////

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
					text: ['Page ' + currentPage.toString() + ' | Consult the ', { text: 'HWM Data Dictionary', link: 'https://stn.wim.usgs.gov/STNWeb/datadictionary/FilteredHWMs.csv', color: '#0000EE' }, ' or ', { text: 'Peak Data Dictionary', link: 'https://stn.wim.usgs.gov/STNWeb/datadictionary/FilteredPeaks.csv', color: '#0000EE' }, ' for more field information.']
				}
			},
			content: [
				{
					table: {
						widths: ['*'],
						body: [
							[{
								border: [false, false, false, true],

								text: 'Summary of Peak Water Levels within ' + selectedBuffer + ' of ' + currentParkOrRefuge + ' during ' + selectedEvent,

								style: 'header', alignment: 'center'
							}]
						]
					},
					margin: [0, 0, 0, 15]
				},
				{
					image: pdfMapUrl,
					width: 800,
					height: 500,
					pageBreak: 'after'
				},
				{
					table: {
						widths: ['*'],
						body: [
							[{
								border: [false, false, false, true],
								text: 'Printed: ' + todayDate,
								style: 'header', alignment: 'center'
							}]
						]
					},
					margin: [0, 0, 0, 15]
				},
				{
					table: {
						body: [[
							[{ text: '', width: 300, height: 200 }],
							reportSelectionsTable(),
							[{ image: legendUrl, width: 100, height: 100 }],
						],
						]
					},
					layout: 'noBorders',
					margin: [0, 0, 0, 15]
				},
				{ text: currentParkOrRefuge + ' Summary for ' + selectedEvent, style: 'subHeader', margin: [0, 0, 0, 15] },
				summaryTable(reportSummaryInfo()),
				{ text: 'Peak Data Measured in Feet Above NAVD88 Calculated for each Monitoring Site within the ' + currentParkOrRefuge + ' Boundary for ' + selectedEvent, style: 'subHeader', margin: [0, 0, 0, 5] },
				peakTable(bodyData()),
				{ text: '**Please note that the summary stats include the height of all peak water levels calculated within the buffer for each NWR. All peak data reference height of water level in feet above NAVD88 datum. Inland sites may be located at a location where the land surface elevation is greater than zero.', style: 'subheader', margin: [0, 0, 0, 15] },
				{ text: 'High Water Mark data Measured in Feet Above NAVD88 Datum within the ' + bufferSize + ' km buffer of ' + currentParkOrRefuge + ' for ' + selectedEvent, style: 'subHeader', margin: [0, 0, 0, 15] },
				hwmTable(),
			],
			styles: {
				header: {
					fontSize: 13,
					bold: true
				},
				tableHeader: {
					fontSize: 10,
					bold: true,
				},
				subHeader: {
					fontSize: 11,
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
					fontSize: 8
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
//PeakSummarySymbologyInterior is found in displayPeaksGeoJSON()
var streamGageSymbologyInterior = "<img class='legendSwatch' src='images/markers/nwis.png'/><b>Real-time Stream Gage</b>";
var rainGageSymbologyInterior = "<img class='legendSwatch' src='images/markers/rainIcon.png'/><b>Real-time Rain Gage<b>";
var tideCurrentSymbologyInterior = "<img class='legendSwatch' style='width: 10px; margin-left: 6px' src='images/markers/bluepushpin.png'/><b style='margin-left: 5px'>NOAA Tides and Currents<b>";
var barometricSymbologyInterior = "<img class='legendSwatch' src='images/markers/baro.png'/><b>Barometric Pressure Sensor</b>";
var stormTideSymbologyInterior = "<img class='legendSwatch' src='images/markers/stormtide.png'/><b>Storm Tide Sensor</b>";
var crmsSymbologyInterior = "<img class='legendSwatch' src='images/markers/crms.png'/><b>Coastwide Reference Monitoring System (LA Only)</b>";
var fimanSymbologyInterior = "<img class='legendSwatch' src='images/markers/fimanCircle.png'/><b>Flood Inundation Mapping and Alert Network (NC Only)</b>"; 
var meteorlogicalSymbologyInterior = "<img class='legendSwatch' src='images/markers/met.png'/><b>Meteorlogical Sensor</b>";
var waveHeightSymbologyInterior = "<img class='legendSwatch' src='images/markers/waveheight.png'/><b>Wave Height Sensor</b>";
var rdgSymbologyInterior = "<img class='legendSwatch' src='images/markers/rdg.png'/><b>Rapid Deployment Gage</b>";
var highWaterSymbologyInterior = "<img class='legendSwatch' src='images/markers/hwm.png'/><b>High Water Mark</b>";
var parkBoundsSymbologyInterior = "<img class='square-legend parkBoundsColor'/><b>Park Boundaries</b>";
var npsNetworksSymbologyInterior = "<img class='square-legend npsNetColor'/><b>NPS Networks</b>";
var parkTractsSymbologyInterior = "<label>Park Tracts</label>" +
	"<div class='legend-item'><img class='square-legend-interest federalFeeColor'/> Federal Land (Fee)</div>" +
	"<div class='legend-item'><img class='square-legend-interest federalLessFeeColor'/> Federal Land (Less than Fee)</div>" +
	"<div class='legend-item'><img class='square-legend-interest publicColor'/> Public</div>" +
	"<div class='legend-item'><img class='square-legend-interest privateColor'/> Private</div>" +
	"<div class='legend-item'><img class='square-legend-interest otherFederalColor'/> Other Federal Land</div>" +
	"<div class='legend-item'><img class='square-legend-interest aquisitionColor'/> Aquisition Deferred</div>" +
	"<div class='legend-item'><img class='square-legend-interest noInfoColor'/> Unknown </div>";
var approvedFWSSymbologyInterior = "<img class='square-legend approvedAquiColor'/><b>Approved Aquisition Boundaries</b>";
var interestFWSSymbologyInterior = "<label>Interest Boundaries</label>" +
	"<div class='legend-item'><img class='square-legend-interest intFee'/> Fee</div>" +
	"<div class='legend-item'><img class='square-legend-interest intSecondary'/> Secondary</div>" +
	"<div class='legend-item'><img class='square-legend-interest intEasement'/> Easement</div>" +
	"<div class='legend-item'><img class='square-legend-interest intLease'/> Lease</div>" +
	"<div class='legend-item'><img class='square-legend-interest intAgreement'/> Agreement</div>" +
	"<div class='legend-item'><img class='square-legend-interest intPartial'/> Partial Interest</div>" +
	"<div class='legend-item'><img class='square-legend-interest intPermit'/> Permit</div>" +
	"<div class='legend-item'><img class='square-legend-interest intUnknown'/> Unknown </div>";
var doiSymbologyInterior = "<img class='square-legend doiRegionsColor'/> <b>DOI Regions</b>";
var noaaCycloneSymbologyInterior = "<img class='legendSwatch' src='images/markers/noaa.png'/> <b>NOAA Tropical Cyclone Forecast Track</b>";

//Display peak layer and legend item when peak box is checked
function clickPeaks() {
	var peaksCheckBox = document.getElementById("peaksToggle");
	if (peaksCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		displayPeaksGeoJSON("peak", "Peak Summary", fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peakMarkerIcon);
		var peakvalues = getPeakValues("peak", "Peak Summary", fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peakMarkerIcon);

	}
	//Remove symbol and layer name from legend when box is unchecked
	if (peaksCheckBox.checked == false) {
		$('#PeakSummarySymbology').children().remove();
		peak.clearLayers();
		var peakLabels = document.getElementById("peakCheckbox");
		peakLabels.checked = false;
		peakStart = 0;
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
		$('#nwisLoadingAlert').show();
		var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
		queryNWISRainGages(bbox);
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
		$('#nwisLoadingAlert').show();
		var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
		queryNWISrtGages(bbox);
		//Add symbol and layer name to legend
		$('#streamGageSymbology').append(streamGageSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (streamgageCheckBox.checked == false) {
		USGSrtGages.clearLayers(map);
		$('#streamGageSymbology').children().remove();
	}
}

//Display NOAA tides and currents layer and legend item when the box is checked
function clickTideCurrent() {
	var tideCurrentCheckBox = document.getElementById("tideCurrentToggle");
	if (tideCurrentCheckBox.checked == true) {
		//Add symbol and layer name to legend
		$('#tideCurrentSymbology').append(tideCurrentSymbologyInterior);
		//When checkbox is checked, add layer to map
		displayTidesGeoJSON(
            "tides",
            "NOAA Tides and Currents",
            "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json",
            tidesMarkerIcon
          );
		  tides.addTo(map)
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (tideCurrentCheckBox.checked == false) {
		$('#tideCurrentSymbology').children().remove();
		tides.clearLayers(map);
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

//Display CRMS layer and legend item when corresponding box is checked
function clickCRMS() {
	var crmsCheckBox = document.getElementById("crmsToggle");
	if (crmsCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		crms.addTo(map);
		//Add symbol and layer name to legend
		$('#crmsSymbology').append(crmsSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (crmsCheckBox.checked == false) {
		crms.removeFrom(map);
		$('#crmsSymbology').children().remove();
	}
}

//Display FIMAN layer and legend item when corresponding box is checked
function clickFIMAN() {
	var fimanCheckBox = document.getElementById("fimanToggle");
	if (fimanCheckBox.checked == true) {
		//When checkbox is checked, add layer to map
		fiman.addTo(map);
		//Add symbol and layer name to legend
		$('#fimanSymbology').append(fimanSymbologyInterior);
	}
	//Remove symbol and layer name from legend when box is unchecked
	if (fimanCheckBox.checked == false) {
		fiman.removeFrom(map);
		$('#fimanSymbology').children().remove();
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

function searchComplete(runningFilter, exploreMap) {
	console.log("1 starting search complete");
	bufferPoly = undefined;
	parks = undefined;
	refuges = undefined;
	flattenedPoly = undefined;
	buffer = undefined;
	var polyDefined;
	// Clearing identified peaks and identified marks arrays before buffer runs if array had previous values
	identifiedPeaks.length = 0;
	identifiedMarks.length = 0;

	//If using the welcom modal, collect input from the welcome modal
	if (runningFilter == false) {

		//this element is populated with either 'NPS' or NWR'
		var siteType = $('#typeSelect_welcomeModal').val()[0];

		// getting and setting park name from search
		var name = $('#siteSelect_welcomeModal').val()[0];

		// setting the current Park or Refuge selected for the report
		currentParkOrRefuge = $('#siteSelect_welcomeModal').val()[0];
	}

	//If using the filter modal, collect input from the filter modal
	if (runningFilter == true) {
		$('#filtersModalError').hide();
		map.fitBounds(usBounds);
		var siteType = $('#typeSelect_filterModal').val()[0];

		// getting and setting park name from search
		var name = $('#siteSelect_filterModal').val()[0];

		// setting the current Park or Refuge selected for the report
		currentParkOrRefuge = $('#siteSelect_filterModal').val()[0];
	}

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
	var where = "1=1";
	var polys = [];

	if (siteType === "NPS") {
		//Replace single quotes/apostrophes with double quotes so that the query works
		name = name.replace(/'/g, "''");
		name = name.substring(1, name.length - 1)
		where = "UNIT_NAME=" + name;
		parks = L.esri.featureLayer({
			useCors: false,
			url: 'https://gis1.wim.usgs.gov/server/rest/services/DOIFEV/DOI_FEV/MapServer/1',
			simplifyFactor: 0.5,
			precision: 4,
			where: "UNIT_NAME=" + name,
			onEachFeature: function (feature, latlng) {
				var popupContent = '<p>' + feature.properties.UNIT_NAME + '</p>';
				latlng.bindPopup(popupContent);
				polys = feature.geometry;
				// flattening the geometry for use in turf
				flattenedPoly = turf.flatten(polys);
				if (flattenedPoly !== undefined) {
					polyDefined = true;
				}
			},
			style: parkStyle
		}).addTo(map);

		// waiting for site layer to be loaded onto the map before continuing
		parks.on('load', function () {
			if (polyDefined === true) {
				if (alreadyLoaded == false) {
					getSiteBuffers(exploreMap);
				}
				alreadyLoaded = true;
			}
		});
	} else if (siteType === "NWR") {
		//Replace single quotes/apostrophes with double quotes so that the query works
		name = name.replace(/'/g, "''");
		name = name.substring(1, name.length - 1)
		where = "ORGNAME=" + name;
		refuges = L.esri.featureLayer({
			useCors: false,
			url: "https://gis1.wim.usgs.gov/server/rest/services/DOIFEV/DOI_FEV/MapServer/0",
			simplifyFactor: 0.5,
			precision: 4,
			where: "ORGNAME=" + name,
			onEachFeature: function (feature, latlng) {
				var popupContent = '<p>' + feature.properties.ORGNAME + '</p>';
				latlng.bindPopup(popupContent);
				polys = feature.geometry;
				// flattening the geometry for use in turf
				flattenedPoly = turf.flatten(polys);
				if (flattenedPoly !== undefined) {
					polyDefined = true;
				}
			},
			style: parkStyle
		}).addTo(map);
		//if there was a name match with the refuge layer, this will not run
		// disabling for now
		/* setTimeout(() => {
			if (refCount !== 1) {
				where = "ORGNAME=" + name;
				fwsInterest = L.esri.featureLayer({
					useCors: false,
					url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved_Authoritative/FeatureServer/1',
					simplifyFactor: 0.5,
					precision: 4,
					where: "ORGNAME=" + name,
					onEachFeature: function (feature, latlng) {
						var popupContent = '<p>' + feature.properties.UNIT_NAME + '</p>';
						latlng.bindPopup(popupContent);
						polys = feature.geometry;
						success = true;
						// flattening the geometry for use in turf
						flattenedPoly = turf.flatten(polys);
						refCount = 1;
						regionName = feature.properties.FWSREGION;
					},
					style: parkStyle
				}).addTo(map);
			}
			
		}, 1000); */
		$('#updateFiltersModal').modal('hide');

		// waiting for site layer to be loaded onto the map before continuing
		refuges.on('load', function () {
			//console.log("waiting for layer to load onto the map")
			if (polyDefined === true) {
				if (alreadyLoaded == false) {
					getSiteBuffers(exploreMap);
				}
				alreadyLoaded = true;
			}
		});


	}


	// account for a search that is not a park or refuge
	function getSiteBuffers(em) {
		console.log("2 getting buffer");
		var exploreMap = em;
		var buffered;
		var polysCount;
		buffered = turf.buffer(flattenedPoly, fev.vars.currentBufferSelection, { units: 'kilometers' });
		polysCount = flattenedPoly.features.length;
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


		/* bufferPoly.on('load', function () {
			getEachDataSection(bufferPoly.getLayers());
		}); */
		setTimeout(() => {
			getEachDataSection(bufferPoly.getLayers());
			document.getElementById("printNav").disabled = false;
			$("#printButtonLoader").removeClass("fa fa-spinner fa-spin");
		}, 5000);


		function getEachDataSection() {
			console.log("3 getting data section");
			// cycling through each peak and seeing if it's inside the buffer
			for (var i in peak._layers) {
				// formatting point for turf
				var cords = ([peak._layers[i]._latlng.lng, peak._layers[i]._latlng.lat]);

				if (peak._layers[i] !== undefined) {
					var isItInside = turf.booleanPointInPolygon(cords, buffer);

					// if true add it to an array containing all the 'true' peaks
					if (isItInside) {
						//only include the peaks that have values that aren't undefined
						if (peak._layers[i].feature.properties.peak_stage != undefined) {
							identifiedPeaks.push(peak._layers[i])
							peak._layers[i].addTo(bufferPeak);
						}
					}
				}
			}
			getHWMSInside();

			// getting hwms in buffer
			function getHWMSInside() {
				//cycling through each HWM to see if inside the buffer
				for (var i in hwm._layers) {
					if (hwm._layers[i] !== undefined) {
						var cords = ([hwm._layers[i]._latlng.lng, hwm._layers[i]._latlng.lat]);
						var isItInside = turf.booleanPointInPolygon(cords, buffer);
						if (isItInside) {
							//only include the hwms that have values
							if (hwm._layers[i].feature.properties.elev_ft != undefined) {
								if (hwm._layers[i].feature.properties.hwm_locationdescription != undefined) {
									identifiedMarks.push(hwm._layers[i])
									hwm._layers[i].addTo(bufferHWM);
								}
							}
						}
					}

				}
				getST();
			}

			// getting storm tides in buffer
			function getST() {
				for (var i in stormtide._layers) {
					var cords = ([stormtide._layers[i]._latlng.lng, stormtide._layers[i]._latlng.lat]);
					var isItInside = turf.booleanPointInPolygon(cords, buffer);
					if (isItInside) {
						identifiedST.push(stormtide._layers[i])
					}
					/* if (stCnt === stLength) {
						if (exploreMap == false) {
							//show load warning message while waiting for layers to load and report to generate
							$('#siteReportLoading').modal('show', { backdrop: 'static', keyboard: false });
							//remove loading message, show site report modal
							$('#siteReportLoading').modal('hide');
							$('#printModal').modal('show');

							generateSiteReport();
						}
					} */
				}
				readyforReport();
			}

			function readyforReport() {
				if (exploreMap == false) {
					//show load warning message while waiting for layers to load and report to generate
					$('#siteReportLoading').modal('show', { backdrop: 'static', keyboard: false });
					//remove loading message, show site report modal
					$('#siteReportLoading').modal('hide');
					$('#printModal').modal('show');

					generateSiteReport();
				}
			}
			/* if (hwmCnt === hwmLength) {
				var stLength = stormtide.getLayers().length;
				var stCnt = 0;
				for (var i in stormtide._layers) {
					stCnt++;
					var cords = ([stormtide._layers[i]._latlng.lng, stormtide._layers[i]._latlng.lat]);
					var isItInside = turf.booleanPointInPolygon(cords, buffer);
					if (isItInside) {
						identifiedST.push(stormtide._layers[i])
					}
					if (stCnt === stLength) {
						if (exploreMap == false) {
							//show load warning message while waiting for layers to load and report to generate
							$('#siteReportLoading').modal('show', { backdrop: 'static', keyboard: false });
							//remove loading message, show site report modal
							$('#siteReportLoading').modal('hide');
							$('#printModal').modal('show');

							generateSiteReport();
						}
					}
				}
			} */


		}

		/* if (runningFilter == true) {
			//if the event is changed in the filters modal, the checkbox/legend symbols must be reset
			var peaksCheckBox = document.getElementById("peaksToggle");
			peaksCheckBox.checked = false;
			clickPeaks();
			peaksCheckBox.checked = true;
			clickPeaks();

			var baroCheckBox = document.getElementById("baroToggle");
			baroCheckBox.checked = false;
			clickBaro();
			baroCheckBox.checked = true;
			clickBaro();

			var stormTideCheckBox = document.getElementById("stormTideToggle");
			stormTideCheckBox.checked = false;
			clickStormTide();
			stormTideCheckBox.checked = true;
			clickStormTide();

			var metCheckBox = document.getElementById("metToggle");
			metCheckBox.checked = false;
			clickMet();
			metCheckBox.checked = true;
			clickMet();

			var waveHeightCheckBox = document.getElementById("waveHeightToggle");
			waveHeightCheckBox.checked = false;
			clickWaveHeight();
			waveHeightCheckBox.checked = true;
			clickWaveHeight();

			var HWMCheckBox = document.getElementById("HWMToggle");
			HWMCheckBox.checked = false;
			clickHWM();
			HWMCheckBox.checked = true;
			clickHWM();

			var rdgCheckBox = document.getElementById("rdgToggle");
			rdgCheckBox.checked = false;
			clickRdg();
			rdgCheckBox.checked = true;
			clickRdg();
		} */

		map.fitBounds(bufferPoly.getBounds());
		if (siteSelected == true) {
			//document.getElementById("printNav").disabled = false;
		}
		if (exploreMap === true) {
			$('#siteReportLoading').modal('hide');
			$("#printButtonLoader").addClass("fa fa-spinner fa-spin");
		}
		//$(inputModal).modal('hide');
	}
};

function generateSiteReport() {
	// toggling off these layers so they aren't the map print out on the pdf
	console.log("4 starting to generate site report");
	map.fitBounds(bufferPoly.getBounds());

	// toggling off master peak layer and adding just peaks within buffer to map
	$('#peaksToggle').click();

	bufferPeak.addTo(map);

	if (document.getElementById('baroToggle').checked) {
		$('#baroToggle').click();
	}
	if (document.getElementById('metToggle').checked) {
		$('#metToggle').click();
	}
	if (document.getElementById('rdgToggle').checked) {
		$('#rdgToggle').click();
	}
	if (document.getElementById('HWMToggle').checked) {
		$('#HWMToggle').click();
	}
	if (document.getElementById('waveHeightToggle').checked) {
		$('#waveHeightToggle').click();
	}
	if (document.getElementById('stormTideToggle').checked) {
		$('#stormTideToggle').click();
	}
	if (document.getElementById('rainGageToggle').checked) {
		$('#rainGageToggle').click();
	}
	if (document.getElementById('parkBoundsToggle').checked) {
		$('#parkBoundsToggle').click();
	}
	if (document.getElementById('tractToggle').checked) {
		$('#tractToggle').click();
	}
	if (document.getElementById('npsNetToggle').checked) {
		$('#npsNetToggle').click();
	}
	if (document.getElementById('interestFWSToggle').checked) {
		$('#interestFWSToggle').click();
	}
	if (document.getElementById('approvedFWSToggle').checked) {
		$('#approvedFWSToggle').click();
	}
	if (document.getElementById('doiToggle').checked) {
		$('#doiToggle').click();
	}
	if (document.getElementById('streamGageToggle').checked) {
		$('#streamGageToggle').click();
	}
	if (document.getElementById('noaaToggle').checked) {
		$('#noaaToggle').click();
	}
	console.log("5 turned off layers");
	// displaying labels for print image
	bufferPeak.eachLayer(function (myMarker) { myMarker.showLabel(); });

	var identifedPeakArray = [];
	var getLayers = bufferPeak.getLayers();
	var getLayersLength = getLayers.length;
	var getLayersCnt = 0;

	// getting thirds values; creating legend
	getLayers.forEach(function (p) {
		getLayersCnt++;
		identifedPeakArray.push(p.feature.properties.peak_stage);
		/* if (getLayersCnt === getLayersLength) {
			createPeakLegend();
		} */
	});

	function createPeakLegend() {
		var sorted = identifedPeakArray.sort(function (a, b) { return a - b });
		//find number of peak values
		var lengthPeak = sorted.length;

		//divide the array into 3 equal sections
		//find the maximum peak value of each of those sections
		var sThirdLength = Math.round(lengthPeak / 3);
		//subtract one, because the first index starts at zero
		var sThirdVal = sorted[sThirdLength - 1];
		var sTwoThirdVal = sorted[sThirdLength * 2 - 1];

		var PeakSummarySymbologyInterior;
		//if there are hwms but no peaks, show those instead
		if (lengthPeak == 0) {
			if (identifiedMarks.length > 0) {
				var highWaterSymbologyInterior = "<img class='legendSwatch' src='images/markers/hwm.png'/><b>High Water Mark</b>";
				$('#highWaterSymbology').append(highWaterSymbologyInterior);
				bufferHWM.addTo(map);
			}
		}
		if (lengthPeak > 0) {
			if (lengthPeak > 2) {
				PeakSummarySymbologyInterior = "<label>Peak Summary (ft)</label>" +
					"<div class='legend-item peakSmall'><img src='images/markers/peak.png'/> &nbsp; &lt; &nbsp;" + sThirdVal + "</div>" +
					"<div class='legend-item peakMedium'><img src='images/markers/peak.png'/> " + sThirdVal + " - " + sTwoThirdVal + "</div>" +
					"<div class='legend-item peakLarge'><img src='images/markers/peak.png'/>  &nbsp; &gt; &nbsp;" + sTwoThirdVal + "</div>";
			}
			if (lengthPeak < 3) {
				PeakSummarySymbologyInterior = "<div class='legend-item'><img class='peakMedium' src='images/markers/peak.png'/> Peak Summary</div>";
			}
		}
		// adding the peak and hwm icons to the legend
		$('#PeakSummarySymbology').append(PeakSummarySymbologyInterior);

		// adding gage icon to legend too if there are any
		if (identifiedUSGSrtGageArray.length > 0) {
			$('#streamGageSymbology').append(streamGageSymbologyInterior);
		} else {
			$('#streamGageSymbology').css('display', 'none');
		}
	}

	//$('#highWaterSymbology').append(highWaterSymbologyInterior);

	$('#rtgraphs').children().remove();
	identifiedUSGSrtGage = L.featureGroup();
	identifiedUSGSrtGageArray = [];
	//Stream gages need to be checked on for the hydrographs to appear
	var streamgageCheckBox = document.getElementById("streamGageToggle");
	if (streamgageCheckBox.checked == true) {
		USGSrtGages.clearLayers(map);
		getStreamGageForReport(true);
	}
	if (streamgageCheckBox.checked == false) {
		USGSrtGages.clearLayers(map);
		streamgageCheckBox.checked = true;
		getStreamGageForReport(true);
	}

	$('#loadUSGSrt').click(function () {
		displayRtGageReport(allStreamGages, true);
	});

	function getStreamGageForReport() {
		//var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
		//queryNWISrtGages(bbox);
		//When checkbox is checked, add layer to map
		USGSrtGages.addTo(map);
		$('#nwisLoadingAlert').show();
		var bbox = map.getBounds().getSouthWest().lng.toFixed(7) + ',' + map.getBounds().getSouthWest().lat.toFixed(7) + ',' + map.getBounds().getNorthEast().lng.toFixed(7) + ',' + map.getBounds().getNorthEast().lat.toFixed(7);
		queryNWISRTGagesForReport(bbox);
		//Add symbol and layer name to legend
		//$('#streamGageSymbology').append(streamGageSymbologyInterior);


		function queryNWISRTGagesForReport() {
			var NWISmarkers = {};

			//NWIS query options from http://waterservices.usgs.gov/rest/IV-Test-Tool.html
			var parameterCodeList = '00065,62619,62620,63160,72214';
			var siteTypeList = 'OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS';
			var siteStatus = 'active';
			var url = 'https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=' + bbox + '&parameterCd=' + parameterCodeList + '&siteType=' + siteTypeList + '&siteStatus=' + siteStatus;

			$.ajax({
				url: url,
				dataType: "xml",
				success: function (xml) {
					$(xml).find('site').each(function () {

						var siteID = $(this).attr('sno');
						var siteName = $(this).attr('sna');
						var lat = $(this).attr('lat');
						var lng = $(this).attr('lng');
						NWISmarkers[siteID] = L.marker([lat, lng], { icon: nwisMarkerIcon });
						NWISmarkers[siteID].data = { siteName: siteName, siteCode: siteID };
						NWISmarkers[siteID].data.parameters = {};

						//add point to featureGroup
						USGSrtGages.addLayer(NWISmarkers[siteID]);

						$("#nwisLoadingAlert").fadeOut(2000);
					});
					setTimeout(() => {
						identifyGagesWithinBuff();
					}, 1500);
				},
				error: function (xml) {
					$("#nwisLoadingAlert").fadeOut(2000);
					// skip rest of rt graph functions and continue building report
					var gageGraphTitle = document.getElementById('gageGraphs');
					gageGraphTitle.innerHTML = "";
					$("#streamGageHeader").addClass("no-data");
					// gageGraphTitle.innerHTML = "<div style='font-weight: normal; text-align: center;'> <p >There are no real-time stream gages at this site.</p></div>";
					$('#streamGageToggle').click();
					createDataArrays();
					//USGSrtGages.clearLayers();
					console.log("10 moving to data arrays");
				}
			});
		}

		function identifyGagesWithinBuff() {
			// account for if there are no gages in the bounding box
			if (USGSrtGages.getLayers().length === 0) {
				var gageGraphTitle = document.getElementById('gageGraphs');
				gageGraphTitle.innerHTML = "";
				$("#streamGageHeader").addClass("no-data");
				// gageGraphTitle.innerHTML = "<div style='font-weight: normal; text-align: center;'> <p >There are no real-time stream gages at this site.</p></div>";
				$('#streamGageToggle').click();
				createDataArrays();
				//USGSrtGages.clearLayers();
				console.log("10 moving to data arrays");
			} else {
				var rtLength = USGSrtGages.getLayers().length;
				var cnt = 0;
				for (var i in USGSrtGages._layers) {
					var gMarkers = {};
					cnt++;
					// formatting point for turf
					var cords = ([USGSrtGages._layers[i]._latlng.lng, USGSrtGages._layers[i]._latlng.lat]);

					var isItInside = turf.booleanPointInPolygon(cords, buffer);
					console.log("9 checking to see if any are in buffer");
					// if true add it to an array containing all the 'true' peaks
					if (isItInside) {

						// adding to featuregroup of gages inside buffer
						var siteID = USGSrtGages._layers[i].data.siteCode;
						var siteName = USGSrtGages._layers[i].data.siteName;
						var lat = USGSrtGages._layers[i]._latlng.lat;
						var lng = USGSrtGages._layers[i]._latlng.lng;
						gMarkers[siteID] = L.marker([lat, lng], { icon: nwisMarkerIcon }).bindLabel("Site Code: " + siteID);
						gMarkers[siteID].data = { siteName: siteName, siteCode: siteID };
						gMarkers[siteID].data.parameters = {};
						// adding object to feature group
						identifiedUSGSrtGage.addLayer(gMarkers[siteID]);
						// adding object to normal array
						identifiedUSGSrtGageArray.push(USGSrtGages._layers[i]);
					}
					if (cnt === rtLength) {
						if (identifiedUSGSrtGageArray.length > 0) {
							// adding feature group to map
							identifiedUSGSrtGage.addTo(map);
							identifiedUSGSrtGage.eachLayer(function (myMarker) { myMarker.showLabel(); });

							allStreamGages = identifiedUSGSrtGageArray;

							// passing array to function to make graphs
							displayRtGageReport(identifiedUSGSrtGageArray, false);
						} else {
							var gageGraphTitle = document.getElementById('gageGraphs');
							gageGraphTitle.innerHTML = "";
							$("#streamGageHeader").addClass("no-data");
							$('#streamGageToggle').click();
							createDataArrays();
							$('#loadUSGSrt').css('display', 'none');
							//USGSrtGages.clearLayers();
							console.log("10 moving to data arrays");
						}

					}
				}
			}
		}

	}
	//get data and generate graph of real-time gage water level time-series data
	function displayRtGageReport(streamGagesInBuffer, loadmore) {
		//Prevent the code before 'getJSON' to loop over before 'getJSON' has also run
		$.ajaxSetup({
			async: false
		});

		if (loadmore === false) {
			allStreamGages = streamGagesInBuffer
			var gageArray = [];

			// removing gage duplicates
			for (var streamGage in allStreamGages) {
				gageArray.push(allStreamGages[streamGage].data);
			}
			gageArray = gageArray.reduce((unique, o) => {
				if (!unique.some(obj => obj.siteCode === o.siteCode)) {
					unique.push(o);
				}
				return unique;
			}, []);

			allStreamGages = gageArray;
		}

		//This title appears under the map/legend in the regional report
		//No report or title are shown if there are no stream gages in the buffer
		//Stream gage layer must be turned on

		//Keeps track of how many graphs were generated (or attempted to generate)
		//Counter is later added to the end of each graph-related ID so that the elements don't overwrite after each loop
		//Without this counter, only one graph/no data warning will appear

		var threeGraphs = [];
		if (allStreamGages.length >= 3) {
			threeGraphs.push(allStreamGages[0], allStreamGages[1], allStreamGages[2]);
		} else {
			threeGraphs = allStreamGages;
			// don't display loading button if there are less than 3
			$('#loadUSGSrt').css('display', 'none');
		}

		var length = threeGraphs.length - 1;
		for (var streamGage in threeGraphs) {

			//Turn the graphCounter into a string so that it can be added onto the name of the ID
			var graphCounterString = graphCounter.toString();

			//Create temporary IDs for displaying the hydrograph or no data warning
			var tempGraphID = 'graphContainerReport';
			var tempGraphIDhash = '#graphContainerReport';
			var tempGraphNoDataID = 'noDataMessage';
			var tempGraphNoDataHash = '#noDataMessage';

			//Keep the IDs sensical by removing the previous counter
			tempGraphID = tempGraphID.substring(0, 20);
			tempGraphIDhash = tempGraphIDhash.substring(0, 21);
			tempGraphNoDataID = tempGraphNoDataID.substring(0, 13);
			tempGraphNoDataHash = tempGraphNoDataHash.substring(0, 14);

			//Add the new counter to the end of the hydrograph and data warning ID
			var tempID = tempGraphID.concat(graphCounterString);
			var tempIDhash = tempGraphIDhash.concat(graphCounterString);
			var tempNoDataID = tempGraphNoDataID.concat(graphCounterString);
			var tempNoDataHash = tempGraphNoDataHash.concat(graphCounterString);

			//Increase the graphCounter by one for each loop
			graphCounter += 1;

			var parameterCodeList = '00065,62619,62620,63160,72279';

			var timeQueryRange = '';
			//if event has no end date
			if (fev.vars.currentEventEndDate_str == '') {
				//use moment.js lib to get current system date string, properly formatted, set currentEventEndDate var to current date
				fev.vars.currentEventEndDate_str = moment().format('YYYY-MM-DD');
			}
			//if no start date and
			if (fev.vars.currentEventStartDate_str == '' || fev.vars.currentEventEndDate_str == '') {
				timeQueryRange = '&period=P7D'
			} else {
				timeQueryRange = '&startDT=' + fev.vars.currentEventStartDate_str + '&endDT=' + fev.vars.currentEventEndDate_str;
			}

			//This is where the hydrograph title and graph or no data warning are added to the Report 
			$('#rtgraphs').append(
				"<div class='report-chart-wrapper' id='" + tempID + "Wrapper'>"
				+ "<b class='report-chart-title'>"
				+ threeGraphs[streamGage].siteName + " (Site" + "&nbsp" + threeGraphs[streamGage].siteCode + ")"
				+ "</b>"
				+ "<div class='report-chart-body' id=" + tempID + "></div>"
				+ "</div>");
			console.log("in rt graphing for reports");
			//Get the data for the hydrograph
			$.getJSON('https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + threeGraphs[streamGage].siteCode + '&parameterCd=' + parameterCodeList + timeQueryRange, function (data) {

				//If there are no data to create a hydrograph, display the no data warning
				if (data.data == undefined) {
					$("#" + tempID + "Wrapper").addClass("full-width");
					$("#" + tempID).append("No NWIS data available for this time period");
				}

				//If there are data, create a hydrograph
				if (data.data != undefined) {
					$(tempIDhash).show();

					//create chart
					Highcharts.setOptions({ global: { useUTC: false } });
					$(tempIDhash).highcharts({
						chart: {
							type: 'line'
						},
						title: {
							text: "",
							align: 'left',
							style: {
								color: 'rgba(0,0,0,0.6)',
								fontSize: 'small',
								fontWeight: 'bold',
								fontFamily: 'Open Sans, sans-serif'
							}
							//text: null
						},
						exporting: {
							filename: 'FEV_NWIS_Site' + threeGraphs[streamGage].siteCode
						},
						credits: {
							enabled: false
						},
						xAxis: {
							type: "datetime",
							labels: {
								formatter: function () {
									return Highcharts.dateFormat('%d %b %y', this.value);
								},
								//rotation: -90,
								align: 'center'
							}
						},
						yAxis: {
							title: { text: 'Gage Height, feet' }
						},
						series: [{
							showInLegend: false,
							data: data.data[0].time_series_data,
							tooltip: {
								pointFormat: "Gage height: {point.y} feet"
							}
						}]
					});
				}
			});
			// at the last one start the next function
			if (loadmore === false) {
				if (streamGage == length.toString()) {
					//removing the graphs that are already loaded from master array
					allStreamGages.splice(0, 3);
					createDataArrays();
				}
			}
		}
		// removing the already displayed graphs so that they don't display again when user clicks 'load more' button
		allStreamGages.splice(0, 3);
		console.log('removing displayed graphs')
	}

	function createDataArrays() {
		createPeakLegend();
		// making sure real time sts aren't in the legend
		//$('#streamGageToggle').click();

		var peaksArray = [];
		var hwmArray = [];
		var coastalHWMs = []
		var riverineHWMs = [];
		var stArray = [];
		hydroUrls = [];
		var sitehwmTableData = [];
		var sitePeakTableData = [];
		var iPlength = identifiedPeaks.length;
		var ipCnt = 0;

		if (identifiedPeaks.length > 0) {
			identifiedPeaks.forEach(function (p) {
				ipCnt++;
				peaksArray.push(p.feature.properties);
				if (ipCnt === iPlength) {
					setupHWMS();
				}
			});
		} else {
			setupHWMS();
		}

		function setupHWMS() {
			if (identifiedMarks.length > 0) {
				var iHlength = identifiedMarks.length;
				var iHCnt = 0;
				identifiedMarks.forEach(function (p) {
					iHCnt++
					hwmArray.push(p.feature.properties);
					if (p.feature.properties.hwm_environment === "Coastal") {
						coastalHWMs.push(p.feature.properties);
					} else {
						riverineHWMs.push(p.feature.properties);
					}
					if (iHCnt === iHlength) {
						getStormTides();
					}
				});
			} else {
				getStormTides();
			}
		}

		function getStormTides() {
			if (identifiedST.length > 0) {
				var stlength = identifiedST.length;
				var stCnt = 0;
				identifiedST.forEach(function (st) {
					stCnt++;
					stArray.push(st.feature.properties);
					if (stCnt === stlength) {
						getStormTideFileImages();
					}
				});
			} else {
				getStormTideFileImages();
			}
		}


		// stormtide not currently used in report but may be if future development is wanted
		function getStormTideFileImages() {
			USGSrtGages.clearLayers();
			$("#stormTideHeader").addClass("no-data");
			if (identifiedST.length > 0) {
				stormTideNames = [];
				let result = peaksArray.map(a => ({ ...stArray.find(p => a.site_no === p.site_no), ...a }));
				result.forEach(function (st, idx) {
					if (st.instrument_id !== undefined) {
						var instrumentID = st.instrument_id;
						var url = "https://stn.wim.usgs.gov/STNServices/Instruments/" + instrumentID + "/Files.json";
						var data;

						$.ajax({
							url: url,
							dataType: 'json',
							data: data,
							headers: { 'Accept': '*/*' },
							success: function (data) {
								var hydrographURL = '';
								var containsHydrograph = false;
								var stormTideID = [];
								var stormIDCount = 0;
								var tempStormNames = [];
								//This loop will find the total number of graphs that will be displayed for the current sensor
								for (var i = 0; i < data.length; i++) {
									if (data[i].filetype_id === 13 && data[i].name != tempStormNames[tempStormNames.length - 1]) {
										stormIDCount += 1;
										tempStormNames.push(data[i].name);
									}
								}

								for (var i = 0; i < data.length; i++) {
									if (data[i].filetype_id === 13 && data[i].name != stormTideNames[stormTideNames.length - 1]) {
										stormTideID.push(data[i].site_id);
										$("#stormTideHeader").removeClass("no-data");
										hydrographURL = "https://stn.wim.usgs.gov/STNServices/Files/" + data[i].file_id + "/Item";
										//If only one graph will be displayed for the sensor, leave off "Graph X for ___"
										if (stormIDCount == 1) {
											$('#stgraphs').append('<div class="siteGraphDisplay"><span>' + st.site_no + '</span> <br>' + '<img style="height: 155px; width: 255px; border:1px solid #e1ebfc;" class="hydroImage' + st.site_no + '" style="cursor: pointer;" title="Click to enlarge" onclick="enlargeHydroImage(event)" src=' + hydrographURL + '\></div>');
											//hydrographElement = '<br><img title="Click to enlarge" style="cursor: pointer;" data-toggle="tooltip" class="hydroImage" onclick="enlargeImage()" src=' + hydrographURL + '\>'
										}
										//If more than one graph for the sensor, label it "Graph X for ____"
										if (stormIDCount > 1) {
											$('#stgraphs').append('<div class="siteGraphDisplay"><span>' + "Graph " + stormTideID.length + " for " + st.site_no + '</span> <br>' + '<img style="height: 155px; width: 255px; border:1px solid #e1ebfc;" class="hydroImage' + st.site_no + '" style="cursor: pointer;" title="Click to enlarge" onclick="enlargeHydroImage(event)" src=' + hydrographURL + '\></div>');
											//hydrographElement = '<br><img title="Click to enlarge" style="cursor: pointer;" data-toggle="tooltip" class="hydroImage" onclick="enlargeImage()" src=' + hydrographURL + '\>'
										}
										hydroUrls.push(hydrographURL);
										stormTideNames.push(data[i].name);
									}
								}
							},
							error: function (error) {
								console.log('Error processing the JSON. The error is:' + error);
							}
						});
					}
				});
			}

			setupPeakTable();

			if (currentParkOrRefuge != "") {
				$('#reportInfo').append("<div style='margin-left:15px; text-align: center; font-size: large;'>" + selectedEvent + "<br> </div><div style='text-align: center'>" + currentParkOrRefuge + ", " + selectedBuffer + " buffer" + "<br>" + "<div>");
			}
			/* if (currentParkOrRefuge == "") {
				$('#reportInfo').append("<div style='margin-left:15px; text-align: center; font-size: large;'>" + selectedEvent + "<div>");
			} */

			function setupPeakTable() {
				// if (sitePeakTableData > 0) {
				// 	//If peak table data does not clear from buffer, this will clear it now
				// 	sitePeakTableData.length = 0;
				// }

				// setting up peak data for table
				sitePeakTableData = [];
				for (var i in identifiedPeaks) {
					var peakEstimated = "";
					if (identifiedPeaks[i].feature.properties.is_peak_stage_estimated === 0) {
						peakEstimated = "no";
					} else {
						peakEstimated = "yes"
					}

					sitePeakTableData.push({
						"Site Number": identifiedPeaks[i].feature.properties.site_no,
						"Description": identifiedPeaks[i].feature.properties.description,
						"State": identifiedPeaks[i].feature.properties.state,
						"County": identifiedPeaks[i].feature.properties.county,
						"Peak Stage (ft)": identifiedPeaks[i].feature.properties.peak_stage,
						"Peak Date/Time": moment(identifiedPeaks[i].feature.properties.peak_date).format("MM/DD/YYYY, h:mm a"),
						"Peak Estimated": peakEstimated
					});
				}
				peaksCSVData = sitePeakTableData;
				reportData();
			}

			function reportData() {
				//These variables will have the heights/elevation for each peak/hwm in the buffered area
				var peakArrReport = [];
				var hwmArrReportCoastal = [];
				var hwmArrReportRiverine = [];

				//Getting the heights to populate arrays
				for (peak in identifiedPeaks) {
					if (identifiedPeaks[peak].feature.properties.peak_stage != undefined) {
						peakArrReport.push(identifiedPeaks[peak].feature.properties.peak_stage);
					}
				}
				seperateHWM();

				function seperateHWM() {
					for (hwm in identifiedMarks) {
						if (identifiedMarks[hwm].feature.properties.elev_ft != undefined) {
							if (identifiedMarks[hwm].feature.properties.hwm_environment === "Coastal") {
								hwmArrReportCoastal.push(identifiedMarks[hwm].feature.properties.elev_ft);
							} else {
								hwmArrReportRiverine.push(identifiedMarks[hwm].feature.properties.elev_ft);
							}
						}
					}
				}

				//setting up HWM data for table

				var hwmCaptionData = [];
				sitehwmTableData.length = 0;
				for (var i in identifiedMarks) {
					hwmCaptionData.push({
						"STN Site No.": identifiedMarks[i].feature.properties.site_no
					})
				}
				buildhwmTableData();
				hwmCSVData = sitehwmTableData;

				function buildhwmTableData() {
					//findUndefined(identifiedMarks[i].features.properties.site_no);
					for (var i in identifiedMarks) {
						sitehwmTableData.push({
							"STN Site No.": identifiedMarks[i].feature.properties.site_no,
							"HWM Label": identifiedMarks[i].feature.properties.hwm_label,
							"Elevation (ft)": identifiedMarks[i].feature.properties.elev_ft,
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
							"Latitude (DD)": identifiedMarks[i].feature.properties.latitude,
							"Longitude (DD)": identifiedMarks[i].feature.properties.longitude,
							"Site Description": identifiedMarks[i].feature.properties.siteDescription,
							"Location Description": identifiedMarks[i].feature.properties.hwm_locationdescription,
							"Survey Date/Time": moment(identifiedMarks[i].feature.properties.survey_date).format("MM/DD/YYYY, h:mm a"),
							"Bank": identifiedMarks[i].feature.properties.bank,
							"Environment": identifiedMarks[i].feature.properties.hwm_environment,
							"Flag Date": moment(identifiedMarks[i].feature.properties.flag_date).format("MM/DD/YYYY"),
							"Stillwater": identifiedMarks[i].feature.properties.stillwater,
							"Uncertainty": identifiedMarks[i].feature.properties.uncertainty,
							"HWM Uncertainty": identifiedMarks[i].feature.properties.hwm_uncertainty
						})
					}
				}

				//Display no data notice in report if there aren't any peaks or hwms
				if (peakArrReport == 0 && hwmArrReportCoastal == 0 && hwmArrReportRiverine == 0) {
					$('#summaryDataHeader').addClass("no-data");
				} else {
					// Else expand summary by default
					$("#summaryDataHeader").parent().toggleClass("expanded");
				}


				//Sort peak and hwm arrays
				peakArrReport = peakArrReport.sort(function (a, b) { return a - b });
				hwmArrReportCoastal = hwmArrReportCoastal.sort(function (a, b) { return a - b });
				hwmArrReportRiverine = hwmArrReportRiverine.sort(function (a, b) { return a - b });
				var sum = []
				var peakSum = {};
				var hwmSum = {};

				//variables for report summary table
				var meanReport;
				var minReport;
				var maxReport;
				var medianReport;
				var confIntNinetyHigh;
				var confIntNinetyLow;
				var numReport;
				var standReport;


				// removing any undefined values incase there are some
				peakArrReport = peakArrReport.filter(e => e);
				// Create peak row in report summary table
				getReportSummaryStats(peakArrReport);
				if (peakArrReport.length > 0) {
					// setting Max Date
					var maxDate = peaksArray.filter(x => x.peak_stage === maxReport);

					maxReport = maxReport.toFixed(2);
					maxReport = Number(maxReport);
					maxDate = moment(maxDate[0].peak_date).format("MM/DD/YYYY, h:mm a");
					peakSum = { "Type": "Peak", "Total Sites": numReport, "Max (ft)": maxReport, "Max Date/Time": maxDate, "Min (ft)": minReport, "Median (ft)": medianReport, "Mean (ft)": meanReport, "Standard Dev (ft)": standReport, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
					sum.push(peakSum);
				}

				// removing any undefined values incase there are some
				hwmArrReportCoastal = hwmArrReportCoastal.filter(e => e);
				hwmArrReportRiverine = hwmArrReportRiverine.filter(e => e);

				//Create hwm row in report summary table
				getReportSummaryStats(hwmArrReportCoastal);
				hwmSum = {};
				if (hwmArrReportCoastal.length > 0) {
					// setting Max Date
					var maxDate = coastalHWMs.filter(x => x.elev_ft === maxReport);
					maxReport = maxReport.toFixed(2);
					maxReport = Number(maxReport);

					maxDate = moment(maxDate[0].flag_date).format("MM/DD/YYYY, h:mm a");
					hwmSum = { "Type": "HWM - Coastal", "Total Sites": numReport, "Max (ft)": maxReport, "Max Date/Time": maxDate, "Min (ft)": minReport, "Median (ft)": medianReport, "Mean (ft)": meanReport, "Standard Dev (ft)": standReport, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
					sum.push(hwmSum);
				}

				getReportSummaryStats(hwmArrReportRiverine);
				hwmSum = {};
				if (hwmArrReportRiverine.length > 0) {

					// setting Max Date
					var maxDate = riverineHWMs.filter(x => x.elev_ft === maxReport);
					maxReport = maxReport.toFixed(2);
					maxReport = Number(maxReport);

					maxDate = moment(maxDate[0].flag_date).format("MM/DD/YYYY, h:mm a");
					hwmSum = { "Type": "HWM - Riverine", "Total Sites": numReport, "Max (ft)": maxReport, "Max Date/Time": maxDate, "Min (ft)": minReport, "Median (ft)": medianReport, "Mean (ft)": meanReport, "Standard Dev (ft)": standReport, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
					sum.push(hwmSum);
				}

				//Summary stats to populate report report summary table
				function getReportSummaryStats(dataArray) {
					meanReport = numbers.statistic.mean(dataArray);
					medianReport = numbers.statistic.median(dataArray);
					minReport = numbers.basic.min(dataArray);
					maxReport = numbers.basic.max(dataArray);
					numReport = dataArray.length;
					standReport = numbers.statistic.standardDev(dataArray);
					var confIntTemp = 1.645 * (standReport / Math.sqrt(numReport));
					confIntNinetyHigh = meanReport + confIntTemp;
					confIntNinetyLow = meanReport - confIntTemp;

					//Round Results
					meanReport = meanReport.toFixed(3);
					standReport = standReport.toFixed(3);
					medianReport = medianReport.toFixed(3);
					minReport = minReport.toFixed(2);
					minReport = Number(minReport);
					/* maxReport = maxReport.toFixed(2);
					maxReport = Number(maxReport); */
					confIntNinetyHigh = confIntNinetyHigh.toFixed(3);
					confIntNinetyLow = confIntNinetyLow.toFixed(3);
				}



				//If the report summary has data, display title and build table
				if (sum.length > 0) {
					$('#reportSummaryTitle').children().remove();
					buildRegionalDataTables('#reportSummaryTitle', "#reportSummaryDataTable", sum, "<br><br>" + currentParkOrRefuge + " Summary for " + selectedEvent);
				}

				//If report summary does not have data, make sure old table does not display 
				//(if the map refresh on close is still used, that should take care of it too)
				if (sum.length == 0) {
					$('#reportSummaryTitle').children().remove();
				}

				if (sitePeakTableData.length > 0) {
					buildHtmlTable();
				} else {
					$("#peakTable").find("p").remove();
					$("#peakDataTable").empty();
					$("#peakDataHeader").addClass("no-data");
					setTimeout(() => {

						// are we missing thte disclaimer?
						$("#peakTable").prepend("<p>" + "<b>" + "<br>" + 'Peak Data Measured in Feet Above NAVD88 Calculated for each Monitoring Site within the ' + currentParkOrRefuge + ' Boundary for ' + selectedEvent + "</b>" + "</p>");
						$("#peakTable").append("<p>" + "There are no Peaks at this Site." + "</p>");
					}, 3000);
				}

				// Builds the HTML Table for peaks
				function buildHtmlTable() {
					//Empty text from previous report, if it was run
					$("#peakTable").find("p").remove();
					$("#peakTable").prepend("<p>" + "<b>" + "<br>" + 'Peak Data Measured in Feet Above NAVD88 Calculated for each Monitoring Site within the ' + currentParkOrRefuge + ' Boundary for ' + selectedEvent + "</b>" + "</p>")

					//Empty peak data table from previous report, if it was run
					$("#peakDataTable").empty();

					var columns = addAllColumnHeaders(sitePeakTableData);

					for (var i = 0; i < sitePeakTableData.length; i++) {
						var row$ = $('<tr/>');
						for (var colIndex = 0; colIndex < columns.length; colIndex++) {
							var cellValue = sitePeakTableData[i][columns[colIndex]];

							if (cellValue == null) { cellValue = ""; }

							row$.append($('<td/>').html(cellValue));
						}
						$("#peakDataTable").append(row$);
					}
				}

				// Builds the HTML Table
				function buildRegionalDataTables(title, table, data, type) {
					$(title).append(type);
					var columns = addAllDataColumnHeaders(table, data);

					for (var i = 0; i < data.length; i++) {
						var row$ = $('<tr/>');
						for (var colIndex = 0; colIndex < columns.length; colIndex++) {
							var cellValue = data[i][columns[colIndex]];

							if (cellValue == null) { cellValue = ""; }

							row$.append($('<td/>').html(cellValue));
						}
						$(table).append(row$);
					}
				}
				function addAllDataColumnHeaders(table, data) {
					var columnSet = [];
					var headerTr$ = $('<tr/>');

					for (var i = 0; i < data.length; i++) {
						var rowHash = data[i];
						for (var key in rowHash) {
							if ($.inArray(key, columnSet) == -1) {
								columnSet.push(key);
								headerTr$.append($('<th/>').html(key));
							}
						}
					}
					$(table).append(headerTr$);
					return columnSet;
				}
				function addAllColumnHeaders(sitePeakTableData) {
					var columnSet = [];
					var headerTr$ = $('<tr/>');

					for (var i = 0; i < sitePeakTableData.length; i++) {
						var rowHash = sitePeakTableData[i];
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

				//console.log("sitehwmTableData", hwmCSVData);
				//console.log("length of hwm data", hwmCSVData.length);

				/* //Messing around with taking chunks of the table data... 
				$.each(sitehwmTableData, function (index, value) {
					//console.log(value)
					var chunkSize = 11;
					for (var cols = Object.entries(value); cols.length;)
						chunks.push(cols.splice(0, chunkSize).reduce((o, [k, v]) => (o[k] = v, o), {}));
					//console.log(chunks);
				});
				//$.each(chunks, function(index, value) {}); */

				//builds HTML Table for HWMs
				function buildHwmHtmlTable() {
					//Empty text from previous report, if was run
					$("#hwmTable").find("p").remove();
					$("#hwmTable").prepend("<p>" + "<b>" + "<br>" + 'High Water Mark data Measured in Feet Above NAVD88 Datum within the ' + bufferSize + ' km buffer of ' + currentParkOrRefuge + ' for ' + selectedEvent + "</b>" + "</p>")

					//Empty hwm data table from previous report, if it was run
					$("#hwmDataTable").empty();

					var columns = addHwmColumnHeaders(sitehwmTableData);

					for (var i = 0; i < sitehwmTableData.length; i++) {
						var row$ = $('<tr/>');
						for (var colIndex = 0; colIndex < columns.length; colIndex++) {
							var cellValue = sitehwmTableData[i][columns[colIndex]];
							if (cellValue == null) { cellValue = ""; }
							row$.append($('<td/>').html(cellValue));
						}
						$("#hwmDataTable").append(row$);
					}
				}

				function addHwmColumnHeaders(sitehwmTableData) {
					var columnSet = [];
					var headerTr$ = $('<tr/>');

					for (var i = 0; i < sitehwmTableData.length; i++) {
						var rowHash = sitehwmTableData[i];
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

				if (sitehwmTableData.length > 0) {
					buildHwmHtmlTable();
				} else {
					$("#hwmTable").find("p").remove();
					$("#hwmDataTable").empty();
					$("#hwmDataHeader").addClass("no-data");
					setTimeout(() => {
						$("#hwmTable").prepend("<p>" + "<b>" + 'High Water Mark data Measured in Feet Above NAVD88 Datum within the ' + bufferSize + ' km buffer of ' + currentParkOrRefuge + ' for ' + selectedEvent + "</b>" + "</p>");
					}, 3000);
				}

			}

			// catching the last callback
			//Add filter information to top of report
			/* if (currentParkOrRefuge != "") {
				$('#reportInfo').append("<div style='margin-left:15px; text-align: center; font-size: large;'>" + selectedEvent + "<br> </div><div style='text-align: center'>" + currentParkOrRefuge + ", " + selectedBuffer + " buffer" + "<br>" + "<div>");
			}
			if (currentParkOrRefuge == "") {
				$('#reportInfo').append("<div style='margin-left:15px; text-align: center; font-size: large;'>" + selectedEvent + "<div>");
			} */


			$("#reportFooter").hide();

			var mapPreview = document.getElementById('reviewMap');

			// making sure usgsrtgages are cleared from the map
			USGSrtGages.clearLayers(map);

			function getMapImage() {
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
				setTimeout(() => {
					html2canvas(document.getElementById('mapDiv'), options)
					.then(function (canvas) {
						$("#reviewMap").find("canvas").remove()
						mapEvent = new Event('map_ready');
						/* canvas[0].drawImage */
						canvas.style.width = '600px';
						canvas.style.height = '450px';
						mapPreview.append(canvas);
						//mapImage = canvas.get(0).toDataUrl('image/png');
						pdfMapUrl = canvas.toDataURL('image/png');
						window.dispatchEvent(mapEvent);
						// Showing Legend once canvas event complete
						$("#legendElement").show();
						removeLoader();
						disableButtons();

						// enabling the download buttons for the site report
						$('#print').removeAttr('disabled');
						$('#savePeakCSV').removeAttr('disabled');
						$('#saveHWMCSV').removeAttr('disabled');
					}
					);
				}, 500);
				
			}
			// Get legend for print preview
			function captureLegendImg() {
				html2canvas(document.getElementById('legendDiv'))
					.then(function (canvas) {
						$("#legendImage").find("canvas").remove()
						legendPreview.append(canvas);
						legendUrl = canvas.toDataURL('image/png');
						getMapImage();
					}
					);
			}
			var legendPreview = document.getElementById('legendImage');
			captureLegendImg();

			function removeLoader() {
				document.getElementById('reportLoader').remove();
				console.log("REMOVED LOADER");
			}

			function disableButtons() {
				$("#reportFooter").show();

				//disable csv and print buttons if there are not data
				if (hwmCSVData.length == 0) {
					document.getElementById("saveHWMCSV").disabled = true;
				}
				if (peaksCSVData.length == 0) {
					document.getElementById("savePeakCSV").disabled = true;
				}
				// If there is no data, then printing will be disabled.
				console.log(sitehwmTableData.length);
				console.log(sitePeakTableData.length);
				if ((sitehwmTableData.length === 0) && (sitePeakTableData.length === 0)) {
					document.getElementById("print").disabled = true;
					//$('#print').attr('disabled', true);
				} else {
					document.getElementById("print").disabled = false;
				}
			}



		}

	}
};

function showPrintModal() {

	$('#printModal').modal('show');

	/* setTimeout(() => {
		reviewMap = L.map('reviewMap').setView([39.833333, -98.583333], 4);
		L.esri.basemapLayer('Topographic').addTo(reviewMap);
	}, 500); */
}

function enlargeImage() {
	$('.imagepreview').attr('src', $('.hydroImage').attr('src'));
	$('#imagemodal').modal('show');
}
function enlargeHydroImage(event) {
	var image = "." + event.currentTarget.className;
	$('.imagepreview').attr('src', $(image).attr('src'));
	$('#imagemodal').modal('show');
}