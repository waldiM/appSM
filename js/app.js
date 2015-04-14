var swissApp = angular.module('swissApp', ['ngRoute', 'swissCntls', 'swissServices']);

//swissApp.constant('API_SERVER', 'http://localhost/sm/');
swissApp.constant('API_SERVER', 'http://rwd.swiss-metrics.com/');

swissApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'loginController'
        }).when('/logout', {
            templateUrl: 'partials/logout.html',
            controller: 'logoutController'
        }).when('/portfolio/:portfolioId?', {
            templateUrl: 'partials/portfolio.html',
            controller: 'portfolioController'
        }).when('/portfolio-list', {
            templateUrl: 'partials/portfolioList.html',
            controller: 'portfolioListController'
        }).when('/add-note/:companyId/:companyKind', {
            templateUrl: 'partials/addNote.html',
            controller: 'addNoteController'
        }).when('/notes/:companyId/:companyKind', {
            templateUrl: 'partials/notesRead.html',
            controller: 'notesReadController'
        }).when('/company-dashboard/:companyId/:companyKind', {
            templateUrl: 'partials/companyDashboard.html',
            controller: 'companyDashboardController'
        }).when('/company/:companyId/:companyKind', {
            templateUrl: 'partials/company.html',
            controller: 'companyController'
        }).when('/search', {
            templateUrl: 'partials/search.html',
            controller: 'searchController'
        }).when('/reportRisk/:companyId/:companyKind', {
            templateUrl: function(params){
                return 'partials/reportRisk-' + params.companyKind + '.html';
            },
            controller: 'reportRiskController'
        }).when('/reportPL/:companyId/:companyKind', {
            templateUrl: function(params){
                return 'partials/reportPL-' + params.companyKind + '.html';
            },
            controller: 'reportPLController'
        }).when('/reportBalance/:companyId/:companyKind', {
            templateUrl: function(params){
                return 'partials/reportBalance-' + params.companyKind + '.html';
            },
            controller: 'reportBalanceController'
        }).otherwise({
            redirectTo: '/home'
        });
}]);

