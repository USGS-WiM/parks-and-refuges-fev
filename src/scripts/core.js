var stnServicesURL = "http://stn.wim.usgs.gov/STNServices";
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
			jsonSensorsURLRoot : stnServicesURL + "/Instruments.json",
			xmlSensorsURLRoot: stnServicesURL + "/Instruments.xml",
			csvSensorsURLRoot : stnServicesURL + "/Instruments.csv",
			jsonHWMsURLRoot : stnServicesURL + "/HWMs/FilteredHWMs.json",
			xmlHWMsURLRoot : stnServicesURL + "/HWMs/FilteredHWMs.xml",
			csvHWMsURLRoot : stnServicesURL + "/HWMs/FilteredHWMs.csv",
			xmlPeaksURLRoot : stnServicesURL + "/PeakSummaries/FilteredPeaks.xml",
			jsonPeaksURLRoot : stnServicesURL + "/PeakSummaries/FilteredPeaks.json",
			csvPeaksURLRoot : stnServicesURL + "/PeakSummaries/FilteredPeaks.csv",	
			baroGeoJSONViewURL: "http://stntest.wim.usgs.gov/STNServices2/SensorViews.geojson?ViewType=baro_view&",
			metGeoJSONViewURL: "http://stntest.wim.usgs.gov/STNServices2/SensorViews.geojson?ViewType=met_view&",
			rdgGeoJSONViewURL: "http://stntest.wim.usgs.gov/STNServices2/SensorViews.geojson?ViewType=rdg_view&",
			stormTideGeoJSONViewURL: "http://stntest.wim.usgs.gov/STNServices2/SensorViews.geojson?ViewType=stormtide_view&",
			waveHeightGeoJSONViewURL: "http://stntest.wim.usgs.gov/STNServices2/SensorViews.geojson?ViewType=waveheight_view&"
		},
		queryStrings: {
		}
};
var map;

//main document ready function
$( document ).ready(function() {
	//for jshint
	'use strict';
	/* create map */
	map = L.map('mapDiv').setView([39.833333, -98.583333], 4);
	var layer = L.esri.basemapLayer('Gray').addTo(map);
	var layerLabels;

	$('#mapDiv').height($('body').height());
	map.invalidateSize();
	/* create map */

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
	// 	endDate: "today",
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


	// var populateCountiesArray =  function  () {
	// 	for (var i=0; i<fev.data.states.length; i++) {
	// 		$.ajax({
	// 			dataType: 'json',
	// 			type: 'GET',
	// 			url: "http://stn.wim.usgs.gov/STNServices/Sites/CountiesByState.json?StateAbbrev=" + fev.data.states[i].state_abbrev ,
	// 			headers: {'Accept': '*/*'},
	// 			currentState: fev.data.states[i].state_abbrev,
	// 			success: function (data)  {
	// 				fev.data.counties[(this.currentState)] = data;
	// 			},
	// 			error: function (error) {
	// 				console.log("Error retrieving counties. The error is: " + error);
	// 			}
	// 		});
	// 	}
	// 	setTimeout(function (){
	// 		console.log(fev.data.counties);
	// 	}, 300);
	// };
	//getLocation();
	/* parse layers.js */
	//create global layers lookup
	var mapLayers = [];

	// $.each(allLayers, function (index,group) {
	// 	console.log('processing: ', group.groupHeading)
    //
	// 	//sub-loop over layers within this groupType
	// 	$.each(group.layers, function (layerName,layerDetails) {
    //
	// 		//check for exclusiveGroup for this layer
	// 		var exclusiveGroupName = '';
	// 		if (layerDetails.wimOptions.exclusiveGroupName) {
	// 			exclusiveGroupName = layerDetails.wimOptions.exclusiveGroupName;
	// 		}
    //
	// 		if (layerDetails.wimOptions.layerType === 'agisFeature') {
	// 			var layer = L.esri.featureLayer(layerDetails.url);
	// 			addLayer(group.groupHeading, group.showGroupHeading, layer, layerName, exclusiveGroupName);
	// 			addMapServerLegend(layerName, layerDetails);
	// 		}
    //
	// 		else if (layerDetails.wimOptions.layerType === 'agisWMS') {
	// 			var layer = L.tileLayer.wms(layerDetails.url, layerDetails.options).addTo(map);
	// 			addLayer(group.groupHeading, group.showGroupHeading, layer, layerName, exclusiveGroupName);
	// 			addMapServerLegend(layerName, layerDetails);
	// 		}
    //
	// 		else if (layerDetails.wimOptions.layerType === 'agisDynamic') {
	// 			var layer = new L.esri.Layers.DynamicMapLayer(layerDetails.url, layerDetails.options).addTo(map);
	// 			addLayer(group.groupHeading, group.showGroupHeading, layer, layerName, exclusiveGroupName);
	// 			addMapServerLegend(layerName, layerDetails);
	// 		}
	//     });
	// });

	function getLocation() {

		$.ajax({
			dataType: "jsonp",
			url: "http://freegeoip.net/json/",
			error: function (jqXHR, textStatus, errorThrown) {
				console.log("IP Geolocation Error: ", textStatus);

				//if timeout, do this
				if (textStatus == 'timeout') {
					//ZoomManager(0);
				}
			},
			success: function (data) {
				console.log("IP Geolocation Success: ", data);

				//zoom to location
				map.setView([data.latitude, data.longitude], 9)
			},
			timeout: 3000
		});
	}

	function addLayer(groupHeading, showGroupHeading, layer, layerName, exclusiveGroupName) {

		//add layer to map
		layer.addTo(map);

		//add layer to layer list
		mapLayers.push([exclusiveGroupName,camelize(layerName),layer]);
		
		//check if its an exclusiveGroup item
		if (exclusiveGroupName) {

			//create radio button
			var button = $('<input type="radio" name="' + camelize(exclusiveGroupName) + '" value="' + camelize(layerName) + '"checked>' + layerName + '</input></br>');

			//click listener for radio button
		    button.click(function(e) {

		    	var newLayer = $(this).val();

			    $.each(mapLayers, function () {

			    	if (this[0] == exclusiveGroupName) {
			    		if (this[1] == newLayer) {
				    		console.log('adding layer: ',this[1]);
				    		map.addLayer(this[2]);
				    		$('#' + camelize(this[1])).toggle();
				    	}
				    	else {
				    		if (map.hasLayer(this[2])) {
				    			console.log('removing layer: ',this[1]);
				    			map.removeLayer(this[2]);
				    			//$('#' + camelize(this[1])).toggle();
				    		}
				    	}
			    	}
			    });
			});
		}

		//not an eclusive group item
		else {

			//create layer toggle
			var button = $('<div align="left" style="cursor: pointer;padding:5px;"><span class="glyphspan glyphicon glyphicon-ok"></span>&nbsp;&nbsp;' + layerName + '</div>');

			//click listener for regular button
		    button.click(function(e) {

		    	//toggle checkmark
		    	$(this).find('span.glyphspan').toggleClass('glyphicon glyphicon-ok');

				e.preventDefault();
		        e.stopPropagation();

		        $('#' + camelize(layerName)).toggle();

		        //layer toggle
		        if (map.hasLayer(layer)) {
		            map.removeLayer(layer);
		        } else {
		            map.addLayer(layer);
		        }
			});
		}

	    //group heading logic
		if (showGroupHeading) {

			//camelize it for divID
			var groupDivID = camelize(groupHeading);

			//check to see if this group already exists
			if (!$('#' + groupDivID).length) {
				//if it doesn't add the header
				var groupDiv = $('<div id="' + groupDivID + '"><div class="alert alert-info" role="alert"><strong>' + groupHeading + '</strong></div></div>');
				$('#toggle').append(groupDiv);
			}

			//if it does already exist, append to it
			$('#' + groupDivID).append(button);
		}

		else {
			//otherwise append
			$('#toggle').append(button);
		}	
	}

	function camelize(str) {
	  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
	    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
	  }).replace(/\s+/g, '');
	}

	//get visible and non visible layer lists
	function addMapServerLegend(layerName, layerDetails) {


		if (layerDetails.wimOptions.layerType === 'agisFeature') {	

			//for feature layer since default icon is used, put that in legend
			var legendItem = $('<div align="left" id="' + camelize(layerName) + '"><img alt="Legend Swatch" src="https://raw.githubusercontent.com/Leaflet/Leaflet/master/dist/images/marker-icon.png" /><strong>&nbsp;&nbsp;' + layerName + '</strong></br></div>');
			$('#legendDiv').append(legendItem);
			
		}

		else if (layerDetails.wimOptions.layerType === 'agisWMS') {

			//for WMS layers, for now just add layer title
			var legendItem = $('<div align="left" id="' + camelize(layerName) + '"><img alt="Legend Swatch" src="http://placehold.it/25x41" /><strong>&nbsp;&nbsp;' + layerName + '</strong></br></div>');
			$('#legendDiv').append(legendItem);

		}

		else if (layerDetails.wimOptions.layerType === 'agisDynamic') {

			//create new legend div
        	var legendItemDiv = $('<div align="left" id="' + camelize(layerName) + '"><strong>&nbsp;&nbsp;' + layerName + '</strong></br></div>');      
        	$('#legendDiv').append(legendItemDiv);

			//get legend REST endpoint for swatch
	        $.getJSON(layerDetails.url + '/legend?f=json', function (legendResponse) {

	        	console.log(layerName,'legendResponse',legendResponse);

	        	

	        	//make list of layers for legend
				if (layerDetails.options.layers) {
					//console.log(layerName, 'has visisble layers property')
					//if there is a layers option included, use that
					var visibleLayers = layerDetails.options.layers;
				}
				else {
					//console.log(layerName, 'no visible layers property',  legendResponse)
					
					//create visibleLayers array with everything
					var visibleLayers = [];
					$.grep(legendResponse.layers, function(i,v) {
					  	visibleLayers.push(v);
					});
				}

	            //loop over all map service layers
	            $.each(legendResponse.layers, function (i, legendLayer) {

	            	//var legendHeader = $('<strong>&nbsp;&nbsp;' + legendLayer.layerName + '</strong>');
	            	//$('#' + camelize(layerName)).append(legendHeader);

	            	//sub-loop over visible layers property
	           		$.each(visibleLayers, function (i, visibleLayer) {

	           			//console.log(layerName, 'visibleLayer',  visibleLayer);

		        		if (visibleLayer == legendLayer.layerId) {

		        			console.log(layerName, visibleLayer,legendLayer.layerId, legendLayer)

		        			//console.log($('#' + camelize(layerName)).find('<strong>&nbsp;&nbsp;' + legendLayer.layerName + '</strong></br>'))

		        			var legendHeader = $('<strong>&nbsp;&nbsp;' + legendLayer.layerName + '</strong></br>');
	        				$('#' + camelize(layerName)).append(legendHeader);

		        			//get legend object
			                var feature = legendLayer.legend;
			            /*
			                //build legend html for categorized feautres
			                if (feature.length > 1) {
			             */

			                	//placeholder icon
			                	//<img alt="Legend Swatch" src="http://placehold.it/25x41" />

			                    $.each(feature, function () {

			                    	//make sure there is a legend swatch
			                    	if (this.imageData) {
				                        var legendFeature = $('<img alt="Legend Swatch" src="data:image/png;base64,' + this.imageData + '" /><small>' + this.label.replace('<', '').replace('>', '') + '</small></br>');

				                        $('#' + camelize(layerName)).append(legendFeature);
				                    }
			                    });
			             /*
			                }
			                //single features
			                else {
			                	var legendFeature = $('<img alt="Legend Swatch" src="data:image/png;base64,' + feature[0].imageData + '" /><small>&nbsp;&nbsp;' + legendLayer.layerName + '</small></br>');

			                	//$('#legendDiv').append(legendItem);
			                	$('#' + camelize(layerName)).append(legendFeature);
		
			                }
			             */
		        		}
		            }); //each visible layer
	            }); //each legend item
	        }); //get legend json
		}	
	}
	/* parse layers.js */

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
/*
	$('#geosearchNav').click(function(){
		$.noConflict()
		$('#geosearchModal').modal('show');
	});

	search_api.on('load', function() {
	    search_api.setOpts({
	        'textboxPosition' : 'user-defined'
	    });
    });
*/
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
	//map.on( "load", function() {
	map.whenReady( function() {
		var mapScale =  scaleLookup(map.getZoom());
		$('#scale')[0].innerHTML = mapScale;
		console.log('Initial Map scale registered as ' + mapScale, map.getZoom());

		var initMapCenter = map.getCenter();
		$('#latitude').html(initMapCenter.lat.toFixed(4));
		$('#longitude').html(initMapCenter.lng.toFixed(4));
	});

//displays map scale on scale change (i.e. zoom level)
	map.on( "zoomend", function () {
		var mapZoom = map.getZoom();
		var mapScale = scaleLookup(mapZoom);
		$('#scale')[0].innerHTML = mapScale;
	});

//updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes "map center" label
	map.on( "mousemove", function (cursorPosition) {
		$('#mapCenterLabel').css("display", "none");
		if (cursorPosition.latlng !== null) {
			$('#latitude').html(cursorPosition.latlng.lat.toFixed(4));
			$('#longitude').html(cursorPosition.latlng.lng.toFixed(4));
		}
	});
//updates lat/lng indicator to map center after pan and shows "map center" label.
	map.on( "dragend", function () {
		//displays latitude and longitude of map center
		$('#mapCenterLabel').css("display", "inline");
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