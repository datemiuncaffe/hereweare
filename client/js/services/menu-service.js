(function(){
  'use strict';

  angular.module('common.services')
    .factory('menu', ['$location', 'crud', function ($location, crud) {

    var sections = {
      verticalSections: [
        {name: 'Overview', type: 'link', state: 'overview'},
        {name: 'Ricerca', type: 'link', state: 'ricerca'},
        {name: 'Progetti', type: 'toggle', pages: [
          {name: 'Attivi', type: 'link', state: 'activeprojects', icon: ''},
          {name: 'Interni', type: 'link', state: 'senseiprojects', icon: ''},
          {name: 'Nuovi', type: 'link', state: 'newprojects', icon: ''}]
        },
        {name: 'Riepilogo dipendenti', type: 'toggle', pages: [
          {name: 'Ore mese', type: 'link', state: 'oremese', icon: ''},
          {name: 'GG commessa dip.', type: 'link', state: 'giornicommessautente', icon: ''},
          {name: 'GG dip. commentati', type: 'link', state: 'giornicommessautentewithcomments', icon: ''}]
        },
        {name: 'Riepilogo commesse', type: 'toggle', pages: [
          {name: 'GG commessa', type: 'link', state: 'giornicommessa', icon: ''},
          {name: 'GG erogate', type: 'link', state: 'giorni', icon: ''},
          {name: 'GG cliente', type: 'link', state: 'giornicliente', icon: ''},
          {name: 'GG cliente progetto', type: 'link', state: 'giorniclienteprogetto', icon: ''}]
        },
        {name: 'Reporting', type: 'toggle', pages: [
          {name: 'Per dipendente', type: 'link', state: 'employeefilter', icon: ''}]
        },
        {name: 'Budgets', type: 'tree', pages: []},
		  {name: 'Working', type: 'toggle', pages: [
		    {name: 'Costi interni', type: 'link', state: 'employeecosts', icon: ''}]
        },
        {name: 'Migrate', type: 'link', state: 'migrateehourtables'}
      ],
      orizontalSections: [
        {name: 'Overview', type: 'link', state: 'overview'},
        {name: 'Ricerca', type: 'link', state: 'ricerca'},
        {name: 'Progetti', type: 'toggle', width: '400px', pages: [
          {name: 'Attivi', type: 'link', state: 'activeprojects', icon: ''},
          {name: 'Interni', type: 'link', state: 'senseiprojects', icon: ''},
          {name: 'Nuovi', type: 'link', state: 'newprojects', icon: ''}]
        },
        {name: 'Riepilogo dipendenti', type: 'toggle', pages: [
          {name: 'Ore mese', type: 'link', state: 'oremese', icon: ''},
          {name: 'GG commessa dip.', type: 'link', state: 'giornicommessautente', icon: ''},
          {name: 'GG dip. commentati', type: 'link', state: 'giornicommessautentewithcomments', icon: ''}]
        },
        {name: 'Riepilogo commesse', type: 'toggle', pages: [
          {name: 'GG commessa', type: 'link', state: 'giornicommessa', icon: ''},
          {name: 'GG erogate', type: 'link', state: 'giorni', icon: ''},
          {name: 'GG cliente', type: 'link', state: 'giornicliente', icon: ''},
          {name: 'GG cliente progetto', type: 'link', state: 'giorniclienteprogetto', icon: ''}]
        },
        {name: 'Reporting', type: 'toggle', pages: [
          {name: 'Per dipendente', type: 'link', state: 'employeefilter', icon: ''}]
        },
        {name: 'Migrate', type: 'link', state: 'migrateehourtables'}
      ]
    };

    var self;
    return self = {
      sections: sections,
      openedSections: [],

      toggleSelectSection: function (section) {
        var idx = self.openedSections.indexOf(section.name);
        if (idx > -1) {
          self.openedSections.splice(idx, 1);
        } else {
          self.openedSections.push(section.name);
        }
      },
      isSectionSelected: function (section) {
        return self.openedSections.indexOf(section.name) > -1;
      },
      getCustomers: function(budgets) {
        crud.GET.EHOUR.getCustomers().then(function(customers) {
          customers.forEach(function(customer) {
            var customerSection = {
              id: customer.id,
              name: customer.name,
              type: 'tree',
              pages: []
            };
            budgets.pages.push(customerSection);
          });
        });
      },
      getProjects: function(section) {
        crud.GET.EHOUR.getProjectsByCustomerId({ customerId: section.id })
            .then(function(projects) {
          sortProjectsByName(projects);
          projects.forEach(function(project) {
            var link = "projectmodify({" +
    									 "customerId: " + section.id + "," +
    									 "customerName: '" + section.name + "'," +
    									 "projectId: " + project.id + "," +
    									 "projectName: '" + project.name + "'," +
    									 "projectCode: '" + project.code + "'" +
    									 "})";
            var projectSection = {
              id: project.id,
              code: project.code,
              name: project.name,
              type: 'link',
              state: link,
              icon: ''
            };
            section.pages.push(projectSection);
          });
        });
      },
      getCustomersMock: function(budgets) {
        var customers = [
          {id: 1, name: 'Assenze', type: 'tree', pages: []},
          {id: 2, name: 'Climate', type: 'tree', pages: []},
          {id: 3, name: 'Continental', type: 'tree', pages: []}
        ];
        customers.forEach(function(customer) {
          var customerSection = {
            id: customer.id,
            name: customer.name,
            type: 'tree',
            pages: []
          };
          budgets.pages.push(customerSection);
        });
      },
      getProjectsMock: function(section) {
        var projects = null;
        if (section.id === 1) {
          projects = [
            {id: 1, name: 'Donazione sangue', type: 'link', icon: ''},
            {id: 2, name: 'Esami uni', type: 'link', icon: ''},
            {id: 3, name: 'Ferie', type: 'link', icon: ''},
            {id: 4, name: 'Lutto', type: 'link', icon: ''}
          ];
        } else if (section.id === 2) {
          projects = [
            {id: 1, name: '203 Mail', type: 'link', icon: ''},
            {id: 2, name: 'CR Varie', type: 'link', icon: ''},
            {id: 3, name: 'Supporto', type: 'link', icon: ''}
          ];
        } else {
          projects = [
            {id: 1, name: 'Bus F1', type: 'link', icon: ''},
            {id: 2, name: 'Catalogo online', type: 'link', icon: ''},
            {id: 3, name: 'CR Leaseplan', type: 'link', icon: ''}
          ];
        }
        projects.forEach(function(project) {
          var projectSection = {
            id: project.id,
            code: project.code,
            name: project.name,
            type: 'link',
            state: '',
            icon: ''
          };
          section.pages.push(projectSection);
        });
      }
    };

    function sortProjectsByName(projects) {
      projects.sort(function(a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        return nameA < nameB ? -1 : (nameA > nameB ? 1 : 0);
      });
    };

  }]);

})();
