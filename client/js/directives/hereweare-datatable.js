angular
	.module("app")
	.directive("hereweareDatatable", function() {
		return {
			restrict: "E",
			scope: {
				sourceName: "=",
				columnsKeys: "=",
				rowsKey: "=",
				type: "=",
				groupKey: "="
			},
			controller: HereweareDatatableController,
			link: function(scope, element, attrs, controller) {
				console.log('hereweareDatatable link');
				controller.getData()
							.getTable()
							.compileDatatable();
			}
		};
	});

HereweareDatatableController.$inject = ['$scope', '$log', '$parse', '$compile',
		'$attrs', '$element', '$document', '$q', 'crud'];
function HereweareDatatableController($scope, $log, $parse, $compile,
		$attrs, $element, $document, $q, crud) {
	console.log('HereweareDatatableController');
	this.$scope = $scope;
	this.$log = $log;
	this.$parse = $parse;
	this.$compile = $compile;
	this.$attrs = $attrs;
	this.$element = $element;
	this.$document = $document;
	this.crud = crud;
	this.deferred = $q.defer();

	this.sourceName = this.$scope.sourceName;
	this.columnsKeys = this.$scope.columnsKeys;
	this.rowsKey = this.$scope.rowsKey;
	this.type = this.$scope.type;
	this.groupKey = this.$scope.groupKey;

	this.data = null;
	this.table = null;
};


HereweareDatatableController.prototype.getData = function () {
	var _this = this;

	var resource;
	switch (this.sourceName) {
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
			console.log('HereweareDatatableController getData resolve');
			_this.data = data;
			_this.deferred.resolve('getData completed');
		}).catch(function(err) {
			//console.log('HereweareDatatable getData err: ' + JSON.stringify(err));
			console.log('HereweareDatatableController getData reject');
			_this.deferred.reject('getData ERR: ' + err);
		});
	}

	return _this;
};

HereweareDatatableController.prototype.getTable = function () {
	var _this = this;

	this.deferred.promise.then(function(success) {
		console.log('HereweareDatatableController getTable resolve data: ' + _this.data);
		_this.table = new HereweareTable(_this.data, _this.type,
				_this.columnsKeys, _this.rowsKey, _this.groupKey);
		_this.deferred.reject('getTable success');
	}).catch(function(failure) {
		console.log('getTable failure: ' + failure);
		_this.deferred.reject('getTable failure');
	});

	return _this;
};

HereweareDatatableController.prototype.compileDatatable = function () {
	var _this = this;

	this.deferred.promise.then(function(success) {
		try {
			console.log('HereweareDatatableController compileDatatable resolve');
			console.log('template: ' + _this.table.template);
			_this.$element.after(_this.table.template);
		 	_this.$compile(_this.table.template)(_this.$scope);
			_this.deferred.resolve('compile success');
		} catch (e) {
			_this.deferred.reject('compile failure');
		} finally {

		}
	}).catch(function(failure) {
		_this.deferred.reject('compile failure');
	});

	return _this;
};

/* -------------------- table -------------------------- */
var HereweareTable = function HereweareTable(data, type,
			columnsKeys, rowsKey, groupKey) {
	this.template = "";
	this.data = data;
	this.type = type;
	this.columnsKeys = columnsKeys;
	this.rowsKey = rowsKey;
	this.groupKey = groupKey;
	this.build();
};

HereweareTable.prototype.build = function() {
	console.log('build type: ' + this.type);
	this.template = '<table class="hereweare-datatable">';
	switch (this.type) {
		case 'simple':
			this.buildSimple.call(this);
			break;
		case 'grouped':
			this.buildGrouped.call(this);
			break;
		default:
			this.buildSimple.call(this);
			break;
	}
	this.template += '</table>';
};

HereweareTable.prototype.buildSimple = function() {
	console.log('buildSimple data: ' + this.data);
	if (this.data) {
		console.log('buildSimple');
		this.addHeader()
			.addBody();
	}
};

HereweareTable.prototype.buildGrouped = function() {
	if (this.data) {
		console.log('buildGrouped');
		this.addHeader()
			.addBody();
	}
};

HereweareTable.prototype.addHeader = function() {
	console.log('addHeader');
	this.template += '<thead>';
	this.template += '<tr><th>Name</th><th>Position</th></tr>';
	this.template += '</thead>';
	return this;
};

HereweareTable.prototype.addBody = function() {
	var _this = this;

	this.template += '<tbody>';
	if (this.rowsKey && this.data) {
		switch (this.type) {
			case 'simple':
				this.data[this.rowsKey.split('.')[0]].forEach(function(item) {
					_this.addBodyRow(item);
				});
				break;
			case 'grouped':
				this.data[this.rowsKey.split('.')[0]].forEach(function(groupItem) {
					_this.addGroupRow(groupItem);
					groupItem[_this.rowsKey.split('.')[1]].forEach(function(item) {
						_this.addBodyRow(item);
					});
				});
				break;
			default:

				break;
		}
	}
	this.template += '</tbody>';
	return this;
};

HereweareTable.prototype.addBodyRow = function(item) {
	var _this = this;

	if (item) {
		this.template += '<tr>';
		this.columnsKeys.split(',').forEach(function(key){
			_this.template += '<td>' + item[key] + '</td>';
		});
		this.template += '</tr>';
	}
};

HereweareTable.prototype.addGroupRow = function(groupItem) {
	if (groupItem) {
		console.log('groupItem: ' + JSON.stringify(groupItem));
		console.log('groupKey: ' + this.groupKey);
		this.template += '<tr class="hereweare-datatable-group-row">';
		this.template += '<td>' + groupItem[this.groupKey] + '</td>';
		this.template += '</tr>';
	}
};
