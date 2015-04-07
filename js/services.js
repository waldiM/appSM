var swissServices = angular.module('swissServices', ['ngResource']);

// REST requests
swissServices.factory('REST', ['$resource', 'API_SERVER', 'Auth', function($resource, API_SERVER, Auth){
    return {
        // login
        Login: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/login', {}, {
                 get: {method:'POST', params:{email:null, password:null}}
            });
        },
        // portfolio
        Portfolio: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/portfolio/:portfolioId', {}, {
                 get: {method:'GET', params:{portfolioId: null}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // portfolio list
        PortfolioList: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/portfolioList', {}, {
                 get: {method:'GET', params:{}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // get short info about company
        CompanyShort: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/companyShort/:companyId/:companyKind', {companyId: '@companyId', companyKind: '@companykind'}, {
                 get: {method:'GET', params:{}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // get full info about company
        Company: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/company/:companyId/:companyKind', {companyId: '@companyId', companyKind: '@companykind'}, {
                 get: {method:'GET', params:{}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // get notes
        Notes: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/notes/:companyId/:companyKind', {}, {
                 get: {method:'GET', params:{companyId: null, companyKind: null}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // save note
        AddNote: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/addNote/:companyId/:companyKind', {companyId: '@companyId', companyKind:'@companyKind'}, {
                 save: {method:'POST', params:{subject: null, note: null, priority: null}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // search company
        Search: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/search', {}, {
                 get: {method:'POST', params:{name: null}, headers: { 'Accesstoken': token.hash } }
            });
        }
    };
}]);

// save/get auth cookie
swissServices.factory('Auth', [function(){

    var ret = {};
    var nullToken = 0;
    
    ret.put = function(value) {
        localStorage.setItem('smAppToken', value);
        return true;
    };

    ret.get = function() {
        var smAppToken = localStorage.getItem('smAppToken');
        return {hash: smAppToken};
    };

    ret.logout = function(){
        localStorage.setItem('smAppToken', nullToken);
        return true;
    };

    return ret;
}]);

// Charts requests - ajax
swissServices.factory('CHART', ['$http', 'API_SERVER', 'Auth', function($http, API_SERVER, Auth){
    return {
        // notes
        getNotes: function(companyId, companyKind){
            var token = Auth.get();
            var req = {
                method: 'GET',
                url: API_SERVER + 'ajax/charts/notes/' + companyId + '/' + companyKind,
                headers: {'Accesstoken': token.hash}
                //data: { test: 'test' }
            };
            $http(req).success(function(ret) {
                var maxValue = Math.max(ret.data.datasets[0].data[0], ret.data.datasets[0].data[1], ret.data.datasets[0].data[2]);
                var step = Math.ceil(maxValue / 10);
                var scaleSteps = {
                    scaleOverride : true,
                    scaleStartValue : 0,
                    scaleSteps : maxValue / step,
                    scaleStepWidth : step
                };
                var ctx = ($('.graphNotes').find('canvas')).get(0).getContext("2d");
                var myBarChart = new Chart(ctx).Bar(ret.data, scaleSteps);
            });
            
            return true;
        }
    };
}]);

