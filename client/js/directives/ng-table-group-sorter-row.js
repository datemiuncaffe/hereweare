angular
	.module("ngTableCustom")
	.directive("ngTableGroupSorterRow", function() {
	   return {
         restrict: 'E',
         replace: true,
         templateUrl: 'templates/table/header/group-sorter-row.html',
         scope: true,
         controller: NgTableGroupSorterRowController,
         controllerAs: '$ctrl'
      };
	});

	var NgTableGroupSorterRowController = (function () {
		function NgTableGroupSorterRowController($scope) {
			this.$scope = $scope;
			this.groupFns = [];
		}
		NgTableGroupSorterRowController.prototype.sortBy = function ($column, event) {
			var parsedSortable = $column.sortable && $column.sortable();
			if (!parsedSortable || typeof parsedSortable !== 'string') {
			   return;
			}
			else {
			   var defaultSort = this.$scope.params.settings().defaultSort;
			   var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
			   var sorting = this.$scope.params.sorting() && this.$scope.params.sorting()[parsedSortable] && (this.$scope.params.sorting()[parsedSortable] === defaultSort);
			   var sortingParams = (event.ctrlKey || event.metaKey) ? this.$scope.params.sorting() : {};
			   sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);
			   this.$scope.params.parameters({
			   	sorting: sortingParams
			   });
			}
		};
		NgTableGroupSorterRowController.prototype.getGroupables = function () {
			var _this = this;
			if (this.groupFns != null && this.groupFns.length > 0) {
				return this.groupFns;
			} else {
				var groupables = this.$scope.$columns.filter(function ($column) {
					return !!$column.groupable(_this.$scope);
				}).map(function($column) {
					return $column.groupable(_this.$scope);
				});
				return this.groupFns.concat(groupables);
			}
		};
		NgTableGroupSorterRowController.prototype.groupBy = function (group) {
			if (this.isSelectedGroup(group)) {
				this.changeSortDirection(group);
			} else {
				this.$scope.params.group(group);
			}
		};
		NgTableGroupSorterRowController.prototype.getSelectedGroup = function() {
			return this.$scope.params.group();
		};
		NgTableGroupSorterRowController.prototype.isSelectedGroup = function (group) {
			return this.getSelectedGroup()[group] != null;
		};
		NgTableGroupSorterRowController.prototype.changeSortDirection = function (group) {
			var newDirection;
			if (this.$scope.params.hasGroup(group, 'asc')) {
				newDirection = 'desc';
			} else if (this.$scope.params.hasGroup(group, 'desc')) {
				newDirection = '';
			} else {
				newDirection = 'asc';
			}
			this.$scope.params.group(group, newDirection);
		};
		return NgTableGroupSorterRowController;
	}());

	NgTableGroupSorterRowController.$inject = ['$scope'];
