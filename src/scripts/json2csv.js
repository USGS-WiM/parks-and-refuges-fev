/**
 * Created by bdraper
 */


    function convertArrayOfObjectsToCSV(args) {
        let result, counter, keys = [], columnDelimiter, lineDelimiter, data, headers, unorderedKeys;
        headers = [];
        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }
        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';
        unorderedKeys = Object.keys(data[0]);
        args.headers.forEach(function (col) {
            let found = false;
            unorderedKeys = unorderedKeys.filter(function (item) {
                if (!found && item === col.fieldName) {
                    keys.push(item);
                    found = true;
                    return false;
                } else {
                    return true;
                }
            })
        })
        // put the headers array in the same order as the data keys
        keys.forEach(function (item) {
            const obj = args.headers.filter(function (o) {
                return o.fieldName === item;
            })[0];
            if (obj) {
                headers.push(obj.colName);
            }
        });
        // remove keys that aren't in the headers array, ensuring those data columns won't be exported
        // keys.forEach(function (item) {
        //     if (headers.indexOf(item) < 0) {
        //         let ndx = keys.indexOf(item);
        //         keys.splice(ndx, 1);
        //     }
        // });
        result = '';
        result += (args.headers) ? headers.join(columnDelimiter) : keys.join(columnDelimiter);
        result += lineDelimiter;
        data.forEach(function (item) {
            counter = 0;
            keys.forEach(function (key) {
                if (counter > 0) {
                    result += columnDelimiter;
                }
                if (typeof item[key] === 'string' && item[key].includes('#')){
                    item[key] = item[key].replace('#', '');
                }
                if (item[key] == null) {
                    result += '';
                } else if (typeof item[key] === 'string' && item[key].includes(',')) {
                    result += '"' + item[key] + '"';
                } else {
                    result += item[key];
                }
                counter++;
            });
            result += lineDelimiter;
        });
        return result;
    }

    function generateCSV(args) {
        let data, filename, link;
        let csv = this.convertArrayOfObjectsToCSV({
            data: args.data,
            headers: args.headers
        });
        if (csv == null) { return; }
        filename = args.filename || 'export.csv';
        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }
