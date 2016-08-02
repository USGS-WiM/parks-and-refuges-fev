function addCommas(e){e+="";for(var t=e.split("."),s=t[0],o=t.length>1?"."+t[1]:"",a=/(\d+)(\d{3})/;a.test(s);)s=s.replace(a,"$1,$2");return s+o}var allLayers=[{groupHeading:"some layers",showGroupHeading:!0,includeInLayerList:!0,layers:{}},{groupHeading:"some other layers",showGroupHeading:!0,includeInLayerList:!0,layers:{"Pt Feature Layer":{url:"http://wim.usgs.gov/arcgis/rest/services/BadRiverDataPortal/NWIS_Sites/MapServer/0",options:{id:"ptFeatureLayer",visible:!0},wimOptions:{type:"layer",layerType:"agisFeature",includeInLayerList:!0}},"FIM Sites":{url:"http://fimlb-1071089098.us-east-1.elb.amazonaws.com/arcgis/rest/services/FIMMapper/sites/MapServer/0",options:{opacity:.75,visible:!0},wimOptions:{type:"layer",layerType:"agisFeature",includeInLayerList:!0}}}},{groupHeading:"exclusive group",showGroupHeading:!0,includeInLayerList:!0,layers:{"Cat 2":{url:"http://olga.er.usgs.gov/stpgis/rest/services/Vulnerability/NACCH_change_probabilities/MapServer",options:{id:"cat2",layers:[13,14,15],opacity:1},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0,exclusiveGroupName:"Coastal Erosion Hazard",visible:!1}},"Cat 1":{url:"http://olga.er.usgs.gov/stpgis/rest/services/Vulnerability/NACCH_change_probabilities/MapServer",options:{id:"cat1",layers:[5,6,7],opacity:1},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0,exclusiveGroupName:"Coastal Erosion Hazard",visible:!0}}}},{groupHeading:"other map servers",showGroupHeading:!0,includeInLayerList:!0,layers:{Wetlands:{url:"http://107.20.228.18/ArcGIS/rest/services/Wetlands/MapServer",options:{opacity:.75,visible:!0},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0,zoomScale:144448}},"NAWQA networks":{url:"http://wimsharedlb-418672833.us-east-1.elb.amazonaws.com/arcgis/rest/services/NAWQA/tablesTest/MapServer",options:{layers:[1],visible:!0,opacity:.6},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0}}}}],fev=fev||{data:{events:[],eventTypes:[],states:[],counties:[],sensorTypes:[],sensorStatusTypes:[],collectionConditions:[],deploymentTypes:[],hwmTypes:[],hwmQualities:[]},globals:{csvQueryURL:"",jsonQueryURL:"",xmlQueryURL:"",jsonSensorsURLRoot:"",xmlSensorsURLRoot:"",csvSensorsURLRoot:"",sensorsQueryString:"",jsonHWMsURLRoot:"",xmlHWMsURLRoot:"",csvHWMsURLRoot:"",hwmsQueryString:"",xmlPeaksURLRoot:"",jsonPeaksURLRoot:"",csvPeaksURLRoot:"",peaksQueryString:""}};$(document).ready(function(){"use strict";function e(){$("#geosearchModal").modal("show")}function t(){$("#aboutModal").modal("show")}function s(){$("#filtersModal").modal("show")}function o(e){r&&n.removeLayer(r),r=L.esri.basemapLayer(e),n.addLayer(r),a&&n.removeLayer(a),("ShadedRelief"===e||"Oceans"===e||"Gray"===e||"DarkGray"===e||"Imagery"===e||"Terrain"===e)&&(a=L.esri.basemapLayer(e+"Labels"),n.addLayer(a))}var a,n=L.map("mapDiv").setView([39.833333,-98.583333],4),r=L.esri.basemapLayer("Gray").addTo(n);$("#mapDiv").height($("body").height()),n.invalidateSize(),$(".dataTypeRadio").each(function(){$(this).on("click",function(){var e=$(this).attr("id"),t=$("#"+e+"Form");t.show(),$(".hiddenForm").not(t).hide()})}),$(".check").on("click",function(){$(this).find("span").toggle()}),$("#geosearchNav").click(function(){e()}),$("#aboutNav").click(function(){t()}),$("#btnFilters").click(function(){s()});$(".basemapBtn").on("click",function(){var e=this.id.replace("btn","");switch(e){case"Streets":e="Streets";break;case"Satellite":e="Imagery";break;case"Topo":e="Topographic";break;case"Terrain":e="ShadedRelief";break;case"Gray":e="Gray";break;case"NatGeo":e="NationalGeographic"}o(e)}),$("#legendButtonNavBar, #legendButtonSidebar").on("click",function(){$("#legend").toggle()}),$("#legendClose").on("click",function(){$("#legend").hide()})}),$(document).ready(function(){$("#evtTypeSelect").select2({placeholder:"All Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/eventtypes.json",headers:{Accept:"*/*"},success:function(e){e.sort(function(e,t){var s=e.TYPE,o=t.TYPE;return o>s?-1:s>o?1:0});for(var t=0;t<e.length;t++)$("#evtTypeSelect").append("<option value='"+e[t].event_type_id+"'>"+e[t].type+"</option>"),fev.data.eventTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#evtSelect").select2({placeholder:"All Events"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/events.json",headers:{Accept:"*/*"},success:function(e){e.sort(function(e,t){var s=e.event_name,o=t.event_name;return o>s?-1:s>o?1:0});for(var t=0;t<e.length;t++)$("#evtSelect").append("<option value='"+e[t].event_id+"'>"+e[t].event_name+"</option>"),e[t].id=e[t].event_id,fev.data.events.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#stateSelect").select2({placeholder:"All Events"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/Sites/States.json",headers:{Accept:"*/*"},success:function(t){t.sort(function(e,t){var s=e.state_name,o=t.state_name;return o>s?-1:s>o?1:0});for(var s=0;s<t.length;s++)$("#stateSelect").append("<option value='"+t[s].state_abbrev+"'>"+t[s].state_name+"</option>"),t[s].id=t[s],fev.data.states.push(t[s]);e()},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#countySelect").select2({placeholder:"All Counties"}),$("#sensorTypeSelect").select2({placeholder:"All Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/sensortypes.json",headers:{Accept:"*/*"},success:function(e){e.sort(function(e,t){var s=e.TYPE,o=t.TYPE;return o>s?-1:s>o?1:0});for(var t=0;t<e.length;t++)$("#sensorTypeSelect").append("<option value='"+e[t].sensor_type_id+"'>"+e[t].sensor+"</option>"),fev.data.sensorTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#sensorStatusSelect").select2({placeholder:"All Statuses"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/statustypes.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#sensorStatusSelect").append("<option value='"+e[t].status_type_id+"'>"+e[t].status+"</option>"),fev.data.sensorStatusTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#collectionConditionSelect").select2({placeholder:"All Conditions"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/InstrCollectConditions.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#collectionConditionSelect").append("<option value='"+e[t].ID+"'>"+e[t].condition+"</option>"),fev.data.collectionConditions.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#deployTypeSelect").select2({placeholder:"All Deploy Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/deploymenttypes.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#deployTypeSelect").append("<option value='"+e[t].deployment_type_id+"'>"+e[t].method+"</option>"),fev.data.deploymentTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#hwmTypeSelect").select2({placeholder:"All Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/hwmtypes.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#hwmTypeSelect").append("<option value='"+e[t].hwm_type_id+"'>"+e[t].hwm_type+"</option>"),e[t].id=e[t].hwm_type_id,fev.data.hwmTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#hwmQualitySelect").select2({placeholder:"All Qualities"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/hwmqualities.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#hwmQualitySelect").append("<option value='"+e[t].hwm_quality_id+"'>"+e[t].hwm_quality+"</option>"),e[t].id=e[t].hwm_quality_id,fev.data.hwmQualities.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}});var e=function(){for(var e=0;e<fev.data.states.length;e++)$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/Sites/CountiesByState.json?StateAbbrev="+fev.data.states[e].state_abbrev,headers:{Accept:"*/*"},currentState:fev.data.states[e].state_abbrev,success:function(e){fev.data.counties[this.currentState]=e},error:function(e){console.log("Error retrieving counties. The error is: "+e)}});setTimeout(function(){console.log(fev.data.counties)},300)};$("#evtTypeSelect").on("select2:select select2:unselect",function(e){var t=$(this).val();if(null!==t)if(t.length>0){for(var s=[],o=0;o<t.length;o++)s.push(Number(t[o]));var a=fev.data.events.filter(function(e){return s.indexOf(e.event_type_id)>-1});$("#evtSelect").html("");for(var n=0;n<a.length;n++)$("#evtSelect").append("<option value='"+a[n].event_id+"'>"+a[n].event_name+"</option>")}else{$("#evtSelect").html("");for(var o=0;o<fev.data.events.length;o++)$("#evtSelect").append("<option value='"+fev.data.events[o].event_id+"'>"+fev.data.events[o].event_name+"</option>")}$("#eventTypeDisplay").html(t)}),$("#evtSelect").on("change",function(e){var t=$(this).val();if(t.length>0){for(var s=function(e){for(var t=[],s=0;s<e.length;s++)-1==t.indexOf(e[s])&&t.push(e[s]);return t},o=[],a=0;a<t.length;a++)o.push(parseInt(t[a]));for(var n=[],a=0;a<fev.data.events.length;a++)-1!=o.indexOf(fev.data.events[a].event_id)&&n.push(fev.data.events[a].event_type_id);for(var r=s(n),i=document.getElementById("evtTypeSelect").options,a=0;a<i.length;a++)i[a].disabled=!0,-1!=r.indexOf(parseInt(i[a].value))&&(i[a].disabled=!1)}else for(var l=document.getElementById("evtTypeSelect").options,a=0;a<l.length;a++)l[a].disabled=!1}),$("#stateSelect").on("select2:select select2:unselect",function(e){var t=$(this).val();if(!t>0||null==t)return $("#countySelect").html(""),void $("#countySelect").append("<option value=null>Please select state(s) first </option>");var s=[];for(var o in fev.data.counties)for(var a=0;a<fev.data.counties[o].length;a++){var n=fev.data.counties[o][a].county_name;t.indexOf(o)>-1&&(s=s.concat(n))}$("#countySelect").html("");for(var o in s){var r=s[o];$("#countySelect").append("<option value='"+r+"'>"+r+"</option>")}$("#stateDisplay").html(t)})});