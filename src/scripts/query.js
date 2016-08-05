/**
 * Created by bdraper on 8/4/2016.
 */
    ///function to grab all values from the inputs, form into arrays, and build query strings


var buildQueryStrings =  function  () {

        //event type
        var eventTypeSelections = "";
        if ($('#evtTypeSelect').val() !== null){
            var evtTypeSelectionsArray = $('#evtTypeSelect').val();
            eventTypeSelections = evtTypeSelectionsArray.toString();
            $('#eventTypeDisplay').html($('#evtTypeSelect').select2('data').map(function(elem){ return elem.text;}).join(', '));
        }
        //event
        var eventSelections = "";
        if ($('#evtSelect').val() !== null){
            var eventSelectionsArray = $('#evtSelect').val();
            eventSelections = eventSelectionsArray.toString();
            $('#eventNameDisplay').html($('#evtSelect').select2('data').map(function(elem){ return elem.text;}).join(', '));
    
        }
        //event status
        var eventStatusSelectionArray = [];
        //event status: active
        if ($("#active")[0].checked && !($("#complete")[0].checked) ) {
            eventStatusSelectionArray.push(1);
            $('#eventStatusDisplay').html('Active');
        }
        //event status: complete
        if ($("#complete")[0].checked && !($("#active")[0].checked)) {
            eventStatusSelectionArray.push(2);
            $('#eventStatusDisplay').html('Complete');
        }
        if ($("#active")[0].checked && $("#complete")[0].checked) {
            eventStatusSelectionArray.push(0);
            $('#eventStatusDisplay').html('Active, Complete');
        }
        if ( !($("#active")[0].checked) && !($("#complete")[0].checked)) {
            eventStatusSelectionArray.push(0);
             $('#eventStatusDisplay').html('');
        }


        var eventStatusSelection =  eventStatusSelectionArray.toString();

        //state
        var stateSelections = "";
        if ($('#stateSelect').val() !== null){
            var stateSelectionsArray = $('#stateSelect').val();
            stateSelections = stateSelectionsArray.toString();
            $('#stateDisplay').html(stateSelections);
        }
        //county
        var countySelections = "";
        if ($('#countySelect').val() !== null){
            var countySelectionsArray = $('#countySelect').val();
            countySelections = countySelectionsArray.toString();
            $('#countyDisplay').html(countySelections);
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //SENSORS
        if ($("#sensorRad")[0].checked){
            //sensor type
            var sensorTypeSelections = "";
            if ($('#sensorTypeSelect').val() !== null ){
                var sensorTypeSelectionArray = $('#sensorTypeSelect').val();
                sensorTypeSelections = sensorTypeSelectionArray.toString();
                $('#sensorTypeDisplay').html($('#sensorTypeSelect').select2('data')[0].text);
            }
            //sensor status
            var sensorStatusSelections = "";
            if ($('#sensorStatusSelect').val() !== null ){
                var sensorStatusSelectionArray = $('#sensorStatusSelect').val();
                sensorStatusSelections = sensorStatusSelectionArray.toString();
                $('#sensorStatusDisplay').html($('#sensorStatusSelect').select2('data')[0].text);
            }

            //sensor collection condition
            var collectConditionSelections = "";
            if ($('#collectionConditionSelect').val() !== null ){
                var collectConditionSelectionArray = $('#collectionConditionSelect').val();
                collectConditionSelections = collectConditionSelectionArray.toString();
                $('#collectConditionDisplay').html($('#collectionConditionSelect').select2('data')[0].text);
            }

            //sensor deployment type
            var deploymentTypeSelections = "";
            if ($('#deployTypeSelect').val() !== null ){
                var deploymentTypeSelectionArray = $('#deployTypeSelect').val();
                deploymentTypeSelections = deploymentTypeSelectionArray.toString();
                $('#deployTypeDisplay').html($('#deployTypeSelect').select2('data')[0].text);
            }

            fev.queryStrings.sensorsQueryString = "?Event=" + eventSelections + "&EventType=" + eventTypeSelections + "&EventStatus=" + eventStatusSelection + "&States=" + stateSelections + "&County=" + countySelections + "&SensorType=" + sensorTypeSelections + "&CurrentStatus=" + sensorStatusSelections + "&CollectionCondition=" + collectConditionSelections + "&DeploymentType=" + deploymentTypeSelections;
            //var resultIsEmpty = false;

            fev.urls.csvSensorsQueryURL = fev.urls.csvSensorsURLRoot + fev.queryStrings.sensorsQueryString;
            fev.urls.jsonSensorsQueryURL = fev.urls.jsonSensorsURLRoot + fev.queryStrings.sensorsQueryString;
            fev.urls.xmlSensorsQueryURL = fev.urls.xmlSensorsURLRoot + fev.queryStrings.sensorsQueryString;

            //add download buttons
            $('#sensorDownloadButtons').append('<a href="' + fev.urls.csvSensorsQueryURL +'" class="btn btn-info" role="button">Download Sensors CSV</a>');
            $('#sensorDownloadButtons').append('<a href="' + fev.urls.jsonSensorsQueryURL +'" class="btn btn-info" role="button">Download Sensors JSON</a>');
            $('#sensorDownloadButtons').append('<a href="' + fev.urls.xmlSensorsQueryURL +'" class="btn btn-info" role="button">Download Sensors XML</a>');

            var baroSensors = new L.geoJson().addTo(map);
            var metSensors = new L.geoJson().addTo(map);
            var rdgSensors = new L.geoJson().addTo(map);
            var waveHeightSensors = new L.geoJson().addTo(map);

            var stormTideGeoJSON = $.ajax({
                dataType: "json",
                url: fev.urls.stormTideGeoJSONViewURL + fev.queryStrings.sensorsQueryString,
                success: function(data) {
                    $(data.features).each(function(key, data) {
                        var stormTideSensors = new L.geoJson(data, {
                            pointToLayer: function (feature, latlng) {
                                return L.circleMarker(latlng, {
                                    radius: 4,
                                    fillColor: "#FF0000",
                                    color: "#000",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }
                        }).addTo(map);
                    });
                }
            }).error(function() {});


            



        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        //HWMs
        if ($("#hwmRad")[0].checked) {
            //HWM types
            var hwmTypeSelections = "";
            if ($('#hwmTypeSelect').val() !== null ){
                var hwmTypeSelectionArray = $('#hwmTypeSelect').val();
                hwmTypeSelections = hwmTypeSelectionArray.toString();
                $('#hwmTypeDisplay').html($('#hwmTypeSelect').select2('data')[0].text);
            }
            //HWM quality
            var hwmQualitySelections = "";
            if ($('#hwmQualitySelect').val() !== null ){
                var hwmQualitySelectionArray = $('#hwmQualitySelect').val();
                hwmQualitySelections = hwmQualitySelectionArray.toString();
                $('#hwmQualityDisplay').html($('#hwmQualitySelect').select2('data')[0].text);
            }
            ////HWM environment
            var hwmEnvSelectionArray = [];
            //HWM environment: coastal
            if ($("#coastal")[0].checked && !($("#riverine")[0].checked)) {
                hwmEnvSelectionArray.push("Coastal");
                $('#hwmEnvDisplay').html('Coastal');
            }
            //HWM environment: riverine
            if ($("#riverine")[0].checked && !($("#coastal")[0].checked) ) {
                hwmEnvSelectionArray.push("Riverine");
                $('#hwmEnvDisplay').html('Riverine');
            }
            var hwmEnvSelections = hwmEnvSelectionArray.toString();
            //HWM survey status
            var hwmSurveyStatusSelectionArray = [];
            ///HWM survey status: complete
            if ($("#surveyCompleteYes")[0].checked && !($("#surveyCompleteNo")[0].checked)) {
                hwmSurveyStatusSelectionArray.push("true");
                $('#hwmSurveyCompDisplay').html('True');
            }
            ///HWM survey status: not complete
            if ($("#surveyCompleteNo")[0].checked && !($("#surveyCompleteYes")[0].checked)) {
                hwmSurveyStatusSelectionArray.push("false");
                $('#hwmSurveyCompDisplay').html('False');
            }
            var hwmSurveyStatusSelections = hwmSurveyStatusSelectionArray.toString();
            //HWM stillwater status
            var hwmStillwaterStatusSelectionArray = [];
            ///HWM stillwater status: yes
            if ($("#stillWaterYes")[0].checked && !($("#stillWaterNo")[0].checked)) {
                hwmStillwaterStatusSelectionArray.push("true");
                $('#hwmStillWaterDisplay').html('True');
            }
            ///HWM stillwater status: no
            if ($("#stillWaterNo")[0].checked  && !($("#stillWaterYes")[0].checked)) {
                hwmStillwaterStatusSelectionArray.push("false");
                $('#hwmStillWaterDisplay').html('False');
            }
            var hwmStillwaterStatusSelections = hwmStillwaterStatusSelectionArray.toString();

            fev.queryStrings.hwmsQueryString = "?Event=" + eventSelections + "&EventType=" + eventTypeSelections + "&EventStatus=" + eventStatusSelection + "&States=" + stateSelections + "&County=" + countySelections + "&HWMType=" + hwmTypeSelections + "&HWMQuality=" + hwmQualitySelections + "&HWMEnvironment=" + hwmEnvSelections + "&SurveyComplete=" + hwmSurveyStatusSelections + "&StillWater=" + hwmStillwaterStatusSelections;
            //var resultIsEmpty = false;

            fev.urls.csvHWMsQueryURL = fev.urls.csvHWMsURLRoot + fev.queryStrings.hwmsQueryString ;
            fev.urls.jsonHWMsQueryURL = fev.urls.jsonHWMsURLRoot + fev.queryStrings.hwmsQueryString ;
            fev.urls.xmlHWMsQueryURL = fev.urls.xmlHWMsURLRoot + fev.queryStrings.hwmsQueryString ;

            //add download buttons
            $('#hwmDownloadButtons').append('<a href="' + fev.urls.csvHWMsQueryURL +'" class="btn btn-info" role="button">Download HWM CSV</a>');
            $('#hwmDownloadButtons').append('<a href="' + fev.urls.jsonHWMsQueryURL +'" class="btn btn-info" role="button">Download HWM JSON</a>');
            $('#hwmDownloadButtons').append('<a href="' + fev.urls.xmlHWMsQueryURL +'" class="btn btn-info" role="button">Download HWM XML</a>');

        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        //PEAKS
        if ($("#peakRad")[0].checked) {
            var peakStartDate;
            if ($("#peakStartDate").value !== ""){
                peakStartDate = $("#peakStartDate")[0].value;
            }
            var peakEndDate;
            if ($("#peakEndDate").value !== "") {
                peakEndDate = $("#peakEndDate")[0].value;
            }

            fev.queryStrings.peaksQueryString = "?Event=" + eventSelections + "&EventType=" + eventTypeSelections + "&EventStatus=" + eventStatusSelection + "&States=" + stateSelections + "&County=" + countySelections + "&StartDate="  + peakStartDate + "&EndDate=" + peakEndDate;
            //var resultIsEmpty = false;

            fev.urls.csvPeaksQueryURL = fev.urls.csvPeaksURLRoot + fev.queryStrings.peaksQueryString;
            fev.urls.jsonPeaksQueryURL = fev.urls.jsonPeaksURLRoot + fev.queryStrings.peaksQueryString;
            fev.urls.xmlPeaksQueryURL = fev.urls.xmlPeaksURLRoot + fev.queryStrings.peaksQueryString;

            //add download buttons
            $('#peaksDownloadButtons').append('<a href="' + fev.urls.csvPeaksQueryURL +'" class="btn btn-info" role="button">Download HWM CSV</a>');
            $('#peaksDownloadButtons').append('<a href="' + fev.urls.jsonPeaksQueryURL +'" class="btn btn-info" role="button">Download HWM JSON</a>');
            $('#peaksDownloadButtons').append('<a href="' + fev.urls.xmlPeaksQueryURL +'" class="btn btn-info" role="button">Download HWM XML</a>');
        }
    };


