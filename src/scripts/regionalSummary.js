// setting global variables for the regional summary
var regionalMap;
var layerCountReg = 0;
var regionPoly = [];
var selectedRegion = "";
var selectedEvents = [];
var selectedLandType;
var regionPoly = [];
var regionBoundaries;
var flattenedRegionalPoly;
var regionLayerGroup = L.layerGroup();
var where = "";
var eventName;
var identifiedParks = [];
var peaksWithinBuffer = L.featureGroup();
var hwmsWithinBuffer = L.featureGroup();
var barosWithinBuffer = L.featureGroup();
var sensorsWithinBuffer = L.featureGroup();
var bufferedPolys = [];
var unbufferedPolys = [];
var bufferSize;
var parksWithPeaks = [];
var parksWithHWMs = [];
var parksWithBaros = [];
var executed = false;
var regionalPeak = L.layerGroup();
var parkPeaks = L.layerGroup();
var regionalHWM = L.layerGroup();
var regionalBaro = L.layerGroup();
var parkHWM = L.layerGroup();
var regionalbaro = L.layerGroup();
var regionalbaroQueried = L.layerGroup();
var regionalstormtide = L.layerGroup();
var regionalmet = L.layerGroup();
var regionalwaveheight = L.layerGroup();
var regionalPeakMarkerIcon = L.icon({ className: 'regionalpeakMarker', iconUrl: 'images/peak.png', iconAnchor: [12, 16], popupAnchor: [0, 2] });
var regionalhwmIcon = L.icon({ className: 'regionalhwmMarker', iconUrl: 'images/hwm.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var regionalbaroMarkerIcon = L.icon({ className: 'regionalbaroMarker', iconUrl: 'images/baro.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });
var regionalmetMarkerIcon = L.icon({ className: 'regionalmetMarker', iconUrl: 'images/met.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var regionalrdgMarkerIcon = L.icon({ className: 'regionalrdgMarker', iconUrl: 'images/rdg.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var regionalstormtideMarkerIcon = L.icon({ className: 'regionalstormtideMarker', iconUrl: 'images/stormtide.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [16, 16] });
var regionalwaveheightMarkerIcon = L.icon({ className: 'regionalwaveheightMarker', iconUrl: 'images/waveheight.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [12, 12] });
var regionParksFC = [];
var tableData = [];
var hwmTableData = [];
var sensorTableData = [];
var allHWMs = [];
var allPeaks = [];
var hwmRegionalCSVData = [];
var peaksRegionalCSVData = [];
//This array will be populated with the peak values from peaks within the buffered regions
var peakArrReg = [];
var hwmArrReg = [];


var fevRegional = fevRegional || {
    //Assign column names for the regional peak table csv download
    csvRegionalPeaksColumns: [
        { fieldName: 'site_name', colName: "Site Name" },
        { fieldName: 'event', colName: "Event" },
        { fieldName: 'peak_stage', colName: "Peak Stage" },
        { fieldName: 'county', colName: "County" },
        { fieldName: 'peak_stage', colName: "Peak Stage" },
        { fieldName: 'latitude_dd', colName: "Latitude" },
        { fieldName: 'longitude_dd', colName: "Longitude" },
        { fieldName: 'site_no', colName: "Site Number" },
        { fieldName: 'waterbody', colName: "Waterbody" },
    ],
    //Assign column names for the regional hwm table csv download
    csvRegionalHWMColumns: [
        { fieldName: 'site_name', colName: "Site Name" },
        { fieldName: 'event', colName: "Event" },
        { fieldName: 'elev_ft', colName: "Elevation" },
        { fieldName: 'survey_date', colName: "Survey Date" },
        { fieldName: 'bank', colName: "Bank" },
        { fieldName: 'hwmQualityName', colName: "HWM Quality" },
        { fieldName: 'hwmTypeName', colName: "HWM Type" },
        { fieldName: 'verticalDatumName', colName: "Vertical Datum" },
        { fieldName: 'verticalMethodName', colName: "Vertical Method" },
        { fieldName: 'horizontalMethodName', colName: "Horizontal Method" },
        { fieldName: 'horizontalDatumName', colName: "Horizontal Datum" },
        { fieldName: 'hwm_locationdescription', colName: "HWM Location Description" },
        { fieldName: 'hwm_environment', colName: "HWM Environment" },
        { fieldName: 'stillwater', colName: "Stillwater)" },
        { fieldName: 'uncertainty', colName: "Uncertainty" },
        { fieldName: 'hwm_uncertainty', colName: "HWM Uncertainty" },
        { fieldName: 'hwm_label', colName: "HWM Label" },
        { fieldName: 'flag_date', colName: "Flag Date" },
        { fieldName: 'siteDescription', colName: "Site Description" },
        { fieldName: 'sitePermHousing', colName: "Permanent Housing Site" },
        { fieldName: 'county', colName: "County" },
        { fieldName: 'state', colName: "HWM State" },
        { fieldName: 'latitude_dd', colName: "Latitude" },
        { fieldName: 'longitude_dd', colName: "Longitude" },
        { fieldName: 'site_no', colName: "Site Number" },
        { fieldName: 'waterbody', colName: "Waterbody" },
    ],
}

// URLS
var eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
var parksURL = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=";
var peaksURL = "https://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json?Event=";

$(document).ready(function () {


    $('#regionalReportNav').click(function () {

        // for some reason tableData loading incompletely without timeout
        setTimeout(() => {
            regionalMap = L.map('regionalMap', {
                maxZoom: 15,
                zoomControl: false
            }).setView([39.833333, -98.583333], 3);

            /* regionalMap.dragging.disable();
            regionalMap.touchZoom.disable();
            regionalMap.doubleClickZoom.disable();
            regionalMap.scrollWheelZoom.disable();
            regionalMap.boxZoom.disable();
            regionalMap.keyboard.disable(); */

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

        $('.progress-bar-fill').delay(1000).queue(function () {
            $(this).css('width', '100%')
        });

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
                regionURL = 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0';
                whereValue = "REG_NUM=" + selectedRegion;
                break;
            case 'fws':
                regionURL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_Legacy_Regional_Boundaries/FeatureServer/0';
                whereValue = "REGNAME=" + selectedRegion;
                break;
            case 'nps':
                regionURL = 'https://irmaservices.nps.gov/arcgis/rest/services/NPSData/NPS_MonitoringNetworks/MapServer/0';
                whereValue = "NetworkName" + selectedRegion;
                break;
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
                where: "REGNAME='" + selectedRegion + "'",
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
        setTimeout(() => {

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

            // lopping through each poly of the regional poly since esri-leaflet can't handle multipolygons at the version we're at
            if (flattenedRegionalPoly !== undefined) {
                for (var p = 0; p < flattenedRegionalPoly.features.length; p++) {
                    allSites.query()
                        .within(flattenedRegionalPoly.features[p])
                        .run(function (error, featureCollection, response) {
                            if (featureCollection.features.length !== 0) {
                                regionParksFC = featureCollection;
                                L.geoJson(regionParksFC, { style: parkStyle }).addTo(regionalMap);
                                getbuffers();
                            }
                        });
                }
            }

            /* setTimeout(() => {
                L.geoJson(regionParksFC, { style: parkStyle }).addTo(regionalMap);
                console.log(regionParksFC);
                getbuffers();
            }, 7000); */

            //getbuffers();
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
                    getEventSpecificData();
                }
            }

            // looping through each event and sensor data
            function getEventSpecificData() {
                for (var e = 0; e < selectedEvents.length; e++) {
                    // Getting event name

                    // resetting event url

                    eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                    eventURL = eventURL + selectedEvents[e] + '.json';
                    parksInEvent = [];
                    var queryString = "?Event=" + selectedEvents[e] + "&States=&County=&StartDate=undefined&EndDate=undefined";
                    var sensorQueryString = "?Event=" + selectedEvents[e] + "&States=&County=&SensorType=&CurrentStatus=&CollectionCondition=&DeploymentType=";
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
                    getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + queryString, regionalPeakMarkerIcon, eventName);

                    // HWMS
                    getHWMs(fev.urls.hwmFilteredGeoJSONViewURL + queryString, regionalhwmIcon, eventName);

                    // BARO
                    //getBaros(fev.urls.baroGeoJSONViewURL + sensorQueryString, regionalbaroMarkerIcon);

                    /* // STORMTIDE
                    getStormtides(fev.urls.stormtideGeoJSONViewURL + sensorQueryString, regionalstormtideMarkerIcon);

                    // MET
                    getMets(fev.urls.metGeoJSONViewURL + sensorQueryString, regionalmetMarkerIcon);

                    // WAVEHEIGHT
                    getWaveheights(fev.urls.waveheightGeoJSONViewURL + sensorQueryString, regionalwaveheightMarkerIcon);

                    // RDG
                    getRDGs(fev.urls.rdgGeoJSONViewURL + sensorQueryString, regionalrdgMarkerIcon); */

                    setTimeout(() => {
                        //regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                        processData();
                    }, 1000);


                }
            }
        }, 800);


        // creating markers for peaks
        function getPeaks(url, markerIcon, eventName) {
            //Create variables for scaling peak label sizes
            var lengthPeak = [];
            var sortedPeaks = [];
            var thirdLength = [];
            var thirdVal = [];
            var twoThirdVal = [];

            var createPeakArrayReg = L.geoJson(false, {
                onEachFeature: function (feature) {
                    //find coordinates of each peak 
                    var cordsInitial = ([feature.properties.longitude_dd, feature.properties.latitude_dd]);
                    for (buffPolyCount = 0; buffPolyCount < bufferedPolys.length; buffPolyCount++) {
                        //see if peak is inside of a buffered polygon
                        var isItInsideInitial = turf.booleanPointInPolygon(cordsInitial, bufferedPolys[buffPolyCount], { ignoreBoundary: true });
                        //if peak is inside of the buffered polygon, add the corresponding peak value to an array
                        if (isItInsideInitial) {
                            peakArrReg.push(feature.properties.peak_stage);
                        }

                    }

                    //sort array of peak values
                    sortedPeaks = peakArrReg.sort();

                    //find number of peak values
                    lengthPeak = peakArrReg.length;

                    //divide the array into 3 equal sections
                    //find the maximum peak value of each of those sections
                    thirdLength = Math.round(lengthPeak / 3);
                    thirdVal = sortedPeaks[thirdLength - 1];
                    twoThirdVal = sortedPeaks[thirdLength * 2 - 1];
                }
            });

            //increment layerCount
            layerCountReg++;
            //var maxPeak = Math.max(feature.properties.peak_stage);
            regionalPeak.clearLayers();
            var currentMarkerReg = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    var labelText = feature.properties.peak_stage !== undefined ? feature.properties.peak_stage.toString() : 'No Value';
                    markerCoords.push(latlng);
                    //console.log("Ranges for regional peak legend. Small: <=", thirdVal, "Medium: >", thirdVal, "<=", twoThirdVal, "Large: >", twoThirdVal);
                    //Create 3 categories for marker size          
                    if (feature.properties.peak_stage <= thirdVal) {
                        var marker =
                            L.marker(latlng, {
                                icon: L.icon({ className: 'peakMarker', iconUrl: 'images/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [7, 10] })
                            }).bindLabel("Peak: " + labelText + "<br>Site: " + feature.properties.site_no);
                    }
                    if (thirdVal < feature.properties.peak_stage <= twoThirdVal) {
                        var marker =
                            L.marker(latlng, {
                                icon: L.icon({ className: 'peakMarker', iconUrl: 'images/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [11, 16] })
                            }).bindLabel("Peak: " + labelText + "<br>Site: " + feature.properties.site_no);
                    }
                    if (feature.properties.peak_stage > twoThirdVal) {
                        var marker =
                            L.marker(latlng, {
                                icon: L.icon({ className: 'peakMarker', iconUrl: 'images/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [15, 22] })
                            }).bindLabel("Peak: " + labelText + "<br>Site: " + feature.properties.site_no);
                    }
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
                    createPeakArrayReg.addData(data);
                    currentMarkerReg.addData(data);
                    currentMarkerReg.eachLayer(function (layer) {
                        layer.addTo(regionalPeak);
                    });
                    //regionalPeak.addTo(regionaltableData);
                    //checkLayerCount(layerCount);

                    // function to get only peaks within park buffer
                    setTimeout(() => {
                        var count = 0;
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
                                            var landsitetype = $('#typeSelect_regionalModal').val()[0] === "parks" ? buffer.properties.PARKNAME : buffer.properties.ORGNAME;
                                            regionalPeak._layers[i].addTo(peaksWithinBuffer);
                                            parksWithPeaks.push({
                                                "site_name": landsitetype,
                                                data: {
                                                    "site_name": landsitetype,
                                                    "event": eventName,
                                                    "peak_stage": regionalPeak._layers[i].peak_stage,
                                                    "county": regionalPeak._layers[i].county,
                                                    "peak_stage": regionalPeak._layers[i].peak_stage,
                                                    "latitude_dd": regionalPeak._layers[i].latitude_dd,
                                                    "longitude_dd": regionalPeak._layers[i].longitude_dd,
                                                    "site_no": regionalPeak._layers[i].site_no,
                                                    "waterbody": regionalPeak._layers[i].waterbody
                                                }
                                            });
                                            allPeaks.push(parksWithPeaks[count].data);
                                            //peaksRegionalCSVData = parksWithPeaks;
                                            count++;
                                        }
                                    }
                                });
                            }

                            // looping through the peaks and identifying ones that are within current park poly
                            for (var i in regionalPeak._layers) {
                                var cords = ([regionalPeak._layers[i]._latlng.lng, regionalPeak._layers[i]._latlng.lat]);
                                //console.log("cordsFinal", cords);
                                var isItInside = turf.booleanPointInPolygon(cords, buffer, { ignoreBoundary: true });
                                // if true add it to an array containing all the 'true' regionalPeak
                                if (isItInside) {
                                    //peaksWithinBuffer.push(regionalPeak._layers[i]);
                                    var landsitetype = $('#typeSelect_regionalModal').val()[0] === "parks" ? buffer.properties.PARKNAME : buffer.properties.ORGNAME;
                                    regionalPeak._layers[i].addTo(peaksWithinBuffer);
                                    parksWithPeaks.push({
                                        "site_name": landsitetype,
                                        data: {
                                            "site_name": landsitetype,
                                            "event": eventName,
                                            "peak_stage": regionalPeak._layers[i].feature.properties.peak_stage,
                                            "county": regionalPeak._layers[i].feature.properties.county,
                                            "peak_stage": regionalPeak._layers[i].feature.properties.peak_stage,
                                            "latitude_dd": regionalPeak._layers[i].feature.properties.latitude_dd,
                                            "longitude_dd": regionalPeak._layers[i].feature.properties.longitude_dd,
                                            "site_no": regionalPeak._layers[i].feature.properties.site_no,
                                            "waterbody": regionalPeak._layers[i].feature.properties.waterbody
                                        }
                                    });
                                    allPeaks.push(parksWithPeaks[count].data);
                                    count++;
                                }
                            }
                        }
                    });

                    //regionaltableData.removeLayer(regionalPeak);

                    //transfer data to the peaks csv data table
                    peaksRegionalCSVData = allPeaks;

                    peaksWithinBuffer.addTo(regionalMap);
                    if (allPeaks.length === 0) {
                        console.log("no results");
                    } else {

                    }


                }
            });
        }

        function getHWMs(url, markerIcon, eventName) {

            //Get the elevation values for hwm that are inside the buffers
            var createHwmArrayReg = L.geoJson(false, {
                onEachFeature: function (feature) {
                    //find coordinates of each peak 
                    var cordsInitial = ([feature.properties.longitude_dd, feature.properties.latitude_dd]);
                    for (buffPolyCount = 0; buffPolyCount < bufferedPolys.length; buffPolyCount++) {
                        //see if peak is inside of a buffered polygon
                        var isItInsideInitial = turf.booleanPointInPolygon(cordsInitial, bufferedPolys[buffPolyCount], { ignoreBoundary: true });
                        //if peak is inside of the buffered polygon, add the corresponding peak value to an array
                        if (isItInsideInitial) {
                            hwmArrReg.push(feature.properties.elev_ft);
                        }

                    }
                }
            });
            //increment layerCount
            layerCountReg++;
            //var maxPeak = Math.max(feature.properties.peak_stage);
            regionalHWM.clearLayers();
            var currentMarkerReg = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    var labelText = feature.properties.elev_ft !== undefined ? feature.properties.elev_ft.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("elev_ft: " + labelText);
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
                    createHwmArrayReg.addData(data);
                    currentMarkerReg.addData(data);
                    currentMarkerReg.eachLayer(function (layer) {
                        layer.addTo(regionalHWM);
                    });
                    //regionalHWM.addTo(regionaltableData);
                    //checkLayerCount(layerCount);

                    // function to get only peaks within park buffer
                    setTimeout(() => {
                        var count = 0;
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
                                        // if true add it to an array containing all the 'true' regionalHWM
                                        if (isItInside) {
                                            regionalHWM._layers[i].addTo(hwmsWithinBuffer);
                                            var landsitetype = $('#typeSelect_regionalModal').val()[0] === "parks" ? buffer.properties.PARKNAME : buffer.properties.ORGNAME;
                                            parksWithHWMs.push({
                                                "site_name": landsitetype,
                                                data: {
                                                    "site_name": landsitetype,
                                                    "event": eventName,
                                                    "elev_ft": regionalHWM._layers[i].feature.properties.elev_ft,
                                                    "survey_date": regionalHWM._layers[i].feature.properties.survey_date,
                                                    "bank": regionalHWM._layers[i].feature.properties.bank,
                                                    "hwmQualityName": regionalHWM._layers[i].feature.properties.hwmQualityName,
                                                    "hwmTypeName": regionalHWM._layers[i].feature.properties.hwmTypeName,
                                                    "verticalDatumName": regionalHWM._layers[i].feature.properties.verticalDatumName,
                                                    "verticalMethodName": regionalHWM._layers[i].feature.properties.verticalMethodName,
                                                    "horizontalMethodName": regionalHWM._layers[i].feature.properties.horizontalMethodName,
                                                    "horizontalDatumName": regionalHWM._layers[i].feature.properties.horizontalDatumName,
                                                    "hwm_locationdescription": regionalHWM._layers[i].feature.properties.hwm_locationdescription,
                                                    "hwm_environment": regionalHWM._layers[i].feature.properties.hwm_environment,
                                                    "stillwater": regionalHWM._layers[i].feature.properties.stillwater,
                                                    "uncertainty": regionalHWM._layers[i].feature.properties.uncertainty,
                                                    "hwm_uncertainty": regionalHWM._layers[i].feature.properties.hwm_uncertainty,
                                                    "hwm_label": regionalHWM._layers[i].feature.properties.hwm_label,
                                                    "flag_date": regionalHWM._layers[i].feature.properties.flag_date,
                                                    "site_no": regionalHWM._layers[i].feature.properties.site_no,
                                                    "siteDescription": regionalHWM._layers[i].feature.properties.siteDescription,
                                                    "sitePermHousing": regionalHWM._layers[i].feature.properties.sitePermHousing,
                                                    "county": regionalHWM._layers[i].feature.properties.county,
                                                    "state": regionalHWM._layers[i].feature.properties.stateName,
                                                    "latitude_dd": regionalHWM._layers[i].feature.properties.latitude_dd,
                                                    "longitude_dd": regionalHWM._layers[i].feature.properties.longitude_dd,
                                                    "site_no": regionalHWM._layers[i].feature.properties.site_no,
                                                    "waterbody": regionalHWM._layers[i].feature.properties.waterbody
                                                }
                                            });
                                            allHWMs.push(parksWithHWMs[count].data);
                                            count++;
                                        }
                                    }
                                });
                            }

                            // looping through the peaks and identifying ones that are within current park poly
                            for (var i in regionalHWM._layers) {
                                var cords = ([regionalHWM._layers[i]._latlng.lng, regionalHWM._layers[i]._latlng.lat]);

                                var isItInside = turf.booleanPointInPolygon(cords, buffer, { ignoreBoundary: true });
                                // if true add it to an array containing all the 'true' regionalHWM
                                if (isItInside) {
                                    //peaksWithinBuffer.push(regionalHWM._layers[i]);
                                    var landsitetype = $('#typeSelect_regionalModal').val()[0] === "parks" ? buffer.properties.PARKNAME : buffer.properties.ORGNAME;
                                    regionalHWM._layers[i].addTo(hwmsWithinBuffer);
                                    parksWithHWMs.push({
                                        "site_name": landsitetype,
                                        data: {
                                            "site_name": landsitetype,
                                            "event": eventName,
                                            "elev_ft": regionalHWM._layers[i].feature.properties.elev_ft,
                                            "survey_date": regionalHWM._layers[i].feature.properties.survey_date,
                                            "bank": regionalHWM._layers[i].feature.properties.bank,
                                            "hwmQualityName": regionalHWM._layers[i].feature.properties.hwmQualityName,
                                            "hwmTypeName": regionalHWM._layers[i].feature.properties.hwmTypeName,
                                            "verticalDatumName": regionalHWM._layers[i].feature.properties.verticalDatumName,
                                            "verticalMethodName": regionalHWM._layers[i].feature.properties.verticalMethodName,
                                            "horizontalMethodName": regionalHWM._layers[i].feature.properties.horizontalMethodName,
                                            "horizontalDatumName": regionalHWM._layers[i].feature.properties.horizontalDatumName,
                                            "hwm_locationdescription": regionalHWM._layers[i].feature.properties.hwm_locationdescription,
                                            "hwm_environment": regionalHWM._layers[i].feature.properties.hwm_environment,
                                            "stillwater": regionalHWM._layers[i].feature.properties.stillwater,
                                            "uncertainty": regionalHWM._layers[i].feature.properties.uncertainty,
                                            "hwm_uncertainty": regionalHWM._layers[i].feature.properties.hwm_uncertainty,
                                            "hwm_label": regionalHWM._layers[i].feature.properties.hwm_label,
                                            "flag_date": regionalHWM._layers[i].feature.properties.flag_date,
                                            "siteDescription": regionalHWM._layers[i].feature.properties.siteDescription,
                                            "sitePermHousing": regionalHWM._layers[i].feature.properties.sitePermHousing,
                                            "county": regionalHWM._layers[i].feature.properties.county,
                                            "state": regionalHWM._layers[i].feature.properties.stateName,
                                            "latitude_dd": regionalHWM._layers[i].feature.properties.latitude_dd,
                                            "longitude_dd": regionalHWM._layers[i].feature.properties.longitude_dd,
                                            "site_no": regionalHWM._layers[i].feature.properties.site_no,
                                            "waterbody": regionalHWM._layers[i].feature.properties.waterbody
                                        }
                                    });
                                    allHWMs.push(parksWithHWMs[count].data);
                                    count++;
                                }
                            }
                        }
                    });

                    //regionaltableData.removeLayer(regionalPeak);
                    hwmsWithinBuffer.addTo(regionalMap);
                }
            });
        }
        //Transfer data to the csv table variable
        hwmRegionalCSVData = allHWMs;

        function getBaros(url, markerIcon) {
            //increment layerCount
            layerCountReg++;
            //var maxPeak = Math.max(feature.properties.peak_stage);
            var barosData;
            regionalBaro.clearLayers();
            var currentMarkerReg = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    //var labelText = feature.properties.elev_ft !== undefined ? feature.properties.elev_ft.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("elev_ft: " + "labelText");
                    return marker;
                },

                // leaving cause we might need this
                /* onEachFeature: function (feature, latlng) {
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                } */
            });
            var fullMarkerReg = L.geoJson(false, {
                pointToLayer: function (feature, latlng) {
                    //var labelText = feature.properties.elev_ft !== undefined ? feature.properties.elev_ft.toString() : 'No Value';
                    markerCoords.push(latlng);
                    var marker = L.marker(latlng, {
                        icon: markerIcon
                    }).bindLabel("elev_ft: " + "labelText");
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

                    //barosData.push(data);
                    currentMarkerReg.addData(data);
                    currentMarkerReg.eachLayer(function (layer) {
                        layer.addTo(regionalBaro);
                    });
                    //regionalBaro.addTo(regionaltableData);
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
                                        // if true add it to an array containing all the 'true' regionalHWM
                                        if (isItInside) {
                                            regionalBaro._layers[i].addTo(barosWithinBuffer);
                                            var landsitetype = $('#typeSelect_regionalModal').val()[0] === "parks" ? buffer.properties.PARKNAME : buffer.properties.ORGNAME;
                                            parksWithBaros.push({
                                                "site_name": landsitetype,
                                                data: {
                                                    "site_name": landsitetype,
                                                    "event": eventName,
                                                    "county": regionalBaro._layers[i].county,
                                                    "latitude_dd": regionalBaro._layers[i].latitude_dd,
                                                    "longitude_dd": regionalBaro._layers[i].longitude_dd,
                                                    "site_no": regionalBaro._layers[i].site_no,
                                                    "instrument_id": regionalBaro._layers[i].feature.properties.instrument_id
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            // looping through the peaks and identifying ones that are within current park poly
                            for (var i in regionalBaro._layers) {
                                var cords = ([regionalBaro._layers[i]._latlng.lng, regionalBaro._layers[i]._latlng.lat]);

                                var isItInside = turf.booleanPointInPolygon(cords, buffer, { ignoreBoundary: true });
                                // if true add it to an array containing all the 'true' regionalBaro
                                if (isItInside) {
                                    //peaksWithinBuffer.push(regionalBaro._layers[i]);
                                    var landsitetype = $('#typeSelect_regionalModal').val()[0] === "parks" ? buffer.properties.PARKNAME : buffer.properties.ORGNAME;
                                    //regionalBaro._layers[i].addTo(barosWithinBuffer);
                                    parksWithBaros.push({
                                        "site_name": landsitetype,
                                        data: {
                                            "site_name": landsitetype,
                                            "event": eventName,
                                            "county": regionalBaro._layers[i].feature.properties.county,
                                            "state": regionalBaro._layers[i].feature.properties.state,
                                            "latitude_dd": regionalBaro._layers[i].feature.properties.latitude_dd,
                                            "longitude_dd": regionalBaro._layers[i].feature.properties.longitude_dd,
                                            "site_no": regionalBaro._layers[i].feature.properties.site_no,
                                            "instrument_id": regionalBaro._layers[i].feature.properties.instrument_id
                                        }
                                    });
                                }
                            }
                        }
                    });
                    var test = [];
                    //regionaltableData.removeLayer(regionalPeak);
                    for (var baro in parksWithBaros) {
                        var fullSensorURL = "https://stn.wim.usgs.gov/STNServices/Instruments/" + parksWithBaros[baro].data.instrument_id + "/FullInstrument.json";
                        $.getJSON(fullSensorURL, function (instrument) {
                            fullMarkerReg.addData(instrument);
                            fullMarkerReg.eachLayer(function (layer) {
                                layer.addTo(regionalbaroQueried);
                            });
                            // regionalbaroQueried._layers[baro].addTo(barosWithinBuffer);
                            test.push({
                                "site_name": parksWithBaros[baro].site_name,
                                data: {
                                    "site_name": parksWithBaros[baro].data.site_name,
                                    "county": parksWithBaros[baro].data.county,
                                    "state": parksWithBaros[baro].data.state,
                                    "latitude_dd": parksWithBaros[baro].data.latitude_dd,
                                    "longitude_dd": parksWithBaros[baro].data.longitude_dd,
                                    "site_no": parksWithBaros[baro].data.site_no,
                                    "sensorType": regionalbaroQueried[baro].data.sensorType
                                }
                            });
                        });

                    }
                    barosWithinBuffer.addTo(regionalMap);
                }
            });
        }

        // MAKE bulk function to build table once all data has loaded
        function processData() {
            var formattedPeaks = [];
            var formattedHWMS = [];
            var formattedSensors = [];
            /* var result = Array.from(new Set(parksWithPeaks.tableData(s => s.site_name))).tableData(site_name => {
                return {
                    site_name: site_name
                }
            }); */

            function filterResults(array) {
                var result = Array.from(new Set(array.map(s => s.site_name))).map(site_name => {
                    return {
                        site_name: site_name
                    }
                });
                return result;
            };

            distinctPeaksByPark = filterResults(parksWithPeaks);
            distincthwmsByPark = filterResults(parksWithHWMs);

            for (var site in distinctPeaksByPark) {
                formattedPeaks.push({
                    "site_name": distinctPeaksByPark[site].site_name,
                    data: []
                })
                for (var peak in parksWithPeaks) {
                    if (parksWithPeaks[peak].site_name === distinctPeaksByPark[site].site_name) {
                        var data = []
                        var peakdata = {
                            "site_name": parksWithPeaks[peak].data.site_name,
                            "peak_stage": parksWithPeaks[peak].data.peak_stage,
                            "county": parksWithPeaks[peak].data.county,
                            "height_above_gnd": parksWithPeaks[peak].data.height_above_gnd,
                            "latitude_dd": parksWithPeaks[peak].data.latitude_dd,
                            "longitude_dd": parksWithPeaks[peak].data.longitude_dd,
                            "site_no": parksWithPeaks[peak].data.site_no,
                            "waterbody": parksWithPeaks[peak].data.waterbody
                        };
                        formattedPeaks[site].data.push(peakdata);
                    }
                    if (parksWithPeaks[peak].site_name !== distinctPeaksByPark[site].site_name) {

                    }
                }
            }
            for (var site in distincthwmsByPark) {
                formattedHWMS.push({
                    "site_name": distincthwmsByPark[site].site_name,
                    data: []
                })
                for (var hwm in parksWithHWMs) {
                    if (parksWithHWMs[hwm].site_name === distincthwmsByPark[site].site_name) {
                        var data = []
                        var hwmdata = {
                            "site_name": parksWithHWMs[hwm].data.site_name,
                            "elev_ft": parksWithHWMs[hwm].data.elev_ft,
                            "county": parksWithHWMs[hwm].data.county,
                            "latitude_dd": parksWithHWMs[hwm].data.latitude_dd,
                            "longitude_dd": parksWithHWMs[hwm].data.longitude_dd,
                            "site_no": parksWithHWMs[hwm].data.site_no,
                            "waterbody": parksWithHWMs[hwm].data.waterbody
                        };
                        formattedHWMS[site].data.push(hwmdata);
                    }
                    if (parksWithHWMs[hwm].site_name !== distincthwmsByPark[site].site_name) {

                    }
                }
            }

            //Sort peak and hwm arrays
            peakArrReg = peakArrReg.sort();
            hwmArrReg = hwmArrReg.sort();
            var sum = []
            var peakSum = {};
            var hwmSum = {};

            //variables for regional summary table
            var meanReg;
            var minReg;
            var maxReg;
            var medianReg;
            var confIntNinetyHigh;
            var confIntNinetyLow;

            //Create peak row in regional summary table
            getSummaryStats([5, 10, 15]);
            if (formattedPeaks.length > 0) {
                peakSum = { "Type": "Peak", "Total Sites": numReg, "Max": maxReg, "Min": minReg, "Median": medianReg, "Mean": meanReg, "Standard Dev": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
                sum.push(peakSum);
            }

            //Create hwm row in regional summary table
            getSummaryStats([5]);
            if (formattedHWMS.length > 0) {
                hwmSum = { "Type": "HWM", "Total Sites": numReg, "Max": maxReg, "Min": minReg, "Median": medianReg, "Mean": meanReg, "Standard Dev": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
                sum.push(hwmSum);
            }

            //Summary stats to populate regional report summary table
            function getSummaryStats(dataArray) {
                meanReg = numbers.statistic.mean(dataArray);
                medianReg = numbers.statistic.median(dataArray);
                minReg = numbers.basic.min(dataArray);
                maxReg = numbers.basic.max(dataArray);
                numReg = dataArray.length;
                standReg = numbers.statistic.standardDev(dataArray);
                var confIntTemp = 1.645 * (standReg/Math.sqrt(numReg));
                confIntNinetyHigh = meanReg + confIntTemp;
                confIntNinetyLow = meanReg - confIntTemp;

                //Round Results
                meanReg = meanReg.toFixed(3);
                standReg = standReg.toFixed(3);
                confIntNinetyHigh = confIntNinetyHigh.toFixed(3);
                confIntNinetyLow = confIntNinetyLow.toFixed(3);
            }


            // Builds the HTML Table
            function buildDataTables(table, data, type) {
                $(table).prepend("<p>" + "<b>" + type + "</b>" + "</p>")
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

            if (allPeaks.length > 0) {
                buildDataTables("#summaryDataTable", sum, "Summary Information");
                buildDataTables("#peakDataTableReg", allPeaks, "Peak Data");
                buildDataTables("#hwmDataTableReg", allHWMs, "HWM Data");
            }
        }

        // PEAK FUNCTIONS
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
        //peaksRegionalCSVData = peaksDataTable;

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

        // END TABLE FUNCTIONS
    });

    //Corresponds with the 'HWM CSV' button on the regional report modal
    $('#saveRegionalHWMCSV').click(function () {
        //if there is a hwm table, download as csv
        if (hwmRegionalCSVData.length > 0) {
            downloadRegionalCSV("hwm");
        }
        //if there are no hwm markers within the buffer, exit
        else {
            console.log("There are no hwm datapoints.")
        }
    });
    //Corresponds with the 'Peak CSV' button on the regional report modal
    $('#saveRegionalPeakCSV').click(function () {
        //if there is a hwm table, download as csv

        if (peaksRegionalCSVData.length > 0) {
            downloadRegionalCSV("peaks");
        }
        //if there are no peak markers within the buffer, exit
        else {
            console.log("There are no peak datapoints.")
        }

    });

});

//This runs when clicking the 'Peak CSV' or 'HWM CSV' button on the Report modal
function downloadRegionalCSV(type) {
    //Format name of park or refuge
    //var siteName = searchResults.result.properties.Name.split(" ").join("_");

    switch (type) {
        //If 'HWM CSV' is clicked, download the HWM table
        case "hwm":
            generateCSV({
                filename: "HWM.csv",
                data: hwmRegionalCSVData,
                headers: fevRegional.csvRegionalHWMColumns
            });
            break;
        //If 'Peak CSV' is clicked, download the Peak table
        case "peaks":
            generateCSV({
                filename: "Peak.csv",
                data: peaksRegionalCSVData,
                headers: fevRegional.csvRegionalPeaksColumns
            });
            break;
        default:
            break;
    }
}



