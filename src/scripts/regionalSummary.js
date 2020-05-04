// setting global variables for the regional summary
/* var regions = []; */
var selectedRegion = "";
var selectedEvents = [];
var regionPoly;
//var regionBoundaries;
/* var regionBoundaries = L.layerGroup(); */

$(document).ready(function () {
    $('#regionalReportText').click(function () {
        // getting the regions

        setTimeout(() => {
            /* regionBoundaries = L.esri.featureLayer({
                useCors: false,
                url: 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer/0',
                onEachFeature: function (feature, latlng) {
                    regions.push(feature.properties.REG_NAME);
                }
            });
            console.log(regionBoundaries); */
        }, 1000);
        
    });

    


    $('#btnSubmitSelections').click(function () {

        // storing the selected events
        selectedEvents = $('#evtSelect_regionalModal').val();

        // getting the regions
        parks = L.esri.featureLayer({
            useCors: false,
            url: 'https://services.arcgis.com/4OV0eRKiLAYkbH2J/arcgis/rest/services/DOI_Unified_Regions/FeatureServer',
            simplifyFactor: 0.5,
            precision: 4,
            where: "REG_NUM=" + selectedRegion,
            onEachFeature: function (feature, latlng) {
                polys = feature.geometry;
                // flattening the geometry for use in turf
                regionPoly = turf.flatten(polys);
                regionPoly.push
            }
        });
        for (var i = 0; i < selectedEvents.length; i++) {
            filterMapData(selectedEvents[i], false);
        }
    });
});




// will have to somehow use turf to identify park polys within the selected region poly
