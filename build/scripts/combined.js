function displaySensorGeoJSON(type,name,url,markerIcon){var currentSubGroup=eval(type);currentSubGroup.clearLayers();var currentMarker=L.geoJson(!1,{pointToLayer:function(e,t){markerCoords.push(t);var a=L.marker(t,{icon:markerIcon});return a},onEachFeature:function(e,t){oms.addMarker(t);var a=$("#largeEventNameDisplay").html(),r='<table class="table table-hover table-striped table-condensed"><caption class="popup-title">'+name+" for "+a+'</caption><tr><td><strong>STN Site Name: </strong></td><td><span id="siteName">'+e.properties.site_name+'</span></td></tr><tr><td><strong>Status: </strong></td><td><span id="status">'+e.properties.status+'</span></td></tr><tr><td><strong>City: </strong></td><td><span id="city">'+(""==e.properties.city||null==e.properties.city||void 0==e.properties.city?"<i>No city recorded</i>":e.properties.city)+'</span></td></tr><tr><td><strong>County: </strong></td><td><span id="county">'+e.properties.county+'</span></td></tr><tr><td><strong>State: </strong></td><td><span id="state">'+e.properties.state+'</span></td></tr><tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">'+e.properties.latitude_dd.toFixed(4)+", "+e.properties.longitude_dd.toFixed(4)+'</span></td></tr><tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href='+sensorPageURLRoot+e.properties.site_id+"&Sensor="+e.properties.instrument_id+">Sensor data page</a></b></span></td></tr></table>";if("rdg"==type){var s;$.getJSON(stnServicesURL+"/Sites/"+e.properties.site_id+".json",function(e){if(""!==e.usgs_sid)if(s=e.usgs_sid,1==fev.vars.currentEventActive&&""==fev.vars.currentEventEndDate_str&&(fev.vars.currentEventEndDate_str=moment().format("YYYY-MM-DD"),console.log("Selected event is active, so end date is today, "+fev.vars.currentEventEndDate_str)),""==fev.vars.currentEventStartDate_str&&""==fev.vars.currentEventEndDate_str){var a='<div id="rdgChartDiv"><i>Missing valid event date range. Unable to display RDG Real-time graph.</i></div>';t.bindPopup(r+a)}else{var a='<div id="rdgChartDiv"><label>Water level elevation (ft)</label><img width="350" src="http://waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&site_no='+s+"&parm_cd=62620&begin_date="+fev.vars.currentEventStartDate_str+"&end_date="+fev.vars.currentEventEndDate_str+'" alt="rapid deploy gage graph"></div>';t.bindPopup(r+a,{minWidth:350})}else{var a='<div id="rdgChartDiv"><i>Missing USGS Site ID. Unable to display RDG Real-time graph.</i></div>';t.bindPopup(r+a)}})}else t.bindPopup(r)}});$.getJSON(url,function(e){return layerCount++,0==e.length?void console.log("0 "+markerIcon.options.className+" GeoJSON features found"):void(e.features.length>0&&(console.log(e.features.length+" "+markerIcon.options.className+" GeoJSON features found"),currentMarker.addData(e),currentMarker.eachLayer(function(e){e.addTo(currentSubGroup)}),currentSubGroup.addTo(map),checkLayerCount(layerCount)))})}function displayHWMGeoJSON(e,t,a,r){hwm.clearLayers();var s=L.geoJson(!1,{pointToLayer:function(e,t){markerCoords.push(t);var a=L.marker(t,{icon:r});return a},onEachFeature:function(e,a){if(void 0==e.properties.longitude_dd||void 0==e.properties.latitude_dd)return void console.log("Lat/lng undefined for HWM at site no: "+e.properties.site_no);(null==a.feature.geometry.coordinates[0]||null==a.feature.geometry.coordinates[1])&&console.log("null coordinates returned for "+e.properties.site_no),oms.addMarker(a);var r=$("#largeEventNameDisplay").html(),s='<table class="table table-hover table-striped table-condensed"><caption class="popup-title">'+t+" for "+r+'</caption><tr><td><strong>STN Site No.: </strong></td><td><span id="hwmSiteNo">'+e.properties.site_no+'</span></td></tr><tr><td><strong>Elevation(ft): </strong></td><td><span id="hwmElev">'+e.properties.elev_ft+'</span></td></tr><tr><td><strong>Datum: </strong></td><td><span id="hwmWaterbody">'+e.properties.verticalDatumName+'</span></td></tr><tr><td><strong>Height Above Ground: </strong></td><td><span id="hwmHtAboveGnd">'+(void 0!==e.properties.height_above_gnd?e.properties.height_above_gnd:"<i>No value recorded</i>")+'</span></td></tr><tr><td><strong>Approval status: </strong></td><td><span id="hwmStatus">'+(void 0==e.properties.approval_id||0==e.properties.approval_id?'Provisional  <button type="button" class="btn btn-sm data-disclaim"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></button>':"Approved")+'</span></td></tr><tr><td><strong>Type: </strong></td><td><span id="hwmType"></span>'+e.properties.hwmTypeName+'</td></tr><tr><td><strong>Marker: </strong></td><td><span id="hwmMarker">'+e.properties.markerName+'</span></td></tr><tr><td><strong>Quality: </strong></td><td><span id="hwmQuality">'+e.properties.hwmQualityName+'</span></td></tr><tr><td><strong>Waterbody: </strong></td><td><span id="hwmWaterbody">'+e.properties.waterbody+'</span></td></tr><tr><td><strong>County: </strong></td><td><span id="hwmCounty">'+e.properties.countyName+'</span></td></tr><tr><td><strong>State: </strong></td><td><span id="hwmState">'+e.properties.stateName+'</span></td></tr><tr><td><strong>Latitude, Longitude (DD): </strong></td><td><span class="latLng">'+e.properties.latitude_dd.toFixed(4)+", "+e.properties.longitude_dd.toFixed(4)+'</span></td></tr><tr><td><strong>Description: </strong></td><td><span id="hwmDescription">'+e.properties.hwm_locationdescription+'</span></td></tr><tr><td><strong>Full data link: </strong></td><td><span id="sensorDataLink"><b><a target="blank" href='+hwmPageURLRoot+e.properties.site_id+"&HWM="+e.properties.hwm_id+">HWM data page</a></b></span></td></tr></table>";a.bindPopup(s)}});$.getJSON(a,function(e){return layerCount++,0==e.length?void console.log("0 "+r.options.className+" GeoJSON features found"):void(e.features.length>0&&(console.log(e.features.length+" "+r.options.className+" GeoJSON features found"),s.addData(e),s.eachLayer(function(e){e.addTo(hwm)}),hwm.addTo(map),checkLayerCount(layerCount)))})}function displayPeaksGeoJSON(e,t,a,r){peaks.clearLayers();var s=L.geoJson(!1,{pointToLayer:function(e,t){markerCoords.push(t);var a=L.marker(t,{icon:r});return a},onEachFeature:function(e,a){oms.addMarker(a);var r=$("#largeEventNameDisplay").html(),s='<table class="table table-condensed table-striped table-hover"><caption class="popup-title">'+t+" for "+r+"</caption><tr><th>Peak Stage (ft)</th><th>Datum</th><th>Peak Date & Time (UTC)</th></tr><tr><td>"+e.properties.peak_stage+"</td><td>"+e.properties.vdatum+"</td><td>"+e.properties.peak_date+"</td></tr></table>";a.bindPopup(s)}});$.getJSON(a,function(e){return layerCount++,0==e.length?void console.log("0 "+r.options.className+" GeoJSON features found"):void(e.features.length>0&&(console.log(e.features.length+" "+r.options.className+" GeoJSON features found"),s.addData(e),s.eachLayer(function(e){e.addTo(peaks)}),peaks.addTo(map),checkLayerCount(layerCount)))})}function getLayerName(e){switch(e){case"baro":return"Barometric Pressure Sensor";case"stormTide":return"Storm Tide Sensor";case"met":return"Meteorological Sensor";case"waveHeight":return"Wave Height Sensor";case"rdg":return"Rapid Deployment Gage";case"hwm":return"High Water Mark";case"peaks":return"Peak Summary"}}function populateEventDates(e){for(var t=0;t<fev.data.events.length;t++)fev.data.events[t].event_id==e&&(1==fev.data.events[t].event_status_id?fev.vars.currentEventActive=!0:fev.vars.currentEventActive=!1,fev.vars.currentEventStartDate_str=void 0==fev.data.events[t].event_start_date?"":fev.data.events[t].event_start_date.substr(0,10),fev.vars.currentEventEndDate_str=void 0==fev.data.events[t].event_end_date?"":fev.data.events[t].event_end_date.substr(0,10),console.log("Selected event is "+fev.data.events[t].event_name+". START date is "+fev.vars.currentEventStartDate_str+" and END date is "+fev.vars.currentEventEndDate_str+". Event is active = "+fev.vars.currentEventActive))}function checkLayerCount(e){e==fev.layerList.length&&markerCoords.length>0&&map.fitBounds(markerCoords)}function filterMapData(e,t){layerCount=0,markerCoords=[];var a="";if(t&&(a=e),null!==$("#evtSelect_welcomeModal").val()){var r=$("#evtSelect_welcomeModal").val();a=r.toString(),$("#eventNameDisplay").html($("#evtSelect_welcomeModal").select2("data").map(function(e){return e.text}).join(", ")),$("#largeEventNameDisplay").html($("#evtSelect_welcomeModal").select2("data").map(function(e){return e.text}).join(", "))}var s="";if(null!==$("#evtTypeSelect").val()){var n=$("#evtTypeSelect").val();s=n.toString(),$("#eventTypeDisplay").html($("#evtTypeSelect").select2("data").map(function(e){return e.text}).join(", "))}if(null!==$("#evtSelect_filterModal").val()){var r=$("#evtSelect_filterModal").val();a=r.toString(),$("#eventNameDisplay").html($("#evtSelect_filterModal").select2("data").map(function(e){return e.text}).join(", ")),$("#largeEventNameDisplay").html($("#evtSelect_filterModal").select2("data").map(function(e){return e.text}).join(", ")),populateEventDates(a)}var o=[];$("#active")[0].checked&&!$("#complete")[0].checked&&(o.push(1),$("#eventStatusDisplay").html("Active")),$("#complete")[0].checked&&!$("#active")[0].checked&&(o.push(2),$("#eventStatusDisplay").html("Complete")),$("#active")[0].checked&&$("#complete")[0].checked&&(o.push(0),$("#eventStatusDisplay").html("Active, Complete")),$("#active")[0].checked||$("#complete")[0].checked||(o.push(0),$("#eventStatusDisplay").html(""));var i=o.toString(),l="";if(null!==$("#stateSelect").val()){var c=$("#stateSelect").val();l=c.toString(),$("#stateDisplay").html(l)}var d="";if(null!==$("#countySelect").val()){var u=$("#countySelect").val();d=u.toString(),$("#countyDisplay").html(d)}var p="";if(null!==$("#sensorTypeSelect").val()){var v=$("#sensorTypeSelect").val();p=v.toString(),$("#sensorTypeDisplay").html($("#sensorTypeSelect").select2("data")[0].text)}var m="";if(null!==$("#sensorStatusSelect").val()){var h=$("#sensorStatusSelect").val();m=h.toString(),$("#sensorStatusDisplay").html($("#sensorStatusSelect").select2("data")[0].text)}var g="";if(null!==$("#collectionConditionSelect").val()){var y=$("#collectionConditionSelect").val();g=y.toString(),$("#collectConditionDisplay").html($("#collectionConditionSelect").select2("data")[0].text)}var S="";if(null!==$("#deployTypeSelect").val()){var f=$("#deployTypeSelect").val();S=f.toString(),$("#deployTypeDisplay").html($("#deployTypeSelect").select2("data")[0].text)}fev.queryStrings.sensorsQueryString="?Event="+a+"&EventType="+s+"&EventStatus="+i+"&States="+l+"&County="+d+"&SensorType="+p+"&CurrentStatus="+m+"&CollectionCondition="+g+"&DeploymentType="+S,fev.urls.csvSensorsQueryURL=fev.urls.csvSensorsURLRoot+fev.queryStrings.sensorsQueryString,fev.urls.jsonSensorsQueryURL=fev.urls.jsonSensorsURLRoot+fev.queryStrings.sensorsQueryString,fev.urls.xmlSensorsQueryURL=fev.urls.xmlSensorsURLRoot+fev.queryStrings.sensorsQueryString,$("#sensorDownloadButtonCSV").attr("href",fev.urls.csvSensorsQueryURL),$("#sensorDownloadButtonJSON").attr("href",fev.urls.jsonSensorsQueryURL),$("#sensorDownloadButtonXML").attr("href",fev.urls.xmlSensorsQueryURL);var w="";if(null!==$("#hwmTypeSelect").val()){var b=$("#hwmTypeSelect").val();w=b.toString(),$("#hwmTypeDisplay").html($("#hwmTypeSelect").select2("data")[0].text)}var L="";if(null!==$("#hwmQualitySelect").val()){var T=$("#hwmQualitySelect").val();L=T.toString(),$("#hwmQualityDisplay").html($("#hwmQualitySelect").select2("data")[0].text)}var k=[];$("#coastal")[0].checked&&!$("#riverine")[0].checked&&(k.push("Coastal"),$("#hwmEnvDisplay").html("Coastal")),$("#riverine")[0].checked&&!$("#coastal")[0].checked&&(k.push("Riverine"),$("#hwmEnvDisplay").html("Riverine"));var D=k.toString(),_=[];$("#surveyCompleteYes")[0].checked&&!$("#surveyCompleteNo")[0].checked&&(_.push("true"),$("#hwmSurveyCompDisplay").html("True")),$("#surveyCompleteNo")[0].checked&&!$("#surveyCompleteYes")[0].checked&&(_.push("false"),$("#hwmSurveyCompDisplay").html("False"));var N=_.toString(),E=[];$("#stillWaterYes")[0].checked&&!$("#stillWaterNo")[0].checked&&(E.push("true"),$("#hwmStillWaterDisplay").html("True")),$("#stillWaterNo")[0].checked&&!$("#stillWaterYes")[0].checked&&(E.push("false"),$("#hwmStillWaterDisplay").html("False"));var R=E.toString();fev.queryStrings.hwmsQueryString="?Event="+a+"&EventType="+s+"&EventStatus="+i+"&States="+l+"&County="+d+"&HWMType="+w+"&HWMQuality="+L+"&HWMEnvironment="+D+"&SurveyComplete="+N+"&StillWater="+R,fev.urls.csvHWMsQueryURL=fev.urls.csvHWMsURLRoot+fev.queryStrings.hwmsQueryString,fev.urls.jsonHWMsQueryURL=fev.urls.jsonHWMsURLRoot+fev.queryStrings.hwmsQueryString,fev.urls.xmlHWMsQueryURL=fev.urls.xmlHWMsURLRoot+fev.queryStrings.hwmsQueryString,$("#hwmDownloadButtonCSV").attr("href",fev.urls.csvHWMsQueryURL),$("#hwmDownloadButtonJSON").attr("href",fev.urls.jsonHWMsQueryURL),$("#hwmDownloadButtonXML").attr("href",fev.urls.xmlHWMsQueryURL);var M;""!==$("#peakStartDate").value&&(M=$("#peakStartDate")[0].value);var C;""!==$("#peakEndDate").value&&(C=$("#peakEndDate")[0].value),fev.queryStrings.peaksQueryString="?Event="+a+"&EventType="+s+"&EventStatus="+i+"&States="+l+"&County="+d+"&StartDate="+M+"&EndDate="+C,fev.urls.csvPeaksQueryURL=fev.urls.csvPeaksURLRoot+fev.queryStrings.peaksQueryString,fev.urls.jsonPeaksQueryURL=fev.urls.jsonPeaksURLRoot+fev.queryStrings.peaksQueryString,fev.urls.xmlPeaksQueryURL=fev.urls.xmlPeaksURLRoot+fev.queryStrings.peaksQueryString,$("#peaksDownloadButtonCSV").attr("href",fev.urls.csvPeaksQueryURL),$("#peaksDownloadButtonJSON").attr("href",fev.urls.jsonPeaksQueryURL),$("#peaksDownloadButtonXML").attr("href",fev.urls.xmlPeaksQueryURL),$.each(fev.layerList,function(e,t){"sensor"==t.Type&&displaySensorGeoJSON(t.ID,t.Name,fev.urls[t.ID+"GeoJSONViewURL"]+fev.queryStrings.sensorsQueryString,window[t.ID+"MarkerIcon"]),"hwm"==t.ID&&displayHWMGeoJSON(t.ID,t.Name,fev.urls.hwmFilteredGeoJSONViewURL+fev.queryStrings.hwmsQueryString,hwmMarkerIcon),"peak"==t.ID&&displayPeaksGeoJSON(t.ID,t.Name,fev.urls.peaksFilteredGeoJSONViewURL+fev.queryStrings.peaksQueryString,peaksMarkerIcon)})}function queryNWISrtGages(e){var t={},a="00060,00065",r="OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS",s="active",n="";1==fev.vars.currentEventActive&&""==fev.vars.currentEventEndDate_str&&(fev.vars.currentEventEndDate_str=moment().format("YYYY-MM-DD")),n=""==fev.vars.currentEventStartDate_str||""==fev.vars.currentEventEndDate_str?"":"&startDT="+fev.vars.currentEventStartDate_str+"&endDT="+fev.vars.currentEventEndDate_str;var o="http://nwis.waterservices.usgs.gov/nwis/iv/?format=json&bBox="+e+"&parameterCd="+a+"&siteType="+r+"&siteStatus="+s+n;$.getJSON(o,function(e){console.log(e.value.timeSeries.length+" usgs gages found."),$.each(e.value.timeSeries,function(e,a){var r=a.name.split(":")[1];t[r]?a.values[0].value[0]&&(t[r].data.parameters[a.variable.variableName]={},t[r].data.parameters[a.variable.variableName].Time=a.values[0].value[0].dateTime,t[r].data.parameters[a.variable.variableName].Value=a.values[0].value[0].value):a.values[0].value[0]&&(t[r]=L.marker([a.sourceInfo.geoLocation.geogLocation.latitude,a.sourceInfo.geoLocation.geogLocation.longitude],{icon:nwisMarkerIcon}),t[r].data={siteName:a.sourceInfo.siteName,siteCode:a.sourceInfo.siteCode},t[r].data.parameters={},t[r].data.parameters[a.variable.variableName]={},t[r].data.parameters[a.variable.variableName].Time=a.values[0].value[0].dateTime,t[r].data.parameters[a.variable.variableName].Value=a.values[0].value[0].value,USGSrtGages.addLayer(t[r]))})})}function queryNWISgraph(e){var t="";$.each(e.layer.data.parameters,function(e,a){t+="<tr><td>"+e+"</td><td>"+a.Value+"</td><td>"+moment(a.Time).format("dddd, MMMM Do YYYY, h:mm:ss a")+"</td></tr>"});var a="";1==fev.vars.currentEventActive&&""==fev.vars.currentEventEndDate_str&&(fev.vars.currentEventEndDate_str=moment().format("YYYY-MM-DD")),a=""==fev.vars.currentEventStartDate_str||""==fev.vars.currentEventEndDate_str?"&period=P7D":"&startDT="+fev.vars.currentEventStartDate_str+"&endDT="+fev.vars.currentEventEndDate_str,e.layer.bindPopup("<b>"+e.layer.data.siteName+'</br>Full data link: <a target="_blank" href="http://nwis.waterdata.usgs.gov/nwis/uv?site_no='+e.layer.data.siteCode[0].value+'">'+e.layer.data.siteCode[0].value+'</a></b><br><table class="table table-condensed"><thead><tr><th>Parameter</th><th>Value</th><th>Timestamp</th></tr></thead><tbody>'+t+'</tbody></table><div id="graphContainer" style="width:100%; height:200px;display:none;"></div>').openPopup(),$.getJSON("http://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites="+e.layer.data.siteCode[0].value+"&parameterCd=00065"+a,function(e){e.data[0].time_series_data.length<=0?console.log("No NWIS graph data available for this time period"):($("#graphContainer").show(),Highcharts.setOptions({global:{useUTC:!1}}),$("#graphContainer").highcharts({chart:{type:"line"},title:{text:null},credits:{enabled:!1},xAxis:{type:"datetime",labels:{formatter:function(){return Highcharts.dateFormat("%d %b %y",this.value)},align:"center"}},yAxis:{title:{text:"Gage Height, feet"}},series:[{showInLegend:!1,data:e.data[0].time_series_data,tooltip:{pointFormat:"Gage height: {point.y} feet"}}]}))})}function addCommas(e){e+="";for(var t=e.split("."),a=t[0],r=t.length>1?"."+t[1]:"",s=/(\d+)(\d{3})/;s.test(a);)a=a.replace(s,"$1,$2");return a+r}var layerCount=0,allLayers=[{groupHeading:"some layers",showGroupHeading:!0,includeInLayerList:!0,layers:{}},{groupHeading:"some other layers",showGroupHeading:!0,includeInLayerList:!0,layers:{"Pt Feature Layer":{url:"http://wim.usgs.gov/arcgis/rest/services/BadRiverDataPortal/NWIS_Sites/MapServer/0",options:{id:"ptFeatureLayer",visible:!0},wimOptions:{type:"layer",layerType:"agisFeature",includeInLayerList:!0}},"FIM Sites":{url:"http://fimlb-1071089098.us-east-1.elb.amazonaws.com/arcgis/rest/services/FIMMapper/sites/MapServer/0",options:{opacity:.75,visible:!0},wimOptions:{type:"layer",layerType:"agisFeature",includeInLayerList:!0}}}},{groupHeading:"exclusive group",showGroupHeading:!0,includeInLayerList:!0,layers:{"Cat 2":{url:"http://olga.er.usgs.gov/stpgis/rest/services/Vulnerability/NACCH_change_probabilities/MapServer",options:{id:"cat2",layers:[13,14,15],opacity:1},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0,exclusiveGroupName:"Coastal Erosion Hazard",visible:!1}},"Cat 1":{url:"http://olga.er.usgs.gov/stpgis/rest/services/Vulnerability/NACCH_change_probabilities/MapServer",options:{id:"cat1",layers:[5,6,7],opacity:1},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0,exclusiveGroupName:"Coastal Erosion Hazard",visible:!0}}}},{groupHeading:"other map servers",showGroupHeading:!0,includeInLayerList:!0,layers:{Wetlands:{url:"http://107.20.228.18/ArcGIS/rest/services/Wetlands/MapServer",options:{opacity:.75,visible:!0},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0,zoomScale:144448}},"NAWQA networks":{url:"http://wimsharedlb-418672833.us-east-1.elb.amazonaws.com/arcgis/rest/services/NAWQA/tablesTest/MapServer",options:{layers:[1],visible:!0,opacity:.6},wimOptions:{type:"layer",layerType:"agisDynamic",includeInLayerList:!0}}}}],stnServicesURL="http://stn.wim.usgs.gov/STNServices",stnServicesTestURL="http://stntest.wim.usgs.gov/STNServices2",sensorPageURLRoot="http://stn.wim.usgs.gov/STNPublicInfo/#/SensorPage?Site=",hwmPageURLRoot="http://stn.wim.usgs.gov/STNPublicInfo/#/HWMPage?Site=",fev=fev||{data:{events:[],eventTypes:[],states:[],counties:[],sensorTypes:[],sensorStatusTypes:[],collectionConditions:[],deploymentTypes:[],hwmTypes:[],hwmQualities:[]},urls:{jsonSensorsURLRoot:stnServicesURL+"/Instruments.json",xmlSensorsURLRoot:stnServicesURL+"/Instruments.xml",csvSensorsURLRoot:stnServicesURL+"/Instruments.csv",jsonHWMsURLRoot:stnServicesURL+"/HWMs/FilteredHWMs.json",xmlHWMsURLRoot:stnServicesURL+"/HWMs/FilteredHWMs.xml",csvHWMsURLRoot:stnServicesURL+"/HWMs/FilteredHWMs.csv",hwmFilteredGeoJSONViewURL:stnServicesURL+"/HWMs/FilteredHWMs.geojson",hwmGeoJSONViewURL:stnServicesURL+"/hwms.geojson",xmlPeaksURLRoot:stnServicesURL+"/PeakSummaries/FilteredPeaks.xml",jsonPeaksURLRoot:stnServicesURL+"/PeakSummaries/FilteredPeaks.json",csvPeaksURLRoot:stnServicesURL+"/PeakSummaries/FilteredPeaks.csv",peaksFilteredGeoJSONViewURL:stnServicesURL+"/PeakSummaries/FilteredPeaks.geojson",baroGeoJSONViewURL:stnServicesURL+"/SensorViews.geojson?ViewType=baro_view&",metGeoJSONViewURL:stnServicesURL+"/SensorViews.geojson?ViewType=met_view&",rdgGeoJSONViewURL:stnServicesURL+"/SensorViews.geojson?ViewType=rdg_view&",stormTideGeoJSONViewURL:stnServicesURL+"/SensorViews.geojson?ViewType=stormtide_view&",waveHeightGeoJSONViewURL:stnServicesURL+"/SensorViews.geojson?ViewType=waveheight_view&"},queryStrings:{},vars:{currentEventStartDate_str:"",currentEventEndDate_str:"",currentEventActive:!1},layerList:[{ID:"baro",Name:"Barometric Pressure Sensor",Type:"sensor"},{ID:"stormTide",Name:"Storm Tide Sensor",Type:"sensor"},{ID:"met",Name:"Meteorological Sensor",Type:"sensor"},{ID:"waveHeight",Name:"Wave Height Sensor",Type:"sensor"},{ID:"rdg",Name:"Rapid Deployment Gage",Type:"sensor"},{ID:"hwm",Name:"High Water Mark",Type:"observed"},{ID:"peak",Name:"Peak Summary",Type:"observed"}]},map,markerCoords=[],oms,baroMarkerIcon=L.divIcon({className:"baroMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),metMarkerIcon=L.divIcon({className:"metMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),rdgMarkerIcon=L.divIcon({className:"rdgMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),stormTideMarkerIcon=L.divIcon({className:"stormTideMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),waveHeightMarkerIcon=L.divIcon({className:"waveHeightMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),hwmMarkerIcon=L.divIcon({className:"hwmMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),peaksMarkerIcon=L.divIcon({className:"peaksMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),nwisMarkerIcon=L.divIcon({className:"nwisMarker",iconAnchor:[8,24],popupAnchor:[0,0]}),baro=L.layerGroup(),stormTide=L.layerGroup(),met=L.layerGroup(),rdg=L.layerGroup(),waveHeight=L.layerGroup(),hwm=L.layerGroup(),peaks=L.layerGroup(),USGSrtGages=L.featureGroup();$(document).ready(function(){"use strict";function e(e,t){$("#eventNameDisplay").html(e),$("#largeEventNameDisplay").html(e);var a=[t.toString()];$("#evtSelect_filterModal").val([a]).trigger("change")}function t(){$("#geosearchModal").modal("show")}function a(){$("#aboutModal").modal("show")}function r(){$("#filtersModal").modal("show")}function s(e){c&&map.removeLayer(c),c=L.esri.basemapLayer(e),map.addLayer(c),l&&map.removeLayer(l),("ShadedRelief"===e||"Oceans"===e||"Gray"===e||"DarkGray"===e||"Imagery"===e||"Terrain"===e)&&(l=L.esri.basemapLayer(e+"Labels"),map.addLayer(l))}function n(){search_api.on("load",function(){$("#chkExtent").change(function(){if($(this).is(":checked")){console.log("Checked",map.getBounds().getSouth(),map.getBounds().getNorth(),map.getBounds().getWest(),map.getBounds().getEast());var e=map.getBounds();search_api.setOpts({LATmin:e.getSouth(),LATmax:e.getNorth(),LONmin:e.getWest(),LONmax:e.getEast()})}}),search_api.setOpts({textboxPosition:"user-defined",theme:"user-defined",DbSearchIncludeUsgsSiteSW:!0,DbSearchIncludeUsgsSiteGW:!0,DbSearchIncludeUsgsSiteSP:!0,DbSearchIncludeUsgsSiteAT:!0,DbSearchIncludeUsgsSiteOT:!0}),search_api.on("location-found",function(e){var t=14;"U.S. State or Territory"===e.Category&&(t=9),map.setView([e.y,e.x],t),L.popup().setLatLng([e.y,e.x]).setContent("<p><b>"+e.label+"</b> <br/><br/><b>NAME:            </b> "+e.name+"<br/><b>CATEGORY:        </b> "+e.category+"<br/><b>STATE:           </b> "+e.state+"<br/><b>COUNTY:          </b> "+e.county+"<br/><br/><b>LATITUDE:        </b> "+e.y+"<br/><b>LONGITUDE:       </b> "+e.x+"<br/><b>ELEVATION (FEET):</b> "+e.elevFt+"<br/><br/><b>PERCENT MATCH:   </b> "+e.pctMatch+"<br/></p>").openOn(map)}),search_api.on("no-result",function(){console.error("No location matching the entered text could be found.")}),search_api.on("timeout",function(){console.error("The search operation timed out.")})}),$("#searchSubmit").on("click",function(){console.log("in search submit"),$("#sapi-searchTextBox").keyup()})}function o(e){switch(e){case 19:return"1,128";case 18:return"2,256";case 17:return"4,513";case 16:return"9,027";case 15:return"18,055";case 14:return"36,111";case 13:return"72,223";case 12:return"144,447";case 11:return"288,895";case 10:return"577,790";case 9:return"1,155,581";case 8:return"2,311,162";case 7:return"4,622,324";case 6:return"9,244,649";case 5:return"18,489,298";case 4:return"36,978,596";case 3:return"73,957,193";case 2:return"147,914,387";case 1:return"295,828,775";case 0:return"591,657,550"}}if($("#peakDatePicker .input-daterange").datepicker({format:"yyyy-mm-dd",endDate:"today",startView:2,maxViewMode:3,todayBtn:!0,clearBtn:!0,multidate:!1,autoclose:!0,todayHighlight:!0}),$("#btnSubmitEvent").click(function(){if(null!==$("#evtSelect_welcomeModal").val()){$("#welcomeModal").modal("hide");var e=$("#evtSelect_welcomeModal").val();$("#evtSelect_filterModal").val([e]).trigger("change"),populateEventDates(e),filterMapData()}else alert("Please choose an event to proceed.")}),window.location.hash){var i=window.location.hash.substring(1);$.getJSON("https://stn.wim.usgs.gov/STNServices/events/"+i+".json",{}).done(function(t){i=t.event_id.toString(),1==t.event_status_id?fev.vars.currentEventActive=!0:fev.vars.currentEventActive=!1,fev.vars.currentEventStartDate_str=void 0==t.event_start_date?"":t.event_start_date.substr(0,10),fev.vars.currentEventEndDate_str=void 0==t.event_end_date?"":t.event_end_date.substr(0,10),console.log("Selected event is "+t.event_name+". START date is "+fev.vars.currentEventStartDate_str+" and END date is "+fev.vars.currentEventEndDate_str+". Event is active = "+fev.vars.currentEventActive),filterMapData(i,!0),e(t.event_name,t.event_id)}).fail(function(){console.log("Request Failed. Most likely invalid event name.")})}else $("#welcomeModal").modal({backdrop:"static",keyboard:!1});map=L.map("mapDiv").setView([39.833333,-98.583333],4);var l,c=L.esri.basemapLayer("Gray").addTo(map);L.Icon.Default.imagePath="./images",map.on("popupopen",function(){$(".data-disclaim").click(function(e){$("#aboutModal").modal("show"),$("#disclaimerTabPane").tab("show")})}),USGSrtGages.addTo(map);var d={"<i class='nwisMarker'></i>&nbsp;Real-time Stream Gage":USGSrtGages},u={};$.each(fev.layerList,function(e,t){"sensor"==t.Type&&(d["<i class='"+t.ID+"Marker'></i>&nbsp;"+t.Name]=window[t.ID]),"sensor"!=t.Type&&(u["<i class='"+t.ID+"Marker'></i>&nbsp;"+t.Name]=window[t.ID])});var p=L.control.layers(null,d,{collapsed:!1});p.addTo(map),p._container.remove(),document.getElementById("sensorsToggleDiv").appendChild(p.onAdd(map));var v=L.control.layers(null,u,{collapsed:!1});v.addTo(map),v._container.remove(),document.getElementById("observedToggleDiv").appendChild(v.onAdd(map)),oms=new OverlappingMarkerSpiderfier(map,{keepSpiderfied:!0}),$("#sensorDownloadButtonCSV").attr("href",fev.urls.csvSensorsURLRoot),$("#sensorDownloadButtonJSON").attr("href",fev.urls.jsonSensorsURLRoot),$("#sensorDownloadButtonXML").attr("href",fev.urls.xmlSensorsURLRoot),$("#hwmDownloadButtonCSV").attr("href",fev.urls.csvHWMsURLRoot),$("#hwmDownloadButtonJSON").attr("href",fev.urls.jsonHWMsURLRoot),$("#hwmDownloadButtonXML").attr("href",fev.urls.xmlHWMsURLRoot),$("#peaksDownloadButtonCSV").attr("href",fev.urls.csvPeaksURLRoot),$("#peaksDownloadButtonJSON").attr("href",fev.urls.jsonPeaksURLRoot),$("#peaksDownloadButtonXML").attr("href",fev.urls.xmlPeaksURLRoot),$(".dataTypeRadio").each(function(){$(this).on("click",function(){var e=$(this).attr("id"),t=$("#"+e+"Form");t.show(),$(".hiddenForm").not(t).hide()})}),$(".check").on("click",function(){$(this).find("span").toggle()}),$("#geosearchNav").click(function(){t()}),$("#aboutNav").click(function(){a()}),$("#btnChangeFilters").click(function(){r()}),$("#btnSubmitFilters").on("click",function(){filterMapData(),$("#filtersModal").modal("hide")}),$(".basemapBtn").on("click",function(){var e=this.id.replace("btn","");switch(e){case"Streets":e="Streets";break;case"Satellite":e="Imagery";break;case"Topo":e="Topographic";break;case"Terrain":e="ShadedRelief";break;case"Gray":e="Gray";break;case"NatGeo":e="NationalGeographic"}s(e)});var m=document.createElement("script");m.src="http://txpub.usgs.gov/DSS/search_api/1.1/api/search_api.min.js",m.onload=function(){n()},document.body.appendChild(m),$("#legendButtonNavBar, #legendButtonSidebar").on("click",function(){$("#legend").toggle()}),$("#legendClose").on("click",function(){$("#legend").hide()}),map.on("load moveend zoomend",function(e){var t;if($.each(USGSrtGages.getLayers(),function(e,a){var r=a.getPopup();r&&(t=r._isOpen)}),map.getZoom()<7&&USGSrtGages.clearLayers(),map.hasLayer(USGSrtGages)&&map.getZoom()>=7&&!t){USGSrtGages.clearLayers();var a=map.getBounds().getSouthWest().lng.toFixed(7)+","+map.getBounds().getSouthWest().lat.toFixed(7)+","+map.getBounds().getNorthEast().lng.toFixed(7)+","+map.getBounds().getNorthEast().lat.toFixed(7);queryNWISrtGages(a)}}),USGSrtGages.on("click",function(e){queryNWISgraph(e)}),map.whenReady(function(){var e=o(map.getZoom());$("#scale")[0].innerHTML=e,console.log("Initial Map scale registered as "+e,map.getZoom());var t=map.getCenter();$("#latitude").html(t.lat.toFixed(4)),$("#longitude").html(t.lng.toFixed(4))}),map.on("zoomend",function(){var e=map.getZoom(),t=o(e);$("#scale")[0].innerHTML=t}),map.on("mousemove",function(e){$("#mapCenterLabel").css("display","none"),null!==e.latlng&&($("#latitude").html(e.latlng.lat.toFixed(4)),$("#longitude").html(e.latlng.lng.toFixed(4)))}),map.on("dragend",function(){$("#mapCenterLabel").css("display","inline");var e=map.getCenter();$("#latitude").html(e.lat.toFixed(4)),$("#longitude").html(e.lng.toFixed(4))})}),$(document).ready(function(){$("#btnClearFilters").click(function(){$(".clearable").val("").trigger("change")}),$("#evtTypeSelect").select2({placeholder:"All Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/eventtypes.json",headers:{Accept:"*/*"},success:function(e){e.sort(function(e,t){var a=e.TYPE,r=t.TYPE;return r>a?-1:a>r?1:0});for(var t=0;t<e.length;t++)$("#evtTypeSelect").append('<option value="'+e[t].event_type_id+'">'+e[t].type+"</option>"),fev.data.eventTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$(".evtSelect").select2({placeholder:"Select event",allowClear:!1,maximumSelectionLength:1}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/events.json",headers:{Accept:"*/*"},success:function(e){e.sort(function(e,t){var a=e.event_name,r=t.event_name;return r>a?-1:a>r?1:0});for(var t=0;t<e.length;t++)$(".evtSelect").append('<option value="'+e[t].event_id+'">'+e[t].event_name+"</option>"),e[t].id=e[t].event_id,fev.data.events.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#stateSelect").select2({placeholder:"All Events"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/Sites/States.json",headers:{Accept:"*/*"},success:function(t){t.sort(function(e,t){var a=e.state_name,r=t.state_name;return r>a?-1:a>r?1:0});for(var a=0;a<t.length;a++)$("#stateSelect").append('<option value="'+t[a].state_abbrev+'">'+t[a].state_name+"</option>"),t[a].id=t[a],fev.data.states.push(t[a]);e()},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#countySelect").select2({placeholder:"All Counties"}),$("#countySelect").on("select2:select select2:unselect",function(e){}),$("#sensorTypeSelect").select2({placeholder:"All Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/sensortypes.json",headers:{Accept:"*/*"},success:function(e){e.sort(function(e,t){var a=e.TYPE,r=t.TYPE;return r>a?-1:a>r?1:0});for(var t=0;t<e.length;t++)$("#sensorTypeSelect").append('<option value="'+e[t].sensor_type_id+'">'+e[t].sensor+"</option>"),fev.data.sensorTypes.push(e[t]);
},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#sensorStatusSelect").select2({placeholder:"All Statuses"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/statustypes.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#sensorStatusSelect").append('<option value="'+e[t].status_type_id+'">'+e[t].status+"</option>"),fev.data.sensorStatusTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#collectionConditionSelect").select2({placeholder:"All Conditions"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/InstrCollectConditions.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#collectionConditionSelect").append('<option value="'+e[t].id+'">'+e[t].condition+"</option>"),fev.data.collectionConditions.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#deployTypeSelect").select2({placeholder:"All Deploy Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/deploymenttypes.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#deployTypeSelect").append('<option value="'+e[t].deployment_type_id+'">'+e[t].method+"</option>"),fev.data.deploymentTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#hwmTypeSelect").select2({placeholder:"All Types"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/hwmtypes.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#hwmTypeSelect").append('<option value="'+e[t].hwm_type_id+'">'+e[t].hwm_type+"</option>"),e[t].id=e[t].hwm_type_id,fev.data.hwmTypes.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}}),$("#hwmQualitySelect").select2({placeholder:"All Qualities"}),$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/hwmqualities.json",headers:{Accept:"*/*"},success:function(e){for(var t=0;t<e.length;t++)$("#hwmQualitySelect").append('<option value="'+e[t].hwm_quality_id+'">'+e[t].hwm_quality+"</option>"),e[t].id=e[t].hwm_quality_id,fev.data.hwmQualities.push(e[t])},error:function(e){console.log("Error processing the JSON. The error is:"+e)}});var e=function(){for(var e=0;e<fev.data.states.length;e++)$.ajax({dataType:"json",type:"GET",url:"http://stn.wim.usgs.gov/STNServices/Sites/CountiesByState.json?StateAbbrev="+fev.data.states[e].state_abbrev,headers:{Accept:"*/*"},currentState:fev.data.states[e].state_abbrev,success:function(e){fev.data.counties[this.currentState]=e},error:function(e){console.log("Error retrieving counties. The error is: "+e)}})};$("#evtTypeSelect").on("select2:select select2:unselect",function(e){var t=$(this).val();if(null!==t)if(t.length>0){for(var a=[],r=0;r<t.length;r++)a.push(Number(t[r]));var s=fev.data.events.filter(function(e){return a.indexOf(e.event_type_id)>-1});$(".evtSelect").html("");for(var n=0;n<s.length;n++)$(".evtSelect").append('<option value="'+s[n].event_id+'">'+s[n].event_name+"</option>")}else{$(".evtSelect").html("");for(var r=0;r<fev.data.events.length;r++)$(".evtSelect").append('<option value="'+fev.data.events[r].event_id+'">'+fev.data.events[r].event_name+"</option>")}}),$(".evtSelect").on("change",function(e){var t=$(this).val();if(null===t);else{if(!(t.length>0)){for(var a=document.getElementById("evtTypeSelect").options,r=0;r<a.length;r++)a[r].disabled=!1;return}for(var s=function(e){for(var t=[],a=0;a<e.length;a++)-1===t.indexOf(e[a])&&t.push(e[a]);return t},n=[],r=0;r<t.length;r++)n.push(parseInt(t[r]));for(var o=[],r=0;r<fev.data.events.length;r++)-1!==n.indexOf(fev.data.events[r].event_id)&&o.push(fev.data.events[r].event_type_id);for(var i=s(o),l=document.getElementById("evtTypeSelect").options,r=0;r<l.length;r++)l[r].disabled=!0,-1!==i.indexOf(parseInt(l[r].value))&&(l[r].disabled=!1)}}),$("#stateSelect").on("select2:select select2:unselect",function(e){var t=$(this).val();if(!t>0||null===t)return $("#countySelect").html(""),void $("#countySelect").append("<option value=null>Please select state(s) first </option>");var a=[];for(var r in fev.data.counties)for(var s=0;s<fev.data.counties[r].length;s++){var n=fev.data.counties[r][s].county_name;t.indexOf(r)>-1&&(a=a.concat(n))}$("#countySelect").html("");for(var r in a){var o=a[r];$("#countySelect").append('<option value="'+o+'">'+o+"</option>")}})});