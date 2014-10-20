angular.module('HexaClicker')
    .directive('purchase', ['$rootScope', function($rootScope) {
        return {
            templateUrl: 'js/directive/purchase.html',
            scope: true,
            link: function(scope, element, attrs) {
                scope.hexa = scope.Data.getHexa(attrs.hexaId);

                scope.ableToPurchase = function() {
                    return scope.hexa.price <= scope.Status.credit;
                }

                scope.achieved = function() {
                    return scope.Status.achievedHexas.indexOf(scope.hexa.id) != -1;
                }

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