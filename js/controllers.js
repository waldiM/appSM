var swissCntls = angular.module('swissCntls', []);

//history back
swissCntls.directive( 'backButton', function() {
    return {
        restrict: 'A',
        link: function( scope, element, attrs ) {
            element.on( 'click', function () {
                history.back();
                scope.$apply();
            } );
        }
    };
});

//Login controller
swissCntls.controller('loginController', ['$scope', '$location', 'Auth', 'REST', function($scope, $location, Auth, REST) {

    index.stickBottom();

    //if is logged redirect to portfolio
    var token = Auth.get();
    
    if(token.hash != 0){
        $location.path('portfolio');
    }
    
    $scope.loginAction = function(){
        $scope.loginError = '';
        REST.Login().get({email: $scope.authEmail, password: $scope.authPassword}, function(ret) {
            if(ret.status == 'ok'){
                Auth.put(ret.data.token);
                $location.path('portfolio');
            }
            else{
                $scope.loginError = ret.error;
            }
        });
    };

}]);

//Logout
swissCntls.controller('logoutController', ['$location', 'Auth', function($location, Auth) {

    index.stickBottom();
    Auth.logout();

}]);

//Portfolio controller - my portfolios
swissCntls.controller('portfolioListController', ['$scope', '$location', 'REST', function($scope, $location, REST) {

    $scope.portfolios = [];

    $scope.loading = true;
    REST.PortfolioList().get({}, function(ret) {
        if(ret.status == 'ok'){
            $scope.portfolios = ret.portfolios;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('home');
            }
        }
    });

}]);

//Portfolio controller - list companies
swissCntls.controller('portfolioController', ['$scope', '$location', '$routeParams', 'REST', function($scope, $location, $routeParams, REST) {

    $scope.companies = [];
    $scope.portfolios = [];
    $scope.select = {selected: null};  

    loadPortfolio = function(choosenPortfolio){
        $scope.loading = true;
        REST.Portfolio().get({portfolioId: choosenPortfolio}, function(ret) {
            if(ret.status == 'ok'){
                $scope.companies = ret.companies;
                $scope.portfolio = ret.portfolio;
                $scope.loading = false;
            }
            else{
                if(ret.logged == 'fail'){
                    $location.path('home');
                }
            }
        });
    };

    
    //load default portfolio on start
    loadPortfolio($routeParams.portfolioId ? $routeParams.portfolioId : null);

}]);

//Notes controller - read notes
swissCntls.controller('notesReadController', ['$scope', '$location', '$routeParams', 'REST', function($scope, $location, $routeParams, REST) {

    $scope.notes = {};
    $scope.company = {};
    $scope.loading = true;    

    REST.Notes().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.notes = ret.notes;
            $scope.company = ret.company;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('home');
            }
        }
    });
    
    //format date to Unix time
    $scope.unixDate = function(dateStr){
        var dStr = dateStr.split(' ');
        var hStr = dStr[1].split(':');
        d = new Date(dStr[0]);
        d.setHours(hStr[0]);
        d.setMinutes(hStr[1]);
        return d.getTime();
    }

}]);

//Add new note
swissCntls.controller('addNoteController', ['$scope', '$routeParams', 'REST', function($scope, $routeParams, REST) { 

    $scope.saveOk = false;
    $scope.loading = true;
    $scope.addPriority = 3;
    $scope.company = {};

    //get company info
    REST.CompanyShort().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.company = ret.company;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('home');
            }
        }
    });

    //save note
    $scope.saveNoteAction = function(priority){
        if(!$scope.addSubject){
            $scope.saveError = 'Enter subject.';
        }
        else if(!$scope.addText){
            $scope.saveError = 'Enter message.';
        }
        else{
            REST.AddNote().save({
                companyId: $routeParams.companyId, companyKind: $routeParams.companyKind,
                subject: $scope.addSubject, note: $scope.addText, traffic: priority}, function(ret) {
                if(ret.status == 'ok'){
                    $scope.saveOk = true;
                    $scope.loading = false;
                    $scope.errorMessage = 'Your note has been added.';
                }
                else{
                    $scope.saveOk = true;
                    $scope.errorMessage = 'An error occurred, please try again.';
                }
            });

            
        }
    };
    
}]);

//Company controller - dashboard
swissCntls.controller('companyDashboardController', ['$scope', '$location', '$routeParams', 'REST', function($scope, $location, $routeParams, REST) {

    $scope.ret = {};
    $scope.loading = true;    

    REST.CompanyShort().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.company = ret.company;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('home');
            }
        }
    });

}]);

//Company controller - detal info
swissCntls.controller('companyController', ['$scope', '$location', '$routeParams', 'REST', function($scope, $location, $routeParams, REST) {

    $scope.ret = {};
    $scope.loading = true;    

    REST.Company().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.ret = ret.company;
            $scope.tickers = ret.ticker;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('home');
            }
        }
    });

}]);

//Search company
swissCntls.controller('searchController', ['$scope', '$location', 'REST', function($scope, $location, REST) {

    $scope.companies = [];

    $scope.searchAction = function(){
        if(!$scope.searchedTxt){
            $scope.error = 'Enter company name.';
        }
        else{
            $scope.loading = true;
            REST.Search().get({name: $scope.searchedTxt}, function(ret) {
                if(ret.status == 'ok'){
                    $scope.companies = ret.companies;
                    $scope.loading = false;
                }
                else{
                    if(ret.logged == 'fail'){
                        $location.path('home');
                    }
                }
            });
        }
    };

}]);