angular.module('HexaClicker')
    .directive('slot', function() {
        return {
            templateUrl: 'js/directive/slot.html',
            scope: true,
            link: function(scope, element, attrs) {
                scope.slot = scope.Grid.getSlot(attrs.slotId);

                scope.buy = function() {
                    if(scope.selectedHexaForPurchase.price <= scope.Status.credit && scope.Status.power > 0) {
                        scope.slot.setHexaEntity(new HexaEntity(scope.selectedHexaForPurchase));
                        scope.Status.credit -= scope.selectedHexaForPurchase.price;
                        scope.Status.power -= 1;
                    }
                }
            }
        };
    });