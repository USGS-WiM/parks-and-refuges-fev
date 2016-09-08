/**
 * Created by bdraper on 8/4/2016.
 */
///function to grab all values from the inputs, form into arrays, and build query strings

var layerCount = 0;

//ajax retrieval function
function displaySensorGeoJSON(type, name, url, markerIcon) {
    var currentSubGroup = eval(type);
    currentSubGroup.clearLayers();
    var currentMarker = L.geoJson(false, {
        pointToLayer: function(feature, latlng) {
            markerCoords.push(latlng);
            var marker = L.marker(latlng, {
                icon: markerIcon
            });
            return marker;
        },
        onEachFeature: function (feature, latlng) {
            //add marker to overlapping marker spidifier
            oms.addMarker(latlng);
            //var popupContent = '';
            var currentEvent = $('#largeEventNameDisplay').html();
            var popupContent =
                '<table class="table table-hover table-striped table-condensed">'+
                    '<caption class="popup-title">' + name + ' for ' + currentEvent + '</caption>' +
                    '<tr><td><strong>STN Site Name: </strong></td><td><span id="siteName">'+ feature.properties.site_name+'</span></td></tr>'+
                    '<tr><td><strong>Status: </strong></td><td><span id="status">'+ feature.properties.status+'</span></td></tr>'+
                    '<tr><td><strong>City: </strong></td><td><span id="city">'+ (feature.properties.city == ''|| feature.properties.city == null || feature.properties.city == undefined ? '<i>No city recorded</i>' : feature.properties.city ) + '</span></td></tr>'+
                    '<tr><td><strong>County: </strong></td><td><span id="county">' + feature.properties.county +'</span></td></tr>'+
                    '<tr><td><strong>State: </strong></td><td><span id="state">'+feature.properties.state+'</span></td></tr>'+
                    '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">'+feature.properties.latitude_dd.toFixed(4)+', ' + feature.properties.longitude_dd.toFixed(4)+'</span></td></tr>'+
                    '<tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + sensorPageURLRoot + feature.properties.site_id + '&Sensor=' + feature.properties.instrument_id+ '\>Sensor data page</a></b></span></td></tr>'+
                '</table>';
            // $.each(feature.properties, function( index, value ) {
            //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
            // });
            ////logic to retrieve and display Rapid Deploy gage graph
            if (type == 'rdg') {
                var usgsSiteID;
                $.getJSON(stnServicesURL + "/Sites/" + feature.properties.site_id + ".json", function(data) {
                    if (data.usgs_sid !== "") {
                        usgsSiteID = data.usgs_sid;
                        if (fev.vars.currentEventActive == true && fev.vars.currentEventEndDate_str == '') {
                            //use moment.js lib to get current system date string, properly formatted
                            fev.vars.currentEventEndDate_str = moment().format('YYYY-MM-DD');
                            console.log("Selected event is active, so end date is today, " + fev.vars.currentEventEndDate_str)
                        }
                        if (fev.vars.currentEventStartDate_str == '' && fev.vars.currentEventEndDate_str == '') {
                            var rdgGraphContent =
                                '<div id="rdgChartDiv"><i>Missing valid event date range. Unable to display RDG Real-time graph.</i></div>';
                            latlng.bindPopup(popupContent + rdgGraphContent);
                        } else {
                            var rdgGraphContent =
                                '<div id="rdgChartDiv"><label>Water level elevation (ft)</label><img width="350" src="http://waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&site_no=' + usgsSiteID + '&parm_cd=62620&begin_date=' + fev.vars.currentEventStartDate_str + '&end_date=' + fev.vars.currentEventEndDate_str + '" alt="rapid deploy gage graph"></div>';
                            latlng.bindPopup(popupContent + rdgGraphContent, {minWidth: 350})
                        }
                    } else {
                        var rdgGraphContent =
                            '<div id="rdgChartDiv"><i>Missing USGS Site ID. Unable to display RDG Real-time graph.</i></div>';
                        latlng.bindPopup(popupContent + rdgGraphContent);
                    }
                });
            } else {
                latlng.bindPopup(popupContent);
            }
        }
    });

    $.getJSON(url, function(data) {
        //increment layerCount
        layerCount++;
        if (data.length == 0) {
            console.log( '0 ' + markerIcon.options.className + ' GeoJSON features found');
            return
        }
        if (data.features.length > 0) {
            console.log( data.features.length + ' ' + markerIcon.options.className + ' GeoJSON features found');
            currentMarker.addData(data);
            currentMarker.eachLayer(function(layer) {
                layer.addTo(currentSubGroup);
            });
            currentSubGroup.addTo(map)
            checkLayerCount(layerCount);
            }
    });
}

function displayHWMGeoJSON(type, name, url, markerIcon) {
    hwm.clearLayers();
    var currentMarker = L.geoJson(false, {
        pointToLayer: function(feature, latlng) {
            markerCoords.push(latlng);
            var marker = L.marker(latlng, {
                icon: markerIcon
            });
            return marker;
        },
        onEachFeature: function (feature, latlng) {

            if (feature.properties.longitude_dd == undefined ||feature.properties.latitude_dd == undefined ) {
                console.log("Lat/lng undefined for HWM at site no: " + feature.properties.site_no );
                return
            }

            if (latlng.feature.geometry.coordinates[0] == null || latlng.feature.geometry.coordinates[1] == null) {
                console.log("null coordinates returned for " + feature.properties.site_no)
            }
            //add marker to overlapping marker spidifier
            oms.addMarker(latlng);
            // var popupContent = '';
            var currentEvent = $('#largeEventNameDisplay').html();

            // })[0];
            var popupContent =
            '<table class="table table-hover table-striped table-condensed">'+
                '<caption class="popup-title">' + name + ' for ' + currentEvent + '</caption>' +
                '<tr><td><strong>STN Site No.: </strong></td><td><span id="hwmSiteNo">'+ feature.properties.site_no+ '</span></td></tr>'+
                '<tr><td><strong>Elevation(ft): </strong></td><td><span id="hwmElev">'+ feature.properties.elev_ft + '</span></td></tr>'+
                '<tr><td><strong>Datum: </strong></td><td><span id="hwmWaterbody">'+ feature.properties.verticalDatumName + '</span></td></tr>'+
                '<tr><td><strong>Height Above Ground: </strong></td><td><span id="hwmHtAboveGnd">'+ (feature.properties.height_above_gnd !== undefined ? feature.properties.height_above_gnd : '<i>No value recorded</i>')+ '</span></td></tr>'+
                '<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">'+ (feature.properties.approval_id == undefined || feature.properties.approval_id == 0 ? 'Provisional  <button type="button" class="btn btn-sm data-disclaim"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>'  : 'Approved')+ '</span></td></tr>'+
                '<tr><td><strong>Type: </strong></td><td><span id="hwmType"></span>'+ feature.properties.hwmTypeName + '</td></tr>'+
                '<tr><td><strong>Marker: </strong></td><td><span id="hwmMarker">'+ feature.properties.markerName+ '</span></td></tr>'+
                '<tr><td><strong>Quality: </strong></td><td><span id="hwmQuality">'+ feature.properties.hwmQualityName+ '</span></td></tr>'+
                '<tr><td><strong>Waterbody: </strong></td><td><span id="hwmWaterbody">'+ feature.properties.waterbody + '</span></td></tr>'+
                '<tr><td><strong>County: </strong></td><td><span id="hwmCounty">'+ feature.properties.countyName + '</span></td></tr>'+
                '<tr><td><strong>State: </strong></td><td><span id="hwmState">'+ feature.properties.stateName + '</span></td></tr>'+
                '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">'+feature.properties.latitude_dd.toFixed(4)+', ' + feature.properties.longitude_dd.toFixed(4)+'</span></td></tr>'+
                '<tr><td><strong>Description: </strong></td><td><span id="hwmDescription">'+ feature.properties.hwm_locationdescription + '</span></td></tr>'+
                '<tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + hwmPageURLRoot + feature.properties.site_id + '&HWM=' + feature.properties.hwm_id+ '\>HWM data page</a></b></span></td></tr>'+
            '</table>';
            // $.each(feature.properties, function( index, value ) {
            //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
            // });
            latlng.bindPopup(popupContent);
        }
    });

    $.getJSON(url, function(data) {
        //increment layerCount
        layerCount++;
        if (data.length == 0) {
            console.log( '0 ' + markerIcon.options.className + ' GeoJSON features found');
            return
        }
        if (data.features.length > 0) {
            console.log( data.features.length + ' ' + markerIcon.options.className + ' GeoJSON features found');
            currentMarker.addData(data);
            currentMarker.eachLayer(function(layer) {
                // var latlng = L.latLng(layer.feature.geometry.coordinates);
                // markerCoords.push(latlng);
                layer.addTo(hwm);
            });
            hwm.addTo(map);
            checkLayerCount(layerCount);
        }
    });
}

function displayPeaksGeoJSON(type, name, url, markerIcon) {
    peaks.clearLayers();
    var currentMarker = L.geoJson(false, {
        pointToLayer: function(feature, latlng) {
            markerCoords.push(latlng);
            var marker = L.marker(latlng, {
                icon: markerIcon
            });
            return marker;
        },
        onEachFeature: function (feature, latlng) {
            //add marker to overlapping marker spidifier
            oms.addMarker(latlng);
            //var popupContent = '';
            var currentEvent = $('#largeEventNameDisplay').html();
            var popupContent =
                '<table class="table table-condensed table-striped table-hover">' +
                '<caption class="popup-title">' + name + ' for ' + currentEvent + '</caption>' +
                    '<tr><th>Peak Stage (ft)</th><th>Datum</th><th>Peak Date & Time (UTC)</th></tr>'+
                    '<tr><td>' + feature.properties.peak_stage + '</td><td>' + feature.properties.vdatum + '</td><td>' + feature.properties.peak_date + '</td></tr>'+
                '</table>';

            // $.each(feature.properties, function( index, value ) {
            //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
            // });
            latlng.bindPopup(popupContent);
        }
    });

    $.getJSON(url, function(data) {
        //increment layerCount
        layerCount++;
        if (data.length == 0) {
            console.log( '0 ' + markerIcon.options.className + ' GeoJSON features found');
            return
        }
        if (data.features.length > 0) {
            console.log( data.features.length + ' ' + markerIcon.options.className + ' GeoJSON features found');
            currentMarker.addData(data);
            currentMarker.eachLayer(function(layer) {
                layer.addTo(peaks);
            });
            peaks.addTo(map);
            checkLayerCount(layerCount);
        }
    });
}

function getLayerName(type) {
    switch(type) {
        case "baro": return "Barometric Pressure Sensor";
        case "stormTide": return "Storm Tide Sensor";
        case "met" : return "Meteorological Sensor";
        case 'waveHeight': return "Wave Height Sensor";
        case "rdg" : return "Rapid Deployment Gage";
        case "hwm": return  "High Water Mark";
        case "peaks": return  "Peak Summary";
    }
}

///this function sets the current event's start and end dates as global vars. may be better as a function called on demand when date compare needed for NWIS graph setup
function populateEventDates (eventID) {
    for (var i = 0; i < fev.data.events.length; i++) {
        if (fev.data.events[i].event_id == eventID) {
            //set currentEventActive boolean var based on event_status_id value
            fev.data.events[i].event_status_id == 1 ? fev.vars.currentEventActive = true :   fev.vars.currentEventActive = false;
            //set event date vars; check for undefined because services do not return the property if it has no value
            fev.vars.currentEventStartDate_str = (fev.data.events[i].event_start_date == undefined ? '' : fev.data.events[i].event_start_date.substr(0,10));
            fev.vars.currentEventEndDate_str = (fev.data.events[i].event_end_date == undefined ? '' : fev.data.events[i].event_end_date.substr(0,10));
            console.log("Selected event is " + fev.data.events[i].event_name + ". START date is " + fev.vars.currentEventStartDate_str + " and END date is " + fev.vars.currentEventEndDate_str + ". Event is active = " + fev.vars.currentEventActive)
        }
    }
}

function checkLayerCount (layerCount) {
    if (layerCount == fev.layerList.length) {
        if (markerCoords.length > 0) { map.fitBounds(markerCoords); }
    }
}

function filterMapData(event, isUrlParam) {

    layerCount = 0;
    markerCoords = [];
    var eventSelections = '';

    if (isUrlParam) {
        eventSelections = event;
    }

    ///eventSelect_welcomeModal: display the event name both in display area and large event indicator; set the eventSelections value
    if ($('#evtSelect_welcomeModal').val() !== null){
        var eventSelectionsArray = $('#evtSelect_welcomeModal').val();
        eventSelections = eventSelectionsArray.toString();
        $('#eventNameDisplay').html($('#evtSelect_welcomeModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
        $('#largeEventNameDisplay').html($('#evtSelect_welcomeModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
        //populateEventDates(eventSelections);

    }

    //event type
    var eventTypeSelections = '';
    if ($('#evtTypeSelect').val() !== null){
        var evtTypeSelectionsArray = $('#evtTypeSelect').val();
        eventTypeSelections = evtTypeSelectionsArray.toString();
        $('#eventTypeDisplay').html($('#evtTypeSelect').select2('data').map(function(elem){ return elem.text;}).join(', '));
    }
    //event
    //eventSelections = '';
    if ($('#evtSelect_filterModal').val() !== null){
        var eventSelectionsArray = $('#evtSelect_filterModal').val();
        eventSelections = eventSelectionsArray.toString();
        $('#eventNameDisplay').html($('#evtSelect_filterModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
        $('#largeEventNameDisplay').html($('#evtSelect_filterModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
        populateEventDates(eventSelections);

    }
    //event status
    var eventStatusSelectionArray = [];
    //event status: active
    if ($('#active')[0].checked && !($('#complete')[0].checked) ) {
        eventStatusSelectionArray.push(1);
        $('#eventStatusDisplay').html('Active');
    }
    //event status: complete
    if ($('#complete')[0].checked && !($('#active')[0].checked)) {
        eventStatusSelectionArray.push(2);
        $('#eventStatusDisplay').html('Complete');
    }
    if ($('#active')[0].checked && $('#complete')[0].checked) {
        eventStatusSelectionArray.push(0);
        $('#eventStatusDisplay').html('Active, Complete');
    }
    if ( !($('#active')[0].checked) && !($('#complete')[0].checked)) {
        eventStatusSelectionArray.push(0);
        $('#eventStatusDisplay').html('');
    }

    var eventStatusSelection =  eventStatusSelectionArray.toString();

    //state
    var stateSelections = '';
    if ($('#stateSelect').val() !== null){
        var stateSelectionsArray = $('#stateSelect').val();
        stateSelections = stateSelectionsArray.toString();
        $('#stateDisplay').html(stateSelections);
    }
    //county
    var countySelections = '';
    if ($('#countySelect').val() !== null){
        var countySelectionsArray = $('#countySelect').val();
        countySelections = countySelectionsArray.toString();
        $('#countyDisplay').html(countySelections);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //SENSORS
    //if ($('#sensorRad')[0].checked){
        //sensor type
        var sensorTypeSelections = '';
        if ($('#sensorTypeSelect').val() !== null ){
            var sensorTypeSelectionArray = $('#sensorTypeSelect').val();
            sensorTypeSelections = sensorTypeSelectionArray.toString();
            $('#sensorTypeDisplay').html($('#sensorTypeSelect').select2('data')[0].text);
        }
        //sensor status
        var sensorStatusSelections = '';
        if ($('#sensorStatusSelect').val() !== null ){
            var sensorStatusSelectionArray = $('#sensorStatusSelect').val();
            sensorStatusSelections = sensorStatusSelectionArray.toString();
            $('#sensorStatusDisplay').html($('#sensorStatusSelect').select2('data')[0].text);
        }

        //sensor collection condition
        var collectConditionSelections = '';
        if ($('#collectionConditionSelect').val() !== null ){
            var collectConditionSelectionArray = $('#collectionConditionSelect').val();
            collectConditionSelections = collectConditionSelectionArray.toString();
            $('#collectConditionDisplay').html($('#collectionConditionSelect').select2('data')[0].text);
        }

        //sensor deployment type
        var deploymentTypeSelections = '';
        if ($('#deployTypeSelect').val() !== null ){
            var deploymentTypeSelectionArray = $('#deployTypeSelect').val();
            deploymentTypeSelections = deploymentTypeSelectionArray.toString();
            $('#deployTypeDisplay').html($('#deployTypeSelect').select2('data')[0].text);
        }

        fev.queryStrings.sensorsQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&SensorType=' + sensorTypeSelections + '&CurrentStatus=' + sensorStatusSelections + '&CollectionCondition=' + collectConditionSelections + '&DeploymentType=' + deploymentTypeSelections;
        //var resultIsEmpty = false;

        fev.urls.csvSensorsQueryURL = fev.urls.csvSensorsURLRoot + fev.queryStrings.sensorsQueryString;
        fev.urls.jsonSensorsQueryURL = fev.urls.jsonSensorsURLRoot + fev.queryStrings.sensorsQueryString;
        fev.urls.xmlSensorsQueryURL = fev.urls.xmlSensorsURLRoot + fev.queryStrings.sensorsQueryString;

        //add download buttons
        $('#sensorDownloadButtonCSV').attr('href', fev.urls.csvSensorsQueryURL);
        $('#sensorDownloadButtonJSON').attr('href', fev.urls.jsonSensorsQueryURL);
        $('#sensorDownloadButtonXML').attr('href', fev.urls.xmlSensorsQueryURL);

        //return fev.queryStrings.sensorsQueryString;

        //get geoJSON
        // $.each([ 'baro','met','rdg','stormTide','waveHeight'], function( index, type ) {
        //     displaySensorGeoJSON(type, fev.urls[type + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window[type + 'MarkerIcon']);
        // });

    //}
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //HWMs
    //if ($('#hwmRad')[0].checked) {
        //console.log('in HWM Radio listener function');

        //HWM types
        var hwmTypeSelections = '';
        if ($('#hwmTypeSelect').val() !== null ){
            var hwmTypeSelectionArray = $('#hwmTypeSelect').val();
            hwmTypeSelections = hwmTypeSelectionArray.toString();
            $('#hwmTypeDisplay').html($('#hwmTypeSelect').select2('data')[0].text);
        }
        //HWM quality
        var hwmQualitySelections = '';
        if ($('#hwmQualitySelect').val() !== null ){
            var hwmQualitySelectionArray = $('#hwmQualitySelect').val();
            hwmQualitySelections = hwmQualitySelectionArray.toString();
            $('#hwmQualityDisplay').html($('#hwmQualitySelect').select2('data')[0].text);
        }
        ////HWM environment
        var hwmEnvSelectionArray = [];
        //HWM environment: coastal
        if ($('#coastal')[0].checked && !($('#riverine')[0].checked)) {
            hwmEnvSelectionArray.push('Coastal');
            $('#hwmEnvDisplay').html('Coastal');
        }
        //HWM environment: riverine
        if ($('#riverine')[0].checked && !($('#coastal')[0].checked) ) {
            hwmEnvSelectionArray.push('Riverine');
            $('#hwmEnvDisplay').html('Riverine');
        }
        var hwmEnvSelections = hwmEnvSelectionArray.toString();
        //HWM survey status
        var hwmSurveyStatusSelectionArray = [];
        ///HWM survey status: complete
        if ($('#surveyCompleteYes')[0].checked && !($('#surveyCompleteNo')[0].checked)) {
            hwmSurveyStatusSelectionArray.push('true');
            $('#hwmSurveyCompDisplay').html('True');
        }
        ///HWM survey status: not complete
        if ($('#surveyCompleteNo')[0].checked && !($('#surveyCompleteYes')[0].checked)) {
            hwmSurveyStatusSelectionArray.push('false');
            $('#hwmSurveyCompDisplay').html('False');
        }
        var hwmSurveyStatusSelections = hwmSurveyStatusSelectionArray.toString();
        //HWM stillwater status
        var hwmStillwaterStatusSelectionArray = [];
        ///HWM stillwater status: yes
        if ($('#stillWaterYes')[0].checked && !($('#stillWaterNo')[0].checked)) {
            hwmStillwaterStatusSelectionArray.push('true');
            $('#hwmStillWaterDisplay').html('True');
        }
        ///HWM stillwater status: no
        if ($('#stillWaterNo')[0].checked  && !($('#stillWaterYes')[0].checked)) {
            hwmStillwaterStatusSelectionArray.push('false');
            $('#hwmStillWaterDisplay').html('False');
        }
        var hwmStillwaterStatusSelections = hwmStillwaterStatusSelectionArray.toString();

        fev.queryStrings.hwmsQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&HWMType=' + hwmTypeSelections + '&HWMQuality=' + hwmQualitySelections + '&HWMEnvironment=' + hwmEnvSelections + '&SurveyComplete=' + hwmSurveyStatusSelections + '&StillWater=' + hwmStillwaterStatusSelections;
        //var resultIsEmpty = false;

        fev.urls.csvHWMsQueryURL = fev.urls.csvHWMsURLRoot + fev.queryStrings.hwmsQueryString ;
        fev.urls.jsonHWMsQueryURL = fev.urls.jsonHWMsURLRoot + fev.queryStrings.hwmsQueryString ;
        fev.urls.xmlHWMsQueryURL = fev.urls.xmlHWMsURLRoot + fev.queryStrings.hwmsQueryString ;

        //add download buttons
        $('#hwmDownloadButtonCSV').attr('href', fev.urls.csvHWMsQueryURL);
        $('#hwmDownloadButtonJSON').attr('href', fev.urls.jsonHWMsQueryURL);
        $('#hwmDownloadButtonXML').attr('href', fev.urls.xmlHWMsQueryURL);

        //get geoJSON
        //displayHWMGeoJSON(fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString, hwmMarkerIcon);


    //}
    //PEAKS
    //if ($('#peakRad')[0].checked) {
        var peakStartDate;
        if ($('#peakStartDate').value !== ''){
            peakStartDate = $('#peakStartDate')[0].value;
        }
        var peakEndDate;
        if ($('#peakEndDate').value !== '') {
            peakEndDate = $('#peakEndDate')[0].value;
        }

        fev.queryStrings.peaksQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&StartDate='  + peakStartDate + '&EndDate=' + peakEndDate;
        //var resultIsEmpty = false;

        fev.urls.csvPeaksQueryURL = fev.urls.csvPeaksURLRoot + fev.queryStrings.peaksQueryString;
        fev.urls.jsonPeaksQueryURL = fev.urls.jsonPeaksURLRoot + fev.queryStrings.peaksQueryString;
        fev.urls.xmlPeaksQueryURL = fev.urls.xmlPeaksURLRoot + fev.queryStrings.peaksQueryString;

        //add download buttons
        $('#peaksDownloadButtonCSV').attr('href', fev.urls.csvPeaksQueryURL);
        $('#peaksDownloadButtonJSON').attr('href', fev.urls.jsonPeaksQueryURL);
        $('#peaksDownloadButtonXML').attr('href', fev.urls.xmlPeaksQueryURL);

        //get geoJSON
        //displayPeaksGeoJSON(fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peaksMarkerIcon);

    //}

    //main loop over layers
    $.each(fev.layerList, function( index, layer ) {
        if(layer.Type == 'sensor') displaySensorGeoJSON(layer.ID, layer.Name, fev.urls[layer.ID + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window[layer.ID + 'MarkerIcon']);
        if(layer.ID == 'hwm') displayHWMGeoJSON(layer.ID, layer.Name, fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString, hwmMarkerIcon);
        if(layer.ID == 'peak') displayPeaksGeoJSON(layer.ID, layer.Name, fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peaksMarkerIcon);
    });

} //end filterMapData function

function queryNWISrtGages(bbox) {
    var NWISmarkers = {};

    //NWIS query options from http://waterservices.usgs.gov/rest/IV-Test-Tool.html
    var parameterCodeList = '00060,00065';
    var siteTypeList = 'OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS';
    var siteStatus = 'active';

    var timeQueryRange = '';
    if (fev.vars.currentEventActive == true && fev.vars.currentEventEndDate_str == '') {
        //use moment.js lib to get current system date string, properly formatted
        fev.vars.currentEventEndDate_str = moment().format('YYYY-MM-DD');
    }
    if (fev.vars.currentEventStartDate_str == '' || fev.vars.currentEventEndDate_str == '') {
        timeQueryRange = ''
    } else {
        timeQueryRange = '&startDT=' + fev.vars.currentEventStartDate_str + '&endDT=' + fev.vars.currentEventEndDate_str;
    }

    var url = 'http://nwis.waterservices.usgs.gov/nwis/iv/?format=json&bBox=' + bbox + '&parameterCd=' + parameterCodeList + '&siteType=' + siteTypeList + '&siteStatus=' + siteStatus  + timeQueryRange;
    $.getJSON(url, function(data) {
        console.log(data.value.timeSeries.length + ' usgs gages found.');

        $.each(data.value.timeSeries, function( index, site ) {
            
            var siteID = site.name.split(':')[1];

            //check to see if we have this site already 
            if (NWISmarkers[siteID]) {
                if (site.values[0].value[0]) {
                    NWISmarkers[siteID].data.parameters[site.variable.variableName] = {};
                    NWISmarkers[siteID].data.parameters[site.variable.variableName]['Time'] = site.values[0].value[0].dateTime;
                    NWISmarkers[siteID].data.parameters[site.variable.variableName]['Value'] = site.values[0].value[0].value;
                }
            }

            //otherwise add new site
            else {
                if (site.values[0].value[0]) {
                    NWISmarkers[siteID] = L.marker([site.sourceInfo.geoLocation.geogLocation.latitude, site.sourceInfo.geoLocation.geogLocation.longitude], {icon: nwisMarkerIcon});
                    NWISmarkers[siteID].data = {siteName:site.sourceInfo.siteName,siteCode:site.sourceInfo.siteCode};
                    NWISmarkers[siteID].data.parameters = {};
                    NWISmarkers[siteID].data.parameters[site.variable.variableName] = {};
                    NWISmarkers[siteID].data.parameters[site.variable.variableName]['Time'] = site.values[0].value[0].dateTime;
                    NWISmarkers[siteID].data.parameters[site.variable.variableName]['Value'] = site.values[0].value[0].value;
                    //add point to featureGroup
                    USGSrtGages.addLayer(NWISmarkers[siteID]);
                }
            }
        });
    });
}

function queryNWISgraph(e) {
    var popupContent = '';
    $.each(e.layer.data.parameters, function( index, parameter ) {
        //create table, converting timestamp to friendly format using moment.js library
        popupContent += '<tr><td>' + index + '</td><td>' + parameter.Value + '</td><td>' + moment(parameter.Time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>'
    });

    var timeQueryRange = '';
    if (fev.vars.currentEventActive == true && fev.vars.currentEventEndDate_str == '') {
        //use moment.js lib to get current system date string, properly formatted
        fev.vars.currentEventEndDate_str = moment().format('YYYY-MM-DD');
    }
    if (fev.vars.currentEventStartDate_str == '' || fev.vars.currentEventEndDate_str == '') {
        timeQueryRange = '&period=P7D'
    } else {
        timeQueryRange = '&startDT=' + fev.vars.currentEventStartDate_str + '&endDT=' + fev.vars.currentEventEndDate_str;
    }

    e.layer.bindPopup('<b>' + e.layer.data.siteName + '</br>Full data link: <a target="_blank" href="http://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode[0].value + '">' + e.layer.data.siteCode[0].value + '</a></b><br><table class="table table-condensed"><thead><tr><th>Parameter</th><th>Value</th><th>Timestamp</th></tr></thead><tbody>' + popupContent + '</tbody></table><div id="graphContainer" style="width:100%; height:200px;display:none;"></div>').openPopup();

    $.getJSON('http://nwis.waterservices.usgs.gov/nwis/iv/?format=json&sites=' + e.layer.data.siteCode[0].value + '&parameterCd=00065' + timeQueryRange, function(data) {

        if (data.value.timeSeries.length <= 0) console.log("No NWIS graph data available for this time period");

        else {
            //if there is some data, show the div
            $('#graphContainer').show();

            //transpose array
            var graphData = [];
            $.map( data.value.timeSeries[0].values[0].value, function( val, i ) {
                graphData.push([Date.parse(val.dateTime),parseFloat(val.value)])
            });
            Highcharts.setOptions({global: { useUTC: false } });
            $('#graphContainer').highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    //text: e.layer.data.siteCode[0].agencyCode + ' ' + e.layer.data.siteCode[0].value + ' ' + e.layer.data.siteName
                    text: null
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
                    data: graphData,
                    tooltip: {
                        pointFormat: "Gage height: {point.y} feet"
                    }
                }]
            });
        }
    });
}