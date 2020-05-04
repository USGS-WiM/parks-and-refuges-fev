// setting global variables for the regional summary
var regionPoly = [];
var selectedRegion = "";
var selectedEvents = [];
var regionPoly = [];
var regionBoundaries;
var flattenedRegionalPoly;
var regionLayerGroup = L.layerGroup();
var where = "";

$(document).ready(function () {

    $('#regionalReportNav').click(function () {


        // checking for region entry when region input is changed
        $('#regionSelect_regionalModal').change(function () {

            // if it has a value, we query to get the region geometry
            if (($('#regionSelect_regionalModal').val()) !== null) {

            } else {

            }
        });



    });



    $('#btnSubmitSelections').click(function () {

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
        }).addTo(map); // may want to add this to preview map in future
        regionLayerGroup.addLayer(regionBoundaries);

        selectedEvents = $('#evtSelect_regionalModal').val();

        // looping through each event select and getting sensor data
        for (var i = 0; i < selectedEvents.length; i++) {

            // PEAKS
            var peaksURL = "https://stn.wim.usgs.gov/STNServices/PeakSummaries/FilteredPeaks.json?Event=" + selectedEvents[i];
            getData(function (output) {
                console.log(output);
            });

            // fucntion 
            function getData(handleData) {
                var data;
                $.ajax({
                    dataType: "json",
                    url: peaksURL,
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

    });

});




// will have to somehow use turf to identify park polys within the selected region poly
