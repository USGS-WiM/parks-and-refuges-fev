/**
 * Created by bdraper on 8/2/2016.
 */


$( document ).ready(function() {

    // Register Event type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.eventTypes array
    $('#evtTypeSelect').select2({
        placeholder: "All Types",
        ajax: {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/eventtypes.json',
            headers: {'Accept': '*/*'},
            cache: false,
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.eventTypes.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.event_type_id,
                            text: item.type,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });

    // Register Event select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.events array
    $('#evtSelect').select2({
        placeholder: "All Events"
    });
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'http://stn.wim.usgs.gov/STNServices/events.json',
        headers: {'Accept': '*/*'},
        success: function (data) {
            data.sort(function (a, b) {
                var eventA = a.event_name;
                var eventB = b.event_name;
                if (eventA < eventB) {
                    return -1
                }
                if (eventA > eventB) {
                    return 1
                }
                else {
                    return 0
                }
            });
            for (var i = 0; i < data.length; i++) {
                $('#evtSelect').append("<option value='" + data[i].event_id + "'>" + data[i].event_name + "</option>");
                data[i].id = data[i].event_id;
                fev.data.events.push(data[i]);
            }
        },
        error: function (error) {
            console.log("Error processing the JSON. The error is:" + error);
        }
    });


    // Register states select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.states array
    $('#stateSelect').select2({
        placeholder: "All States",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/Sites/States.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.states.push(data[i]); }
                populateCountiesArray();
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.state_abbrev,
                            text: item.state_name,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });


    //county select is a special case - populated values depend on states selected. see other logic TBD
    $('#countySelect').select2({
        placeholder: "All Counties"
    });

    $('#countySelect').on("select2:select select2:unselect", function (selection) {
       //will need special treatment for display string creation
       console.log("Selected counties are: "+ $("#countySelect").val() );
    });


    // Register sensor type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.sensorTypes array
    $('#sensorTypeSelect').select2({
        placeholder: "All Types",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/sensortypes.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.sensorTypes.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.sensor_type_id,
                            text: item.sensor,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });

    // $('#sensorTypeSelect').on("select2:select select2:unselect", function (evt) {
    //     var currentSelection = $(this).val();
    //     //UPDATE DISPLAY VALUES
    //     var combinedArray = [];
    //     var displayArray;
    //     for (var i=0; i < currentSelection.length; i++) {
    //         displayArray = fev.data.sensorTypes.filter(function (obj) {
    //             return obj.sensor_type_id == currentSelection[i];
    //         });
    //         combinedArray.push(displayArray[0].sensor);
    //     };
    //     var displayString = combinedArray.join();
    //     //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
    //     console.log("Selected sensor type(s) are: " + displayString);
    //     $('#sensorTypeDisplay').html(displayString);
    // });


    // Register sensor status select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.sensorStatusTypes array
    $('#sensorStatusSelect').select2({
        placeholder: "All Statuses",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/statustypes.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.sensorStatusTypes.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.status_type_id,
                            text: item.status,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });


    // $('#sensorStatusSelect').on("select2:select select2:unselect", function (evt) {
    //     var currentSelection = $(this).val();
    //     //UPDATE DISPLAY VALUES
    //     var combinedArray = [];
    //     var displayArray;
    //     for (var i=0; i < currentSelection.length; i++) {
    //         displayArray = fev.data.sensorStatusTypes.filter(function (obj) {
    //             return obj.status_type_id == currentSelection[i];
    //         });
    //         combinedArray.push(displayArray[0].status);
    //     };
    //     var displayString = combinedArray.join();
    //     //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
    //     console.log("Selected sensor status(s) are: " + displayString);
    //     $('#sensorStatusDisplay').html(displayString);
    // });

    // Register collection condition select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.collectionConditions array
    $('#collectionConditionSelect').select2({
        placeholder: "All Conditions",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/InstrCollectConditions.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.collectionConditions.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.id,
                            text: item.condition,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });

    // $('#collectionConditionSelect').on("select2:select select2:unselect", function (evt) {
    //     var currentSelection = $(this).val();
    //     //UPDATE DISPLAY VALUES
    //     var combinedArray = [];
    //     var displayArray;
    //     for (var i=0; i < currentSelection.length; i++) {
    //         displayArray = fev.data.collectionConditions.filter(function (obj) {
    //             return obj.id == currentSelection[i];
    //         });
    //         combinedArray.push(displayArray[0].condition);
    //     };
    //     var displayString = combinedArray.join();
    //     //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
    //     console.log("Selected collect condition(s) are: " + displayString);
    //     $('#collectConditionDisplay').html(displayString);
    // });

    // Register deploy type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.deploymentTypes array
    $('#deployTypeSelect').select2({
        placeholder: "All Deploy Types",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/deploymenttypes.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.deploymentTypes.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.deployment_type_id,
                            text: item.method,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });

    // $('#deployTypeSelect').on("select2:select select2:unselect", function (evt) {
    //     var currentSelection = $(this).val();
    //     //UPDATE DISPLAY VALUES
    //     var combinedArray = [];
    //     var displayArray;
    //     for (var i=0; i < currentSelection.length; i++) {
    //         displayArray = fev.data.deploymentTypes.filter(function (obj) {
    //             return obj.deployment_type_id == currentSelection[i];
    //         });
    //         combinedArray.push(displayArray[0].method);
    //     };
    //     var displayString = combinedArray.join();
    //     //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
    //     console.log("Selected deploy type(s) are: " + displayString);
    //     $('#deployTypeDisplay').html(displayString);
    // });

    // Register HWM type type select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.hwmTypes array
    $('#hwmTypeSelect').select2({
        placeholder: "All Types",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/hwmtypes.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.hwmTypes.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.hwm_type_id,
                            text: item.hwm_type,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });

    // $('#hwmTypeSelect').on("select2:select select2:unselect", function (evt) {
    //     var currentSelection = $(this).val();
    //     //UPDATE DISPLAY VALUES
    //     var combinedArray = [];
    //     var displayArray;
    //     for (var i=0; i < currentSelection.length; i++) {
    //         displayArray = fev.data.hwmTypes.filter(function (obj) {
    //             return obj.hwm_type_id == currentSelection[i];
    //         });
    //         combinedArray.push(displayArray[0].hwm_type);
    //     };
    //     var displayString = combinedArray.join();
    //     //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
    //     console.log("Selected hwm type(s) are: " + displayString);
    //     $('#hwmTypeDisplay').html(displayString);
    // });


    // Register HWM quality select as select2, retrieve values from jQuery ajax, sort, populate dropdown
    //stores values in fev.data.hwmQualities array
    $('#hwmQualitySelect').select2({
        placeholder: "All Qualities",
        ajax : {
            dataType: 'json',
            type: 'GET',
            url: 'http://stn.wim.usgs.gov/STNServices/hwmqualities.json',
            headers: {'Accept': '*/*'},
            processResults: function (data) {

                for (var i = 0; i < data.length; i++) { fev.data.hwmQualities.push(data[i]); }
                return {
                    results: $.map(data, function (item) {
                        return {
                            id: item.hwm_quality_id,
                            text: item.hwm_quality,
                        };
                    })
                };
            },
            error: function (error) {
                console.log("Error processing the JSON. The error is:" + error);
            }
        }
    });

    // $('#hwmQualitySelect').on("select2:select select2:unselect", function (evt) {
    //     var currentSelection = $(this).val();
    //     //UPDATE DISPLAY VALUES
    //     var combinedArray = [];
    //     var displayArray;
    //     for (var i=0; i < currentSelection.length; i++) {
    //         displayArray = fev.data.hwmQualities.filter(function (obj) {
    //             return obj.hwm_quality_id == currentSelection[i];
    //         });
    //         combinedArray.push(displayArray[0].hwm_quality);
    //     };
    //     var displayString = combinedArray.join();
    //     //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
    //     console.log("Selected hwm type(s) are: " + displayString);
    //     $('#hwmQualityDisplay').html(displayString);
    // });


    var populateCountiesArray =  function  () {
        for (var i=0; i<fev.data.states.length; i++) {
            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: "http://stn.wim.usgs.gov/STNServices/Sites/CountiesByState.json?StateAbbrev=" + fev.data.states[i].state_abbrev ,
                headers: {'Accept': '*/*'},
                currentState: fev.data.states[i].state_abbrev,
                success: function (data)  {
                    fev.data.counties[(this.currentState)] = data;
                },
                error: function (error) {
                    console.log("Error retrieving counties. The error is: " + error);
                }
            });
        }
        setTimeout(function (){
            console.log(fev.data.counties);
        }, 300);
    };


    //begin onChange functions for Event form (these tie the event type and event forms together)
    $('#evtTypeSelect').on("select2:select select2:unselect", function (selection) {
        var currentSelection = $(this).val();
        if (currentSelection !== null) {

            if (currentSelection.length > 0) {
                var selectedEvtTypeIds = [];
                for (var i = 0; i < currentSelection.length; i++) {
                    selectedEvtTypeIds.push(Number(currentSelection[i]));
                }
                var currentEvents = fev.data.events.filter(function (element) {
                    return selectedEvtTypeIds.indexOf(element.event_type_id) > -1;
                });
                $('#evtSelect').html("");
                //$("#evtSelect").select2("val", "");
                for (var x = 0; x < currentEvents.length; x++) {
                    $('#evtSelect').append("<option value='" + currentEvents[x].event_id + "'>" + currentEvents[x].event_name + "</option>");
                    //build string here with event type names??
                }
            } else {
                $('#evtSelect').html("");
                for (var i = 0; i < fev.data.events.length; i++) {
                    $('#evtSelect').append("<option value='" + fev.data.events[i].event_id + "'>" + fev.data.events[i].event_name + "</option>");
                }
            }
        }
        // //UPDATE DISPLAY VALUES
        // var combinedArray = [];
        // var displayArray;
        // for (var i=0; i < currentSelection.length; i++) {
        //     displayArray = fev.data.eventTypes.filter(function (obj) {
        //         return obj.event_type_id == currentSelection[i];
        //     });
        //     combinedArray.push(displayArray[0].type);
        // };
        // var displayString = combinedArray.join();
        // //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
        // console.log("Selected event type(s) are: " + displayString);
        // $('#eventTypeDisplay').html(displayString);

    });
    $('#evtSelect').on("change", function (selection){
        //check to see if there is any value selected
        var currentSelection = $(this).val();
        if (!(currentSelection.length > 0)) {
            var opts = document.getElementById('evtTypeSelect').options;
            for (var i=0; i < opts.length; i++) {
                opts[i].disabled = false;
            }
            return
        }
        // Functions
        // Returns a new array with only unique elements from the one given.
        var onlyUnique = function(array) {
            var distinctValues = [];
            // Build a new array with only distinct elements.
            for (var i = 0; i < array.length; i++)
            {
                // Check if the value is already in the new array; if so, skip it.
                if (distinctValues.indexOf(array[i]) != -1) {
                    continue;
                }
                // Add the element to the distinct-values array.
                distinctValues.push(array[i]);
            }
            // Return the array of distinct values.
            return distinctValues;
        };
        // Execution
        //set up an array with the strings from the currentSelection object strings converted to numbers
        var selectedEventIDNumbers = [];
        for (var i=0; i<currentSelection.length; i++){
            selectedEventIDNumbers.push(parseInt(currentSelection[i]));
        }
        // Build a list of the event-type IDs chosen.
        var selectedEventTypeIDs = [];
        for (var i = 0; i < fev.data.events.length; i++)
        {
            // If this is not one of the chosen events, skip it.
            if (selectedEventIDNumbers.indexOf(fev.data.events[i].event_id) == -1)
            {
                continue;
            }
            // Add the event-type ID to the list.
            selectedEventTypeIDs.push(fev.data.events[i].event_type_id);
        }
        // Reduce the array of selected event-type IDs to only unique elements.
        var distinctSelectedEventTypeIDs = onlyUnique(selectedEventTypeIDs);
        //Iterate through the DOM elements and disable those not having event IDs that are selected.
        var options = document.getElementById('evtTypeSelect').options;
        for (var i=0; i < options.length; i++) {
            // Disable the element first.
            options[i].disabled = true;
            // If the element is within the list of those selected, enable it.
            if (distinctSelectedEventTypeIDs.indexOf(parseInt(options[i].value)) != -1) {
                options[i].disabled = false;
            }
        }
        return;
    });
    //end onChange functions for Event form

    //begin onChange function for state form (updates county options based on state selection)
    $('#stateSelect').on("select2:select select2:unselect", function (evt) {
        var currentSelection = $(this).val();
        if ( (!currentSelection > 0) || currentSelection == null) {
            $('#countySelect').html("");
            $('#countySelect').append("<option value=null>Please select state(s) first </option>");
            return
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
        $('#countySelect').html("");
        for (var key in currentCounties) {
            var countyOption = currentCounties[key];
            $('#countySelect').append("<option value='" + countyOption + "'>" + countyOption + "</option>");
        };

        // //UPDATE DISPLAY VALUES
        // var combinedArray = [];
        // var displayArray;
        // for (var i=0; i < currentSelection.length; i++) {
        //     displayArray = fev.data.states.filter(function (obj) {
        //         return obj.state_abbrev == currentSelection[i];
        //     });
        //     combinedArray.push(displayArray[0].state_name);
        // };
        // var displayString = combinedArray.join();
        // //var displayString = getDisplayString('eventType', fev.data.eventTypes, currentSelection);
        // console.log("Selected states(s) are: " + displayString);
        // $('#stateDisplay').html(displayString);
    });
    //end onChange function for state form

    function getDisplayString (form, lookupArr, valArr) {
        ///loop thru valArr to get each individual value, use it as input for filter function.
        // filter will return an array each time it runs, need to combine those
        //then grab out the name values and convert to string
        var combinedArray = [];
        var displayArray;
        for (var i=0; i < valArr.length; i++) {
            displayArray = lookupArr.filter(function (obj) {
                return obj.event_type_id == valArr[i];
            });
            //gets array with display name on each iteration
            //'type' is the display property for event type. need to generalize
            switch (form) {
                case "eventType":
                    combinedArray.push(displayArray[0].type);
                    break;
                case "state":
                    combinedArray.push(displayArray[0].state_name);
            }

        };
        return combinedArray.join();
    }

});
