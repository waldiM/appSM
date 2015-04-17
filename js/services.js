var swissServices = angular.module('swissServices', ['ngResource']);

// REST requests
swissServices.factory('REST', ['$resource', 'API_SERVER', 'Auth', function($resource, API_SERVER, Auth){
    return {
        // login
        Login: function(){
            return $resource(API_SERVER + 'api/rest/login', {}, {
                 get: {method:'POST', params:{email:null, password:null}}
            });
        },
        // forgotten password
        Forgot: function(){
            return $resource(API_SERVER + 'api/rest/forgotten', {}, {
                 get: {method:'POST', params:{email:null}}
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
        },
        // get items name for Private Company
        PrivateItems: function(){
            var token = Auth.get();
            return $resource(API_SERVER + 'api/rest/privateItems/:reportName', {}, {
                 get: {method:'GET', params:{reportName: null}, headers: { 'Accesstoken': token.hash } }
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
    var charts = {
        // z-score
        getZscore: function(companyId, companyKind){
            
            var token = Auth.get();
            
            var req = {
                method: 'GET',
                url: API_SERVER + 'ajax/charts/zScoreFormula/' + companyId + '/' + companyKind + '/A',
                headers: {'Accesstoken': token.hash}
            };
            
            $http(req).success(function(ret) {
                
                var ZA = ret.data.datasets[0].data;
                var Z=[];
                for(z in ZA){
                    Z[z] = parseFloat(ZA[z]);
                }

                var minY = 0;
                var maxY = 5;
                var minZ = Math.min.apply(Math, Z);
                var maxZ = Math.max.apply(Math, Z);

                if(minZ < minY){
                    minY = Math.floor(minZ - 1);
                }
                if(maxZ > maxY){
                    maxY = Math.floor(maxZ + 1);
                }

                var graphClass = '.graphZscore';
                var ctx = $(graphClass).children('.chart');
                $(graphClass).children('.loading').remove();
                
                ctx.highcharts({
                    chart: {
                        type: 'spline',
                        backgroundColor: 'transparent'
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        categories: ret.data.labels,
                        labels:{
                            rotation: ret.data.labels.length > 5 ? -45 : 0,
                            style: {
                                fontSize: '10px'
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: ''
                        },
                        min: minY,
                        max: maxY,
                        minorGridLineWidth: 0,
                        gridLineWidth: 0,
                        alternateGridColor: null,
                        plotBands: [{ 
                            from: -200,
                            to: 1.23,
                            color: '#E68484',
                            label: {
                                text: 'Distress zone',
                                style: {
                                    color: '#777777'
                                }
                            }
                        }, {
                            from: 1.23,
                            to: 2.9,
                            color: '#DDE8F1',
                            label: {
                                text: 'Neutral zone',
                                style: {
                                    color: '#777777'
                                }
                            }
                        }, {
                            from: 2.9,
                            to: 200,
                            color: '#90CD7F',
                            label: {
                                text: 'Safe zone',
                                style: {
                                    color: '#777777'
                                }
                            }
                        }]
                    },
                    plotOptions: {
                        spline: {
                            lineWidth: 4,
                            states: {
                                hover: {
                                    lineWidth: 5
                                }
                            },
                            marker: {
                                enabled: true
                            }
                        }
                    },
                    series: [{
                        showInLegend: false,
                        name: 'Z-score',
                        data: Z
                    }],
                    credits: {
                        enabled: false
                    },
                    navigation: {
                        menuItemStyle: {
                            fontSize: '10px'
                        }
                    },
                    tooltip: {

                        shared: true,
                        useHTML: true,

                        formatter: function() {
                                for(p in this.points){
                                    var s = '<span style="color:#666666">'+this.points[p].x+'</span><br><strong>'+this.points[p].series.name+' = '+this.points[p].y+'</strong><br>';
                                        s += 'Sum of:<br>';
                                        s += '0.718(Total current assets - Total current liabilities)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / Total assets<br>';
                                        s += '0.847(Retained earnings / Total assets)<br>';
                                        s += '3.107(LTM EBIT / Total assets)<br>';
                                        s += '0.420(Total equity / Total liabilities)<br>';
                                        s += '0.998(LTM revenue / Total assets)';
                                }
                                return s;
                        }
                    }
                });
            
            }); 
        
            return true;
        },
        
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
                var graphClass = '.graphNotes';
                var ctx = ($(graphClass).find('canvas')).get(0).getContext("2d");
                new Chart(ctx).Bar(ret.data, scaleSteps);
                $(graphClass).children('.loading').remove();
            });
            
            return true;
        },
        
        // news
        getNews: function(companyId, companyKind, companyName){
            var token = Auth.get();
            var req = {
                method: 'POST',
                url: API_SERVER + 'ajax/rss/index/1',
                headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                data: $.param({ companyId: companyId, companyKind: companyKind, query: companyName })
            };
            $http(req).success(function(ret) {
                //code from charts.js            
                var count = {negative: 0, positive: 0, neutral: 0};
                var countContent = ret.content ? Object.keys(ret.content).length : 0;

                for(c in ret.content) {

                    //if sentiment is saved in DB
                    if(ret.content[c].sentimentType){
                        count = this.newsCountSentiment(ret.content[c].sentimentType, count);
                        //wait until last request
                        if(count.negative + count.positive + count.neutral === countContent){
                            this.newsGetSentiment(count);
                        }
                    }
                    else{
                        var req2 = {
                            method: 'POST',
                            url: API_SERVER + 'ajax/charts/newsScore',
                            headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                            data: $.param({ text: ret.content[c].description, newsId: ret.content[c].newsId ? ret.content[c].newsId : null })
                        };
                        $http(req2).success(function(ret) {
                            if(ret.status == 'OK'){
                                count = this.newsCountSentiment(ret.docSentiment.type, count);
                            }
                            //wait until last request
                            if(count.negative + count.positive + count.neutral === countContent){
                                this.newsGetSentiment(count);
                            }
                        });
                    }
                }
            });
            
            //count sentiment news
            newsCountSentiment = function(type, count){
                if(type == 'negative'){
                    count.negative++;
                }
                else if(type == 'positive'){
                    count.positive++;
                }
                else{
                    count.neutral++;
                }    

                return count;
            };
            
            //show news on chart
            newsGetSentiment = function(newsScore){
                var req = {
                    method: 'POST',
                    url: API_SERVER + 'ajax/charts/news',
                    headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({ newsScore: newsScore })
                };
                $http(req).success(function(ret) {
                    var maxValue = Math.max(newsScore.negative, newsScore.positive, newsScore.neutral);
                    var step = Math.ceil(maxValue / 10);
                    var scaleSteps = {
                        scaleOverride : true,
                        scaleStartValue : 0,
                        scaleSteps : maxValue / step,
                        scaleStepWidth : step
                    };

                    var graphClass = '.graphNews';
                    var ctx = ($(graphClass).find('canvas')).get(0).getContext("2d");
                    new Chart(ctx).Bar(ret.data, scaleSteps);
                    $(graphClass).children('.loading').remove();
                });
            };
            
            return true;
        },
        
        //get items for financial report - CIQ
        //showItemId - number, false - not load chart, first - load chart for first itemId
        //specificFunction - callback function, or chart name for Private Companies
        getItems: function(companyId, companyKind, type, $scope, showItemId, cssClass, specificFunction, callBack){
            
            var token = Auth.get();
            
            this.getItems.loadGraph = function(){
                if(companyKind == 'ciq'){
                    if(showItemId == 'first'){
                        var firstItem = $scope.items[Object.keys($scope.items)[0]];
                        $scope.selectedItem = firstItem.id;
                        showItemId = firstItem.id;
                    }
                    if(specificFunction){
                        eval(specificFunction + '(type, $scope, cssClass)');
                    }
                    else{
                        charts.loadItem(showItemId, showItemId, 'custom_mobile_graph', type, $scope, cssClass);
                    }
                }
                else if(companyKind == 'private'){
                    if(specificFunction){
                        charts.chartPriv(specificFunction, $scope, cssClass);
                    }
                    if(callBack){
                        callBack();
                    }
                }
            };
            
            if(!$scope.items){
                var req = {
                        method: 'GET',
                        url: API_SERVER + 'financials/report/collection/' + type + '/' + companyKind + '/' + companyId + '/A/',
                        headers: {'Accesstoken': token.hash}
                };
                $http(req).success(function(ret) {
                    if(companyKind == 'ciq'){
                        $scope.dataCiq = $.extend(ret.ciqReport.items, ret.ciqToGraphs.items);
                        $scope.items = [];
                        for(r in ret.ciqReport.items){
                            $scope.items.push({
                                id: r, 
                                label: ret.ciqReport.items[r][Object.keys(ret.ciqReport.items[r])[0]].dataItemName
                            });
                        }
                    }
                    else if(companyKind == 'private'){
                        $scope.items = ret.values;
                    }
                    
                    $scope.loadingItems = true;
                    charts.getItems.loadGraph();

                });
            }
            else if (showItemId){
                charts.getItems.loadGraph();
            }
            
            return true;
        },
        
        //new custom graph for given item - CIQ
        loadItem: function(itemId, itemName, boxId, type, $scope, cssClass){
            var token = Auth.get();
            var dataCiq = {
                item: $scope.dataCiq[itemId],
                itemId: itemId,
                name: itemName,
                boxId: boxId,
                type: type ? type : 'risk'
            };
            var req = {
                    method: 'POST',
                    url: API_SERVER + 'ajax/charts/custom',
                    headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({ dataCiq: dataCiq })
            };
            $http(req).success(function(ret) {
                var graphClass = cssClass ? cssClass : '.graphCustom';
                var canvas = $(graphClass).find('.canvas');
                canvas.find('canvas').remove();
                canvas.html('<canvas width="320" height="160"></canvas>');
                var ctx = ($(graphClass).find('canvas')).get(0).getContext("2d");
                new Chart(ctx).Bar(ret.data, {});
            });
        },
        
        //new custom graph for given item - PRIVATE
        loadItemPriv: function(itemId, $scope, cssClass){
            var token = Auth.get();
            var req = {
                    method: 'POST',
                    url: API_SERVER + 'ajax/charts/customPrivate/' + itemId,
                    headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({ dataPrivate: $scope.items })
            };
            $http(req).success(function(ret) {
                var graphClass = cssClass ? cssClass : '.graphCustom';
                var canvas = $(graphClass).find('.canvas');
                canvas.find('canvas').remove();
                canvas.html('<canvas width="320" height="160"></canvas>');
                var ctx = ($(graphClass).find('canvas')).get(0).getContext("2d");
                new Chart(ctx).Bar(ret.data, {});
            });
            
            return true;
        },
        
        //Liquidity graph - calculatation are needed
        loadLiquidity: function(type, $scope, cssClass){
            var token = Auth.get();
            var dataCiq = {
                '1009': $scope.dataCiq['1009'],
                '1096': $scope.dataCiq['1096']
            };
            var req = {
                    method: 'POST',
                    url: API_SERVER + 'ajax/charts/liquidity/' + type,
                    headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({ dataCiq: dataCiq })
            };
            $http(req).success(function(ret) {
                var graphClass = cssClass;
                var ctx = ($(graphClass).find('canvas')).get(0).getContext("2d");
                new Chart(ctx).Bar(ret.data, {});
            });
            
        },
              
        //Private charts
        chartPriv: function(nameChart, $scope, cssClass){
            var token = Auth.get();
            var req = {
                    method: 'POST',
                    url: API_SERVER + 'ajax/charts/' + nameChart + '/private',
                    headers: {'Accesstoken': token.hash, 'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({ dataPrivate: $scope.items })
            };
            $http(req).success(function(ret) {
                var graphClass = cssClass;
                var ctx = ($(graphClass).find('canvas')).get(0).getContext("2d");
                new Chart(ctx).Bar(ret.data, {});
            });
            
        }

    };
    
    return charts;
}]);

