// setting global variables for the regional summary
var regionalMap;
var regionPoly = [];
var selectedRegion = "";
var selectedEvents = [];
var selectedLandType;
var regionPoly = [];
var parksInRegion = [];
var regionBoundaries;
var flattenedRegionalPoly;
var regionLayerGroup = L.layerGroup();
var regionParksLayerGroup = L.featureGroup();
var regionParks = [];
var where = "";
var identifiedParks = [];
var peaksWithinBuffer = L.featureGroup();
var bufferedPolys = [];
var unbufferedPolys = [];
var bufferSize;
var parksWithPeaks = [];
var executed = false;
var regionalPeak = L.layerGroup();
var parkPeaks = L.layerGroup();
var regionalHWMs = L.layerGroup();
var parkHWMs = L.layerGroup();
var regionalPeakMarkerIcon = L.icon({ className: 'regionalPeakMarker', iconUrl: 'images/peak.png', iconAnchor: [11, 14], popupAnchor: [0, 2] });
var regionalHWMPeakMarkerIcon = L.icon({ className: 'regionalHWMMarker', iconUrl: 'images/hwm.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });

var regionParksFC;

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

            regionalMap.dragging.disable();
            regionalMap.touchZoom.disable();
            regionalMap.doubleClickZoom.disable();
            regionalMap.scrollWheelZoom.disable();
            regionalMap.boxZoom.disable();
            regionalMap.keyboard.disable();

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

        // selectedLandType
        selectedLandType = $('#typeSelect_regionalModal').val();
        // setting array of selected events
        selectedEvents = $('#evtSelect_regionalModal').val();

        // setting selected region
        selectedRegion = $('#regionSelect_regionalModal').val();

        // setting buffer size
        bufferSize = $('#bufferSelect_regionalModal').val();

        // setting region variables based on service selection
        var regionURL;
        var whereValue;

        switch ($('#regionType_regionalModal').val()[0]) {
            case 'doi':
                regionURL = 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0'; break;
                whereValue = "REG_NUM=" + selectedRegion;
            case 'fws':
                regionURL = 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0';
                whereValue = "REGNAME=" + selectedRegion;
            case 'nps':
                regionURL = 'https://irmaservices.nps.gov/arcgis/rest/services/NPSData/NPS_MonitoringNetworks/MapServer/0';
                whereValue = "NetworkName" + selectedRegion;
        }

        if ($('#regionType_regionalModal').val()[0] === "doi") {
            // getting the geometry for the selected region
            where = "REG_NUM=" + selectedRegion,
                regionBoundaries = L.esri.featureLayer({
                    useCors: false,
                    url: regionURL,
                    where: "REG_NUM=" + selectedRegion,
                    style: regionStyle,
                    onEachFeature: function (feature, latlng) {
                        regionPoly = feature.geometry;
                        flattenedRegionalPoly = turf.flatten(regionPoly);
                    }
                }).addTo(regionalMap);
            regionLayerGroup.addLayer(regionBoundaries);
        } else if ($('#regionType_regionalModal').val()[0] === "fws") {
            regionBoundaries = L.esri.featureLayer({
                useCors: false,
                url: regionURL,
                where: "REG_NUM=" + selectedRegion,
                style: regionStyle,
                onEachFeature: function (feature, latlng) {
                    regionPoly = feature.geometry;
                    flattenedRegionalPoly = turf.flatten(regionPoly);
                }
            }).addTo(regionalMap);
            regionLayerGroup.addLayer(regionBoundaries);
        } else if ($('#regionType_regionalModal').val()[0] === "nps") {
            regionBoundaries = L.esri.featureLayer({
                useCors: false,
                url: regionURL,
                where: "NetworkName='" + selectedRegion + "'",
                style: regionStyle,
                onEachFeature: function (feature, latlng) {
                    regionPoly = feature.geometry;
                    flattenedRegionalPoly = turf.flatten(regionPoly);
                }
            }).addTo(regionalMap);
            regionLayerGroup.addLayer(regionBoundaries);
        }
        // TODO: explore options to avoid this timeout. dealing with motely crew of services that is making it difficult atm

        regionBoundaries.on('load', function (event) {
            // Identify parks/refuges in event in regions
            var allSites;
            if (selectedLandType[0] === "parks") {
                allSites = L.esri.featureLayer({
                    // useCors: false,
                    url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2',
                    where: "1=1",
                    fields: ["*"]
                });
            } else if (selectedLandType[0] === "refuges") {
                allSites = L.esri.featureLayer({
                    // useCors: false,
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved/FeatureServer/1',
                    where: "1=1",
                    fields: ["*"]
                });
            }

            function myFunction(item, index) {
                document.getElementById("demo").innerHTML += index + ":" + item + "<br>";
            }

            /* function doHomework(subject, callback) {
                if (flattenedRegionalPoly !== undefined) {
                    for (var p = 0; p < flattenedRegionalPoly.features.length; p++) {
                        allSites.query()
                            .within(flattenedRegionalPoly.features[p])
                            .run(function (error, featureCollection, response) {
                                if (featureCollection.features.length !== 0) {
                                    regionParksFC = featureCollection;
                                    regionParksLayerGroup.addLayer(featureCollection);
                                    //L.geoJson(regionParksFC, { style: parkStyle }).addTo(regionalMap);
                                    // getbuffers();
                                }
                            });
                        }
                }
                callback();
              }
              
              doHomework('math', function() {
                alert('Finished my homework');
                console.log(regionParksLayerGroup);
                regionParksLayerGroup.addTo(regionalMap);
              }); */

            // lopping through each poly of the regional poly since esri-leaflet can't handle multipolygons at the version we're at
            if (flattenedRegionalPoly !== undefined) {
                for (var p = 0; p < flattenedRegionalPoly.features.length; p++) {
                    allSites.query()
                        .within(flattenedRegionalPoly.features[p])
                        .run(function (error, featureCollection, response) {
                            if (featureCollection.features.length !== 0) {
                                regionParksFC = featureCollection;
                                regionParks.push(featureCollection);
                                //L.geoJson(regionParksFC, { style: parkStyle }).addTo(regionalMap);
                                // getbuffers();
                            }
                        });
                    }
            }
            setTimeout(() => {
                console.log(regionParksLayerGroup);
                regionParksLayerGroup.addLayer(regionParks[0]);
                //L.geoJson(regionParksLayerGroup, { style: parkStyle }).addTo(regionalMap);
                regionParksLayerGroup.addTo(regionalMap);
                /* regionalMap.addLayer(regionParksLayerGroup); */
            }, 5000);
            


            // getting the park buffers base on the buffer size selection value
            function getbuffers() {
                if (regionParksFC !== undefined) {
                    for (var p = 0; p < regionParksFC.features.length; p++) {
                        var feature = regionParksFC.features[p];
                        var options = { tolerance: 0.01, highQuality: false };
                        // check incase there are any multipolys and convert them to simple polys
                        if (regionParksFC.features[p].geometry.type === "MultiPolygon") {
                            regionParksFC.features[p].geometry.coordinates.forEach(function (coords) {
                                feature = { 'type': 'Polygon', 'coordinates': coords };
                                var simplified = turf.simplify(feature, options);
                                var buffered = turf.buffer(simplified, bufferSize, { units: 'kilometers' });
                                // bufferedPolys.push(buffered);
                            });
                        } else {
                            var simplified = turf.simplify(feature, options);
                            var buffered = turf.buffer(simplified, bufferSize, { units: 'kilometers' });
                            bufferedPolys.push(buffered);
                        }
                    }
                    console.log('buffered polys' + bufferedPolys);
                    L.geoJson(bufferedPolys, { style: bufferStyle }).addTo(regionalMap);
                    
                }
            }

            // looping through each event and sensor data
            function getEventSpecificData() {
                for (var e = 0; e < selectedEvents.length; e++) {
                    // Getting event name

                    // resetting event url
                    var eventName;
                    eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                    eventURL = eventURL + selectedEvents[e] + '.json';
                    parksInEvent = [];
                    var queryString = "?Event=" + selectedEvents[e] + "&States=&County=&StartDate=undefined&EndDate=undefined";

                    getEventName(function (output) {
                        eventName = output.event_name;
                    });

                    // function for getting the event data
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

                    // PEAKS
                    getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + queryString, regionalPeakMarkerIcon);

                    // HWMS
                    getHWMs(fev.urls.hwmFilteredGeoJSONViewURL + queryString, regionalHWMPeakMarkerIcon);

                    // SENSORS & INSTRUMENTS

                }
            }
        });


        // creating markers for peaks
        function getPeaks(url, markerIcon) {
            //increment layerCount
            layerCount++;
            //var maxPeak = Math.max(feature.properties.peak_stage);
            regionalPeak.clearLayers();
            var currentMarker = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    var labelText = feature.properties.peak_stage !== undefined ? feature.properties.peak_stage.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("Peak: " + labelText);
                    return marker;
                },

                // leaving cause we might need this
                /* onEachFeature: function (feature, latlng) {
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                } */
            });
            var currentMarker = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    var labelText = feature.properties.peak_stage !== undefined ? feature.properties.peak_stage.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("Peak: " + labelText);
                    return marker;
                },

                // leaving cause we might need this
                /* onEachFeature: function (feature, latlng) {
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                } */
            });


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
                        // looping through each park buffer
                        for (var p = 0; p < bufferedPolys.length; p++) {
                            var buffer = bufferedPolys[p];

                            // check incase there are any multipolys and convert them to simple polys
                            if (buffer.geometry.type === "MultiPolygon") {
                                var feat;

                                buffer.geometry.coordinates.forEach(function (coords) {
                                    feat = { 'type': 'Polygon', 'coordinates': coords };
                                    if (feat !== undefined) {
                                        var isItInside = turf.booleanPointInPolygon(cords, feat, { ignoreBoundary: true });
                                        // if true add it to an array containing all the 'true' regionalPeaks
                                        if (isItInside) {
                                            var landSelection = selectedLandType[0] === "refuges" ? buffer.properties.CMPXNAME : buffer.properties.PARKNAME; 
                                            regionalPeak._layers[i].addTo(peaksWithinBuffer);
                                            parksWithPeaks.push({
                                                "site_name": landSelection,
                                                data: {
                                                    "site_name": landSelection,
                                                    "peak_stage": regionalPeak._layers[i].peak_stage,
                                                    "county": regionalPeak._layers[i].county,
                                                    "height_above_gnd": regionalPeak._layers[i].height_above_gnd,
                                                    "latitude_dd": regionalPeak._layers[i].latitude_dd,
                                                    "longitude_dd": regionalPeak._layers[i].longitude_dd,
                                                    "site_no": regionalPeak._layers[i].site_no,
                                                    "waterbody": regionalPeak._layers[i].waterbody
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            // looping through the peaks and identifying ones that are within current park poly
                            for (var i in regionalPeak._layers) {
                                var cords = ([regionalPeak._layers[i]._latlng.lng, regionalPeak._layers[i]._latlng.lat]);

                                var isItInside = turf.booleanPointInPolygon(cords, buffer, { ignoreBoundary: true });
                                // if true add it to an array containing all the 'true' regionalPeak
                                if (isItInside) {
                                    var landSelection = selectedLandType[0] === "refuges" ? buffer.properties.CMPXNAME : buffer.properties.PARKNAME; 
                                    //peaksWithinBuffer.push(regionalPeak._layers[i]);
                                    regionalPeak._layers[i].addTo(peaksWithinBuffer);
                                    parksWithPeaks.push({
                                        "park_name": landSelection,
                                        data: {
                                            "park_name": landSelection,
                                            "peak_stage": regionalPeak._layers[i].feature.properties.peak_stage,
                                            "county": regionalPeak._layers[i].feature.properties.county,
                                            "height_above_gnd": regionalPeak._layers[i].feature.properties.height_above_gnd,
                                            "latitude_dd": regionalPeak._layers[i].feature.properties.latitude_dd,
                                            "longitude_dd": regionalPeak._layers[i].feature.properties.longitude_dd,
                                            "site_no": regionalPeak._layers[i].feature.properties.site_no,
                                            "waterbody": regionalPeak._layers[i].feature.properties.waterbody
                                        }
                                    });
                                }
                            }
                        }
                    });

                    //regionalMap.removeLayer(regionalPeak);
                    peaksWithinBuffer.addTo(regionalMap);
                    setTimeout(() => {
                        regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                    }, 600);
                    

                    /* peaksWithinBuffer.on('load', function (evt) {
                        // create a new empty Leaflet bounds object
                        var bounds = L.latLngBounds([]);
                        // loop through the features returned by the server
                        peaksWithinBuffer.eachFeature(function (layer) {
                            // get the bounds of an individual feature
                            var layerBounds = layer.getBounds();
                            // extend the bounds of the collection to fit the bounds of the new feature
                            bounds.extend(layerBounds);
                        });
        
                        // once we've looped through all the features, zoom the map to the extent of the collection
                        regionalMap.fitBounds(bounds);
                    }); */
                    setTimeout(() => {
                        processPeaks(parksWithPeaks);
                    }, 600);



                }
            });
        }
        function getHWMs(url, markerIcon) {
            //increment layerCount
            layerCount++;
            //var maxPeak = Math.max(feature.properties.elevation);
            regionalHWMs.clearLayers();
            var currentMarker = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    var labelText = feature.properties.elevation !== undefined ? feature.properties.elevation.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("Elevation: " + labelText);
                    return marker;
                },

                // leaving cause we might need this
                /* onEachFeature: function (feature, latlng) {
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                } */
            });
            var currentMarker = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    var labelText = feature.properties.elevation !== undefined ? feature.properties.elevation.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("Elevation: " + labelText);
                    return marker;
                },

                // leaving cause we might need this
                /* onEachFeature: function (feature, latlng) {
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                } */
            });


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
                        layer.addTo(regionalHWMs);
                    });
                    //regionalHWMs.addTo(regionalMap);
                    //checkLayerCount(layerCount);

                    // function to get only peaks within park buffer
                    setTimeout(() => {
                        // looping through each park buffer
                        for (var p = 0; p < bufferedPolys.length; p++) {
                            var buffer = bufferedPolys[p];

                            // check incase there are any multipolys and convert them to simple polys
                            if (buffer.geometry.type === "MultiPolygon") {
                                var feat;

                                buffer.geometry.coordinates.forEach(function (coords) {
                                    feat = { 'type': 'Polygon', 'coordinates': coords };
                                    if (feat !== undefined) {
                                        var isItInside = turf.booleanPointInPolygon(cords, feat, { ignoreBoundary: true });
                                        // if true add it to an array containing all the 'true' regionalHWMs
                                        if (isItInside) {
                                            var landSelection = selectedLandType[0] === "refuges" ? buffer.properties.CMPXNAME : buffer.properties.PARKNAME; 
                                            regionalHWMs._layers[i].addTo(peaksWithinBuffer);
                                            parksWithPeaks.push({
                                                "park_name": landSelection,
                                                data: {
                                                    "park_name": landSelection,
                                                    "elevation": regionalHWMs._layers[i].elevation,
                                                    "type": regionalHWMs._layers[i].debris,
                                                    "county": regionalHWMs._layers[i].county,
                                                    "state": regionalHWMs._layers[i].state,
                                                    "longitude_dd": regionalHWMs._layers[i].longitude_dd,
                                                    "site_no": regionalHWMs._layers[i].site_no,
                                                    "waterbody": regionalHWMs._layers[i].waterbody
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            // looping through the peaks and identifying ones that are within current park poly
                            for (var i in regionalHWMs._layers) {
                                var cords = ([regionalHWMs._layers[i]._latlng.lng, regionalHWMs._layers[i]._latlng.lat]);

                                var isItInside = turf.booleanPointInPolygon(cords, buffer, { ignoreBoundary: true });
                                // if true add it to an array containing all the 'true' regionalPeak
                                if (isItInside) {
                                    var landSelection = selectedLandType[0] === "refuges" ? buffer.properties.CMPXNAME : buffer.properties.PARKNAME; 
                                    regionalHWMs._layers[i].addTo(peaksWithinBuffer);
                                    parksWithPeaks.push({
                                        "site_name": landSelection,
                                        data: {
                                            "site_name": buffer.properties.landSelection,
                                            "peak_stage": regionalHWMs._layers[i].feature.properties.peak_stage,
                                            "county": regionalHWMs._layers[i].feature.properties.county,
                                            "height_above_gnd": regionalHWMs._layers[i].feature.properties.height_above_gnd,
                                            "latitude_dd": regionalHWMs._layers[i].feature.properties.latitude_dd,
                                            "longitude_dd": regionalHWMs._layers[i].feature.properties.longitude_dd,
                                            "site_no": regionalHWMs._layers[i].feature.properties.site_no,
                                            "waterbody": regionalHWMs._layers[i].feature.properties.waterbody
                                        }
                                    });
                                }
                            }
                        }
                    });

                    //regionalMap.removeLayer(regionalPeak);
                    peaksWithinBuffer.addTo(regionalMap);
                    setTimeout(() => {
                        regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                    }, 600);
                    
                    setTimeout(() => {
                        processPeaks(parksWithPeaks);
                    }, 600);



                }
            });
        }

        function processPeaks(event) {
            var distinctParks = [];
            var result = Array.from(new Set(parksWithPeaks.map(s => s.park_name))).map(park_name => {
                return {
                    park_name: park_name
                }
            });

            var formattedPeaks = [];
            distinctParks = result;

            for (var park in result) {
                formattedPeaks.push({
                    "site_name": result[park].park_name,
                    data: []
                })
                for (var peak in parksWithPeaks) {
                    if (parksWithPeaks[peak].park_name === result[park].park_name) {
                        var data = []
                        var peakdata = {
                            "site_name": parksWithPeaks[peak].data.park_name,
                            "peak_stage": parksWithPeaks[peak].data.peak_stage,
                            "county": parksWithPeaks[peak].data.county,
                            "height_above_gnd": parksWithPeaks[peak].data.height_above_gnd,
                            "latitude_dd": parksWithPeaks[peak].data.latitude_dd,
                            "longitude_dd": parksWithPeaks[peak].data.longitude_dd,
                            "site_no": parksWithPeaks[peak].data.site_no,
                            "waterbody": parksWithPeaks[peak].data.waterbody
                        };
                        formattedPeaks[park].data.push(peakdata);
                    }
                    if (parksWithPeaks[peak].park_name !== result[park].park_name) {

                    }
                }
            }

            var summaryStats = [];
            var peakSum = [];
            var maxPeak;
            var minPeak;

            if (formattedPeaks.length !== 0) {
                var maxPeak = formattedPeaks[0].data[0].peak_stage;
                var minPeak = formattedPeaks[0].data[0].peak_stage;
            }

            // getting peak stats for summary table
            for (var p in formattedPeaks) {
                for (var d in formattedPeaks[p].data) {
                    currentPeak = formattedPeaks[p].data[d].peak_stage;
                    if (maxPeak < currentPeak) {
                        maxPeak = currentPeak;
                    }
                    if (minPeak > currentPeak) {
                        minPeak = currentPeak;
                    }
                }
            }

            if (formattedPeaks.length > 0) {
                peakSum.push({ "type": "peak", "max": maxPeak, "min": minPeak });
            }


            // Builds the HTML Table
            function buildHtmlTable() {
                $("#peakTable").prepend("<p>" + "<b>" + "Peak Summary Site Information" + "</b>" + "</p>")
                var columns = addAllColumnHeaders(peakSum);

                for (var i = 0; i < peakSum.length; i++) {
                    var row$ = $('<tr/>');
                    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
                        var cellValue = peakSum[i][columns[colIndex]];

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
                $("#dataTable").append(headerTr$);

                return columnSet;
            }

            // ensure table build happens only once
            var buildTheTable = (function () {
                return function () {
                    if (!executed) {
                        executed = false;
                        // do something
                        setTimeout(() => {
                            buildHtmlTable();
                        }, 1000);
                        
                    }
                };
            })();

            buildTheTable();
            
            // buildHtmlTable();

        }


        // PEAK TABLE FUNCTIONS
        var peaksTableData = [];
        function bodyData() {
            for (var i in identifiedPeaks) {
                var peakEstimated = "";
                if (identifiedPeaks[i].feature.properties.is_peak_stage_estimated === 0) {
                    peakEstimated = "no";
                } else {
                    peakEstimated = "yes"
                }

                peaksTableData.push({
                    "Site Number": identifiedPeaks[i].feature.properties.site_no,
                    "Description": identifiedPeaks[i].feature.properties.description,
                    "State": identifiedPeaks[i].feature.properties.state,
                    "County": identifiedPeaks[i].feature.properties.county,
                    "Peak Stage": identifiedPeaks[i].feature.properties.peak_stage,
                    "Peak Estimated": peakEstimated
                });
            }
            return peaksTableData;
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

        // END PEAK TABLE FUNCTIONS
    });

});

