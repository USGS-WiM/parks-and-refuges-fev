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
        }
        //event
        var eventSelections = "";
        if ($('#evtSelect').val() !== null){
            var eventSelectionsArray = $('#evtSelect').val();
            eventSelections = eventSelectionsArray.toString();
        }
        //event status
        var eventStatusSelectionArray = [];
        //event status: active
        if ($("#active")[0].checked && !($("#complete")[0].checked) ) {
            eventStatusSelectionArray.push(1);
        }
        //event status: complete
        if ($("#complete")[0].checked && !($("#active")[0].checked)) {
            eventStatusSelectionArray.push(2);
        }
        if ($("#active")[0].checked && $("#complete")[0].checked || !($("#active")[0].checked) && !($("#complete")[0].checked)) {
            eventStatusSelectionArray.push(0);
        }
        var eventStatusSelection =  eventStatusSelectionArray.toString();

        //state
        var stateSelections = "";
        if ($('#stateSelect').val() !== null){
            var stateSelectionsArray = $('#stateSelect').val();
            stateSelections = stateSelectionsArray.toString();
        }
        //county
        var countySelections = "";
        if ($('#countySelect').val() !== null){
            var countySelectionsArray = $('#countySelect').val();
            countySelections = countySelectionsArray.toString();
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //SENSORS
        if ($("#sensorRad")[0].checked){
            //sensor type
            var sensorTypeSelections = "";
            if ($('#sensorTypeSelect').val() !== null ){
                var sensorTypeSelectionArray = $('#sensorTypeSelect').val();
                sensorTypeSelections = sensorTypeSelectionArray.toString();
            }
            //sensor status
            var sensorStatusSelections = "";
            if ($('#sensorStatusSelect').val() !== null ){
                var sensorStatusSelectionArray = $('#sensorStatusSelect').val();
                sensorStatusSelections = sensorStatusSelectionArray.toString();
            }

            //sensor collection condition
            var collectConditionSelections = "";
            if ($('#collectionConditionSelect').val() !== null ){
                var collectConditionSelectionArray = $('#collectionConditionSelect').val();
                collectConditionSelections = collectConditionSelectionArray.toString();
            }

            //sensor deployment type
            var deploymentTypeSelections = "";
            if ($('#deployTypeSelect').val() !== null ){
                var deploymentTypeSelectionArray = $('#deployTypeSelect').val();
                deploymentTypeSelections = deploymentTypeSelectionArray.toString();
            }

            stnDataPortal.globals.xmlSensorsURLRoot = "http://stn.wim.usgs.gov/STNServices/Instruments";
            stnDataPortal.globals.jsonSensorsURLRoot = "http://stn.wim.usgs.gov/STNServices/Instruments.json";
            stnDataPortal.globals.csvSensorsURLRoot = "http://stn.wim.usgs.gov/STNServices/Instruments.csv";
            stnDataPortal.globals.sensorsQueryString = "?Event=" + eventSelections + "&EventType=" + eventTypeSelections + "&EventStatus=" + eventStatusSelection + "&States=" + stateSelections + "&County=" + countySelections + "&CurrentStatus=" + sensorStatusSelections + "&CollectionCondition=" + collectConditionSelections + "&DeploymentType=" + deploymentTypeSelections;
            //var resultIsEmpty = false;

            stnDataPortal.globals.csvQueryURL = stnDataPortal.globals.csvSensorsURLRoot + stnDataPortal.globals.sensorsQueryString;
            stnDataPortal.globals.jsonQueryURL = stnDataPortal.globals.jsonSensorsURLRoot + stnDataPortal.globals.sensorsQueryString;
            stnDataPortal.globals.xmlQueryURL = stnDataPortal.globals.xmlSensorsURLRoot + stnDataPortal.globals.sensorsQueryString;

        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        //HWMs
        if ($("#hwmRad")[0].checked) {
            //HWM types
            var hwmTypeSelections = "";
            if ($('#hwmTypeSelect').val() !== null ){
                var hwmTypeSelectionArray = $('#hwmTypeSelect').val();
                hwmTypeSelections = hwmTypeSelectionArray.toString();
            }
            //HWM quality
            var hwmQualitySelections = "";
            if ($('#hwmQualitySelect').val() !== null ){
                var hwmQualitySelectionArray = $('#hwmQualitySelect').val();
                hwmQualitySelections = hwmQualitySelectionArray.toString();
            }
            ////HWM environment
            var hwmEnvSelectionArray = [];
            //HWM environment: coastal
            if ($("#coastal")[0].checked && !($("#riverine")[0].checked)) {
                hwmEnvSelectionArray.push("Coastal");
            }
            //HWM environment: riverine
            if ($("#riverine")[0].checked && !($("#coastal")[0].checked) ) {
                hwmEnvSelectionArray.push("Riverine");
            }
            var hwmEnvSelections = hwmEnvSelectionArray.toString();
            //HWM survey status
            var hwmSurveyStatusSelectionArray = [];
            ///HWM survey status: complete
            if ($("#surveyCompleteYes")[0].checked && !($("#surveyCompleteNo")[0].checked)) {
                hwmSurveyStatusSelectionArray.push("true");
            }
            ///HWM survey status: not complete
            if ($("#surveyCompleteNo")[0].checked && !($("#surveyCompleteYes")[0].checked)) {
                hwmSurveyStatusSelectionArray.push("false");
            }
            var hwmSurveyStatusSelections = hwmSurveyStatusSelectionArray.toString();
            //HWM stillwater status
            var hwmStillwaterStatusSelectionArray = [];
            ///HWM stillwater status: yes
            if ($("#stillWaterYes")[0].checked && !($("#stillWaterNo")[0].checked)) {
                hwmStillwaterStatusSelectionArray.push("true");
            }
            ///HWM stillwater status: no
            if ($("#stillWaterNo")[0].checked  && !($("#stillWaterYes")[0].checked)) {
                hwmStillwaterStatusSelectionArray.push("false");
            }
            var hwmStillwaterStatusSelections = hwmStillwaterStatusSelectionArray.toString();

            stnDataPortal.globals.xmlHWMsURLRoot = "http://stn.wim.usgs.gov/STNServices/HWMs/FilteredHWMs";
            stnDataPortal.globals.jsonHWMsURLRoot = "http://stn.wim.usgs.gov/STNServices/HWMs/FilteredHWMs.json";
            stnDataPortal.globals.csvHWMsURLRoot = "http://stn.wim.usgs.gov/STNServices/HWMs/FilteredHWMs.csv";
            stnDataPortal.globals.hwmsQueryString = "?Event=" + eventSelections + "&EventType=" + eventTypeSelections + "&EventStatus=" + eventStatusSelection + "&States=" + stateSelections + "&County=" + countySelections + "&HWMType=" + hwmTypeSelections + "&HWMQuality=" + hwmQualitySelections + "&HWMEnvironment=" + hwmEnvSelections + "&SurveyComplete=" + hwmSurveyStatusSelections + "&StillWater=" + hwmStillwaterStatusSelections;
            //var resultIsEmpty = false;

            stnDataPortal.globals.csvQueryURL = stnDataPortal.globals.csvHWMsURLRoot + stnDataPortal.globals.hwmsQueryString;
            stnDataPortal.globals.jsonQueryURL = stnDataPortal.globals.jsonHWMsURLRoot + stnDataPortal.globals.hwmsQueryString;
            stnDataPortal.globals.xmlQueryURL = stnDataPortal.globals.xmlHWMsURLRoot + stnDataPortal.globals.hwmsQueryString;

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

            stnDataPortal.globals.xmlPeaksURLRoot = "http://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks";
            stnDataPortal.globals.jsonPeaksURLRoot = "http://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json";
            stnDataPortal.globals.csvPeaksURLRoot = "http://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.csv";
            stnDataPortal.globals.peaksQueryString = "?Event=" + eventSelections + "&EventType=" + eventTypeSelections + "&EventStatus=" + eventStatusSelection + "&States=" + stateSelections + "&County=" + countySelections + "&StartDate="  + peakStartDate + "&EndDate=" + peakEndDate;
            //var resultIsEmpty = false;

            stnDataPortal.globals.csvQueryURL = stnDataPortal.globals.csvPeaksURLRoot + stnDataPortal.globals.peaksQueryString;
            stnDataPortal.globals.jsonQueryURL = stnDataPortal.globals.jsonPeaksURLRoot + stnDataPortal.globals.peaksQueryString;
            stnDataPortal.globals.xmlQueryURL = stnDataPortal.globals.xmlPeaksURLRoot + stnDataPortal.globals.peaksQueryString;

        }
    };


