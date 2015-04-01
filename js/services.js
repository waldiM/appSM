var swissServices = angular.module('swissServices', ['ngResource']);

// REST requests
swissServices.factory('REST', ['$resource', 'API_SERVER', 'Auth', function($resource, API_SERVER, Auth){
    return {
        // login
        Login: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'login', {}, {
                 get: {method:'POST', params:{email:null, password:null}}
            });
        },
        // portfolio
        Portfolio: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'portfolio/:portfolioId', {}, {
                 get: {method:'GET', params:{portfolioId: null}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // portfolio list
        PortfolioList: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'portfolioList', {}, {
                 get: {method:'GET', params:{}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // get short info about company
        CompanyShort: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'companyShort/:companyId/:companyKind', {companyId: '@companyId', companyKind: '@companykind'}, {
                 get: {method:'GET', params:{}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // get full info about company
        Company: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'company/:companyId/:companyKind', {companyId: '@companyId', companyKind: '@companykind'}, {
                 get: {method:'GET', params:{}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // get notes
        Notes: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'notes/:companyId/:companyKind', {}, {
                 get: {method:'GET', params:{companyId: null, companyKind: null}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // save note
        AddNote: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'addNote/:companyId/:companyKind', {companyId: '@companyId', companyKind:'@companyKind'}, {
                 save: {method:'POST', params:{subject: null, note: null, priority: null}, headers: { 'Accesstoken': token.hash } }
            });
        },
        // search company
        Search: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'search', {}, {
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


