var stnServicesURL = 'http://stn.wim.usgs.gov/STNServices';
var stnServicesTestURL = 'http://stntest.wim.usgs.gov/STNServices2';
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
			xmlPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.xml',
			jsonPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.json',
			csvPeaksURLRoot : stnServicesURL + '/PeakSummaries/FilteredPeaks.csv',	
			baroGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=baro_view&',
			metGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=met_view&',
			rdgGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=rdg_view&',
			stormTideGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=stormtide_view&',
			waveHeightGeoJSONViewURL: stnServicesURL + '/SensorViews.geojson?ViewType=waveheight_view&',
			hwmFilteredGeoJSONViewURL: stnServicesURL + '/HWMs/FilteredHWMs.geojson',
			hwmGeoJSONViewURL: stnServicesURL + '/hwms.geojson'
		},
		queryStrings: {
		}
};
var map;
var layerGroup;
var markerCoords = [];
var baroMarkerIcon = L.divIcon({className: 'baroMarker'});
var metMarkerIcon = L.divIcon({className: 'metMarker'});
var rdgMarkerIcon = L.divIcon({className: 'rdgMarker'});
var stormTideMarkerIcon = L.divIcon({className: 'stormTideMarker'});
var waveHeightMarkerIcon = L.divIcon({className: 'waveHeightMarker'});
var hwmMarkerIcon = L.divIcon({className: 'hwmMarker'});
var peaksMarkerIcon = L.divIcon({className: 'hwmMarker'});

//ajax retrieval function
function displayGeoJSON(url, markerIcon) {
	$.ajax({
		dataType: 'json',
		url: url,
		success: function(data) {
			if (!data || data.length === 0) {return;}
			console.log( data.features.length + ' ' + markerIcon.options.className + ' GeoJSON features found');
			var geoJSONlayer = L.geoJson(data, {
				pointToLayer: function (feature, latlng) {
					//markerCoords.push(latlng);
					return L.marker(latlng, {icon: markerIcon});
				},
				onEachFeature: function (feature, layer) {
					layer.bindPopup('<b>Site Number: </b>' + feature.properties.site_no);
				}
			});
			layerGroup.addLayer(geoJSONlayer);
		}
	}).error(function() {console.error('There was an error retrieving GeoJSON data')});
}

//main document ready function
$( document ).ready(function() {
	//for jshint
	'use strict';
	/* create map */
	map = L.map('mapDiv').setView([39.833333, -98.583333], 4);
	var layer = L.esri.basemapLayer('Gray').addTo(map);
	var layerLabels;
	layerGroup = L.markerClusterGroup({
		//options here
			disableClusteringAtZoom: 10
		}).addTo(map);

	$('#mapDiv').height($('body').height());
	//map.invalidateSize();
	/* create map */

	//initially full GeoJSON display loop
	$.each([ 'baro','met','rdg','stormTide','waveHeight', 'hwm'], function( index, value ) {
		displayGeoJSON(fev.urls[value + 'GeoJSONViewURL'], window[value + 'MarkerIcon']);
	});

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
	// $('#peakDatePicker').datepicker({
	// 	format: 'mm/dd/yyyy',
	// 	autoclose: true,
	// 	endDate: 'today',
	// 	startView: 1,
	// 	startView: 1,
	// 	todayBtn: true,
	// 	multidate: false,
	// 	clearBtn: true
	// });

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
	$('#btnFilters').click(function(){
		showFiltersModal();
	});

	$('#btnFilter').on('click', function() {
		buildQueryStrings();
	});

	/* basemap controller */
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
  	/* basemap controller */

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

	//end latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////

});