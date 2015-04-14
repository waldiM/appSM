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
    
    if(token.hash && token.hash != 0){
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

    $scope.onKeyPress = function($event) {
        if ($event.keyCode == 13) {
           $scope.loginAction();
        }
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
                $location.path('logout');
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
                    $location.path('logout');
                }
            }
        });
    };

    
    //load default portfolio on start
    loadPortfolio($routeParams.portfolioId ? $routeParams.portfolioId : null);

}]);

//Notes controller - read notes
swissCntls.controller('notesReadController', ['$scope', '$location', '$routeParams', 'REST', function($scope, $location, $routeParams, REST) {

    index.companyMenu();
    
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
                $location.path('logout');
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
    };

}]);

//Add new note
swissCntls.controller('addNoteController', ['$scope', '$routeParams', 'REST', function($scope, $routeParams, REST) { 

    index.companyMenu();
    
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
                $location.path('logout');
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
                $location.path('logout');
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
                $location.path('logout');
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
                        $location.path('logout');
                    }
                }
            });
        }
    };

}]);

//Report controller - Risk summary
swissCntls.controller('reportRiskController', ['$scope', '$location', '$routeParams', 'REST', 'CHART', function($scope, $location, $routeParams, REST, CHART) {

    index.companyMenu();
    
    $scope.loading = true;    
    
    REST.CompanyShort().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.company = ret.company;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('logout');
            }
        }
    });
    
    //show zscore
    $scope.chartZscore = function(){
        $scope.loadedZscore = CHART.getZscore($routeParams.companyId, $routeParams.companyKind.toLowerCase());
    }; 
    
    //show notes
    $scope.chartNotes = function(){
        $scope.loadedNotes = CHART.getNotes($routeParams.companyId, $routeParams.companyKind.toLowerCase());
    };
    
    //show news
    $scope.chartNews = function(){
        $scope.loadedNews = CHART.getNews($routeParams.companyId, $routeParams.companyKind.toLowerCase(), $scope.company.companyName);
    };

    //show any ratio
    $scope.chartRatio = function(){
        $scope.loadedRatio = CHART.getItems($routeParams.companyId, $routeParams.companyKind.toLowerCase(), 'ratio', $scope, 'first');
    };
    
    //load new item for graph
    $scope.changeItem = function(){
        CHART.loadItem($scope.selectedItem, $scope.selectedItem, 'custom_mobile_graph', 'ratio', $scope);
    };
    
}]);

//Report controller - P&L Statement
swissCntls.controller('reportPLController', ['$scope', '$location', '$routeParams', 'REST', 'CHART', function($scope, $location, $routeParams, REST, CHART) {

    index.companyMenu();
    
    $scope.ret = {};
    $scope.loading = true;    

    REST.CompanyShort().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.company = ret.company;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('logout');
            }
        }
    });

    var kind = $routeParams.companyKind.toLowerCase();
    
    //CIQ Companies
    //show Revenue
    $scope.chartRevenue = function(){
        $scope.loadedRevenue = CHART.getItems($routeParams.companyId, kind, 'income', $scope, 28, '.graphRevenue');
    };
    //show EBITDA Margin
    $scope.chartEbitda = function(){
        $scope.loadedEbitda = CHART.getItems($routeParams.companyId, kind, 'income', $scope, 4047, '.graphEbitda');
    };
    //show Net Income
    $scope.chartNet = function(){
        $scope.loadedNet = CHART.getItems($routeParams.companyId, kind, 'income', $scope, 15, '.graphNet');
    };
    //show any ratio
    $scope.chartRatio = function(){
        $scope.loadedRatio = CHART.getItems($routeParams.companyId, kind, 'income', $scope, 'first');
    };
    //load new item for graph
    $scope.changeItem = function(){
        CHART.loadItem($scope.selectedItem, $scope.selectedItem, 'custom_mobile_graph', 'income', $scope);
    };
    
    //Private Companies
    $scope.chartRevenuePriv = function(){
        $scope.loadedRevenue = CHART.getItemsPriv($routeParams.companyId, kind, 'income', $scope, 28, '.graphRevenue');
    };
    
}]);

//Report controller - Balance Sheet
swissCntls.controller('reportBalanceController', ['$scope', '$location', '$routeParams', 'REST', 'CHART', function($scope, $location, $routeParams, REST, CHART) {

    index.companyMenu();
    
    $scope.ret = {};
    $scope.loading = true;    

    REST.CompanyShort().get({companyId: $routeParams.companyId, companyKind: $routeParams.companyKind}, function(ret) {
        if(ret.status == 'ok'){
            $scope.company = ret.company;
            $scope.loading = false;
        }
        else{
            if(ret.logged == 'fail'){
                $location.path('logout');
            }
        }
    });

    //show Quick ratio
    $scope.chartQuick = function(){
        $scope.loadedQuick = CHART.getItems($routeParams.companyId, $routeParams.companyKind.toLowerCase(), 'balance', $scope, 4121, '.graphQuick');
    };
    
    //show Liquidity
    $scope.chartLiquidity = function(){
        $scope.loadedLiquidity = CHART.getItems($routeParams.companyId, $routeParams.companyKind.toLowerCase(), 'balance', $scope, true, '.graphLiquidity', 'charts.loadLiquidity');
    };
    
    //show Working Capital
    $scope.chartWorking = function(){
        $scope.loadedWorking = CHART.getItems($routeParams.companyId, $routeParams.companyKind.toLowerCase(), 'balance', $scope, 4165, '.graphWorking');
    };

    //show any ratio
    $scope.chartRatio = function(){
        $scope.loadedRatio = CHART.getItems($routeParams.companyId, $routeParams.companyKind.toLowerCase(), 'balance', $scope, 'first');
    };
    
    //load new item for graph
    $scope.changeItem = function(){
        CHART.loadItem($scope.selectedItem, $scope.selectedItem, 'custom_mobile_graph', 'income', $scope);
    };
}]);