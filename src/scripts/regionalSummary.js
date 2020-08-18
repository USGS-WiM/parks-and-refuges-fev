// setting global variables for the regional summary
var regionalMap;
var alreadyRan = false;
var layerCountReg = 0;
var selectedRegion = "";
var selectedEvents = [];
var selectedEventsNames = [];
var selectedLandType;
var regionPoly = [];
var regionBoundaries;
var flattenedRegionalPoly;
var simplifiedRegionalPoly;
var simpPoly = [];
var peakSiteSummaries = [];
var hwmSiteSummaries = [];
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
var parksWithPeaksEOne = [];
var parksWithPeaksETwo = [];
var parksWithHWMsEOne = [];
var parksWithHWMsETwo = [];
var executed = false;
var regionalPeak = L.layerGroup();
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
var allHWMEOne = [];
var allHWMETwo = [];
var allPeaksEOne = [];
var allPeaksETwo = [];
var eventsPeakRange = []
var totalSites = [];
var siteList = [];
var hwmRegionalCSVData = [];
var peaksRegionalCSVData = [];
//This array will be populated with the peak values from peaks within the buffered regions
var peakArrReg = [];
var hwmArrReg = [];
//var regionBBox = [];
//var regionalStreamGages = L.featureGroup();


var fevRegional = fevRegional || {
    //Assign column names for the regional peak table csv download
    csvRegionalPeaksColumns: [
        { fieldName: 'Site Name', colName: "Site Name" },
        { fieldName: 'Event', colName: "Event" },
        { fieldName: 'Peak Stage (ft)', colName: "Peak Stage (ft)" },
        { fieldName: 'County', colName: "County" },
        { fieldName: 'Latitude (DD)', colName: "Latitude (DD)" },
        { fieldName: 'Longitude (DD)', colName: "Longitude (DD)" },
        { fieldName: 'Site Number', colName: "Site Number" },
        { fieldName: 'Waterbody', colName: "Waterbody" },
    ],
    //Assign column names for the regional hwm table csv download
    csvRegionalHWMColumns: [
        { fieldName: 'Site Name', colName: "Site Name" },
        { fieldName: 'Event', colName: "Event" },
        { fieldName: 'Elevation (ft)', colName: "Elevation" },
        { fieldName: 'Survey Date', colName: "Survey Date" },
        { fieldName: 'Bank', colName: "Bank" },
        { fieldName: 'HWM Quality', colName: "HWM Quality" },
        { fieldName: 'HWM Type', colName: "HWM Type" },
        { fieldName: 'Vertical Datum', colName: "Vertical Datum" },
        { fieldName: 'Vertical Method', colName: "Vertical Method" },
        { fieldName: 'Horizontal Method', colName: "Horizontal Method" },
        { fieldName: 'Horizontal Datum', colName: "Horizontal Datum" },
        { fieldName: 'Location Description', colName: "HWM Location Description" },
        { fieldName: 'Environment', colName: "HWM Environment" },
        { fieldName: 'Stillwater', colName: "Stillwater" },
        { fieldName: 'Uncertainty', colName: "Uncertainty" },
        { fieldName: 'HWM Uncertainty', colName: "HWM Uncertainty" },
        { fieldName: 'HWM Label', colName: "HWM Label" },
        { fieldName: 'Flag Date', colName: "Flag Date" },
        { fieldName: 'Site Description', colName: "Site Description" },
        { fieldName: 'Site Perm Housing', colName: "Permanent Housing Site" },
        { fieldName: 'County', colName: "County" },
        { fieldName: 'State', colName: "HWM State" },
        { fieldName: 'Latitude (DD)', colName: "Latitude (DD)" },
        { fieldName: 'Longitude (DD)', colName: "Longitude (DD)" },
        { fieldName: 'Site Number', colName: "Site Number" },
        { fieldName: 'Waterbody', colName: "Waterbody" },
    ],
}

// URLS
var eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
var parksURL = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=";
var peaksURL = "https://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json?Event=";

$(document).ready(function () {
    $('#btnChooseRegion').click(function () {

        // for some reason tableData loading incompletely without timeout
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

            var regionBasemap = L.esri.basemapLayer('Topographic').addTo(regionalMap);
        }, 800);

        // checking for region entry when region input is changed

        /* if ((($('#regionSelect_regionalModal').val() !== null)) && (($('#typeSelect_regionalModal').val() !== null)) && 
        (($('#evtSelect_regionalModal').val() !== null)) && (($('#regionSelect_regionalModal').val() !== null)) && 
        (($('#bufferSelect_regionalModal').val() !== null))) { */

    });



    $('#btnSubmitSelections').click(function () {


        /* $('.progress-bar-fill').delay(1000).queue(function () {
            $(this).css('width', '100%')
        }); */
        document.querySelector('.progress-bar-fill').style.width = "100%"

        // todo: make this set to variable

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

        switch ($('#typeSelect_regionalModal').val()[0]) {
            case 'refuges':
                regionURL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_Legacy_Regional_Boundaries/FeatureServer/0';
                whereValue = "REGNAME=" + selectedRegion;
                break;
            case 'parks':
                regionURL = 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/nps_regions_rev/FeatureServer/0';
                whereValue = "reg_name" + selectedRegion;
                break;
        }

        /* if ($('#regionType_regionalModal').val()[0] === "doi") {
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
                        simplifiedRegionalPoly = turf.simplify(regionPoly);
                    }
                }).addTo(regionalMap);
            regionLayerGroup.addLayer(regionBoundaries);
        } */if ($('#typeSelect_regionalModal').val()[0] === "refuges") {
            regionBoundaries = L.esri.featureLayer({
                useCors: false,
                url: regionURL,
                where: "REGNAME='" + selectedRegion + "'",
                style: regionStyle,
                /* onEachFeature: function (feature, latlng) {
                    regionPoly = feature.geometry;
                    flattenedRegionalPoly = turf.flatten(regionPoly);
                    simplifiedRegionalPoly = turf.simplify(regionPoly);
                } */
            }).addTo(regionalMap);
            regionLayerGroup.addLayer(regionBoundaries);
        } else if ($('#typeSelect_regionalModal').val()[0] === "parks") {
            regionBoundaries = L.esri.featureLayer({
                useCors: false,
                url: regionURL,
                where: "reg_name='" + selectedRegion + "'",
                style: regionStyle,
                /* onEachFeature: function (feature, latlng) {
                    regionPoly = feature.geometry;
                    flattenedRegionalPoly = turf.flatten(regionPoly);
                    simplifiedRegionalPoly = turf.simplify(regionPoly);
                } */
            }).addTo(regionalMap);

            regionLayerGroup.addLayer(regionBoundaries);
        }
        // TODO: explore options to avoid this timeout. dealing with motely crew of services that is making it difficult atm
        /* simplifiedRegionalPoly.coordinates.forEach(function (coords) {
            var feat = { 'type': 'Polygon', 'coordinates': coords };
            simpPoly.push(feat);
        }); */




        // Identify parks/refuges in event in regions
        var allSites;
        var siteRegion;
        if (selectedLandType[0] === "parks") {
            // Region conversions for site layers 
            switch (selectedRegion[0]) {
                case 'Alaska':
                    siteRegion = "AK"
                    break;
                case 'Midwest':
                    siteRegion = "MW"
                    break;
                case 'Southeast':
                    siteRegion = "SE"
                    break;
                case 'Pacific West':
                    siteRegion = "PW"
                    break;
                case 'Intermountain':
                    siteRegion = "IM"
                    break;
                case 'Northeast':
                    siteRegion = "NE"
                    break;
                case 'National Capital':
                    siteRegion = "NC"
                    break;
            }
            allSites = L.esri.featureLayer({
                //useCors: false,
                url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2',
                where: "REGION='" + siteRegion + "'",
                fields: ["*"],
                style: parkStyle,
                onEachFeature: function (feature) {
                    regionParksFC.push(feature)
                },
            }).addTo(regionalMap);
        } else if (selectedLandType[0] === "refuges") {
            // Region conversions for site layers 
            switch (selectedRegion[0]) {
                case 'Alaska Region':
                    siteRegion = "7"
                    break;
                case 'Midwest Region':
                    siteRegion = "3"
                    break;
                case 'Southeast Region':
                    siteRegion = "4"
                    break;
                case 'Mountain Prairie Region':
                    siteRegion = "6"
                    break;
                case 'Northeast Region':
                    siteRegion = "5"
                    break;
                case 'Pacific Region':
                    siteRegion = "1"
                    break;
                case 'Pacific Southwest Region':
                    siteRegion = "8"
                    break;
                case 'Southwest Region':
                    siteRegion = "2"
                    break;
            }
            allSites = L.esri.featureLayer({
                //useCors: false,
                url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved_Authoritative/FeatureServer/1',
                where: "FWSREGION='" + siteRegion + "'",
                fields: ["*"],
                style: parkStyle,
                onEachFeature: function (feature) {
                    regionParksFC.push(feature)
                },
            }).addTo(regionalMap);
        }

        var simplifiedSites = [];
        setTimeout(() => {
            var length = regionParksFC.length;
            length = length - 1;
            for (var p = 0; p < regionParksFC.length; p++) {
                if (regionParksFC[p].properties.OBJECTID !== 169) {
                    var options = { tolerance: 0.5, highQuality: false, mutate: true };
                    //var flatten = turf.flatten(regionParksFC[p]);
                    var simplify = turf.simplify(regionParksFC[p], options);
                    simplifiedSites.push(simplify);

                    if (p === length) {
                        getbuffers();
                    }
                }
            };
        }, 5000);






        // lopping through each poly of the regional poly since esri-leaflet can't handle multipolygons at the version we're at
        /* if (flattenedRegionalPoly !== undefined) {
            for (var p = 0; p < flattenedRegionalPoly.features.length; p++) {
                allSites.query()
                    //.within(flattenedRegionalPoly.features[p])
                    //.bboxIntersects(flattenedRegionalPoly.features[p])
                    .intersects(flattenedRegionalPoly.features[p])
                    .run(function (error, featureCollection, response) {
                        if (featureCollection !== null) {
                            if (featureCollection.features.length !== 0) {
                                regionParksFC.push(featureCollection);
                            }
                        }

                    });
            }
        } */
        /* setTimeout(() => {
            if (flattenedRegionalPoly !== undefined) {
                for (var p = 0; p < flattenedRegionalPoly.features.length; p++) {
 
                    allSites.query()
                        .within(flattenedRegionalPoly.features[p])
                        //.bboxIntersects(flattenedRegionalPoly.features[p])
                        //.intersects(flattenedRegionalPoly.features[p])
                        .run(function (error, featureCollection, response) {
                            if (featureCollection !== null) {
                                if (featureCollection.features.length !== 0) {
                                    regionParksFC.push(featureCollection);
                                }
                            }
                        });
                }
            }
        }, 1000); */

        //Get the bounding box for the region
        //regionBBox = turf.bbox(regionPoly);
        //format the bounding box so that it can be used in queryStreamGages
        //regionBBox = regionBBox[0] + ',' + regionBBox[1] + ',' + regionBBox[2] + ',' + regionBBox[3];

        //Since the bounding box is way too big, we could need to cut it into a bunch of sub-regions for it to work
        //To test out the general layout, etc. use the bounding box alone, which, for Hurricane Dorian, will retrieve 2 gages near the Florida border
        /*regionBBox = -81.7300415 + ',' + 30.6795540 + ',' + -81.1814117 + ',' + 30.8541951;
        
        function queryStreamGages(bbox) {
            var NWISmarkers = {};
            console.log("entering queryStreamgages");
            console.log(regionBBox);
        
            //NWIS query options from http://waterservices.usgs.gov/rest/IV-Test-Tool.html
            var parameterCodeList = '00065,62619,62620,63160,72214';
            var siteTypeList = 'OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS';
            var siteStatus = 'active';
            var url = 'https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=' + bbox + '&parameterCd=' + parameterCodeList + '&siteType=' + siteTypeList + '&siteStatus=' + siteStatus;
        
            console.log("stream gage url", url);
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
                        regionalStreamGages.addLayer(NWISmarkers[siteID]);
                        console.log("added regionalStreamGage");
        
                        $("#nwisLoadingAlert").fadeOut(2000);
                    });
                },
                error: function (xml) {
                    $("#nwisLoadingAlert").fadeOut(2000);
                }
            });
        }
        */

        /*   
function displayRegionalRtGageReport(regionalStreamGages) {
 
   for (streamGage in regionalStreamGages) {
 
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
       $('#hydrographTableReg').append("<div style='text-align: left'>" + "</br>" + regionalStreamGages[streamGage].data.siteName + " (Site" + "&nbsp" + regionalStreamGages[streamGage].data.siteCode + ")" + "</br>" + "</div>");
   }
}
*/




        /* setTimeout(() => {
            if (simplifiedSites.length !== 0) {
                
            }
            
        }, 4000); */





        //getbuffers();
        // getting the park buffers base on the buffer size selection value
        function getbuffers() {
            setTimeout(() => {
                if (simplifiedSites !== undefined) {
                    var polygons = [];
                    for (var p = 0; p < simplifiedSites.length; p++) {
                        var polysCount;
                        var buffer;
                        var feature;
                        /* if ($('#typeSelect_regionalModal').val()[0] === "parks") {
                            feature = simplifiedSites[p];
                        }  */
                        // Attempting to merge polygons for sites that contain multiple. Encounting error turf error found non-noded intersection between LINESTRING union.
                        /* else if ($('#typeSelect_regionalModal').val()[0] === "refuges") {
                            var singlePoly = [];
                            if (simplifiedSites[p].geometry.type === "MultiPolygon") {
                                simplifiedSites[p].geometry.coordinates.forEach(function (coords) {
                                    //var feat = { 'type': 'Polygon', 'properties': {}, 'coordinates': coords };
                                    //singlePoly.push(feat);
                                    var feat = turf.polygon([coords[0]]);
                                    singlePoly.push(feat);
                                });
                                polysCount = singlePoly.length;
                                var buffer = singlePoly[0];
                                for (var i = 0; i < singlePoly.length; i++) {
                                    // not cycling through if we're on the last one
                                    if (i === (polysCount - 1)) {
    
                                    } else {
    
                                        // getting the index of the next feature to use in the union
                                        var nextFeatureIndex = i + 1;
                                        var nextFeature = singlePoly[nextFeatureIndex];
    
                                        // unifying or merging the buffer
                                        buffer = turf.union(buffer, nextFeature);
                                    }
                                }
                                //feature = turf.featureCollection([buffer]);
                            } else if (simplifiedSites[p].length === 1) {
                                feature = simplifiedSites[p];
                            }
                        } */
                        feature = simplifiedSites[p];
                        //var simplified = turf.simplify(feature, options);
                        var buffered = turf.buffer(feature, bufferSize, { units: 'kilometers' });
                        bufferedPolys.push(buffered);

                    }

                }
                L.geoJson(bufferedPolys, { style: bufferStyle }).addTo(regionalMap);
                getEventSpecificData();
            }, 2000);
        }


        // looping through each event and sensor data
        function getEventSpecificData() {
            if (selectedEvents.length === 1) {
                var eventNumber = 1
                eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                eventURL = eventURL + selectedEvents[0] + '.json';
                var queryString = "?Event=" + selectedEvents[0] + "&States=&County=&StartDate=undefined&EndDate=undefined";
                var sensorQueryString = "?Event=" + selectedEvents[0] + "&States=&County=&SensorType=&CurrentStatus=&CollectionCondition=&DeploymentType=";

                getEventName(function (output) {
                    eventName = output.event_name;
                    selectedEventsNames.push(eventName);
                    /*
                    queryStreamGages(regionBBox);
                    regionalStreamGages.addTo(regionalMap);
                    displayRegionalRtGageReport(regionalStreamGages);
                    */
                    getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + queryString, regionalPeakMarkerIcon, eventName, eventNumber);
                    getHWMs(fev.urls.hwmFilteredGeoJSONViewURL + queryString, regionalhwmIcon, eventName, eventNumber);
                });

                // function for getting the event data
                function getEventName(handleData) {
                    var data;
                    $.ajax({
                        dataType: "json",
                        url: eventURL,
                        data: data,
                        success: function (data) {
                            handleData(data);
                        },
                        error: function (error) {
                            console.log('Error processing the JSON. The error is:' + error);
                        }
                    });
                }

                // PEAKS

                // HWMS


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
                    regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                    processData(eventNumber);
                    regionalMap.zoomIn();
                }, 2000);
            } else if (selectedEvents.length === 2) {
                var eventNumber = 1;
                eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                eventURL = eventURL + selectedEvents[0] + '.json';
                var queryString = "?Event=" + selectedEvents[0] + "&States=&County=&StartDate=undefined&EndDate=undefined";
                var sensorQueryString = "?Event=" + selectedEvents[0] + "&States=&County=&SensorType=&CurrentStatus=&CollectionCondition=&DeploymentType=";

                getEventName(function (output) {
                    eventName = output.event_name;
                    selectedEventsNames.push(eventName);
                    /*
                    queryStreamGages(regionBBox);
                    regionalStreamGages.addTo(regionalMap);
                    displayRegionalRtGageReport(regionalStreamGages);
                    */
                    getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + queryString, regionalPeakMarkerIcon, eventName, eventNumber);
                    getHWMs(fev.urls.hwmFilteredGeoJSONViewURL + queryString, regionalhwmIcon, eventName, eventNumber);
                });

                // function for getting the event data
                function getEventName(handleData) {
                    var data;
                    $.ajax({
                        dataType: "json",
                        url: eventURL,
                        data: data,
                        success: function (data) {
                            handleData(data);
                        },
                        error: function (error) {
                            console.log('Error processing the JSON. The error is:' + error);
                        }
                    });
                }

                setTimeout(() => {
                    regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                    processData(eventNumber);
                    nextEvent();
                }, 2000);

                function nextEvent() {
                    eventNumber = 2;
                    eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                    eventURL = eventURL + selectedEvents[1] + '.json';
                    var queryString = "?Event=" + selectedEvents[1] + "&States=&County=&StartDate=undefined&EndDate=undefined";
                    var sensorQueryString = "?Event=" + selectedEvents[1] + "&States=&County=&SensorType=&CurrentStatus=&CollectionCondition=&DeploymentType=";

                    getEventName(function (output) {
                        eventName = output.event_name;
                        selectedEventsNames.push(eventName);
                        /*
                        queryStreamGages(regionBBox);
                        regionalStreamGages.addTo(regionalMap);
                        displayRegionalRtGageReport(regionalStreamGages);
                        */
                        getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + queryString, regionalPeakMarkerIcon, eventName, eventNumber);
                        getHWMs(fev.urls.hwmFilteredGeoJSONViewURL + queryString, regionalhwmIcon, eventName, eventNumber);
                    });

                    // function for getting the event data
                    function getEventName(handleData) {
                        var data;
                        $.ajax({
                            dataType: "json",
                            url: eventURL,
                            data: data,
                            success: function (data) {
                                handleData(data);
                            },
                            error: function (error) {
                                console.log('Error processing the JSON. The error is:' + error);
                            }
                        });
                    }

                    setTimeout(() => {
                        regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                        processData(eventNumber);
                        regionalMap.zoomIn();
                    }, 2000);
                }


            }

            /* if (alreadyRan !== true) {
                if (selectedEvents.length > 0) {
                    alreadyRan = true;
                    for (var e = 0; e < selectedEvents.length; e++) {
                        // Getting event name

                        // resetting event url

                        eventURL = "https://stn.wim.usgs.gov/STNServices/Events/";
                        eventURL = eventURL + selectedEvents[e] + '.json';
                        var queryString = "?Event=" + selectedEvents[e] + "&States=&County=&StartDate=undefined&EndDate=undefined";
                        var sensorQueryString = "?Event=" + selectedEvents[e] + "&States=&County=&SensorType=&CurrentStatus=&CollectionCondition=&DeploymentType=";

                        getEventName(function (output) {
                            eventName = output.event_name;
                           
                            //queryStreamGages(regionBBox);
                            //regionalStreamGages.addTo(regionalMap);
                            //displayRegionalRtGageReport(regionalStreamGages);
    
                            getPeaks(fev.urls.peaksFilteredGeoJSONViewURL + queryString, regionalPeakMarkerIcon, eventName);
                            getHWMs(fev.urls.hwmFilteredGeoJSONViewURL + queryString, regionalhwmIcon, eventName);
                        });

                        // function for getting the event data
                        function getEventName(handleData) {
                            var data;
                            $.ajax({
                                dataType: "json",
                                url: eventURL,
                                data: data,
                                success: function (data) {
                                    handleData(data);
                                },
                                error: function (error) {
                                    console.log('Error processing the JSON. The error is:' + error);
                                }
                            });
                        }

                        async function waitToDoData() {
                            console.log('before promise call')
                            regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                            console.log('promise resolved: ' + result)
                            console.log('next step')
                            
                            
                        }
                        // PEAKS

                        // HWMS


                        // BARO
                        //getBaros(fev.urls.baroGeoJSONViewURL + sensorQueryString, regionalbaroMarkerIcon);

                         // STORMTIDE
                        //getStormtides(fev.urls.stormtideGeoJSONViewURL + sensorQueryString, regionalstormtideMarkerIcon);
    
                        // MET
                        //getMets(fev.urls.metGeoJSONViewURL + sensorQueryString, regionalmetMarkerIcon);
    
                        // WAVEHEIGHT
                        //getWaveheights(fev.urls.waveheightGeoJSONViewURL + sensorQueryString, regionalwaveheightMarkerIcon);
    
                        // RDG
                        //getRDGs(fev.urls.rdgGeoJSONViewURL + sensorQueryString, regionalrdgMarkerIcon);

                        setTimeout(() => {
                            regionalMap.fitBounds(peaksWithinBuffer.getBounds());
                            processData();
                        }, 2000);



                    }
                }
            } */
        }



        // creating markers for peaks
        function getPeaks(url, markerIcon, eventName, eventNumber) {
            //Create variables for scaling peak label sizes
            var parksWPeakStorage = [];
            var allPeaksStorage = [];
            peakArrReg = [];
            var lengthPeak = [];
            var sortedPeaks = [];
            var thirdLength = [];
            var thirdVal = [];
            var twoThirdVal = [];
            var typeData;

            var createPeakArrayReg = L.geoJson(false, {
                onEachFeature: function (feature) {
                    //find coordinates of each peak 
                    var cordsInitial = ([feature.properties.longitude_dd, feature.properties.latitude_dd]);
                    for (buffPolyCount = 0; buffPolyCount < bufferedPolys.length; buffPolyCount++) {
                        //see if peak is inside of a buffered polygon
                        var isItInsideInitial = turf.booleanPointInPolygon(cordsInitial, bufferedPolys[buffPolyCount], { ignoreBoundary: true });
                        //if peak is inside of the buffered polygon, add the corresponding peak value to an array
                        if (isItInsideInitial) {
                            typeData = typeof feature.properties.peak_stage;
                            if (typeData == "number") {
                                peakArrReg.push(feature.properties.peak_stage);
                            }
                        }

                    }

                    //sort array of peak values
                    sortedPeaks = peakArrReg.sort(function (a, b) { return a - b });

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
                                        parksWPeakStorage.push({
                                            "site_name": landsitetype,
                                            data: {
                                                "Site Name": landsitetype,
                                                "Event": eventName,
                                                "Peak Stage (ft)": regionalPeak._layers[i].peak_stage,
                                                "County": regionalPeak._layers[i].county,
                                                "Latitude (DD)": regionalPeak._layers[i].latitude_dd,
                                                "Longitude (DD)": regionalPeak._layers[i].longitude_dd,
                                                "Site Number": regionalPeak._layers[i].site_no,
                                                "Waterbody": regionalPeak._layers[i].waterbody
                                            }
                                        });
                                        allPeaksStorage.push(parksWPeakStorage[count].data);
                                        //peaksRegionalCSVData = parksWithPeaksEOne;
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
                                parksWPeakStorage.push({
                                    "site_name": landsitetype,
                                    data: {
                                        "Site Name": landsitetype,
                                        "Event": eventName,
                                        "Peak Stage (ft)": regionalPeak._layers[i].feature.properties.peak_stage,
                                        "County": regionalPeak._layers[i].feature.properties.county,
                                        "Latitude (DD)": regionalPeak._layers[i].feature.properties.latitude_dd,
                                        "Longitude (DD)": regionalPeak._layers[i].feature.properties.longitude_dd,
                                        "Site Number": regionalPeak._layers[i].feature.properties.site_no,
                                        "Waterbody": regionalPeak._layers[i].feature.properties.waterbody
                                    }
                                });
                                allPeaksStorage.push(parksWPeakStorage[count].data);
                                count++;
                            }
                        }
                    }


                    // Filtering out duplicates that fall within 2 different buffers
                    allPeaksStorage = allPeaksStorage.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
                    // transfer data to the peaks csv data table
                    peaksRegionalCSVData.push(allPeaksStorage);

                    if (eventNumber == 1) {
                        allPeaksEOne = allPeaksStorage;
                        parksWithPeaksEOne = parksWPeakStorage;
                    } else if (eventNumber == 2) {
                        allPeaksETwo = allPeaksStorage;
                        parksWithPeaksETwo = parksWPeakStorage;
                    }

                    peaksWithinBuffer.addTo(regionalMap);
                }
            });
        }

        function getHWMs(url, markerIcon, eventName, eventNumber) {
            var parksWHWMStorage = [];
            var allHWMStorage = [];
            hwmArrReg = [];
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
                            if (feature.properties.elev_ft !== undefined) {
                                hwmArrReg.push(feature.properties.elev_ft);
                            }
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
                                        parksWHWMStorage.push({
                                            "site_name": landsitetype,
                                            data: {
                                                "Site Name": landsitetype,
                                                "Event": eventName,
                                                "Elevation (ft)": regionalHWM._layers[i].feature.properties.elev_ft,
                                                "Survey Date": regionalHWM._layers[i].feature.properties.survey_date,
                                                "Bank": regionalHWM._layers[i].feature.properties.bank,
                                                "HWM Quality": regionalHWM._layers[i].feature.properties.hwmQualityName,
                                                "HWM Type": regionalHWM._layers[i].feature.properties.hwmTypeName,
                                                "Vertical Datum": regionalHWM._layers[i].feature.properties.verticalDatumName,
                                                "Vertical Method": regionalHWM._layers[i].feature.properties.verticalMethodName,
                                                "Horizontal Method": regionalHWM._layers[i].feature.properties.horizontalMethodName,
                                                "Horizontal Datum": regionalHWM._layers[i].feature.properties.horizontalDatumName,
                                                "Location Description": regionalHWM._layers[i].feature.properties.hwm_locationdescription,
                                                "Environment": regionalHWM._layers[i].feature.properties.hwm_environment,
                                                "Stillwater": regionalHWM._layers[i].feature.properties.stillwater,
                                                "Uncertainty": regionalHWM._layers[i].feature.properties.uncertainty,
                                                "HWM Uncertainty": regionalHWM._layers[i].feature.properties.hwm_uncertainty,
                                                "HWM Label": regionalHWM._layers[i].feature.properties.hwm_label,
                                                "Flag Date": regionalHWM._layers[i].feature.properties.flag_date,
                                                "Site Description": regionalHWM._layers[i].feature.properties.siteDescription,
                                                "Site Perm Housing": regionalHWM._layers[i].feature.properties.sitePermHousing,
                                                "County": regionalHWM._layers[i].feature.properties.county,
                                                "State": regionalHWM._layers[i].feature.properties.stateName,
                                                "Latitude (DD)": regionalHWM._layers[i].feature.properties.latitude_dd,
                                                "Longitude (DD)": regionalHWM._layers[i].feature.properties.longitude_dd,
                                                "Site Number": regionalHWM._layers[i].feature.properties.site_no,
                                                "Waterbody": regionalHWM._layers[i].feature.properties.waterbody
                                            }
                                        });
                                        allHWMStorage.push(parksWHWMStorage[count].data);
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
                                parksWHWMStorage.push({
                                    "site_name": landsitetype,
                                    data: {
                                        "Site Name": landsitetype,
                                        "Event": eventName,
                                        "Elevation (ft)": regionalHWM._layers[i].feature.properties.elev_ft,
                                        "Survey Date": regionalHWM._layers[i].feature.properties.survey_date,
                                        "Bank": regionalHWM._layers[i].feature.properties.bank,
                                        "HWM Quality": regionalHWM._layers[i].feature.properties.hwmQualityName,
                                        "HWM Type": regionalHWM._layers[i].feature.properties.hwmTypeName,
                                        "Vertical Datum": regionalHWM._layers[i].feature.properties.verticalDatumName,
                                        "Vertical Method": regionalHWM._layers[i].feature.properties.verticalMethodName,
                                        "Horizontal Method": regionalHWM._layers[i].feature.properties.horizontalMethodName,
                                        "Horizontal Datum": regionalHWM._layers[i].feature.properties.horizontalDatumName,
                                        "Location Description": regionalHWM._layers[i].feature.properties.hwm_locationdescription,
                                        "Environment": regionalHWM._layers[i].feature.properties.hwm_environment,
                                        "Stillwater": regionalHWM._layers[i].feature.properties.stillwater,
                                        "Uncertainty": regionalHWM._layers[i].feature.properties.uncertainty,
                                        "HWM Uncertainty": regionalHWM._layers[i].feature.properties.hwm_uncertainty,
                                        "HWM Label": regionalHWM._layers[i].feature.properties.hwm_label,
                                        "Flag Date": regionalHWM._layers[i].feature.properties.flag_date,
                                        "Site Description": regionalHWM._layers[i].feature.properties.siteDescription,
                                        "Site Perm Housing": regionalHWM._layers[i].feature.properties.sitePermHousing,
                                        "County": regionalHWM._layers[i].feature.properties.county,
                                        "State": regionalHWM._layers[i].feature.properties.stateName,
                                        "Latitude (DD)": regionalHWM._layers[i].feature.properties.latitude_dd,
                                        "Longitude (DD)": regionalHWM._layers[i].feature.properties.longitude_dd,
                                        "Site Number": regionalHWM._layers[i].feature.properties.site_no,
                                        "Waterbody": regionalHWM._layers[i].feature.properties.waterbody
                                    }
                                });
                                allHWMStorage.push(parksWHWMStorage[count].data);

                                count++;
                            }
                        }
                    }
                    // Filtering out duplicates that fall within 2 different buffers
                    allHWMStorage = allHWMStorage.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
                    // transfer data to the peaks csv data table
                    hwmRegionalCSVData.push(allHWMStorage);

                    if (eventNumber == 1) {
                        allHWMEOne = allHWMStorage;
                        parksWithHWMsEOne = parksWHWMStorage;
                    } else if (eventNumber == 2) {
                        allHWMETwo = allHWMStorage;
                        parksWithHWMsETwo = parksWHWMStorage;
                    }

                    hwmsWithinBuffer.addTo(regionalMap);
                }
            });
        }

        //Transfer data to the csv table variable




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
        function processData(eventNumber) {
            var peakStorage = [];
            var hwmStorage = [];
            if (eventNumber == 1) {
                peakStorage = parksWithPeaksEOne;
                hwmStorage = parksWithHWMsEOne;
            } else if (eventNumber == 2) {
                peakStorage = parksWithPeaksETwo;
                hwmStorage = parksWithHWMsETwo;
            }
            $('#saveRegionalPeakCSV').removeAttr('disabled');
            $('#saveRegionalHWMCSV').removeAttr('disabled');
            $('#printRegionalReport').removeAttr('disabled');
            var formattedPeaks = [];
            var formattedHWMS = [];
            var formattedSensors = [];

            // getting distinct sites based on name
            function filterResults(array) {
                var result = Array.from(new Set(array.map(s => s.site_name))).map(site_name => {
                    return {
                        site_name: site_name
                    }
                });
                return result;
            };

            distinctPeaksByPark = filterResults(peakStorage);
            distincthwmsByPark = filterResults(hwmStorage);

            // calculating summary stats
            var siteSumPeakVals = [];
            var siteSumHWMVals = [];

            for (var site in distinctPeaksByPark) {
                siteSumPeakVals.push({
                    "site_name": distinctPeaksByPark[site].site_name,
                    data: []
                });
                formattedPeaks.push({
                    "site_name": distinctPeaksByPark[site].site_name,
                    data: []
                });
                for (var peak in peakStorage) {
                    if (peakStorage[peak].site_name === distinctPeaksByPark[site].site_name) {
                        var peakdata = {
                            "Site Name": peakStorage[peak].data['Site Name'],
                            "Peak Stage (ft)": peakStorage[peak].data['Peak Stage (ft)'],
                            "County": peakStorage[peak].data['County'],
                            "Height Above Ground (ft)": peakStorage[peak].data['Height Above Ground (ft)'],
                            "Latitude (DD)": peakStorage[peak].data['Latitude (DD)'],
                            "Longitude (DD)": peakStorage[peak].data['Longitude (DD)'],
                            "Site Number": peakStorage[peak].data['Site Number'],
                            "Waterbody": peakStorage[peak].data['Waterbody']
                        };

                        if (peakStorage[peak].data['Peak Stage (ft)'] !== undefined) {
                            siteSumPeakVals[site].data.push(peakStorage[peak].data['Peak Stage (ft)']);
                        }

                        formattedPeaks[site].data.push(peakdata);
                    }
                    if (peakStorage[peak].site_name !== distinctPeaksByPark[site].site_name) {

                    }
                }
            }
            for (var site in distincthwmsByPark) {
                siteSumHWMVals.push({
                    "site_name": distincthwmsByPark[site].site_name,
                    data: []
                });
                formattedHWMS.push({
                    "site_name": distincthwmsByPark[site].site_name,
                    data: []
                })
                for (var hwm in hwmStorage) {
                    if (hwmStorage[hwm].site_name === distincthwmsByPark[site].site_name) {
                        var data = []
                        var hwmdata = {
                            "Site Name": hwmStorage[hwm].data['Site Name'],
                            "Elevation (ft)": hwmStorage[hwm].data['Elevation (ft)'],
                            "County": hwmStorage[hwm].data['County'],
                            "Latitude (DD)": hwmStorage[hwm].data['Latitude (DD)'],
                            "Longitude (DD)": hwmStorage[hwm].data['Longitude (DD)'],
                            "Site Number": hwmStorage[hwm].data['Site Number'],
                            "Waterbody": hwmStorage[hwm].data['Waterbody']
                        };

                        if (hwmStorage[hwm].data['Elevation (ft)'] !== undefined) {
                            siteSumHWMVals[site].data.push(hwmStorage[hwm].data['Elevation (ft)']);
                        }
                        formattedHWMS[site].data.push(hwmdata);
                    }
                    if (hwmStorage[hwm].site_name !== distincthwmsByPark[site].site_name) {

                    }
                }
            }

            // getting the summary statistics for each site 
            getSiteSummaryValues();

            //Sort peak and hwm arrays
            peakArrReg = peakArrReg.sort(function (a, b) { return a - b });
            hwmArrReg = hwmArrReg.sort(function (a, b) { return a - b });
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
            getSummaryStats(peakArrReg);
            if (formattedPeaks.length > 0) {
                peakSum = { "Type": "Peak", "Total Sites": numReg, "Max (ft)": maxReg, "Min (ft)": minReg, "Median (ft)": medianReg, "Mean (ft)": meanReg, "Standard Dev (ft)": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
                sum.push(peakSum);
                document.getElementById("saveRegionalPeakCSV").disabled = false;
            }
            if (formattedPeaks.length == 0) {
                document.getElementById("saveRegionalPeakCSV").disabled = true;
            }
        

            //Create hwm row in regional summary table
            getSummaryStats(hwmArrReg);
            if (formattedHWMS.length > 0) {
                hwmSum = { "Type": "HWM", "Total Sites": numReg, "Max (ft)": maxReg, "Min (ft)": minReg, "Median (ft)": medianReg, "Mean (ft)": meanReg, "Standard Dev (ft)": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
                sum.push(hwmSum);
                document.getElementById("saveRegionalHWMCSV").disabled = false;
            }
            if (formattedHWMS.length == 0) {
                document.getElementById("saveRegionalHWMCSV").disabled = true;
                
            }

            function getSiteSummaryValues() {
                var peakRange = {};
                peakSiteSummaries = [];
                hwmSiteSummaries - [];
                siteSumPeakVals.forEach(function (item, idx) {
                    var dataArray;
                    dataArray = item.data.sort(function (a, b) { return a - b });
                    getSummaryStats(dataArray);
                    if (confIntNinetyHigh !== "NaN") {
                        var medReg = medianReg.toFixed(3);
                        // var mean = meanReg.toFixed(3); -- is string so unnecesary 
                        //var sd = standReg.toFixed(3); -- is string so unnecesary 
                        /* peakRange = {"Site Name": eventName , "Range": minReg + '-' + maxReg, "Event": eventName};
                        eventsPeakRange.push(peakRange); */
                        peakSiteSummaries.push({ "Site Name": item.site_name, "Event": eventName, "Type": "Peak", "Total Peaks": numReg, "Max (ft)": maxReg, "Min (ft)": minReg, "Median (ft)": medReg, "Mean (ft)": meanReg, "Standard Dev (ft)": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh });
                        siteList.push({ "Site Name": item.site_name});
                        totalSites.push({ "Site Name": item.site_name, "Range": minReg + ' - ' + maxReg, "Event": eventName });
                    }
                });
                siteSumHWMVals.forEach(function (item, idx) {
                    var dataArray;
                    dataArray = item.data.sort(function (a, b) { return a - b });
                    getSummaryStats(dataArray);
                    if (confIntNinetyHigh !== "NaN") {
                        // var mean = meanReg.toFixed(3); -- is string so unnecesary 
                        //var sd = standReg.toFixed(3); -- is string so unnecesary 
                        var medReg = medianReg.toFixed(3);
                        hwmSiteSummaries.push({ "Site Name": item.site_name, "Event": eventName, "Type": "HWM", "Total HWMs": numReg, "Max (ft)": maxReg, "Min (ft)": minReg, "Median (ft)": medReg, "Mean (ft)": meanReg, "Standard Dev (ft)": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh });
                    }
                });
            }

            function getEventsSiteSummary() {
                var tableData = [];
                var buckets = [];
                var eOne = [];
                var eTwo = [];
                var siteList = [];
                siteList = siteList.reduce((unique, o) => {
                    if(!unique.some(obj => obj['Site Name'] === o['Site Name'])) {
                      unique.push(o);
                    }
                    return unique;
                },[]);

                totalSites.forEach(function (item, idx) {
                    if (item.Event === selectedEventsNames[0]) {
                        eOne.push(item);
                    } else {
                        eTwo.push(item);
                    }
                });

                siteList.forEach(function (siteItem, idx) {
                    eOne.forEach(function (item, idx) {
                        if (item['Site Name'] === siteItem['Site Name']) {
                            //tableData.push({"Site Name": item['Site Name']})
                            siteItem['Range'] = item['Range'];
                        } else {
                            siteItem['Range'] = 'NA';
                        }
                    });
                    eTwo.forEach(function (item, idx) {
                        if (item['Site Name'] === siteItem['Site Name']) {
                            //tableData.push({"Site Name": item['Site Name']})
                            siteItem['Range'] = item['Range'];
                        } else {
                            siteItem['Range'] = 'NA';
                        }
                    });
                });

            }

            //Summary stats to populate regional report summary table
            function getSummaryStats(dataArray) {
                meanReg = numbers.statistic.mean(dataArray);
                medianReg = numbers.statistic.median(dataArray);
                minReg = numbers.basic.min(dataArray);
                maxReg = numbers.basic.max(dataArray);
                numReg = dataArray.length;
                standReg = numbers.statistic.standardDev(dataArray);
                var confIntTemp = 1.645 * (standReg / Math.sqrt(numReg));
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
            if (eventNumber == 1) {
                var tableSumID = "#summaryDataTableEOne";
                var tablePeaksID = "#siteSummaryPeakDataTableEOne";
                var tableHWMsID = "#siteSummaryHWMDataTableEOne";
            } else if (eventNumber == 2) {
                var tableSumID = "#summaryDataTableETwo";
                var tablePeaksID = "#siteSummaryPeakDataTableETwo";
                var tableHWMsID = "#siteSummaryHWMDataTableETwo";
            }
            if (sum.length > 0) {
                buildDataTables(tableSumID, sum, "Summary Information " + eventName);
            }
            if (siteSumPeakVals.length > 0) {
                buildDataTables(tablePeaksID, peakSiteSummaries, "Site Summary Peak Information " + eventName);
            }
            if (siteSumHWMVals.length > 0) {
                buildDataTables(tableHWMsID, hwmSiteSummaries, "Site Summary High Water Mark Information " + eventName);
            }

            // Displays tables in modal, no longer desired in the regional report. 
            /* if (allPeaksEOne.length > 0) {
                buildDataTables("#peakDataTableReg", allPeaksEOne, "Peak Data");
            }
            if (allHWMEOne.length > 0) {
                buildDataTables("#hwmDataTableReg", allHWMEOne, "High Water Mark Data");
            } */
            /*
            if (regionalStreamGages.length >0) {
                $('#hydrographTableReg').append(<div>Real-time Stream Gages</div>);
            }
            */
            showTable();

            function getEventsSiteSummary() {
                var tableData = [];
                var buckets = [];
                var eOne = [];
                var eTwo = [];
                siteList = siteList.reduce((unique, o) => {
                    if(!unique.some(obj => obj['Site Name'] === o['Site Name'])) {
                      unique.push(o);
                    }
                    return unique;
                },[]);

                totalSites.forEach(function (item, idx) {
                    if (item.Event === selectedEventsNames[0]) {
                        eOne.push(item);
                    } else {
                        eTwo.push(item);
                    }
                });

                // creating array for table with site name, and ranges by event
                siteList.forEach(function (siteItem, idx) {
                    var eventOneFilter = eOne[eOne.map(function (item) { return item['Site Name']; }).indexOf(siteItem['Site Name'])];
                    if (eventOneFilter == undefined) {
                        siteItem[selectedEventsNames[0]] = 'NA';
                    } else {
                        siteItem[selectedEventsNames[0]] = eventOneFilter['Range'];
                    }

                    var eventTwoFilter = eTwo[eTwo.map(function (item) { return item['Site Name']; }).indexOf(siteItem['Site Name'])];
                    if (eventTwoFilter == undefined) {
                        siteItem[selectedEventsNames[1]] = 'NA';
                    } else {
                        siteItem[selectedEventsNames[1]] = eventTwoFilter['Range'];
                    }
                });

                console.log(siteList);

                var tableEventsSumID = "#eventsSummaryTable";
                buildDataTables(tableEventsSumID, siteList, "");
                var getTitle = document.getElementById("eventsSummaryTitle");
                getTitle.append("Summary of Peaks measured within a " + bufferSize + "km Buffer for " + selectedEventsNames[0] + ' and ' + selectedEventsNames[1])
            }

            if (eventNumber == 2 ) {
                getEventsSiteSummary();
            }
        }

        function showTable() {
            //Enable peak toggle when loading bar is finished (30 seconds)
            var activatePeak = document.getElementById("peakCheckboxReg");
            activatePeak.disabled = false;
            //display scroll bar/data tables when loading bar is finished
            $('#regionalPeakTable').show();
        };
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
                    "Peak Stage (ft)": identifiedPeaks[i].feature.properties.peak_stage,
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

    $('#btnClearRegFilters').click(function () {
        $('#saveRegionalPeakCSV').attr('disabled', true);
        $('#saveRegionalHWMCSV').attr('disabled', true);
        $('#printRegionalReport').attr('disabled', true);
        // removing all layers from the map regardless of type
        regionalMap.eachLayer(function (layer) {
            regionalMap.removeLayer(layer);
        });

        // resetting the feature groups
        peaksWithinBuffer = L.featureGroup();
        peaksWithinBuffer = L.featureGroup();
        hwmsWithinBuffer = L.featureGroup();
        regionalPeak = L.layerGroup();
        regionalHWM = L.layerGroup();
        regionalPeakMarkerIcon = L.icon({ className: 'regionalpeakMarker', iconUrl: 'images/peak.png', iconAnchor: [12, 16], popupAnchor: [0, 2] });
        regionalhwmIcon = L.icon({ className: 'regionalhwmMarker', iconUrl: 'images/hwm.png', iconAnchor: [7, 10], popupAnchor: [0, 2] });

        // resetting the arrays
        bufferedPolys = [];
        simplifiedSites = [];
        regionParksFC = [];
        tableData = [];
        hwmTableData = [];
        sensorTableData = [];
        hwmRegionalCSVData = [];
        peaksRegionalCSVData = [];
        peakSiteSummaries = [];
        hwmSiteSummaries = [];
        allHWMEOne = [];
        allPeaksEOne = [];

        alreadyRan = false;

        // clearing tables
        document.getElementById('summaryDataTableEOne').innerHTML = '';
        document.getElementById('siteSummaryPeakDataTableEOne').innerHTML = '';
        document.getElementById('siteSummaryHWMDataTableEOne').innerHTML = '';
        document.getElementById('summaryDataTableETwo').innerHTML = '';
        document.getElementById('siteSummaryPeakDataTableETwo').innerHTML = '';
        document.getElementById('siteSummaryHWMDataTableETwo').innerHTML = '';
        document.getElementById('eventsSummaryTable').innerHTML = '';
        document.getElementById('eventsSummaryTitle').innerHTML = '';

        document.querySelector('.progress-bar-fill').style.width = "0%"
        clearSelects()
        // adding the basemap back to the map
        setTimeout(() => {
            var regionBasemap = L.esri.basemapLayer('Topographic').addTo(regionalMap);
        }, 500);
    });


    //Corresponds with the 'HWM CSV' button on the regional report modal
    $('#saveRegionalHWMCSV').click(function () {
        //if there is a hwm table, download as csv
        if (hwmRegionalCSVData.length > 0) {
            // merging the arrays from both event if there are two
            if (hwmRegionalCSVData.length == 2) {
                hwmRegionalCSVData = hwmRegionalCSVData[0].concat(hwmRegionalCSVData[1]);
            } else {
                hwmRegionalCSVData = hwmRegionalCSVData[0];
            }
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
            if (peaksRegionalCSVData.length == 2) {
                peaksRegionalCSVData = peaksRegionalCSVData[0].concat(peaksRegionalCSVData[1]);
                downloadRegionalCSV("peaks");
            } else {
                peaksRegionalCSVData = peaksRegionalCSVData[0];
            }
            downloadRegionalCSV("peaks");
        }
        //if there are no peak markers within the buffer, exit
        else {
            console.log("There are no peak datapoints.");
        }
    });

});

function clearSelects() {
    $('#evtSelect_regionalModal').val('').trigger('change');
    $('#bufferSelect_regionalModal').val('').trigger('change');

    setTimeout(() => {
        $('#typeSelect_regionalModal').val('').trigger('change');
        $('#regionSelect_regionalModal').val('').trigger('change');
    }, 200);

    //$('.clear').val('').trigger('change');
}

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

function formReady() {
    if (
        (($('#regionSelect_regionalModal').val() !== null))
        && (($('#typeSelect_regionalModal').val() !== null))
        && (($('#evtSelect_regionalModal').val() !== null))
        && (($('#bufferSelect_regionalModal').val() !== null))
        && (($('#regionType_regionalModal').val() !== null))
    ) {
        $('#btnSubmitSelections').removeAttr('disabled');
        return;
    }
    console.log('not ready');
    if (document.getElementById('btnSubmitSelections').disabled === false) {
        $('#btnSubmitSelections').attr('disabled', true);
    }
}
//function for toggling peak labels
function clickPeakLabelsReg() {
    var checkBox = document.getElementById("peakCheckboxReg");
    //Display peak labels when toggle is on
    if (checkBox.checked == true) {
        regionalPeak.eachLayer(function (myMarker) {
            myMarker.showLabel();
        });
        //Remove peak labels when toggle is off
    } else {
        regionalPeak.eachLayer(function (myMarker) {
            myMarker.hideLabel();
        });
    }
}



