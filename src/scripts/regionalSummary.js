// setting global variables for the regional summary
var regionalMap;
var regionPoly = [];
var selectedRegion = "";
var selectedEvents = [];
var regionPoly = [];
var parksInRegion = [];
var regionBoundaries;
var flattenedRegionalPoly;
var regionLayerGroup = L.layerGroup();
var regionParksLayerGroup = L.layerGroup();
var where = "";
var identifiedParks = [];
var peaksWithinBuffer = L.layerGroup();
var bufferedPolys = [];
var unbufferedPolys = [];
var bufferSize;

var regionalPeak = L.layerGroup();
var parkPeaks = L.layerGroup();
var regionalPeakMarkerIcon = L.icon({ className: 'peakMarker', iconUrl: 'images/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });

var peakTableData = [];
var hwmTableData = [];
var sensorTableData = [];

// URLS
var eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
var parksURL = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=";
var peaksURL = "https://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json?Event=";

$(document).ready(function () {


    $('#regionalReportNav').click(function () {

        // for some reason map loading incompletely without timeout
        setTimeout(() => {
            regionalMap = L.map('regionalMap', {
                maxZoom: 15,
                zoomControl: false
            }).setView([39.833333, -98.583333], 3);

            var layerfel = L.esri.basemapLayer('Topographic').addTo(regionalMap);
        }, 600);



        // checking for region entry when region input is changed
        $('#regionSelect_regionalModal').change(function () {


            // if it has a value, we query to get the region geometry
            if (($('#regionSelect_regionalModal').val()) !== null) {

            } else {

            }
        });



    });



    $('#btnSubmitSelections').click(function () {
        var maxPeakStage;
        var minPeakStage;

        // setting buffer style
		var bufferStyle = {
			"color": "#0000cc",
			"fillOpacity": 0,
			"opacity": 0.65,
			"weight": 2
		};

		// setting park style
		var parkStyle = {
			"color": "#0000cc",
			"weight": 2,
			"opacity": 100
        };
        
        var regionStyle = {
            "color": "#9933ff",
            "weight": 2,
            "opacity": 100,
            "fillOpacity": 0
        };

        // getting array of selected events
        selectedEvents = $('#evtSelect_regionalModal').val();

        // setting buffer size
        bufferSize = $('#bufferSelect_regionalModal').val();

        // getting the geometry for the selected region
        where = "REG_NUM=" + selectedRegion,
            selectedRegion = $('#regionSelect_regionalModal').val();

        regionBoundaries = L.esri.featureLayer({
            useCors: false,
            url: 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0',
            where: "REG_NUM=" + selectedRegion,
            style: regionStyle,
            onEachFeature: function (feature, latlng) {
                regionPoly = feature.geometry;
                flattenedRegionalPoly = turf.flatten(regionPoly);
            }
        }).addTo(regionalMap);
        //regionalMap.fitBounds(regionPoly);
        regionLayerGroup.addLayer(regionBoundaries);



        setTimeout(() => {
            // Identify parks/refuges in event in regions
            var allParks;

            allParks = L.esri.featureLayer({
                // useCors: false,
                url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2',
                where: "1=1",
                fields: ["*"]
            });

            // lopping through each poly of the regional poly since esri-leaflet can't handle multipolygons at the version we're at

            function myFunction(item, index) {
                document.getElementById("demo").innerHTML += index + ":" + item + "<br>";
            }

            for (var p = 0; p < flattenedRegionalPoly.features.length; p++) {
                allParks.query()
                    .within(flattenedRegionalPoly.features[p])
                    .run(function (error, featureCollection, response) {
                        if (featureCollection.features.length !== 0) {
                            regionParksFC = featureCollection;
                            L.geoJson(regionParksFC, {style: parkStyle}).addTo(regionalMap);
                            getbuffers();
                        }
                    });
                //regionParksLayerGroup.addLayer(identifiedParks);
            }

            // optional, slightly faster route for region/parks query. uses region property in esri service, jot the doi region
            /* var regionParksFC;
            allParks.query()
                .where("REGION='SE'")
                .run(function (error, featureCollection, response) {
                    regionParksFC = featureCollection;
                    getbuffers();
                }); */

            function getbuffers() {
                if (regionParksFC !== undefined) {
                    for (var p = 0; p < regionParksFC.features.length; p++) {
                        var options = { tolerance: 0.01, highQuality: false };
                        var simplified = turf.simplify(regionParksFC.features[p], options);
                        var buffered = turf.buffer(simplified, bufferSize, { units: 'kilometers' });
                        bufferedPolys.push(buffered);
                    }
                    console.log('buffered polys' + bufferedPolys);
                    L.geoJson(bufferedPolys, {style: bufferStyle}).addTo(regionalMap);
                    getEventSpecificData();
                }

            }

            function getEventSpecificData() {
                for (var e = 0; e < selectedEvents.length; e++) {
                    // Getting event name

                    // resetting event url
                    var eventName;
                    eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                    eventURL = eventURL + selectedEvents[e] + '.json';
                    parksInEvent = [];
                    var peaksQueryString = "?Event=" + selectedEvents[e] + "&States=&County=&StartDate=undefined&EndDate=undefined";

                    getEventName(function (output) {
                        eventName = output.event_name;
                    });

                    // fucntion 
                    function getEventName(handleData) {
                        var data;
                        $.ajax({
                            dataType: "json",
                            url: eventURL,
                            data: data,
                            success: function (data) {
                                handleData(data)
                            },
                            error: function (error) {
                                console.log('Error processing the JSON. The error is:' + error);
                            }
                        });
                    }

                    getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + peaksQueryString, regionalPeakMarkerIcon);

                    // PEAKS

                    // resetting peak url
                    /* peaksURL = "https://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json?Event=";
                    peaksURL = peaksURL + selectedEvents[i];
     
                    getData(function (output) {
     
                        // find min/max peak stage values
                        maxPeakStage = Math.max.apply(Math, output.map(function (o) { return o.peak_stage; }));
                        minPeakStage = Math.min.apply(Math, output.map(function (o) { return o.peak_stage; }));
                        console.log('output:', output);
                    });
     
                    // function 
                    function getData(handleData) {
                        var data;
                        $.ajax({
                            dataType: "json",
                            url: peaksURL,
                            async: false,
                            data: data,
                            success: function (data) {
                                handleData(data)
                            },
                            error: function (error) {
                                console.log('Error processing the JSON. The error is:' + error);
                            }
                        });
                    } */


                    // HWMS

                    // SENSORS & INSTRUMENTS

                    // regionalMap.removeLayer(regionBoundaries);
                }
            }
            // looping through each event select and getting sensor data
        }, 600);


        function getPeaks(url, markerIcon) {
            //increment layerCount
            layerCount++;
            //var maxPeak = Math.max(feature.properties.peak_stage);
            regionalPeak.clearLayers();
            var currentMarker = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("Peak: " + feature.properties.peak_stage.toString());
                    return marker;
                },

                /* onEachFeature: function (feature, latlng) {
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                } */

            });
            //currentMarker.bindPopup("water").openPopup();
            //currentMarker.bindToolTip("peakflow");
            //map.openPopup("Peak");


            $.getJSON(url, function (data) {

                if (data.length == 0) {
                    console.log('0 ' + markerIcon.options.className + ' GeoJSON features found');
                    return
                }
                if (data.features.length > 0) {
                    console.log(data.features.length + ' ' + markerIcon.options.className + ' GeoJSON features found');
                    //check for bad lat/lon values
                    for (var i = data.features.length - 1; i >= 0; i--) {
                        //check that lat/lng are not NaN
                        if (isNaN(data.features[i].geometry.coordinates[0]) || isNaN(data.features[i].geometry.coordinates[1])) {
                            console.error("Bad latitude or latitude value for point: ", data.features[i]);
                            //remove it from array
                            data.features.splice(i, 1);
                        }
                        //check that lat/lng are within the US and also not 0
                        if (fev.vars.extentSouth <= data.features[i].geometry.coordinates[0] <= fev.vars.extentNorth && fev.vars.extentWest <= data.features[i].geometry.coordinates[1] <= fev.vars.extentEast || data.features[i].geometry.coordinates[0] == 0 || data.features[i].geometry.coordinates[1] == 0) {
                            console.error("Bad latitude or latitude value for point: ", data.features[i]);
                            //remove it from array
                            data.features.splice(i, 1);
                        }
                    }
                    currentMarker.addData(data);
                    currentMarker.eachLayer(function (layer) {
                        layer.addTo(regionalPeak);
                    });
                    //regionalPeak.addTo(regionalMap);
                    //checkLayerCount(layerCount);

                    // function to get only peaks within park buffer
                    setTimeout(() => {
                        for (var p = 0; p < bufferedPolys.length; p++) {
                            var buffer = bufferedPolys[p];

                            // check incase there are any multipolys and convert them to simple polys
                            if (buffer.geometry.type === "MultiPolygon") {
                                var feat;

                                buffer.geometry.coordinates.forEach(function(coords){
                                   feat={'type':'Polygon','coordinates':coords};
                                   if (feat !== undefined) {
                                    var isItInside = turf.booleanPointInPolygon(cords, feat, { ignoreBoundary: true });
                                    console.log(isItInside);
                                    // if true add it to an array containing all the 'true' regionalPeak
                                    if (isItInside) {
                                        //peaksWithinBuffer.push(regionalPeak._layers[i]);
                                        regionalPeak._layers[i].addTo(peaksWithinBuffer);
                                    }
                                 }
                                    }
                                 );
                                
                                 
                                 

                                /* var polysCount = buffer.geometry.coordinates.length;
                                for (var poly = 0; poly < buffer.geometry.coordinates.length; poly++) {
                                    // not cycling through if we're on the last one
                                    if (poly === (polysCount - 1)) {

                                    } else {
                                        // getting the index of the next feature to use in the union
                                        var nextFeatureIndex = poly + 1;
                                        var nextFeature = buffer.geometry.coordinates[nextFeatureIndex];

                                        // unifying or merging the buffer
                                        buffer = turf.union(buffer, nextFeature);
                                    }

                                } */
                            }
                            console.log(p);
                            for (var i in regionalPeak._layers) {
                                var cords = ([regionalPeak._layers[i]._latlng.lng, regionalPeak._layers[i]._latlng.lat]);

                                var isItInside = turf.booleanPointInPolygon(cords, buffer, { ignoreBoundary: true });
                                console.log(isItInside);
                                // if true add it to an array containing all the 'true' regionalPeak
                                if (isItInside) {
                                    //peaksWithinBuffer.push(regionalPeak._layers[i]);
                                    regionalPeak._layers[i].addTo(peaksWithinBuffer);
                                }
                            }
                        }
                    });

                    function fixMultipolys(buffer) {


                    }

                    //regionalMap.removeLayer(regionalPeak);
                    peaksWithinBuffer.addTo(regionalMap);


                    /* for (var i in regionalPeak._layers) {
        
                        // formatting point for turf
                        var cords = ([regionalPeak._layers[i]._latlng.lng, regionalPeak._layers[i]._latlng.lat]);
                        for (var p in regionParksFC.features) {
                            var buffer = regionParksFC.features[p];
                            var isItInside = turf.booleanPointInPolygon(cords, buffer);
         
                            // if true add it to an array containing all the 'true' regionalPeak
                            if (isItInside) {
                                //peaksWithinBuffer.push(regionalPeak._layers[i]);
                                regionalPeak._layers[i].addTo(peaksWithinBuffer);
                            }
                        }      
                    }
                    peaksWithinBuffer.addTo(regionalMap);   */
                }

                // need to find out which parks have peaks within their buffers




            });


        }

    });

});

// will have to somehow use turf to identify park polys within the selected region poly
