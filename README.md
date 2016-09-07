# FEV
Version 2 of the Flood Event Viewer (FEV)

run `npm install` AND `bower install` to get dependencies after first cloning

`gulp watch` to run in browser with watch for debugging

`gulp` to build project

---

##App Features

####Event URL Parameter
To go directly to an event view on load, append `#{event name}` to the URL. Example: `stn.wim.usgs.gov/FEV#Sandy`.  If arriving without event in URL, user will be directed, via modal, to choose an event first before proceeding.

####NWIS real-time layers
FEV contains an USGS NWIS real-time streamgage layer to display gage data for the period of the event specified.  A graph of stage in elevation feet is generated on-the-fly using the HighCharts library.

The app currently displays gages meeting the following criteria:

 - Parameter code 00065 (stage)

More parameters and site types are coming soon.

