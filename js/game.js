angular.module('HexaClicker', [])
    .controller('GameCtrl', ['$scope', '$interval', function($scope, $interval) {
        $scope.credit = 0;

        $scope.currentLevel = 1;
        $scope.currentHp = 0;

        $scope.tier = 1;

        var EMPTY_SLOT = { id: 0, color: "#373737", baseDps: 0, increase: 1.0, price: 0 };

        $scope.hexalist = [
            { id: 0, color: "#ea8a00", baseDps: 3, increase: 1.1, price: 100, upgrade: 100 },
            { id: 1, color: "#bae272", baseDps: 10, increase: 1.1, price: 200, upgrade: 100 },
            { id: 2, color: "#541a30", baseDps: 20, increase: 1.1, price: 300, upgrade: 100 },
            { id: 3, color: "#d9afd7", baseDps: 30, increase: 1.1, price: 400, upgrade: 100 },
            { id: 4, color: "#f1d888", baseDps: 40, increase: 1.1, price: 500, upgrade: 100 },
            { id: 5, color: "#586fa1", baseDps: 50, increase: 1.1, price: 600, upgrade: 100 },
            { id: 6, color: "#efeae2", baseDps: 60, increase: 1.1, price: 700, upgrade: 100 },
            { id: 7, color: "#00b0ff", baseDps: 70, increase: 1.1, price: 800, upgrade: 100 },
            { id: 8, color: "#84b096", baseDps: 80, increase: 1.1, price: 900, upgrade: 100 }
        ]


        $scope.hexaLevels = [
            1,1,1,1,1,1,1,1,1
        ]

        $scope.increaseTier = function() {
            $scope.tier += 1;
        }

        $scope.addCredit = function(amount) {
            $scope.credit += amount;
        }

        $scope.slots = [
            {slot: 0, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 1, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 2, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 3, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 4, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 5, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 6, empty: true, hexa: EMPTY_SLOT, tier: 1},
            {slot: 7, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 8, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 9, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 10, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 11, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 12, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 13, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 14, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 15, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 16, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 17, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 18, empty: true, hexa: EMPTY_SLOT, tier: 2},
            {slot: 19, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 20, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 21, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 22, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 23, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 24, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 25, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 26, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 27, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 28, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 29, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 30, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 31, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 32, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 33, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 34, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 35, empty: true, hexa: EMPTY_SLOT, tier: 3},
            {slot: 36, empty: true, hexa: EMPTY_SLOT, tier: 3}
        ];

        $scope.selectedHexaForPurchase = undefined;

        var buyHexa = function(event, id) {
            console.log("buyHexa: ", id, " credit: ", $scope.credit, " price: ", $scope.hexalist[id].price);
            if($scope.credit >= $scope.hexalist[id].price) {
                $scope.selectedHexaForPurchase = $scope.hexalist[id];

                $scope.$broadcast('purchase', true);

                console.log("purchaseActive");
            }
        };

        $scope.$on('buyHexa', buyHexa);

        var upgradeHexa = function(event, id) {
            console.log("upgradeHexa: ", id);
            if($scope.credit >= $scope.hexalist[id].upgrade) {
                $scope.credit -= $scope.hexalist[id].upgrade;
                $scope.hexaLevels[id] += 1;
            }
        };

        $scope.$on('upgradeHexa', upgradeHexa);

        var selectSlotForPurchase = function(event, id) {
            $scope.slots[id].hexa = $scope.selectedHexaForPurchase;
            $scope.slots[id].empty = false;

            $scope.credit -= $scope.selectedHexaForPurchase.price;

            $scope.selectedHexaForPurchase = undefined;

            $scope.$broadcast('purchase', false);
        }

        $scope.$on('slotSelected', selectSlotForPurchase);

        $scope.hexaClick = function(index) {
            if($scope.purchaseActive) {
                $scope.slots[index] = $scope.selectedHexaForPurchase;
                $scope.credit -= $scope.getHexa($scope.selectedHexaForPurchase).price;
                $scope.purchaseActive = false;
                console.log($scope.slots);
            }
        }

        $scope.getCurrentLevel = function() {
            return $scope.levels[$scope.currentLevel-1];
        }

        $scope.getLevels = function(from, count) {
            return $scope.levels.slice(from-1, from-1 + count);
        }

        $scope.levels = [ ];

        for(var i = 1; i < 100; i++) {
            $scope.levels.push({ lvl: i, hp: i*100, credit: i*100})
        }

        $scope.clickerHexa = function() {
            $scope.currentHp += 10;
            checkHp();
        }

        $interval(function(){
            $scope.currentHp += $scope.getDPS();
            checkHp();
        }, 1000);

        var checkHp = function() {
            var level = $scope.getCurrentLevel();
            if($scope.currentHp >= level.hp) {
                $scope.credit += level.credit;
                $scope.currentLevel += 1;
                $scope.currentHp = 0;
            }
        }

        $scope.getDPS = function() {
            var sum = 0;
            $scope.slots.forEach(function(slot) {
                sum += slot.hexa.baseDps * (Math.pow(slot.hexa.increase, $scope.hexaLevels[slot.hexa.id] - 1));
            });

            //console.log(sum);

            return sum;
        }

    }])
    .directive('hexa', function() {
        return {
            templateUrl: 'slot.html',
            scope: {
                slotData: '=',
                currentTier: '=',
                hexaLevels: '='
            },
            link: function($scope, element) {
                console.log('slot ', $scope.currentTier, $scope.slotData.tier);
                $scope.purchaseActive = false;

                $scope.$on('purchase', function(event, state){
                    $scope.purchaseActive = state;
                });

                $scope.selectSlot = function(id) {
                    if($scope.purchaseActive) {
                        $scope.$emit('slotSelected', id);
                    }
                }

                $scope.calcDps = function(baseDps, increase, level){
                    return (baseDps * Math.pow(increase, level-1)).toFixed();
                }
            }
        };
    })
    .directive('clicker', function() {
        return {
            templateUrl: 'clicker.html'
        };
    })
    .directive('purchase', function() {
        return {
            templateUrl: 'purchase.html',
            scope: {
                hexaData: '=',
                hexaLevels: '='

            },
            link: function($scope, element) {
                $scope.buyHexa = function(id) {
                    $scope.$emit('buyHexa', id);
                }

                $scope.upgradeHexa = function(id) {
                    console.log('click upgradeHexa');
                    $scope.$emit('upgradeHexa', id);
                }

                $scope.calcDps = function(baseDps, increase, level){
                    return (baseDps * Math.pow(increase, level-1)).toFixed();
                }
            }
        };
    })

    ;