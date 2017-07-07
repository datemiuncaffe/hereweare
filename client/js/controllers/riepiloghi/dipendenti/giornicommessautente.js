angular
  .module('riepiloghi')
  .controller('GiorniCommessaUtenteController',
      ['$scope', '$state', 'NgTableParams', '$resource', 'resourceBaseUrl',
       '$stateParams', 'FileSaver', 'Blob', 'excelgen',
       '$rootScope', 'crud',
      function($scope, $state, NgTableParams, $resource, resourceBaseUrl,
        $stateParams, FileSaver, Blob, excelgen, $rootScope, crud) {
	  var ref = this;

    var now = moment();
    var currentYear = now.year();
    var previousMonth = now.month();
    var currentMonth = now.month() + 1;
    console.log('inside GiorniCommessaUtenteController: ' +
         '; year = ' + currentYear + '; month = ' + currentMonth);

    // set table filter
    var tablefilter = {
      yearIn: currentYear,
      yearFin: currentYear,
      meseIn: currentMonth,
      meseFin: currentMonth
    };

    $scope.totalHours = 0;
    $scope.totalDays = 0;

	 if ($stateParams.year != null && $stateParams.year.length > 0) {
			tablefilter.anno = $stateParams.year;
		}
    if ($stateParams.month != null && $stateParams.month.length > 0) {
			tablefilter.mese = $stateParams.month;
		}
    if ($stateParams.projectCode != null && $stateParams.projectCode.length > 0) {
			tablefilter.codiceProgetto = $stateParams.projectCode;
		}
    console.log('tablefilter = ' + JSON.stringify(tablefilter, null, '\t'));

    var query = $resource('http://' + resourceBaseUrl + '/query_giorni_lav_commessa_utente_mese');

    ref.tableParams = new NgTableParams({
        filter: tablefilter,
        group: "mese"
      },
      {
    		getData : function(params) {
    			//console.log('params: ' + JSON.stringify(params, null, '\t'));
    			/*console.log('params.url(): ' +
            JSON.stringify(params.url(), null, '\t'));
               console.log('params.group(): ' +
            JSON.stringify(params.group(), null, '\t'));*/

            // ajax request to back end
    			return query.get(params.url()).$promise.then(function(data) {
    				var res = [];
    				if (data != null && data.giorniCommessaUtente != null &&
                     data.giorniCommessaUtente.length > 0) {
    					//console.log('data giorni Commessa Utente: ' + JSON.stringify(data.giorniCommessaUtente, null, '\t'));
    					res = data.giorniCommessaUtente;
    				}

               $scope.totalHours =
                  $scope.sumGrouped(res, "oreMese")
                     .toFixed(2).replace(".",",");
               $scope.totalDays =
                  $scope.sumGrouped(res, "giornateMese")
                     .toFixed(2).replace(".",",");

               console.log('Giorni Commessa Utente: ' + JSON.stringify(res, null, '\t'));
    				return res;
    			});
    		}
    	}
    );
    ref.monthFilterByInterval = {
      meseIn: 'templates/table/filters/startMonth.html',
      meseFin: 'templates/table/filters/endMonth.html'
    };
    ref.yearFilterByInterval = {
      yearIn: 'templates/table/filters/startYear.html',
      yearFin: 'templates/table/filters/endYear.html'
    };

    $scope.isLastPage = function() {
      return ref.tableParams.page() === $scope.totalPages();
    };

    $scope.totalPages = function(){
      return Math.ceil(ref.tableParams.total() /
        ref.tableParams.count());
    };

    $scope.sumGrouped = function(data, field) {
      var sum = 0;
      data.forEach(function(item){
        if (item[field] != null &&
            item[field].length > 0) {
          var dottedValue = item[field].replace(",",".");
          sum += parseFloat(dottedValue);
        }
      });
      return sum;
    };

    $scope.sumTotalHours = function(groups, field) {
      var data = [];
      groups.forEach(function(group){
        if (group.data != null &&
            group.data.length > 0) {
          data = data.concat(group.data);
        }
      });
      var sum = $scope.sumGrouped(data, field);
      return sum;
    };

    $scope.saveCSV = function() {
      console.log("saving csv ...");
      var currentData = ref.tableParams.data;
      console.log("currentData: " + JSON.stringify(currentData, null, 2));

      var zip = new JSZip();
      var zipfolder = zip.folder("orefatturate");

      var currentGroup = $scope.tableGrouping.selected[0];
      var currentDataCSV = getCSV(currentData, currentGroup);
      var fileName = "reportBy" + currentGroup;

      zipfolder.file(fileName + ".csv", currentDataCSV);
      zipfolder.generateAsync({type:"blob"})
              .then(function (blob) {
                FileSaver.saveAs(blob, 'giorniCommessaUtente.zip');
              });
    };

    $scope.saveXLS = function() {
      console.log("saving excel ...");
      var currentData = ref.tableParams.data;
      console.log("currentData: " + JSON.stringify(currentData, null, 2));

      var zip = new JSZip();
      var zipfolder = zip.folder("orefatturate");

      var currentGroup = $scope.tableGrouping.selected[0];
      var currentDataXLS = getXLS(currentData, currentGroup);
      var fileName = "reportBy" + currentGroup;

      zipfolder.file(fileName + ".xlsx", currentDataXLS);
      zipfolder.generateAsync({type:"blob"})
              .then(function (blob) {
                FileSaver.saveAs(blob, 'giorniCommessaUtente.zip');
              });
    };

    function getCSV(groups, groupName) {
      var csv = "";
      csv += "Ore erogate\n";
      csv += ",\n";

      groups.forEach(function(group) {
        // header
        if (groupName === "mese") {
          var month = group.value;
          var currentmonth = moment({month:(group.value - 1)});
          var datestart = currentmonth.date(1).format("D-MMM-YY");
          var dateend = currentmonth.date(currentmonth.daysInMonth()).format("D-MMM-YY");
          console.log("datestart: " + datestart + "; dateend: " + dateend);
          csv += "Data di inizio," + datestart + ",,Data di fine," + dateend + "\n";
          csv += ",,,,,\n";
        } else {
          csv += group.value + ",\n";
          csv += ",\n";
        }

        // body and sum
        var ret = [];
        var header = ["ANNO", "MESE", "CLIENTE", "CODICE PROGETTO",
          "PROGETTO", "NOME", "COGNOME", "ORE", "GIORNATE"];
        ret.push('"' + header.join('","') + '"');

        var groupdata = group.data;
        for (var i = 0, len = groupdata.length; i < len; i++) {
            var line = [];
            if (groupdata[i].hasOwnProperty("anno")) {
              line.push('"' + groupdata[i]["anno"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("mese")) {
              line.push('"' + groupdata[i]["mese"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("nomeCliente")) {
              line.push('"' + groupdata[i]["nomeCliente"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("codiceProgetto")) {
              line.push('"' + groupdata[i]["codiceProgetto"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("nomeProgetto")) {
              line.push('"' + groupdata[i]["nomeProgetto"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("nomeDipendente")) {
              line.push('"' + groupdata[i]["nomeDipendente"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("cognomeDipendente")) {
              line.push('"' + groupdata[i]["cognomeDipendente"] + '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("oreMese")) {
              line.push('"' +
                groupdata[i]["oreMese"].replace(",",".") +
                '"');
            } else {
              line.push('""');
            }

            if (groupdata[i].hasOwnProperty("giornateMese")) {
              line.push('"' +
                groupdata[i]["giornateMese"].replace(",",".") +
                '"');
            } else {
              line.push('""');
            }

            ret.push(line.join(','));
        }
        var linesum = ",,,,,," + "Totali:," +
          $scope.sumGrouped(groupdata, "oreMese") + "," +
          $scope.sumGrouped(groupdata, "giornateMese");
        ret.push(linesum);
        csv += ret.join('\n');
        csv += "\n";
        csv += ",,,,,,,,,\n";
      });

      // total sum
      var linetotsum = ",,,,,," + "Totali complessivi:," +
        $scope.totalHours + "," +
        $scope.totalDays + ",\n";
      csv += linetotsum;

      return csv;
    };

    function getXLS(groups, groupName) {
      /* Build data for xls in form of array of arrays */
      var XLSdata = [
        ["Ore erogate"]
      ];
      var XLSoptions = [
        [null]
      ];
      XLSdata.push([null]);
      XLSoptions.push([null]);

      groups.forEach(function(group) {
        // header
        if (groupName === "mese") {
          var year = group.data[0].anno;
          var month = group.value - 1;
          var daysInMonth = new Date(year, month + 1, 0).getDate();
          console.log("year: " + year + "; month: " + month + "; daysInMonth: " + daysInMonth);
          var datestart = new Date(Date.UTC(year, month, 1));
          var dateend = new Date(Date.UTC(year, month, daysInMonth));
          console.log("datestart: " + datestart + "; dateend: " + dateend);
          XLSdata.push(["Data di inizio", datestart,
            null, "Data di fine", dateend]);
          XLSoptions.push([null, null, null, null, null]);
        } else {
          XLSdata.push([group.value]);
          XLSoptions.push([null]);
        }
        XLSdata.push([null, null, null, null, null]);
        XLSoptions.push([null, null, null, null, null]);

        // body and sum
        XLSdata.push(["ANNO", "MESE", "CLIENTE", "CODICE PROGETTO",
          "PROGETTO", "NOME", "COGNOME", "ORE", "GIORNATE"]);
        var headeropts = {
          fill: {
            patternType: "solid",
            fgColor: { rgb: "165697" },
            bgColor: { rgb: "165697" }
          },
          font: {
            color: { rgb: "FFFFFF" }
          }
        };
        XLSoptions.push([headeropts, headeropts, headeropts,
          headeropts, headeropts, headeropts,
          headeropts, headeropts, headeropts]);

        var groupdata = group.data;
        for (var i = 0, len = groupdata.length; i < len; i++) {
            var line = [];
            if (groupdata[i].hasOwnProperty("anno")) {
              line.push(groupdata[i]["anno"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("mese")) {
              line.push(groupdata[i]["mese"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("nomeCliente")) {
              line.push(groupdata[i]["nomeCliente"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("codiceProgetto")) {
              line.push(groupdata[i]["codiceProgetto"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("nomeProgetto")) {
              line.push(groupdata[i]["nomeProgetto"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("nomeDipendente")) {
              line.push(groupdata[i]["nomeDipendente"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("cognomeDipendente")) {
              line.push(groupdata[i]["cognomeDipendente"]);
            } else {
              line.push(null);
            }

            if (groupdata[i].hasOwnProperty("oreMese")) {
               var lineField = groupdata[i]["oreMese"];
               var adjLineField = parseFloat(lineField.replace(",","."))
                                  .toFixed(2);
               line.push(parseFloat(adjLineField));
            } else {
               line.push(null);
            }

            if (groupdata[i].hasOwnProperty("giornateMese")) {
               var lineField = groupdata[i]["giornateMese"];
               var adjLineField = parseFloat(lineField.replace(",","."))
                                  .toFixed(2);
               line.push(parseFloat(adjLineField));
            } else {
               line.push(null);
            }
            XLSdata.push(line);
            XLSoptions.push([null, null, null, null,
              null, null, null, null, null]);

            console.log('line: ' + JSON.stringify(line, null, '\t'));
        }
        XLSdata.push([null, null, null, null,
          null, null, "Totali:",
          parseFloat($scope.sumGrouped(groupdata, "oreMese").toFixed(2)),
          parseFloat($scope.sumGrouped(groupdata, "giornateMese").toFixed(2))]);
        XLSoptions.push([null, null, null, null,
          null, null, null, null, null]);
        XLSdata.push([null, null, null, null,
          null, null, null, null, null]);
        XLSoptions.push([null, null, null, null,
          null, null, null, null, null]);
      });

      console.log('totalHours: ' + $scope.totalHours +
                  'totalDays: ' + $scope.totalDays);
      console.log('typeof: ' + typeof $scope.totalHours);

      // total sum
      XLSdata.push([null, null, null, null,
         null, null, "Totali complessivi:",
         parseFloat($scope.totalHours.replace(",",".")),
         parseFloat($scope.totalDays.replace(",","."))]);
      XLSoptions.push([null, null, null, null,
         null, null, null, null, null]);

      var ws_name = "Rendicontazione ore";
      var wb = new excelgen.Workbook();
      console.log('wb: ' + JSON.stringify(wb, null, '\t'));
      var ws = excelgen.sheet_from_array_of_arrays(XLSdata, XLSoptions);

      /* add worksheet to workbook */
      wb.SheetNames.push(ws_name);
      wb.Sheets[ws_name] = ws;
      console.log('wb: ' + JSON.stringify(wb, null, '\t'));

      var wbout = XLSX.write(wb,
        {bookType:'xlsx', bookSST:true, type: 'binary'});

      return excelgen.s2ab(wbout);
    };

    /* ----- reader ------ */
    var XLSreader = document.getElementById('XLSreader');

    function handleFile(e) {
    	var files = e.target.files;
    	var f = files[0];
      var reader = new FileReader();
      var name = f.name;
      reader.onload = function(e) {
        if( typeof console !== 'undefined' ) {
          console.log("onload", new Date());
        }
        var data = e.target.result;
        var wb = XLSX.read(data, {type: 'binary', cellStyles: true});
        process_wb(wb);
      };
      reader.readAsBinaryString(f);
    };

    if (XLSreader != null && XLSreader.addEventListener) {
      XLSreader.addEventListener('change', handleFile, false);
    }

    function process_wb(wb) {
    	var output = "";
      //output = JSON.stringify(to_json(wb), 2, 2);
      output = to_csv(wb);
      var wsList = wb.Sheets;
      console.log("wsList: " + JSON.stringify(wsList, null, '\t'));
      //ws['!cols']
      //console.log("columns properties: " +
      //    wsList["Rendicontazione ore"]['!cols']);

    	if(typeof console !== 'undefined') {
        console.log("output", new Date());
        console.log("output: " + output);
      }
    };

    function to_json(workbook) {
    	var result = {};
    	workbook.SheetNames.forEach(function(sheetName) {
    		var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    		if(roa.length > 0){
    			result[sheetName] = roa;
    		}
    	});
    	return result;
    };

    function to_csv(workbook) {
    	var result = [];
    	workbook.SheetNames.forEach(function(sheetName) {
    		var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    		if(csv.length > 0){
    			result.push("SHEET: " + sheetName);
    			result.push("");
    			result.push(csv);
    		}
    	});
    	return result.join("\n");
    };

  }]);
