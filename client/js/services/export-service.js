(function(){
  'use strict';
  angular.module('export-service')
         .factory('excelgen', ['$location',
                          function ($location) {
    var self;
    return self = {
      Workbook: function() {
        if(!(this instanceof self.Workbook)) {
          //console.log('Workbook: ' + JSON.stringify(Workbook, null, '\t'));
          return new self.Workbook();
        }
        this.SheetNames = [];
        this.Sheets = {};
        //console.log('Workbook: ' + JSON.stringify(Workbook, null, '\t'));
      },
      s2ab: function(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      },
      datenum: function(v, date1904) {
        if(date1904) v+=1462;
        var epoch = Date.parse(v);
        console.log("epoch: " + epoch + "1899: " + new Date(Date.UTC(1899, 11, 30)));
        console.log("diff: " + (epoch - new Date(Date.UTC(1899, 11, 30))));
        console.log("return: " + (epoch - new Date(Date.UTC(1899, 11, 30)))/(24 * 60 * 60 * 1000));
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
      },
      sheet_from_array_of_arrays: function(data, opts) {
        var ws = {};
        var columnsWidths = [];
        var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
        for(var R = 0; R != data.length; ++R) {
          for(var C = 0; C != data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            if (columnsWidths[C] == null) {
              var prop = {wch: 2};
              columnsWidths.push(prop);
            }

            var cell = {v: data[R][C] };
            if(cell.v == null) continue;
            var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

            var cellLength = 2;
            // cell type
            if (typeof cell.v === 'number') {
              cell.t = 'n';
              cellLength = cell.v.toString().length;
            } else if (typeof cell.v === 'boolean') {
              cell.t = 'b';
            } else if (cell.v instanceof Date) {
              cell.t = 'n';
              cell.z = XLSX.SSF._table[15];
              cell.v = self.datenum(cell.v);
              cellLength = cell.z.length + 1;
            } else {
              cell.t = 's';
              cellLength = cell.v.length;
            }
            //console.log("R: " + R + "C: " + C + "; length: " + cellLength);
            if (cellLength > columnsWidths[C].wch) {
              columnsWidths[C].wch = cellLength;
            }

            // cell style
            cell.s = {font: {bold: true}};
            // header background
            if (opts[R] != null &&
                opts[R][C] != null) {
              if (opts[R][C].fill != null) {
                cell.s.fill = opts[R][C].fill;
              }
              if (opts[R][C].font != null) {
                cell.s.font = opts[R][C].font;
              }
            }

            ws[cell_ref] = cell;
          }
        }
        if(range.s.c < 10000000) {
          ws['!ref'] = XLSX.utils.encode_range(range);
        }

        ws['!cols'] = columnsWidths;

        return ws;
      }
    };

  }]);

})();
