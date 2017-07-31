angular
	.module("app")
	.directive("hereweareDatatable", function() {
		return {
			restrict: "E",
			scope: {
				sourceName: "="
			},
			controller: HereweareDatatableController,
			link: function(scope, element, attrs, controller) {
				console.log('hereweareDatatable link');
				controller.getData(scope.sourceName);
			}
		};
	});

HereweareDatatableController.$inject = ['$scope', '$log', '$parse', '$compile',
		'$attrs', '$element', '$document', 'crud'];
function HereweareDatatableController($scope, $log, $parse, $compile,
		$attrs, $element, $document, crud) {
	console.log('HereweareDatatableController');
	this.$scope = $scope;
	this.$log = $log;
	this.$parse = $parse;
	this.$compile = $compile;
	this.$attrs = $attrs;
	this.$element = $element;
	this.$document = $document;
	this.crud = crud;

	this.sources = {
		"projectsInCustomer": {
			type: "grouped",
			rowskey: "projects",
			header: {
				name: "NOME PROGETTO",
				code: "CODICE PROGETTO"
			}
		}
	};

	this.table = '';

	this.starttable = '<table class="hereweare-datatable">';
	this.endtable = '</table>';

	this.startbody = '<tbody>';
	this.endbody = '</tbody>';
};

HereweareDatatableController.prototype.addHeader = function() {

};

HereweareDatatableController.prototype.addBody = function() {

};

HereweareDatatableController.prototype.addRow = function() {

};

HereweareDatatableController.prototype.addGroup = function() {

};

HereweareDatatableController.prototype.getTable = function(sourceName, data) {
	switch (sourceName) {
		case "customer":

			break;
		case "projectsInCustomer":

			break;
		default:

	}
};


HereweareDatatableController.prototype.getData = function (sourceName) {
	console.log('HereweareDatatableController getData: sourceName: ' + sourceName);

	var resource;
	switch (sourceName) {
		case 'customer':
			resource = this.crud.GET.HEREWEARE.getCustomers();
			break;
		case 'projectsInCustomer':
			resource = this.crud.GET.HEREWEARE.getProjectsInCustomers();
			break;
		default:
	}
	if (resource) {
		resource.then(function(data) {
			console.log('HereweareDatatable getData: ' + JSON.stringify(data, null, '\t'));
		}).catch(function(err) {
			console.log('HereweareDatatable getData err: ' +
				JSON.stringify(err));
		});
	}

};

HereweareDatatableController.prototype.compileDatatable = function () {
	//  if (!this.$element.hasClass('ng-table')) {
	// 	  this.$scope.templates = {
	// 			header: (this.$attrs.templateHeader ? this.$attrs.templateHeader : 'ng-table/header.html'),
	// 			pagination: (this.$attrs.templatePagination ? this.$attrs.templatePagination : 'ng-table/pager.html')
	// 	  };
	// 	  this.$element.addClass('ng-table');
	// 	  var headerTemplate = void 0;
	// 	  // $element.find('> thead').length === 0 doesn't work on jqlite
	// 	  var theadFound_1 = false;
	// 	  __WEBPACK_IMPORTED_MODULE_0_angular__["forEach"](this.$element.children(), function (e) {
	// 			if (e.tagName === 'THEAD') {
	// 				 theadFound_1 = true;
	// 			}
	// 	  });
	// 	  if (!theadFound_1) {
	// 			headerTemplate = __WEBPACK_IMPORTED_MODULE_0_angular__["element"]('<thead ng-include="templates.header"></thead>', this.$document);
	// 			this.$element.prepend(headerTemplate);
	// 	  }
	// 	  var paginationTemplate = __WEBPACK_IMPORTED_MODULE_0_angular__["element"]('<div ng-table-pagination="params" template-url="templates.pagination"></div>', this.$document);
	// 	  this.$element.after(paginationTemplate);
	// 	  if (headerTemplate) {
	// 			this.$compile(headerTemplate)(this.$scope);
	// 	  }
	// 	  this.$compile(paginationTemplate)(this.$scope);
	//  }
};
