angular.module('app', [
    'lbServices',
    'hwlog-service',
    'ngResource',
    'ui.router',
    'ngTable',
    'angucomplete-alt',
    'ngAnimate',
    'ngMaterial',
    'ngAria',
    'ngStorage',
    'dndLists',
    'ngCookies',
    'crudService',
    'common.services',
    'table.service',
    'riepiloghi',
    'export-service',
    'menu.directives'
  ]);

angular.module('common.services',[]);
angular.module('table.service',[]);
angular.module('riepiloghi', ['ngFileSaver']);
angular.module('export-service',[]);
angular.module('menu.directives', []);
