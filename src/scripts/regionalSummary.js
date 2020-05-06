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
var where = "";

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

        // getting array of selected events
        selectedEvents = $('#evtSelect_regionalModal').val();

        // getting the geometry for the selected region
        where = "REG_NUM=" + selectedRegion,
            selectedRegion = $('#regionSelect_regionalModal').val();

        regionBoundaries = L.esri.featureLayer({
            useCors: false,
            url: 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0',
            where: "REG_NUM=" + selectedRegion,
            onEachFeature: function (feature, latlng) {
                regionPoly = feature.geometry;
                flattenedRegionalPoly = turf.flatten(regionPoly);
            }
        }).addTo(regionalMap);
        regionLayerGroup.addLayer(regionBoundaries);
        setTimeout(() => {


            // Identify parks/refuges in event in regions

            var allParks;
            var identifiedParks = [];
            allParks = L.esri.featureLayer({
                // useCors: false,
                url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2',
                where: "1=1",
                fields: ["*"]
            });

            // lopping through each poly of the regional poly since esri-leaflet can't handle multipolygons at the version we're at
            for (var i = 0; i < flattenedRegionalPoly.features.length; i++) {
                allParks.query()
                    .within(flattenedRegionalPoly.features[i])
                    .run(function (error, featureCollection, response) {
                        if (featureCollection.features.length !== 0) {
                            L.geoJson(featureCollection).addTo(regionalMap);
                            for (var f in featureCollection.features) {
                                identifiedParks.push(featureCollection.features[f]);
                            }
                        } else {
                            // do nothing
                        }
                    });
            }

            console.log(identifiedParks);

            L.geoJson(identifiedParks).addTo(regionalMap)
            //identifiedParks.addTo(regionalMap);






            // cycling through each park poly and seeing if it's inside the buffer
            /* for (var i in peak._layers) {
    
                // formatting point for turf
                var polyCoords = ([peak._layers[i]._latlng.lng, peak._layers[i]._latlng.lat]);
    
                var isItInside = turf.booleanPointInPolygon(cords, buffer);
    
                // if true add it to an array containing all the 'true' peaks
                if (isItInside) {
                    identifiedPeaks.push(peak._layers[i])
                }
            } */


            // looping through each event select and getting sensor data
            for (var i = 0; i < selectedEvents.length; i++) {
                // Getting event name

                // resetting event url
                var eventName;
                eventURL = "https://stn.wim.usgs.gov/STNServices/Events/"
                eventURL = eventURL + selectedEvents[i] + '.json';

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


                // PEAKS

                // resetting peak url
                peaksURL = "https://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json?Event=";
                peaksURL = peaksURL + selectedEvents[i];

                getData(function (output) {

                    // find min/max peak stage values
                    maxPeakStage = Math.max.apply(Math, output.map(function (o) { return o.peak_stage; }));
                    minPeakStage = Math.min.apply(Math, output.map(function (o) { return o.peak_stage; }));

                });

                // fucntion 
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
                }


                // HWMS

                // SENSORS & INSTRUMENTS

                map.removeLayer(regionBoundaries);
            }
        }, 1000);
    });

});




// will have to somehow use turf to identify park polys within the selected region poly
