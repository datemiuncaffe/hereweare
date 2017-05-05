angular.module('menu.directives')
  .run(['$templateCache', function ($templateCache) {
     $templateCache.put('partials/menu-tree.tmpl.html',
      '<md-button class="md-button-toggle"\n' +
      '  ng-click="toggle()"\n' +
      '  aria-controls="docs-menu-{{section.name | nospace}}"\n' +
      '  flex layout="row"\n' +
      '  aria-expanded="{{isOpen()}}">\n' +
      '  {{section.name}}\n' +
      '  <span aria-hidden="true" class=" pull-right fa fa-chevron-down md-toggle-icon"\n' +
      '  ng-class="{\'toggled\' : isOpen()}"></span>\n' +
      '</md-button>\n' +
      '<ul ng-show="isOpen()" id="docs-menu-{{section.name | nospace}}" class="menu-toggle-list">\n' +
      '  <li ng-repeat="page in section.pages">\n' +
      '    <menu-link section="page" ng-if="page.type === \'link\'"></menu-link>\n' +
      '    <menu-tree section="page" ng-if="page.type === \'tree\'"></menu-tree>\n' +
      '  </li>\n' +
      '</ul>\n' +
      '');
    $templateCache.put('partials/menu-toggle.tmpl.html',
      '<md-button class="md-button-toggle"\n' +
      '  ng-click="toggle()"\n' +
      '  aria-controls="docs-menu-{{section.name | nospace}}"\n' +
      '  flex layout="row"\n' +
      '  aria-expanded="{{isOpen()}}">\n' +
      '  {{section.name}}\n' +
      '  <span aria-hidden="true" class=" pull-right fa fa-chevron-down md-toggle-icon"\n' +
      '  ng-class="{\'toggled\' : isOpen()}"></span>\n' +
      '</md-button>\n' +
      '<ul ng-show="isOpen()" id="docs-menu-{{section.name | nospace}}" class="menu-toggle-list">\n' +
      '  <li ng-repeat="page in section.pages">\n' +
      '    <menu-link section="page"></menu-link>\n' +
      '  </li>\n' +
      '</ul>\n' +
      '');
    $templateCache.put('partials/menu-link.tmpl.html',
      '<md-button ng-class="{\'{{section.icon}}\' : true}" \n' +
      '  ui-sref-active="active" \n' +
      '  ui-sref="{{section.state}}" ng-click="focusSection()">\n' +
      '  {{section | humanizeDoc}}\n' +
      '</md-button>\n' +
      '');
  }])
  .directive('menuTree', ['$timeout', function ($timeout ) {
      return {
         scope: {
            section: '='
         },
         templateUrl: 'partials/menu-tree.tmpl.html',
         controller:  MenuController
      };
  }])
  .directive('menuToggle', ['$timeout', function ($timeout ) {
      return {
         scope: {
            section: '='
         },
         templateUrl: 'partials/menu-toggle.tmpl.html',
         controller:  MenuController
      };
  }])
  .directive('menuLink', function () {
      return {
         scope: {
            section: '='
         },
         templateUrl: 'partials/menu-link.tmpl.html',
         controller:  MenuController
      };
  });

  MenuController.$inject = ['$scope', '$log', '$state', '$timeout', '$location', 'menu'];
  function MenuController($scope, $log, $state, $timeout, $location, menu) {
     console.log('MENU: ' + menu);

     $scope.isOpen = isOpen;
     $scope.toggle = toggle;
     $scope.focusSection = focusSection;
     $scope.autoFocusContent = false;
     $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
     };

     function isOpen() {
        return menu.isSectionSelected($scope.section);
     };
     function toggle() {
        console.log('pages: ' +
          JSON.stringify($scope.section.pages, null, '\t'));
        if ($scope.section.pages.length == 0) {
           getData($scope.section);
        }
        menu.toggleSelectSection($scope.section);
     };
     function focusSection() {
        //set flag to be used later when
        //$locationChangeSuccess calls openPage()
        $scope.autoFocusContent = true;
     };
     function getData(section) {
        if (section.id !== undefined) {
           menu.getProjects(section);
           //menu.getProjectsMock(section);
        } else { // root
           menu.getCustomers(section);
           //menu.getCustomersMock(section);
        }
     };
  }
