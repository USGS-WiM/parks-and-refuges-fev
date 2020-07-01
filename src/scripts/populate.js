/**
 * Created by bdraper on 8/2/2016.
 */

$( document ).ready(function() {

    $('#btnClearFilters').click(function(){
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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
    $('.regionType').select2({
        placeholder: 'Select type',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $('.regionType').append('<option value="doi">' + 'DOI Regions' + '</option>');
    $('.regionType').append('<option value="fws">' + 'FWS Legacy Regions' + '</option>');
    $('.regionType').append('<option value="nps">' + 'NPS Networks' + '</option>');

     // Lands type selector
     $('.typeSelect').select2({
        placeholder: 'Select type',
        allowClear: false,
        maximumSelectionLength: 1
    });
    $('.typeSelect').append('<option value="parks">' + 'Parks' + '</option>');
    $('.typeSelect').append('<option value="refuges">' + 'Refuges' + '</option>');

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
                    headers: {'Accept': '*/*'},
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
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=ORGNAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: {'Accept': '*/*'},
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
                    headers: {'Accept': '*/*'},
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
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSApproved/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=ORGNAME&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: {'Accept': '*/*'},
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
    $('#regionType_regionalModal').change(function () {

        // clearing out the results incase region type 
        $('.regionSelect').empty();

        // if it has a value, we query to get the region geometry
        if (($('#regionType_regionalModal').val()) === null) {
           
        } else {
            if ($('#regionType_regionalModal').val()[0] === "doi") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/ArcGIS/rest/services/DOI_Unified_Regions/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: {'Accept': '*/*'},
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.regionSelect').append('<option value="' + data.features[i].attributes.REG_NUM + '">' + data.features[i].attributes.REG_NAME + '</option>');
                            /* data[i].id = data[i].event_id;
                            fev.data.events.push(data[i]); */
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });
                
                
            } else if ($('#regionType_regionalModal').val()[0] === "fws") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_Legacy_Regional_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson',
                    headers: {'Accept': '*/*'},
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
            } else if ($('#regionType_regionalModal').val()[0] === "nps") {
                $.ajax({
                    dataType: 'json',
                    type: 'GET',
                    url: 'https://irmaservices.nps.gov/arcgis/rest/services/NPSData/NPS_MonitoringNetworks/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson',
                    headers: {'Accept': '*/*'},
                    success: function (data) {
                        for (var i = 0; i < data.features.length; i++) {
                            $('.regionSelect').append('<option value="' + data.features[i].attributes.NetworkName + '">' + data.features[i].attributes.NetworkName + '</option>');
                        }
                    },
                    error: function (error) {
                        console.log('Error processing the JSON. The error is:' + error);
                    }
                });
            }
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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
        headers: {'Accept': '*/*'},
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

    var populateCountiesArray =  function  () {
        for (var i=0; i<fev.data.states.length; i++) {
            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: 'https://stn.wim.usgs.gov/STNServices/Sites/CountiesByState.json?StateAbbrev=' + fev.data.states[i].state_abbrev ,
                headers: {'Accept': '*/*'},
                currentState: fev.data.states[i].state_abbrev,
                success: function (data)  {
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
        if ( (!currentSelection > 0) || currentSelection === null) {
            $('#countySelect').html('');
            $('#countySelect').append('<option value=null>Please select state(s) first </option>');
            return;
        }
        var currentCounties = [];
        for (var key in fev.data.counties){
            for(var i=0; i<fev.data.counties[key].length; i++ ){

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