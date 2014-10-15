angular.module('HexaClicker')
    .directive('purchase', ['$rootScope', function($rootScope) {
        return {
            templateUrl: 'js/directive/purchase.html',
            scope: true,
            link: function(scope, element, attrs) {
                scope.hexa = scope.Data.getHexa(attrs.hexaId);
                scope.purchase = function() {
                    if(scope.selectedHexaForPurchase == scope.hexa) {
                        $rootScope.$broadcast('purchase', undefined);
                        return;
                    }

                    if(scope.hexa.price <= scope.Status.credit) {
                        $rootScope.$broadcast('purchase', scope.hexa);
                    }
                }
            }
        };
    }]);