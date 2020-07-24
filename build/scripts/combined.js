/**
 * Created by bdraper on 8/4/2016.
 */
///function to grab all values from the inputs, form into arrays, and build query strings
var layerCount = 0;
var peakArr = [];

//Variables to determine if the layer was added to map on the first map load
//When the map initially loads, the layer box is pre-checked and the corresponding symbol is added to the legend
var baroStart = 0;
var stormtideStart = 0;
var metStart = 0;
var waveheightStart = 0;
var hwmStart = 0;
var rdgStart = 0;
var peakStart = 0;
var noaaStart = 0;



//ajax retrieval function
function displaySensorGeoJSON(type, name, url, markerIcon) {
    //increment layerCount
    layerCount++;
    var currentSubGroup = eval(type);
    currentSubGroup.clearLayers();
    var currentMarker = L.geoJson(false, {
        pointToLayer: function (feature, latlng) {
            markerCoords.push(latlng);
            var marker = L.marker(latlng, {
                icon: markerIcon
            });
            return marker;
        },
        onEachFeature: function (feature, latlng) {
            var instrumentID = feature.properties.instrument_id;
            var url = "https://stn.wim.usgs.gov/STNServices/Instruments/" + instrumentID + "/Files.json";
            var data;

            $.ajax({
                url: url,
                dataType: 'json',
                data: data,
                headers: {'Accept': '*/*'},
                success: function (data) {
                    var hydrographURL = '';
                    var hydrographElement;
                    var containsHydrograph = false;
                    var noHydrograph = '<span style="float: right;padding-right: 15px;">No graph available</span>';
                    var hydroPopupText;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].filetype_id === 13 ) {
                            containsHydrograph = true;
                            hydrographURL = "https://stn.wim.usgs.gov/STNServices/Files/" + data[i].file_id + "/Item";
                            hydrographElement = '<br><img title="Click to enlarge" style="cursor: pointer;" data-toggle="tooltip" class="hydroImage" onclick="enlargeImage()" src=' + hydrographURL + '\>'
                        }
                    }

                    if (containsHydrograph === true) {
                        hydroPopupText = hydrographElement;
                    } else {
                        hydroPopupText = noHydrograph
                    }
                    //add marker to overlapping marker spidifier
                    oms.addMarker(latlng);
                    //var popupContent = '';
                    if (type == 'rdg') { return };
                    var currentEvent = fev.vars.currentEventName;
                    var popupContent =
                        '<table class="table table-hover table-striped table-condensed wim-table">' +
                        '<caption class="popup-title">' + name + ' | <span style="color:gray"> ' + currentEvent + '</span></caption>' +
                        '<tr><td><strong>STN Site Number: </strong></td><td><span id="siteName">' + feature.properties.site_no + '</span></td></tr>' +
                        '<tr><td><strong>Status: </strong></td><td><span id="status">' + feature.properties.status + '</span></td></tr>' +
                        '<tr><td><strong>City: </strong></td><td><span id="city">' + (feature.properties.city == '' || feature.properties.city == null || feature.properties.city == undefined ? '<i>No city recorded</i>' : feature.properties.city) + '</span></td></tr>' +
                        '<tr><td><strong>County: </strong></td><td><span id="county">' + feature.properties.county + '</span></td></tr>' +
                        '<tr><td><strong>State: </strong></td><td><span id="state">' + feature.properties.state + '</span></td></tr>' +
                        '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' + feature.properties.latitude_dd.toFixed(4) + ', ' + feature.properties.longitude_dd.toFixed(4) + '</span></td></tr>' +
                        '<tr><td><strong>STN data page: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + sensorPageURLRoot + feature.properties.site_id + '&Sensor=' + feature.properties.instrument_id + '\>Sensor data page</a></b></span></td></tr>' +
                        '<tr><td colspan="2"><strong>Hydrograph: </strong>' + hydroPopupText
                        '</table>';
                    latlng.bindPopup(popupContent);
                },
                error: function (error) {
                    console.log('Error processing the JSON. The error is:' + error);
                }
            });
        }
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
                layer.addTo(currentSubGroup);
            });
            currentSubGroup.addTo(map);

            //each layer that is added on initial map load/new filter search is added to the map and name and symbol are added to legend
            //layers are then given values of 1 to indicate that they are already added to the legend

            if (type == "baro") {
                if (baroStart == 0) {
                    var baroCheckBox = document.getElementById("baroToggle");
                    baroCheckBox.checked = true;
                    $('#barometricSymbology').append(barometricSymbologyInterior);
                    baroStart = 1;
                }
            }
            if (type == "stormtide") {
                if (stormtideStart == 0) {
                    var stormTideCheckBox = document.getElementById("stormTideToggle");
                    stormTideCheckBox.checked = true;
                    $('#stormTideSymbology').append(stormTideSymbologyInterior);
                    stormtideStart = 1;
                }
            }
            if (type == "met") {
                if (metStart == 0) {
                    var metCheckBox = document.getElementById("metToggle");
                    metCheckBox.checked = true;
                    $('#meteorlogicalSymbology').append(meteorlogicalSymbologyInterior);
                    metStart = 1;
                }
            }
            if (type == "waveheight") {
                if (waveheightStart == 0) {
                    var waveHeightCheckBox = document.getElementById("waveHeightToggle");
                    waveHeightCheckBox.checked = true;
                    $('#waveHeightSymbology').append(waveHeightSymbologyInterior);
                    waveheightStart = 1;
                }
            }
            if (type == "rdg") {
                if (rdgStart == 0) {
                    var rdgCheckBox = document.getElementById("rdgToggle");
                    rdgCheckBox.checked = true;
                    $('#rdgSymbology').append(rdgSymbologyInterior);
                    rdgStart = 1;
                }
            }
            if (currentSubGroup == 'rdg') {
                alert("RDG feature created");
            }

            checkLayerCount(layerCount);
        }
    });
}

function displayHWMGeoJSON(type, name, url, markerIcon) {
    //increment layerCount
    layerCount++;
    hwm.clearLayers();
    var currentMarker = L.geoJson(false, {
        pointToLayer: function (feature, latlng) {
            markerCoords.push(latlng);
            var marker = L.marker(latlng, {
                icon: markerIcon
            });
            return marker;
        },
        onEachFeature: function (feature, latlng) {

            if (feature.properties.longitude_dd == undefined || feature.properties.latitude_dd == undefined) {
                console.log("Lat/lng undefined for HWM at site no: " + feature.properties.site_no);
                return
            }

            if (latlng.feature.geometry.coordinates[0] == null || latlng.feature.geometry.coordinates[1] == null) {
                console.log("null coordinates returned for " + feature.properties.site_no)
            }
            //add marker to overlapping marker spidifier
            oms.addMarker(latlng);
            // var popupContent = '';
            var currentEvent = fev.vars.currentEventName;


            // })[0];
            var popupContent =
                '<table class="table table-hover table-striped table-condensed wim-table">' +
                '<caption class="popup-title">' + name + ' | <span style="color:gray">' + currentEvent + '</span></caption>' +
                '<col style="width:50%"> <col style="width:50%">' +
                '<tr><td><strong>STN Site No.: </strong></td><td><span id="hwmSiteNo">' + feature.properties.site_no + '</span></td></tr>' +
                '<tr><td><strong>HWM Label: </strong></td><td><span id="hwmLabel">' + feature.properties.hwm_label + '</span></td></tr>' +
                '<tr><td><strong>Elevation(ft): </strong></td><td><span id="hwmElev">' + feature.properties.elev_ft + '</span></td></tr>' +
                '<tr><td><strong>Datum: </strong></td><td><span id="hwmWaterbody">' + feature.properties.verticalDatumName + '</span></td></tr>' +
                '<tr><td><strong>Height Above Ground: </strong></td><td><span id="hwmHtAboveGnd">' + (feature.properties.height_above_gnd !== undefined ? feature.properties.height_above_gnd : '<i>No value recorded</i>') + '</span></td></tr>' +
                //'<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">'+ (feature.properties.approval_id == undefined || feature.properties.approval_id == 0 ? 'Provisional  <button type="button" class="btn btn-sm data-disclaim"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>'  : 'Approved')+ '</span></td></tr>'+
                '<tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">' + (feature.properties.approval_id == undefined || feature.properties.approval_id == 0 ? '<button type="button" class="btn btn-sm data-disclaim" title="Click to view provisional data statement">Provisional <span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>' : 'Approved') + '</span></td></tr>' +
                '<tr><td><strong>Type: </strong></td><td><span id="hwmType"></span>' + feature.properties.hwmTypeName + '</td></tr>' +
                '<tr><td><strong>Marker: </strong></td><td><span id="hwmMarker">' + feature.properties.markerName + '</span></td></tr>' +
                '<tr><td><strong>Quality: </strong></td><td><span id="hwmQuality">' + feature.properties.hwmQualityName + '</span></td></tr>' +
                '<tr><td><strong>Waterbody: </strong></td><td><span id="hwmWaterbody">' + feature.properties.waterbody + '</span></td></tr>' +
                '<tr><td><strong>County: </strong></td><td><span id="hwmCounty">' + feature.properties.countyName + '</span></td></tr>' +
                '<tr><td><strong>State: </strong></td><td><span id="hwmState">' + feature.properties.stateName + '</span></td></tr>' +
                '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' + feature.properties.latitude_dd.toFixed(4) + ', ' + feature.properties.longitude_dd.toFixed(4) + '</span></td></tr>' +
                '<tr><td><strong>Description: </strong></td><td><span id="hwmDescription">' + feature.properties.hwm_locationdescription + '</span></td></tr>' +
                '<tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + hwmPageURLRoot + feature.properties.site_id + '&HWM=' + feature.properties.hwm_id + '\>HWM data page</a></b></span></td></tr>' +
                '</table>';
            // $.each(feature.properties, function( index, value ) {
            //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
            // });
            latlng.bindPopup(popupContent);
        }
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
                layer.addTo(hwm);
            });
            hwm.addTo(map);
            if (hwmStart == 0) {
                HWMCheckBox = document.getElementById("HWMToggle");
                HWMCheckBox.checked = true;
                $('#highWaterSymbology').append(highWaterSymbologyInterior);
                hwmStart = 1;
            }
            checkLayerCount(layerCount);
        }
    });
}

function getPeakValues(type, name, url, markerIcon) {
    var typeData;

    //clear peakArr so that it starts fresh in case the event is switched
    peaktest = [];

    L.geoJson(false, {
        onEachFeature: function (feature, latlng) {

            typeData = typeof feature.properties.peak_stage;
            if (typeData == "number") {
                //Create an array of each peak value
                peaktest.push(feature.properties.peak_stage);
            }
        }
    });
    return peaktest;
}

function displayPeaksGeoJSON(type, name, url, markerIcon) {

    //Create variables for createPeakArray
    var lengthPeak = [];
    var sortedPeaks = [];
    var thirdLength = [];
    var thirdVal = [];
    var twoThirdVal = [];
    var typeData;

    //clear peakArr so that it starts fresh in case the event is switched
    peakArr = [];

    //increment layerCount
    layerCount++;
    //var maxPeak = Math.max(feature.properties.peak_stage);
    peak.clearLayers();

    var createPeakArray = L.geoJson(false, {
        onEachFeature: function (feature, latlng) {

            typeData = typeof feature.properties.peak_stage;
            if (typeData == "number") {
                //Create an array of each peak value
                peakArr.push(feature.properties.peak_stage);
            }

            //sort array of peak values
            sortedPeaks = peakArr.sort(function (a, b) { return a - b });
            //console.log("here are your sorted peask", sortedPeaks);

            //find number of peak values
            lengthPeak = sortedPeaks.length;

            //divide the array into 3 equal sections
            //find the maximum peak value of each of those sections
            thirdLength = Math.round(lengthPeak / 3);
            //subtract one, because the first index starts at zero
            thirdVal = sortedPeaks[thirdLength - 1];
            twoThirdVal = sortedPeaks[thirdLength * 2 - 1];
        }
    });

    var currentMarker = L.geoJson(false, {
        onEachFeature: function (feature, latlng) {
            typeData = typeof feature.properties.peak_stage;
            if (typeData == "number") {
                //add marker to overlapping marker spidifier
                oms.addMarker(latlng);
                //var popupContent = '';
                var currentEvent = fev.vars.currentEventName;
                //set popup content using moment js to pretty format the date value
                var popupContent =
                    '<table class="table table-condensed table-striped table-hover wim-table">' +
                    '<caption class="popup-title">' + name + ' | <span style="color:gray"> ' + currentEvent + '</span></caption>' +
                    '<tr><th>Peak Stage (ft)</th><th>Datum</th><th>Peak Date & Time (UTC)</th></tr>' +
                    '<tr><td>' + feature.properties.peak_stage + '</td><td>' + feature.properties.vdatum + '</td><td>' + moment(feature.properties.peak_date).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>' +
                    '</table>';

                // $.each(feature.properties, function( index, value ) {
                //     if (value && value != 'undefined') popupContent += '<b>' + index + '</b>:&nbsp;&nbsp;' + value + '</br>';
                // });
                latlng.bindPopup(popupContent);
            }
        },

        pointToLayer: function (feature, latlng) {
            markerCoords.push(latlng);
            var labelText = feature.properties.peak_stage !== undefined ? feature.properties.peak_stage.toString() : 'No Value';
            //console.log("Ranges for peak legend. Small: <=", thirdVal, "Medium: >", thirdVal, "<=", twoThirdVal, "Large: >", twoThirdVal);
            //Create 3 categories for marker size          
            if (feature.properties.peak_stage < thirdVal) {
                var marker =
                    L.marker(latlng, {
                        icon: L.icon({ className: 'peakMarker', iconUrl: 'images/peak.png', iconAnchor: [7, 10], popupAnchor: [0, 2], iconSize: [7, 10] })
                    }).bindLabel("Peak: " + labelText + "<br>Site: " + feature.properties.site_no);
            }
            if (thirdVal <= feature.properties.peak_stage && feature.properties.peak_stage <= twoThirdVal) {
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
        }
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
            createPeakArray.addData(data);
            currentMarker.addData(data);
            currentMarker.eachLayer(function (layer) {
                layer.addTo(peak);
            });
            peak.addTo(map);
            if (peakStart == 0) {
                var peaksCheckBox = document.getElementById("peaksToggle");
                peaksCheckBox.checked = true;
                var PeakSummarySymbologyInterior = "<div>" + "<b>Peak Summary (ft)</b>" + "<br> <img class='peakSmall' src='images/peak.png' style= 'margin-left:24px'></img>" + "< " + thirdVal + "<br><img class='peakMedium' src='images/peak.png' style= 'margin-left:22px'></img>" + " " + thirdVal + " - " + twoThirdVal + "<br><img class='peakLarge' src='images/peak.png' style= 'margin-left:20px'></img>" + " > " + twoThirdVal + "</div>";

                $('#PeakSummarySymbology').append(PeakSummarySymbologyInterior);
                peakStart = 1;
            }
            checkLayerCount(layerCount);
        }
    });
}

///this function sets the current event's start and end dates as global vars. may be better as a function called on demand when date compare needed for NWIS graph setup
function populateEventDates(eventID) {
    for (var i = 0; i < fev.data.events.length; i++) {
        if (fev.data.events[i].event_id == eventID) {
            //set currentEventActive boolean var based on event_status_id value
            fev.data.events[i].event_status_id == 1 ? fev.vars.currentEventActive = true : fev.vars.currentEventActive = false;
            //set event date vars; check for undefined because services do not return the property if it has no value
            fev.vars.currentEventStartDate_str = (fev.data.events[i].event_start_date == undefined ? '' : fev.data.events[i].event_start_date.substr(0, 10));
            fev.vars.currentEventEndDate_str = (fev.data.events[i].event_end_date == undefined ? '' : fev.data.events[i].event_end_date.substr(0, 10));
            console.log("Selected event is " + fev.data.events[i].event_name + ". START date is " + fev.vars.currentEventStartDate_str + " and END date is " + fev.vars.currentEventEndDate_str + ". Event is active = " + fev.vars.currentEventActive)
        }
    }
}

function checkLayerCount(layerCount) {
    if (layerCount == fev.layerList.length) {
        if (markerCoords.length > 0) { map.fitBounds(markerCoords); }
    }
}

function filterMapData(event, isUrlParam) {

    $('.esconder').hide();
    $('.labelSpan').empty();

    layerCount = 0;
    markerCoords = [];
    var eventSelections = '';
    eventSelections = event;
    if (event == null || event == undefined) {
        alert("Please select an event to proceed");
        return
    }

    //below not needed because we know when user submits event from welcome modal based on button click listener
    ///eventSelect_welcomeModal: display the event name both in display area and large event indicator; set the eventSelections value
    // if ($('#evtSelect_welcomeModal').val() !== null){
    //     var eventSelectionsArray = $('#evtSelect_welcomeModal').val();
    //     eventSelections = eventSelectionsArray.toString();
    //     $('#eventNameDisplay').html($('#evtSelect_welcomeModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
    //     $('#largeEventNameDisplay').html($('#evtSelect_welcomeModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
    //
    // }
    //eventSelect_filterModal: display the event name both in display area and large event indicator; set the eventSelections value
    //eventSelections = '';
    // if ($('#evtSelect_filterModal').val() !== null){
    //     var eventSelectionsArray = $('#evtSelect_filterModal').val();
    //     eventSelections = eventSelectionsArray.toString();
    //     $('#eventNameDisplay').html($('#evtSelect_filterModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
    //     $('#largeEventNameDisplay').html($('#evtSelect_filterModal').select2('data').map(function(elem){ return elem.text;}).join(', '));
    //     populateEventDates(eventSelections);
    //
    // }

    //disabling the logic below pending removal of the event type select and event status select
    //event type
    // var eventTypeSelections = '';
    // if ($('#evtTypeSelect').val() !== null){
    //     var evtTypeSelectionsArray = $('#evtTypeSelect').val();
    //     eventTypeSelections = evtTypeSelectionsArray.toString();
    //     $('#eventTypeDisplay').html($('#evtTypeSelect').select2('data').map(function(elem){ return elem.text;}).join(', '));
    // }
    // //event status
    // var eventStatusSelectionArray = [];
    // //event status: active
    // if ($('#active')[0].checked && !($('#complete')[0].checked) ) {
    //     eventStatusSelectionArray.push(1);
    //     $('#eventStatusDisplay').html('Active');
    // }
    // //event status: complete
    // if ($('#complete')[0].checked && !($('#active')[0].checked)) {
    //     eventStatusSelectionArray.push(2);
    //     $('#eventStatusDisplay').html('Complete');
    // }
    // if ($('#active')[0].checked && $('#complete')[0].checked) {
    //     eventStatusSelectionArray.push(0);
    //     $('#eventStatusDisplay').html('Active, Complete');
    // }
    // if ( !($('#active')[0].checked) && !($('#complete')[0].checked)) {
    //     eventStatusSelectionArray.push(0);
    //     $('#eventStatusDisplay').html('');
    // }
    //
    // var eventStatusSelection =  eventStatusSelectionArray.toString();

    //state
    var stateSelections = '';
    if ($('#stateSelect').val() !== null) {
        var stateSelectionsArray = $('#stateSelect').val();
        stateSelections = stateSelectionsArray.toString();
        if ($('#stateSelect').select2('data').length > 0) {
            for (var i = 0; i < $('#stateSelect').select2('data').length; i++) {
                //sensorTypeSelectionsTextArray.push($('#sensorTypeSelect').select2('data')[i].text);
                $('#stateDisplay').append('<span class="label label-default">' + $('#stateSelect').select2('data')[i].text + '</span>');

            }
        }
        $('#locationGroupDiv').show();
        $('#stateDisplay_li').show();
        //$('#stateDisplay').html(stateSelections);
    }
    //county
    var countySelections = '';
    if ($('#countySelect').val() !== null) {
        var countySelectionsArray = $('#countySelect').val();
        countySelections = countySelectionsArray.toString();
        if ($('#countySelect').select2('data').length > 0) {
            for (var i = 0; i < $('#countySelect').select2('data').length; i++) {
                //sensorTypeSelectionsTextArray.push($('#sensorTypeSelect').select2('data')[i].text);
                $('#countyDisplay').append('<span class="label label-default">' + $('#countySelect').select2('data')[i].text + '</span>');

            }
        }
        $('#locationGroupDiv').show();
        $('#countyDisplay_li').show();
        //$('#countyDisplay').html(countySelections);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //SENSORS
    //if ($('#sensorRad')[0].checked){

    //check if any of the sensor filters have value, if so show the sensorsGroupDiv
    if (($('#sensorTypeSelect').val() !== null) || ($('#sensorStatusSelect').val() !== null) || ($('#collectionConditionSelect').val() !== null) || ($('#deployTypeSelect').val() !== null)) {
        $('#sensorsGroupDiv').show();
    }

    //sensor type
    var sensorTypeSelections = '';
    if ($('#sensorTypeSelect').val() !== null) {
        var sensorTypeSelectionArray = $('#sensorTypeSelect').val();
        sensorTypeSelections = sensorTypeSelectionArray.toString();
        //var sensorTypeSelectionsTextArray = [];
        if ($('#sensorTypeSelect').select2('data').length > 0) {
            for (var i = 0; i < $('#sensorTypeSelect').select2('data').length; i++) {
                //sensorTypeSelectionsTextArray.push($('#sensorTypeSelect').select2('data')[i].text);
                $('#sensorTypeDisplay').append('<span class="label label-default">' + $('#sensorTypeSelect').select2('data')[i].text + '</span>');

            }
        }
        $('#sensorTypeDisplay_li').show();
        //$('#sensorTypeDisplay').html(sensorTypeSelectionsTextArray.toString());
    }
    //sensor status
    var sensorStatusSelections = '';
    if ($('#sensorStatusSelect').val() !== null) {
        var sensorStatusSelectionArray = $('#sensorStatusSelect').val();
        sensorStatusSelections = sensorStatusSelectionArray.toString();
        //var sensorStatusSelectionsTextArray = [];
        if ($('#sensorStatusSelect').select2('data').length > 0) {
            for (var i = 0; i < $('#sensorStatusSelect').select2('data').length; i++) {
                //sensorStatusSelectionsTextArray.push($('#sensorStatusSelect').select2('data')[i].text)
                $('#sensorStatusDisplay').append('<span class="label label-default">' + $('#sensorStatusSelect').select2('data')[i].text + '</span>');
            }
        }
        $('#sensorStatusDisplay_li').show();
        //$('#sensorStatusDisplay').html(sensorStatusSelectionsTextArray.toString());
    }

    //sensor collection condition
    var collectConditionSelections = '';
    if ($('#collectionConditionSelect').val() !== null) {
        var collectConditionSelectionArray = $('#collectionConditionSelect').val();
        collectConditionSelections = collectConditionSelectionArray.toString();
        //var collectConditionSelectionsTextArray = [];
        if ($('#collectionConditionSelect').select2('data').length > 0) {
            for (var i = 0; i < $('#collectionConditionSelect').select2('data').length; i++) {
                //collectConditionSelectionsTextArray.push($('#collectionConditionSelect').select2('data')[i].text)
                $('#collectConditionDisplay').append('<span class="label label-default">' + $('#collectionConditionSelect').select2('data')[i].text + '</span>');
            }
        }
        $('#collectConditionDisplay_li').show();
        //$('#collectConditionDisplay').html(collectConditionSelectionsTextArray.toString());
    }

    //sensor deployment type
    var deploymentTypeSelections = '';
    if ($('#deployTypeSelect').val() !== null) {
        var deploymentTypeSelectionArray = $('#deployTypeSelect').val();
        deploymentTypeSelections = deploymentTypeSelectionArray.toString();
        //var deployTypeSelectionsTextArray = [];
        if ($('#deployTypeSelect').select2('data').length > 0) {
            for (var i = 0; i < $('#deployTypeSelect').select2('data').length; i++) {
                //deployTypeSelectionsTextArray.push($('#deployTypeSelect').select2('data')[i].text)
                $('#deployTypeDisplay').append('<span class="label label-default">' + $('#deployTypeSelect').select2('data')[i].text + '</span>');
            }
        }
        $('#deployTypeDisplay_li').show();
        //$('#deployTypeDisplay').html(deployTypeSelectionsTextArray.toString());
    }

    //query string including event status and event type params
    //fev.queryStrings.sensorsQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&SensorType=' + sensorTypeSelections + '&CurrentStatus=' + sensorStatusSelections + '&CollectionCondition=' + collectConditionSelections + '&DeploymentType=' + deploymentTypeSelections;
    ////query string not including event status and event type params
    fev.queryStrings.sensorsQueryString = '?Event=' + eventSelections + '&States=' + stateSelections + '&County=' + countySelections + '&SensorType=' + sensorTypeSelections + '&CurrentStatus=' + sensorStatusSelections + '&CollectionCondition=' + collectConditionSelections + '&DeploymentType=' + deploymentTypeSelections;

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

    //check if any of the hwm filters have value, if so show the hwmGroupDiv
    if (($('#hwmTypeSelect').val() !== null) || ($('#hwmQualitySelect').val() !== null) || ($('#coastal')[0].checked) || ($('#riverine')[0].checked) || ($('#surveyCompleteYes')[0].checked) || ($('#surveyCompleteNo')[0].checked) || ($('#stillWaterYes')[0].checked) || ($('#stillWaterNo')[0].checked)) {
        $('#hwmGroupDiv').show();
    }
    //HWM types
    var hwmTypeSelections = '';
    if ($('#hwmTypeSelect').val() !== null) {
        var hwmTypeSelectionArray = $('#hwmTypeSelect').val();
        hwmTypeSelections = hwmTypeSelectionArray.toString();
        //var hwmTypeSelectionsTextArray = [];
        if ($('#hwmTypeSelect').select2('data').length > 0) {
            for (var i = 0; i < $('#hwmTypeSelect').select2('data').length; i++) {
                //hwmTypeSelectionsTextArray.push($('#hwmTypeSelect').select2('data')[i].text)
                $('#hwmTypeDisplay').append('<span class="label label-default">' + $('#hwmTypeSelect').select2('data')[i].text + '</span>');
            }
        }
        $('#hwmTypeDisplay_li').show();
        //$('#hwmTypeDisplay').html(hwmTypeSelectionsTextArray.toString());
    }
    //HWM quality
    var hwmQualitySelections = '';
    if ($('#hwmQualitySelect').val() !== null) {
        var hwmQualitySelectionArray = $('#hwmQualitySelect').val();
        hwmQualitySelections = hwmQualitySelectionArray.toString();
        //var hwmQualitySelectionsTextArray = [];
        if ($('#hwmQualitySelect').select2('data').length > 0) {
            for (var i = 0; i < $('#hwmQualitySelect').select2('data').length; i++) {
                //hwmQualitySelectionsTextArray.push($('#hwmQualitySelect').select2('data')[i].text)
                $('#hwmQualityDisplay').append('<span class="label label-default">' + $('#hwmQualitySelect').select2('data')[i].text + '</span>');
            }
        }
        $('#hwmQualityDisplay_li').show();
        //$('#hwmQualityDisplay').html(hwmQualitySelectionsTextArray.toString());
    }
    ////HWM environment
    var hwmEnvSelectionArray = [];
    //HWM environment: coastal
    if ($('#coastal')[0].checked && !($('#riverine')[0].checked)) {
        hwmEnvSelectionArray.push('Coastal');
        $('#hwmEnvDisplay_li').show();
        //$('#hwmEnvDisplay').html('Coastal');
        $('#hwmEnvDisplay').html('<span class="label label-default">Coastal</span>');
    }
    //HWM environment: riverine
    if ($('#riverine')[0].checked && !($('#coastal')[0].checked)) {
        hwmEnvSelectionArray.push('Riverine');
        $('#hwmEnvDisplay_li').show();
        //$('#hwmEnvDisplay').html('Riverine');
        $('#hwmEnvDisplay').html('<span class="label label-default">Riverine</span>');
    }
    var hwmEnvSelections = hwmEnvSelectionArray.toString();
    //HWM survey status
    var hwmSurveyStatusSelectionArray = [];
    ///HWM survey status: complete
    if ($('#surveyCompleteYes')[0].checked && !($('#surveyCompleteNo')[0].checked)) {
        hwmSurveyStatusSelectionArray.push('true');
        $('#hwmSurveyCompDisplay_li').show();
        //$('#hwmSurveyCompDisplay').html('True');
        $('#hwmSurveyCompDisplay').html('<span class="label label-default">True</span>');
    }
    ///HWM survey status: not complete
    if ($('#surveyCompleteNo')[0].checked && !($('#surveyCompleteYes')[0].checked)) {
        hwmSurveyStatusSelectionArray.push('false');
        $('#hwmSurveyCompDisplay_li').show();
        //$('#hwmSurveyCompDisplay').html('False');
        $('#hwmSurveyCompDisplay').html('<span class="label label-default">False</span>');
    }
    var hwmSurveyStatusSelections = hwmSurveyStatusSelectionArray.toString();
    //HWM stillwater status
    var hwmStillwaterStatusSelectionArray = [];
    ///HWM stillwater status: yes
    if ($('#stillWaterYes')[0].checked && !($('#stillWaterNo')[0].checked)) {
        hwmStillwaterStatusSelectionArray.push('true');
        $('#hwmStillWaterDisplay_li').show();
        //$('#hwmStillWaterDisplay').html('True');
        $('#hwmStillWaterDisplay').html('<span class="label label-default">True</span>');
    }
    ///HWM stillwater status: no
    if ($('#stillWaterNo')[0].checked && !($('#stillWaterYes')[0].checked)) {
        hwmStillwaterStatusSelectionArray.push('false');
        $('#hwmStillWaterDisplay_li').show();
        //$('#hwmStillWaterDisplay').html('False');
        $('#hwmStillWaterDisplay').html('<span class="label label-default">False</span>');
    }
    var hwmStillwaterStatusSelections = hwmStillwaterStatusSelectionArray.toString();

    //query string including event status and event type params
    //fev.queryStrings.hwmsQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&HWMType=' + hwmTypeSelections + '&HWMQuality=' + hwmQualitySelections + '&HWMEnvironment=' + hwmEnvSelections + '&SurveyComplete=' + hwmSurveyStatusSelections + '&StillWater=' + hwmStillwaterStatusSelections;
    //query string not including event status and event type params
    fev.queryStrings.hwmsQueryString = '?Event=' + eventSelections + '&States=' + stateSelections + '&County=' + countySelections + '&HWMType=' + hwmTypeSelections + '&HWMQuality=' + hwmQualitySelections + '&HWMEnvironment=' + hwmEnvSelections + '&SurveyComplete=' + hwmSurveyStatusSelections + '&StillWater=' + hwmStillwaterStatusSelections;
    //var resultIsEmpty = false;

    fev.urls.csvHWMsQueryURL = fev.urls.csvHWMsURLRoot + fev.queryStrings.hwmsQueryString;
    fev.urls.jsonHWMsQueryURL = fev.urls.jsonHWMsURLRoot + fev.queryStrings.hwmsQueryString;
    fev.urls.xmlHWMsQueryURL = fev.urls.xmlHWMsURLRoot + fev.queryStrings.hwmsQueryString;

    //add download buttons
    $('#hwmDownloadButtonCSV').attr('href', fev.urls.csvHWMsQueryURL);
    $('#hwmDownloadButtonJSON').attr('href', fev.urls.jsonHWMsQueryURL);
    $('#hwmDownloadButtonXML').attr('href', fev.urls.xmlHWMsQueryURL);

    //get geoJSON
    //displayHWMGeoJSON(fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString, hwmMarkerIcon);


    //}
    //PEAKS
    //if ($('#peakRad')[0].checked) {
    if (($('#peakStartDate')[0].value !== '') || ($('#peakEndDate')[0].value !== '')) {
        $('#peaksGroupDiv').show();
    }

    var peakStartDate;
    if ($('#peakStartDate')[0].value !== '') {
        $('#peakStartDisplay_li').show();
        peakStartDate = $('#peakStartDate')[0].value;
        $('#peakStartDisplay').html(moment(peakStartDate).format("D MMM YYYY"));
    }
    var peakEndDate;
    if ($('#peakEndDate')[0].value !== '') {
        $('#peakEndDisplay_li').show();
        peakEndDate = $('#peakEndDate')[0].value;
        $('#peakEndDisplay').html(moment(peakEndDate).format("D MMM YYYY"));
    }

    //query string including event status and event type params
    //fev.queryStrings.peaksQueryString = '?Event=' + eventSelections + '&EventType=' + eventTypeSelections + '&EventStatus=' + eventStatusSelection + '&States=' + stateSelections + '&County=' + countySelections + '&StartDate='  + peakStartDate + '&EndDate=' + peakEndDate;
    //query string not including event status and event type params
    fev.queryStrings.peaksQueryString = '?Event=' + eventSelections + '&States=' + stateSelections + '&County=' + countySelections + '&StartDate=' + peakStartDate + '&EndDate=' + peakEndDate;

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
    $.each(fev.layerList, function (index, layer) {
        if (layer.Type == 'sensor') displaySensorGeoJSON(layer.ID, layer.Name, fev.urls[layer.ID + 'GeoJSONViewURL'] + fev.queryStrings.sensorsQueryString, window[layer.ID + 'MarkerIcon']);
        if (layer.ID == 'hwm') displayHWMGeoJSON(layer.ID, layer.Name, fev.urls.hwmFilteredGeoJSONViewURL + fev.queryStrings.hwmsQueryString, hwmMarkerIcon);
        if (layer.ID == 'peak') displayPeaksGeoJSON(layer.ID, layer.Name, fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peakMarkerIcon);
    });
} //end filterMapData function
function queryNWISRainGages(bbox) {
    var NWISRainmarkers = {};

    var siteStatus = 'active';
    //var state = ['DE', 'FL', 'GA', 'MD', 'MA', 'NJ', 'NC', 'ND', 'PA', 'RI', 'SC', 'VA', 'WV', 'GU', 'PR'];
    //var state = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'GU', 'PR', 'VI'];
    //for (i = 0; i < state.length; i++) {

    var parameterCodeList2 = '00045,46529,72192';
    var siteTypeList = 'OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS,AT,WE,SP';
    var siteStatus = 'active';
    var url = 'https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=' + bbox + '&parameterCd=' + parameterCodeList2 + '&siteType=' + siteTypeList + '&siteStatus=' + siteStatus;


    //var url = 'https://waterdata.usgs.gov/' + state[i] + '/nwis/current?type=precip&group_key=county_cd&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd';
    //var url = 'https://waterdata.usgs.gov/nwis/current?type=precip&group_key=county_cd&format=sitefile_output&sitefile_output_format=xml&column_name=agency_cd&column_name=site_no&column_name=station_nm&column_name=site_tp_cd&column_name=dec_lat_va&column_name=dec_long_va&column_name=agency_use_cd';
    console.log(url);

    $.ajax({
        url: url,
        dataType: "xml",
        data: NWISRainmarkers,
        success: function (xml) {
            $(xml).find('site').each(function () {

                var siteID = $(this).attr('sno');
                var siteName = $(this).attr('sna');
                var lat = $(this).attr('lat');
                var lng = $(this).attr('lng');
                /* NWISmarkers[siteID] = L.marker([lat, lng], { icon: nwisMarkerIcon });
                NWISmarkers[siteID].data = { siteName: siteName, siteCode: siteID };
                NWISmarkers[siteID].data.parameters = {};

                    var siteID = this.children[1].innerHTML;
                    var siteName = this.children[2].innerHTML;
                    if (this.children[4].innerHTML == "") {
                        var lat = "36.378769";
                        var lng = "97.470630";
                    } else {
                        var lat = this.children[4].innerHTML;
                        var lng = this.children[5].innerHTML;
                    } */
                NWISRainmarkers[siteID] = L.marker([lat, lng], { icon: nwisRainMarkerIcon });
                NWISRainmarkers[siteID].data = { siteName: siteName, siteCode: siteID };
                NWISRainmarkers[siteID].data.parameters = {};

                //add point to featureGroup
                USGSRainGages.addLayer(NWISRainmarkers[siteID]);

                $("#nwisLoadingAlert").fadeOut(2000);
            });
        },
        error: function (xml) {
            $("#nwisLoadingAlert").fadeOut(2000);
        }
    });
    //}
}
//use extent to get NWIS rt gages based on bounding box, display on map
function queryNWISrtGages(bbox) {
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
        },
        error: function (xml) {
            $("#nwisLoadingAlert").fadeOut(2000);
        }
    });
}


//get data and generate graph of stream gage for Report
function queryNWISgraphRDG(e) {
    var usgsSiteID;

    var currentEvent = fev.vars.currentEventName;
    var popupContent =
        '<table class="table table-hover table-striped table-condensed">' +
        '<caption class="popup-title">Rapid Deployment Gage | ' + currentEvent + '</caption>' +
        '<tr><td><strong>STN Site Number: </strong></td><td><span id="siteName">' + e.layer.feature.properties.site_no + '</span></td></tr>' +
        '<tr><td><strong>Status: </strong></td><td><span id="status">' + e.layer.feature.properties.status + '</span></td></tr>' +
        '<tr><td><strong>City: </strong></td><td><span id="city">' + (e.layer.feature.properties.city == '' || e.layer.feature.properties.city == null || e.layer.feature.properties.city == undefined ? '<i>No city recorded</i>' : e.layer.feature.properties.city) + '</span></td></tr>' +
        '<tr><td><strong>County: </strong></td><td><span id="county">' + e.layer.feature.properties.county + '</span></td></tr>' +
        '<tr><td><strong>State: </strong></td><td><span id="state">' + e.layer.feature.properties.state + '</span></td></tr>' +
        '<tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">' + e.layer.feature.properties.latitude_dd.toFixed(4) + ', ' + e.layer.feature.properties.longitude_dd.toFixed(4) + '</span></td></tr>' +
        '<tr><td><strong>STN data page: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href=' + sensorPageURLRoot + e.layer.feature.properties.site_id + '&Sensor=' + e.layer.feature.properties.instrument_id + '\>Sensor data page</a></b></span></td></tr>' +
        '</table>' +
        '<div id="RDGgraphContainer" style="width:100%; height:250px;display:none;"></div>' +
        '<div id="RDGdataLink" style="width:100%;display:none;"><b><span class="rdg-nwis-info" style="color:red;"> - Provisional Data Subject to Revision -</span><br><span class="rdg-nwis-info">Additional parameters available at NWISWeb</span><br><a class="nwis-link" id="rdgNWISLink" target="_blank" href="https://usgs.gov"></a></b></div>' +
        '<div id="noDataMessage" style="width:100%;display:none;"><b><span>No NWIS Data Available for Graph</span></b></div>';

    e.layer.bindPopup(popupContent).openPopup();

    $.getJSON(stnServicesURL + "/Sites/" + e.layer.feature.properties.site_id + ".json", function (data) {
        //USGS UD must be minimum 8 characters long, max 15
        if (data.usgs_sid.length >= 8 && data.usgs_sid.length <= 15) {
            //sensor type is RDG, and there is a usgs id. proceed with retrieving and displaying graph.
            usgsSiteID = data.usgs_sid;
            //hardcode usgsid that does have RDG data, for testing
            //usgsSiteID = '365423076051300';

            var timeQueryRange = '';
            //check if event has a blank end date - in that case set end of time query to current date
            if (fev.vars.currentEventEndDate_str == '') {
                //use moment.js lib to get current system date string, properly formatted
                fev.vars.currentEventEndDate_str = moment().format('YYYY-MM-DD');
                console.log("Selected event is active, so end date is today, " + fev.vars.currentEventEndDate_str)
            }

            //if there is no valid date string for start or end, there is no way to retrieve data - display NA message. Otherwise proceed.
            if (fev.vars.currentEventStartDate_str == '' || fev.vars.currentEventEndDate_str == '') {
                $('#noDataMessage').show();
            } else {
                //set timeQueryRange to the event start date and end date
                timeQueryRange = '&startDT=' + fev.vars.currentEventStartDate_str + '&endDT=' + fev.vars.currentEventEndDate_str;
                //set the URL for the NWIS RDG page, with time period specified
                var rdgNWIS_URL = 'https://waterdata.usgs.gov/nwis/uv?site_no=' + usgsSiteID + '&begin_date=' + fev.vars.currentEventStartDate_str + '&end_date=' + fev.vars.currentEventEndDate_str;
                $('#rdgNWISLink').prop('href', rdgNWIS_URL);
                $('#rdgNWISLink').html('Site ' + usgsSiteID + ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i>');

                ///now have valid start and end date strings, so proceed with getting the graph (for water level, generically defined, PCs 62620,00065,00067
                //may need to account for cases where multiple time-series sets returns, 1 for each of multiple params hint: data.parameter_cd should show PC before drilling down to time series object
                //idea below for prioritizing 00065
                ///var gageHeightCode = 00065
                //$each(sites) function(site) {
                //    if (site.parameter_cd =='62620') gageheightCode == site.parameter_cd
                //}
                $.getJSON('https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + usgsSiteID + '&parameterCd=62620,00065,00067' + timeQueryRange, function (data) {

                    if (data.data == undefined) {
                        console.log("No NWIS RDG data available for this time period");
                        $('#noDataMessage').show();
                        //if no time series data, display data NA message
                        //if (data.data[0].time_series_data.length <= 0 ){}
                    }
                    else {
                        //if there is some data, show the div
                        $('#RDGdataLink').show();
                        $('#RDGgraphContainer').show();

                        //create chart
                        Highcharts.setOptions({ global: { useUTC: false } });
                        $('#RDGgraphContainer').highcharts({
                            chart: {
                                type: 'line'
                            },
                            title: {
                                text: 'RDG water level, NWIS site ' + usgsSiteID,
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
                                filename: 'FEV_RDG_NWISSite' + usgsSiteID
                            },
                            credits: {
                                enabled: true,
                                text: "USGS NWIS",
                                href: "https://waterdata.usgs.gov/nwis"
                            },
                            xAxis: {
                                type: "datetime",
                                labels: {
                                    formatter: function () {
                                        return Highcharts.dateFormat('%m/%d/%y', this.value);
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
            }
        } else {
            //no valid usgs id, so no RDG data available - show message saying that
            $('#noDataMessage').show();
        }
    });
}

//get data and generate graph of real-time gage water level time-series data
function displayRtGageReport(streamGagesInBuffer) {

    //Prevent the code before 'getJSON' to loop over before 'getJSON' has also run
    $.ajaxSetup({
        async: false
    });

    //This title appears under the map/legend in the regional report
    //No report or title are shown if there are no stream gages in the buffer
    //Stream gage layer must be turned on
    var gageGraphTitle = document.getElementById('gageGraphs');
    gageGraphTitle.innerHTML = ""
    if (streamGagesInBuffer.length == 1) {
        gageGraphTitle.innerHTML = "Real-time Stream Gage";
    }
    if (streamGagesInBuffer.length > 1) {
        gageGraphTitle.innerHTML = "Real-time Stream Gages";
    }

    //Keeps track of how many graphs were generated (or attempted to generate)
    //Counter is later added to the end of each graph-related ID so that the elements don't overwrite after each loop
    //Without this counter, only one graph/no data warning will appear
    var graphCounter = 0;

    for (streamGage in streamGagesInBuffer) {

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
        $('#rtgraphs').append("<div style='text-align: left'>" + "</br>" + streamGagesInBuffer[streamGage].data.siteName + " (Site" + "&nbsp" + streamGagesInBuffer[streamGage].data.siteCode + ")" + "</br>" + "</div>" + "<div id= " + tempNoDataID + " display:none;'></div>" + "<div id=" + tempID + " style='width:400px; height:250px;display:none;'>" + "</div>");

        //Get the data for the hydrograph
        $.getJSON('https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + streamGagesInBuffer[streamGage].data.siteCode + '&parameterCd=' + parameterCodeList + timeQueryRange, function (data) {
            
            //If there are no data to create a hydrograph, display the no data warning
            if (data.data == undefined) {
                $(tempNoDataHash).append("<div style= text-align:left;>" + "No NWIS data available for this time period" + "<div>");
                $(tempNoDataHash).show();
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
                        filename: 'FEV_NWIS_Site' + streamGagesInBuffer[streamGage].data.siteCode
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
    }
}

//get data and generate graph of real-time gage water level time-series data
function queryNWISgraph(e) {
    var popupContent = '';
    //$.each(e.layer.data.parameters, function( index, parameter ) {
    //create table, converting timestamp to friendly format using moment.js library
    //popupContent += '<tr><td>' + index + '</td><td>' + parameter.Value + '</td><td>' + moment(parameter.Time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>'
    //});

    var parameterCodeList = '00065,62619,62620,63160,72279';
    //var parameterCodeList = '00065';

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

    //popup markup with site name number and name - moved into chart title
    //e.layer.bindPopup('<label class="popup-title">Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode + '">NWIS data page for site ' + e.layer.data.siteCode + ' <i class="fa fa-external-link" aria-hidden="true"></i></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', {minWidth: 350}).openPopup();
    e.layer.bindPopup('<label class="popup-title">NWIS Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a class="nwis-link" target="_blank" href="https://waterdata.usgs.gov/monitoring-location/02231175/#parameterCode=' + e.layer.data.siteCode + '"><b>Site ' + e.layer.data.siteCode + ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i></b></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', { minWidth: 350 }).openPopup();

    //rtgraphForReport = '<label class="popup-title">NWIS Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a class="nwis-link" target="_blank" href="https://waterdata.usgs.gov/monitoring-location/02231175/#parameterCode=' + e.layer.data.siteCode + '"><b>Site ' + e.layer.data.siteCode + ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i></b></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>';
    //var getGraphs = document.getElementById('rtgraphs');


    $.getJSON('https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + e.layer.data.siteCode + '&parameterCd=' + parameterCodeList + timeQueryRange, function (data) {

        //if (data.data[0].time_series_data.length <= 0) console.log("No NWIS graph data available for this time period");


        if (data.data == undefined) {
            console.log("No NWIS data available for this time period");
            $('#graphLoadMessage').hide();
            $('#noDataMessage').show();
            //if no time series data, display data NA message
            //if (data.data[0].time_series_data.length <= 0 ){}
        }

        else {
            //if there is some data, show the div
            $('#graphLoadMessage').hide();
            $('.popup-title').hide();
            $('#graphContainer').show();
            $('#graphContainerReport').show();

            //create chart
            Highcharts.setOptions({ global: { useUTC: false } });
            $('#graphContainer').highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'NWIS Site ' + e.layer.data.siteCode + '<br> ' + e.layer.data.siteName,
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
                    filename: 'FEV_NWIS_Site' + e.layer.data.siteCode
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
            $('#graphContainerReport').highcharts({
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
                    enabled: false
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
}

function queryNWISRaingraph(e) {
    var popupContent = '';
    //$.each(e.layer.data.parameters, function( index, parameter ) {
    //create table, converting timestamp to friendly format using moment.js library
    //popupContent += '<tr><td>' + index + '</td><td>' + parameter.Value + '</td><td>' + moment(parameter.Time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</td></tr>'
    //});

    var parameterCodeList = '00045,89363,46529,72192';
    //var parameterCodeList = '00065';

    var timeQueryRange = '';
    //if event has no end date
    if (fev.vars.currentEventEndDate_str == '') {
        //use moment.js lib to get current system date string, properly formatted, set currentEventEndDate var to current date
        fev.vars.currentEventEndDate_str = moment().format('YYYY-MM-DD');
    }
    //if no start date and
    if ((fev.vars.currentEventStartDate_str == "") || (fev.vars.currentEventEndDate_str == "")) {
        timeQueryRange = '&period=P7D'
    } else {
        timeQueryRange = '&startDT=' + fev.vars.currentEventStartDate_str + '&endDT=' + fev.vars.currentEventEndDate_str;
    }

    //popup markup with site name number and name - moved into chart title
    //e.layer.bindPopup('<label class="popup-title">Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode + '">NWIS data page for site ' + e.layer.data.siteCode + ' <i class="fa fa-external-link" aria-hidden="true"></i></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', {minWidth: 350}).openPopup();
    e.layer.bindPopup('<label class="popup-title">NWIS Site ' + e.layer.data.siteCode + '</br>' + e.layer.data.siteName + '</span></label></br><p id="graphLoadMessage"><span><i class="fa fa-lg fa-cog fa-spin fa-fw"></i> NWIS data graph loading...</span></p><div id="graphContainer" style="width:100%; height:200px;display:none;"></div> <a class="nwis-link" target="_blank" href="https://nwis.waterdata.usgs.gov/nwis/uv?site_no=' + e.layer.data.siteCode + '"><b>Site ' + e.layer.data.siteCode + ' on NWISWeb <i class="fa fa-external-link" aria-hidden="true"></i></b></a><div id="noDataMessage" style="width:100%;display:none;"><b><span>NWIS water level data not available to graph</span></b></div>', { minWidth: 350 }).openPopup();

    $.getJSON('https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + e.layer.data.siteCode + '&parameterCd=' + parameterCodeList + timeQueryRange, function (data) {

        //if (data.data[0].time_series_data.length <= 0) console.log("No NWIS graph data available for this time period");


        if (data.data == undefined) {
            console.log("No NWIS data available for this time period");
            $('#graphLoadMessage').hide();
            $('#noDataMessage').show();
            //if no time series data, display data NA message
            //if (data.data[0].time_series_data.length <= 0 ){}
        }

        else {
            var data;
            if (data.data.length == 2) {
                data = data.data[1].time_series_data;
            } else {
                data = data.data[0].time_series_data;
            }

            var newList = [];
            var sum = 0;

            data.forEach(function (item, idx) {
                //sum is the cumulative count of the value (second element of [time,data] item)
                sum = sum + item[1];
                //push new item with the original date, and latest sum value
                newList.push([item[0], sum]);
            });

            //if there is some data, show the div
            $('#graphLoadMessage').hide();
            $('.popup-title').hide();
            $('#graphContainer').show();

            //create chart
            Highcharts.setOptions({ global: { useUTC: false } });
            $('#graphContainer').highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'NWIS Site ' + e.layer.data.siteCode + '<br> ' + e.layer.data.siteName,
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
                    filename: 'FEV_NWIS_Station' + e.layer.data.siteCode
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
                    title: { text: 'Precipitation total, inches' }
                },
                tooltip: {
                    formatter: function () {
                        return 'Precipitation total: ' + Highcharts.numberFormat(this.y, 2, '.') + ' inches';
                    }
                },
                series: [{
                    turboThreshold: 3000,
                    showInLegend: false,
                    data: newList,
                    /* tooltip: {
                    pointFormat: "precip height: {point.y} inches"
                    } */
                }]
            });
        }
    });
}

//out of use
// function getLayerName(type) {
//     switch(type) {
//         case "baro": return "Barometric Pressure Sensor";
//         case "stormTide": return "Storm Tide Sensor";
//         case "met" : return "Meteorological Sensor";
//         case 'waveHeight': return "Wave Height Sensor";
//         case "rdg" : return "Rapid Deployment Gage";
//         case "hwm": return  "High Water Mark";
//         case "peak": return  "Peak Summary";
//     }
// }
/**
 * Created by bdraper on 4/17/2015.
 */
//utility function for formatting numbers with commas every 3 digits
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
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
var bbox;
var currentParkOrRefuge = "";
var identifiedPeaks = [];
var identifiedMarks = [];
var identifiedUSGSrtGage = [];
var buffer;
var selectedEvent;
var selectedBuffer;
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
		{ fieldName: 'Latitude, Longitude(DD)', colName: "Latitude, Longitude (DD)" },
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
		{ fieldName: 'Peak Stage', colName: "Peak Stage (ft)" },
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
});

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
	url: "https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved_Authoritative/FeatureServer/1",
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

	//welcomeModal: set search for 'Go' click 
	submitSearch($('#btnSubmitEvent'), '#evtSelect_welcomeModal', '#welcomeModal', '#evtSelect_welcomeModal', '#typeSelect_welcomeModal', '#siteSelect_welcomeModal', false);
	//updateFiltersModal MODAL: set search for 'Go' click 
	submitSearch($('#btnSubmitEvent_filter'), '#evtSelect_updateFiltersModal', '#updateFiltersModal', '#evtSelect_filterModal', '#typeSelect_filterModal', '#siteSelect_filterModal', true);

	//set search for 'Go' click
	function submitSearch(submitButton, evtSelect_Modal_Primary, chooseModal, evtSelect_Modal_Secondary, typeSelect, siteSelect, runningFilter) {
		submitButton.click(function () {
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
				filterMapData(eventID, false);

				if (runningFilter == true) {
					searchComplete(true);
				}
				if (runningFilter == false) {
					searchComplete(false);
				}
			} else {
				//if no event selected, warn user with alert
				// Also accounting for having an event selected but no parkref
				if ((($(evtSelect_Modal_Primary).val() !== null) && ($(typeSelect).val() !== null) && ($(siteSelect).val() !== null))) {
					$('.eventSelectAlert').hide();
				} else {
					$('.eventSelectAlert').show();
				}
			}

			//reset identified gages
			identifiedUSGSrtGage = [];

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
		});
	}

	$('#print').click(function () {
		printReport();
		setTimeout(() => {
			location.reload();
		}, 500);
	});

	$('#printClose').click(function () {
		location.reload()
	});

	$('#printCloseTop').click(function () {
		location.reload()
	});



	// $('#printRegionalReport').click(function () {
	// 	setTimeout(() => {
	// 		printRegionalReport();
	// 	}, 3000)
	// });

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
	noaaService.addTo(map);
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

	var pdfRegionalMapUrl;
	$('#regionalReportNav').click(function () {
		showRegionalModal();

		// Get image of map from Regional Report for pdfMake pdf
		function getRegionalMap() {
			let mapPane;
			//mapPane = $('.leaflet-map-pane')[0];
			mapPane = $('#regionalMapContainer')[0].children[0].children[0];
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
			html2canvas(document.getElementById('regionalMap'), options).then(function (canvas) {
				mapEvent = new Event('map_ready');
				canvas.style.width = '700px';
				canvas.style.height = '450px';
				pdfRegionalMapUrl = canvas.toDataURL('image/png');
				window.dispatchEvent(mapEvent);
			});
		};

		// If there is no data, then printing will be disabled. 
		if ((allPeaks.length === 0) && (allHWMs.length === 0)) {
			document.getElementById("printRegionalReport").disabled = true;
		} else {
			document.getElementById("printRegionalReport").disabled = false;
		}

		$('#printRegionalReport').click(function () {
			getRegionalMap();

			//// Get Summary Information Table data to put into pdfMake table ////
			var summaryRows = [];
			var sumHeaders = [];
			// Get table values from summary information table
			function summaryInfo() {
				$('#summaryDataTable th').each(function (index, item) {
					sumHeaders[index] = $(item).html();
				});
				$('#summaryDataTable tr').has('td').each(function () {
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
			// Insert tably body into pdfMake formatted table
			function summaryTable(data, columns) {
				return {
					table: {
						headerRows: 1,
						widths: '*',
						body: buildSummaryBody(data, ['Type', 'Total Sites', 'Standard Dev (ft)', 'Min (ft)', 'Median (ft)', 'Mean (ft)', 'Max (ft)', '90% Conf Low', '90% Conf High']),
					},
					layout: 'lightHorizontalLines',
					style: 'smaller',
					margin: [0, 0, 0, 15]
				};
			};
			//// End of Summary Information table build ////

			//// Get Peak Table information data to put into pdfMake /////
			var peakData = [];
			var peakHeaders = [];
			// Get table values from peak table
			function getPeaksData() {
				$('#peakDataTableReg th').each(function (index, item) {
					peakHeaders[index] = $(item).html();
				});
				$('#peakDataTableReg tr').has('td').each(function () {
					var arrayItem = {};
					$('td', $(this)).each(function (index, item) {
						arrayItem[peakHeaders[index]] = $(item).html();
					});
					peakData.push(arrayItem);
				});
				return peakData;
			};
			// Build the table body for pdfMake of peak table information
			function buildPeaksBody(data, columns) {
				var body = [];
				if (allPeaks.length === 0) {
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
				if (allPeaks.length === 0) {
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
							widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
							body: buildPeaksBody(data, ['Site Name', 'Event', 'Peak Stage (ft)', 'County', 'Latitude (DD)', 'Longitude (DD)', 'Site Number', 'Waterbody']),
						},
						layout: 'lightHorizontalLines',
						style: 'smaller',
						margin: [0, 0, 0, 15]
					};
				};
			};
			//// End of Peak Table information build ////

			//// Get HWM Table information data to put into pdfMake /////
			var hwmData;
			hwmData = allHWMs;
			// Data has some undefined and null values, this replaces those values with empty string/no value
			for (var obj of hwmData) {
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
			function buildHwmsTable() {
				var body = [];
				if (allHWMs.length === 0) {
					body.push([
						{ text: 'There is no HWM data based on selections.' }
					])
				} else {
					for (var i in hwmData) {
						body.push([
							{ rowSpan: 11, style: 'tableHeader', text: 'Site No.: ' + hwmData[i]['Site Number'] },
							{ text: 'HWM Label', style: 'tableHeader' }, hwmData[i]['HWM Label'],
							{ text: 'Elevation (ft)', style: 'tableHeader' }, hwmData[i]['Elevation (ft)']
						],
							[
								{},
								{ text: 'Event', style: 'tableHeader' }, hwmData[i]['Event'],
								{ text: 'Site Name', style: 'tableHeader' }, hwmData[i]['Site Name']
							],
							[
								{},
								{ text: 'Vertical Datum, Method', style: 'tableHeader' }, hwmData[i]['Vertical Datum'] + ", " + hwmData[i]['Vertical Method'],
								{ text: 'Horizontal Datum, Method', style: 'tableHeader' }, hwmData[i]['Horizontal Datum'] + ", " + hwmData[i]['Horizontal Datum']
							],
							[
								{},
								{ text: 'Type', style: 'tableHeader' }, hwmData[i]['HWM Type'],
								{ text: 'Quality', style: 'tableHeader' }, hwmData[i]['HWM Quality']
							],
							[
								{},
								{ text: 'Waterbody', style: 'tableHeader' }, hwmData[i]['Waterbody'],
								{ text: 'Permanent Housing', style: 'tableHeader' }, hwmData[i]['Site Perm Housing']
							],
							[
								{},
								{ text: 'County', style: 'tableHeader' }, hwmData[i]['County'],
								{ text: 'State', style: 'tableHeader' }, hwmData[i]['State']
							],
							[
								{},
								{ text: 'Latitude, Longitude(DD)', style: 'tableHeader' }, hwmData[i]['Latitude (DD)'] + ", " + hwmData[i]['Longitude (DD)'],
								{ text: 'Site Description', style: 'tableHeader' }, hwmData[i]['Site Description']
							],
							[
								{},
								{ text: 'Location Description', style: 'tableHeader' }, hwmData[i]['Location Description'],
								{ text: 'Survey Date', style: 'tableHeader' }, hwmData[i]['Survey Date']
							],
							[
								{},
								{ text: 'Bank', style: 'tableHeader' }, hwmData[i]['Bank'],
								{ text: 'Environment', style: 'tableHeader' }, hwmData[i]['Environment']
							],
							[
								{},
								{ text: 'Flag Date', style: 'tableHeader' }, hwmData[i]['Flag Date'],
								{ text: 'Stillwater', style: 'tableHeader' }, hwmData[i]['Stillwater']
							],
							[
								{},
								{ text: 'Uncertainty', style: 'tableHeader' }, hwmData[i]['Uncertainty'],
								{ text: 'HWM Uncertainty', style: 'tableHeader' }, hwmData[i]['HWM Uncertainty']
							]);
					}
				}
				return body;
			};
			// Insert table body into pdfMake formatted table
			function hwmsTable() {
				if (allHWMs.length === 0) {
					return {
						table: {
							body: buildHwmsTable(),
						},
						layout: 'noBorders',
						style: 'smaller',
						margin: [0, 0, 0, 15],
					};
				} else {
					return {
						table: {
							widths: ['auto', 'auto', '*', 'auto', '*'],
							body: buildHwmsTable(),
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
			var buffer = $(".select2-selection__choice")[selectionVarLen - 2].title;
			}
			//If the map is refreshed, there won't be search info added to .select2, so there will be only 5 items
			if (selectionVarLen <=5 ) {
				var landType = $(".select2-selection__choice")[0].title;
				var regionSubType = $(".select2-selection__choice")[1].title;
				var event = $(".select2-selection__choice")[2].title;
				var buffer = $(".select2-selection__choice")[3].title;
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
							[{ text: 'Buffer Size: ', style: 'selectHeader', alignment: 'right' }, buffer]
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
				base_image.src = './images/peak.png';
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
				base_image.src = './images/hwm.png';
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
				return {
					table: {
						widths: ['auto', 'auto'],
						body: [
							[{ colSpan: 2, border: [false, false, false, true], text: 'Layer Explanation:', style: 'subHeader' }, ''],
							[{ image: peakImg }, { text: 'Peak Location', alignment: 'left' }],
							[{ image: hwmImg }, { text: 'High Water Mark', alignment: 'left' }],
							[{ image: parkImg }, { text: 'Park Boundary', alignment: 'left' }],
							[{ image: bufferImg }, { text: 'Buffer Extent', alignment: 'left' }],
							[{ image: regionImg }, { text: 'Region Boundary', alignment: 'left' }],
						]
					},
					layout: {
						defaultBorder: false,
					}
				};
			}
			//// End of Legend build ////

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
							text: 'Page ' + currentPage.toString()
						}
					},
					content: [
						//{ text: 'Regional Report - Printed: ' + todayDate, style: 'header', alignment: 'center', margin: [0, 0, 0, 15] },
						{
							table: {
								widths: ['*'],
								body: [
									[{ border: [false, false, false, true], text: 'Regional Report - Printed: ' + todayDate, style: 'header', alignment: 'center' }]
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
										{ image: pdfRegionalMapUrl, width: 300, height: 200 },
										legendTable()
									],
								]
							},
							layout: 'noBorders',
							margin: [0, 0, 0, 15]
						},
						//{ image: pdfRegionalMapUrl, width: 300, height: 200, margin: [0,0,0,15] },
						{ text: 'Summary Information', style: 'subHeader', margin: [0, 0, 0, 5] },
						summaryTable(summaryInfo()),
						{ text: 'Peak Data', style: 'subHeader', margin: [0, 0, 0, 5] },
						//peaksTable(peaksData(), ['Site Name', 'Event', 'Peak Stage', 'County', 'Latitude (dd)', 'Logitude (dd)', 'Site Number','Waterbody']),
						peaksTable(getPeaksData()),
						{ text: 'HWM Data', style: 'subHeader', margin: [0, 0, 0, 5] },
						hwmsTable()
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
				pdfMake.createPdf(docDefinition).download('regional_report.pdf');
			}

			setTimeout(() => {
				printRegionalReport();
			}, 3500)

		});
	});

	var pdfMapUrl;
	var legendUrl;

	$('#printNav').click(function () {
		//Add filter information to top of report
		if (currentParkOrRefuge != "") {
			$('#reportInfo').append("<div style='margin-left:15px; text-align: center; font-size: large;'>" + selectedEvent + "<br> </div><div style='text-align: center'>" + currentParkOrRefuge + ", " + selectedBuffer + " buffer" + "<br>" + "<div>");
		}
		if (currentParkOrRefuge == "") {
			$('#reportInfo').append("<div style='margin-left:15px; text-align: center; font-size: large;'>" + selectedEvent + "<div>");
		}
		//clear out any previous stream gage info from report
		$('#rtgraphs').children().remove();
		identifiedUSGSrtGage = [];

		showPrintModal();
		$("#reportFooter").hide();

		//Stream gages need to be checked on for the hydrographs to appear
		var streamgageCheckBox = document.getElementById("streamGageToggle");
		if (streamgageCheckBox.checked == true) {
			USGSrtGages.clearLayers(map);
			clickStreamGage();
		}
		if (streamgageCheckBox.checked == false) {
			USGSrtGages.clearLayers(map);
			streamgageCheckBox.checked = true;
			clickStreamGage();
		}

		//Timeout required to make sure the gages are finished loading before querying the ones in the buffer
		setTimeout(() => {
			// cycling through each peak and seeing if it's inside the buffer
			for (var i in USGSrtGages._layers) {

				// formatting point for turf
				var cords = ([USGSrtGages._layers[i]._latlng.lng, USGSrtGages._layers[i]._latlng.lat]);

				var isItInside = turf.booleanPointInPolygon(cords, buffer);

				// if true add it to an array containing all the 'true' peaks
				if (isItInside) {
					identifiedUSGSrtGage.push(USGSrtGages._layers[i])
				}
			}

			//function that displays hydrographs
			displayRtGageReport(identifiedUSGSrtGage);

		}, 1000);

		console.log("STORMTIDE", stormtide);

		var mapPreview = document.getElementById('reviewMap');
		var legendPreview = document.getElementById('legendImage');
		/* mapPreview.innerHTML='Loading Map...'
		mapPreview.innerHTML='Loading Map...'
		 */
		// if (peakTableData > 0) {
		// 	//If peak table data does not clear from buffer, this will clear it now
		// 	peakTableData.length = 0;
		// }

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
				"Peak Stage (ft)": identifiedPeaks[i].feature.properties.peak_stage,
				"Peak Estimated": peakEstimated
			});
		}
		peaksCSVData = peakTableData;

		// Builds the HTML Table for peaks
		function buildHtmlTable() {
			//Empty text from previous report, if it was run
			$("#peakTable").find("p").remove();
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
		} else {
			$("#peakTable").find("p").remove();
			$("#peakDataTable").empty();
			setTimeout(() => {
				$("#peakTable").prepend("<p>" + "<b>" + "Peak Summary Site Information" + "</b>" + "</p>");
				$("#peakTable").append("<p>" + "There are no Peaks at this Site." + "</p>");
			}, 3000);
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

		//builds HTML Table for HWMs
		function buildHwmHtmlTable() {
			//Empty text from previous report, if was run
			$("#hwmTable").find("p").remove();
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
		} else {
			$("#hwmTable").find("p").remove();
			$("#hwmDataTable").empty();
			setTimeout(() => {
				$("#hwmTable").prepend("<p>" + "<b>" + "High Water Mark Site Information" + "</b>" + "</p>");
				$("#hwmTable").append("<p>" + "There are no High Water Marks at this Site." + "</p>");
			}, 3000);
		}


		var hwmCSV = hwmDataTable.table2csv;
		console.log("hwmDataTable", hwmDataTable);
		console.log("hwmCSV", hwmCSV);

		setTimeout(() => {
			// Get legend for print preview
			html2canvas(document.getElementById('legendDiv'))
				.then(function (canvas) {
					$("#legendImage").find("canvas").remove()
					legendPreview.append(canvas);
					legendUrl = canvas.toDataURL('image/png');
				}
				);
		}, 2900);

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
				}
				);
		}, 3000);

		setTimeout(() => {
			document.getElementById('loader').remove();
			document.getElementById('loadingMessage').remove();
		}, 3001);

		setTimeout(() => {
			$("#reportFooter").show();
		}, 4500);

		// If there is no data, then printing will be disabled. 
		if ((hwmTableData.length === 0) && (peakTableData.length === 0)) {
			document.getElementById("print").disabled = true;
			//$('#print').attr('disabled', true);
		} else {
			document.getElementById("print").disabled = false;
		}
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
	selectedBuffer = "20km";
	document.getElementById('thirtyKm').checked = false;
	document.getElementById('fiftyKm').checked = false;
	// 10 kilometers
	$('#tenKm').click(function () {
		document.getElementById('twentyKm').checked = false;
		document.getElementById('thirtyKm').checked = false;
		document.getElementById('fiftyKm').checked = false;
		fev.vars.currentBufferSelection = 10;
		selectedBuffer = "10km";
	});
	// 20 kilometers
	$('#twentyKm').click(function () {
		document.getElementById('tenKm').checked = false;
		document.getElementById('thirtyKm').checked = false;
		document.getElementById('fiftyKm').checked = false;
		fev.vars.currentBufferSelection = 20;
		selectedBuffer = "20km";
	});
	// 30 kilometers
	$('#thirtyKm').click(function () {
		document.getElementById('twentyKm').checked = false;
		document.getElementById('tenKm').checked = false;
		document.getElementById('fiftyKm').checked = false;
		fev.vars.currentBufferSelection = 30;
		selectedBuffer = "30km";
	});
	// 50 kilometers
	$('#fiftyKm').click(function () {
		document.getElementById('tenKm').checked = false;
		document.getElementById('twentyKm').checked = false;
		document.getElementById('tenKm').checked = false;
		fev.vars.currentBufferSelection = 50;
		selectedBuffer = "50km";
	});

	// setting checked values for Filter Modal buffer radio buttons
	document.getElementById('tenKmFilter').checked = false;
	document.getElementById('twentyKmFilter').checked = true;
	selectedBuffer = "20km";
	document.getElementById('thirtyKmFilter').checked = false;
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
	function searchComplete(runningFilter) {
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

			//this element is populated with either 'parks' or refuges'
			var siteType = $('#typeSelect_welcomeModal').val()[0];

			// getting and setting park name from search
			var name = $('#siteSelect_welcomeModal').val()[0];

			// setting the current Park or Refuge selected for the report
			currentParkOrRefuge = $('#siteSelect_welcomeModal').val()[0];
		}

		//If using the filter modal, collect input from the filter modal
		if (runningFilter == true) {
			$('.eventSelectAlert').hide();
			map.fitBounds(usBounds);
			var siteType = $('#typeSelect_filterModal').val()[0];

			// getting and setting park name from search
			var name = $('#siteSelect_filterModal').val()[0];

			// setting the current Park or Refuge selected for the report
			currentParkOrRefuge = $('#siteSelect_filterModal').val()[0];
		}
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
		var where = "1=1";
		var polys = [];

		if (siteType === "parks") {
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
					if (flattenedPoly !== undefined) {
						polyDefined = true;
					}
					if (polyDefined === true) {
						getSiteBuffers();
					}
				},
				style: parkStyle
			}).addTo(map);

		} else if (siteType === "refuges") {
			where = "ORGNAME=" + name;
			refuges = L.esri.featureLayer({
				useCors: false,
				url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved_Authoritative/FeatureServer/1',
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
					if (polyDefined === true) {
						getSiteBuffers();
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
		}

		// account for a search that is not a park or refuge
		function getSiteBuffers() {


			setTimeout(() => {
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


				if (runningFilter == true) {
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
				}
				map.fitBounds(bufferPoly.getBounds());
			}, 1000);
			//$(inputModal).modal('hide');
		}
	};

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
				"Peak Stage": identifiedPeaks[i].feature.properties.peak_stage,
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
					widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
					body: buildTableBody(data, ['Site Number', 'Description', 'State', 'County', 'Peak Stage', 'Peak Estimated']),
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
			return {
				table: {
					widths: ['auto', 'auto'],
					body: [
						[{ colSpan: 2, border: [false, false, false, true], text: 'Report Selections: ', style: 'subHeader' }, ''],
						[{ text: 'Event: ', alignment: 'right' }, selectedEvent],
						[{ text: 'Site: ', alignment: 'right' }, currentParkOrRefuge],
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
					text: 'Page ' + currentPage.toString()
				}
			},
			content: [
				{
					table: {
						widths: ['*'],
						body: [
							[{
								border: [false, false, false, true],
								text: 'Report - Printed: ' + todayDate,
								style: 'header', alignment: 'center'
							}]
						]
					},
					margin: [0, 0, 0, 15]
				},
				{
					table: {
						body: [[
							reportSelectionsTable(),
							[{ image: pdfMapUrl, width: 300, height: 200 }],
							[{ image: legendUrl, width: 125, height: 175 }],
						],
						]
					},
					layout: 'noBorders',
					margin: [0, 0, 0, 15]
				},
				{ text: 'Peak Summary Data', style: 'subHeader', margin: [0, 0, 0, 5] },
				peakTable(bodyData()),
				{ text: 'High Water Mark Data', style: 'subHeader', margin: [0, 0, 0, 5] },
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
//PeakSummarySymbologyInterior is found in displayPeaksGeoJSON()
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
		//When checkbox is checked, add layer to map
		displayPeaksGeoJSON("peak", "Peak Summary", fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peakMarkerIcon);
		var peakvalues = getPeakValues("peak", "Peak Summary", fev.urls.peaksFilteredGeoJSONViewURL + fev.queryStrings.peaksQueryString, peakMarkerIcon);

	}
	//Remove symbol and layer name from legend when box is unchecked
	if (peaksCheckBox.checked == false) {
		$('#PeakSummarySymbology').children().remove();
		peak.clearLayers();
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

function enlargeImage() {
	$('.imagepreview').attr('src', $('.hydroImage').attr('src'));
	$('#imagemodal').modal('show');
}



/**
 * Created by bdraper on 8/2/2016.
 */

$(document).ready(function () {

    $('#btnClearFilters').click(function () {
        //clear all text inputs
        $('.clearable').val('').trigger('change');
        //hide all checkmark icons
        $('.check').find('span').hide();
        //make all inactive
        $('.check').removeClass("active");
        //set checked property to false for all
        $('.btn-group input[type="checkbox"]').prop('checked', false);
    });

    // Register Event type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.eventTypes array
    $('#evtTypeSelect').select2({
        placeholder: 'All Types'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/eventtypes.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            data.sort(function (a, b) {
                var typeA = a.TYPE;
                var typeB = b.TYPE;
                if (typeA < typeB) {
                    return -1;
                }
                if (typeA > typeB) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            for (var i = 0; i < data.length; i++) {
                $('#evtTypeSelect').append('<option value="' + data[i].event_type_id + '">' + data[i].type + '</option>');
                //data[i].id = data[i].event_type_id;
                fev.data.eventTypes.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // Register Event select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.events array
    $('.evtSelect').select2({
        placeholder: 'Select event',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $('.evtSelectRegional').select2({
        placeholder: 'Select event',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $('.evtSelect_filter').select2({
        placeholder: 'Select event',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/events.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            data.sort(function (a, b) {
                // var eventA = a.event_name;
                // var eventB = b.event_name;
                var eventA = a.event_start_date;
                var eventB = b.event_start_date;
                if (eventA > eventB) {
                    return -1;
                }
                if (eventA < eventB) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            for (var i = 0; i < data.length; i++) {
                $('.evtSelect').append('<option value="' + data[i].event_id + '">' + data[i].event_name + '</option>');
                $('.evtSelectRegional').append('<option value="' + data[i].event_id + '">' + data[i].event_name + '</option>');
                $('.evtSelect_filter').append('<option value="' + data[i].event_id + '">' + data[i].event_name + '</option>');
                data[i].id = data[i].event_id;
                fev.data.events.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // START REGIONAL SUMMARY
    // region type selector
   /*$('.regionType').select2({
        placeholder: 'Select type',
        allowClear: false,
        maximumSelectionLength: 1
    }); */
    //$('.regionType').append('<option value="doi">' + 'DOI Regions' + '</option>');
    /* $('.regionType').append('<option value="fws">' + 'FWS Legacy Regions' + '</option>');
    $('.regionType').append('<option value="nps">' + 'NPS Networks' + '</option>'); */

    // Lands type selector
    $('.typeSelect').select2({
        placeholder: 'Select type',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $('.typeSelect').append('<option value="parks">' + 'Parks' + '</option>');
    $('.typeSelect').append('<option value="refuges">' + 'Refuges' + '</option>');

    $('#typeSelect_regionalModal').change(function () {

    });

    // Lands type selector
    $('.typeSelectFilter').select2({
        placeholder: 'Select a type',
        allowClear: false,
        maximumSelectionLength: 1
    });

    $('.typeSelectwelcome').select2({
        placeholder: 'Select a type',
        allowClear: false,
        maximumSelectionLength: 1
    });

    $('.typeSelectFilter').append('<option value="parks">' + 'Parks' + '</option>');
    $('.typeSelectFilter').append('<option value="refuges">' + 'Refuges' + '</option>');

    $('.typeSelectwelcome').append('<option value="parks">' + 'Parks' + '</option>');
    $('.typeSelectwelcome').append('<option value="refuges">' + 'Refuges' + '</option>');

    $('.siteSelectWelcome').select2({
        placeholder: 'Select a site',
        allowClear: false,
        maximumSelectionLength: 1
    });

    $('.siteSelect').select2({
        placeholder: 'Select a site',
        allowClear: false,
        maximumSelectionLength: 1
    });

    // region based on region type
    $('#typeSelect_filterModal').change(function () {

        // clearing out the results incase region type 
        $('.siteSelect').empty();

        // if it has a value, we query to get the region geometry
        if (($('#typeSelect_filterModal').val()) === null) {

        } else {
            if ($('#typeSelect_filterModal').val()[0] === "parks") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=UNIT_NAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: { 'Accept': '*/*' },
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.siteSelect').append('<option value="' + data.features[i].attributes.UNIT_NAME + '">' + data.features[i].attributes.UNIT_NAME + '</option>');
                            /* data[i].id = data[i].event_id;
                            fev.data.events.push(data[i]); */
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });


            } else if ($('#typeSelect_filterModal').val()[0] === "refuges") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved_Authoritative/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=ORGNAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: { 'Accept': '*/*' },
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.siteSelect').append('<option value="' + data.features[i].attributes.ORGNAME + '">' + data.features[i].attributes.ORGNAME + '</option>');
                            /* data[i].id = data[i].event_id;
                            fev.data.events.push(data[i]); */
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });
            }
        }
    });
    // region based on region type
    $('#typeSelect_welcomeModal').change(function () {

        // clearing out the results incase region type 
        $('.siteSelectWelcome').empty();

        // if it has a value, we query to get the region geometry
        if (($('#typeSelect_welcomeModal').val()) === null) {

        } else {
            if ($('#typeSelect_welcomeModal').val()[0] === "parks") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=UNIT_NAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: { 'Accept': '*/*' },
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.siteSelect').append('<option value="' + data.features[i].attributes.UNIT_NAME + '">' + data.features[i].attributes.UNIT_NAME + '</option>');
                            /* data[i].id = data[i].event_id;
                            fev.data.events.push(data[i]); */
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });


            } else if ($('#typeSelect_welcomeModal').val()[0] === "refuges") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved_Authoritative/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=ORGNAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: { 'Accept': '*/*' },
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.siteSelect').append('<option value="' + data.features[i].attributes.ORGNAME + '">' + data.features[i].attributes.ORGNAME + '</option>');
                            /* data[i].id = data[i].event_id;
                            fev.data.events.push(data[i]); */
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });
            }
        }
    });

    $('.regionSelect').select2({
        placeholder: 'Select a region type',
        allowClear: false,
        maximumSelectionLength: 1
    });

    // region based on region type
    $('#typeSelect_regionalModal').change(function () {

        // clearing out the results incase region type 
        $('.regionSelect').empty();

        // if it has a value, we query to get the region geometry
            /* if ($('#regionType_regionalModal').val()[0] === "doi") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/DOI_Unified_Regions/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.regionSelect').append('<option value="' + data.features[i].attributes.REG_NUM + '">' + data.features[i].attributes.REG_NAME + '</option>');
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });              
            } */ if ($('#typeSelect_regionalModal').val()[0] === "refuges") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_Legacy_Regional_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=REGNAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=true&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: { 'Accept': '*/*' },
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.regionSelect').append('<option value="' + data.features[i].attributes.REGNAME + '">' + data.features[i].attributes.REGNAME + '</option>');
                            /* data[i].id = data[i].event_id;
                            fev.data.events.push(data[i]); */
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });
            } else if ($('#typeSelect_regionalModal').val()[0] === "parks") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/nps_regions_rev/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=reg_name&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: { 'Accept': '*/*' },
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.regionSelect').append('<option value="' + data.features[i].attributes.reg_name + '">' + data.features[i].attributes.reg_name + '</option>');
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });
        }
    });

    // buffer size selector
    $('.bufferSelect').select2({
        placeholder: 'Select size',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $('.bufferSelect').append('<option value="10">' + '10 km' + '</option>');
    $('.bufferSelect').append('<option value="20">' + '20 km' + '</option>');
    $('.bufferSelect').append('<option value="30">' + '30 km' + '</option>');
    $('.bufferSelect').append('<option value="50">' + '50 km' + '</option>');

    // END REGIONAL SUMMARY

    // Register states select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.states array
    $('#stateSelect').select2({
        placeholder: 'All States'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/Sites/States.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            data.sort(function (a, b) {
                var stateA = a.state_name;
                var stateB = b.state_name;
                if (stateA < stateB) {
                    return -1;
                }
                if (stateA > stateB) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            for (var i = 0; i < data.length; i++) {
                $('#stateSelect').append('<option value="' + data[i].state_abbrev + '">' + data[i].state_name + '</option>');
                data[i].id = data[i];
                fev.data.states.push(data[i]);
            }
            populateCountiesArray();
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    //county select is a special case - populated values depend on states selected. see other logic TBD
    $('#countySelect').select2({
        placeholder: 'All Counties'
    });

    $('#countySelect').on('select2:select select2:unselect', function (selection) {
        //will need special treatment for display string creation
    });


    // Register sensor type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.sensorTypes array
    $('#sensorTypeSelect').select2({
        placeholder: 'All Types'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/sensortypes.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            data.sort(function (a, b) {
                var typeA = a.TYPE;
                var typeB = b.TYPE;
                if (typeA < typeB) {
                    return -1;
                }
                if (typeA > typeB) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            for (var i = 0; i < data.length; i++) {
                $('#sensorTypeSelect').append('<option value="' + data[i].sensor_type_id + '">' + data[i].sensor + '</option>');
                fev.data.sensorTypes.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // Register sensor status select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.sensorStatusTypes array
    $('#sensorStatusSelect').select2({
        placeholder: 'All Statuses'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/statustypes.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $('#sensorStatusSelect').append('<option value="' + data[i].status_type_id + '">' + data[i].status + '</option>');
                fev.data.sensorStatusTypes.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // Register collection condition select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.collectionConditions array
    $('#collectionConditionSelect').select2({
        placeholder: 'All Conditions'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/InstrCollectConditions.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $('#collectionConditionSelect').append('<option value="' + data[i].id + '">' + data[i].condition + '</option>');
                fev.data.collectionConditions.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // Register deploy type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.deploymentTypes array
    $('#deployTypeSelect').select2({
        placeholder: 'All Deploy Types'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/deploymenttypes.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $('#deployTypeSelect').append('<option value="' + data[i].deployment_type_id + '">' + data[i].method + '</option>');
                fev.data.deploymentTypes.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // Register HWM type type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.hwmTypes array
    $('#hwmTypeSelect').select2({
        placeholder: 'All Types'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/hwmtypes.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $('#hwmTypeSelect').append('<option value="' + data[i].hwm_type_id + '">' + data[i].hwm_type + '</option>');
                data[i].id = data[i].hwm_type_id;
                fev.data.hwmTypes.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    // Register HWM quality select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.hwmQualities array
    $('#hwmQualitySelect').select2({
        placeholder: 'All Qualities'
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://stn.wim.usgs.gov/STNServices/hwmqualities.json',
        headers: { 'Accept': '*/*' },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $('#hwmQualitySelect').append('<option value="' + data[i].hwm_quality_id + '">' + data[i].hwm_quality + '</option>');
                data[i].id = data[i].hwm_quality_id;
                fev.data.hwmQualities.push(data[i]);
            }
        },
        error: function (error) {
            console.log('Error processing the JSON. The error is:' + error);
        }
    });

    var populateCountiesArray = function () {
        for (var i = 0; i < fev.data.states.length; i++) {
            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: 'https://stn.wim.usgs.gov/STNServices/Sites/CountiesByState.json?StateAbbrev=' + fev.data.states[i].state_abbrev,
                headers: { 'Accept': '*/*' },
                currentState: fev.data.states[i].state_abbrev,
                success: function (data) {
                    fev.data.counties[(this.currentState)] = data;
                    //console.log("Loaded counties for: ",this.currentState)
                },
                error: function (error) {
                    console.log('Error retrieving counties. The error is: ' + error);
                }
            });
        }
    };

    //disabling the logic below pending removal of the event type selector
    //begin onChange functions for Event form (these tie the event type and event forms together)
    // $('#evtTypeSelect').on('select2:select select2:unselect', function (selection) {
    //     var currentSelection = $(this).val();
    //     if (currentSelection !== null) {
    //
    //         if (currentSelection.length > 0) {
    //             var selectedEvtTypeIds = [];
    //             for (var i = 0; i < currentSelection.length; i++) {
    //                 selectedEvtTypeIds.push(Number(currentSelection[i]));
    //             }
    //             var currentEvents = fev.data.events.filter(function (element) {
    //                 return selectedEvtTypeIds.indexOf(element.event_type_id) > -1;
    //             });
    //             $('.evtSelect').html('');
    //             //$('.evtSelect').select2('val', '');
    //             for (var x = 0; x < currentEvents.length; x++) {
    //                 $('.evtSelect').append('<option value="' + currentEvents[x].event_id + '">' + currentEvents[x].event_name + '</option>');
    //                 //build string here with event type names??
    //             }
    //         } else {
    //             $('.evtSelect').html('');
    //             for (var i = 0; i < fev.data.events.length; i++) {
    //                 $('.evtSelect').append('<option value="' + fev.data.events[i].event_id + '">' + fev.data.events[i].event_name + '</option>');
    //             }
    //         }
    //     }
    // });

    //disabling the logic to sort event types by event selection pending removal of the event type selector
    // $('.evtSelect').on('change', function (selection){
    //     //check to see if there is any value selected
    //     var currentSelection = $(this).val();
    //     if (currentSelection !== null) {
    //         if (!(currentSelection.length > 0)) {
    //             var opts = document.getElementById('evtTypeSelect').options;
    //             for (var i=0; i < opts.length; i++) {
    //                 opts[i].disabled = false;
    //             }
    //             return;
    //         }
    //
    //         // Functions
    //         // Returns a new array with only unique elements from the one given.
    //         var onlyUnique = function(array) {
    //             var distinctValues = [];
    //             // Build a new array with only distinct elements.
    //             for (var i = 0; i < array.length; i++)
    //             {
    //                 // Check if the value is already in the new array; if so, skip it.
    //                 if (distinctValues.indexOf(array[i]) !== -1) {
    //                     continue;
    //                 }
    //                 // Add the element to the distinct-values array.
    //                 distinctValues.push(array[i]);
    //             }
    //             // Return the array of distinct values.
    //             return distinctValues;
    //         };
    //         // Execution
    //         //set up an array with the strings from the currentSelection object strings converted to numbers
    //         var selectedEventIDNumbers = [];
    //         for (var i=0; i<currentSelection.length; i++){
    //             selectedEventIDNumbers.push(parseInt(currentSelection[i]));
    //         }
    //         // Build a list of the event-type IDs chosen.
    //         var selectedEventTypeIDs = [];
    //         for (var i = 0; i < fev.data.events.length; i++)
    //         {
    //             // If this is not one of the chosen events, skip it.
    //             if (selectedEventIDNumbers.indexOf(fev.data.events[i].event_id) === -1)
    //             {
    //                 continue;
    //             }
    //             // Add the event-type ID to the list.
    //             selectedEventTypeIDs.push(fev.data.events[i].event_type_id);
    //         }
    //         // Reduce the array of selected event-type IDs to only unique elements.
    //         var distinctSelectedEventTypeIDs = onlyUnique(selectedEventTypeIDs);
    //         //Iterate through the DOM elements and disable those not having event IDs that are selected.
    //         var options = document.getElementById('evtTypeSelect').options;
    //         for (var i=0; i < options.length; i++) {
    //             // Disable the element first.
    //             options[i].disabled = true;
    //             // If the element is within the list of those selected, enable it.
    //             if (distinctSelectedEventTypeIDs.indexOf(parseInt(options[i].value)) !== -1) {
    //                 options[i].disabled = false;
    //             }
    //         }
    //         return;
    //     }
    // });
    //end onChange functions for Event form

    //begin onChange function for state form (updates county options based on state selection)
    $('#stateSelect').on('select2:select select2:unselect', function (evt) {
        var currentSelection = $(this).val();
        if ((!currentSelection > 0) || currentSelection === null) {
            $('#countySelect').html('');
            $('#countySelect').append('<option value=null>Please select state(s) first </option>');
            return;
        }
        var currentCounties = [];
        for (var key in fev.data.counties) {
            for (var i = 0; i < fev.data.counties[key].length; i++) {

                var value = fev.data.counties[key][i].county_name;
                if (currentSelection.indexOf(key) > -1) {
                    currentCounties = currentCounties.concat(value);
                }

            }
            //segment below is for when return from counties endpoint is an array of strings, rather than an array of objects.
            //var value = fev.data.counties[key];
            //if (statesSelected.val.indexOf(key) > -1) {
            //    currentCounties = currentCounties.concat(value);
            //}
        }
        $('#countySelect').html('');
        for (var key in currentCounties) {
            var countyOption = currentCounties[key];
            $('#countySelect').append('<option value="' + countyOption + '">' + countyOption + '</option>');
        };
    });
    //end onChange function for state form
});
/**
 * Created by bdraper on 8/4/2016.
 */
// //displays map scale on map load
// map.on( "load", function() {
//     var mapScale =  scaleLookup(map.getZoom());
//     console.log('Initial Map scale registered as ' + mapScale, map.getZoom());
//
//     var initMapCenter = map.getCenter();
//     $('#latitude').html(initMapCenter.y.toFixed(4));
//     $('#longitude').html(initMapCenter.x.toFixed(4));
// });
//
// //displays map scale on scale change (i.e. zoom level)
// map.on( "zoom-end", function () {
//     var mapZoom = map.getZoom();
//     var mapScale = this.scaleLookup(mapZoom);
//     $('#scale')[0].innerHTML = mapScale;
// });
//
// //updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes "map center" label
// map.on( "mouse-move", function (cursorPosition) {
//     $('#mapCenterLabel').css("display", "none");
//     if (cursorPosition.mapPoint !== null) {
//         var geographicMapPt = webMercatorUtils.webMercatorToGeographic(cursorPosition.mapPoint);
//         $('#latitude').html(geographicMapPt.y.toFixed(4));
//         $('#longitude').html(geographicMapPt.x.toFixed(4));
//     }
// });
// //updates lat/lng indicator to map center after pan and shows "map center" label.
// on(map, "pan-end", function () {
//     //displays latitude and longitude of map center
//     $('#mapCenterLabel').css("display", "inline");
//     var geographicMapCenter = webMercatorUtils.webMercatorToGeographic(map.extent.getCenter());
//     $('#latitude').html(geographicMapCenter.y.toFixed(4));
//     $('#longitude').html(geographicMapCenter.x.toFixed(4));
// });
//
//
// function scaleLookup(mapZoom) {
//     switch (mapZoom) {
//         case 19: return '1,128';
//         case 18: return '2,256';
//         case 17: return '4,513';
//         case 16: return '9,027';
//         case 15: return '18,055';
//         case 14: return '36,111';
//         case 13: return '72,223';
//         case 12: return '144,447';
//         case 11: return '288,895';
//         case 10: return '577,790';
//         case 9: return '1,155,581';
//         case 8: return '2,311,162';
//         case 7: return '4,622,324';
//         case 6: return '9,244,649';
//         case 5: return '18,489,298';
//         case 4: return '36,978,596';
//         case 3: return '73,957,193';
//         case 2: return '147,914,387';
//         case 1: return '295,828,775';
//         case 0: return '591,657,550';
//     }
// }

// setting global variables for the regional summary
var regionalMap;
var alreadyRan = false;
var layerCountReg = 0;
var selectedRegion = "";
var selectedEvents = [];
var selectedLandType;
var regionPoly = [];
var regionBoundaries;
var flattenedRegionalPoly;
var simplifiedRegionalPoly;
var simpPoly = [];
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
        }, 3000);






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
        }

        // looping through each event and sensor data
        function getEventSpecificData() {
            if (alreadyRan !== true) {
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
                            /*
                            queryStreamGages(regionBBox);
                            regionalStreamGages.addTo(regionalMap);
                            displayRegionalRtGageReport(regionalStreamGages);
                            */
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
                                    handleData(data)
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
                            processData();
                        }, 2000);


                    }
                }
            }
        }



        // creating markers for peaks
        function getPeaks(url, markerIcon, eventName) {
            //Create variables for scaling peak label sizes
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
                                        parksWithPeaks.push({
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
                                allPeaks.push(parksWithPeaks[count].data);
                                count++;
                            }
                        }
                    }
                    allPeaks = allPeaks.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
                    // transfer data to the peaks csv data table
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
                                        parksWithHWMs.push({
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
                                allHWMs.push(parksWithHWMs[count].data);

                                count++;
                            }
                        }
                    }
                    allHWMs = allHWMs.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
                    // transfer data to the peaks csv data table
                    hwmRegionalCSVData = allHWMs;


                    //regionaltableData.removeLayer(regionalPeak);
                    hwmsWithinBuffer.addTo(regionalMap);
                }
            });
        }

        // Filtering out duplicates that fall within 2 different buffers


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
        function processData() {
            $('#saveRegionalPeakCSV').removeAttr('disabled');
            $('#saveRegionalHWMCSV').removeAttr('disabled');
            $('#printRegionalReport').removeAttr('disabled');
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
                            "Site Name": parksWithPeaks[peak].data.site_name,
                            "Peak Stage (ft)": parksWithPeaks[peak].data.peak_stage,
                            "County": parksWithPeaks[peak].data.county,
                            "Height Above Ground (ft)": parksWithPeaks[peak].data.height_above_gnd,
                            "Latitude (DD)": parksWithPeaks[peak].data.latitude_dd,
                            "Longitude (DD)": parksWithPeaks[peak].data.longitude_dd,
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
                            "Site Name": parksWithHWMs[hwm].data.site_name,
                            "Elevation (ft)": parksWithHWMs[hwm].data.elev_ft,
                            "County": parksWithHWMs[hwm].data.county,
                            "Latitude (DD)": parksWithHWMs[hwm].data.latitude_dd,
                            "Longitude (DD)": parksWithHWMs[hwm].data.longitude_dd,
                            "Site Number": parksWithHWMs[hwm].data.site_no,
                            "Waterbody": parksWithHWMs[hwm].data.waterbody
                        };
                        formattedHWMS[site].data.push(hwmdata);
                    }
                    if (parksWithHWMs[hwm].site_name !== distincthwmsByPark[site].site_name) {

                    }
                }
            }

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
            }

            //Create hwm row in regional summary table
            getSummaryStats(hwmArrReg);
            if (formattedHWMS.length > 0) {
                hwmSum = { "Type": "HWM", "Total Sites": numReg, "Max (ft)": maxReg, "Min (ft)": minReg, "Median (ft)": medianReg, "Mean (ft)": meanReg, "Standard Dev (ft)": standReg, "90% Conf Low": confIntNinetyLow, "90% Conf High": confIntNinetyHigh };
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

            if (sum.length > 0) {
                buildDataTables("#summaryDataTable", sum, "Summary Information");
            }
            if (allPeaks.length > 0) {
                buildDataTables("#peakDataTableReg", allPeaks, "Peak Data");
            }
            if (allHWMs.length > 0) {
                buildDataTables("#hwmDataTableReg", allHWMs, "High Water Mark Data");
            }
            /*
            if (regionalStreamGages.length >0) {
                $('#hydrographTableReg').append(<div>Real-time Stream Gages</div>);
            }
            */
            showTable();
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
        allHWMs = [];
        allPeaks = [];

        alreadyRan = false;

        // clearing tables
        document.getElementById('summaryDataTable').innerHTML = '';
        document.getElementById('peakDataTableReg').innerHTML = '';
        document.getElementById('hwmDataTableReg').innerHTML = '';

        document.querySelector('.progress-bar-fill').style.width = "0%"
        var regionBasemap = L.esri.basemapLayer('Topographic').addTo(regionalMap);
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




/*!
 * html2canvas 1.0.0-rc.1 <https://html2canvas.hertzen.com>
 * Copyright (c) 2019 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["html2canvas"] = factory();
	else
		root["html2canvas"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-line-break/dist/LineBreak.js":
/*!*******************************************************!*\
  !*** ./node_modules/css-line-break/dist/LineBreak.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\nexports.LineBreaker = exports.inlineBreakOpportunities = exports.lineBreakAtIndex = exports.codePointsToCharacterClasses = exports.UnicodeTrie = exports.BREAK_ALLOWED = exports.BREAK_NOT_ALLOWED = exports.BREAK_MANDATORY = exports.classes = exports.LETTER_NUMBER_MODIFIER = undefined;\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"]) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); } }; }();\n\nvar _Trie = __webpack_require__(/*! ./Trie */ \"./node_modules/css-line-break/dist/Trie.js\");\n\nvar _linebreakTrie = __webpack_require__(/*! ./linebreak-trie */ \"./node_modules/css-line-break/dist/linebreak-trie.js\");\n\nvar _linebreakTrie2 = _interopRequireDefault(_linebreakTrie);\n\nvar _Util = __webpack_require__(/*! ./Util */ \"./node_modules/css-line-break/dist/Util.js\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar LETTER_NUMBER_MODIFIER = exports.LETTER_NUMBER_MODIFIER = 50;\n\n// Non-tailorable Line Breaking Classes\nvar BK = 1; //  Cause a line break (after)\nvar CR = 2; //  Cause a line break (after), except between CR and LF\nvar LF = 3; //  Cause a line break (after)\nvar CM = 4; //  Prohibit a line break between the character and the preceding character\nvar NL = 5; //  Cause a line break (after)\nvar SG = 6; //  Do not occur in well-formed text\nvar WJ = 7; //  Prohibit line breaks before and after\nvar ZW = 8; //  Provide a break opportunity\nvar GL = 9; //  Prohibit line breaks before and after\nvar SP = 10; // Enable indirect line breaks\nvar ZWJ = 11; // Prohibit line breaks within joiner sequences\n// Break Opportunities\nvar B2 = 12; //  Provide a line break opportunity before and after the character\nvar BA = 13; //  Generally provide a line break opportunity after the character\nvar BB = 14; //  Generally provide a line break opportunity before the character\nvar HY = 15; //  Provide a line break opportunity after the character, except in numeric context\nvar CB = 16; //   Provide a line break opportunity contingent on additional information\n// Characters Prohibiting Certain Breaks\nvar CL = 17; //  Prohibit line breaks before\nvar CP = 18; //  Prohibit line breaks before\nvar EX = 19; //  Prohibit line breaks before\nvar IN = 20; //  Allow only indirect line breaks between pairs\nvar NS = 21; //  Allow only indirect line breaks before\nvar OP = 22; //  Prohibit line breaks after\nvar QU = 23; //  Act like they are both opening and closing\n// Numeric Context\nvar IS = 24; //  Prevent breaks after any and before numeric\nvar NU = 25; //  Form numeric expressions for line breaking purposes\nvar PO = 26; //  Do not break following a numeric expression\nvar PR = 27; //  Do not break in front of a numeric expression\nvar SY = 28; //  Prevent a break before; and allow a break after\n// Other Characters\nvar AI = 29; //  Act like AL when the resolvedEAW is N; otherwise; act as ID\nvar AL = 30; //  Are alphabetic characters or symbols that are used with alphabetic characters\nvar CJ = 31; //  Treat as NS or ID for strict or normal breaking.\nvar EB = 32; //  Do not break from following Emoji Modifier\nvar EM = 33; //  Do not break from preceding Emoji Base\nvar H2 = 34; //  Form Korean syllable blocks\nvar H3 = 35; //  Form Korean syllable blocks\nvar HL = 36; //  Do not break around a following hyphen; otherwise act as Alphabetic\nvar ID = 37; //  Break before or after; except in some numeric context\nvar JL = 38; //  Form Korean syllable blocks\nvar JV = 39; //  Form Korean syllable blocks\nvar JT = 40; //  Form Korean syllable blocks\nvar RI = 41; //  Keep pairs together. For pairs; break before and after other classes\nvar SA = 42; //  Provide a line break opportunity contingent on additional, language-specific context analysis\nvar XX = 43; //  Have as yet unknown line breaking behavior or unassigned code positions\n\nvar classes = exports.classes = {\n    BK: BK,\n    CR: CR,\n    LF: LF,\n    CM: CM,\n    NL: NL,\n    SG: SG,\n    WJ: WJ,\n    ZW: ZW,\n    GL: GL,\n    SP: SP,\n    ZWJ: ZWJ,\n    B2: B2,\n    BA: BA,\n    BB: BB,\n    HY: HY,\n    CB: CB,\n    CL: CL,\n    CP: CP,\n    EX: EX,\n    IN: IN,\n    NS: NS,\n    OP: OP,\n    QU: QU,\n    IS: IS,\n    NU: NU,\n    PO: PO,\n    PR: PR,\n    SY: SY,\n    AI: AI,\n    AL: AL,\n    CJ: CJ,\n    EB: EB,\n    EM: EM,\n    H2: H2,\n    H3: H3,\n    HL: HL,\n    ID: ID,\n    JL: JL,\n    JV: JV,\n    JT: JT,\n    RI: RI,\n    SA: SA,\n    XX: XX\n};\n\nvar BREAK_MANDATORY = exports.BREAK_MANDATORY = '!';\nvar BREAK_NOT_ALLOWED = exports.BREAK_NOT_ALLOWED = '×';\nvar BREAK_ALLOWED = exports.BREAK_ALLOWED = '÷';\nvar UnicodeTrie = exports.UnicodeTrie = (0, _Trie.createTrieFromBase64)(_linebreakTrie2.default);\n\nvar ALPHABETICS = [AL, HL];\nvar HARD_LINE_BREAKS = [BK, CR, LF, NL];\nvar SPACE = [SP, ZW];\nvar PREFIX_POSTFIX = [PR, PO];\nvar LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE);\nvar KOREAN_SYLLABLE_BLOCK = [JL, JV, JT, H2, H3];\nvar HYPHEN = [HY, BA];\n\nvar codePointsToCharacterClasses = exports.codePointsToCharacterClasses = function codePointsToCharacterClasses(codePoints) {\n    var lineBreak = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'strict';\n\n    var types = [];\n    var indicies = [];\n    var categories = [];\n    codePoints.forEach(function (codePoint, index) {\n        var classType = UnicodeTrie.get(codePoint);\n        if (classType > LETTER_NUMBER_MODIFIER) {\n            categories.push(true);\n            classType -= LETTER_NUMBER_MODIFIER;\n        } else {\n            categories.push(false);\n        }\n\n        if (['normal', 'auto', 'loose'].indexOf(lineBreak) !== -1) {\n            // U+2010, – U+2013, 〜 U+301C, ゠ U+30A0\n            if ([0x2010, 0x2013, 0x301c, 0x30a0].indexOf(codePoint) !== -1) {\n                indicies.push(index);\n                return types.push(CB);\n            }\n        }\n\n        if (classType === CM || classType === ZWJ) {\n            // LB10 Treat any remaining combining mark or ZWJ as AL.\n            if (index === 0) {\n                indicies.push(index);\n                return types.push(AL);\n            }\n\n            // LB9 Do not break a combining character sequence; treat it as if it has the line breaking class of\n            // the base character in all of the following rules. Treat ZWJ as if it were CM.\n            var prev = types[index - 1];\n            if (LINE_BREAKS.indexOf(prev) === -1) {\n                indicies.push(indicies[index - 1]);\n                return types.push(prev);\n            }\n            indicies.push(index);\n            return types.push(AL);\n        }\n\n        indicies.push(index);\n\n        if (classType === CJ) {\n            return types.push(lineBreak === 'strict' ? NS : ID);\n        }\n\n        if (classType === SA) {\n            return types.push(AL);\n        }\n\n        if (classType === AI) {\n            return types.push(AL);\n        }\n\n        // For supplementary characters, a useful default is to treat characters in the range 10000..1FFFD as AL\n        // and characters in the ranges 20000..2FFFD and 30000..3FFFD as ID, until the implementation can be revised\n        // to take into account the actual line breaking properties for these characters.\n        if (classType === XX) {\n            if (codePoint >= 0x20000 && codePoint <= 0x2fffd || codePoint >= 0x30000 && codePoint <= 0x3fffd) {\n                return types.push(ID);\n            } else {\n                return types.push(AL);\n            }\n        }\n\n        types.push(classType);\n    });\n\n    return [indicies, types, categories];\n};\n\nvar isAdjacentWithSpaceIgnored = function isAdjacentWithSpaceIgnored(a, b, currentIndex, classTypes) {\n    var current = classTypes[currentIndex];\n    if (Array.isArray(a) ? a.indexOf(current) !== -1 : a === current) {\n        var i = currentIndex;\n        while (i <= classTypes.length) {\n            i++;\n            var next = classTypes[i];\n\n            if (next === b) {\n                return true;\n            }\n\n            if (next !== SP) {\n                break;\n            }\n        }\n    }\n\n    if (current === SP) {\n        var _i = currentIndex;\n\n        while (_i > 0) {\n            _i--;\n            var prev = classTypes[_i];\n\n            if (Array.isArray(a) ? a.indexOf(prev) !== -1 : a === prev) {\n                var n = currentIndex;\n                while (n <= classTypes.length) {\n                    n++;\n                    var _next = classTypes[n];\n\n                    if (_next === b) {\n                        return true;\n                    }\n\n                    if (_next !== SP) {\n                        break;\n                    }\n                }\n            }\n\n            if (prev !== SP) {\n                break;\n            }\n        }\n    }\n    return false;\n};\n\nvar previousNonSpaceClassType = function previousNonSpaceClassType(currentIndex, classTypes) {\n    var i = currentIndex;\n    while (i >= 0) {\n        var type = classTypes[i];\n        if (type === SP) {\n            i--;\n        } else {\n            return type;\n        }\n    }\n    return 0;\n};\n\nvar _lineBreakAtIndex = function _lineBreakAtIndex(codePoints, classTypes, indicies, index, forbiddenBreaks) {\n    if (indicies[index] === 0) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    var currentIndex = index - 1;\n    if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    var beforeIndex = currentIndex - 1;\n    var afterIndex = currentIndex + 1;\n    var current = classTypes[currentIndex];\n\n    // LB4 Always break after hard line breaks.\n    // LB5 Treat CR followed by LF, as well as CR, LF, and NL as hard line breaks.\n    var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;\n    var next = classTypes[afterIndex];\n\n    if (current === CR && next === LF) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    if (HARD_LINE_BREAKS.indexOf(current) !== -1) {\n        return BREAK_MANDATORY;\n    }\n\n    // LB6 Do not break before hard line breaks.\n    if (HARD_LINE_BREAKS.indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB7 Do not break before spaces or zero width space.\n    if (SPACE.indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB8 Break before any character following a zero-width space, even if one or more spaces intervene.\n    if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) {\n        return BREAK_ALLOWED;\n    }\n\n    // LB8a Do not break between a zero width joiner and an ideograph, emoji base or emoji modifier.\n    if (UnicodeTrie.get(codePoints[currentIndex]) === ZWJ && (next === ID || next === EB || next === EM)) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB11 Do not break before or after Word joiner and related characters.\n    if (current === WJ || next === WJ) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB12 Do not break after NBSP and related characters.\n    if (current === GL) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB12a Do not break before NBSP and related characters, except after spaces and hyphens.\n    if ([SP, BA, HY].indexOf(current) === -1 && next === GL) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB13 Do not break before ‘]’ or ‘!’ or ‘;’ or ‘/’, even after spaces.\n    if ([CL, CP, EX, IS, SY].indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB14 Do not break after ‘[’, even after spaces.\n    if (previousNonSpaceClassType(currentIndex, classTypes) === OP) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB15 Do not break within ‘”[’, even with intervening spaces.\n    if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB16 Do not break between closing punctuation and a nonstarter (lb=NS), even with intervening spaces.\n    if (isAdjacentWithSpaceIgnored([CL, CP], NS, currentIndex, classTypes)) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB17 Do not break within ‘——’, even with intervening spaces.\n    if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB18 Break after spaces.\n    if (current === SP) {\n        return BREAK_ALLOWED;\n    }\n\n    // LB19 Do not break before or after quotation marks, such as ‘ ” ’.\n    if (current === QU || next === QU) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB20 Break before and after unresolved CB.\n    if (next === CB || current === CB) {\n        return BREAK_ALLOWED;\n    }\n\n    // LB21 Do not break before hyphen-minus, other hyphens, fixed-width spaces, small kana, and other non-starters, or after acute accents.\n    if ([BA, HY, NS].indexOf(next) !== -1 || current === BB) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB21a Don't break after Hebrew + Hyphen.\n    if (before === HL && HYPHEN.indexOf(current) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB21b Don’t break between Solidus and Hebrew letters.\n    if (current === SY && next === HL) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB22 Do not break between two ellipses, or between letters, numbers or exclamations and ellipsis.\n    if (next === IN && ALPHABETICS.concat(IN, EX, NU, ID, EB, EM).indexOf(current) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB23 Do not break between digits and letters.\n    if (ALPHABETICS.indexOf(next) !== -1 && current === NU || ALPHABETICS.indexOf(current) !== -1 && next === NU) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB23a Do not break between numeric prefixes and ideographs, or between ideographs and numeric postfixes.\n    if (current === PR && [ID, EB, EM].indexOf(next) !== -1 || [ID, EB, EM].indexOf(current) !== -1 && next === PO) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB24 Do not break between numeric prefix/postfix and letters, or between letters and prefix/postfix.\n    if (ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1 || PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB25 Do not break between the following pairs of classes relevant to numbers:\n    if (\n    // (PR | PO) × ( OP | HY )? NU\n    [PR, PO].indexOf(current) !== -1 && (next === NU || [OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU) ||\n    // ( OP | HY ) × NU\n    [OP, HY].indexOf(current) !== -1 && next === NU ||\n    // NU ×\t(NU | SY | IS)\n    current === NU && [NU, SY, IS].indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // NU (NU | SY | IS)* × (NU | SY | IS | CL | CP)\n    if ([NU, SY, IS, CL, CP].indexOf(next) !== -1) {\n        var prevIndex = currentIndex;\n        while (prevIndex >= 0) {\n            var type = classTypes[prevIndex];\n            if (type === NU) {\n                return BREAK_NOT_ALLOWED;\n            } else if ([SY, IS].indexOf(type) !== -1) {\n                prevIndex--;\n            } else {\n                break;\n            }\n        }\n    }\n\n    // NU (NU | SY | IS)* (CL | CP)? × (PO | PR))\n    if ([PR, PO].indexOf(next) !== -1) {\n        var _prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;\n        while (_prevIndex >= 0) {\n            var _type = classTypes[_prevIndex];\n            if (_type === NU) {\n                return BREAK_NOT_ALLOWED;\n            } else if ([SY, IS].indexOf(_type) !== -1) {\n                _prevIndex--;\n            } else {\n                break;\n            }\n        }\n    }\n\n    // LB26 Do not break a Korean syllable.\n    if (JL === current && [JL, JV, H2, H3].indexOf(next) !== -1 || [JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1 || [JT, H3].indexOf(current) !== -1 && next === JT) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB27 Treat a Korean Syllable Block the same as ID.\n    if (KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1 || KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB28 Do not break between alphabetics (“at”).\n    if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB29 Do not break between numeric punctuation and alphabetics (“e.g.”).\n    if (current === IS && ALPHABETICS.indexOf(next) !== -1) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB30 Do not break between letters, numbers, or ordinary symbols and opening or closing parentheses.\n    if (ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP || ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB30a Break between two regional indicator symbols if and only if there are an even number of regional\n    // indicators preceding the position of the break.\n    if (current === RI && next === RI) {\n        var i = indicies[currentIndex];\n        var count = 1;\n        while (i > 0) {\n            i--;\n            if (classTypes[i] === RI) {\n                count++;\n            } else {\n                break;\n            }\n        }\n        if (count % 2 !== 0) {\n            return BREAK_NOT_ALLOWED;\n        }\n    }\n\n    // LB30b Do not break between an emoji base and an emoji modifier.\n    if (current === EB && next === EM) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    return BREAK_ALLOWED;\n};\n\nvar lineBreakAtIndex = exports.lineBreakAtIndex = function lineBreakAtIndex(codePoints, index) {\n    // LB2 Never break at the start of text.\n    if (index === 0) {\n        return BREAK_NOT_ALLOWED;\n    }\n\n    // LB3 Always break at the end of text.\n    if (index >= codePoints.length) {\n        return BREAK_MANDATORY;\n    }\n\n    var _codePointsToCharacte = codePointsToCharacterClasses(codePoints),\n        _codePointsToCharacte2 = _slicedToArray(_codePointsToCharacte, 2),\n        indicies = _codePointsToCharacte2[0],\n        classTypes = _codePointsToCharacte2[1];\n\n    return _lineBreakAtIndex(codePoints, classTypes, indicies, index);\n};\n\nvar cssFormattedClasses = function cssFormattedClasses(codePoints, options) {\n    if (!options) {\n        options = { lineBreak: 'normal', wordBreak: 'normal' };\n    }\n\n    var _codePointsToCharacte3 = codePointsToCharacterClasses(codePoints, options.lineBreak),\n        _codePointsToCharacte4 = _slicedToArray(_codePointsToCharacte3, 3),\n        indicies = _codePointsToCharacte4[0],\n        classTypes = _codePointsToCharacte4[1],\n        isLetterNumber = _codePointsToCharacte4[2];\n\n    if (options.wordBreak === 'break-all' || options.wordBreak === 'break-word') {\n        classTypes = classTypes.map(function (type) {\n            return [NU, AL, SA].indexOf(type) !== -1 ? ID : type;\n        });\n    }\n\n    var forbiddenBreakpoints = options.wordBreak === 'keep-all' ? isLetterNumber.map(function (isLetterNumber, i) {\n        return isLetterNumber && codePoints[i] >= 0x4e00 && codePoints[i] <= 0x9fff;\n    }) : null;\n\n    return [indicies, classTypes, forbiddenBreakpoints];\n};\n\nvar inlineBreakOpportunities = exports.inlineBreakOpportunities = function inlineBreakOpportunities(str, options) {\n    var codePoints = (0, _Util.toCodePoints)(str);\n    var output = BREAK_NOT_ALLOWED;\n\n    var _cssFormattedClasses = cssFormattedClasses(codePoints, options),\n        _cssFormattedClasses2 = _slicedToArray(_cssFormattedClasses, 3),\n        indicies = _cssFormattedClasses2[0],\n        classTypes = _cssFormattedClasses2[1],\n        forbiddenBreakpoints = _cssFormattedClasses2[2];\n\n    codePoints.forEach(function (codePoint, i) {\n        output += (0, _Util.fromCodePoint)(codePoint) + (i >= codePoints.length - 1 ? BREAK_MANDATORY : _lineBreakAtIndex(codePoints, classTypes, indicies, i + 1, forbiddenBreakpoints));\n    });\n\n    return output;\n};\n\nvar Break = function () {\n    function Break(codePoints, lineBreak, start, end) {\n        _classCallCheck(this, Break);\n\n        this._codePoints = codePoints;\n        this.required = lineBreak === BREAK_MANDATORY;\n        this.start = start;\n        this.end = end;\n    }\n\n    _createClass(Break, [{\n        key: 'slice',\n        value: function slice() {\n            return _Util.fromCodePoint.apply(undefined, _toConsumableArray(this._codePoints.slice(this.start, this.end)));\n        }\n    }]);\n\n    return Break;\n}();\n\nvar LineBreaker = exports.LineBreaker = function LineBreaker(str, options) {\n    var codePoints = (0, _Util.toCodePoints)(str);\n\n    var _cssFormattedClasses3 = cssFormattedClasses(codePoints, options),\n        _cssFormattedClasses4 = _slicedToArray(_cssFormattedClasses3, 3),\n        indicies = _cssFormattedClasses4[0],\n        classTypes = _cssFormattedClasses4[1],\n        forbiddenBreakpoints = _cssFormattedClasses4[2];\n\n    var length = codePoints.length;\n    var lastEnd = 0;\n    var nextIndex = 0;\n\n    return {\n        next: function next() {\n            if (nextIndex >= length) {\n                return { done: true };\n            }\n            var lineBreak = BREAK_NOT_ALLOWED;\n            while (nextIndex < length && (lineBreak = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) === BREAK_NOT_ALLOWED) {}\n\n            if (lineBreak !== BREAK_NOT_ALLOWED || nextIndex === length) {\n                var value = new Break(codePoints, lineBreak, lastEnd, nextIndex);\n                lastEnd = nextIndex;\n                return { value: value, done: false };\n            }\n\n            return { done: true };\n        }\n    };\n};\n\n//# sourceURL=webpack://html2canvas/./node_modules/css-line-break/dist/LineBreak.js?");

/***/ }),

/***/ "./node_modules/css-line-break/dist/Trie.js":
/*!**************************************************!*\
  !*** ./node_modules/css-line-break/dist/Trie.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\nexports.Trie = exports.createTrieFromBase64 = exports.UTRIE2_INDEX_2_MASK = exports.UTRIE2_INDEX_2_BLOCK_LENGTH = exports.UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = exports.UTRIE2_INDEX_1_OFFSET = exports.UTRIE2_UTF8_2B_INDEX_2_LENGTH = exports.UTRIE2_UTF8_2B_INDEX_2_OFFSET = exports.UTRIE2_INDEX_2_BMP_LENGTH = exports.UTRIE2_LSCP_INDEX_2_LENGTH = exports.UTRIE2_DATA_MASK = exports.UTRIE2_DATA_BLOCK_LENGTH = exports.UTRIE2_LSCP_INDEX_2_OFFSET = exports.UTRIE2_SHIFT_1_2 = exports.UTRIE2_INDEX_SHIFT = exports.UTRIE2_SHIFT_1 = exports.UTRIE2_SHIFT_2 = undefined;\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _Util = __webpack_require__(/*! ./Util */ \"./node_modules/css-line-break/dist/Util.js\");\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n/** Shift size for getting the index-2 table offset. */\nvar UTRIE2_SHIFT_2 = exports.UTRIE2_SHIFT_2 = 5;\n\n/** Shift size for getting the index-1 table offset. */\nvar UTRIE2_SHIFT_1 = exports.UTRIE2_SHIFT_1 = 6 + 5;\n\n/**\n * Shift size for shifting left the index array values.\n * Increases possible data size with 16-bit index values at the cost\n * of compactability.\n * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.\n */\nvar UTRIE2_INDEX_SHIFT = exports.UTRIE2_INDEX_SHIFT = 2;\n\n/**\n * Difference between the two shift sizes,\n * for getting an index-1 offset from an index-2 offset. 6=11-5\n */\nvar UTRIE2_SHIFT_1_2 = exports.UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;\n\n/**\n * The part of the index-2 table for U+D800..U+DBFF stores values for\n * lead surrogate code _units_ not code _points_.\n * Values for lead surrogate code _points_ are indexed with this portion of the table.\n * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)\n */\nvar UTRIE2_LSCP_INDEX_2_OFFSET = exports.UTRIE2_LSCP_INDEX_2_OFFSET = 0x10000 >> UTRIE2_SHIFT_2;\n\n/** Number of entries in a data block. 32=0x20 */\nvar UTRIE2_DATA_BLOCK_LENGTH = exports.UTRIE2_DATA_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_2;\n/** Mask for getting the lower bits for the in-data-block offset. */\nvar UTRIE2_DATA_MASK = exports.UTRIE2_DATA_MASK = UTRIE2_DATA_BLOCK_LENGTH - 1;\n\nvar UTRIE2_LSCP_INDEX_2_LENGTH = exports.UTRIE2_LSCP_INDEX_2_LENGTH = 0x400 >> UTRIE2_SHIFT_2;\n/** Count the lengths of both BMP pieces. 2080=0x820 */\nvar UTRIE2_INDEX_2_BMP_LENGTH = exports.UTRIE2_INDEX_2_BMP_LENGTH = UTRIE2_LSCP_INDEX_2_OFFSET + UTRIE2_LSCP_INDEX_2_LENGTH;\n/**\n * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.\n * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.\n */\nvar UTRIE2_UTF8_2B_INDEX_2_OFFSET = exports.UTRIE2_UTF8_2B_INDEX_2_OFFSET = UTRIE2_INDEX_2_BMP_LENGTH;\nvar UTRIE2_UTF8_2B_INDEX_2_LENGTH = exports.UTRIE2_UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6; /* U+0800 is the first code point after 2-byte UTF-8 */\n/**\n * The index-1 table, only used for supplementary code points, at offset 2112=0x840.\n * Variable length, for code points up to highStart, where the last single-value range starts.\n * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.\n * (For 0x100000 supplementary code points U+10000..U+10ffff.)\n *\n * The part of the index-2 table for supplementary code points starts\n * after this index-1 table.\n *\n * Both the index-1 table and the following part of the index-2 table\n * are omitted completely if there is only BMP data.\n */\nvar UTRIE2_INDEX_1_OFFSET = exports.UTRIE2_INDEX_1_OFFSET = UTRIE2_UTF8_2B_INDEX_2_OFFSET + UTRIE2_UTF8_2B_INDEX_2_LENGTH;\n\n/**\n * Number of index-1 entries for the BMP. 32=0x20\n * This part of the index-1 table is omitted from the serialized form.\n */\nvar UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = exports.UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> UTRIE2_SHIFT_1;\n\n/** Number of entries in an index-2 block. 64=0x40 */\nvar UTRIE2_INDEX_2_BLOCK_LENGTH = exports.UTRIE2_INDEX_2_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_1_2;\n/** Mask for getting the lower bits for the in-index-2-block offset. */\nvar UTRIE2_INDEX_2_MASK = exports.UTRIE2_INDEX_2_MASK = UTRIE2_INDEX_2_BLOCK_LENGTH - 1;\n\nvar createTrieFromBase64 = exports.createTrieFromBase64 = function createTrieFromBase64(base64) {\n    var buffer = (0, _Util.decode)(base64);\n    var view32 = Array.isArray(buffer) ? (0, _Util.polyUint32Array)(buffer) : new Uint32Array(buffer);\n    var view16 = Array.isArray(buffer) ? (0, _Util.polyUint16Array)(buffer) : new Uint16Array(buffer);\n    var headerLength = 24;\n\n    var index = view16.slice(headerLength / 2, view32[4] / 2);\n    var data = view32[5] === 2 ? view16.slice((headerLength + view32[4]) / 2) : view32.slice(Math.ceil((headerLength + view32[4]) / 4));\n\n    return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);\n};\n\nvar Trie = exports.Trie = function () {\n    function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {\n        _classCallCheck(this, Trie);\n\n        this.initialValue = initialValue;\n        this.errorValue = errorValue;\n        this.highStart = highStart;\n        this.highValueIndex = highValueIndex;\n        this.index = index;\n        this.data = data;\n    }\n\n    /**\n     * Get the value for a code point as stored in the Trie.\n     *\n     * @param codePoint the code point\n     * @return the value\n     */\n\n\n    _createClass(Trie, [{\n        key: 'get',\n        value: function get(codePoint) {\n            var ix = void 0;\n            if (codePoint >= 0) {\n                if (codePoint < 0x0d800 || codePoint > 0x0dbff && codePoint <= 0x0ffff) {\n                    // Ordinary BMP code point, excluding leading surrogates.\n                    // BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.\n                    // 16 bit data is stored in the index array itself.\n                    ix = this.index[codePoint >> UTRIE2_SHIFT_2];\n                    ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);\n                    return this.data[ix];\n                }\n\n                if (codePoint <= 0xffff) {\n                    // Lead Surrogate Code Point.  A Separate index section is stored for\n                    // lead surrogate code units and code points.\n                    //   The main index has the code unit data.\n                    //   For this function, we need the code point data.\n                    // Note: this expression could be refactored for slightly improved efficiency, but\n                    //       surrogate code points will be so rare in practice that it's not worth it.\n                    ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + (codePoint - 0xd800 >> UTRIE2_SHIFT_2)];\n                    ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);\n                    return this.data[ix];\n                }\n\n                if (codePoint < this.highStart) {\n                    // Supplemental code point, use two-level lookup.\n                    ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);\n                    ix = this.index[ix];\n                    ix += codePoint >> UTRIE2_SHIFT_2 & UTRIE2_INDEX_2_MASK;\n                    ix = this.index[ix];\n                    ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);\n                    return this.data[ix];\n                }\n                if (codePoint <= 0x10ffff) {\n                    return this.data[this.highValueIndex];\n                }\n            }\n\n            // Fall through.  The code point is outside of the legal range of 0..0x10ffff.\n            return this.errorValue;\n        }\n    }]);\n\n    return Trie;\n}();\n\n//# sourceURL=webpack://html2canvas/./node_modules/css-line-break/dist/Trie.js?");

/***/ }),

/***/ "./node_modules/css-line-break/dist/Util.js":
/*!**************************************************!*\
  !*** ./node_modules/css-line-break/dist/Util.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\nvar toCodePoints = exports.toCodePoints = function toCodePoints(str) {\n    var codePoints = [];\n    var i = 0;\n    var length = str.length;\n    while (i < length) {\n        var value = str.charCodeAt(i++);\n        if (value >= 0xd800 && value <= 0xdbff && i < length) {\n            var extra = str.charCodeAt(i++);\n            if ((extra & 0xfc00) === 0xdc00) {\n                codePoints.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);\n            } else {\n                codePoints.push(value);\n                i--;\n            }\n        } else {\n            codePoints.push(value);\n        }\n    }\n    return codePoints;\n};\n\nvar fromCodePoint = exports.fromCodePoint = function fromCodePoint() {\n    if (String.fromCodePoint) {\n        return String.fromCodePoint.apply(String, arguments);\n    }\n\n    var length = arguments.length;\n    if (!length) {\n        return '';\n    }\n\n    var codeUnits = [];\n\n    var index = -1;\n    var result = '';\n    while (++index < length) {\n        var codePoint = arguments.length <= index ? undefined : arguments[index];\n        if (codePoint <= 0xffff) {\n            codeUnits.push(codePoint);\n        } else {\n            codePoint -= 0x10000;\n            codeUnits.push((codePoint >> 10) + 0xd800, codePoint % 0x400 + 0xdc00);\n        }\n        if (index + 1 === length || codeUnits.length > 0x4000) {\n            result += String.fromCharCode.apply(String, codeUnits);\n            codeUnits.length = 0;\n        }\n    }\n    return result;\n};\n\nvar chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n\n// Use a lookup table to find the index.\nvar lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);\nfor (var i = 0; i < chars.length; i++) {\n    lookup[chars.charCodeAt(i)] = i;\n}\n\nvar decode = exports.decode = function decode(base64) {\n    var bufferLength = base64.length * 0.75,\n        len = base64.length,\n        i = void 0,\n        p = 0,\n        encoded1 = void 0,\n        encoded2 = void 0,\n        encoded3 = void 0,\n        encoded4 = void 0;\n\n    if (base64[base64.length - 1] === '=') {\n        bufferLength--;\n        if (base64[base64.length - 2] === '=') {\n            bufferLength--;\n        }\n    }\n\n    var buffer = typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint8Array.prototype.slice !== 'undefined' ? new ArrayBuffer(bufferLength) : new Array(bufferLength);\n    var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);\n\n    for (i = 0; i < len; i += 4) {\n        encoded1 = lookup[base64.charCodeAt(i)];\n        encoded2 = lookup[base64.charCodeAt(i + 1)];\n        encoded3 = lookup[base64.charCodeAt(i + 2)];\n        encoded4 = lookup[base64.charCodeAt(i + 3)];\n\n        bytes[p++] = encoded1 << 2 | encoded2 >> 4;\n        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;\n        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;\n    }\n\n    return buffer;\n};\n\nvar polyUint16Array = exports.polyUint16Array = function polyUint16Array(buffer) {\n    var length = buffer.length;\n    var bytes = [];\n    for (var _i = 0; _i < length; _i += 2) {\n        bytes.push(buffer[_i + 1] << 8 | buffer[_i]);\n    }\n    return bytes;\n};\n\nvar polyUint32Array = exports.polyUint32Array = function polyUint32Array(buffer) {\n    var length = buffer.length;\n    var bytes = [];\n    for (var _i2 = 0; _i2 < length; _i2 += 4) {\n        bytes.push(buffer[_i2 + 3] << 24 | buffer[_i2 + 2] << 16 | buffer[_i2 + 1] << 8 | buffer[_i2]);\n    }\n    return bytes;\n};\n\n//# sourceURL=webpack://html2canvas/./node_modules/css-line-break/dist/Util.js?");

/***/ }),

/***/ "./node_modules/css-line-break/dist/index.js":
/*!***************************************************!*\
  !*** ./node_modules/css-line-break/dist/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _Util = __webpack_require__(/*! ./Util */ \"./node_modules/css-line-break/dist/Util.js\");\n\nObject.defineProperty(exports, 'toCodePoints', {\n  enumerable: true,\n  get: function get() {\n    return _Util.toCodePoints;\n  }\n});\nObject.defineProperty(exports, 'fromCodePoint', {\n  enumerable: true,\n  get: function get() {\n    return _Util.fromCodePoint;\n  }\n});\n\nvar _LineBreak = __webpack_require__(/*! ./LineBreak */ \"./node_modules/css-line-break/dist/LineBreak.js\");\n\nObject.defineProperty(exports, 'LineBreaker', {\n  enumerable: true,\n  get: function get() {\n    return _LineBreak.LineBreaker;\n  }\n});\n\n//# sourceURL=webpack://html2canvas/./node_modules/css-line-break/dist/index.js?");

/***/ }),

/***/ "./node_modules/css-line-break/dist/linebreak-trie.js":
/*!************************************************************!*\
  !*** ./node_modules/css-line-break/dist/linebreak-trie.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = 'KwAAAAAAAAAACA4AIDoAAPAfAAACAAAAAAAIABAAGABAAEgAUABYAF4AZgBeAGYAYABoAHAAeABeAGYAfACEAIAAiACQAJgAoACoAK0AtQC9AMUAXgBmAF4AZgBeAGYAzQDVAF4AZgDRANkA3gDmAOwA9AD8AAQBDAEUARoBIgGAAIgAJwEvATcBPwFFAU0BTAFUAVwBZAFsAXMBewGDATAAiwGTAZsBogGkAawBtAG8AcIBygHSAdoB4AHoAfAB+AH+AQYCDgIWAv4BHgImAi4CNgI+AkUCTQJTAlsCYwJrAnECeQKBAk0CiQKRApkCoQKoArACuALAAsQCzAIwANQC3ALkAjAA7AL0AvwCAQMJAxADGAMwACADJgMuAzYDPgOAAEYDSgNSA1IDUgNaA1oDYANiA2IDgACAAGoDgAByA3YDfgOAAIQDgACKA5IDmgOAAIAAogOqA4AAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAK8DtwOAAIAAvwPHA88D1wPfAyAD5wPsA/QD/AOAAIAABAQMBBIEgAAWBB4EJgQuBDMEIAM7BEEEXgBJBCADUQRZBGEEaQQwADAAcQQ+AXkEgQSJBJEEgACYBIAAoASoBK8EtwQwAL8ExQSAAIAAgACAAIAAgACgAM0EXgBeAF4AXgBeAF4AXgBeANUEXgDZBOEEXgDpBPEE+QQBBQkFEQUZBSEFKQUxBTUFPQVFBUwFVAVcBV4AYwVeAGsFcwV7BYMFiwWSBV4AmgWgBacFXgBeAF4AXgBeAKsFXgCyBbEFugW7BcIFwgXIBcIFwgXQBdQF3AXkBesF8wX7BQMGCwYTBhsGIwYrBjMGOwZeAD8GRwZNBl4AVAZbBl4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAGMGXgBqBnEGXgBeAF4AXgBeAF4AXgBeAF4AXgB5BoAG4wSGBo4GkwaAAIADHgR5AF4AXgBeAJsGgABGA4AAowarBrMGswagALsGwwbLBjAA0wbaBtoG3QbaBtoG2gbaBtoG2gblBusG8wb7BgMHCwcTBxsHCwcjBysHMAc1BzUHOgdCB9oGSgdSB1oHYAfaBloHaAfaBlIH2gbaBtoG2gbaBtoG2gbaBjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHbQdeAF4ANQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQd1B30HNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B4MH2gaKB68EgACAAIAAgACAAIAAgACAAI8HlwdeAJ8HpweAAIAArwe3B14AXgC/B8UHygcwANAH2AfgB4AA6AfwBz4B+AcACFwBCAgPCBcIogEYAR8IJwiAAC8INwg/CCADRwhPCFcIXwhnCEoDGgSAAIAAgABvCHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIhAiLCI4IMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAANQc1BzUHNQc1BzUHNQc1BzUHNQc1B54INQc1B6II2gaqCLIIugiAAIAAvgjGCIAAgACAAIAAgACAAIAAgACAAIAAywiHAYAA0wiAANkI3QjlCO0I9Aj8CIAAgACAAAIJCgkSCRoJIgknCTYHLwk3CZYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiAAIAAAAFAAXgBeAGAAcABeAHwAQACQAKAArQC9AJ4AXgBeAE0A3gBRAN4A7AD8AMwBGgEAAKcBNwEFAUwBXAF4QkhCmEKnArcCgAHHAsABz4LAAcABwAHAAd+C6ABoAG+C/4LAAcABwAHAAc+DF4MAAcAB54M3gweDV4Nng3eDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEeDqABVg6WDqABoQ6gAaABoAHXDvcONw/3DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DncPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB7cPPwlGCU4JMACAAIAAgABWCV4JYQmAAGkJcAl4CXwJgAkwADAAMAAwAIgJgACLCZMJgACZCZ8JowmrCYAAswkwAF4AXgB8AIAAuwkABMMJyQmAAM4JgADVCTAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAqwYWBNkIMAAwADAAMADdCeAJ6AnuCR4E9gkwAP4JBQoNCjAAMACAABUK0wiAAB0KJAosCjQKgAAwADwKQwqAAEsKvQmdCVMKWwowADAAgACAALcEMACAAGMKgABrCjAAMAAwADAAMAAwADAAMAAwADAAMAAeBDAAMAAwADAAMAAwADAAMAAwADAAMAAwAIkEPQFzCnoKiQSCCooKkAqJBJgKoAqkCokEGAGsCrQKvArBCjAAMADJCtEKFQHZCuEK/gHpCvEKMAAwADAAMACAAIwE+QowAIAAPwEBCzAAMAAwADAAMACAAAkLEQswAIAAPwEZCyELgAAOCCkLMAAxCzkLMAAwADAAMAAwADAAXgBeAEELMAAwADAAMAAwADAAMAAwAEkLTQtVC4AAXAtkC4AAiQkwADAAMAAwADAAMAAwADAAbAtxC3kLgAuFC4sLMAAwAJMLlwufCzAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAApwswADAAMACAAIAAgACvC4AAgACAAIAAgACAALcLMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAvwuAAMcLgACAAIAAgACAAIAAyguAAIAAgACAAIAA0QswADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAANkLgACAAIAA4AswADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACJCR4E6AswADAAhwHwC4AA+AsADAgMEAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMACAAIAAGAwdDCUMMAAwAC0MNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQw1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHPQwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADUHNQc1BzUHNQc1BzUHNQc2BzAAMAA5DDUHNQc1BzUHNQc1BzUHNQc1BzUHNQdFDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAATQxSDFoMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAF4AXgBeAF4AXgBeAF4AYgxeAGoMXgBxDHkMfwxeAIUMXgBeAI0MMAAwADAAMAAwAF4AXgCVDJ0MMAAwADAAMABeAF4ApQxeAKsMswy7DF4Awgy9DMoMXgBeAF4AXgBeAF4AXgBeAF4AXgDRDNkMeQBqCeAM3Ax8AOYM7Az0DPgMXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgCgAAANoAAHDQ4NFg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAeDSYNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAC4NMABeAF4ANg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAD4NRg1ODVYNXg1mDTAAbQ0wADAAMAAwADAAMAAwADAA2gbaBtoG2gbaBtoG2gbaBnUNeg3CBYANwgWFDdoGjA3aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gaUDZwNpA2oDdoG2gawDbcNvw3HDdoG2gbPDdYN3A3fDeYN2gbsDfMN2gbaBvoN/g3aBgYODg7aBl4AXgBeABYOXgBeACUG2gYeDl4AJA5eACwO2w3aBtoGMQ45DtoG2gbaBtoGQQ7aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B1EO2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQdZDjUHNQc1BzUHNQc1B2EONQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHaA41BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B3AO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B2EO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBkkOeA6gAKAAoAAwADAAMAAwAKAAoACgAKAAoACgAKAAgA4wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAD//wQABAAEAAQABAAEAAQABAAEAA0AAwABAAEAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAKABMAFwAeABsAGgAeABcAFgASAB4AGwAYAA8AGAAcAEsASwBLAEsASwBLAEsASwBLAEsAGAAYAB4AHgAeABMAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAFgAbABIAHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYADQARAB4ABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkAFgAaABsAGwAbAB4AHQAdAB4ATwAXAB4ADQAeAB4AGgAbAE8ATwAOAFAAHQAdAB0ATwBPABcATwBPAE8AFgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwArAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAAQABAANAA0ASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAUAArACsAKwArACsAKwArACsABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAGgAaAFAAUABQAFAAUABMAB4AGwBQAB4AKwArACsABAAEAAQAKwBQAFAAUABQAFAAUAArACsAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUAArAFAAUAArACsABAArAAQABAAEAAQABAArACsAKwArAAQABAArACsABAAEAAQAKwArACsABAArACsAKwArACsAKwArAFAAUABQAFAAKwBQACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwAEAAQAUABQAFAABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQAKwArAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeABsAKwArACsAKwArACsAKwBQAAQABAAEAAQABAAEACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAKwArACsAKwArACsAKwArAAQABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwAEAFAAKwBQAFAAUABQAFAAUAArACsAKwBQAFAAUAArAFAAUABQAFAAKwArACsAUABQACsAUAArAFAAUAArACsAKwBQAFAAKwArACsAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQAKwArACsABAAEAAQAKwAEAAQABAAEACsAKwBQACsAKwArACsAKwArAAQAKwArACsAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAB4AHgAeAB4AHgAeABsAHgArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArAFAAUABQACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAB4AUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArACsAKwArACsAKwArAFAAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwArAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAKwBcAFwAKwBcACsAKwBcACsAKwArACsAKwArAFwAXABcAFwAKwBcAFwAXABcAFwAXABcACsAXABcAFwAKwBcACsAXAArACsAXABcACsAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgArACoAKgBcACsAKwBcAFwAXABcAFwAKwBcACsAKgAqACoAKgAqACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAFwAXABcAFwAUAAOAA4ADgAOAB4ADgAOAAkADgAOAA0ACQATABMAEwATABMACQAeABMAHgAeAB4ABAAEAB4AHgAeAB4AHgAeAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUAANAAQAHgAEAB4ABAAWABEAFgARAAQABABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAAQABAAEAAQABAANAAQABABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsADQANAB4AHgAeAB4AHgAeAAQAHgAeAB4AHgAeAB4AKwAeAB4ADgAOAA0ADgAeAB4AHgAeAB4ACQAJACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgAeAB4AHgBcAFwAXABcAFwAXAAqACoAKgAqAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAKgAqACoAKgAqACoAKgBcAFwAXAAqACoAKgAqAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAXAAqAEsASwBLAEsASwBLAEsASwBLAEsAKgAqACoAKgAqACoAUABQAFAAUABQAFAAKwBQACsAKwArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQACsAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwAEAAQABAAeAA0AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAEQArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAADQANAA0AUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAA0ADQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoADQANABUAXAANAB4ADQAbAFwAKgArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAB4AHgATABMADQANAA4AHgATABMAHgAEAAQABAAJACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAUABQAFAAUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwAeACsAKwArABMAEwBLAEsASwBLAEsASwBLAEsASwBLAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwBcAFwAXABcAFwAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcACsAKwArACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwAeAB4AXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsABABLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKgAqACoAKgAqACoAKgBcACoAKgAqACoAKgAqACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAUABQAFAAUABQAFAAUAArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4ADQANAA0ADQAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAHgAeAB4AHgBQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwANAA0ADQANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwBQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsABAAEAAQAHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAABABQAFAAUABQAAQABAAEAFAAUAAEAAQABAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAKwBQACsAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAKwArAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAKwAeAB4AHgAeAB4AHgAeAA4AHgArAA0ADQANAA0ADQANAA0ACQANAA0ADQAIAAQACwAEAAQADQAJAA0ADQAMAB0AHQAeABcAFwAWABcAFwAXABYAFwAdAB0AHgAeABQAFAAUAA0AAQABAAQABAAEAAQABAAJABoAGgAaABoAGgAaABoAGgAeABcAFwAdABUAFQAeAB4AHgAeAB4AHgAYABYAEQAVABUAFQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgANAB4ADQANAA0ADQAeAA0ADQANAAcAHgAeAB4AHgArAAQABAAEAAQABAAEAAQABAAEAAQAUABQACsAKwBPAFAAUABQAFAAUAAeAB4AHgAWABEATwBQAE8ATwBPAE8AUABQAFAAUABQAB4AHgAeABYAEQArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGgAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgBQABoAHgAdAB4AUAAeABoAHgAeAB4AHgAeAB4AHgAeAB4ATwAeAFAAGwAeAB4AUABQAFAAUABQAB4AHgAeAB0AHQAeAFAAHgBQAB4AUAAeAFAATwBQAFAAHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AUABQAFAAUABPAE8AUABQAFAAUABQAE8AUABQAE8AUABPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAE8ATwBPAE8ATwBPAE8ATwBPAE8AUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAATwAeAB4AKwArACsAKwAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB0AHQAeAB4AHgAdAB0AHgAeAB0AHgAeAB4AHQAeAB0AGwAbAB4AHQAeAB4AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB0AHgAdAB4AHQAdAB0AHQAdAB0AHgAdAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAdAB0AHQAdAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAlACUAHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB0AHQAeAB4AHgAeAB0AHQAdAB4AHgAdAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB0AHQAeAB4AHQAeAB4AHgAeAB0AHQAeAB4AHgAeACUAJQAdAB0AJQAeACUAJQAlACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHQAdAB0AHgAdACUAHQAdAB4AHQAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHQAdAB0AHQAlAB4AJQAlACUAHQAlACUAHQAdAB0AJQAlAB0AHQAlAB0AHQAlACUAJQAeAB0AHgAeAB4AHgAdAB0AJQAdAB0AHQAdAB0AHQAlACUAJQAlACUAHQAlACUAIAAlAB0AHQAlACUAJQAlACUAJQAlACUAHgAeAB4AJQAlACAAIAAgACAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeABcAFwAXABcAFwAXAB4AEwATACUAHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACUAJQBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwArACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAE8ATwBPAE8ATwBPAE8ATwAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeACsAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUAArACsAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQBQAFAAUABQACsAKwArACsAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAABAAEAAQAKwAEAAQAKwArACsAKwArAAQABAAEAAQAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsABAAEAAQAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsADQANAA0ADQANAA0ADQANAB4AKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAUABQAFAAUABQAA0ADQANAA0ADQANABQAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwANAA0ADQANAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAeAAQABAAEAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLACsADQArAB4AKwArAAQABAAEAAQAUABQAB4AUAArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwAEAAQABAAEAAQABAAEAAQABAAOAA0ADQATABMAHgAeAB4ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0AUABQAFAAUAAEAAQAKwArAAQADQANAB4AUAArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXABcAA0ADQANACoASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUAArACsAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANACsADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEcARwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwAeAAQABAANAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAEAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUAArACsAUAArACsAUABQACsAKwBQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAeAB4ADQANAA0ADQAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAArAAQABAArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAEAAQABAAEAAQABAAEACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAFgAWAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAKwBQACsAKwArACsAKwArAFAAKwArACsAKwBQACsAUAArAFAAKwBQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQACsAUAArAFAAKwBQACsAUABQACsAUAArACsAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAUABQAFAAUAArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUAArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAlACUAJQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeACUAJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeACUAJQAlACUAJQAeACUAJQAlACUAJQAgACAAIAAlACUAIAAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIQAhACEAIQAhACUAJQAgACAAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAIAAlACUAJQAlACAAJQAgACAAIAAgACAAIAAgACAAIAAlACUAJQAgACUAJQAlACUAIAAgACAAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeACUAHgAlAB4AJQAlACUAJQAlACAAJQAlACUAJQAeACUAHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAIAAgACAAIAAgAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFwAXABcAFQAVABUAHgAeAB4AHgAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAlACAAIAAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsA';\n\n//# sourceURL=webpack://html2canvas/./node_modules/css-line-break/dist/linebreak-trie.js?");

/***/ }),

/***/ "./src/Angle.js":
/*!**********************!*\
  !*** ./src/Angle.js ***!
  \**********************/
/*! exports provided: parseAngle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseAngle\", function() { return parseAngle; });\n\n\nvar ANGLE = /([+-]?\\d*\\.?\\d+)(deg|grad|rad|turn)/i;\nvar parseAngle = function parseAngle(angle) {\n  var match = angle.match(ANGLE);\n\n  if (match) {\n    var value = parseFloat(match[1]);\n\n    switch (match[2].toLowerCase()) {\n      case 'deg':\n        return Math.PI * value / 180;\n\n      case 'grad':\n        return Math.PI / 200 * value;\n\n      case 'rad':\n        return value;\n\n      case 'turn':\n        return Math.PI * 2 * value;\n    }\n  }\n\n  return null;\n};\n\n//# sourceURL=webpack://html2canvas/./src/Angle.js?");

/***/ }),

/***/ "./src/Bounds.js":
/*!***********************!*\
  !*** ./src/Bounds.js ***!
  \***********************/
/*! exports provided: Bounds, parseBounds, calculatePaddingBox, calculateContentBox, parseDocumentSize, parsePathForBorder, calculateBorderBoxPath, calculatePaddingBoxPath, parseBoundCurves */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Bounds\", function() { return Bounds; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseBounds\", function() { return parseBounds; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculatePaddingBox\", function() { return calculatePaddingBox; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateContentBox\", function() { return calculateContentBox; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseDocumentSize\", function() { return parseDocumentSize; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parsePathForBorder\", function() { return parsePathForBorder; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateBorderBoxPath\", function() { return calculateBorderBoxPath; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculatePaddingBoxPath\", function() { return calculatePaddingBoxPath; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseBoundCurves\", function() { return parseBoundCurves; });\n/* harmony import */ var _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawing/Vector */ \"./src/drawing/Vector.js\");\n/* harmony import */ var _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./drawing/BezierCurve */ \"./src/drawing/BezierCurve.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\nvar TOP = 0;\nvar RIGHT = 1;\nvar BOTTOM = 2;\nvar LEFT = 3;\nvar H = 0;\nvar V = 1;\nvar Bounds =\n/*#__PURE__*/\nfunction () {\n  function Bounds(x, y, w, h) {\n    _classCallCheck(this, Bounds);\n\n    this.left = x;\n    this.top = y;\n    this.width = w;\n    this.height = h;\n  }\n\n  _createClass(Bounds, null, [{\n    key: \"fromClientRect\",\n    value: function fromClientRect(clientRect, scrollX, scrollY) {\n      return new Bounds(clientRect.left + scrollX, clientRect.top + scrollY, clientRect.width, clientRect.height);\n    }\n  }]);\n\n  return Bounds;\n}();\nvar parseBounds = function parseBounds(node, scrollX, scrollY) {\n  return Bounds.fromClientRect(node.getBoundingClientRect(), scrollX, scrollY);\n};\nvar calculatePaddingBox = function calculatePaddingBox(bounds, borders) {\n  return new Bounds(bounds.left + borders[LEFT].borderWidth, bounds.top + borders[TOP].borderWidth, bounds.width - (borders[RIGHT].borderWidth + borders[LEFT].borderWidth), bounds.height - (borders[TOP].borderWidth + borders[BOTTOM].borderWidth));\n};\nvar calculateContentBox = function calculateContentBox(bounds, padding, borders) {\n  // TODO support percentage paddings\n  var paddingTop = padding[TOP].value;\n  var paddingRight = padding[RIGHT].value;\n  var paddingBottom = padding[BOTTOM].value;\n  var paddingLeft = padding[LEFT].value;\n  return new Bounds(bounds.left + paddingLeft + borders[LEFT].borderWidth, bounds.top + paddingTop + borders[TOP].borderWidth, bounds.width - (borders[RIGHT].borderWidth + borders[LEFT].borderWidth + paddingLeft + paddingRight), bounds.height - (borders[TOP].borderWidth + borders[BOTTOM].borderWidth + paddingTop + paddingBottom));\n};\nvar parseDocumentSize = function parseDocumentSize(document) {\n  var body = document.body;\n  var documentElement = document.documentElement;\n\n  if (!body || !documentElement) {\n    throw new Error( true ? \"Unable to get document size\" : undefined);\n  }\n\n  var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));\n  var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));\n  return new Bounds(0, 0, width, height);\n};\nvar parsePathForBorder = function parsePathForBorder(curves, borderSide) {\n  switch (borderSide) {\n    case TOP:\n      return createPathFromCurves(curves.topLeftOuter, curves.topLeftInner, curves.topRightOuter, curves.topRightInner);\n\n    case RIGHT:\n      return createPathFromCurves(curves.topRightOuter, curves.topRightInner, curves.bottomRightOuter, curves.bottomRightInner);\n\n    case BOTTOM:\n      return createPathFromCurves(curves.bottomRightOuter, curves.bottomRightInner, curves.bottomLeftOuter, curves.bottomLeftInner);\n\n    case LEFT:\n    default:\n      return createPathFromCurves(curves.bottomLeftOuter, curves.bottomLeftInner, curves.topLeftOuter, curves.topLeftInner);\n  }\n};\n\nvar createPathFromCurves = function createPathFromCurves(outer1, inner1, outer2, inner2) {\n  var path = [];\n\n  if (outer1 instanceof _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"]) {\n    path.push(outer1.subdivide(0.5, false));\n  } else {\n    path.push(outer1);\n  }\n\n  if (outer2 instanceof _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"]) {\n    path.push(outer2.subdivide(0.5, true));\n  } else {\n    path.push(outer2);\n  }\n\n  if (inner2 instanceof _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"]) {\n    path.push(inner2.subdivide(0.5, true).reverse());\n  } else {\n    path.push(inner2);\n  }\n\n  if (inner1 instanceof _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"]) {\n    path.push(inner1.subdivide(0.5, false).reverse());\n  } else {\n    path.push(inner1);\n  }\n\n  return path;\n};\n\nvar calculateBorderBoxPath = function calculateBorderBoxPath(curves) {\n  return [curves.topLeftOuter, curves.topRightOuter, curves.bottomRightOuter, curves.bottomLeftOuter];\n};\nvar calculatePaddingBoxPath = function calculatePaddingBoxPath(curves) {\n  return [curves.topLeftInner, curves.topRightInner, curves.bottomRightInner, curves.bottomLeftInner];\n};\nvar parseBoundCurves = function parseBoundCurves(bounds, borders, borderRadius) {\n  var tlh = borderRadius[CORNER.TOP_LEFT][H].getAbsoluteValue(bounds.width);\n  var tlv = borderRadius[CORNER.TOP_LEFT][V].getAbsoluteValue(bounds.height);\n  var trh = borderRadius[CORNER.TOP_RIGHT][H].getAbsoluteValue(bounds.width);\n  var trv = borderRadius[CORNER.TOP_RIGHT][V].getAbsoluteValue(bounds.height);\n  var brh = borderRadius[CORNER.BOTTOM_RIGHT][H].getAbsoluteValue(bounds.width);\n  var brv = borderRadius[CORNER.BOTTOM_RIGHT][V].getAbsoluteValue(bounds.height);\n  var blh = borderRadius[CORNER.BOTTOM_LEFT][H].getAbsoluteValue(bounds.width);\n  var blv = borderRadius[CORNER.BOTTOM_LEFT][V].getAbsoluteValue(bounds.height);\n  var factors = [];\n  factors.push((tlh + trh) / bounds.width);\n  factors.push((blh + brh) / bounds.width);\n  factors.push((tlv + blv) / bounds.height);\n  factors.push((trv + brv) / bounds.height);\n  var maxFactor = Math.max.apply(Math, factors);\n\n  if (maxFactor > 1) {\n    tlh /= maxFactor;\n    tlv /= maxFactor;\n    trh /= maxFactor;\n    trv /= maxFactor;\n    brh /= maxFactor;\n    brv /= maxFactor;\n    blh /= maxFactor;\n    blv /= maxFactor;\n  }\n\n  var topWidth = bounds.width - trh;\n  var rightHeight = bounds.height - brv;\n  var bottomWidth = bounds.width - brh;\n  var leftHeight = bounds.height - blv;\n  return {\n    topLeftOuter: tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left, bounds.top),\n    topLeftInner: tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borders[LEFT].borderWidth, bounds.top + borders[TOP].borderWidth, Math.max(0, tlh - borders[LEFT].borderWidth), Math.max(0, tlv - borders[TOP].borderWidth), CORNER.TOP_LEFT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left + borders[LEFT].borderWidth, bounds.top + borders[TOP].borderWidth),\n    topRightOuter: trh > 0 || trv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left + bounds.width, bounds.top),\n    topRightInner: trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borders[LEFT].borderWidth), bounds.top + borders[TOP].borderWidth, topWidth > bounds.width + borders[LEFT].borderWidth ? 0 : trh - borders[LEFT].borderWidth, trv - borders[TOP].borderWidth, CORNER.TOP_RIGHT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left + bounds.width - borders[RIGHT].borderWidth, bounds.top + borders[TOP].borderWidth),\n    bottomRightOuter: brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left + bounds.width, bounds.top + bounds.height),\n    bottomRightInner: brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borders[LEFT].borderWidth), bounds.top + Math.min(rightHeight, bounds.height + borders[TOP].borderWidth), Math.max(0, brh - borders[RIGHT].borderWidth), brv - borders[BOTTOM].borderWidth, CORNER.BOTTOM_RIGHT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left + bounds.width - borders[RIGHT].borderWidth, bounds.top + bounds.height - borders[BOTTOM].borderWidth),\n    bottomLeftOuter: blh > 0 || blv > 0 ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left, bounds.top + bounds.height),\n    bottomLeftInner: blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borders[LEFT].borderWidth, bounds.top + leftHeight, Math.max(0, blh - borders[LEFT].borderWidth), blv - borders[BOTTOM].borderWidth, CORNER.BOTTOM_LEFT) : new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](bounds.left + borders[LEFT].borderWidth, bounds.top + bounds.height - borders[BOTTOM].borderWidth)\n  };\n};\nvar CORNER = {\n  TOP_LEFT: 0,\n  TOP_RIGHT: 1,\n  BOTTOM_RIGHT: 2,\n  BOTTOM_LEFT: 3\n};\n\nvar getCurvePoints = function getCurvePoints(x, y, r1, r2, position) {\n  var kappa = 4 * ((Math.sqrt(2) - 1) / 3);\n  var ox = r1 * kappa; // control point offset horizontal\n\n  var oy = r2 * kappa; // control point offset vertical\n\n  var xm = x + r1; // x-middle\n\n  var ym = y + r2; // y-middle\n\n  switch (position) {\n    case CORNER.TOP_LEFT:\n      return new _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"](new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, ym), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, ym - oy), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm - ox, y), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm, y));\n\n    case CORNER.TOP_RIGHT:\n      return new _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"](new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, y), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x + ox, y), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm, ym - oy), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm, ym));\n\n    case CORNER.BOTTOM_RIGHT:\n      return new _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"](new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm, y), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm, y + oy), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x + ox, ym), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, ym));\n\n    case CORNER.BOTTOM_LEFT:\n    default:\n      return new _drawing_BezierCurve__WEBPACK_IMPORTED_MODULE_1__[\"default\"](new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm, ym), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](xm - ox, ym), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, y + oy), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](x, y));\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/Bounds.js?");

/***/ }),

/***/ "./src/Clone.js":
/*!**********************!*\
  !*** ./src/Clone.js ***!
  \**********************/
/*! exports provided: DocumentCloner, cloneWindow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"DocumentCloner\", function() { return DocumentCloner; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cloneWindow\", function() { return cloneWindow; });\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _Proxy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Proxy */ \"./src/Proxy.js\");\n/* harmony import */ var _ResourceLoader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ResourceLoader */ \"./src/ResourceLoader.js\");\n/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Util */ \"./src/Util.js\");\n/* harmony import */ var _parsing_background__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parsing/background */ \"./src/parsing/background.js\");\n/* harmony import */ var _renderer_CanvasRenderer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./renderer/CanvasRenderer */ \"./src/renderer/CanvasRenderer.js\");\n/* harmony import */ var _PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./PseudoNodeContent */ \"./src/PseudoNodeContent.js\");\n\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\n\n\n\n\nvar IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';\nvar DocumentCloner =\n/*#__PURE__*/\nfunction () {\n  function DocumentCloner(element, options, logger, copyInline, renderer) {\n    _classCallCheck(this, DocumentCloner);\n\n    this.referenceElement = element;\n    this.scrolledElements = [];\n    this.copyStyles = copyInline;\n    this.inlineImages = copyInline;\n    this.logger = logger;\n    this.options = options;\n    this.renderer = renderer;\n    this.resourceLoader = new _ResourceLoader__WEBPACK_IMPORTED_MODULE_2__[\"default\"](options, logger, window);\n    this.pseudoContentData = {\n      counters: {},\n      quoteDepth: 0\n    }; // $FlowFixMe\n\n    this.documentElement = this.cloneNode(element.ownerDocument.documentElement);\n  }\n\n  _createClass(DocumentCloner, [{\n    key: \"inlineAllImages\",\n    value: function inlineAllImages(node) {\n      var _this = this;\n\n      if (this.inlineImages && node) {\n        var style = node.style;\n        Promise.all(Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"parseBackgroundImage\"])(style.backgroundImage).map(function (backgroundImage) {\n          if (backgroundImage.method === 'url') {\n            return _this.resourceLoader.inlineImage(backgroundImage.args[0]).then(function (img) {\n              return img && typeof img.src === 'string' ? \"url(\\\"\".concat(img.src, \"\\\")\") : 'none';\n            }).catch(function (e) {\n              if (true) {\n                _this.logger.log(\"Unable to load image\", e);\n              }\n            });\n          }\n\n          return Promise.resolve(\"\".concat(backgroundImage.prefix).concat(backgroundImage.method, \"(\").concat(backgroundImage.args.join(','), \")\"));\n        })).then(function (backgroundImages) {\n          if (backgroundImages.length > 1) {\n            // TODO Multiple backgrounds somehow broken in Chrome\n            style.backgroundColor = '';\n          }\n\n          style.backgroundImage = backgroundImages.join(',');\n        });\n\n        if (node instanceof HTMLImageElement) {\n          this.resourceLoader.inlineImage(node.src).then(function (img) {\n            if (img && node instanceof HTMLImageElement && node.parentNode) {\n              var parentNode = node.parentNode;\n              var clonedChild = Object(_Util__WEBPACK_IMPORTED_MODULE_3__[\"copyCSSStyles\"])(node.style, img.cloneNode(false));\n              parentNode.replaceChild(clonedChild, node);\n            }\n          }).catch(function (e) {\n            if (true) {\n              _this.logger.log(\"Unable to load image\", e);\n            }\n          });\n        }\n      }\n    }\n  }, {\n    key: \"inlineFonts\",\n    value: function inlineFonts(document) {\n      var _this2 = this;\n\n      return Promise.all(Array.from(document.styleSheets).map(function (sheet) {\n        if (sheet.href) {\n          return fetch(sheet.href).then(function (res) {\n            return res.text();\n          }).then(function (text) {\n            return createStyleSheetFontsFromText(text, sheet.href);\n          }).catch(function (e) {\n            if (true) {\n              _this2.logger.log(\"Unable to load stylesheet\", e);\n            }\n\n            return [];\n          });\n        }\n\n        return getSheetFonts(sheet, document);\n      })).then(function (fonts) {\n        return fonts.reduce(function (acc, font) {\n          return acc.concat(font);\n        }, []);\n      }).then(function (fonts) {\n        return Promise.all(fonts.map(function (font) {\n          return fetch(font.formats[0].src).then(function (response) {\n            return response.blob();\n          }).then(function (blob) {\n            return new Promise(function (resolve, reject) {\n              var reader = new FileReader();\n              reader.onerror = reject;\n\n              reader.onload = function () {\n                // $FlowFixMe\n                var result = reader.result;\n                resolve(result);\n              };\n\n              reader.readAsDataURL(blob);\n            });\n          }).then(function (dataUri) {\n            font.fontFace.setProperty('src', \"url(\\\"\".concat(dataUri, \"\\\")\"));\n            return \"@font-face {\".concat(font.fontFace.cssText, \" \");\n          });\n        }));\n      }).then(function (fontCss) {\n        var style = document.createElement('style');\n        style.textContent = fontCss.join('\\n');\n\n        _this2.documentElement.appendChild(style);\n      });\n    }\n  }, {\n    key: \"createElementClone\",\n    value: function createElementClone(node) {\n      var _this3 = this;\n\n      if (this.copyStyles && node instanceof HTMLCanvasElement) {\n        var img = node.ownerDocument.createElement('img');\n\n        try {\n          img.src = node.toDataURL();\n          return img;\n        } catch (e) {\n          if (true) {\n            this.logger.log(\"Unable to clone canvas contents, canvas is tainted\");\n          }\n        }\n      }\n\n      if (node instanceof HTMLIFrameElement) {\n        var tempIframe = node.cloneNode(false);\n        var iframeKey = generateIframeKey();\n        tempIframe.setAttribute('data-html2canvas-internal-iframe-key', iframeKey);\n\n        var _parseBounds = Object(_Bounds__WEBPACK_IMPORTED_MODULE_0__[\"parseBounds\"])(node, 0, 0),\n            width = _parseBounds.width,\n            height = _parseBounds.height;\n\n        this.resourceLoader.cache[iframeKey] = getIframeDocumentElement(node, this.options).then(function (documentElement) {\n          return _this3.renderer(documentElement, {\n            allowTaint: _this3.options.allowTaint,\n            backgroundColor: '#ffffff',\n            canvas: null,\n            imageTimeout: _this3.options.imageTimeout,\n            logging: _this3.options.logging,\n            proxy: _this3.options.proxy,\n            removeContainer: _this3.options.removeContainer,\n            scale: _this3.options.scale,\n            foreignObjectRendering: _this3.options.foreignObjectRendering,\n            useCORS: _this3.options.useCORS,\n            target: new _renderer_CanvasRenderer__WEBPACK_IMPORTED_MODULE_5__[\"default\"](),\n            width: width,\n            height: height,\n            x: 0,\n            y: 0,\n            windowWidth: documentElement.ownerDocument.defaultView.innerWidth,\n            windowHeight: documentElement.ownerDocument.defaultView.innerHeight,\n            scrollX: documentElement.ownerDocument.defaultView.pageXOffset,\n            scrollY: documentElement.ownerDocument.defaultView.pageYOffset\n          }, _this3.logger.child(iframeKey));\n        }).then(function (canvas) {\n          return new Promise(function (resolve, reject) {\n            var iframeCanvas = document.createElement('img');\n\n            iframeCanvas.onload = function () {\n              return resolve(canvas);\n            };\n\n            iframeCanvas.onerror = function (event) {\n              // Empty iframes may result in empty \"data:,\" URLs, which are invalid from the <img>'s point of view\n              // and instead of `onload` cause `onerror` and unhandled rejection warnings\n              // https://github.com/niklasvh/html2canvas/issues/1502\n              iframeCanvas.src == 'data:,' ? resolve(canvas) : reject(event);\n            };\n\n            iframeCanvas.src = canvas.toDataURL();\n\n            if (tempIframe.parentNode) {\n              tempIframe.parentNode.replaceChild(Object(_Util__WEBPACK_IMPORTED_MODULE_3__[\"copyCSSStyles\"])(node.ownerDocument.defaultView.getComputedStyle(node), iframeCanvas), tempIframe);\n            }\n          });\n        });\n        return tempIframe;\n      }\n\n      try {\n        if (node instanceof HTMLStyleElement && node.sheet && node.sheet.cssRules) {\n          var css = [].slice.call(node.sheet.cssRules, 0).reduce(function (css, rule) {\n            if (rule && rule.cssText) {\n              return css + rule.cssText;\n            }\n\n            return css;\n          }, '');\n          var style = node.cloneNode(false);\n          style.textContent = css;\n          return style;\n        }\n      } catch (e) {\n        // accessing node.sheet.cssRules throws a DOMException\n        this.logger.log('Unable to access cssRules property');\n\n        if (e.name !== 'SecurityError') {\n          this.logger.log(e);\n          throw e;\n        }\n      }\n\n      return node.cloneNode(false);\n    }\n  }, {\n    key: \"cloneNode\",\n    value: function cloneNode(node) {\n      var clone = node.nodeType === Node.TEXT_NODE ? document.createTextNode(node.nodeValue) : this.createElementClone(node);\n      var window = node.ownerDocument.defaultView;\n      var style = node instanceof window.HTMLElement ? window.getComputedStyle(node) : null;\n      var styleBefore = node instanceof window.HTMLElement ? window.getComputedStyle(node, ':before') : null;\n      var styleAfter = node instanceof window.HTMLElement ? window.getComputedStyle(node, ':after') : null;\n\n      if (this.referenceElement === node && clone instanceof window.HTMLElement) {\n        this.clonedReferenceElement = clone;\n      }\n\n      if (clone instanceof window.HTMLBodyElement) {\n        createPseudoHideStyles(clone);\n      }\n\n      var counters = Object(_PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__[\"parseCounterReset\"])(style, this.pseudoContentData);\n      var contentBefore = Object(_PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__[\"resolvePseudoContent\"])(node, styleBefore, this.pseudoContentData);\n\n      for (var child = node.firstChild; child; child = child.nextSibling) {\n        if (child.nodeType !== Node.ELEMENT_NODE || child.nodeName !== 'SCRIPT' && // $FlowFixMe\n        !child.hasAttribute(IGNORE_ATTRIBUTE) && (typeof this.options.ignoreElements !== 'function' || // $FlowFixMe\n        !this.options.ignoreElements(child))) {\n          if (!this.copyStyles || child.nodeName !== 'STYLE') {\n            clone.appendChild(this.cloneNode(child));\n          }\n        }\n      }\n\n      var contentAfter = Object(_PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__[\"resolvePseudoContent\"])(node, styleAfter, this.pseudoContentData);\n      Object(_PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__[\"popCounters\"])(counters, this.pseudoContentData);\n\n      if (node instanceof window.HTMLElement && clone instanceof window.HTMLElement) {\n        if (styleBefore) {\n          this.inlineAllImages(inlinePseudoElement(node, clone, styleBefore, contentBefore, PSEUDO_BEFORE));\n        }\n\n        if (styleAfter) {\n          this.inlineAllImages(inlinePseudoElement(node, clone, styleAfter, contentAfter, PSEUDO_AFTER));\n        }\n\n        if (style && this.copyStyles && !(node instanceof HTMLIFrameElement)) {\n          Object(_Util__WEBPACK_IMPORTED_MODULE_3__[\"copyCSSStyles\"])(style, clone);\n        }\n\n        this.inlineAllImages(clone);\n\n        if (node.scrollTop !== 0 || node.scrollLeft !== 0) {\n          this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);\n        }\n\n        switch (node.nodeName) {\n          case 'CANVAS':\n            if (!this.copyStyles) {\n              cloneCanvasContents(node, clone);\n            }\n\n            break;\n\n          case 'TEXTAREA':\n          case 'SELECT':\n            clone.value = node.value;\n            break;\n        }\n      }\n\n      return clone;\n    }\n  }]);\n\n  return DocumentCloner;\n}();\n\nvar getSheetFonts = function getSheetFonts(sheet, document) {\n  // $FlowFixMe\n  return (sheet.cssRules ? Array.from(sheet.cssRules) : []).filter(function (rule) {\n    return rule.type === CSSRule.FONT_FACE_RULE;\n  }).map(function (rule) {\n    var src = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"parseBackgroundImage\"])(rule.style.getPropertyValue('src'));\n    var formats = [];\n\n    for (var i = 0; i < src.length; i++) {\n      if (src[i].method === 'url' && src[i + 1] && src[i + 1].method === 'format') {\n        var a = document.createElement('a');\n        a.href = src[i].args[0];\n\n        if (document.body) {\n          document.body.appendChild(a);\n        }\n\n        var font = {\n          src: a.href,\n          format: src[i + 1].args[0]\n        };\n        formats.push(font);\n      }\n    }\n\n    return {\n      // TODO select correct format for browser),\n      formats: formats.filter(function (font) {\n        return /^woff/i.test(font.format);\n      }),\n      fontFace: rule.style\n    };\n  }).filter(function (font) {\n    return font.formats.length;\n  });\n};\n\nvar createStyleSheetFontsFromText = function createStyleSheetFontsFromText(text, baseHref) {\n  var doc = document.implementation.createHTMLDocument('');\n  var base = document.createElement('base'); // $FlowFixMe\n\n  base.href = baseHref;\n  var style = document.createElement('style');\n  style.textContent = text;\n\n  if (doc.head) {\n    doc.head.appendChild(base);\n  }\n\n  if (doc.body) {\n    doc.body.appendChild(style);\n  }\n\n  return style.sheet ? getSheetFonts(style.sheet, doc) : [];\n};\n\nvar restoreOwnerScroll = function restoreOwnerScroll(ownerDocument, x, y) {\n  if (ownerDocument.defaultView && (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {\n    ownerDocument.defaultView.scrollTo(x, y);\n  }\n};\n\nvar cloneCanvasContents = function cloneCanvasContents(canvas, clonedCanvas) {\n  try {\n    if (clonedCanvas) {\n      clonedCanvas.width = canvas.width;\n      clonedCanvas.height = canvas.height;\n      var ctx = canvas.getContext('2d');\n      var clonedCtx = clonedCanvas.getContext('2d');\n\n      if (ctx) {\n        clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);\n      } else {\n        clonedCtx.drawImage(canvas, 0, 0);\n      }\n    }\n  } catch (e) {}\n};\n\nvar inlinePseudoElement = function inlinePseudoElement(node, clone, style, contentItems, pseudoElt) {\n  if (!style || !style.content || style.content === 'none' || style.content === '-moz-alt-content' || style.display === 'none') {\n    return;\n  }\n\n  var anonymousReplacedElement = clone.ownerDocument.createElement('html2canvaspseudoelement');\n  Object(_Util__WEBPACK_IMPORTED_MODULE_3__[\"copyCSSStyles\"])(style, anonymousReplacedElement);\n\n  if (contentItems) {\n    var len = contentItems.length;\n\n    for (var i = 0; i < len; i++) {\n      var item = contentItems[i];\n\n      switch (item.type) {\n        case _PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__[\"PSEUDO_CONTENT_ITEM_TYPE\"].IMAGE:\n          var img = clone.ownerDocument.createElement('img');\n          img.src = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"parseBackgroundImage\"])(\"url(\".concat(item.value, \")\"))[0].args[0];\n          img.style.opacity = '1';\n          anonymousReplacedElement.appendChild(img);\n          break;\n\n        case _PseudoNodeContent__WEBPACK_IMPORTED_MODULE_6__[\"PSEUDO_CONTENT_ITEM_TYPE\"].TEXT:\n          anonymousReplacedElement.appendChild(clone.ownerDocument.createTextNode(item.value));\n          break;\n      }\n    }\n  }\n\n  anonymousReplacedElement.className = \"\".concat(PSEUDO_HIDE_ELEMENT_CLASS_BEFORE, \" \").concat(PSEUDO_HIDE_ELEMENT_CLASS_AFTER);\n  clone.className += pseudoElt === PSEUDO_BEFORE ? \" \".concat(PSEUDO_HIDE_ELEMENT_CLASS_BEFORE) : \" \".concat(PSEUDO_HIDE_ELEMENT_CLASS_AFTER);\n\n  if (pseudoElt === PSEUDO_BEFORE) {\n    clone.insertBefore(anonymousReplacedElement, clone.firstChild);\n  } else {\n    clone.appendChild(anonymousReplacedElement);\n  }\n\n  return anonymousReplacedElement;\n};\n\nvar URL_REGEXP = /^url\\((.+)\\)$/i;\nvar PSEUDO_BEFORE = ':before';\nvar PSEUDO_AFTER = ':after';\nvar PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';\nvar PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';\nvar PSEUDO_HIDE_ELEMENT_STYLE = \"{\\n    content: \\\"\\\" !important;\\n    display: none !important;\\n}\";\n\nvar createPseudoHideStyles = function createPseudoHideStyles(body) {\n  createStyles(body, \".\".concat(PSEUDO_HIDE_ELEMENT_CLASS_BEFORE).concat(PSEUDO_BEFORE).concat(PSEUDO_HIDE_ELEMENT_STYLE, \"\\n         .\").concat(PSEUDO_HIDE_ELEMENT_CLASS_AFTER).concat(PSEUDO_AFTER).concat(PSEUDO_HIDE_ELEMENT_STYLE));\n};\n\nvar createStyles = function createStyles(body, styles) {\n  var style = body.ownerDocument.createElement('style');\n  style.innerHTML = styles;\n  body.appendChild(style);\n};\n\nvar initNode = function initNode(_ref) {\n  var _ref2 = _slicedToArray(_ref, 3),\n      element = _ref2[0],\n      x = _ref2[1],\n      y = _ref2[2];\n\n  element.scrollLeft = x;\n  element.scrollTop = y;\n};\n\nvar generateIframeKey = function generateIframeKey() {\n  return Math.ceil(Date.now() + Math.random() * 10000000).toString(16);\n};\n\nvar DATA_URI_REGEXP = /^data:text\\/(.+);(base64)?,(.*)$/i;\n\nvar getIframeDocumentElement = function getIframeDocumentElement(node, options) {\n  try {\n    return Promise.resolve(node.contentWindow.document.documentElement);\n  } catch (e) {\n    return options.proxy ? Object(_Proxy__WEBPACK_IMPORTED_MODULE_1__[\"Proxy\"])(node.src, options).then(function (html) {\n      var match = html.match(DATA_URI_REGEXP);\n\n      if (!match) {\n        return Promise.reject();\n      }\n\n      return match[2] === 'base64' ? window.atob(decodeURIComponent(match[3])) : decodeURIComponent(match[3]);\n    }).then(function (html) {\n      return createIframeContainer(node.ownerDocument, Object(_Bounds__WEBPACK_IMPORTED_MODULE_0__[\"parseBounds\"])(node, 0, 0)).then(function (cloneIframeContainer) {\n        var cloneWindow = cloneIframeContainer.contentWindow;\n        var documentClone = cloneWindow.document;\n        documentClone.open();\n        documentClone.write(html);\n        var iframeLoad = iframeLoader(cloneIframeContainer).then(function () {\n          return documentClone.documentElement;\n        });\n        documentClone.close();\n        return iframeLoad;\n      });\n    }) : Promise.reject();\n  }\n};\n\nvar createIframeContainer = function createIframeContainer(ownerDocument, bounds) {\n  var cloneIframeContainer = ownerDocument.createElement('iframe');\n  cloneIframeContainer.className = 'html2canvas-container';\n  cloneIframeContainer.style.visibility = 'hidden';\n  cloneIframeContainer.style.position = 'fixed';\n  cloneIframeContainer.style.left = '-10000px';\n  cloneIframeContainer.style.top = '0px';\n  cloneIframeContainer.style.border = '0';\n  cloneIframeContainer.width = bounds.width.toString();\n  cloneIframeContainer.height = bounds.height.toString();\n  cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it\n\n  cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');\n\n  if (!ownerDocument.body) {\n    return Promise.reject( true ? \"Body element not found in Document that is getting rendered\" : undefined);\n  }\n\n  ownerDocument.body.appendChild(cloneIframeContainer);\n  return Promise.resolve(cloneIframeContainer);\n};\n\nvar iframeLoader = function iframeLoader(cloneIframeContainer) {\n  var cloneWindow = cloneIframeContainer.contentWindow;\n  var documentClone = cloneWindow.document;\n  return new Promise(function (resolve, reject) {\n    cloneWindow.onload = cloneIframeContainer.onload = documentClone.onreadystatechange = function () {\n      var interval = setInterval(function () {\n        if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {\n          clearInterval(interval);\n          resolve(cloneIframeContainer);\n        }\n      }, 50);\n    };\n  });\n};\n\nvar cloneWindow = function cloneWindow(ownerDocument, bounds, referenceElement, options, logger, renderer) {\n  var cloner = new DocumentCloner(referenceElement, options, logger, false, renderer);\n  var scrollX = ownerDocument.defaultView.pageXOffset;\n  var scrollY = ownerDocument.defaultView.pageYOffset;\n  return createIframeContainer(ownerDocument, bounds).then(function (cloneIframeContainer) {\n    var cloneWindow = cloneIframeContainer.contentWindow;\n    var documentClone = cloneWindow.document;\n    /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle\n         if window url is about:blank, we can assign the url to current by writing onto the document\n         */\n\n    var iframeLoad = iframeLoader(cloneIframeContainer).then(function () {\n      cloner.scrolledElements.forEach(initNode);\n      cloneWindow.scrollTo(bounds.left, bounds.top);\n\n      if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && (cloneWindow.scrollY !== bounds.top || cloneWindow.scrollX !== bounds.left)) {\n        documentClone.documentElement.style.top = -bounds.top + 'px';\n        documentClone.documentElement.style.left = -bounds.left + 'px';\n        documentClone.documentElement.style.position = 'absolute';\n      }\n\n      var result = Promise.resolve([cloneIframeContainer, cloner.clonedReferenceElement, cloner.resourceLoader]);\n      var onclone = options.onclone;\n      return cloner.clonedReferenceElement instanceof cloneWindow.HTMLElement || cloner.clonedReferenceElement instanceof ownerDocument.defaultView.HTMLElement || cloner.clonedReferenceElement instanceof HTMLElement ? typeof onclone === 'function' ? Promise.resolve().then(function () {\n        return onclone(documentClone);\n      }).then(function () {\n        return result;\n      }) : result : Promise.reject( true ? \"Error finding the \".concat(referenceElement.nodeName, \" in the cloned document\") : undefined);\n    });\n    documentClone.open();\n    documentClone.write(\"\".concat(serializeDoctype(document.doctype), \"<html></html>\")); // Chrome scrolls the parent document for some reason after the write to the cloned window???\n\n    restoreOwnerScroll(referenceElement.ownerDocument, scrollX, scrollY);\n    documentClone.replaceChild(documentClone.adoptNode(cloner.documentElement), documentClone.documentElement);\n    documentClone.close();\n    return iframeLoad;\n  });\n};\n\nvar serializeDoctype = function serializeDoctype(doctype) {\n  var str = '';\n\n  if (doctype) {\n    str += '<!DOCTYPE ';\n\n    if (doctype.name) {\n      str += doctype.name;\n    }\n\n    if (doctype.internalSubset) {\n      str += doctype.internalSubset;\n    }\n\n    if (doctype.publicId) {\n      str += \"\\\"\".concat(doctype.publicId, \"\\\"\");\n    }\n\n    if (doctype.systemId) {\n      str += \"\\\"\".concat(doctype.systemId, \"\\\"\");\n    }\n\n    str += '>';\n  }\n\n  return str;\n};\n\n//# sourceURL=webpack://html2canvas/./src/Clone.js?");

/***/ }),

/***/ "./src/Color.js":
/*!**********************!*\
  !*** ./src/Color.js ***!
  \**********************/
/*! exports provided: default, TRANSPARENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Color; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TRANSPARENT\", function() { return TRANSPARENT; });\n // http://dev.w3.org/csswg/css-color/\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar HEX3 = /^#([a-f0-9]{3})$/i;\n\nvar hex3 = function hex3(value) {\n  var match = value.match(HEX3);\n\n  if (match) {\n    return [parseInt(match[1][0] + match[1][0], 16), parseInt(match[1][1] + match[1][1], 16), parseInt(match[1][2] + match[1][2], 16), null];\n  }\n\n  return false;\n};\n\nvar HEX6 = /^#([a-f0-9]{6})$/i;\n\nvar hex6 = function hex6(value) {\n  var match = value.match(HEX6);\n\n  if (match) {\n    return [parseInt(match[1].substring(0, 2), 16), parseInt(match[1].substring(2, 4), 16), parseInt(match[1].substring(4, 6), 16), null];\n  }\n\n  return false;\n};\n\nvar RGB = /^rgb\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*\\)$/;\n\nvar rgb = function rgb(value) {\n  var match = value.match(RGB);\n\n  if (match) {\n    return [Number(match[1]), Number(match[2]), Number(match[3]), null];\n  }\n\n  return false;\n};\n\nvar RGBA = /^rgba\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d?\\.?\\d+)\\s*\\)$/;\n\nvar rgba = function rgba(value) {\n  var match = value.match(RGBA);\n\n  if (match && match.length > 4) {\n    return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];\n  }\n\n  return false;\n};\n\nvar fromArray = function fromArray(array) {\n  return [Math.min(array[0], 255), Math.min(array[1], 255), Math.min(array[2], 255), array.length > 3 ? array[3] : null];\n};\n\nvar namedColor = function namedColor(name) {\n  var color = NAMED_COLORS[name.toLowerCase()];\n  return color ? color : false;\n};\n\nvar Color =\n/*#__PURE__*/\nfunction () {\n  function Color(value) {\n    _classCallCheck(this, Color);\n\n    var _ref = Array.isArray(value) ? fromArray(value) : hex3(value) || rgb(value) || rgba(value) || namedColor(value) || hex6(value) || [0, 0, 0, null],\n        _ref2 = _slicedToArray(_ref, 4),\n        r = _ref2[0],\n        g = _ref2[1],\n        b = _ref2[2],\n        a = _ref2[3];\n\n    this.r = r;\n    this.g = g;\n    this.b = b;\n    this.a = a;\n  }\n\n  _createClass(Color, [{\n    key: \"isTransparent\",\n    value: function isTransparent() {\n      return this.a === 0;\n    }\n  }, {\n    key: \"toString\",\n    value: function toString() {\n      return this.a !== null && this.a !== 1 ? \"rgba(\".concat(this.r, \",\").concat(this.g, \",\").concat(this.b, \",\").concat(this.a, \")\") : \"rgb(\".concat(this.r, \",\").concat(this.g, \",\").concat(this.b, \")\");\n    }\n  }]);\n\n  return Color;\n}();\n\n\nvar NAMED_COLORS = {\n  transparent: [0, 0, 0, 0],\n  aliceblue: [240, 248, 255, null],\n  antiquewhite: [250, 235, 215, null],\n  aqua: [0, 255, 255, null],\n  aquamarine: [127, 255, 212, null],\n  azure: [240, 255, 255, null],\n  beige: [245, 245, 220, null],\n  bisque: [255, 228, 196, null],\n  black: [0, 0, 0, null],\n  blanchedalmond: [255, 235, 205, null],\n  blue: [0, 0, 255, null],\n  blueviolet: [138, 43, 226, null],\n  brown: [165, 42, 42, null],\n  burlywood: [222, 184, 135, null],\n  cadetblue: [95, 158, 160, null],\n  chartreuse: [127, 255, 0, null],\n  chocolate: [210, 105, 30, null],\n  coral: [255, 127, 80, null],\n  cornflowerblue: [100, 149, 237, null],\n  cornsilk: [255, 248, 220, null],\n  crimson: [220, 20, 60, null],\n  cyan: [0, 255, 255, null],\n  darkblue: [0, 0, 139, null],\n  darkcyan: [0, 139, 139, null],\n  darkgoldenrod: [184, 134, 11, null],\n  darkgray: [169, 169, 169, null],\n  darkgreen: [0, 100, 0, null],\n  darkgrey: [169, 169, 169, null],\n  darkkhaki: [189, 183, 107, null],\n  darkmagenta: [139, 0, 139, null],\n  darkolivegreen: [85, 107, 47, null],\n  darkorange: [255, 140, 0, null],\n  darkorchid: [153, 50, 204, null],\n  darkred: [139, 0, 0, null],\n  darksalmon: [233, 150, 122, null],\n  darkseagreen: [143, 188, 143, null],\n  darkslateblue: [72, 61, 139, null],\n  darkslategray: [47, 79, 79, null],\n  darkslategrey: [47, 79, 79, null],\n  darkturquoise: [0, 206, 209, null],\n  darkviolet: [148, 0, 211, null],\n  deeppink: [255, 20, 147, null],\n  deepskyblue: [0, 191, 255, null],\n  dimgray: [105, 105, 105, null],\n  dimgrey: [105, 105, 105, null],\n  dodgerblue: [30, 144, 255, null],\n  firebrick: [178, 34, 34, null],\n  floralwhite: [255, 250, 240, null],\n  forestgreen: [34, 139, 34, null],\n  fuchsia: [255, 0, 255, null],\n  gainsboro: [220, 220, 220, null],\n  ghostwhite: [248, 248, 255, null],\n  gold: [255, 215, 0, null],\n  goldenrod: [218, 165, 32, null],\n  gray: [128, 128, 128, null],\n  green: [0, 128, 0, null],\n  greenyellow: [173, 255, 47, null],\n  grey: [128, 128, 128, null],\n  honeydew: [240, 255, 240, null],\n  hotpink: [255, 105, 180, null],\n  indianred: [205, 92, 92, null],\n  indigo: [75, 0, 130, null],\n  ivory: [255, 255, 240, null],\n  khaki: [240, 230, 140, null],\n  lavender: [230, 230, 250, null],\n  lavenderblush: [255, 240, 245, null],\n  lawngreen: [124, 252, 0, null],\n  lemonchiffon: [255, 250, 205, null],\n  lightblue: [173, 216, 230, null],\n  lightcoral: [240, 128, 128, null],\n  lightcyan: [224, 255, 255, null],\n  lightgoldenrodyellow: [250, 250, 210, null],\n  lightgray: [211, 211, 211, null],\n  lightgreen: [144, 238, 144, null],\n  lightgrey: [211, 211, 211, null],\n  lightpink: [255, 182, 193, null],\n  lightsalmon: [255, 160, 122, null],\n  lightseagreen: [32, 178, 170, null],\n  lightskyblue: [135, 206, 250, null],\n  lightslategray: [119, 136, 153, null],\n  lightslategrey: [119, 136, 153, null],\n  lightsteelblue: [176, 196, 222, null],\n  lightyellow: [255, 255, 224, null],\n  lime: [0, 255, 0, null],\n  limegreen: [50, 205, 50, null],\n  linen: [250, 240, 230, null],\n  magenta: [255, 0, 255, null],\n  maroon: [128, 0, 0, null],\n  mediumaquamarine: [102, 205, 170, null],\n  mediumblue: [0, 0, 205, null],\n  mediumorchid: [186, 85, 211, null],\n  mediumpurple: [147, 112, 219, null],\n  mediumseagreen: [60, 179, 113, null],\n  mediumslateblue: [123, 104, 238, null],\n  mediumspringgreen: [0, 250, 154, null],\n  mediumturquoise: [72, 209, 204, null],\n  mediumvioletred: [199, 21, 133, null],\n  midnightblue: [25, 25, 112, null],\n  mintcream: [245, 255, 250, null],\n  mistyrose: [255, 228, 225, null],\n  moccasin: [255, 228, 181, null],\n  navajowhite: [255, 222, 173, null],\n  navy: [0, 0, 128, null],\n  oldlace: [253, 245, 230, null],\n  olive: [128, 128, 0, null],\n  olivedrab: [107, 142, 35, null],\n  orange: [255, 165, 0, null],\n  orangered: [255, 69, 0, null],\n  orchid: [218, 112, 214, null],\n  palegoldenrod: [238, 232, 170, null],\n  palegreen: [152, 251, 152, null],\n  paleturquoise: [175, 238, 238, null],\n  palevioletred: [219, 112, 147, null],\n  papayawhip: [255, 239, 213, null],\n  peachpuff: [255, 218, 185, null],\n  peru: [205, 133, 63, null],\n  pink: [255, 192, 203, null],\n  plum: [221, 160, 221, null],\n  powderblue: [176, 224, 230, null],\n  purple: [128, 0, 128, null],\n  rebeccapurple: [102, 51, 153, null],\n  red: [255, 0, 0, null],\n  rosybrown: [188, 143, 143, null],\n  royalblue: [65, 105, 225, null],\n  saddlebrown: [139, 69, 19, null],\n  salmon: [250, 128, 114, null],\n  sandybrown: [244, 164, 96, null],\n  seagreen: [46, 139, 87, null],\n  seashell: [255, 245, 238, null],\n  sienna: [160, 82, 45, null],\n  silver: [192, 192, 192, null],\n  skyblue: [135, 206, 235, null],\n  slateblue: [106, 90, 205, null],\n  slategray: [112, 128, 144, null],\n  slategrey: [112, 128, 144, null],\n  snow: [255, 250, 250, null],\n  springgreen: [0, 255, 127, null],\n  steelblue: [70, 130, 180, null],\n  tan: [210, 180, 140, null],\n  teal: [0, 128, 128, null],\n  thistle: [216, 191, 216, null],\n  tomato: [255, 99, 71, null],\n  turquoise: [64, 224, 208, null],\n  violet: [238, 130, 238, null],\n  wheat: [245, 222, 179, null],\n  white: [255, 255, 255, null],\n  whitesmoke: [245, 245, 245, null],\n  yellow: [255, 255, 0, null],\n  yellowgreen: [154, 205, 50, null]\n};\nvar TRANSPARENT = new Color([0, 0, 0, 0]);\n\n//# sourceURL=webpack://html2canvas/./src/Color.js?");

/***/ }),

/***/ "./src/Feature.js":
/*!************************!*\
  !*** ./src/Feature.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./renderer/ForeignObjectRenderer */ \"./src/renderer/ForeignObjectRenderer.js\");\n\n\n\n\nvar testRangeBounds = function testRangeBounds(document) {\n  var TEST_HEIGHT = 123;\n\n  if (document.createRange) {\n    var range = document.createRange();\n\n    if (range.getBoundingClientRect) {\n      var testElement = document.createElement('boundtest');\n      testElement.style.height = \"\".concat(TEST_HEIGHT, \"px\");\n      testElement.style.display = 'block';\n      document.body.appendChild(testElement);\n      range.selectNode(testElement);\n      var rangeBounds = range.getBoundingClientRect();\n      var rangeHeight = Math.round(rangeBounds.height);\n      document.body.removeChild(testElement);\n\n      if (rangeHeight === TEST_HEIGHT) {\n        return true;\n      }\n    }\n  }\n\n  return false;\n};\n\nvar testCORS = function testCORS() {\n  return typeof new Image().crossOrigin !== 'undefined';\n};\n\nvar testResponseType = function testResponseType() {\n  return typeof new XMLHttpRequest().responseType === 'string';\n};\n\nvar testSVG = function testSVG(document) {\n  var img = new Image();\n  var canvas = document.createElement('canvas');\n  var ctx = canvas.getContext('2d');\n  img.src = \"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>\";\n\n  try {\n    ctx.drawImage(img, 0, 0);\n    canvas.toDataURL();\n  } catch (e) {\n    return false;\n  }\n\n  return true;\n};\n\nvar isGreenPixel = function isGreenPixel(data) {\n  return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;\n};\n\nvar testForeignObject = function testForeignObject(document) {\n  var canvas = document.createElement('canvas');\n  var size = 100;\n  canvas.width = size;\n  canvas.height = size;\n  var ctx = canvas.getContext('2d');\n  ctx.fillStyle = 'rgb(0, 255, 0)';\n  ctx.fillRect(0, 0, size, size);\n  var img = new Image();\n  var greenImageSrc = canvas.toDataURL();\n  img.src = greenImageSrc;\n  var svg = Object(_renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_0__[\"createForeignObjectSVG\"])(size, size, 0, 0, img);\n  ctx.fillStyle = 'red';\n  ctx.fillRect(0, 0, size, size);\n  return Object(_renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_0__[\"loadSerializedSVG\"])(svg).then(function (img) {\n    ctx.drawImage(img, 0, 0);\n    var data = ctx.getImageData(0, 0, size, size).data;\n    ctx.fillStyle = 'red';\n    ctx.fillRect(0, 0, size, size);\n    var node = document.createElement('div');\n    node.style.backgroundImage = \"url(\".concat(greenImageSrc, \")\");\n    node.style.height = \"\".concat(size, \"px\"); // Firefox 55 does not render inline <img /> tags\n\n    return isGreenPixel(data) ? Object(_renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_0__[\"loadSerializedSVG\"])(Object(_renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_0__[\"createForeignObjectSVG\"])(size, size, 0, 0, node)) : Promise.reject(false);\n  }).then(function (img) {\n    ctx.drawImage(img, 0, 0); // Edge does not render background-images\n\n    return isGreenPixel(ctx.getImageData(0, 0, size, size).data);\n  }).catch(function (e) {\n    return false;\n  });\n};\n\nvar FEATURES = {\n  // $FlowFixMe - get/set properties not yet supported\n  get SUPPORT_RANGE_BOUNDS() {\n    'use strict';\n\n    var value = testRangeBounds(document);\n    Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', {\n      value: value\n    });\n    return value;\n  },\n\n  // $FlowFixMe - get/set properties not yet supported\n  get SUPPORT_SVG_DRAWING() {\n    'use strict';\n\n    var value = testSVG(document);\n    Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', {\n      value: value\n    });\n    return value;\n  },\n\n  // $FlowFixMe - get/set properties not yet supported\n  get SUPPORT_FOREIGNOBJECT_DRAWING() {\n    'use strict';\n\n    var value = typeof Array.from === 'function' && typeof window.fetch === 'function' ? testForeignObject(document) : Promise.resolve(false);\n    Object.defineProperty(FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', {\n      value: value\n    });\n    return value;\n  },\n\n  // $FlowFixMe - get/set properties not yet supported\n  get SUPPORT_CORS_IMAGES() {\n    'use strict';\n\n    var value = testCORS();\n    Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', {\n      value: value\n    });\n    return value;\n  },\n\n  // $FlowFixMe - get/set properties not yet supported\n  get SUPPORT_RESPONSE_TYPE() {\n    'use strict';\n\n    var value = testResponseType();\n    Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', {\n      value: value\n    });\n    return value;\n  },\n\n  // $FlowFixMe - get/set properties not yet supported\n  get SUPPORT_CORS_XHR() {\n    'use strict';\n\n    var value = 'withCredentials' in new XMLHttpRequest();\n    Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', {\n      value: value\n    });\n    return value;\n  }\n\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (FEATURES);\n\n//# sourceURL=webpack://html2canvas/./src/Feature.js?");

/***/ }),

/***/ "./src/Font.js":
/*!*********************!*\
  !*** ./src/Font.js ***!
  \*********************/
/*! exports provided: FontMetrics */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FontMetrics\", function() { return FontMetrics; });\n/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Util */ \"./src/Util.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar SAMPLE_TEXT = 'Hidden Text';\n\nvar FontMetrics =\n/*#__PURE__*/\nfunction () {\n  function FontMetrics(document) {\n    _classCallCheck(this, FontMetrics);\n\n    this._data = {};\n    this._document = document;\n  }\n\n  _createClass(FontMetrics, [{\n    key: \"_parseMetrics\",\n    value: function _parseMetrics(font) {\n      var container = this._document.createElement('div');\n\n      var img = this._document.createElement('img');\n\n      var span = this._document.createElement('span');\n\n      var body = this._document.body;\n\n      if (!body) {\n        throw new Error( true ? 'No document found for font metrics' : undefined);\n      }\n\n      container.style.visibility = 'hidden';\n      container.style.fontFamily = font.fontFamily;\n      container.style.fontSize = font.fontSize;\n      container.style.margin = '0';\n      container.style.padding = '0';\n      body.appendChild(container);\n      img.src = _Util__WEBPACK_IMPORTED_MODULE_0__[\"SMALL_IMAGE\"];\n      img.width = 1;\n      img.height = 1;\n      img.style.margin = '0';\n      img.style.padding = '0';\n      img.style.verticalAlign = 'baseline';\n      span.style.fontFamily = font.fontFamily;\n      span.style.fontSize = font.fontSize;\n      span.style.margin = '0';\n      span.style.padding = '0';\n      span.appendChild(this._document.createTextNode(SAMPLE_TEXT));\n      container.appendChild(span);\n      container.appendChild(img);\n      var baseline = img.offsetTop - span.offsetTop + 2;\n      container.removeChild(span);\n      container.appendChild(this._document.createTextNode(SAMPLE_TEXT));\n      container.style.lineHeight = 'normal';\n      img.style.verticalAlign = 'super';\n      var middle = img.offsetTop - container.offsetTop + 2;\n      body.removeChild(container);\n      return {\n        baseline: baseline,\n        middle: middle\n      };\n    }\n  }, {\n    key: \"getMetrics\",\n    value: function getMetrics(font) {\n      var key = \"\".concat(font.fontFamily, \" \").concat(font.fontSize);\n\n      if (this._data[key] === undefined) {\n        this._data[key] = this._parseMetrics(font);\n      }\n\n      return this._data[key];\n    }\n  }]);\n\n  return FontMetrics;\n}();\n\n//# sourceURL=webpack://html2canvas/./src/Font.js?");

/***/ }),

/***/ "./src/Gradient.js":
/*!*************************!*\
  !*** ./src/Gradient.js ***!
  \*************************/
/*! exports provided: GRADIENT_TYPE, RADIAL_GRADIENT_SHAPE, LinearGradient, RadialGradient, parseGradient, transformWebkitRadialGradientArgs */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GRADIENT_TYPE\", function() { return GRADIENT_TYPE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"RADIAL_GRADIENT_SHAPE\", function() { return RADIAL_GRADIENT_SHAPE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LinearGradient\", function() { return LinearGradient; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"RadialGradient\", function() { return RadialGradient; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseGradient\", function() { return parseGradient; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"transformWebkitRadialGradientArgs\", function() { return transformWebkitRadialGradientArgs; });\n/* harmony import */ var _NodeContainer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NodeContainer */ \"./src/NodeContainer.js\");\n/* harmony import */ var _Angle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Angle */ \"./src/Angle.js\");\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Color */ \"./src/Color.js\");\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Length */ \"./src/Length.js\");\n/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Util */ \"./src/Util.js\");\n\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n\n\n\n\n\nvar SIDE_OR_CORNER = /^(to )?(left|top|right|bottom)( (left|top|right|bottom))?$/i;\nvar PERCENTAGE_ANGLES = /^([+-]?\\d*\\.?\\d+)% ([+-]?\\d*\\.?\\d+)%$/i;\nvar ENDS_WITH_LENGTH = /(px)|%|( 0)$/i;\nvar FROM_TO_COLORSTOP = /^(from|to|color-stop)\\((?:([\\d.]+)(%)?,\\s*)?(.+?)\\)$/i;\nvar RADIAL_SHAPE_DEFINITION = /^\\s*(circle|ellipse)?\\s*((?:([\\d.]+)(px|r?em|%)\\s*(?:([\\d.]+)(px|r?em|%))?)|closest-side|closest-corner|farthest-side|farthest-corner)?\\s*(?:at\\s*(?:(left|center|right)|([\\d.]+)(px|r?em|%))\\s+(?:(top|center|bottom)|([\\d.]+)(px|r?em|%)))?(?:\\s|$)/i;\nvar GRADIENT_TYPE = {\n  LINEAR_GRADIENT: 0,\n  RADIAL_GRADIENT: 1\n};\nvar RADIAL_GRADIENT_SHAPE = {\n  CIRCLE: 0,\n  ELLIPSE: 1\n};\nvar LENGTH_FOR_POSITION = {\n  left: new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('0%'),\n  top: new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('0%'),\n  center: new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('50%'),\n  right: new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('100%'),\n  bottom: new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('100%')\n};\nvar LinearGradient = function LinearGradient(colorStops, direction) {\n  _classCallCheck(this, LinearGradient);\n\n  this.type = GRADIENT_TYPE.LINEAR_GRADIENT;\n  this.colorStops = colorStops;\n  this.direction = direction;\n};\nvar RadialGradient = function RadialGradient(colorStops, shape, center, radius) {\n  _classCallCheck(this, RadialGradient);\n\n  this.type = GRADIENT_TYPE.RADIAL_GRADIENT;\n  this.colorStops = colorStops;\n  this.shape = shape;\n  this.center = center;\n  this.radius = radius;\n};\nvar parseGradient = function parseGradient(container, _ref, bounds) {\n  var args = _ref.args,\n      method = _ref.method,\n      prefix = _ref.prefix;\n\n  if (method === 'linear-gradient') {\n    return parseLinearGradient(args, bounds, !!prefix);\n  } else if (method === 'gradient' && args[0] === 'linear') {\n    // TODO handle correct angle\n    return parseLinearGradient(['to bottom'].concat(transformObsoleteColorStops(args.slice(3))), bounds, !!prefix);\n  } else if (method === 'radial-gradient') {\n    return parseRadialGradient(container, prefix === '-webkit-' ? transformWebkitRadialGradientArgs(args) : args, bounds);\n  } else if (method === 'gradient' && args[0] === 'radial') {\n    return parseRadialGradient(container, transformObsoleteColorStops(transformWebkitRadialGradientArgs(args.slice(1))), bounds);\n  }\n};\n\nvar parseColorStops = function parseColorStops(args, firstColorStopIndex, lineLength) {\n  var colorStops = [];\n\n  for (var i = firstColorStopIndex; i < args.length; i++) {\n    var value = args[i];\n    var HAS_LENGTH = ENDS_WITH_LENGTH.test(value);\n    var lastSpaceIndex = value.lastIndexOf(' ');\n    var color = new _Color__WEBPACK_IMPORTED_MODULE_2__[\"default\"](HAS_LENGTH ? value.substring(0, lastSpaceIndex) : value);\n    var stop = HAS_LENGTH ? new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"](value.substring(lastSpaceIndex + 1)) : i === firstColorStopIndex ? new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('0%') : i === args.length - 1 ? new _Length__WEBPACK_IMPORTED_MODULE_3__[\"default\"]('100%') : null;\n    colorStops.push({\n      color: color,\n      stop: stop\n    });\n  }\n\n  var absoluteValuedColorStops = colorStops.map(function (_ref2) {\n    var color = _ref2.color,\n        stop = _ref2.stop;\n    var absoluteStop = lineLength === 0 ? 0 : stop ? stop.getAbsoluteValue(lineLength) / lineLength : null;\n    return {\n      color: color,\n      // $FlowFixMe\n      stop: absoluteStop\n    };\n  });\n  var previousColorStop = absoluteValuedColorStops[0].stop;\n\n  for (var _i = 0; _i < absoluteValuedColorStops.length; _i++) {\n    if (previousColorStop !== null) {\n      var _stop = absoluteValuedColorStops[_i].stop;\n\n      if (_stop === null) {\n        var n = _i;\n\n        while (absoluteValuedColorStops[n].stop === null) {\n          n++;\n        }\n\n        var steps = n - _i + 1;\n        var nextColorStep = absoluteValuedColorStops[n].stop;\n        var stepSize = (nextColorStep - previousColorStop) / steps;\n\n        for (; _i < n; _i++) {\n          previousColorStop = absoluteValuedColorStops[_i].stop = previousColorStop + stepSize;\n        }\n      } else {\n        previousColorStop = _stop;\n      }\n    }\n  }\n\n  return absoluteValuedColorStops;\n};\n\nvar parseLinearGradient = function parseLinearGradient(args, bounds, hasPrefix) {\n  var angle = Object(_Angle__WEBPACK_IMPORTED_MODULE_1__[\"parseAngle\"])(args[0]);\n  var HAS_SIDE_OR_CORNER = SIDE_OR_CORNER.test(args[0]);\n  var HAS_DIRECTION = HAS_SIDE_OR_CORNER || angle !== null || PERCENTAGE_ANGLES.test(args[0]);\n  var direction = HAS_DIRECTION ? angle !== null ? calculateGradientDirection( // if there is a prefix, the 0° angle points due East (instead of North per W3C)\n  hasPrefix ? angle - Math.PI * 0.5 : angle, bounds) : HAS_SIDE_OR_CORNER ? parseSideOrCorner(args[0], bounds) : parsePercentageAngle(args[0], bounds) : calculateGradientDirection(Math.PI, bounds);\n  var firstColorStopIndex = HAS_DIRECTION ? 1 : 0; // TODO: Fix some inaccuracy with color stops with px values\n\n  var lineLength = Math.min(Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(Math.abs(direction.x0) + Math.abs(direction.x1), Math.abs(direction.y0) + Math.abs(direction.y1)), bounds.width * 2, bounds.height * 2);\n  return new LinearGradient(parseColorStops(args, firstColorStopIndex, lineLength), direction);\n};\n\nvar parseRadialGradient = function parseRadialGradient(container, args, bounds) {\n  var m = args[0].match(RADIAL_SHAPE_DEFINITION);\n  var shape = m && (m[1] === 'circle' || // explicit shape specification\n  m[3] !== undefined && m[5] === undefined) // only one radius coordinate\n  ? RADIAL_GRADIENT_SHAPE.CIRCLE : RADIAL_GRADIENT_SHAPE.ELLIPSE;\n  var radius = {};\n  var center = {};\n\n  if (m) {\n    // Radius\n    if (m[3] !== undefined) {\n      radius.x = Object(_Length__WEBPACK_IMPORTED_MODULE_3__[\"calculateLengthFromValueWithUnit\"])(container, m[3], m[4]).getAbsoluteValue(bounds.width);\n    }\n\n    if (m[5] !== undefined) {\n      radius.y = Object(_Length__WEBPACK_IMPORTED_MODULE_3__[\"calculateLengthFromValueWithUnit\"])(container, m[5], m[6]).getAbsoluteValue(bounds.height);\n    } // Position\n\n\n    if (m[7]) {\n      center.x = LENGTH_FOR_POSITION[m[7].toLowerCase()];\n    } else if (m[8] !== undefined) {\n      center.x = Object(_Length__WEBPACK_IMPORTED_MODULE_3__[\"calculateLengthFromValueWithUnit\"])(container, m[8], m[9]);\n    }\n\n    if (m[10]) {\n      center.y = LENGTH_FOR_POSITION[m[10].toLowerCase()];\n    } else if (m[11] !== undefined) {\n      center.y = Object(_Length__WEBPACK_IMPORTED_MODULE_3__[\"calculateLengthFromValueWithUnit\"])(container, m[11], m[12]);\n    }\n  }\n\n  var gradientCenter = {\n    x: center.x === undefined ? bounds.width / 2 : center.x.getAbsoluteValue(bounds.width),\n    y: center.y === undefined ? bounds.height / 2 : center.y.getAbsoluteValue(bounds.height)\n  };\n  var gradientRadius = calculateRadius(m && m[2] || 'farthest-corner', shape, gradientCenter, radius, bounds);\n  return new RadialGradient(parseColorStops(args, m ? 1 : 0, Math.min(gradientRadius.x, gradientRadius.y)), shape, gradientCenter, gradientRadius);\n};\n\nvar calculateGradientDirection = function calculateGradientDirection(radian, bounds) {\n  var width = bounds.width;\n  var height = bounds.height;\n  var HALF_WIDTH = width * 0.5;\n  var HALF_HEIGHT = height * 0.5;\n  var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));\n  var HALF_LINE_LENGTH = lineLength / 2;\n  var x0 = HALF_WIDTH + Math.sin(radian) * HALF_LINE_LENGTH;\n  var y0 = HALF_HEIGHT - Math.cos(radian) * HALF_LINE_LENGTH;\n  var x1 = width - x0;\n  var y1 = height - y0;\n  return {\n    x0: x0,\n    x1: x1,\n    y0: y0,\n    y1: y1\n  };\n};\n\nvar parseTopRight = function parseTopRight(bounds) {\n  return Math.acos(bounds.width / 2 / (Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(bounds.width, bounds.height) / 2));\n};\n\nvar parseSideOrCorner = function parseSideOrCorner(side, bounds) {\n  switch (side) {\n    case 'bottom':\n    case 'to top':\n      return calculateGradientDirection(0, bounds);\n\n    case 'left':\n    case 'to right':\n      return calculateGradientDirection(Math.PI / 2, bounds);\n\n    case 'right':\n    case 'to left':\n      return calculateGradientDirection(3 * Math.PI / 2, bounds);\n\n    case 'top right':\n    case 'right top':\n    case 'to bottom left':\n    case 'to left bottom':\n      return calculateGradientDirection(Math.PI + parseTopRight(bounds), bounds);\n\n    case 'top left':\n    case 'left top':\n    case 'to bottom right':\n    case 'to right bottom':\n      return calculateGradientDirection(Math.PI - parseTopRight(bounds), bounds);\n\n    case 'bottom left':\n    case 'left bottom':\n    case 'to top right':\n    case 'to right top':\n      return calculateGradientDirection(parseTopRight(bounds), bounds);\n\n    case 'bottom right':\n    case 'right bottom':\n    case 'to top left':\n    case 'to left top':\n      return calculateGradientDirection(2 * Math.PI - parseTopRight(bounds), bounds);\n\n    case 'top':\n    case 'to bottom':\n    default:\n      return calculateGradientDirection(Math.PI, bounds);\n  }\n};\n\nvar parsePercentageAngle = function parsePercentageAngle(angle, bounds) {\n  var _angle$split$map = angle.split(' ').map(parseFloat),\n      _angle$split$map2 = _slicedToArray(_angle$split$map, 2),\n      left = _angle$split$map2[0],\n      top = _angle$split$map2[1];\n\n  var ratio = left / 100 * bounds.width / (top / 100 * bounds.height);\n  return calculateGradientDirection(Math.atan(isNaN(ratio) ? 1 : ratio) + Math.PI / 2, bounds);\n};\n\nvar findCorner = function findCorner(bounds, x, y, closest) {\n  var corners = [{\n    x: 0,\n    y: 0\n  }, {\n    x: 0,\n    y: bounds.height\n  }, {\n    x: bounds.width,\n    y: 0\n  }, {\n    x: bounds.width,\n    y: bounds.height\n  }]; // $FlowFixMe\n\n  return corners.reduce(function (stat, corner) {\n    var d = Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x - corner.x, y - corner.y);\n\n    if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) {\n      return {\n        optimumCorner: corner,\n        optimumDistance: d\n      };\n    }\n\n    return stat;\n  }, {\n    optimumDistance: closest ? Infinity : -Infinity,\n    optimumCorner: null\n  }).optimumCorner;\n};\n\nvar calculateRadius = function calculateRadius(extent, shape, center, radius, bounds) {\n  var x = center.x;\n  var y = center.y;\n  var rx = 0;\n  var ry = 0;\n\n  switch (extent) {\n    case 'closest-side':\n      // The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.\n      // If the shape is an ellipse, it exactly meets the closest side in each dimension.\n      if (shape === RADIAL_GRADIENT_SHAPE.CIRCLE) {\n        rx = ry = Math.min(Math.abs(x), Math.abs(x - bounds.width), Math.abs(y), Math.abs(y - bounds.height));\n      } else if (shape === RADIAL_GRADIENT_SHAPE.ELLIPSE) {\n        rx = Math.min(Math.abs(x), Math.abs(x - bounds.width));\n        ry = Math.min(Math.abs(y), Math.abs(y - bounds.height));\n      }\n\n      break;\n\n    case 'closest-corner':\n      // The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.\n      // If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.\n      if (shape === RADIAL_GRADIENT_SHAPE.CIRCLE) {\n        rx = ry = Math.min(Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x, y), Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x, y - bounds.height), Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x - bounds.width, y), Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x - bounds.width, y - bounds.height));\n      } else if (shape === RADIAL_GRADIENT_SHAPE.ELLIPSE) {\n        // Compute the ratio ry/rx (which is to be the same as for \"closest-side\")\n        var c = Math.min(Math.abs(y), Math.abs(y - bounds.height)) / Math.min(Math.abs(x), Math.abs(x - bounds.width));\n        var corner = findCorner(bounds, x, y, true);\n        rx = Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(corner.x - x, (corner.y - y) / c);\n        ry = c * rx;\n      }\n\n      break;\n\n    case 'farthest-side':\n      // Same as closest-side, except the ending shape is sized based on the farthest side(s)\n      if (shape === RADIAL_GRADIENT_SHAPE.CIRCLE) {\n        rx = ry = Math.max(Math.abs(x), Math.abs(x - bounds.width), Math.abs(y), Math.abs(y - bounds.height));\n      } else if (shape === RADIAL_GRADIENT_SHAPE.ELLIPSE) {\n        rx = Math.max(Math.abs(x), Math.abs(x - bounds.width));\n        ry = Math.max(Math.abs(y), Math.abs(y - bounds.height));\n      }\n\n      break;\n\n    case 'farthest-corner':\n      // Same as closest-corner, except the ending shape is sized based on the farthest corner.\n      // If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.\n      if (shape === RADIAL_GRADIENT_SHAPE.CIRCLE) {\n        rx = ry = Math.max(Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x, y), Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x, y - bounds.height), Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x - bounds.width, y), Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(x - bounds.width, y - bounds.height));\n      } else if (shape === RADIAL_GRADIENT_SHAPE.ELLIPSE) {\n        // Compute the ratio ry/rx (which is to be the same as for \"farthest-side\")\n        var _c = Math.max(Math.abs(y), Math.abs(y - bounds.height)) / Math.max(Math.abs(x), Math.abs(x - bounds.width));\n\n        var _corner = findCorner(bounds, x, y, false);\n\n        rx = Object(_Util__WEBPACK_IMPORTED_MODULE_4__[\"distance\"])(_corner.x - x, (_corner.y - y) / _c);\n        ry = _c * rx;\n      }\n\n      break;\n\n    default:\n      // pixel or percentage values\n      rx = radius.x || 0;\n      ry = radius.y !== undefined ? radius.y : rx;\n      break;\n  }\n\n  return {\n    x: rx,\n    y: ry\n  };\n};\n\nvar transformWebkitRadialGradientArgs = function transformWebkitRadialGradientArgs(args) {\n  var shape = '';\n  var radius = '';\n  var extent = '';\n  var position = '';\n  var idx = 0;\n  var POSITION = /^(left|center|right|\\d+(?:px|r?em|%)?)(?:\\s+(top|center|bottom|\\d+(?:px|r?em|%)?))?$/i;\n  var SHAPE_AND_EXTENT = /^(circle|ellipse)?\\s*(closest-side|closest-corner|farthest-side|farthest-corner|contain|cover)?$/i;\n  var RADIUS = /^\\d+(px|r?em|%)?(?:\\s+\\d+(px|r?em|%)?)?$/i;\n  var matchStartPosition = args[idx].match(POSITION);\n\n  if (matchStartPosition) {\n    idx++;\n  }\n\n  var matchShapeExtent = args[idx].match(SHAPE_AND_EXTENT);\n\n  if (matchShapeExtent) {\n    shape = matchShapeExtent[1] || '';\n    extent = matchShapeExtent[2] || '';\n\n    if (extent === 'contain') {\n      extent = 'closest-side';\n    } else if (extent === 'cover') {\n      extent = 'farthest-corner';\n    }\n\n    idx++;\n  }\n\n  var matchStartRadius = args[idx].match(RADIUS);\n\n  if (matchStartRadius) {\n    idx++;\n  }\n\n  var matchEndPosition = args[idx].match(POSITION);\n\n  if (matchEndPosition) {\n    idx++;\n  }\n\n  var matchEndRadius = args[idx].match(RADIUS);\n\n  if (matchEndRadius) {\n    idx++;\n  }\n\n  var matchPosition = matchEndPosition || matchStartPosition;\n\n  if (matchPosition && matchPosition[1]) {\n    position = matchPosition[1] + (/^\\d+$/.test(matchPosition[1]) ? 'px' : '');\n\n    if (matchPosition[2]) {\n      position += ' ' + matchPosition[2] + (/^\\d+$/.test(matchPosition[2]) ? 'px' : '');\n    }\n  }\n\n  var matchRadius = matchEndRadius || matchStartRadius;\n\n  if (matchRadius) {\n    radius = matchRadius[0];\n\n    if (!matchRadius[1]) {\n      radius += 'px';\n    }\n  }\n\n  if (position && !shape && !radius && !extent) {\n    radius = position;\n    position = '';\n  }\n\n  if (position) {\n    position = \"at \".concat(position);\n  }\n\n  return [[shape, extent, radius, position].filter(function (s) {\n    return !!s;\n  }).join(' ')].concat(args.slice(idx));\n};\n\nvar transformObsoleteColorStops = function transformObsoleteColorStops(args) {\n  return args.map(function (color) {\n    return color.match(FROM_TO_COLORSTOP);\n  }) // $FlowFixMe\n  .map(function (v, index) {\n    if (!v) {\n      return args[index];\n    }\n\n    switch (v[1]) {\n      case 'from':\n        return \"\".concat(v[4], \" 0%\");\n\n      case 'to':\n        return \"\".concat(v[4], \" 100%\");\n\n      case 'color-stop':\n        if (v[3] === '%') {\n          return \"\".concat(v[4], \" \").concat(v[2]);\n        }\n\n        return \"\".concat(v[4], \" \").concat(parseFloat(v[2]) * 100, \"%\");\n    }\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/Gradient.js?");

/***/ }),

/***/ "./src/Input.js":
/*!**********************!*\
  !*** ./src/Input.js ***!
  \**********************/
/*! exports provided: INPUT_COLOR, INPUT_BORDERS, INPUT_BACKGROUND, getInputBorderRadius, inlineInputElement, inlineTextAreaElement, inlineSelectElement, reformatInputBounds */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"INPUT_COLOR\", function() { return INPUT_COLOR; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"INPUT_BORDERS\", function() { return INPUT_BORDERS; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"INPUT_BACKGROUND\", function() { return INPUT_BACKGROUND; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getInputBorderRadius\", function() { return getInputBorderRadius; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"inlineInputElement\", function() { return inlineInputElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"inlineTextAreaElement\", function() { return inlineTextAreaElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"inlineSelectElement\", function() { return inlineSelectElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"reformatInputBounds\", function() { return reformatInputBounds; });\n/* harmony import */ var _TextContainer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TextContainer */ \"./src/TextContainer.js\");\n/* harmony import */ var _parsing_background__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parsing/background */ \"./src/parsing/background.js\");\n/* harmony import */ var _parsing_border__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parsing/border */ \"./src/parsing/border.js\");\n/* harmony import */ var _drawing_Circle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./drawing/Circle */ \"./src/drawing/Circle.js\");\n/* harmony import */ var _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./drawing/Vector */ \"./src/drawing/Vector.js\");\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Color */ \"./src/Color.js\");\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Length */ \"./src/Length.js\");\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _TextBounds__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./TextBounds */ \"./src/TextBounds.js\");\n/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Util */ \"./src/Util.js\");\n\n\n\n\n\n\n\n\n\n\n\n\nvar INPUT_COLOR = new _Color__WEBPACK_IMPORTED_MODULE_5__[\"default\"]([42, 42, 42]);\nvar INPUT_BORDER_COLOR = new _Color__WEBPACK_IMPORTED_MODULE_5__[\"default\"]([165, 165, 165]);\nvar INPUT_BACKGROUND_COLOR = new _Color__WEBPACK_IMPORTED_MODULE_5__[\"default\"]([222, 222, 222]);\nvar INPUT_BORDER = {\n  borderWidth: 1,\n  borderColor: INPUT_BORDER_COLOR,\n  borderStyle: _parsing_border__WEBPACK_IMPORTED_MODULE_2__[\"BORDER_STYLE\"].SOLID\n};\nvar INPUT_BORDERS = [INPUT_BORDER, INPUT_BORDER, INPUT_BORDER, INPUT_BORDER];\nvar INPUT_BACKGROUND = {\n  backgroundColor: INPUT_BACKGROUND_COLOR,\n  backgroundImage: [],\n  backgroundClip: _parsing_background__WEBPACK_IMPORTED_MODULE_1__[\"BACKGROUND_CLIP\"].PADDING_BOX,\n  backgroundOrigin: _parsing_background__WEBPACK_IMPORTED_MODULE_1__[\"BACKGROUND_ORIGIN\"].PADDING_BOX\n};\nvar RADIO_BORDER_RADIUS = new _Length__WEBPACK_IMPORTED_MODULE_6__[\"default\"]('50%');\nvar RADIO_BORDER_RADIUS_TUPLE = [RADIO_BORDER_RADIUS, RADIO_BORDER_RADIUS];\nvar INPUT_RADIO_BORDER_RADIUS = [RADIO_BORDER_RADIUS_TUPLE, RADIO_BORDER_RADIUS_TUPLE, RADIO_BORDER_RADIUS_TUPLE, RADIO_BORDER_RADIUS_TUPLE];\nvar CHECKBOX_BORDER_RADIUS = new _Length__WEBPACK_IMPORTED_MODULE_6__[\"default\"]('3px');\nvar CHECKBOX_BORDER_RADIUS_TUPLE = [CHECKBOX_BORDER_RADIUS, CHECKBOX_BORDER_RADIUS];\nvar INPUT_CHECKBOX_BORDER_RADIUS = [CHECKBOX_BORDER_RADIUS_TUPLE, CHECKBOX_BORDER_RADIUS_TUPLE, CHECKBOX_BORDER_RADIUS_TUPLE, CHECKBOX_BORDER_RADIUS_TUPLE];\nvar getInputBorderRadius = function getInputBorderRadius(node) {\n  return node.type === 'radio' ? INPUT_RADIO_BORDER_RADIUS : INPUT_CHECKBOX_BORDER_RADIUS;\n};\nvar inlineInputElement = function inlineInputElement(node, container) {\n  if (node.type === 'radio' || node.type === 'checkbox') {\n    if (node.checked) {\n      var size = Math.min(container.bounds.width, container.bounds.height);\n      container.childNodes.push(node.type === 'checkbox' ? [new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_4__[\"default\"](container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)] : new _drawing_Circle__WEBPACK_IMPORTED_MODULE_3__[\"default\"](container.bounds.left + size / 4, container.bounds.top + size / 4, size / 4));\n    }\n  } else {\n    inlineFormElement(getInputValue(node), node, container, false);\n  }\n};\nvar inlineTextAreaElement = function inlineTextAreaElement(node, container) {\n  inlineFormElement(node.value, node, container, true);\n};\nvar inlineSelectElement = function inlineSelectElement(node, container) {\n  var option = node.options[node.selectedIndex || 0];\n  inlineFormElement(option ? option.text || '' : '', node, container, false);\n};\nvar reformatInputBounds = function reformatInputBounds(bounds) {\n  if (bounds.width > bounds.height) {\n    bounds.left += (bounds.width - bounds.height) / 2;\n    bounds.width = bounds.height;\n  } else if (bounds.width < bounds.height) {\n    bounds.top += (bounds.height - bounds.width) / 2;\n    bounds.height = bounds.width;\n  }\n\n  return bounds;\n};\n\nvar inlineFormElement = function inlineFormElement(value, node, container, allowLinebreak) {\n  var body = node.ownerDocument.body;\n\n  if (value.length > 0 && body) {\n    var wrapper = node.ownerDocument.createElement('html2canvaswrapper');\n    Object(_Util__WEBPACK_IMPORTED_MODULE_9__[\"copyCSSStyles\"])(node.ownerDocument.defaultView.getComputedStyle(node, null), wrapper);\n    wrapper.style.position = 'absolute';\n    wrapper.style.left = \"\".concat(container.bounds.left, \"px\");\n    wrapper.style.top = \"\".concat(container.bounds.top, \"px\");\n\n    if (!allowLinebreak) {\n      wrapper.style.whiteSpace = 'nowrap';\n    }\n\n    var text = node.ownerDocument.createTextNode(value);\n    wrapper.appendChild(text);\n    body.appendChild(wrapper);\n    container.childNodes.push(_TextContainer__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fromTextNode(text, container));\n    body.removeChild(wrapper);\n  }\n};\n\nvar getInputValue = function getInputValue(node) {\n  var value = node.type === 'password' ? new Array(node.value.length + 1).join(\"\\u2022\") : node.value;\n  return value.length === 0 ? node.placeholder || '' : value;\n};\n\n//# sourceURL=webpack://html2canvas/./src/Input.js?");

/***/ }),

/***/ "./src/Length.js":
/*!***********************!*\
  !*** ./src/Length.js ***!
  \***********************/
/*! exports provided: LENGTH_TYPE, default, calculateLengthFromValueWithUnit */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LENGTH_TYPE\", function() { return LENGTH_TYPE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Length; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateLengthFromValueWithUnit\", function() { return calculateLengthFromValueWithUnit; });\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar LENGTH_WITH_UNIT = /([\\d.]+)(px|r?em|%)/i;\nvar LENGTH_TYPE = {\n  PX: 0,\n  PERCENTAGE: 1\n};\n\nvar Length =\n/*#__PURE__*/\nfunction () {\n  function Length(value) {\n    _classCallCheck(this, Length);\n\n    this.type = value.substr(value.length - 1) === '%' ? LENGTH_TYPE.PERCENTAGE : LENGTH_TYPE.PX;\n    var parsedValue = parseFloat(value);\n\n    if ( true && isNaN(parsedValue)) {\n      console.error(\"Invalid value given for Length: \\\"\".concat(value, \"\\\"\"));\n    }\n\n    this.value = isNaN(parsedValue) ? 0 : parsedValue;\n  }\n\n  _createClass(Length, [{\n    key: \"isPercentage\",\n    value: function isPercentage() {\n      return this.type === LENGTH_TYPE.PERCENTAGE;\n    }\n  }, {\n    key: \"getAbsoluteValue\",\n    value: function getAbsoluteValue(parentLength) {\n      return this.isPercentage() ? parentLength * (this.value / 100) : this.value;\n    }\n  }], [{\n    key: \"create\",\n    value: function create(v) {\n      return new Length(v);\n    }\n  }]);\n\n  return Length;\n}();\n\n\n\nvar getRootFontSize = function getRootFontSize(container) {\n  var parent = container.parent;\n  return parent ? getRootFontSize(parent) : parseFloat(container.style.font.fontSize);\n};\n\nvar calculateLengthFromValueWithUnit = function calculateLengthFromValueWithUnit(container, value, unit) {\n  switch (unit) {\n    case 'px':\n    case '%':\n      return new Length(value + unit);\n\n    case 'em':\n    case 'rem':\n      var length = new Length(value);\n      length.value *= unit === 'em' ? parseFloat(container.style.font.fontSize) : getRootFontSize(container);\n      return length;\n\n    default:\n      // TODO: handle correctly if unknown unit is used\n      return new Length('0');\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/Length.js?");

/***/ }),

/***/ "./src/ListItem.js":
/*!*************************!*\
  !*** ./src/ListItem.js ***!
  \*************************/
/*! exports provided: getListOwner, inlineListItemElement, createCounterText */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getListOwner\", function() { return getListOwner; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"inlineListItemElement\", function() { return inlineListItemElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createCounterText\", function() { return createCounterText; });\n/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Util */ \"./src/Util.js\");\n/* harmony import */ var _NodeContainer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NodeContainer */ \"./src/NodeContainer.js\");\n/* harmony import */ var _TextContainer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TextContainer */ \"./src/TextContainer.js\");\n/* harmony import */ var _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parsing/listStyle */ \"./src/parsing/listStyle.js\");\n/* harmony import */ var _Unicode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Unicode */ \"./src/Unicode.js\");\n\n\n\n\n\n\n // Margin between the enumeration and the list item content\n\nvar MARGIN_RIGHT = 7;\nvar ancestorTypes = ['OL', 'UL', 'MENU'];\nvar getListOwner = function getListOwner(container) {\n  var parent = container.parent;\n\n  if (!parent) {\n    return null;\n  }\n\n  do {\n    var isAncestor = ancestorTypes.indexOf(parent.tagName) !== -1;\n\n    if (isAncestor) {\n      return parent;\n    }\n\n    parent = parent.parent;\n  } while (parent);\n\n  return container.parent;\n};\nvar inlineListItemElement = function inlineListItemElement(node, container, resourceLoader) {\n  var listStyle = container.style.listStyle;\n\n  if (!listStyle) {\n    return;\n  }\n\n  var style = node.ownerDocument.defaultView.getComputedStyle(node, null);\n  var wrapper = node.ownerDocument.createElement('html2canvaswrapper');\n  Object(_Util__WEBPACK_IMPORTED_MODULE_0__[\"copyCSSStyles\"])(style, wrapper);\n  wrapper.style.position = 'absolute';\n  wrapper.style.bottom = 'auto';\n  wrapper.style.display = 'block';\n  wrapper.style.letterSpacing = 'normal';\n\n  switch (listStyle.listStylePosition) {\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_POSITION\"].OUTSIDE:\n      wrapper.style.left = 'auto';\n      wrapper.style.right = \"\".concat(node.ownerDocument.defaultView.innerWidth - container.bounds.left - container.style.margin[1].getAbsoluteValue(container.bounds.width) + MARGIN_RIGHT, \"px\");\n      wrapper.style.textAlign = 'right';\n      break;\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_POSITION\"].INSIDE:\n      wrapper.style.left = \"\".concat(container.bounds.left - container.style.margin[3].getAbsoluteValue(container.bounds.width), \"px\");\n      wrapper.style.right = 'auto';\n      wrapper.style.textAlign = 'left';\n      break;\n  }\n\n  var text;\n  var MARGIN_TOP = container.style.margin[0].getAbsoluteValue(container.bounds.width);\n  var styleImage = listStyle.listStyleImage;\n\n  if (styleImage) {\n    if (styleImage.method === 'url') {\n      var image = node.ownerDocument.createElement('img');\n      image.src = styleImage.args[0];\n      wrapper.style.top = \"\".concat(container.bounds.top - MARGIN_TOP, \"px\");\n      wrapper.style.width = 'auto';\n      wrapper.style.height = 'auto';\n      wrapper.appendChild(image);\n    } else {\n      var size = parseFloat(container.style.font.fontSize) * 0.5;\n      wrapper.style.top = \"\".concat(container.bounds.top - MARGIN_TOP + container.bounds.height - 1.5 * size, \"px\");\n      wrapper.style.width = \"\".concat(size, \"px\");\n      wrapper.style.height = \"\".concat(size, \"px\");\n      wrapper.style.backgroundImage = style.listStyleImage;\n    }\n  } else if (typeof container.listIndex === 'number') {\n    text = node.ownerDocument.createTextNode(createCounterText(container.listIndex, listStyle.listStyleType, true));\n    wrapper.appendChild(text);\n    wrapper.style.top = \"\".concat(container.bounds.top - MARGIN_TOP, \"px\");\n  } // $FlowFixMe\n\n\n  var body = node.ownerDocument.body;\n  body.appendChild(wrapper);\n\n  if (text) {\n    container.childNodes.push(_TextContainer__WEBPACK_IMPORTED_MODULE_2__[\"default\"].fromTextNode(text, container));\n    body.removeChild(wrapper);\n  } else {\n    // $FlowFixMe\n    container.childNodes.push(new _NodeContainer__WEBPACK_IMPORTED_MODULE_1__[\"default\"](wrapper, container, resourceLoader, 0));\n  }\n};\nvar ROMAN_UPPER = {\n  integers: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],\n  values: ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']\n};\nvar ARMENIAN = {\n  integers: [9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],\n  values: ['Ք', 'Փ', 'Ւ', 'Ց', 'Ր', 'Տ', 'Վ', 'Ս', 'Ռ', 'Ջ', 'Պ', 'Չ', 'Ո', 'Շ', 'Ն', 'Յ', 'Մ', 'Ճ', 'Ղ', 'Ձ', 'Հ', 'Կ', 'Ծ', 'Խ', 'Լ', 'Ի', 'Ժ', 'Թ', 'Ը', 'Է', 'Զ', 'Ե', 'Դ', 'Գ', 'Բ', 'Ա']\n};\nvar HEBREW = {\n  integers: [10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 19, 18, 17, 16, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],\n  values: ['י׳', 'ט׳', 'ח׳', 'ז׳', 'ו׳', 'ה׳', 'ד׳', 'ג׳', 'ב׳', 'א׳', 'ת', 'ש', 'ר', 'ק', 'צ', 'פ', 'ע', 'ס', 'נ', 'מ', 'ל', 'כ', 'יט', 'יח', 'יז', 'טז', 'טו', 'י', 'ט', 'ח', 'ז', 'ו', 'ה', 'ד', 'ג', 'ב', 'א']\n};\nvar GEORGIAN = {\n  integers: [10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],\n  values: ['ჵ', 'ჰ', 'ჯ', 'ჴ', 'ხ', 'ჭ', 'წ', 'ძ', 'ც', 'ჩ', 'შ', 'ყ', 'ღ', 'ქ', 'ფ', 'ჳ', 'ტ', 'ს', 'რ', 'ჟ', 'პ', 'ო', 'ჲ', 'ნ', 'მ', 'ლ', 'კ', 'ი', 'თ', 'ჱ', 'ზ', 'ვ', 'ე', 'დ', 'გ', 'ბ', 'ა']\n};\n\nvar createAdditiveCounter = function createAdditiveCounter(value, min, max, symbols, fallback, suffix) {\n  if (value < min || value > max) {\n    return createCounterText(value, fallback, suffix.length > 0);\n  }\n\n  return symbols.integers.reduce(function (string, integer, index) {\n    while (value >= integer) {\n      value -= integer;\n      string += symbols.values[index];\n    }\n\n    return string;\n  }, '') + suffix;\n};\n\nvar createCounterStyleWithSymbolResolver = function createCounterStyleWithSymbolResolver(value, codePointRangeLength, isNumeric, resolver) {\n  var string = '';\n\n  do {\n    if (!isNumeric) {\n      value--;\n    }\n\n    string = resolver(value) + string;\n    value /= codePointRangeLength;\n  } while (value * codePointRangeLength >= codePointRangeLength);\n\n  return string;\n};\n\nvar createCounterStyleFromRange = function createCounterStyleFromRange(value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {\n  var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;\n  return (value < 0 ? '-' : '') + (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function (codePoint) {\n    return Object(_Unicode__WEBPACK_IMPORTED_MODULE_4__[\"fromCodePoint\"])(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);\n  }) + suffix);\n};\n\nvar createCounterStyleFromSymbols = function createCounterStyleFromSymbols(value, symbols) {\n  var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '. ';\n  var codePointRangeLength = symbols.length;\n  return createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function (codePoint) {\n    return symbols[Math.floor(codePoint % codePointRangeLength)];\n  }) + suffix;\n};\n\nvar CJK_ZEROS = 1 << 0;\nvar CJK_TEN_COEFFICIENTS = 1 << 1;\nvar CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;\nvar CJK_HUNDRED_COEFFICIENTS = 1 << 3;\n\nvar createCJKCounter = function createCJKCounter(value, numbers, multipliers, negativeSign, suffix, flags) {\n  if (value < -9999 || value > 9999) {\n    return createCounterText(value, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CJK_DECIMAL, suffix.length > 0);\n  }\n\n  var tmp = Math.abs(value);\n  var string = suffix;\n\n  if (tmp === 0) {\n    return numbers[0] + string;\n  }\n\n  for (var digit = 0; tmp > 0 && digit <= 4; digit++) {\n    var coefficient = tmp % 10;\n\n    if (coefficient === 0 && Object(_Util__WEBPACK_IMPORTED_MODULE_0__[\"contains\"])(flags, CJK_ZEROS) && string !== '') {\n      string = numbers[coefficient] + string;\n    } else if (coefficient > 1 || coefficient === 1 && digit === 0 || coefficient === 1 && digit === 1 && Object(_Util__WEBPACK_IMPORTED_MODULE_0__[\"contains\"])(flags, CJK_TEN_COEFFICIENTS) || coefficient === 1 && digit === 1 && Object(_Util__WEBPACK_IMPORTED_MODULE_0__[\"contains\"])(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100 || coefficient === 1 && digit > 1 && Object(_Util__WEBPACK_IMPORTED_MODULE_0__[\"contains\"])(flags, CJK_HUNDRED_COEFFICIENTS)) {\n      string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : '') + string;\n    } else if (coefficient === 1 && digit > 0) {\n      string = multipliers[digit - 1] + string;\n    }\n\n    tmp = Math.floor(tmp / 10);\n  }\n\n  return (value < 0 ? negativeSign : '') + string;\n};\n\nvar CHINESE_INFORMAL_MULTIPLIERS = '十百千萬';\nvar CHINESE_FORMAL_MULTIPLIERS = '拾佰仟萬';\nvar JAPANESE_NEGATIVE = 'マイナス';\nvar KOREAN_NEGATIVE = '마이너스';\nvar createCounterText = function createCounterText(value, type, appendSuffix) {\n  var defaultSuffix = appendSuffix ? '. ' : '';\n  var cjkSuffix = appendSuffix ? '、' : '';\n  var koreanSuffix = appendSuffix ? ', ' : '';\n\n  switch (type) {\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DISC:\n      return '•';\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CIRCLE:\n      return '◦';\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].SQUARE:\n      return '◾';\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL_LEADING_ZERO:\n      var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);\n      return string.length < 4 ? \"0\".concat(string) : string;\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CJK_DECIMAL:\n      return createCounterStyleFromSymbols(value, '〇一二三四五六七八九', cjkSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].LOWER_ROMAN:\n      return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL, defaultSuffix).toLowerCase();\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].UPPER_ROMAN:\n      return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].LOWER_GREEK:\n      return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].LOWER_ALPHA:\n      return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].UPPER_ALPHA:\n      return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].ARABIC_INDIC:\n      return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].ARMENIAN:\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].UPPER_ARMENIAN:\n      return createAdditiveCounter(value, 1, 9999, ARMENIAN, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].LOWER_ARMENIAN:\n      return createAdditiveCounter(value, 1, 9999, ARMENIAN, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL, defaultSuffix).toLowerCase();\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].BENGALI:\n      return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CAMBODIAN:\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KHMER:\n      return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CJK_EARTHLY_BRANCH:\n      return createCounterStyleFromSymbols(value, '子丑寅卯辰巳午未申酉戌亥', cjkSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CJK_HEAVENLY_STEM:\n      return createCounterStyleFromSymbols(value, '甲乙丙丁戊己庚辛壬癸', cjkSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].CJK_IDEOGRAPHIC:\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].TRAD_CHINESE_INFORMAL:\n      return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].TRAD_CHINESE_FORMAL:\n      return createCJKCounter(value, '零壹貳參肆伍陸柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].SIMP_CHINESE_INFORMAL:\n      return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].SIMP_CHINESE_FORMAL:\n      return createCJKCounter(value, '零壹贰叁肆伍陆柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].JAPANESE_INFORMAL:\n      return createCJKCounter(value, '〇一二三四五六七八九', '十百千万', JAPANESE_NEGATIVE, cjkSuffix, 0);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].JAPANESE_FORMAL:\n      return createCJKCounter(value, '零壱弐参四伍六七八九', '拾百千万', JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KOREAN_HANGUL_FORMAL:\n      return createCJKCounter(value, '영일이삼사오육칠팔구', '십백천만', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KOREAN_HANJA_INFORMAL:\n      return createCJKCounter(value, '零一二三四五六七八九', '十百千萬', KOREAN_NEGATIVE, koreanSuffix, 0);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KOREAN_HANJA_FORMAL:\n      return createCJKCounter(value, '零壹貳參四五六七八九', '拾百千', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DEVANAGARI:\n      return createCounterStyleFromRange(value, 0x966, 0x96f, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].GEORGIAN:\n      return createAdditiveCounter(value, 1, 19999, GEORGIAN, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].GUJARATI:\n      return createCounterStyleFromRange(value, 0xae6, 0xaef, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].GURMUKHI:\n      return createCounterStyleFromRange(value, 0xa66, 0xa6f, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].HEBREW:\n      return createAdditiveCounter(value, 1, 10999, HEBREW, _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].HIRAGANA:\n      return createCounterStyleFromSymbols(value, 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].HIRAGANA_IROHA:\n      return createCounterStyleFromSymbols(value, 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KANNADA:\n      return createCounterStyleFromRange(value, 0xce6, 0xcef, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KATAKANA:\n      return createCounterStyleFromSymbols(value, 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン', cjkSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].KATAKANA_IROHA:\n      return createCounterStyleFromSymbols(value, 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス', cjkSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].LAO:\n      return createCounterStyleFromRange(value, 0xed0, 0xed9, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].MONGOLIAN:\n      return createCounterStyleFromRange(value, 0x1810, 0x1819, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].MYANMAR:\n      return createCounterStyleFromRange(value, 0x1040, 0x1049, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].ORIYA:\n      return createCounterStyleFromRange(value, 0xb66, 0xb6f, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].PERSIAN:\n      return createCounterStyleFromRange(value, 0x6f0, 0x6f9, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].TAMIL:\n      return createCounterStyleFromRange(value, 0xbe6, 0xbef, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].TELUGU:\n      return createCounterStyleFromRange(value, 0xc66, 0xc6f, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].THAI:\n      return createCounterStyleFromRange(value, 0xe50, 0xe59, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].TIBETAN:\n      return createCounterStyleFromRange(value, 0xf20, 0xf29, true, defaultSuffix);\n\n    case _parsing_listStyle__WEBPACK_IMPORTED_MODULE_3__[\"LIST_STYLE_TYPE\"].DECIMAL:\n    default:\n      return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/ListItem.js?");

/***/ }),

/***/ "./src/Logger.js":
/*!***********************!*\
  !*** ./src/Logger.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Logger; });\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar Logger =\n/*#__PURE__*/\nfunction () {\n  function Logger(enabled, id, start) {\n    _classCallCheck(this, Logger);\n\n    this.enabled = typeof window !== 'undefined' && enabled;\n    this.start = start ? start : Date.now();\n    this.id = id;\n  }\n\n  _createClass(Logger, [{\n    key: \"child\",\n    value: function child(id) {\n      return new Logger(this.enabled, id, this.start);\n    } // eslint-disable-next-line flowtype/no-weak-types\n\n  }, {\n    key: \"log\",\n    value: function log() {\n      if (this.enabled && window.console && window.console.log) {\n        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n          args[_key] = arguments[_key];\n        }\n\n        Function.prototype.bind.call(window.console.log, window.console).apply(window.console, [Date.now() - this.start + 'ms', this.id ? \"html2canvas (\".concat(this.id, \"):\") : 'html2canvas:'].concat([].slice.call(args, 0)));\n      }\n    } // eslint-disable-next-line flowtype/no-weak-types\n\n  }, {\n    key: \"error\",\n    value: function error() {\n      if (this.enabled && window.console && window.console.error) {\n        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {\n          args[_key2] = arguments[_key2];\n        }\n\n        Function.prototype.bind.call(window.console.error, window.console).apply(window.console, [Date.now() - this.start + 'ms', this.id ? \"html2canvas (\".concat(this.id, \"):\") : 'html2canvas:'].concat([].slice.call(args, 0)));\n      }\n    }\n  }]);\n\n  return Logger;\n}();\n\n\n\n//# sourceURL=webpack://html2canvas/./src/Logger.js?");

/***/ }),

/***/ "./src/NodeContainer.js":
/*!******************************!*\
  !*** ./src/NodeContainer.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return NodeContainer; });\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Color */ \"./src/Color.js\");\n/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Util */ \"./src/Util.js\");\n/* harmony import */ var _parsing_background__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parsing/background */ \"./src/parsing/background.js\");\n/* harmony import */ var _parsing_border__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parsing/border */ \"./src/parsing/border.js\");\n/* harmony import */ var _parsing_borderRadius__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parsing/borderRadius */ \"./src/parsing/borderRadius.js\");\n/* harmony import */ var _parsing_display__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./parsing/display */ \"./src/parsing/display.js\");\n/* harmony import */ var _parsing_float__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./parsing/float */ \"./src/parsing/float.js\");\n/* harmony import */ var _parsing_font__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./parsing/font */ \"./src/parsing/font.js\");\n/* harmony import */ var _parsing_letterSpacing__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./parsing/letterSpacing */ \"./src/parsing/letterSpacing.js\");\n/* harmony import */ var _parsing_lineBreak__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./parsing/lineBreak */ \"./src/parsing/lineBreak.js\");\n/* harmony import */ var _parsing_listStyle__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./parsing/listStyle */ \"./src/parsing/listStyle.js\");\n/* harmony import */ var _parsing_margin__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./parsing/margin */ \"./src/parsing/margin.js\");\n/* harmony import */ var _parsing_overflow__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./parsing/overflow */ \"./src/parsing/overflow.js\");\n/* harmony import */ var _parsing_overflowWrap__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./parsing/overflowWrap */ \"./src/parsing/overflowWrap.js\");\n/* harmony import */ var _parsing_padding__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./parsing/padding */ \"./src/parsing/padding.js\");\n/* harmony import */ var _parsing_position__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./parsing/position */ \"./src/parsing/position.js\");\n/* harmony import */ var _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./parsing/textDecoration */ \"./src/parsing/textDecoration.js\");\n/* harmony import */ var _parsing_textShadow__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./parsing/textShadow */ \"./src/parsing/textShadow.js\");\n/* harmony import */ var _parsing_textTransform__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./parsing/textTransform */ \"./src/parsing/textTransform.js\");\n/* harmony import */ var _parsing_transform__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./parsing/transform */ \"./src/parsing/transform.js\");\n/* harmony import */ var _parsing_visibility__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./parsing/visibility */ \"./src/parsing/visibility.js\");\n/* harmony import */ var _parsing_word_break__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./parsing/word-break */ \"./src/parsing/word-break.js\");\n/* harmony import */ var _parsing_zIndex__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./parsing/zIndex */ \"./src/parsing/zIndex.js\");\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _Input__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./Input */ \"./src/Input.js\");\n/* harmony import */ var _ListItem__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./ListItem */ \"./src/ListItem.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvar INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];\n\nvar NodeContainer =\n/*#__PURE__*/\nfunction () {\n  function NodeContainer(node, parent, resourceLoader, index) {\n    var _this = this;\n\n    _classCallCheck(this, NodeContainer);\n\n    this.parent = parent;\n    this.tagName = node.tagName;\n    this.index = index;\n    this.childNodes = [];\n    this.listItems = [];\n\n    if (typeof node.start === 'number') {\n      this.listStart = node.start;\n    }\n\n    var defaultView = node.ownerDocument.defaultView;\n    var scrollX = defaultView.pageXOffset;\n    var scrollY = defaultView.pageYOffset;\n    var style = defaultView.getComputedStyle(node, null);\n    var display = Object(_parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"parseDisplay\"])(style.display);\n    var IS_INPUT = node.type === 'radio' || node.type === 'checkbox';\n    var position = Object(_parsing_position__WEBPACK_IMPORTED_MODULE_15__[\"parsePosition\"])(style.position);\n    this.style = {\n      background: IS_INPUT ? _Input__WEBPACK_IMPORTED_MODULE_24__[\"INPUT_BACKGROUND\"] : Object(_parsing_background__WEBPACK_IMPORTED_MODULE_2__[\"parseBackground\"])(style, resourceLoader),\n      border: IS_INPUT ? _Input__WEBPACK_IMPORTED_MODULE_24__[\"INPUT_BORDERS\"] : Object(_parsing_border__WEBPACK_IMPORTED_MODULE_3__[\"parseBorder\"])(style),\n      borderRadius: (node instanceof defaultView.HTMLInputElement || node instanceof HTMLInputElement) && IS_INPUT ? Object(_Input__WEBPACK_IMPORTED_MODULE_24__[\"getInputBorderRadius\"])(node) : Object(_parsing_borderRadius__WEBPACK_IMPORTED_MODULE_4__[\"parseBorderRadius\"])(style),\n      color: IS_INPUT ? _Input__WEBPACK_IMPORTED_MODULE_24__[\"INPUT_COLOR\"] : new _Color__WEBPACK_IMPORTED_MODULE_0__[\"default\"](style.color),\n      display: display,\n      float: Object(_parsing_float__WEBPACK_IMPORTED_MODULE_6__[\"parseCSSFloat\"])(style.float),\n      font: Object(_parsing_font__WEBPACK_IMPORTED_MODULE_7__[\"parseFont\"])(style),\n      letterSpacing: Object(_parsing_letterSpacing__WEBPACK_IMPORTED_MODULE_8__[\"parseLetterSpacing\"])(style.letterSpacing),\n      listStyle: display === _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].LIST_ITEM ? Object(_parsing_listStyle__WEBPACK_IMPORTED_MODULE_10__[\"parseListStyle\"])(style) : null,\n      lineBreak: Object(_parsing_lineBreak__WEBPACK_IMPORTED_MODULE_9__[\"parseLineBreak\"])(style.lineBreak),\n      margin: Object(_parsing_margin__WEBPACK_IMPORTED_MODULE_11__[\"parseMargin\"])(style),\n      opacity: parseFloat(style.opacity),\n      overflow: INPUT_TAGS.indexOf(node.tagName) === -1 ? Object(_parsing_overflow__WEBPACK_IMPORTED_MODULE_12__[\"parseOverflow\"])(style.overflow) : _parsing_overflow__WEBPACK_IMPORTED_MODULE_12__[\"OVERFLOW\"].HIDDEN,\n      overflowWrap: Object(_parsing_overflowWrap__WEBPACK_IMPORTED_MODULE_13__[\"parseOverflowWrap\"])(style.overflowWrap ? style.overflowWrap : style.wordWrap),\n      padding: Object(_parsing_padding__WEBPACK_IMPORTED_MODULE_14__[\"parsePadding\"])(style),\n      position: position,\n      textDecoration: Object(_parsing_textDecoration__WEBPACK_IMPORTED_MODULE_16__[\"parseTextDecoration\"])(style),\n      textShadow: Object(_parsing_textShadow__WEBPACK_IMPORTED_MODULE_17__[\"parseTextShadow\"])(style.textShadow),\n      textTransform: Object(_parsing_textTransform__WEBPACK_IMPORTED_MODULE_18__[\"parseTextTransform\"])(style.textTransform),\n      transform: Object(_parsing_transform__WEBPACK_IMPORTED_MODULE_19__[\"parseTransform\"])(style),\n      visibility: Object(_parsing_visibility__WEBPACK_IMPORTED_MODULE_20__[\"parseVisibility\"])(style.visibility),\n      wordBreak: Object(_parsing_word_break__WEBPACK_IMPORTED_MODULE_21__[\"parseWordBreak\"])(style.wordBreak),\n      zIndex: Object(_parsing_zIndex__WEBPACK_IMPORTED_MODULE_22__[\"parseZIndex\"])(position !== _parsing_position__WEBPACK_IMPORTED_MODULE_15__[\"POSITION\"].STATIC ? style.zIndex : 'auto')\n    };\n\n    if (this.isTransformed()) {\n      // getBoundingClientRect provides values post-transform, we want them without the transformation\n      node.style.transform = 'matrix(1,0,0,1,0,0)';\n    }\n\n    if (display === _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].LIST_ITEM) {\n      var listOwner = Object(_ListItem__WEBPACK_IMPORTED_MODULE_25__[\"getListOwner\"])(this);\n\n      if (listOwner) {\n        var listIndex = listOwner.listItems.length;\n        listOwner.listItems.push(this);\n        this.listIndex = node.hasAttribute('value') && typeof node.value === 'number' ? node.value : listIndex === 0 ? typeof listOwner.listStart === 'number' ? listOwner.listStart : 1 : listOwner.listItems[listIndex - 1].listIndex + 1;\n      }\n    } // TODO move bound retrieval for all nodes to a later stage?\n\n\n    if (node.tagName === 'IMG') {\n      node.addEventListener('load', function () {\n        _this.bounds = Object(_Bounds__WEBPACK_IMPORTED_MODULE_23__[\"parseBounds\"])(node, scrollX, scrollY);\n        _this.curvedBounds = Object(_Bounds__WEBPACK_IMPORTED_MODULE_23__[\"parseBoundCurves\"])(_this.bounds, _this.style.border, _this.style.borderRadius);\n      });\n    }\n\n    this.image = getImage(node, resourceLoader);\n    this.bounds = IS_INPUT ? Object(_Input__WEBPACK_IMPORTED_MODULE_24__[\"reformatInputBounds\"])(Object(_Bounds__WEBPACK_IMPORTED_MODULE_23__[\"parseBounds\"])(node, scrollX, scrollY)) : Object(_Bounds__WEBPACK_IMPORTED_MODULE_23__[\"parseBounds\"])(node, scrollX, scrollY);\n    this.curvedBounds = Object(_Bounds__WEBPACK_IMPORTED_MODULE_23__[\"parseBoundCurves\"])(this.bounds, this.style.border, this.style.borderRadius);\n\n    if (true) {\n      this.name = \"\".concat(node.tagName.toLowerCase()).concat(node.id ? \"#\".concat(node.id) : '').concat(node.className.toString().split(' ').map(function (s) {\n        return s.length ? \".\".concat(s) : '';\n      }).join(''));\n    }\n  }\n\n  _createClass(NodeContainer, [{\n    key: \"getClipPaths\",\n    value: function getClipPaths() {\n      var parentClips = this.parent ? this.parent.getClipPaths() : [];\n      var isClipped = this.style.overflow !== _parsing_overflow__WEBPACK_IMPORTED_MODULE_12__[\"OVERFLOW\"].VISIBLE;\n      return isClipped ? parentClips.concat([Object(_Bounds__WEBPACK_IMPORTED_MODULE_23__[\"calculatePaddingBoxPath\"])(this.curvedBounds)]) : parentClips;\n    }\n  }, {\n    key: \"isInFlow\",\n    value: function isInFlow() {\n      return this.isRootElement() && !this.isFloating() && !this.isAbsolutelyPositioned();\n    }\n  }, {\n    key: \"isVisible\",\n    value: function isVisible() {\n      return !Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].NONE) && this.style.opacity > 0 && this.style.visibility === _parsing_visibility__WEBPACK_IMPORTED_MODULE_20__[\"VISIBILITY\"].VISIBLE;\n    }\n  }, {\n    key: \"isAbsolutelyPositioned\",\n    value: function isAbsolutelyPositioned() {\n      return this.style.position !== _parsing_position__WEBPACK_IMPORTED_MODULE_15__[\"POSITION\"].STATIC && this.style.position !== _parsing_position__WEBPACK_IMPORTED_MODULE_15__[\"POSITION\"].RELATIVE;\n    }\n  }, {\n    key: \"isPositioned\",\n    value: function isPositioned() {\n      return this.style.position !== _parsing_position__WEBPACK_IMPORTED_MODULE_15__[\"POSITION\"].STATIC;\n    }\n  }, {\n    key: \"isFloating\",\n    value: function isFloating() {\n      return this.style.float !== _parsing_float__WEBPACK_IMPORTED_MODULE_6__[\"FLOAT\"].NONE;\n    }\n  }, {\n    key: \"isRootElement\",\n    value: function isRootElement() {\n      return this.parent === null;\n    }\n  }, {\n    key: \"isTransformed\",\n    value: function isTransformed() {\n      return this.style.transform !== null;\n    }\n  }, {\n    key: \"isPositionedWithZIndex\",\n    value: function isPositionedWithZIndex() {\n      return this.isPositioned() && !this.style.zIndex.auto;\n    }\n  }, {\n    key: \"isInlineLevel\",\n    value: function isInlineLevel() {\n      return Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE) || Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_BLOCK) || Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_FLEX) || Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_GRID) || Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_LIST_ITEM) || Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_TABLE);\n    }\n  }, {\n    key: \"isInlineBlockOrInlineTable\",\n    value: function isInlineBlockOrInlineTable() {\n      return Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_BLOCK) || Object(_Util__WEBPACK_IMPORTED_MODULE_1__[\"contains\"])(this.style.display, _parsing_display__WEBPACK_IMPORTED_MODULE_5__[\"DISPLAY\"].INLINE_TABLE);\n    }\n  }]);\n\n  return NodeContainer;\n}();\n\n\n\nvar getImage = function getImage(node, resourceLoader) {\n  if (node instanceof node.ownerDocument.defaultView.SVGSVGElement || node instanceof SVGSVGElement) {\n    var s = new XMLSerializer();\n    return resourceLoader.loadImage(\"data:image/svg+xml,\".concat(encodeURIComponent(s.serializeToString(node))));\n  }\n\n  switch (node.tagName) {\n    case 'IMG':\n      // $FlowFixMe\n      var img = node;\n      return resourceLoader.loadImage(img.currentSrc || img.src);\n\n    case 'CANVAS':\n      // $FlowFixMe\n      var canvas = node;\n      return resourceLoader.loadCanvas(canvas);\n\n    case 'IFRAME':\n      var iframeKey = node.getAttribute('data-html2canvas-internal-iframe-key');\n\n      if (iframeKey) {\n        return iframeKey;\n      }\n\n      break;\n  }\n\n  return null;\n};\n\n//# sourceURL=webpack://html2canvas/./src/NodeContainer.js?");

/***/ }),

/***/ "./src/NodeParser.js":
/*!***************************!*\
  !*** ./src/NodeParser.js ***!
  \***************************/
/*! exports provided: NodeParser */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"NodeParser\", function() { return NodeParser; });\n/* harmony import */ var _StackingContext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./StackingContext */ \"./src/StackingContext.js\");\n/* harmony import */ var _NodeContainer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NodeContainer */ \"./src/NodeContainer.js\");\n/* harmony import */ var _TextContainer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TextContainer */ \"./src/TextContainer.js\");\n/* harmony import */ var _Input__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Input */ \"./src/Input.js\");\n/* harmony import */ var _ListItem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ListItem */ \"./src/ListItem.js\");\n/* harmony import */ var _parsing_listStyle__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./parsing/listStyle */ \"./src/parsing/listStyle.js\");\n\n\n\n\n\n\n\n\nvar NodeParser = function NodeParser(node, resourceLoader, logger) {\n  if (true) {\n    logger.log(\"Starting node parsing\");\n  }\n\n  var index = 0;\n  var container = new _NodeContainer__WEBPACK_IMPORTED_MODULE_1__[\"default\"](node, null, resourceLoader, index++);\n  var stack = new _StackingContext__WEBPACK_IMPORTED_MODULE_0__[\"default\"](container, null, true);\n  parseNodeTree(node, container, stack, resourceLoader, index);\n\n  if (true) {\n    logger.log(\"Finished parsing node tree\");\n  }\n\n  return stack;\n};\nvar IGNORED_NODE_NAMES = ['SCRIPT', 'HEAD', 'TITLE', 'OBJECT', 'BR', 'OPTION'];\n\nvar parseNodeTree = function parseNodeTree(node, parent, stack, resourceLoader, index) {\n  if ( true && index > 50000) {\n    throw new Error(\"Recursion error while parsing node tree\");\n  }\n\n  for (var childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {\n    nextNode = childNode.nextSibling;\n    var defaultView = childNode.ownerDocument.defaultView;\n\n    if (childNode instanceof defaultView.Text || childNode instanceof Text || defaultView.parent && childNode instanceof defaultView.parent.Text) {\n      if (childNode.data.trim().length > 0) {\n        parent.childNodes.push(_TextContainer__WEBPACK_IMPORTED_MODULE_2__[\"default\"].fromTextNode(childNode, parent));\n      }\n    } else if (childNode instanceof defaultView.HTMLElement || childNode instanceof HTMLElement || defaultView.parent && childNode instanceof defaultView.parent.HTMLElement) {\n      if (IGNORED_NODE_NAMES.indexOf(childNode.nodeName) === -1) {\n        var container = new _NodeContainer__WEBPACK_IMPORTED_MODULE_1__[\"default\"](childNode, parent, resourceLoader, index++);\n\n        if (container.isVisible()) {\n          if (childNode.tagName === 'INPUT') {\n            // $FlowFixMe\n            Object(_Input__WEBPACK_IMPORTED_MODULE_3__[\"inlineInputElement\"])(childNode, container);\n          } else if (childNode.tagName === 'TEXTAREA') {\n            // $FlowFixMe\n            Object(_Input__WEBPACK_IMPORTED_MODULE_3__[\"inlineTextAreaElement\"])(childNode, container);\n          } else if (childNode.tagName === 'SELECT') {\n            // $FlowFixMe\n            Object(_Input__WEBPACK_IMPORTED_MODULE_3__[\"inlineSelectElement\"])(childNode, container);\n          } else if (container.style.listStyle && container.style.listStyle.listStyleType !== _parsing_listStyle__WEBPACK_IMPORTED_MODULE_5__[\"LIST_STYLE_TYPE\"].NONE) {\n            Object(_ListItem__WEBPACK_IMPORTED_MODULE_4__[\"inlineListItemElement\"])(childNode, container, resourceLoader);\n          }\n\n          var SHOULD_TRAVERSE_CHILDREN = childNode.tagName !== 'TEXTAREA';\n          var treatAsRealStackingContext = createsRealStackingContext(container, childNode);\n\n          if (treatAsRealStackingContext || createsStackingContext(container)) {\n            // for treatAsRealStackingContext:false, any positioned descendants and descendants\n            // which actually create a new stacking context should be considered part of the parent stacking context\n            var parentStack = treatAsRealStackingContext || container.isPositioned() ? stack.getRealParentStackingContext() : stack;\n            var childStack = new _StackingContext__WEBPACK_IMPORTED_MODULE_0__[\"default\"](container, parentStack, treatAsRealStackingContext);\n            parentStack.contexts.push(childStack);\n\n            if (SHOULD_TRAVERSE_CHILDREN) {\n              parseNodeTree(childNode, container, childStack, resourceLoader, index);\n            }\n          } else {\n            stack.children.push(container);\n\n            if (SHOULD_TRAVERSE_CHILDREN) {\n              parseNodeTree(childNode, container, stack, resourceLoader, index);\n            }\n          }\n        }\n      }\n    } else if (childNode instanceof defaultView.SVGSVGElement || childNode instanceof SVGSVGElement || defaultView.parent && childNode instanceof defaultView.parent.SVGSVGElement) {\n      var _container = new _NodeContainer__WEBPACK_IMPORTED_MODULE_1__[\"default\"](childNode, parent, resourceLoader, index++);\n\n      var _treatAsRealStackingContext = createsRealStackingContext(_container, childNode);\n\n      if (_treatAsRealStackingContext || createsStackingContext(_container)) {\n        // for treatAsRealStackingContext:false, any positioned descendants and descendants\n        // which actually create a new stacking context should be considered part of the parent stacking context\n        var _parentStack = _treatAsRealStackingContext || _container.isPositioned() ? stack.getRealParentStackingContext() : stack;\n\n        var _childStack = new _StackingContext__WEBPACK_IMPORTED_MODULE_0__[\"default\"](_container, _parentStack, _treatAsRealStackingContext);\n\n        _parentStack.contexts.push(_childStack);\n      } else {\n        stack.children.push(_container);\n      }\n    }\n  }\n};\n\nvar createsRealStackingContext = function createsRealStackingContext(container, node) {\n  return container.isRootElement() || container.isPositionedWithZIndex() || container.style.opacity < 1 || container.isTransformed() || isBodyWithTransparentRoot(container, node);\n};\n\nvar createsStackingContext = function createsStackingContext(container) {\n  return container.isPositioned() || container.isFloating();\n};\n\nvar isBodyWithTransparentRoot = function isBodyWithTransparentRoot(container, node) {\n  return node.nodeName === 'BODY' && container.parent instanceof _NodeContainer__WEBPACK_IMPORTED_MODULE_1__[\"default\"] && container.parent.style.background.backgroundColor.isTransparent();\n};\n\n//# sourceURL=webpack://html2canvas/./src/NodeParser.js?");

/***/ }),

/***/ "./src/Proxy.js":
/*!**********************!*\
  !*** ./src/Proxy.js ***!
  \**********************/
/*! exports provided: Proxy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Proxy\", function() { return Proxy; });\n/* harmony import */ var _Feature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Feature */ \"./src/Feature.js\");\n\n\n\nvar Proxy = function Proxy(src, options) {\n  if (!options.proxy) {\n    return Promise.reject( true ? 'No proxy defined' : undefined);\n  }\n\n  var proxy = options.proxy;\n  return new Promise(function (resolve, reject) {\n    var responseType = _Feature__WEBPACK_IMPORTED_MODULE_0__[\"default\"].SUPPORT_CORS_XHR && _Feature__WEBPACK_IMPORTED_MODULE_0__[\"default\"].SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';\n    var xhr = _Feature__WEBPACK_IMPORTED_MODULE_0__[\"default\"].SUPPORT_CORS_XHR ? new XMLHttpRequest() : new XDomainRequest();\n\n    xhr.onload = function () {\n      if (xhr instanceof XMLHttpRequest) {\n        if (xhr.status === 200) {\n          if (responseType === 'text') {\n            resolve(xhr.response);\n          } else {\n            var reader = new FileReader(); // $FlowFixMe\n\n            reader.addEventListener('load', function () {\n              return resolve(reader.result);\n            }, false); // $FlowFixMe\n\n            reader.addEventListener('error', function (e) {\n              return reject(e);\n            }, false);\n            reader.readAsDataURL(xhr.response);\n          }\n        } else {\n          reject( true ? \"Failed to proxy resource \".concat(src.substring(0, 256), \" with status code \").concat(xhr.status) : undefined);\n        }\n      } else {\n        resolve(xhr.responseText);\n      }\n    };\n\n    xhr.onerror = reject;\n    xhr.open('GET', \"\".concat(proxy, \"?url=\").concat(encodeURIComponent(src), \"&responseType=\").concat(responseType));\n\n    if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {\n      xhr.responseType = responseType;\n    }\n\n    if (options.imageTimeout) {\n      var timeout = options.imageTimeout;\n      xhr.timeout = timeout;\n\n      xhr.ontimeout = function () {\n        return reject( true ? \"Timed out (\".concat(timeout, \"ms) proxying \").concat(src.substring(0, 256)) : undefined);\n      };\n    }\n\n    xhr.send();\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/Proxy.js?");

/***/ }),

/***/ "./src/PseudoNodeContent.js":
/*!**********************************!*\
  !*** ./src/PseudoNodeContent.js ***!
  \**********************************/
/*! exports provided: PSEUDO_CONTENT_ITEM_TYPE, TOKEN_TYPE, parseCounterReset, popCounters, resolvePseudoContent, parseContent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PSEUDO_CONTENT_ITEM_TYPE\", function() { return PSEUDO_CONTENT_ITEM_TYPE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TOKEN_TYPE\", function() { return TOKEN_TYPE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseCounterReset\", function() { return parseCounterReset; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"popCounters\", function() { return popCounters; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"resolvePseudoContent\", function() { return resolvePseudoContent; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseContent\", function() { return parseContent; });\n/* harmony import */ var _ListItem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ListItem */ \"./src/ListItem.js\");\n/* harmony import */ var _parsing_listStyle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parsing/listStyle */ \"./src/parsing/listStyle.js\");\n\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\nvar PSEUDO_CONTENT_ITEM_TYPE = {\n  TEXT: 0,\n  IMAGE: 1\n};\nvar TOKEN_TYPE = {\n  STRING: 0,\n  ATTRIBUTE: 1,\n  URL: 2,\n  COUNTER: 3,\n  COUNTERS: 4,\n  OPENQUOTE: 5,\n  CLOSEQUOTE: 6\n};\nvar parseCounterReset = function parseCounterReset(style, data) {\n  if (!style || !style.counterReset || style.counterReset === 'none') {\n    return [];\n  }\n\n  var counterNames = [];\n  var counterResets = style.counterReset.split(/\\s*,\\s*/);\n  var lenCounterResets = counterResets.length;\n\n  for (var i = 0; i < lenCounterResets; i++) {\n    var _counterResets$i$spli = counterResets[i].split(/\\s+/),\n        _counterResets$i$spli2 = _slicedToArray(_counterResets$i$spli, 2),\n        counterName = _counterResets$i$spli2[0],\n        initialValue = _counterResets$i$spli2[1];\n\n    counterNames.push(counterName);\n    var counter = data.counters[counterName];\n\n    if (!counter) {\n      counter = data.counters[counterName] = [];\n    }\n\n    counter.push(parseInt(initialValue || 0, 10));\n  }\n\n  return counterNames;\n};\nvar popCounters = function popCounters(counterNames, data) {\n  var lenCounters = counterNames.length;\n\n  for (var i = 0; i < lenCounters; i++) {\n    data.counters[counterNames[i]].pop();\n  }\n};\nvar resolvePseudoContent = function resolvePseudoContent(node, style, data) {\n  if (!style || !style.content || style.content === 'none' || style.content === '-moz-alt-content' || style.display === 'none') {\n    return null;\n  }\n\n  var tokens = parseContent(style.content);\n  var len = tokens.length;\n  var contentItems = [];\n  var s = ''; // increment the counter (if there is a \"counter-increment\" declaration)\n\n  var counterIncrement = style.counterIncrement;\n\n  if (counterIncrement && counterIncrement !== 'none') {\n    var _counterIncrement$spl = counterIncrement.split(/\\s+/),\n        _counterIncrement$spl2 = _slicedToArray(_counterIncrement$spl, 2),\n        counterName = _counterIncrement$spl2[0],\n        incrementValue = _counterIncrement$spl2[1];\n\n    var counter = data.counters[counterName];\n\n    if (counter) {\n      counter[counter.length - 1] += incrementValue === undefined ? 1 : parseInt(incrementValue, 10);\n    }\n  } // build the content string\n\n\n  for (var i = 0; i < len; i++) {\n    var token = tokens[i];\n\n    switch (token.type) {\n      case TOKEN_TYPE.STRING:\n        s += token.value || '';\n        break;\n\n      case TOKEN_TYPE.ATTRIBUTE:\n        if (node instanceof HTMLElement && token.value) {\n          s += node.getAttribute(token.value) || '';\n        }\n\n        break;\n\n      case TOKEN_TYPE.COUNTER:\n        var _counter = data.counters[token.name || ''];\n\n        if (_counter) {\n          s += formatCounterValue([_counter[_counter.length - 1]], '', token.format);\n        }\n\n        break;\n\n      case TOKEN_TYPE.COUNTERS:\n        var counters = data.counters[token.name || ''];\n\n        if (counters) {\n          s += formatCounterValue(counters, token.glue, token.format);\n        }\n\n        break;\n\n      case TOKEN_TYPE.OPENQUOTE:\n        s += getQuote(style, true, data.quoteDepth);\n        data.quoteDepth++;\n        break;\n\n      case TOKEN_TYPE.CLOSEQUOTE:\n        data.quoteDepth--;\n        s += getQuote(style, false, data.quoteDepth);\n        break;\n\n      case TOKEN_TYPE.URL:\n        if (s) {\n          contentItems.push({\n            type: PSEUDO_CONTENT_ITEM_TYPE.TEXT,\n            value: s\n          });\n          s = '';\n        }\n\n        contentItems.push({\n          type: PSEUDO_CONTENT_ITEM_TYPE.IMAGE,\n          value: token.value || ''\n        });\n        break;\n    }\n  }\n\n  if (s) {\n    contentItems.push({\n      type: PSEUDO_CONTENT_ITEM_TYPE.TEXT,\n      value: s\n    });\n  }\n\n  return contentItems;\n};\nvar parseContent = function parseContent(content, cache) {\n  if (cache && cache[content]) {\n    return cache[content];\n  }\n\n  var tokens = [];\n  var len = content.length;\n  var isString = false;\n  var isEscaped = false;\n  var isFunction = false;\n  var str = '';\n  var functionName = '';\n  var args = [];\n\n  for (var i = 0; i < len; i++) {\n    var c = content.charAt(i);\n\n    switch (c) {\n      case \"'\":\n      case '\"':\n        if (isEscaped) {\n          str += c;\n        } else {\n          isString = !isString;\n\n          if (!isFunction && !isString) {\n            tokens.push({\n              type: TOKEN_TYPE.STRING,\n              value: str\n            });\n            str = '';\n          }\n        }\n\n        break;\n\n      case '\\\\':\n        if (isEscaped) {\n          str += c;\n          isEscaped = false;\n        } else {\n          isEscaped = true;\n        }\n\n        break;\n\n      case '(':\n        if (isString) {\n          str += c;\n        } else {\n          isFunction = true;\n          functionName = str;\n          str = '';\n          args = [];\n        }\n\n        break;\n\n      case ')':\n        if (isString) {\n          str += c;\n        } else if (isFunction) {\n          if (str) {\n            args.push(str);\n          }\n\n          switch (functionName) {\n            case 'attr':\n              if (args.length > 0) {\n                tokens.push({\n                  type: TOKEN_TYPE.ATTRIBUTE,\n                  value: args[0]\n                });\n              }\n\n              break;\n\n            case 'counter':\n              if (args.length > 0) {\n                var counter = {\n                  type: TOKEN_TYPE.COUNTER,\n                  name: args[0]\n                };\n\n                if (args.length > 1) {\n                  counter.format = args[1];\n                }\n\n                tokens.push(counter);\n              }\n\n              break;\n\n            case 'counters':\n              if (args.length > 0) {\n                var counters = {\n                  type: TOKEN_TYPE.COUNTERS,\n                  name: args[0]\n                };\n\n                if (args.length > 1) {\n                  counters.glue = args[1];\n                }\n\n                if (args.length > 2) {\n                  counters.format = args[2];\n                }\n\n                tokens.push(counters);\n              }\n\n              break;\n\n            case 'url':\n              if (args.length > 0) {\n                tokens.push({\n                  type: TOKEN_TYPE.URL,\n                  value: args[0]\n                });\n              }\n\n              break;\n          }\n\n          isFunction = false;\n          str = '';\n        }\n\n        break;\n\n      case ',':\n        if (isString) {\n          str += c;\n        } else if (isFunction) {\n          args.push(str);\n          str = '';\n        }\n\n        break;\n\n      case ' ':\n      case '\\t':\n        if (isString) {\n          str += c;\n        } else if (str) {\n          addOtherToken(tokens, str);\n          str = '';\n        }\n\n        break;\n\n      default:\n        str += c;\n    }\n\n    if (c !== '\\\\') {\n      isEscaped = false;\n    }\n  }\n\n  if (str) {\n    addOtherToken(tokens, str);\n  }\n\n  if (cache) {\n    cache[content] = tokens;\n  }\n\n  return tokens;\n};\n\nvar addOtherToken = function addOtherToken(tokens, identifier) {\n  switch (identifier) {\n    case 'open-quote':\n      tokens.push({\n        type: TOKEN_TYPE.OPENQUOTE\n      });\n      break;\n\n    case 'close-quote':\n      tokens.push({\n        type: TOKEN_TYPE.CLOSEQUOTE\n      });\n      break;\n  }\n};\n\nvar getQuote = function getQuote(style, isOpening, quoteDepth) {\n  var quotes = style.quotes ? style.quotes.split(/\\s+/) : [\"'\\\"'\", \"'\\\"'\"];\n  var idx = quoteDepth * 2;\n\n  if (idx >= quotes.length) {\n    idx = quotes.length - 2;\n  }\n\n  if (!isOpening) {\n    ++idx;\n  }\n\n  return quotes[idx].replace(/^[\"']|[\"']$/g, '');\n};\n\nvar formatCounterValue = function formatCounterValue(counter, glue, format) {\n  var len = counter.length;\n  var result = '';\n\n  for (var i = 0; i < len; i++) {\n    if (i > 0) {\n      result += glue || '';\n    }\n\n    result += Object(_ListItem__WEBPACK_IMPORTED_MODULE_0__[\"createCounterText\"])(counter[i], Object(_parsing_listStyle__WEBPACK_IMPORTED_MODULE_1__[\"parseListStyleType\"])(format || 'decimal'), false);\n  }\n\n  return result;\n};\n\n//# sourceURL=webpack://html2canvas/./src/PseudoNodeContent.js?");

/***/ }),

/***/ "./src/Renderer.js":
/*!*************************!*\
  !*** ./src/Renderer.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Renderer; });\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _Font__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Font */ \"./src/Font.js\");\n/* harmony import */ var _Gradient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Gradient */ \"./src/Gradient.js\");\n/* harmony import */ var _TextContainer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TextContainer */ \"./src/TextContainer.js\");\n/* harmony import */ var _parsing_background__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parsing/background */ \"./src/parsing/background.js\");\n/* harmony import */ var _parsing_border__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./parsing/border */ \"./src/parsing/border.js\");\n\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\n\n\n\n\nvar Renderer =\n/*#__PURE__*/\nfunction () {\n  function Renderer(target, options) {\n    _classCallCheck(this, Renderer);\n\n    this.target = target;\n    this.options = options;\n    target.render(options);\n  }\n\n  _createClass(Renderer, [{\n    key: \"renderNode\",\n    value: function renderNode(container) {\n      if (container.isVisible()) {\n        this.renderNodeBackgroundAndBorders(container);\n        this.renderNodeContent(container);\n      }\n    }\n  }, {\n    key: \"renderNodeContent\",\n    value: function renderNodeContent(container) {\n      var _this = this;\n\n      var callback = function callback() {\n        if (container.childNodes.length) {\n          container.childNodes.forEach(function (child) {\n            if (child instanceof _TextContainer__WEBPACK_IMPORTED_MODULE_3__[\"default\"]) {\n              var style = child.parent.style;\n\n              _this.target.renderTextNode(child.bounds, style.color, style.font, style.textDecoration, style.textShadow);\n            } else {\n              _this.target.drawShape(child, container.style.color);\n            }\n          });\n        }\n\n        if (container.image) {\n          var _image = _this.options.imageStore.get(container.image);\n\n          if (_image) {\n            var contentBox = Object(_Bounds__WEBPACK_IMPORTED_MODULE_0__[\"calculateContentBox\"])(container.bounds, container.style.padding, container.style.border);\n\n            var _width = typeof _image.width === 'number' && _image.width > 0 ? _image.width : contentBox.width;\n\n            var _height = typeof _image.height === 'number' && _image.height > 0 ? _image.height : contentBox.height;\n\n            if (_width > 0 && _height > 0) {\n              _this.target.clip([Object(_Bounds__WEBPACK_IMPORTED_MODULE_0__[\"calculatePaddingBoxPath\"])(container.curvedBounds)], function () {\n                _this.target.drawImage(_image, new _Bounds__WEBPACK_IMPORTED_MODULE_0__[\"Bounds\"](0, 0, _width, _height), contentBox);\n              });\n            }\n          }\n        }\n      };\n\n      var paths = container.getClipPaths();\n\n      if (paths.length) {\n        this.target.clip(paths, callback);\n      } else {\n        callback();\n      }\n    }\n  }, {\n    key: \"renderNodeBackgroundAndBorders\",\n    value: function renderNodeBackgroundAndBorders(container) {\n      var _this2 = this;\n\n      var HAS_BACKGROUND = !container.style.background.backgroundColor.isTransparent() || container.style.background.backgroundImage.length;\n      var hasRenderableBorders = container.style.border.some(function (border) {\n        return border.borderStyle !== _parsing_border__WEBPACK_IMPORTED_MODULE_5__[\"BORDER_STYLE\"].NONE && !border.borderColor.isTransparent();\n      });\n\n      var callback = function callback() {\n        var backgroundPaintingArea = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroungPaintingArea\"])(container.curvedBounds, container.style.background.backgroundClip);\n\n        if (HAS_BACKGROUND) {\n          _this2.target.clip([backgroundPaintingArea], function () {\n            if (!container.style.background.backgroundColor.isTransparent()) {\n              _this2.target.fill(container.style.background.backgroundColor);\n            }\n\n            _this2.renderBackgroundImage(container);\n          });\n        }\n\n        container.style.border.forEach(function (border, side) {\n          if (border.borderStyle !== _parsing_border__WEBPACK_IMPORTED_MODULE_5__[\"BORDER_STYLE\"].NONE && !border.borderColor.isTransparent()) {\n            _this2.renderBorder(border, side, container.curvedBounds);\n          }\n        });\n      };\n\n      if (HAS_BACKGROUND || hasRenderableBorders) {\n        var paths = container.parent ? container.parent.getClipPaths() : [];\n\n        if (paths.length) {\n          this.target.clip(paths, callback);\n        } else {\n          callback();\n        }\n      }\n    }\n  }, {\n    key: \"renderBackgroundImage\",\n    value: function renderBackgroundImage(container) {\n      var _this3 = this;\n\n      container.style.background.backgroundImage.slice(0).reverse().forEach(function (backgroundImage) {\n        if (backgroundImage.source.method === 'url' && backgroundImage.source.args.length) {\n          _this3.renderBackgroundRepeat(container, backgroundImage);\n        } else if (/gradient/i.test(backgroundImage.source.method)) {\n          _this3.renderBackgroundGradient(container, backgroundImage);\n        }\n      });\n    }\n  }, {\n    key: \"renderBackgroundRepeat\",\n    value: function renderBackgroundRepeat(container, background) {\n      var image = this.options.imageStore.get(background.source.args[0]);\n\n      if (image) {\n        var backgroundPositioningArea = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroungPositioningArea\"])(container.style.background.backgroundOrigin, container.bounds, container.style.padding, container.style.border);\n        var backgroundImageSize = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroundSize\"])(background, image, backgroundPositioningArea);\n        var position = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroundPosition\"])(background.position, backgroundImageSize, backgroundPositioningArea);\n\n        var _path = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroundRepeatPath\"])(background, position, backgroundImageSize, backgroundPositioningArea, container.bounds);\n\n        var _offsetX = Math.round(backgroundPositioningArea.left + position.x);\n\n        var _offsetY = Math.round(backgroundPositioningArea.top + position.y);\n\n        this.target.renderRepeat(_path, image, backgroundImageSize, _offsetX, _offsetY);\n      }\n    }\n  }, {\n    key: \"renderBackgroundGradient\",\n    value: function renderBackgroundGradient(container, background) {\n      var backgroundPositioningArea = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroungPositioningArea\"])(container.style.background.backgroundOrigin, container.bounds, container.style.padding, container.style.border);\n      var backgroundImageSize = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateGradientBackgroundSize\"])(background, backgroundPositioningArea);\n      var position = Object(_parsing_background__WEBPACK_IMPORTED_MODULE_4__[\"calculateBackgroundPosition\"])(background.position, backgroundImageSize, backgroundPositioningArea);\n      var gradientBounds = new _Bounds__WEBPACK_IMPORTED_MODULE_0__[\"Bounds\"](Math.round(backgroundPositioningArea.left + position.x), Math.round(backgroundPositioningArea.top + position.y), backgroundImageSize.width, backgroundImageSize.height);\n      var gradient = Object(_Gradient__WEBPACK_IMPORTED_MODULE_2__[\"parseGradient\"])(container, background.source, gradientBounds);\n\n      if (gradient) {\n        switch (gradient.type) {\n          case _Gradient__WEBPACK_IMPORTED_MODULE_2__[\"GRADIENT_TYPE\"].LINEAR_GRADIENT:\n            // $FlowFixMe\n            this.target.renderLinearGradient(gradientBounds, gradient);\n            break;\n\n          case _Gradient__WEBPACK_IMPORTED_MODULE_2__[\"GRADIENT_TYPE\"].RADIAL_GRADIENT:\n            // $FlowFixMe\n            this.target.renderRadialGradient(gradientBounds, gradient);\n            break;\n        }\n      }\n    }\n  }, {\n    key: \"renderBorder\",\n    value: function renderBorder(border, side, curvePoints) {\n      this.target.drawShape(Object(_Bounds__WEBPACK_IMPORTED_MODULE_0__[\"parsePathForBorder\"])(curvePoints, side), border.borderColor);\n    }\n  }, {\n    key: \"renderStack\",\n    value: function renderStack(stack) {\n      var _this4 = this;\n\n      if (stack.container.isVisible()) {\n        var _opacity = stack.getOpacity();\n\n        if (_opacity !== this._opacity) {\n          this.target.setOpacity(stack.getOpacity());\n          this._opacity = _opacity;\n        }\n\n        var transform = stack.container.style.transform;\n\n        if (transform !== null) {\n          this.target.transform(stack.container.bounds.left + transform.transformOrigin[0].value, stack.container.bounds.top + transform.transformOrigin[1].value, transform.transform, function () {\n            return _this4.renderStackContent(stack);\n          });\n        } else {\n          this.renderStackContent(stack);\n        }\n      }\n    }\n  }, {\n    key: \"renderStackContent\",\n    value: function renderStackContent(stack) {\n      var _splitStackingContext = splitStackingContexts(stack),\n          _splitStackingContext2 = _slicedToArray(_splitStackingContext, 5),\n          negativeZIndex = _splitStackingContext2[0],\n          zeroOrAutoZIndexOrTransformedOrOpacity = _splitStackingContext2[1],\n          positiveZIndex = _splitStackingContext2[2],\n          nonPositionedFloats = _splitStackingContext2[3],\n          nonPositionedInlineLevel = _splitStackingContext2[4];\n\n      var _splitDescendants = splitDescendants(stack),\n          _splitDescendants2 = _slicedToArray(_splitDescendants, 2),\n          inlineLevel = _splitDescendants2[0],\n          nonInlineLevel = _splitDescendants2[1]; // https://www.w3.org/TR/css-position-3/#painting-order\n      // 1. the background and borders of the element forming the stacking context.\n\n\n      this.renderNodeBackgroundAndBorders(stack.container); // 2. the child stacking contexts with negative stack levels (most negative first).\n\n      negativeZIndex.sort(sortByZIndex).forEach(this.renderStack, this); // 3. For all its in-flow, non-positioned, block-level descendants in tree order:\n\n      this.renderNodeContent(stack.container);\n      nonInlineLevel.forEach(this.renderNode, this); // 4. All non-positioned floating descendants, in tree order. For each one of these,\n      // treat the element as if it created a new stacking context, but any positioned descendants and descendants\n      // which actually create a new stacking context should be considered part of the parent stacking context,\n      // not this new one.\n\n      nonPositionedFloats.forEach(this.renderStack, this); // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.\n\n      nonPositionedInlineLevel.forEach(this.renderStack, this);\n      inlineLevel.forEach(this.renderNode, this); // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:\n      //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.\n      //  For those with 'z-index: auto', treat the element as if it created a new stacking context,\n      //  but any positioned descendants and descendants which actually create a new stacking context should be\n      //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',\n      //  treat the stacking context generated atomically.\n      //\n      //  All opacity descendants with opacity less than 1\n      //\n      //  All transform descendants with transform other than none\n\n      zeroOrAutoZIndexOrTransformedOrOpacity.forEach(this.renderStack, this); // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index\n      // order (smallest first) then tree order.\n\n      positiveZIndex.sort(sortByZIndex).forEach(this.renderStack, this);\n    }\n  }, {\n    key: \"render\",\n    value: function render(stack) {\n      var _this5 = this;\n\n      if (this.options.backgroundColor) {\n        this.target.rectangle(this.options.x, this.options.y, this.options.width, this.options.height, this.options.backgroundColor);\n      }\n\n      this.renderStack(stack);\n      var target = this.target.getTarget();\n\n      if (true) {\n        return target.then(function (output) {\n          _this5.options.logger.log(\"Render completed\");\n\n          return output;\n        });\n      }\n\n      return target;\n    }\n  }]);\n\n  return Renderer;\n}();\n\n\n\nvar splitDescendants = function splitDescendants(stack) {\n  var inlineLevel = [];\n  var nonInlineLevel = [];\n  var length = stack.children.length;\n\n  for (var i = 0; i < length; i++) {\n    var child = stack.children[i];\n\n    if (child.isInlineLevel()) {\n      inlineLevel.push(child);\n    } else {\n      nonInlineLevel.push(child);\n    }\n  }\n\n  return [inlineLevel, nonInlineLevel];\n};\n\nvar splitStackingContexts = function splitStackingContexts(stack) {\n  var negativeZIndex = [];\n  var zeroOrAutoZIndexOrTransformedOrOpacity = [];\n  var positiveZIndex = [];\n  var nonPositionedFloats = [];\n  var nonPositionedInlineLevel = [];\n  var length = stack.contexts.length;\n\n  for (var i = 0; i < length; i++) {\n    var child = stack.contexts[i];\n\n    if (child.container.isPositioned() || child.container.style.opacity < 1 || child.container.isTransformed()) {\n      if (child.container.style.zIndex.order < 0) {\n        negativeZIndex.push(child);\n      } else if (child.container.style.zIndex.order > 0) {\n        positiveZIndex.push(child);\n      } else {\n        zeroOrAutoZIndexOrTransformedOrOpacity.push(child);\n      }\n    } else {\n      if (child.container.isFloating()) {\n        nonPositionedFloats.push(child);\n      } else {\n        nonPositionedInlineLevel.push(child);\n      }\n    }\n  }\n\n  return [negativeZIndex, zeroOrAutoZIndexOrTransformedOrOpacity, positiveZIndex, nonPositionedFloats, nonPositionedInlineLevel];\n};\n\nvar sortByZIndex = function sortByZIndex(a, b) {\n  if (a.container.style.zIndex.order > b.container.style.zIndex.order) {\n    return 1;\n  } else if (a.container.style.zIndex.order < b.container.style.zIndex.order) {\n    return -1;\n  }\n\n  return a.container.index > b.container.index ? 1 : -1;\n};\n\n//# sourceURL=webpack://html2canvas/./src/Renderer.js?");

/***/ }),

/***/ "./src/ResourceLoader.js":
/*!*******************************!*\
  !*** ./src/ResourceLoader.js ***!
  \*******************************/
/*! exports provided: default, ResourceStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ResourceLoader; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ResourceStore\", function() { return ResourceStore; });\n/* harmony import */ var _Feature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Feature */ \"./src/Feature.js\");\n/* harmony import */ var _Proxy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Proxy */ \"./src/Proxy.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\nvar ResourceLoader =\n/*#__PURE__*/\nfunction () {\n  function ResourceLoader(options, logger, window) {\n    _classCallCheck(this, ResourceLoader);\n\n    this.options = options;\n    this._window = window;\n    this.origin = this.getOrigin(window.location.href);\n    this.cache = {};\n    this.logger = logger;\n    this._index = 0;\n  }\n\n  _createClass(ResourceLoader, [{\n    key: \"loadImage\",\n    value: function loadImage(src) {\n      var _this = this;\n\n      if (this.hasResourceInCache(src)) {\n        return src;\n      }\n\n      if (isBlobImage(src)) {\n        this.cache[src] = _loadImage(src, this.options.imageTimeout || 0);\n        return src;\n      }\n\n      if (!isSVG(src) || _Feature__WEBPACK_IMPORTED_MODULE_0__[\"default\"].SUPPORT_SVG_DRAWING) {\n        if (this.options.allowTaint === true || isInlineImage(src) || this.isSameOrigin(src)) {\n          return this.addImage(src, src, false);\n        } else if (!this.isSameOrigin(src)) {\n          if (typeof this.options.proxy === 'string') {\n            this.cache[src] = Object(_Proxy__WEBPACK_IMPORTED_MODULE_1__[\"Proxy\"])(src, this.options).then(function (src) {\n              return _loadImage(src, _this.options.imageTimeout || 0);\n            });\n            return src;\n          } else if (this.options.useCORS === true && _Feature__WEBPACK_IMPORTED_MODULE_0__[\"default\"].SUPPORT_CORS_IMAGES) {\n            return this.addImage(src, src, true);\n          }\n        }\n      }\n    }\n  }, {\n    key: \"inlineImage\",\n    value: function inlineImage(src) {\n      var _this2 = this;\n\n      if (isInlineImage(src)) {\n        return _loadImage(src, this.options.imageTimeout || 0);\n      }\n\n      if (this.hasResourceInCache(src)) {\n        return this.cache[src];\n      }\n\n      if (!this.isSameOrigin(src) && typeof this.options.proxy === 'string') {\n        return this.cache[src] = Object(_Proxy__WEBPACK_IMPORTED_MODULE_1__[\"Proxy\"])(src, this.options).then(function (src) {\n          return _loadImage(src, _this2.options.imageTimeout || 0);\n        });\n      }\n\n      return this.xhrImage(src);\n    }\n  }, {\n    key: \"xhrImage\",\n    value: function xhrImage(src) {\n      var _this3 = this;\n\n      this.cache[src] = new Promise(function (resolve, reject) {\n        var xhr = new XMLHttpRequest();\n\n        xhr.onreadystatechange = function () {\n          if (xhr.readyState === 4) {\n            if (xhr.status !== 200) {\n              reject(\"Failed to fetch image \".concat(src.substring(0, 256), \" with status code \").concat(xhr.status));\n            } else {\n              var reader = new FileReader();\n              reader.addEventListener('load', function () {\n                // $FlowFixMe\n                var result = reader.result;\n                resolve(result);\n              }, false);\n              reader.addEventListener('error', function (e) {\n                return reject(e);\n              }, false);\n              reader.readAsDataURL(xhr.response);\n            }\n          }\n        };\n\n        xhr.responseType = 'blob';\n\n        if (_this3.options.imageTimeout) {\n          var timeout = _this3.options.imageTimeout;\n          xhr.timeout = timeout;\n\n          xhr.ontimeout = function () {\n            return reject( true ? \"Timed out (\".concat(timeout, \"ms) fetching \").concat(src.substring(0, 256)) : undefined);\n          };\n        }\n\n        xhr.open('GET', src, true);\n        xhr.send();\n      }).then(function (src) {\n        return _loadImage(src, _this3.options.imageTimeout || 0);\n      });\n      return this.cache[src];\n    }\n  }, {\n    key: \"loadCanvas\",\n    value: function loadCanvas(node) {\n      var key = String(this._index++);\n      this.cache[key] = Promise.resolve(node);\n      return key;\n    }\n  }, {\n    key: \"hasResourceInCache\",\n    value: function hasResourceInCache(key) {\n      return typeof this.cache[key] !== 'undefined';\n    }\n  }, {\n    key: \"addImage\",\n    value: function addImage(key, src, useCORS) {\n      var _this4 = this;\n\n      if (true) {\n        this.logger.log(\"Added image \".concat(key.substring(0, 256)));\n      }\n\n      this.cache[key] = new Promise(function (resolve, reject) {\n        var img = new Image();\n\n        img.onload = function () {\n          return resolve(img);\n        }; //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous\n\n\n        if (isInlineBase64Image(src) || useCORS) {\n          img.crossOrigin = 'anonymous';\n        }\n\n        img.onerror = reject;\n        img.src = src;\n\n        if (img.complete === true) {\n          // Inline XML images may fail to parse, throwing an Error later on\n          setTimeout(function () {\n            resolve(img);\n          }, 500);\n        }\n\n        if (_this4.options.imageTimeout) {\n          var timeout = _this4.options.imageTimeout;\n          setTimeout(function () {\n            return reject( true ? \"Timed out (\".concat(timeout, \"ms) fetching \").concat(src.substring(0, 256)) : undefined);\n          }, timeout);\n        }\n      });\n      return key;\n    }\n  }, {\n    key: \"isSameOrigin\",\n    value: function isSameOrigin(url) {\n      return this.getOrigin(url) === this.origin;\n    }\n  }, {\n    key: \"getOrigin\",\n    value: function getOrigin(url) {\n      var link = this._link || (this._link = this._window.document.createElement('a'));\n\n      link.href = url;\n      link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/\n\n      return link.protocol + link.hostname + link.port;\n    }\n  }, {\n    key: \"ready\",\n    value: function ready() {\n      var _this5 = this;\n\n      var keys = Object.keys(this.cache);\n      var values = keys.map(function (str) {\n        return _this5.cache[str].catch(function (e) {\n          if (true) {\n            _this5.logger.log(\"Unable to load image\", e);\n          }\n\n          return null;\n        });\n      });\n      return Promise.all(values).then(function (images) {\n        if (true) {\n          _this5.logger.log(\"Finished loading \".concat(images.length, \" images\"), images);\n        }\n\n        return new ResourceStore(keys, images);\n      });\n    }\n  }]);\n\n  return ResourceLoader;\n}();\n\n\nvar ResourceStore =\n/*#__PURE__*/\nfunction () {\n  function ResourceStore(keys, resources) {\n    _classCallCheck(this, ResourceStore);\n\n    this._keys = keys;\n    this._resources = resources;\n  }\n\n  _createClass(ResourceStore, [{\n    key: \"get\",\n    value: function get(key) {\n      var index = this._keys.indexOf(key);\n\n      return index === -1 ? null : this._resources[index];\n    }\n  }]);\n\n  return ResourceStore;\n}();\nvar INLINE_SVG = /^data:image\\/svg\\+xml/i;\nvar INLINE_BASE64 = /^data:image\\/.*;base64,/i;\nvar INLINE_IMG = /^data:image\\/.*/i;\n\nvar isInlineImage = function isInlineImage(src) {\n  return INLINE_IMG.test(src);\n};\n\nvar isInlineBase64Image = function isInlineBase64Image(src) {\n  return INLINE_BASE64.test(src);\n};\n\nvar isBlobImage = function isBlobImage(src) {\n  return src.substr(0, 4) === 'blob';\n};\n\nvar isSVG = function isSVG(src) {\n  return src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src);\n};\n\nvar _loadImage = function _loadImage(src, timeout) {\n  return new Promise(function (resolve, reject) {\n    var img = new Image();\n\n    img.onload = function () {\n      return resolve(img);\n    };\n\n    img.onerror = reject;\n    img.src = src;\n\n    if (img.complete === true) {\n      // Inline XML images may fail to parse, throwing an Error later on\n      setTimeout(function () {\n        resolve(img);\n      }, 500);\n    }\n\n    if (timeout) {\n      setTimeout(function () {\n        return reject( true ? \"Timed out (\".concat(timeout, \"ms) loading image\") : undefined);\n      }, timeout);\n    }\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/ResourceLoader.js?");

/***/ }),

/***/ "./src/StackingContext.js":
/*!********************************!*\
  !*** ./src/StackingContext.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return StackingContext; });\n/* harmony import */ var _NodeContainer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NodeContainer */ \"./src/NodeContainer.js\");\n/* harmony import */ var _parsing_position__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parsing/position */ \"./src/parsing/position.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\nvar StackingContext =\n/*#__PURE__*/\nfunction () {\n  function StackingContext(container, parent, treatAsRealStackingContext) {\n    _classCallCheck(this, StackingContext);\n\n    this.container = container;\n    this.parent = parent;\n    this.contexts = [];\n    this.children = [];\n    this.treatAsRealStackingContext = treatAsRealStackingContext;\n  }\n\n  _createClass(StackingContext, [{\n    key: \"getOpacity\",\n    value: function getOpacity() {\n      return this.parent ? this.container.style.opacity * this.parent.getOpacity() : this.container.style.opacity;\n    }\n  }, {\n    key: \"getRealParentStackingContext\",\n    value: function getRealParentStackingContext() {\n      return !this.parent || this.treatAsRealStackingContext ? this : this.parent.getRealParentStackingContext();\n    }\n  }]);\n\n  return StackingContext;\n}();\n\n\n\n//# sourceURL=webpack://html2canvas/./src/StackingContext.js?");

/***/ }),

/***/ "./src/TextBounds.js":
/*!***************************!*\
  !*** ./src/TextBounds.js ***!
  \***************************/
/*! exports provided: TextBounds, parseTextBounds */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TextBounds\", function() { return TextBounds; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseTextBounds\", function() { return parseTextBounds; });\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parsing/textDecoration */ \"./src/parsing/textDecoration.js\");\n/* harmony import */ var _Feature__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Feature */ \"./src/Feature.js\");\n/* harmony import */ var _Unicode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Unicode */ \"./src/Unicode.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n\n\n\n\nvar TextBounds = function TextBounds(text, bounds) {\n  _classCallCheck(this, TextBounds);\n\n  this.text = text;\n  this.bounds = bounds;\n};\nvar parseTextBounds = function parseTextBounds(value, parent, node) {\n  var letterRendering = parent.style.letterSpacing !== 0;\n  var textList = letterRendering ? Object(_Unicode__WEBPACK_IMPORTED_MODULE_3__[\"toCodePoints\"])(value).map(function (i) {\n    return Object(_Unicode__WEBPACK_IMPORTED_MODULE_3__[\"fromCodePoint\"])(i);\n  }) : Object(_Unicode__WEBPACK_IMPORTED_MODULE_3__[\"breakWords\"])(value, parent);\n  var length = textList.length;\n  var defaultView = node.parentNode ? node.parentNode.ownerDocument.defaultView : null;\n  var scrollX = defaultView ? defaultView.pageXOffset : 0;\n  var scrollY = defaultView ? defaultView.pageYOffset : 0;\n  var textBounds = [];\n  var offset = 0;\n\n  for (var i = 0; i < length; i++) {\n    var text = textList[i];\n\n    if (parent.style.textDecoration !== _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_1__[\"TEXT_DECORATION\"].NONE || text.trim().length > 0) {\n      if (_Feature__WEBPACK_IMPORTED_MODULE_2__[\"default\"].SUPPORT_RANGE_BOUNDS) {\n        textBounds.push(new TextBounds(text, getRangeBounds(node, offset, text.length, scrollX, scrollY)));\n      } else {\n        var replacementNode = node.splitText(text.length);\n        textBounds.push(new TextBounds(text, getWrapperBounds(node, scrollX, scrollY)));\n        node = replacementNode;\n      }\n    } else if (!_Feature__WEBPACK_IMPORTED_MODULE_2__[\"default\"].SUPPORT_RANGE_BOUNDS) {\n      node = node.splitText(text.length);\n    }\n\n    offset += text.length;\n  }\n\n  return textBounds;\n};\n\nvar getWrapperBounds = function getWrapperBounds(node, scrollX, scrollY) {\n  var wrapper = node.ownerDocument.createElement('html2canvaswrapper');\n  wrapper.appendChild(node.cloneNode(true));\n  var parentNode = node.parentNode;\n\n  if (parentNode) {\n    parentNode.replaceChild(wrapper, node);\n    var bounds = Object(_Bounds__WEBPACK_IMPORTED_MODULE_0__[\"parseBounds\"])(wrapper, scrollX, scrollY);\n\n    if (wrapper.firstChild) {\n      parentNode.replaceChild(wrapper.firstChild, wrapper);\n    }\n\n    return bounds;\n  }\n\n  return new _Bounds__WEBPACK_IMPORTED_MODULE_0__[\"Bounds\"](0, 0, 0, 0);\n};\n\nvar getRangeBounds = function getRangeBounds(node, offset, length, scrollX, scrollY) {\n  var range = node.ownerDocument.createRange();\n  range.setStart(node, offset);\n  range.setEnd(node, offset + length);\n  return _Bounds__WEBPACK_IMPORTED_MODULE_0__[\"Bounds\"].fromClientRect(range.getBoundingClientRect(), scrollX, scrollY);\n};\n\n//# sourceURL=webpack://html2canvas/./src/TextBounds.js?");

/***/ }),

/***/ "./src/TextContainer.js":
/*!******************************!*\
  !*** ./src/TextContainer.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return TextContainer; });\n/* harmony import */ var _parsing_textTransform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parsing/textTransform */ \"./src/parsing/textTransform.js\");\n/* harmony import */ var _TextBounds__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TextBounds */ \"./src/TextBounds.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\nvar TextContainer =\n/*#__PURE__*/\nfunction () {\n  function TextContainer(text, parent, bounds) {\n    _classCallCheck(this, TextContainer);\n\n    this.text = text;\n    this.parent = parent;\n    this.bounds = bounds;\n  }\n\n  _createClass(TextContainer, null, [{\n    key: \"fromTextNode\",\n    value: function fromTextNode(node, parent) {\n      var text = transform(node.data, parent.style.textTransform);\n      return new TextContainer(text, parent, Object(_TextBounds__WEBPACK_IMPORTED_MODULE_1__[\"parseTextBounds\"])(text, parent, node));\n    }\n  }]);\n\n  return TextContainer;\n}();\n\n\nvar CAPITALIZE = /(^|\\s|:|-|\\(|\\))([a-z])/g;\n\nvar transform = function transform(text, _transform) {\n  switch (_transform) {\n    case _parsing_textTransform__WEBPACK_IMPORTED_MODULE_0__[\"TEXT_TRANSFORM\"].LOWERCASE:\n      return text.toLowerCase();\n\n    case _parsing_textTransform__WEBPACK_IMPORTED_MODULE_0__[\"TEXT_TRANSFORM\"].CAPITALIZE:\n      return text.replace(CAPITALIZE, capitalize);\n\n    case _parsing_textTransform__WEBPACK_IMPORTED_MODULE_0__[\"TEXT_TRANSFORM\"].UPPERCASE:\n      return text.toUpperCase();\n\n    default:\n      return text;\n  }\n};\n\nfunction capitalize(m, p1, p2) {\n  if (m.length > 0) {\n    return p1 + p2.toUpperCase();\n  }\n\n  return m;\n}\n\n//# sourceURL=webpack://html2canvas/./src/TextContainer.js?");

/***/ }),

/***/ "./src/Unicode.js":
/*!************************!*\
  !*** ./src/Unicode.js ***!
  \************************/
/*! exports provided: toCodePoints, fromCodePoint, breakWords */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"breakWords\", function() { return breakWords; });\n/* harmony import */ var css_line_break__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! css-line-break */ \"./node_modules/css-line-break/dist/index.js\");\n/* harmony import */ var css_line_break__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(css_line_break__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _parsing_overflowWrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parsing/overflowWrap */ \"./src/parsing/overflowWrap.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"toCodePoints\", function() { return css_line_break__WEBPACK_IMPORTED_MODULE_0__[\"toCodePoints\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"fromCodePoint\", function() { return css_line_break__WEBPACK_IMPORTED_MODULE_0__[\"fromCodePoint\"]; });\n\n\n\n\n\n\nvar breakWords = function breakWords(str, parent) {\n  var breaker = Object(css_line_break__WEBPACK_IMPORTED_MODULE_0__[\"LineBreaker\"])(str, {\n    lineBreak: parent.style.lineBreak,\n    wordBreak: parent.style.overflowWrap === _parsing_overflowWrap__WEBPACK_IMPORTED_MODULE_1__[\"OVERFLOW_WRAP\"].BREAK_WORD ? 'break-word' : parent.style.wordBreak\n  });\n  var words = [];\n  var bk;\n\n  while (!(bk = breaker.next()).done) {\n    words.push(bk.value.slice());\n  }\n\n  return words;\n};\n\n//# sourceURL=webpack://html2canvas/./src/Unicode.js?");

/***/ }),

/***/ "./src/Util.js":
/*!*********************!*\
  !*** ./src/Util.js ***!
  \*********************/
/*! exports provided: contains, distance, copyCSSStyles, SMALL_IMAGE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"contains\", function() { return contains; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"distance\", function() { return distance; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"copyCSSStyles\", function() { return copyCSSStyles; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"SMALL_IMAGE\", function() { return SMALL_IMAGE; });\n\n\nvar contains = function contains(bit, value) {\n  return (bit & value) !== 0;\n};\nvar distance = function distance(a, b) {\n  return Math.sqrt(a * a + b * b);\n};\nvar copyCSSStyles = function copyCSSStyles(style, target) {\n  // Edge does not provide value for cssText\n  for (var i = style.length - 1; i >= 0; i--) {\n    var property = style.item(i); // Safari shows pseudoelements if content is set\n\n    if (property !== 'content') {\n      target.style.setProperty(property, style.getPropertyValue(property));\n    }\n  }\n\n  return target;\n};\nvar SMALL_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';\n\n//# sourceURL=webpack://html2canvas/./src/Util.js?");

/***/ }),

/***/ "./src/Window.js":
/*!***********************!*\
  !*** ./src/Window.js ***!
  \***********************/
/*! exports provided: renderElement */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"renderElement\", function() { return renderElement; });\n/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ \"./src/Logger.js\");\n/* harmony import */ var _NodeParser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NodeParser */ \"./src/NodeParser.js\");\n/* harmony import */ var _Renderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Renderer */ \"./src/Renderer.js\");\n/* harmony import */ var _renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./renderer/ForeignObjectRenderer */ \"./src/renderer/ForeignObjectRenderer.js\");\n/* harmony import */ var _Feature__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Feature */ \"./src/Feature.js\");\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _Clone__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Clone */ \"./src/Clone.js\");\n/* harmony import */ var _Font__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Font */ \"./src/Font.js\");\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Color */ \"./src/Color.js\");\n\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\n\n\n\n\n\n\n\n\nvar renderElement = function renderElement(element, options, logger) {\n  var ownerDocument = element.ownerDocument;\n  var windowBounds = new _Bounds__WEBPACK_IMPORTED_MODULE_5__[\"Bounds\"](options.scrollX, options.scrollY, options.windowWidth, options.windowHeight); // http://www.w3.org/TR/css3-background/#special-backgrounds\n\n  var documentBackgroundColor = ownerDocument.documentElement ? new _Color__WEBPACK_IMPORTED_MODULE_8__[\"default\"](getComputedStyle(ownerDocument.documentElement).backgroundColor) : _Color__WEBPACK_IMPORTED_MODULE_8__[\"TRANSPARENT\"];\n  var bodyBackgroundColor = ownerDocument.body ? new _Color__WEBPACK_IMPORTED_MODULE_8__[\"default\"](getComputedStyle(ownerDocument.body).backgroundColor) : _Color__WEBPACK_IMPORTED_MODULE_8__[\"TRANSPARENT\"];\n  var backgroundColor = element === ownerDocument.documentElement ? documentBackgroundColor.isTransparent() ? bodyBackgroundColor.isTransparent() ? options.backgroundColor ? new _Color__WEBPACK_IMPORTED_MODULE_8__[\"default\"](options.backgroundColor) : null : bodyBackgroundColor : documentBackgroundColor : options.backgroundColor ? new _Color__WEBPACK_IMPORTED_MODULE_8__[\"default\"](options.backgroundColor) : null;\n  return (options.foreignObjectRendering ? // $FlowFixMe\n  _Feature__WEBPACK_IMPORTED_MODULE_4__[\"default\"].SUPPORT_FOREIGNOBJECT_DRAWING : Promise.resolve(false)).then(function (supportForeignObject) {\n    return supportForeignObject ? function (cloner) {\n      if (true) {\n        logger.log(\"Document cloned, using foreignObject rendering\");\n      }\n\n      return cloner.inlineFonts(ownerDocument).then(function () {\n        return cloner.resourceLoader.ready();\n      }).then(function () {\n        var renderer = new _renderer_ForeignObjectRenderer__WEBPACK_IMPORTED_MODULE_3__[\"default\"](cloner.documentElement);\n        var defaultView = ownerDocument.defaultView;\n        var scrollX = defaultView.pageXOffset;\n        var scrollY = defaultView.pageYOffset;\n        var isDocument = element.tagName === 'HTML' || element.tagName === 'BODY';\n\n        var _ref = isDocument ? Object(_Bounds__WEBPACK_IMPORTED_MODULE_5__[\"parseDocumentSize\"])(ownerDocument) : Object(_Bounds__WEBPACK_IMPORTED_MODULE_5__[\"parseBounds\"])(element, scrollX, scrollY),\n            width = _ref.width,\n            height = _ref.height,\n            left = _ref.left,\n            top = _ref.top;\n\n        return renderer.render({\n          backgroundColor: backgroundColor,\n          logger: logger,\n          scale: options.scale,\n          x: typeof options.x === 'number' ? options.x : left,\n          y: typeof options.y === 'number' ? options.y : top,\n          width: typeof options.width === 'number' ? options.width : Math.ceil(width),\n          height: typeof options.height === 'number' ? options.height : Math.ceil(height),\n          windowWidth: options.windowWidth,\n          windowHeight: options.windowHeight,\n          scrollX: options.scrollX,\n          scrollY: options.scrollY\n        });\n      });\n    }(new _Clone__WEBPACK_IMPORTED_MODULE_6__[\"DocumentCloner\"](element, options, logger, true, renderElement)) : Object(_Clone__WEBPACK_IMPORTED_MODULE_6__[\"cloneWindow\"])(ownerDocument, windowBounds, element, options, logger, renderElement).then(function (_ref2) {\n      var _ref3 = _slicedToArray(_ref2, 3),\n          container = _ref3[0],\n          clonedElement = _ref3[1],\n          resourceLoader = _ref3[2];\n\n      if (true) {\n        logger.log(\"Document cloned, using computed rendering\");\n      }\n\n      var stack = Object(_NodeParser__WEBPACK_IMPORTED_MODULE_1__[\"NodeParser\"])(clonedElement, resourceLoader, logger);\n      var clonedDocument = clonedElement.ownerDocument;\n\n      if (backgroundColor === stack.container.style.background.backgroundColor) {\n        stack.container.style.background.backgroundColor = _Color__WEBPACK_IMPORTED_MODULE_8__[\"TRANSPARENT\"];\n      }\n\n      return resourceLoader.ready().then(function (imageStore) {\n        var fontMetrics = new _Font__WEBPACK_IMPORTED_MODULE_7__[\"FontMetrics\"](clonedDocument);\n\n        if (true) {\n          logger.log(\"Starting renderer\");\n        }\n\n        var defaultView = clonedDocument.defaultView;\n        var scrollX = defaultView.pageXOffset;\n        var scrollY = defaultView.pageYOffset;\n        var isDocument = clonedElement.tagName === 'HTML' || clonedElement.tagName === 'BODY';\n\n        var _ref4 = isDocument ? Object(_Bounds__WEBPACK_IMPORTED_MODULE_5__[\"parseDocumentSize\"])(ownerDocument) : Object(_Bounds__WEBPACK_IMPORTED_MODULE_5__[\"parseBounds\"])(clonedElement, scrollX, scrollY),\n            width = _ref4.width,\n            height = _ref4.height,\n            left = _ref4.left,\n            top = _ref4.top;\n\n        var renderOptions = {\n          backgroundColor: backgroundColor,\n          fontMetrics: fontMetrics,\n          imageStore: imageStore,\n          logger: logger,\n          scale: options.scale,\n          x: typeof options.x === 'number' ? options.x : left,\n          y: typeof options.y === 'number' ? options.y : top,\n          width: typeof options.width === 'number' ? options.width : Math.ceil(width),\n          height: typeof options.height === 'number' ? options.height : Math.ceil(height)\n        };\n\n        if (Array.isArray(options.target)) {\n          return Promise.all(options.target.map(function (target) {\n            var renderer = new _Renderer__WEBPACK_IMPORTED_MODULE_2__[\"default\"](target, renderOptions);\n            return renderer.render(stack);\n          }));\n        } else {\n          var renderer = new _Renderer__WEBPACK_IMPORTED_MODULE_2__[\"default\"](options.target, renderOptions);\n          var canvas = renderer.render(stack);\n\n          if (options.removeContainer === true) {\n            if (container.parentNode) {\n              container.parentNode.removeChild(container);\n            } else if (true) {\n              logger.log(\"Cannot detach cloned iframe as it is not in the DOM anymore\");\n            }\n          }\n\n          return canvas;\n        }\n      });\n    });\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/Window.js?");

/***/ }),

/***/ "./src/drawing/BezierCurve.js":
/*!************************************!*\
  !*** ./src/drawing/BezierCurve.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return BezierCurve; });\n/* harmony import */ var _Path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Path */ \"./src/drawing/Path.js\");\n/* harmony import */ var _Vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Vector */ \"./src/drawing/Vector.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\nvar lerp = function lerp(a, b, t) {\n  return new _Vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"](a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);\n};\n\nvar BezierCurve =\n/*#__PURE__*/\nfunction () {\n  function BezierCurve(start, startControl, endControl, end) {\n    _classCallCheck(this, BezierCurve);\n\n    this.type = _Path__WEBPACK_IMPORTED_MODULE_0__[\"PATH\"].BEZIER_CURVE;\n    this.start = start;\n    this.startControl = startControl;\n    this.endControl = endControl;\n    this.end = end;\n  }\n\n  _createClass(BezierCurve, [{\n    key: \"subdivide\",\n    value: function subdivide(t, firstHalf) {\n      var ab = lerp(this.start, this.startControl, t);\n      var bc = lerp(this.startControl, this.endControl, t);\n      var cd = lerp(this.endControl, this.end, t);\n      var abbc = lerp(ab, bc, t);\n      var bccd = lerp(bc, cd, t);\n      var dest = lerp(abbc, bccd, t);\n      return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);\n    }\n  }, {\n    key: \"reverse\",\n    value: function reverse() {\n      return new BezierCurve(this.end, this.endControl, this.startControl, this.start);\n    }\n  }]);\n\n  return BezierCurve;\n}();\n\n\n\n//# sourceURL=webpack://html2canvas/./src/drawing/BezierCurve.js?");

/***/ }),

/***/ "./src/drawing/Circle.js":
/*!*******************************!*\
  !*** ./src/drawing/Circle.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Circle; });\n/* harmony import */ var _Path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Path */ \"./src/drawing/Path.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n\n\nvar Circle = function Circle(x, y, radius) {\n  _classCallCheck(this, Circle);\n\n  this.type = _Path__WEBPACK_IMPORTED_MODULE_0__[\"PATH\"].CIRCLE;\n  this.x = x;\n  this.y = y;\n  this.radius = radius;\n\n  if (true) {\n    if (isNaN(x)) {\n      console.error(\"Invalid x value given for Circle\");\n    }\n\n    if (isNaN(y)) {\n      console.error(\"Invalid y value given for Circle\");\n    }\n\n    if (isNaN(radius)) {\n      console.error(\"Invalid radius value given for Circle\");\n    }\n  }\n};\n\n\n\n//# sourceURL=webpack://html2canvas/./src/drawing/Circle.js?");

/***/ }),

/***/ "./src/drawing/Path.js":
/*!*****************************!*\
  !*** ./src/drawing/Path.js ***!
  \*****************************/
/*! exports provided: PATH */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PATH\", function() { return PATH; });\n\n\nvar PATH = {\n  VECTOR: 0,\n  BEZIER_CURVE: 1,\n  CIRCLE: 2\n};\n\n//# sourceURL=webpack://html2canvas/./src/drawing/Path.js?");

/***/ }),

/***/ "./src/drawing/Size.js":
/*!*****************************!*\
  !*** ./src/drawing/Size.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Size; });\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Size = function Size(width, height) {\n  _classCallCheck(this, Size);\n\n  this.width = width;\n  this.height = height;\n};\n\n\n\n//# sourceURL=webpack://html2canvas/./src/drawing/Size.js?");

/***/ }),

/***/ "./src/drawing/Vector.js":
/*!*******************************!*\
  !*** ./src/drawing/Vector.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Vector; });\n/* harmony import */ var _Path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Path */ \"./src/drawing/Path.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n\n\nvar Vector = function Vector(x, y) {\n  _classCallCheck(this, Vector);\n\n  this.type = _Path__WEBPACK_IMPORTED_MODULE_0__[\"PATH\"].VECTOR;\n  this.x = x;\n  this.y = y;\n\n  if (true) {\n    if (isNaN(x)) {\n      console.error(\"Invalid x value given for Vector\");\n    }\n\n    if (isNaN(y)) {\n      console.error(\"Invalid y value given for Vector\");\n    }\n  }\n};\n\n\n\n//# sourceURL=webpack://html2canvas/./src/drawing/Vector.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _renderer_CanvasRenderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./renderer/CanvasRenderer */ \"./src/renderer/CanvasRenderer.js\");\n/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Logger */ \"./src/Logger.js\");\n/* harmony import */ var _Window__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Window */ \"./src/Window.js\");\n\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\n\nvar html2canvas = function html2canvas(element, conf) {\n  var config = conf || {};\n  var logger = new _Logger__WEBPACK_IMPORTED_MODULE_1__[\"default\"](typeof config.logging === 'boolean' ? config.logging : true);\n  logger.log(\"html2canvas \".concat(\"1.0.0-rc.1\"));\n\n  if ( true && typeof config.onrendered === 'function') {\n    logger.error(\"onrendered option is deprecated, html2canvas returns a Promise with the canvas as the value\");\n  }\n\n  var ownerDocument = element.ownerDocument;\n\n  if (!ownerDocument) {\n    return Promise.reject(\"Provided element is not within a Document\");\n  }\n\n  var defaultView = ownerDocument.defaultView;\n  var defaultOptions = {\n    allowTaint: false,\n    backgroundColor: '#ffffff',\n    imageTimeout: 15000,\n    logging: true,\n    proxy: null,\n    removeContainer: true,\n    foreignObjectRendering: false,\n    scale: defaultView.devicePixelRatio || 1,\n    target: new _renderer_CanvasRenderer__WEBPACK_IMPORTED_MODULE_0__[\"default\"](config.canvas),\n    useCORS: false,\n    windowWidth: defaultView.innerWidth,\n    windowHeight: defaultView.innerHeight,\n    scrollX: defaultView.pageXOffset,\n    scrollY: defaultView.pageYOffset\n  };\n  var result = Object(_Window__WEBPACK_IMPORTED_MODULE_2__[\"renderElement\"])(element, _objectSpread({}, defaultOptions, config), logger);\n\n  if (true) {\n    return result.catch(function (e) {\n      logger.error(e);\n      throw e;\n    });\n  }\n\n  return result;\n};\n\nhtml2canvas.CanvasRenderer = _renderer_CanvasRenderer__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\n/* harmony default export */ __webpack_exports__[\"default\"] = (html2canvas);\n\n//# sourceURL=webpack://html2canvas/./src/index.js?");

/***/ }),

/***/ "./src/parsing/background.js":
/*!***********************************!*\
  !*** ./src/parsing/background.js ***!
  \***********************************/
/*! exports provided: BACKGROUND_REPEAT, BACKGROUND_SIZE, BACKGROUND_CLIP, BACKGROUND_ORIGIN, calculateBackgroundSize, calculateGradientBackgroundSize, calculateBackgroungPaintingArea, calculateBackgroungPositioningArea, calculateBackgroundPosition, calculateBackgroundRepeatPath, parseBackground, parseBackgroundImage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BACKGROUND_REPEAT\", function() { return BACKGROUND_REPEAT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BACKGROUND_SIZE\", function() { return BACKGROUND_SIZE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BACKGROUND_CLIP\", function() { return BACKGROUND_CLIP; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BACKGROUND_ORIGIN\", function() { return BACKGROUND_ORIGIN; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateBackgroundSize\", function() { return calculateBackgroundSize; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateGradientBackgroundSize\", function() { return calculateGradientBackgroundSize; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateBackgroungPaintingArea\", function() { return calculateBackgroungPaintingArea; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateBackgroungPositioningArea\", function() { return calculateBackgroungPositioningArea; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateBackgroundPosition\", function() { return calculateBackgroundPosition; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"calculateBackgroundRepeatPath\", function() { return calculateBackgroundRepeatPath; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseBackground\", function() { return parseBackground; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseBackgroundImage\", function() { return parseBackgroundImage; });\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color */ \"./src/Color.js\");\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Length */ \"./src/Length.js\");\n/* harmony import */ var _drawing_Size__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../drawing/Size */ \"./src/drawing/Size.js\");\n/* harmony import */ var _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../drawing/Vector */ \"./src/drawing/Vector.js\");\n/* harmony import */ var _Bounds__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Bounds */ \"./src/Bounds.js\");\n/* harmony import */ var _padding__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./padding */ \"./src/parsing/padding.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n\n\n\n\n\n\nvar BACKGROUND_REPEAT = {\n  REPEAT: 0,\n  NO_REPEAT: 1,\n  REPEAT_X: 2,\n  REPEAT_Y: 3\n};\nvar BACKGROUND_SIZE = {\n  AUTO: 0,\n  CONTAIN: 1,\n  COVER: 2,\n  LENGTH: 3\n};\nvar BACKGROUND_CLIP = {\n  BORDER_BOX: 0,\n  PADDING_BOX: 1,\n  CONTENT_BOX: 2\n};\nvar BACKGROUND_ORIGIN = BACKGROUND_CLIP;\nvar AUTO = 'auto';\n\nvar BackgroundSize = function BackgroundSize(size) {\n  _classCallCheck(this, BackgroundSize);\n\n  switch (size) {\n    case 'contain':\n      this.size = BACKGROUND_SIZE.CONTAIN;\n      break;\n\n    case 'cover':\n      this.size = BACKGROUND_SIZE.COVER;\n      break;\n\n    case 'auto':\n      this.size = BACKGROUND_SIZE.AUTO;\n      break;\n\n    default:\n      this.value = new _Length__WEBPACK_IMPORTED_MODULE_1__[\"default\"](size);\n  }\n};\n\nvar calculateBackgroundSize = function calculateBackgroundSize(backgroundImage, image, bounds) {\n  var width = 0;\n  var height = 0;\n  var size = backgroundImage.size;\n\n  if (size[0].size === BACKGROUND_SIZE.CONTAIN || size[0].size === BACKGROUND_SIZE.COVER) {\n    var targetRatio = bounds.width / bounds.height;\n    var currentRatio = image.width / image.height;\n    return targetRatio < currentRatio !== (size[0].size === BACKGROUND_SIZE.COVER) ? new _drawing_Size__WEBPACK_IMPORTED_MODULE_2__[\"default\"](bounds.width, bounds.width / currentRatio) : new _drawing_Size__WEBPACK_IMPORTED_MODULE_2__[\"default\"](bounds.height * currentRatio, bounds.height);\n  }\n\n  if (size[0].value) {\n    width = size[0].value.getAbsoluteValue(bounds.width);\n  }\n\n  if (size[0].size === BACKGROUND_SIZE.AUTO && size[1].size === BACKGROUND_SIZE.AUTO) {\n    height = image.height;\n  } else if (size[1].size === BACKGROUND_SIZE.AUTO) {\n    height = width / image.width * image.height;\n  } else if (size[1].value) {\n    height = size[1].value.getAbsoluteValue(bounds.height);\n  }\n\n  if (size[0].size === BACKGROUND_SIZE.AUTO) {\n    width = height / image.height * image.width;\n  }\n\n  return new _drawing_Size__WEBPACK_IMPORTED_MODULE_2__[\"default\"](width, height);\n};\nvar calculateGradientBackgroundSize = function calculateGradientBackgroundSize(backgroundImage, bounds) {\n  var size = backgroundImage.size;\n  var width = size[0].value ? size[0].value.getAbsoluteValue(bounds.width) : bounds.width;\n  var height = size[1].value ? size[1].value.getAbsoluteValue(bounds.height) : size[0].value ? width : bounds.height;\n  return new _drawing_Size__WEBPACK_IMPORTED_MODULE_2__[\"default\"](width, height);\n};\nvar AUTO_SIZE = new BackgroundSize(AUTO);\nvar calculateBackgroungPaintingArea = function calculateBackgroungPaintingArea(curves, clip) {\n  switch (clip) {\n    case BACKGROUND_CLIP.BORDER_BOX:\n      return Object(_Bounds__WEBPACK_IMPORTED_MODULE_4__[\"calculateBorderBoxPath\"])(curves);\n\n    case BACKGROUND_CLIP.PADDING_BOX:\n    default:\n      return Object(_Bounds__WEBPACK_IMPORTED_MODULE_4__[\"calculatePaddingBoxPath\"])(curves);\n  }\n};\nvar calculateBackgroungPositioningArea = function calculateBackgroungPositioningArea(backgroundOrigin, bounds, padding, border) {\n  var paddingBox = Object(_Bounds__WEBPACK_IMPORTED_MODULE_4__[\"calculatePaddingBox\"])(bounds, border);\n\n  switch (backgroundOrigin) {\n    case BACKGROUND_ORIGIN.BORDER_BOX:\n      return bounds;\n\n    case BACKGROUND_ORIGIN.CONTENT_BOX:\n      var paddingLeft = padding[_padding__WEBPACK_IMPORTED_MODULE_5__[\"PADDING_SIDES\"].LEFT].getAbsoluteValue(bounds.width);\n      var paddingRight = padding[_padding__WEBPACK_IMPORTED_MODULE_5__[\"PADDING_SIDES\"].RIGHT].getAbsoluteValue(bounds.width);\n      var paddingTop = padding[_padding__WEBPACK_IMPORTED_MODULE_5__[\"PADDING_SIDES\"].TOP].getAbsoluteValue(bounds.width);\n      var paddingBottom = padding[_padding__WEBPACK_IMPORTED_MODULE_5__[\"PADDING_SIDES\"].BOTTOM].getAbsoluteValue(bounds.width);\n      return new _Bounds__WEBPACK_IMPORTED_MODULE_4__[\"Bounds\"](paddingBox.left + paddingLeft, paddingBox.top + paddingTop, paddingBox.width - paddingLeft - paddingRight, paddingBox.height - paddingTop - paddingBottom);\n\n    case BACKGROUND_ORIGIN.PADDING_BOX:\n    default:\n      return paddingBox;\n  }\n};\nvar calculateBackgroundPosition = function calculateBackgroundPosition(position, size, bounds) {\n  return new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](position[0].getAbsoluteValue(bounds.width - size.width), position[1].getAbsoluteValue(bounds.height - size.height));\n};\nvar calculateBackgroundRepeatPath = function calculateBackgroundRepeatPath(background, position, size, backgroundPositioningArea, bounds) {\n  var repeat = background.repeat;\n\n  switch (repeat) {\n    case BACKGROUND_REPEAT.REPEAT_X:\n      return [new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left), Math.round(backgroundPositioningArea.top + position.y)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left + bounds.width), Math.round(backgroundPositioningArea.top + position.y)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left + bounds.width), Math.round(size.height + backgroundPositioningArea.top + position.y)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left), Math.round(size.height + backgroundPositioningArea.top + position.y))];\n\n    case BACKGROUND_REPEAT.REPEAT_Y:\n      return [new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x), Math.round(bounds.top)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x + size.width), Math.round(bounds.top)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x + size.width), Math.round(bounds.height + bounds.top)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x), Math.round(bounds.height + bounds.top))];\n\n    case BACKGROUND_REPEAT.NO_REPEAT:\n      return [new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x), Math.round(backgroundPositioningArea.top + position.y)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x + size.width), Math.round(backgroundPositioningArea.top + position.y)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x + size.width), Math.round(backgroundPositioningArea.top + position.y + size.height)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(backgroundPositioningArea.left + position.x), Math.round(backgroundPositioningArea.top + position.y + size.height))];\n\n    default:\n      return [new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left), Math.round(bounds.top)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left + bounds.width), Math.round(bounds.top)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left + bounds.width), Math.round(bounds.height + bounds.top)), new _drawing_Vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](Math.round(bounds.left), Math.round(bounds.height + bounds.top))];\n  }\n};\nvar parseBackground = function parseBackground(style, resourceLoader) {\n  return {\n    backgroundColor: new _Color__WEBPACK_IMPORTED_MODULE_0__[\"default\"](style.backgroundColor),\n    backgroundImage: parseBackgroundImages(style, resourceLoader),\n    backgroundClip: parseBackgroundClip(style.backgroundClip),\n    backgroundOrigin: parseBackgroundOrigin(style.backgroundOrigin)\n  };\n};\n\nvar parseBackgroundClip = function parseBackgroundClip(backgroundClip) {\n  switch (backgroundClip) {\n    case 'padding-box':\n      return BACKGROUND_CLIP.PADDING_BOX;\n\n    case 'content-box':\n      return BACKGROUND_CLIP.CONTENT_BOX;\n  }\n\n  return BACKGROUND_CLIP.BORDER_BOX;\n};\n\nvar parseBackgroundOrigin = function parseBackgroundOrigin(backgroundOrigin) {\n  switch (backgroundOrigin) {\n    case 'padding-box':\n      return BACKGROUND_ORIGIN.PADDING_BOX;\n\n    case 'content-box':\n      return BACKGROUND_ORIGIN.CONTENT_BOX;\n  }\n\n  return BACKGROUND_ORIGIN.BORDER_BOX;\n};\n\nvar parseBackgroundRepeat = function parseBackgroundRepeat(backgroundRepeat) {\n  switch (backgroundRepeat.trim()) {\n    case 'no-repeat':\n      return BACKGROUND_REPEAT.NO_REPEAT;\n\n    case 'repeat-x':\n    case 'repeat no-repeat':\n      return BACKGROUND_REPEAT.REPEAT_X;\n\n    case 'repeat-y':\n    case 'no-repeat repeat':\n      return BACKGROUND_REPEAT.REPEAT_Y;\n\n    case 'repeat':\n      return BACKGROUND_REPEAT.REPEAT;\n  }\n\n  if (true) {\n    console.error(\"Invalid background-repeat value \\\"\".concat(backgroundRepeat, \"\\\"\"));\n  }\n\n  return BACKGROUND_REPEAT.REPEAT;\n};\n\nvar parseBackgroundImages = function parseBackgroundImages(style, resourceLoader) {\n  var sources = parseBackgroundImage(style.backgroundImage).map(function (backgroundImage) {\n    if (backgroundImage.method === 'url') {\n      var key = resourceLoader.loadImage(backgroundImage.args[0]);\n      backgroundImage.args = key ? [key] : [];\n    }\n\n    return backgroundImage;\n  });\n  var positions = style.backgroundPosition.split(',');\n  var repeats = style.backgroundRepeat.split(',');\n  var sizes = style.backgroundSize.split(',');\n  return sources.map(function (source, index) {\n    var size = (sizes[index] || AUTO).trim().split(' ').map(parseBackgroundSize);\n    var position = (positions[index] || AUTO).trim().split(' ').map(parseBackgoundPosition);\n    return {\n      source: source,\n      repeat: parseBackgroundRepeat(typeof repeats[index] === 'string' ? repeats[index] : repeats[0]),\n      size: size.length < 2 ? [size[0], AUTO_SIZE] : [size[0], size[1]],\n      position: position.length < 2 ? [position[0], position[0]] : [position[0], position[1]]\n    };\n  });\n};\n\nvar parseBackgroundSize = function parseBackgroundSize(size) {\n  return size === 'auto' ? AUTO_SIZE : new BackgroundSize(size);\n};\n\nvar parseBackgoundPosition = function parseBackgoundPosition(position) {\n  switch (position) {\n    case 'bottom':\n    case 'right':\n      return new _Length__WEBPACK_IMPORTED_MODULE_1__[\"default\"]('100%');\n\n    case 'left':\n    case 'top':\n      return new _Length__WEBPACK_IMPORTED_MODULE_1__[\"default\"]('0%');\n\n    case 'auto':\n      return new _Length__WEBPACK_IMPORTED_MODULE_1__[\"default\"]('0');\n  }\n\n  return new _Length__WEBPACK_IMPORTED_MODULE_1__[\"default\"](position);\n};\n\nvar parseBackgroundImage = function parseBackgroundImage(image) {\n  var whitespace = /^\\s$/;\n  var results = [];\n  var args = [];\n  var method = '';\n  var quote = null;\n  var definition = '';\n  var mode = 0;\n  var numParen = 0;\n\n  var appendResult = function appendResult() {\n    var prefix = '';\n\n    if (method) {\n      if (definition.substr(0, 1) === '\"') {\n        definition = definition.substr(1, definition.length - 2);\n      }\n\n      if (definition) {\n        args.push(definition.trim());\n      }\n\n      var prefix_i = method.indexOf('-', 1) + 1;\n\n      if (method.substr(0, 1) === '-' && prefix_i > 0) {\n        prefix = method.substr(0, prefix_i).toLowerCase();\n        method = method.substr(prefix_i);\n      }\n\n      method = method.toLowerCase();\n\n      if (method !== 'none') {\n        results.push({\n          prefix: prefix,\n          method: method,\n          args: args\n        });\n      }\n    }\n\n    args = [];\n    method = definition = '';\n  };\n\n  image.split('').forEach(function (c) {\n    if (mode === 0 && whitespace.test(c)) {\n      return;\n    }\n\n    switch (c) {\n      case '\"':\n        if (!quote) {\n          quote = c;\n        } else if (quote === c) {\n          quote = null;\n        }\n\n        break;\n\n      case '(':\n        if (quote) {\n          break;\n        } else if (mode === 0) {\n          mode = 1;\n          return;\n        } else {\n          numParen++;\n        }\n\n        break;\n\n      case ')':\n        if (quote) {\n          break;\n        } else if (mode === 1) {\n          if (numParen === 0) {\n            mode = 0;\n            appendResult();\n            return;\n          } else {\n            numParen--;\n          }\n        }\n\n        break;\n\n      case ',':\n        if (quote) {\n          break;\n        } else if (mode === 0) {\n          appendResult();\n          return;\n        } else if (mode === 1) {\n          if (numParen === 0 && !method.match(/^url$/i)) {\n            args.push(definition.trim());\n            definition = '';\n            return;\n          }\n        }\n\n        break;\n    }\n\n    if (mode === 0) {\n      method += c;\n    } else {\n      definition += c;\n    }\n  });\n  appendResult();\n  return results;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/background.js?");

/***/ }),

/***/ "./src/parsing/border.js":
/*!*******************************!*\
  !*** ./src/parsing/border.js ***!
  \*******************************/
/*! exports provided: BORDER_STYLE, BORDER_SIDES, parseBorder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BORDER_STYLE\", function() { return BORDER_STYLE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BORDER_SIDES\", function() { return BORDER_SIDES; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseBorder\", function() { return parseBorder; });\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color */ \"./src/Color.js\");\n\n\n\nvar BORDER_STYLE = {\n  NONE: 0,\n  SOLID: 1\n};\nvar BORDER_SIDES = {\n  TOP: 0,\n  RIGHT: 1,\n  BOTTOM: 2,\n  LEFT: 3\n};\nvar SIDES = Object.keys(BORDER_SIDES).map(function (s) {\n  return s.toLowerCase();\n});\n\nvar parseBorderStyle = function parseBorderStyle(style) {\n  switch (style) {\n    case 'none':\n      return BORDER_STYLE.NONE;\n  }\n\n  return BORDER_STYLE.SOLID;\n};\n\nvar parseBorder = function parseBorder(style) {\n  return SIDES.map(function (side) {\n    var borderColor = new _Color__WEBPACK_IMPORTED_MODULE_0__[\"default\"](style.getPropertyValue(\"border-\".concat(side, \"-color\")));\n    var borderStyle = parseBorderStyle(style.getPropertyValue(\"border-\".concat(side, \"-style\")));\n    var borderWidth = parseFloat(style.getPropertyValue(\"border-\".concat(side, \"-width\")));\n    return {\n      borderColor: borderColor,\n      borderStyle: borderStyle,\n      borderWidth: isNaN(borderWidth) ? 0 : borderWidth\n    };\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/border.js?");

/***/ }),

/***/ "./src/parsing/borderRadius.js":
/*!*************************************!*\
  !*** ./src/parsing/borderRadius.js ***!
  \*************************************/
/*! exports provided: parseBorderRadius */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseBorderRadius\", function() { return parseBorderRadius; });\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Length */ \"./src/Length.js\");\n\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\nvar SIDES = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];\nvar parseBorderRadius = function parseBorderRadius(style) {\n  return SIDES.map(function (side) {\n    var value = style.getPropertyValue(\"border-\".concat(side, \"-radius\"));\n\n    var _value$split$map = value.split(' ').map(_Length__WEBPACK_IMPORTED_MODULE_0__[\"default\"].create),\n        _value$split$map2 = _slicedToArray(_value$split$map, 2),\n        horizontal = _value$split$map2[0],\n        vertical = _value$split$map2[1];\n\n    return typeof vertical === 'undefined' ? [horizontal, horizontal] : [horizontal, vertical];\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/borderRadius.js?");

/***/ }),

/***/ "./src/parsing/display.js":
/*!********************************!*\
  !*** ./src/parsing/display.js ***!
  \********************************/
/*! exports provided: DISPLAY, parseDisplay */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"DISPLAY\", function() { return DISPLAY; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseDisplay\", function() { return parseDisplay; });\n\n\nvar DISPLAY = {\n  NONE: 1 << 0,\n  BLOCK: 1 << 1,\n  INLINE: 1 << 2,\n  RUN_IN: 1 << 3,\n  FLOW: 1 << 4,\n  FLOW_ROOT: 1 << 5,\n  TABLE: 1 << 6,\n  FLEX: 1 << 7,\n  GRID: 1 << 8,\n  RUBY: 1 << 9,\n  SUBGRID: 1 << 10,\n  LIST_ITEM: 1 << 11,\n  TABLE_ROW_GROUP: 1 << 12,\n  TABLE_HEADER_GROUP: 1 << 13,\n  TABLE_FOOTER_GROUP: 1 << 14,\n  TABLE_ROW: 1 << 15,\n  TABLE_CELL: 1 << 16,\n  TABLE_COLUMN_GROUP: 1 << 17,\n  TABLE_COLUMN: 1 << 18,\n  TABLE_CAPTION: 1 << 19,\n  RUBY_BASE: 1 << 20,\n  RUBY_TEXT: 1 << 21,\n  RUBY_BASE_CONTAINER: 1 << 22,\n  RUBY_TEXT_CONTAINER: 1 << 23,\n  CONTENTS: 1 << 24,\n  INLINE_BLOCK: 1 << 25,\n  INLINE_LIST_ITEM: 1 << 26,\n  INLINE_TABLE: 1 << 27,\n  INLINE_FLEX: 1 << 28,\n  INLINE_GRID: 1 << 29\n};\n\nvar parseDisplayValue = function parseDisplayValue(display) {\n  switch (display) {\n    case 'block':\n      return DISPLAY.BLOCK;\n\n    case 'inline':\n      return DISPLAY.INLINE;\n\n    case 'run-in':\n      return DISPLAY.RUN_IN;\n\n    case 'flow':\n      return DISPLAY.FLOW;\n\n    case 'flow-root':\n      return DISPLAY.FLOW_ROOT;\n\n    case 'table':\n      return DISPLAY.TABLE;\n\n    case 'flex':\n      return DISPLAY.FLEX;\n\n    case 'grid':\n      return DISPLAY.GRID;\n\n    case 'ruby':\n      return DISPLAY.RUBY;\n\n    case 'subgrid':\n      return DISPLAY.SUBGRID;\n\n    case 'list-item':\n      return DISPLAY.LIST_ITEM;\n\n    case 'table-row-group':\n      return DISPLAY.TABLE_ROW_GROUP;\n\n    case 'table-header-group':\n      return DISPLAY.TABLE_HEADER_GROUP;\n\n    case 'table-footer-group':\n      return DISPLAY.TABLE_FOOTER_GROUP;\n\n    case 'table-row':\n      return DISPLAY.TABLE_ROW;\n\n    case 'table-cell':\n      return DISPLAY.TABLE_CELL;\n\n    case 'table-column-group':\n      return DISPLAY.TABLE_COLUMN_GROUP;\n\n    case 'table-column':\n      return DISPLAY.TABLE_COLUMN;\n\n    case 'table-caption':\n      return DISPLAY.TABLE_CAPTION;\n\n    case 'ruby-base':\n      return DISPLAY.RUBY_BASE;\n\n    case 'ruby-text':\n      return DISPLAY.RUBY_TEXT;\n\n    case 'ruby-base-container':\n      return DISPLAY.RUBY_BASE_CONTAINER;\n\n    case 'ruby-text-container':\n      return DISPLAY.RUBY_TEXT_CONTAINER;\n\n    case 'contents':\n      return DISPLAY.CONTENTS;\n\n    case 'inline-block':\n      return DISPLAY.INLINE_BLOCK;\n\n    case 'inline-list-item':\n      return DISPLAY.INLINE_LIST_ITEM;\n\n    case 'inline-table':\n      return DISPLAY.INLINE_TABLE;\n\n    case 'inline-flex':\n      return DISPLAY.INLINE_FLEX;\n\n    case 'inline-grid':\n      return DISPLAY.INLINE_GRID;\n  }\n\n  return DISPLAY.NONE;\n};\n\nvar setDisplayBit = function setDisplayBit(bit, display) {\n  return bit | parseDisplayValue(display);\n};\n\nvar parseDisplay = function parseDisplay(display) {\n  return display.split(' ').reduce(setDisplayBit, 0);\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/display.js?");

/***/ }),

/***/ "./src/parsing/float.js":
/*!******************************!*\
  !*** ./src/parsing/float.js ***!
  \******************************/
/*! exports provided: FLOAT, parseCSSFloat */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FLOAT\", function() { return FLOAT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseCSSFloat\", function() { return parseCSSFloat; });\n\n\nvar FLOAT = {\n  NONE: 0,\n  LEFT: 1,\n  RIGHT: 2,\n  INLINE_START: 3,\n  INLINE_END: 4\n};\nvar parseCSSFloat = function parseCSSFloat(float) {\n  switch (float) {\n    case 'left':\n      return FLOAT.LEFT;\n\n    case 'right':\n      return FLOAT.RIGHT;\n\n    case 'inline-start':\n      return FLOAT.INLINE_START;\n\n    case 'inline-end':\n      return FLOAT.INLINE_END;\n  }\n\n  return FLOAT.NONE;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/float.js?");

/***/ }),

/***/ "./src/parsing/font.js":
/*!*****************************!*\
  !*** ./src/parsing/font.js ***!
  \*****************************/
/*! exports provided: parseFont */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseFont\", function() { return parseFont; });\n\n\nvar parseFontWeight = function parseFontWeight(weight) {\n  switch (weight) {\n    case 'normal':\n      return 400;\n\n    case 'bold':\n      return 700;\n  }\n\n  var value = parseInt(weight, 10);\n  return isNaN(value) ? 400 : value;\n};\n\nvar parseFont = function parseFont(style) {\n  var fontFamily = style.fontFamily;\n  var fontSize = style.fontSize;\n  var fontStyle = style.fontStyle;\n  var fontVariant = style.fontVariant;\n  var fontWeight = parseFontWeight(style.fontWeight);\n  return {\n    fontFamily: fontFamily,\n    fontSize: fontSize,\n    fontStyle: fontStyle,\n    fontVariant: fontVariant,\n    fontWeight: fontWeight\n  };\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/font.js?");

/***/ }),

/***/ "./src/parsing/letterSpacing.js":
/*!**************************************!*\
  !*** ./src/parsing/letterSpacing.js ***!
  \**************************************/
/*! exports provided: parseLetterSpacing */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseLetterSpacing\", function() { return parseLetterSpacing; });\n\n\nvar parseLetterSpacing = function parseLetterSpacing(letterSpacing) {\n  if (letterSpacing === 'normal') {\n    return 0;\n  }\n\n  var value = parseFloat(letterSpacing);\n  return isNaN(value) ? 0 : value;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/letterSpacing.js?");

/***/ }),

/***/ "./src/parsing/lineBreak.js":
/*!**********************************!*\
  !*** ./src/parsing/lineBreak.js ***!
  \**********************************/
/*! exports provided: LINE_BREAK, parseLineBreak */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LINE_BREAK\", function() { return LINE_BREAK; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseLineBreak\", function() { return parseLineBreak; });\n\n\nvar LINE_BREAK = {\n  NORMAL: 'normal',\n  STRICT: 'strict'\n};\nvar parseLineBreak = function parseLineBreak(wordBreak) {\n  switch (wordBreak) {\n    case 'strict':\n      return LINE_BREAK.STRICT;\n\n    case 'normal':\n    default:\n      return LINE_BREAK.NORMAL;\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/lineBreak.js?");

/***/ }),

/***/ "./src/parsing/listStyle.js":
/*!**********************************!*\
  !*** ./src/parsing/listStyle.js ***!
  \**********************************/
/*! exports provided: LIST_STYLE_POSITION, LIST_STYLE_TYPE, parseListStyleType, parseListStyle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LIST_STYLE_POSITION\", function() { return LIST_STYLE_POSITION; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LIST_STYLE_TYPE\", function() { return LIST_STYLE_TYPE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseListStyleType\", function() { return parseListStyleType; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseListStyle\", function() { return parseListStyle; });\n/* harmony import */ var _background__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./background */ \"./src/parsing/background.js\");\n\n\n\nvar LIST_STYLE_POSITION = {\n  INSIDE: 0,\n  OUTSIDE: 1\n};\nvar LIST_STYLE_TYPE = {\n  NONE: -1,\n  DISC: 0,\n  CIRCLE: 1,\n  SQUARE: 2,\n  DECIMAL: 3,\n  CJK_DECIMAL: 4,\n  DECIMAL_LEADING_ZERO: 5,\n  LOWER_ROMAN: 6,\n  UPPER_ROMAN: 7,\n  LOWER_GREEK: 8,\n  LOWER_ALPHA: 9,\n  UPPER_ALPHA: 10,\n  ARABIC_INDIC: 11,\n  ARMENIAN: 12,\n  BENGALI: 13,\n  CAMBODIAN: 14,\n  CJK_EARTHLY_BRANCH: 15,\n  CJK_HEAVENLY_STEM: 16,\n  CJK_IDEOGRAPHIC: 17,\n  DEVANAGARI: 18,\n  ETHIOPIC_NUMERIC: 19,\n  GEORGIAN: 20,\n  GUJARATI: 21,\n  GURMUKHI: 22,\n  HEBREW: 22,\n  HIRAGANA: 23,\n  HIRAGANA_IROHA: 24,\n  JAPANESE_FORMAL: 25,\n  JAPANESE_INFORMAL: 26,\n  KANNADA: 27,\n  KATAKANA: 28,\n  KATAKANA_IROHA: 29,\n  KHMER: 30,\n  KOREAN_HANGUL_FORMAL: 31,\n  KOREAN_HANJA_FORMAL: 32,\n  KOREAN_HANJA_INFORMAL: 33,\n  LAO: 34,\n  LOWER_ARMENIAN: 35,\n  MALAYALAM: 36,\n  MONGOLIAN: 37,\n  MYANMAR: 38,\n  ORIYA: 39,\n  PERSIAN: 40,\n  SIMP_CHINESE_FORMAL: 41,\n  SIMP_CHINESE_INFORMAL: 42,\n  TAMIL: 43,\n  TELUGU: 44,\n  THAI: 45,\n  TIBETAN: 46,\n  TRAD_CHINESE_FORMAL: 47,\n  TRAD_CHINESE_INFORMAL: 48,\n  UPPER_ARMENIAN: 49,\n  DISCLOSURE_OPEN: 50,\n  DISCLOSURE_CLOSED: 51\n};\nvar parseListStyleType = function parseListStyleType(type) {\n  switch (type) {\n    case 'disc':\n      return LIST_STYLE_TYPE.DISC;\n\n    case 'circle':\n      return LIST_STYLE_TYPE.CIRCLE;\n\n    case 'square':\n      return LIST_STYLE_TYPE.SQUARE;\n\n    case 'decimal':\n      return LIST_STYLE_TYPE.DECIMAL;\n\n    case 'cjk-decimal':\n      return LIST_STYLE_TYPE.CJK_DECIMAL;\n\n    case 'decimal-leading-zero':\n      return LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO;\n\n    case 'lower-roman':\n      return LIST_STYLE_TYPE.LOWER_ROMAN;\n\n    case 'upper-roman':\n      return LIST_STYLE_TYPE.UPPER_ROMAN;\n\n    case 'lower-greek':\n      return LIST_STYLE_TYPE.LOWER_GREEK;\n\n    case 'lower-alpha':\n      return LIST_STYLE_TYPE.LOWER_ALPHA;\n\n    case 'upper-alpha':\n      return LIST_STYLE_TYPE.UPPER_ALPHA;\n\n    case 'arabic-indic':\n      return LIST_STYLE_TYPE.ARABIC_INDIC;\n\n    case 'armenian':\n      return LIST_STYLE_TYPE.ARMENIAN;\n\n    case 'bengali':\n      return LIST_STYLE_TYPE.BENGALI;\n\n    case 'cambodian':\n      return LIST_STYLE_TYPE.CAMBODIAN;\n\n    case 'cjk-earthly-branch':\n      return LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH;\n\n    case 'cjk-heavenly-stem':\n      return LIST_STYLE_TYPE.CJK_HEAVENLY_STEM;\n\n    case 'cjk-ideographic':\n      return LIST_STYLE_TYPE.CJK_IDEOGRAPHIC;\n\n    case 'devanagari':\n      return LIST_STYLE_TYPE.DEVANAGARI;\n\n    case 'ethiopic-numeric':\n      return LIST_STYLE_TYPE.ETHIOPIC_NUMERIC;\n\n    case 'georgian':\n      return LIST_STYLE_TYPE.GEORGIAN;\n\n    case 'gujarati':\n      return LIST_STYLE_TYPE.GUJARATI;\n\n    case 'gurmukhi':\n      return LIST_STYLE_TYPE.GURMUKHI;\n\n    case 'hebrew':\n      return LIST_STYLE_TYPE.HEBREW;\n\n    case 'hiragana':\n      return LIST_STYLE_TYPE.HIRAGANA;\n\n    case 'hiragana-iroha':\n      return LIST_STYLE_TYPE.HIRAGANA_IROHA;\n\n    case 'japanese-formal':\n      return LIST_STYLE_TYPE.JAPANESE_FORMAL;\n\n    case 'japanese-informal':\n      return LIST_STYLE_TYPE.JAPANESE_INFORMAL;\n\n    case 'kannada':\n      return LIST_STYLE_TYPE.KANNADA;\n\n    case 'katakana':\n      return LIST_STYLE_TYPE.KATAKANA;\n\n    case 'katakana-iroha':\n      return LIST_STYLE_TYPE.KATAKANA_IROHA;\n\n    case 'khmer':\n      return LIST_STYLE_TYPE.KHMER;\n\n    case 'korean-hangul-formal':\n      return LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL;\n\n    case 'korean-hanja-formal':\n      return LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL;\n\n    case 'korean-hanja-informal':\n      return LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL;\n\n    case 'lao':\n      return LIST_STYLE_TYPE.LAO;\n\n    case 'lower-armenian':\n      return LIST_STYLE_TYPE.LOWER_ARMENIAN;\n\n    case 'malayalam':\n      return LIST_STYLE_TYPE.MALAYALAM;\n\n    case 'mongolian':\n      return LIST_STYLE_TYPE.MONGOLIAN;\n\n    case 'myanmar':\n      return LIST_STYLE_TYPE.MYANMAR;\n\n    case 'oriya':\n      return LIST_STYLE_TYPE.ORIYA;\n\n    case 'persian':\n      return LIST_STYLE_TYPE.PERSIAN;\n\n    case 'simp-chinese-formal':\n      return LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL;\n\n    case 'simp-chinese-informal':\n      return LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL;\n\n    case 'tamil':\n      return LIST_STYLE_TYPE.TAMIL;\n\n    case 'telugu':\n      return LIST_STYLE_TYPE.TELUGU;\n\n    case 'thai':\n      return LIST_STYLE_TYPE.THAI;\n\n    case 'tibetan':\n      return LIST_STYLE_TYPE.TIBETAN;\n\n    case 'trad-chinese-formal':\n      return LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL;\n\n    case 'trad-chinese-informal':\n      return LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL;\n\n    case 'upper-armenian':\n      return LIST_STYLE_TYPE.UPPER_ARMENIAN;\n\n    case 'disclosure-open':\n      return LIST_STYLE_TYPE.DISCLOSURE_OPEN;\n\n    case 'disclosure-closed':\n      return LIST_STYLE_TYPE.DISCLOSURE_CLOSED;\n\n    case 'none':\n    default:\n      return LIST_STYLE_TYPE.NONE;\n  }\n};\nvar parseListStyle = function parseListStyle(style) {\n  var listStyleImage = Object(_background__WEBPACK_IMPORTED_MODULE_0__[\"parseBackgroundImage\"])(style.getPropertyValue('list-style-image'));\n  return {\n    listStyleType: parseListStyleType(style.getPropertyValue('list-style-type')),\n    listStyleImage: listStyleImage.length ? listStyleImage[0] : null,\n    listStylePosition: parseListStylePosition(style.getPropertyValue('list-style-position'))\n  };\n};\n\nvar parseListStylePosition = function parseListStylePosition(position) {\n  switch (position) {\n    case 'inside':\n      return LIST_STYLE_POSITION.INSIDE;\n\n    case 'outside':\n    default:\n      return LIST_STYLE_POSITION.OUTSIDE;\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/listStyle.js?");

/***/ }),

/***/ "./src/parsing/margin.js":
/*!*******************************!*\
  !*** ./src/parsing/margin.js ***!
  \*******************************/
/*! exports provided: parseMargin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseMargin\", function() { return parseMargin; });\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Length */ \"./src/Length.js\");\n\n\n\nvar SIDES = ['top', 'right', 'bottom', 'left'];\nvar parseMargin = function parseMargin(style) {\n  return SIDES.map(function (side) {\n    return new _Length__WEBPACK_IMPORTED_MODULE_0__[\"default\"](style.getPropertyValue(\"margin-\".concat(side)));\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/margin.js?");

/***/ }),

/***/ "./src/parsing/overflow.js":
/*!*********************************!*\
  !*** ./src/parsing/overflow.js ***!
  \*********************************/
/*! exports provided: OVERFLOW, parseOverflow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"OVERFLOW\", function() { return OVERFLOW; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseOverflow\", function() { return parseOverflow; });\n\n\nvar OVERFLOW = {\n  VISIBLE: 0,\n  HIDDEN: 1,\n  SCROLL: 2,\n  AUTO: 3\n};\nvar parseOverflow = function parseOverflow(overflow) {\n  switch (overflow) {\n    case 'hidden':\n      return OVERFLOW.HIDDEN;\n\n    case 'scroll':\n      return OVERFLOW.SCROLL;\n\n    case 'auto':\n      return OVERFLOW.AUTO;\n\n    case 'visible':\n    default:\n      return OVERFLOW.VISIBLE;\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/overflow.js?");

/***/ }),

/***/ "./src/parsing/overflowWrap.js":
/*!*************************************!*\
  !*** ./src/parsing/overflowWrap.js ***!
  \*************************************/
/*! exports provided: OVERFLOW_WRAP, parseOverflowWrap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"OVERFLOW_WRAP\", function() { return OVERFLOW_WRAP; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseOverflowWrap\", function() { return parseOverflowWrap; });\n\n\nvar OVERFLOW_WRAP = {\n  NORMAL: 0,\n  BREAK_WORD: 1\n};\nvar parseOverflowWrap = function parseOverflowWrap(overflow) {\n  switch (overflow) {\n    case 'break-word':\n      return OVERFLOW_WRAP.BREAK_WORD;\n\n    case 'normal':\n    default:\n      return OVERFLOW_WRAP.NORMAL;\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/overflowWrap.js?");

/***/ }),

/***/ "./src/parsing/padding.js":
/*!********************************!*\
  !*** ./src/parsing/padding.js ***!
  \********************************/
/*! exports provided: PADDING_SIDES, parsePadding */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PADDING_SIDES\", function() { return PADDING_SIDES; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parsePadding\", function() { return parsePadding; });\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Length */ \"./src/Length.js\");\n\n\n\nvar PADDING_SIDES = {\n  TOP: 0,\n  RIGHT: 1,\n  BOTTOM: 2,\n  LEFT: 3\n};\nvar SIDES = ['top', 'right', 'bottom', 'left'];\nvar parsePadding = function parsePadding(style) {\n  return SIDES.map(function (side) {\n    return new _Length__WEBPACK_IMPORTED_MODULE_0__[\"default\"](style.getPropertyValue(\"padding-\".concat(side)));\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/padding.js?");

/***/ }),

/***/ "./src/parsing/position.js":
/*!*********************************!*\
  !*** ./src/parsing/position.js ***!
  \*********************************/
/*! exports provided: POSITION, parsePosition */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"POSITION\", function() { return POSITION; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parsePosition\", function() { return parsePosition; });\n\n\nvar POSITION = {\n  STATIC: 0,\n  RELATIVE: 1,\n  ABSOLUTE: 2,\n  FIXED: 3,\n  STICKY: 4\n};\nvar parsePosition = function parsePosition(position) {\n  switch (position) {\n    case 'relative':\n      return POSITION.RELATIVE;\n\n    case 'absolute':\n      return POSITION.ABSOLUTE;\n\n    case 'fixed':\n      return POSITION.FIXED;\n\n    case 'sticky':\n      return POSITION.STICKY;\n  }\n\n  return POSITION.STATIC;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/position.js?");

/***/ }),

/***/ "./src/parsing/textDecoration.js":
/*!***************************************!*\
  !*** ./src/parsing/textDecoration.js ***!
  \***************************************/
/*! exports provided: TEXT_DECORATION_STYLE, TEXT_DECORATION, TEXT_DECORATION_LINE, parseTextDecoration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TEXT_DECORATION_STYLE\", function() { return TEXT_DECORATION_STYLE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TEXT_DECORATION\", function() { return TEXT_DECORATION; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TEXT_DECORATION_LINE\", function() { return TEXT_DECORATION_LINE; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseTextDecoration\", function() { return parseTextDecoration; });\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color */ \"./src/Color.js\");\n\n\n\nvar TEXT_DECORATION_STYLE = {\n  SOLID: 0,\n  DOUBLE: 1,\n  DOTTED: 2,\n  DASHED: 3,\n  WAVY: 4\n};\nvar TEXT_DECORATION = {\n  NONE: null\n};\nvar TEXT_DECORATION_LINE = {\n  UNDERLINE: 1,\n  OVERLINE: 2,\n  LINE_THROUGH: 3,\n  BLINK: 4\n};\n\nvar parseLine = function parseLine(line) {\n  switch (line) {\n    case 'underline':\n      return TEXT_DECORATION_LINE.UNDERLINE;\n\n    case 'overline':\n      return TEXT_DECORATION_LINE.OVERLINE;\n\n    case 'line-through':\n      return TEXT_DECORATION_LINE.LINE_THROUGH;\n  }\n\n  return TEXT_DECORATION_LINE.BLINK;\n};\n\nvar parseTextDecorationLine = function parseTextDecorationLine(line) {\n  if (line === 'none') {\n    return null;\n  }\n\n  return line.split(' ').map(parseLine);\n};\n\nvar parseTextDecorationStyle = function parseTextDecorationStyle(style) {\n  switch (style) {\n    case 'double':\n      return TEXT_DECORATION_STYLE.DOUBLE;\n\n    case 'dotted':\n      return TEXT_DECORATION_STYLE.DOTTED;\n\n    case 'dashed':\n      return TEXT_DECORATION_STYLE.DASHED;\n\n    case 'wavy':\n      return TEXT_DECORATION_STYLE.WAVY;\n  }\n\n  return TEXT_DECORATION_STYLE.SOLID;\n};\n\nvar parseTextDecoration = function parseTextDecoration(style) {\n  var textDecorationLine = parseTextDecorationLine(style.textDecorationLine ? style.textDecorationLine : style.textDecoration);\n\n  if (textDecorationLine === null) {\n    return TEXT_DECORATION.NONE;\n  }\n\n  var textDecorationColor = style.textDecorationColor ? new _Color__WEBPACK_IMPORTED_MODULE_0__[\"default\"](style.textDecorationColor) : null;\n  var textDecorationStyle = parseTextDecorationStyle(style.textDecorationStyle);\n  return {\n    textDecorationLine: textDecorationLine,\n    textDecorationColor: textDecorationColor,\n    textDecorationStyle: textDecorationStyle\n  };\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/textDecoration.js?");

/***/ }),

/***/ "./src/parsing/textShadow.js":
/*!***********************************!*\
  !*** ./src/parsing/textShadow.js ***!
  \***********************************/
/*! exports provided: parseTextShadow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseTextShadow\", function() { return parseTextShadow; });\n/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Color */ \"./src/Color.js\");\n\n\n\nvar NUMBER = /^([+-]|\\d|\\.)$/i;\nvar parseTextShadow = function parseTextShadow(textShadow) {\n  if (textShadow === 'none' || typeof textShadow !== 'string') {\n    return null;\n  }\n\n  var currentValue = '';\n  var isLength = false;\n  var values = [];\n  var shadows = [];\n  var numParens = 0;\n  var color = null;\n\n  var appendValue = function appendValue() {\n    if (currentValue.length) {\n      if (isLength) {\n        values.push(parseFloat(currentValue));\n      } else {\n        color = new _Color__WEBPACK_IMPORTED_MODULE_0__[\"default\"](currentValue);\n      }\n    }\n\n    isLength = false;\n    currentValue = '';\n  };\n\n  var appendShadow = function appendShadow() {\n    if (values.length && color !== null) {\n      shadows.push({\n        color: color,\n        offsetX: values[0] || 0,\n        offsetY: values[1] || 0,\n        blur: values[2] || 0\n      });\n    }\n\n    values.splice(0, values.length);\n    color = null;\n  };\n\n  for (var i = 0; i < textShadow.length; i++) {\n    var c = textShadow[i];\n\n    switch (c) {\n      case '(':\n        currentValue += c;\n        numParens++;\n        break;\n\n      case ')':\n        currentValue += c;\n        numParens--;\n        break;\n\n      case ',':\n        if (numParens === 0) {\n          appendValue();\n          appendShadow();\n        } else {\n          currentValue += c;\n        }\n\n        break;\n\n      case ' ':\n        if (numParens === 0) {\n          appendValue();\n        } else {\n          currentValue += c;\n        }\n\n        break;\n\n      default:\n        if (currentValue.length === 0 && NUMBER.test(c)) {\n          isLength = true;\n        }\n\n        currentValue += c;\n    }\n  }\n\n  appendValue();\n  appendShadow();\n\n  if (shadows.length === 0) {\n    return null;\n  }\n\n  return shadows;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/textShadow.js?");

/***/ }),

/***/ "./src/parsing/textTransform.js":
/*!**************************************!*\
  !*** ./src/parsing/textTransform.js ***!
  \**************************************/
/*! exports provided: TEXT_TRANSFORM, parseTextTransform */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TEXT_TRANSFORM\", function() { return TEXT_TRANSFORM; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseTextTransform\", function() { return parseTextTransform; });\n\n\nvar TEXT_TRANSFORM = {\n  NONE: 0,\n  LOWERCASE: 1,\n  UPPERCASE: 2,\n  CAPITALIZE: 3\n};\nvar parseTextTransform = function parseTextTransform(textTransform) {\n  switch (textTransform) {\n    case 'uppercase':\n      return TEXT_TRANSFORM.UPPERCASE;\n\n    case 'lowercase':\n      return TEXT_TRANSFORM.LOWERCASE;\n\n    case 'capitalize':\n      return TEXT_TRANSFORM.CAPITALIZE;\n  }\n\n  return TEXT_TRANSFORM.NONE;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/textTransform.js?");

/***/ }),

/***/ "./src/parsing/transform.js":
/*!**********************************!*\
  !*** ./src/parsing/transform.js ***!
  \**********************************/
/*! exports provided: parseTransform */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseTransform\", function() { return parseTransform; });\n/* harmony import */ var _Length__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Length */ \"./src/Length.js\");\n\n\n\n\nvar toFloat = function toFloat(s) {\n  return parseFloat(s.trim());\n};\n\nvar MATRIX = /(matrix|matrix3d)\\((.+)\\)/;\nvar parseTransform = function parseTransform(style) {\n  var transform = parseTransformMatrix(style.transform || style.webkitTransform || style.mozTransform || // $FlowFixMe\n  style.msTransform || // $FlowFixMe\n  style.oTransform);\n\n  if (transform === null) {\n    return null;\n  }\n\n  return {\n    transform: transform,\n    transformOrigin: parseTransformOrigin(style.transformOrigin || style.webkitTransformOrigin || style.mozTransformOrigin || // $FlowFixMe\n    style.msTransformOrigin || // $FlowFixMe\n    style.oTransformOrigin)\n  };\n}; // $FlowFixMe\n\nvar parseTransformOrigin = function parseTransformOrigin(origin) {\n  if (typeof origin !== 'string') {\n    var v = new _Length__WEBPACK_IMPORTED_MODULE_0__[\"default\"]('0');\n    return [v, v];\n  }\n\n  var values = origin.split(' ').map(_Length__WEBPACK_IMPORTED_MODULE_0__[\"default\"].create);\n  return [values[0], values[1]];\n}; // $FlowFixMe\n\n\nvar parseTransformMatrix = function parseTransformMatrix(transform) {\n  if (transform === 'none' || typeof transform !== 'string') {\n    return null;\n  }\n\n  var match = transform.match(MATRIX);\n\n  if (match) {\n    if (match[1] === 'matrix') {\n      var matrix = match[2].split(',').map(toFloat);\n      return [matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]];\n    } else {\n      var matrix3d = match[2].split(',').map(toFloat);\n      return [matrix3d[0], matrix3d[1], matrix3d[4], matrix3d[5], matrix3d[12], matrix3d[13]];\n    }\n  }\n\n  return null;\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/transform.js?");

/***/ }),

/***/ "./src/parsing/visibility.js":
/*!***********************************!*\
  !*** ./src/parsing/visibility.js ***!
  \***********************************/
/*! exports provided: VISIBILITY, parseVisibility */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"VISIBILITY\", function() { return VISIBILITY; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseVisibility\", function() { return parseVisibility; });\n\n\nvar VISIBILITY = {\n  VISIBLE: 0,\n  HIDDEN: 1,\n  COLLAPSE: 2\n};\nvar parseVisibility = function parseVisibility(visibility) {\n  switch (visibility) {\n    case 'hidden':\n      return VISIBILITY.HIDDEN;\n\n    case 'collapse':\n      return VISIBILITY.COLLAPSE;\n\n    case 'visible':\n    default:\n      return VISIBILITY.VISIBLE;\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/visibility.js?");

/***/ }),

/***/ "./src/parsing/word-break.js":
/*!***********************************!*\
  !*** ./src/parsing/word-break.js ***!
  \***********************************/
/*! exports provided: WORD_BREAK, parseWordBreak */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WORD_BREAK\", function() { return WORD_BREAK; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseWordBreak\", function() { return parseWordBreak; });\n\n\nvar WORD_BREAK = {\n  NORMAL: 'normal',\n  BREAK_ALL: 'break-all',\n  KEEP_ALL: 'keep-all'\n};\nvar parseWordBreak = function parseWordBreak(wordBreak) {\n  switch (wordBreak) {\n    case 'break-all':\n      return WORD_BREAK.BREAK_ALL;\n\n    case 'keep-all':\n      return WORD_BREAK.KEEP_ALL;\n\n    case 'normal':\n    default:\n      return WORD_BREAK.NORMAL;\n  }\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/word-break.js?");

/***/ }),

/***/ "./src/parsing/zIndex.js":
/*!*******************************!*\
  !*** ./src/parsing/zIndex.js ***!
  \*******************************/
/*! exports provided: parseZIndex */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseZIndex\", function() { return parseZIndex; });\n\n\nvar parseZIndex = function parseZIndex(zIndex) {\n  var auto = zIndex === 'auto';\n  return {\n    auto: auto,\n    order: auto ? 0 : parseInt(zIndex, 10)\n  };\n};\n\n//# sourceURL=webpack://html2canvas/./src/parsing/zIndex.js?");

/***/ }),

/***/ "./src/renderer/CanvasRenderer.js":
/*!****************************************!*\
  !*** ./src/renderer/CanvasRenderer.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return CanvasRenderer; });\n/* harmony import */ var _drawing_Path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../drawing/Path */ \"./src/drawing/Path.js\");\n/* harmony import */ var _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../parsing/textDecoration */ \"./src/parsing/textDecoration.js\");\n\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\n\nvar addColorStops = function addColorStops(gradient, canvasGradient) {\n  var maxStop = Math.max.apply(null, gradient.colorStops.map(function (colorStop) {\n    return colorStop.stop;\n  }));\n  var f = 1 / Math.max(1, maxStop);\n  gradient.colorStops.forEach(function (colorStop) {\n    canvasGradient.addColorStop(Math.floor(Math.max(0, f * colorStop.stop)), colorStop.color.toString());\n  });\n};\n\nvar CanvasRenderer =\n/*#__PURE__*/\nfunction () {\n  function CanvasRenderer(canvas) {\n    _classCallCheck(this, CanvasRenderer);\n\n    this.canvas = canvas ? canvas : document.createElement('canvas');\n  }\n\n  _createClass(CanvasRenderer, [{\n    key: \"render\",\n    value: function render(options) {\n      this.ctx = this.canvas.getContext('2d');\n      this.options = options;\n      this.canvas.width = Math.floor(options.width * options.scale);\n      this.canvas.height = Math.floor(options.height * options.scale);\n      this.canvas.style.width = \"\".concat(options.width, \"px\");\n      this.canvas.style.height = \"\".concat(options.height, \"px\");\n      this.ctx.scale(this.options.scale, this.options.scale);\n      this.ctx.translate(-options.x, -options.y);\n      this.ctx.textBaseline = 'bottom';\n      options.logger.log(\"Canvas renderer initialized (\".concat(options.width, \"x\").concat(options.height, \" at \").concat(options.x, \",\").concat(options.y, \") with scale \").concat(this.options.scale));\n    }\n  }, {\n    key: \"clip\",\n    value: function clip(clipPaths, callback) {\n      var _this = this;\n\n      if (clipPaths.length) {\n        this.ctx.save();\n        clipPaths.forEach(function (path) {\n          _this.path(path);\n\n          _this.ctx.clip();\n        });\n      }\n\n      callback();\n\n      if (clipPaths.length) {\n        this.ctx.restore();\n      }\n    }\n  }, {\n    key: \"drawImage\",\n    value: function drawImage(image, source, destination) {\n      this.ctx.drawImage(image, source.left, source.top, source.width, source.height, destination.left, destination.top, destination.width, destination.height);\n    }\n  }, {\n    key: \"drawShape\",\n    value: function drawShape(path, color) {\n      this.path(path);\n      this.ctx.fillStyle = color.toString();\n      this.ctx.fill();\n    }\n  }, {\n    key: \"fill\",\n    value: function fill(color) {\n      this.ctx.fillStyle = color.toString();\n      this.ctx.fill();\n    }\n  }, {\n    key: \"getTarget\",\n    value: function getTarget() {\n      this.canvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);\n      return Promise.resolve(this.canvas);\n    }\n  }, {\n    key: \"path\",\n    value: function path(_path) {\n      var _this2 = this;\n\n      this.ctx.beginPath();\n\n      if (Array.isArray(_path)) {\n        _path.forEach(function (point, index) {\n          var start = point.type === _drawing_Path__WEBPACK_IMPORTED_MODULE_0__[\"PATH\"].VECTOR ? point : point.start;\n\n          if (index === 0) {\n            _this2.ctx.moveTo(start.x, start.y);\n          } else {\n            _this2.ctx.lineTo(start.x, start.y);\n          }\n\n          if (point.type === _drawing_Path__WEBPACK_IMPORTED_MODULE_0__[\"PATH\"].BEZIER_CURVE) {\n            _this2.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);\n          }\n        });\n      } else {\n        this.ctx.arc(_path.x + _path.radius, _path.y + _path.radius, _path.radius, 0, Math.PI * 2, true);\n      }\n\n      this.ctx.closePath();\n    }\n  }, {\n    key: \"rectangle\",\n    value: function rectangle(x, y, width, height, color) {\n      this.ctx.fillStyle = color.toString();\n      this.ctx.fillRect(x, y, width, height);\n    }\n  }, {\n    key: \"renderLinearGradient\",\n    value: function renderLinearGradient(bounds, gradient) {\n      var linearGradient = this.ctx.createLinearGradient(bounds.left + gradient.direction.x1, bounds.top + gradient.direction.y1, bounds.left + gradient.direction.x0, bounds.top + gradient.direction.y0);\n      addColorStops(gradient, linearGradient);\n      this.ctx.fillStyle = linearGradient;\n      this.ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);\n    }\n  }, {\n    key: \"renderRadialGradient\",\n    value: function renderRadialGradient(bounds, gradient) {\n      var _this3 = this;\n\n      var x = bounds.left + gradient.center.x;\n      var y = bounds.top + gradient.center.y;\n      var radialGradient = this.ctx.createRadialGradient(x, y, 0, x, y, gradient.radius.x);\n\n      if (!radialGradient) {\n        return;\n      }\n\n      addColorStops(gradient, radialGradient);\n      this.ctx.fillStyle = radialGradient;\n\n      if (gradient.radius.x !== gradient.radius.y) {\n        // transforms for elliptical radial gradient\n        var midX = bounds.left + 0.5 * bounds.width;\n        var midY = bounds.top + 0.5 * bounds.height;\n        var f = gradient.radius.y / gradient.radius.x;\n        var invF = 1 / f;\n        this.transform(midX, midY, [1, 0, 0, f, 0, 0], function () {\n          return _this3.ctx.fillRect(bounds.left, invF * (bounds.top - midY) + midY, bounds.width, bounds.height * invF);\n        });\n      } else {\n        this.ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);\n      }\n    }\n  }, {\n    key: \"renderRepeat\",\n    value: function renderRepeat(path, image, imageSize, offsetX, offsetY) {\n      this.path(path);\n      this.ctx.fillStyle = this.ctx.createPattern(this.resizeImage(image, imageSize), 'repeat');\n      this.ctx.translate(offsetX, offsetY);\n      this.ctx.fill();\n      this.ctx.translate(-offsetX, -offsetY);\n    }\n  }, {\n    key: \"renderTextNode\",\n    value: function renderTextNode(textBounds, color, font, textDecoration, textShadows) {\n      var _this4 = this;\n\n      this.ctx.font = [font.fontStyle, font.fontVariant, font.fontWeight, font.fontSize, font.fontFamily].join(' ');\n      textBounds.forEach(function (text) {\n        _this4.ctx.fillStyle = color.toString();\n\n        if (textShadows && text.text.trim().length) {\n          textShadows.slice(0).reverse().forEach(function (textShadow) {\n            _this4.ctx.shadowColor = textShadow.color.toString();\n            _this4.ctx.shadowOffsetX = textShadow.offsetX * _this4.options.scale;\n            _this4.ctx.shadowOffsetY = textShadow.offsetY * _this4.options.scale;\n            _this4.ctx.shadowBlur = textShadow.blur;\n\n            _this4.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);\n          });\n          _this4.ctx.shadowColor = '';\n          _this4.ctx.shadowOffsetX = 0;\n          _this4.ctx.shadowOffsetY = 0;\n          _this4.ctx.shadowBlur = 0;\n        } else {\n          _this4.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);\n        }\n\n        if (textDecoration !== null) {\n          var textDecorationColor = textDecoration.textDecorationColor || color;\n          textDecoration.textDecorationLine.forEach(function (textDecorationLine) {\n            switch (textDecorationLine) {\n              case _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_1__[\"TEXT_DECORATION_LINE\"].UNDERLINE:\n                // Draws a line at the baseline of the font\n                // TODO As some browsers display the line as more than 1px if the font-size is big,\n                // need to take that into account both in position and size\n                var _this4$options$fontMe = _this4.options.fontMetrics.getMetrics(font),\n                    baseline = _this4$options$fontMe.baseline;\n\n                _this4.rectangle(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1, textDecorationColor);\n\n                break;\n\n              case _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_1__[\"TEXT_DECORATION_LINE\"].OVERLINE:\n                _this4.rectangle(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1, textDecorationColor);\n\n                break;\n\n              case _parsing_textDecoration__WEBPACK_IMPORTED_MODULE_1__[\"TEXT_DECORATION_LINE\"].LINE_THROUGH:\n                // TODO try and find exact position for line-through\n                var _this4$options$fontMe2 = _this4.options.fontMetrics.getMetrics(font),\n                    middle = _this4$options$fontMe2.middle;\n\n                _this4.rectangle(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1, textDecorationColor);\n\n                break;\n            }\n          });\n        }\n      });\n    }\n  }, {\n    key: \"resizeImage\",\n    value: function resizeImage(image, size) {\n      if (image.width === size.width && image.height === size.height) {\n        return image;\n      }\n\n      var canvas = this.canvas.ownerDocument.createElement('canvas');\n      canvas.width = size.width;\n      canvas.height = size.height;\n      var ctx = canvas.getContext('2d');\n      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size.width, size.height);\n      return canvas;\n    }\n  }, {\n    key: \"setOpacity\",\n    value: function setOpacity(opacity) {\n      this.ctx.globalAlpha = opacity;\n    }\n  }, {\n    key: \"transform\",\n    value: function transform(offsetX, offsetY, matrix, callback) {\n      this.ctx.save();\n      this.ctx.translate(offsetX, offsetY);\n      this.ctx.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);\n      this.ctx.translate(-offsetX, -offsetY);\n      callback();\n      this.ctx.restore();\n    }\n  }]);\n\n  return CanvasRenderer;\n}();\n\n\n\n//# sourceURL=webpack://html2canvas/./src/renderer/CanvasRenderer.js?");

/***/ }),

/***/ "./src/renderer/ForeignObjectRenderer.js":
/*!***********************************************!*\
  !*** ./src/renderer/ForeignObjectRenderer.js ***!
  \***********************************************/
/*! exports provided: default, createForeignObjectSVG, loadSerializedSVG */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ForeignObjectRenderer; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createForeignObjectSVG\", function() { return createForeignObjectSVG; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"loadSerializedSVG\", function() { return loadSerializedSVG; });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar ForeignObjectRenderer =\n/*#__PURE__*/\nfunction () {\n  function ForeignObjectRenderer(element) {\n    _classCallCheck(this, ForeignObjectRenderer);\n\n    this.element = element;\n  }\n\n  _createClass(ForeignObjectRenderer, [{\n    key: \"render\",\n    value: function render(options) {\n      var _this = this;\n\n      this.options = options;\n      this.canvas = document.createElement('canvas');\n      this.ctx = this.canvas.getContext('2d');\n      this.canvas.width = Math.floor(options.width) * options.scale;\n      this.canvas.height = Math.floor(options.height) * options.scale;\n      this.canvas.style.width = \"\".concat(options.width, \"px\");\n      this.canvas.style.height = \"\".concat(options.height, \"px\");\n      this.ctx.scale(options.scale, options.scale);\n      options.logger.log(\"ForeignObject renderer initialized (\".concat(options.width, \"x\").concat(options.height, \" at \").concat(options.x, \",\").concat(options.y, \") with scale \").concat(options.scale));\n      var svg = createForeignObjectSVG(Math.max(options.windowWidth, options.width) * options.scale, Math.max(options.windowHeight, options.height) * options.scale, options.scrollX * options.scale, options.scrollY * options.scale, this.element);\n      return loadSerializedSVG(svg).then(function (img) {\n        if (options.backgroundColor) {\n          _this.ctx.fillStyle = options.backgroundColor.toString();\n\n          _this.ctx.fillRect(0, 0, options.width * options.scale, options.height * options.scale);\n        }\n\n        _this.ctx.drawImage(img, -options.x * options.scale, -options.y * options.scale);\n\n        return _this.canvas;\n      });\n    }\n  }]);\n\n  return ForeignObjectRenderer;\n}();\n\n\nvar createForeignObjectSVG = function createForeignObjectSVG(width, height, x, y, node) {\n  var xmlns = 'http://www.w3.org/2000/svg';\n  var svg = document.createElementNS(xmlns, 'svg');\n  var foreignObject = document.createElementNS(xmlns, 'foreignObject');\n  svg.setAttributeNS(null, 'width', width);\n  svg.setAttributeNS(null, 'height', height);\n  foreignObject.setAttributeNS(null, 'width', '100%');\n  foreignObject.setAttributeNS(null, 'height', '100%');\n  foreignObject.setAttributeNS(null, 'x', x);\n  foreignObject.setAttributeNS(null, 'y', y);\n  foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');\n  svg.appendChild(foreignObject);\n  foreignObject.appendChild(node);\n  return svg;\n};\nvar loadSerializedSVG = function loadSerializedSVG(svg) {\n  return new Promise(function (resolve, reject) {\n    var img = new Image();\n\n    img.onload = function () {\n      return resolve(img);\n    };\n\n    img.onerror = reject;\n    img.src = \"data:image/svg+xml;charset=utf-8,\".concat(encodeURIComponent(new XMLSerializer().serializeToString(svg)));\n  });\n};\n\n//# sourceURL=webpack://html2canvas/./src/renderer/ForeignObjectRenderer.js?");

/***/ })

/******/ })["default"];
});
/**
 * Created by bdraper
 */


    function convertArrayOfObjectsToCSV(args) {
        let result, counter, keys = [], columnDelimiter, lineDelimiter, data, headers, unorderedKeys;
        headers = [];
        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }
        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';
        unorderedKeys = Object.keys(data[0]);
        args.headers.forEach(function (col) {
            let found = false;
            unorderedKeys = unorderedKeys.filter(function (item) {
                if (!found && item === col.fieldName) {
                    keys.push(item);
                    found = true;
                    return false;
                } else {
                    return true;
                }
            })
        })
        // put the headers array in the same order as the data keys
        keys.forEach(function (item) {
            const obj = args.headers.filter(function (o) {
                return o.fieldName === item;
            })[0];
            if (obj) {
                headers.push(obj.colName);
            }
        });
        // remove keys that aren't in the headers array, ensuring those data columns won't be exported
        // keys.forEach(function (item) {
        //     if (headers.indexOf(item) < 0) {
        //         let ndx = keys.indexOf(item);
        //         keys.splice(ndx, 1);
        //     }
        // });
        result = '';
        result += (args.headers) ? headers.join(columnDelimiter) : keys.join(columnDelimiter);
        result += lineDelimiter;
        data.forEach(function (item) {
            counter = 0;
            keys.forEach(function (key) {
                if (counter > 0) {
                    result += columnDelimiter;
                }
                if (item[key] == null) {
                    result += '';
                } else if (typeof item[key] === 'string' && item[key].includes(',')) {
                    result += '"' + item[key] + '"';
                } else {
                    result += item[key];
                }
                counter++;
            });
            result += lineDelimiter;
        });
        return result;
    }

    function generateCSV(args) {
        let data, filename, link;
        let csv = this.convertArrayOfObjectsToCSV({
            data: args.data,
            headers: args.headers
        });
        if (csv == null) { return; }
        filename = args.filename || 'export.csv';
        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }
