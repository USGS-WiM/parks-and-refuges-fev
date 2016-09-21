# FEV
###Version 2 of the Flood Event Viewer (FEV)


----------

##Developer Instructions

run `npm install` AND `bower install` to get dependencies after first cloning

`gulp watch` to run in browser with watch for debugging

`gulp` to build project

---

##App Features

####Event URL Parameter
To go directly to an event view on load, append `#{event name}` to the URL. Example: `stn.wim.usgs.gov/FEV#Sandy`.  If arriving without event in URL, user will be directed, via modal, to choose an event first before proceeding.

####Guide to NWIS real-time layer
FEV contains a USGS NWIS real-time streamgage layer to display gage data for the period of the event specified.  A graph of stage in elevation feet is generated on-the-fly using the HighCharts library. Proper time period display is dependent on proper event management in the STN database - an invalid event date range may result in a failure to retrieve data. FEV defaults to showing the last 7 days of real-time gage data for any absent or invalid event date range.

FEV displays NWIS sites of the following type:
 - ES - Estuary
 - LK - Lake, Reservoir, Impoundment
 - OC - Ocean
 - OC-CO - Coastal
 - ST - Stream
 - ST-CA - Canal
 - ST-DCH - Ditch
 - ST-TS - Tidal stream

[Full NWIS site type list](http://maps.waterdata.usgs.gov/mapper/help/sitetype.html)

The following parameter codes are used to display water level:
 -  00065 (Gage height, feet)
 -  62620 (Estuary or ocean water surface elevation above NAVD 1988, feet)



####Guide to Rapid Deployment Gage (RDG) layer
FEV contains a layer for RDGs. The RDG layer reflects the RDGs recorded in the STN database, which is essentially a metadata record for the sensor, with the option to include files such as photos and diagrams.  Actual time-series data is recorded by the NWIS database. USGS staff that record the RDG in the STN database must include a USGS NWIS site ID for the RDG in order to associate the records and allow FEV to display a water level graph and link to the NWISWeb data page.  FEV retrieves RDG water level time-series data from NWIS for the date range of the chosen event using the [Instantaneous Values Web Service](http://waterservices.usgs.gov/rest/IV-Service.html).

Parameter codes used to display water level:
 - 62620 (Estuary or ocean water surface elevation above NAVD 1988, feet)
 - 00065 (Gage height, feet)
 - 00067 (Tide stage, code)

An absent or invalid NWIS site ID will result in a "No NWIS Data Available for Graph" message, and no NWISWeb link will be provided to the user. NWIS site IDs have a length range between 8 and 15 digits, thus any ID provided that is shorter than 8 characters or longer than 15 is invalid and will result in no graph or link. One common mistake is to omit the leading zero of an ID (for example: entering '2092576' instead of '02092576').

A graph and link will also not appear if there is an invalid response from NWIS web services. If you expect to see RDG time-series data in FEV and it does not appear, confirm the NWIS site ID is correct and valid in STNWeb. If it is and the data still does not appear, please review the site's data availability in NWIS.

[Lookup NWIS parameter codes](http://nwis.waterdata.usgs.gov/usa/nwis/pmcodes)