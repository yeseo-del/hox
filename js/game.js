angular.module('HexaClicker', [])
    .controller('GameCtrl', ['$scope', '$interval', function($scope, $interval) {
        $scope.credit = 0;

        $scope.prettify = function(number) {
            return prettify(number);
        }

        $scope.positionMap = {
            "-3": {
                "0": 34,
                "1": 33,
                "2": 32,
                "3": 31
            },
            "-2": {
                "-1": 35,
                "0": 17,
                "1": 16,
                "2": 15,
                "3": 30
            },
            "-1": {
                "-2": 36,
                "-1": 18,
                "0": 6,
                "1": 5,
                "2": 14,
                "3": 29
            },
            "0": {
                "-3": 19,
                "-2": 7,
                "-1": 1,
                "0": 0,
                "1": 4,
                "2": 13,
                "3": 28
            },
            "1": {
                "-3": 20,
                "-2": 8,
                "-1": 2,
                "0": 3,
                "1": 12,
                "2": 27
            },
            "2": {
                "-3": 21,
                "-2": 9,
                "-1": 10,
                "0": 11,
                "1": 26
            },
            "3": {
                "-3": 22,
                "-2": 23,
                "-1": 24,
                "0": 25
            }
        }

        $scope.getSlot = function(q, r) {
            return $scope.positionMap[q][r];
        }

        $scope.getPosition = function(slot) {
            for(var q = -3; q <= 3; q++) {
                for(var r = -3; r <= 3; r++) {
                    if($scope.positionMap[q][r] == slot) {
                        return {q: q, r: r};
                    }
                }
            }
        }

        var EFFECT = {
            "HORIZONTAL": 1,
            "AREA": 2
        }

        var DIRECTION = [
            { q: 0, r: -1 },
            { q: 1, r: -1 },
            { q: 1, r: 0 },
            { q: 0, r: 1 },
            { q: -1, r: 1 },
            { q: -1, r: 0 }
        ];

        $scope.getAffectedSlots = function(slot, type) {
            var slots = [];
            var pos = $scope.getPosition(slot);

            switch (type) {
                case EFFECT.HORIZONTAL:
                    for(var i = -3; i <= 3; i++) {
                        var s = $scope.getSlot(i, pos.r);
                        if(s != undefined) {
                            slots.push(s)
                        }
                    }
                    break;
                case EFFECT.AREA:
                    DIRECTION.forEach(function(direction) {
                        var s = $scope.getSlot( pos.q + direction.q, pos.r + direction.r );
                        if(s != undefined) {
                            slots.push(s);
                        }
                    });
                    break;
            }

            return slots;
        }

        $scope.currentLevel = 1;
        $scope.currentHp = 0;

        $scope.tier = 1;

        var EMPTY_SLOT = { id: 0, type: 0, color: "#373737", baseDps: 0, increase: 1.0, price: 0 };

        $scope.hexalist = [
            { id: 0, type: 1, color: "#ea8a00", baseDps: 10, increase: 1.1, price: 100, upgrade: 200, achieved: true},
            { id: 1, type: 1, color: "#bae272", baseDps: 20, increase: 1.1, price: 500, upgrade: 1000, achieved: false },
            { id: 2, type: 1, color: "#541a30", baseDps: 40, increase: 1.1, price: 1000, upgrade: 2000, achieved: false },
            { id: 3, type: 1, color: "#d9afd7", baseDps: 60, increase: 1.1, price: 2000, upgrade: 4000, achieved: false },
            { id: 4, type: 1, color: "#f1d888", baseDps: 80, increase: 1.1, price: 4000, upgrade: 8000, achieved: false },
            { id: 5, type: 1, color: "#586fa1", baseDps: 100, increase: 1.1, price: 8000, upgrade: 16000, achieved: false },
            { id: 6, type: 1, color: "#efeae2", baseDps: 200, increase: 1.1, price: 16000, upgrade: 32000, achieved: false },
            { id: 7, type: 1, color: "#00b0ff", baseDps: 400, increase: 1.1, price: 32000, upgrade: 64000, achieved: false },
            { id: 8, type: 1, color: "#84b096", baseDps: 600, increase: 1.1, price: 64000, upgrade: 128000, achieved: false }
        ]

        $scope.upgradeList = [
            { id: 0, type: 2, color: "#84b096", price: 1000, achieved: true, cooldown: 10, effect: { type: EFFECT.HORIZONTAL, dps: 2 }, description: "Horiz. DPS" },
            { id: 0, type: 2, color: "#d9afd7", price: 2000, achieved: true, cooldown: 5, effect: { type: EFFECT.AREA, dps: 2 }, description: "Area DPS" }
        ]


        $scope.hexaLevels = [
            1,1,1,1,1,1,1,1,1
        ]

        $scope.increaseTier = function() {
            $scope.tier += 1;
        }

        $scope.addCredit = function(amount) {
            $scope.credit += amount;
            $scope.checkAchieved();
        }

        $scope.slots = [
            {slot: 0, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 1, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 2, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 3, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 4, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 5, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 6, empty: true, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
            {slot: 7, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 8, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 9, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 10, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 11, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 12, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 13, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 14, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 15, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 16, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 17, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 18, empty: true, hexa: EMPTY_SLOT, tier: 2, cooldown: -1, effects: [], highlighted: false},
            {slot: 19, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 20, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 21, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 22, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 23, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 24, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 25, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 26, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 27, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 28, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 29, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 30, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 31, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 32, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 33, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 34, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 35, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false},
            {slot: 36, empty: true, hexa: EMPTY_SLOT, tier: 3, cooldown: -1, effects: [], highlighted: false}
        ];

        $scope.selectedHexaForPurchase = undefined;

        var buyHexa = function(event, hexa) {
            if($scope.credit >= hexa.price) {
                $scope.selectedHexaForPurchase = hexa;

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
            $scope.currentHp += $scope.getDPS() / 10;
            checkHp();
        }, 100);

        $interval(function(){
            $scope.slots.forEach(function(slot) {
                if(slot.cooldown > 0) {
                    slot.cooldown--;
                }

                if (slot.cooldown == 0) {
                    slot.cooldown--;

                    var affectedSlots = $scope.getAffectedSlots(slot.slot, slot.hexa.effect.type);
                    affectedSlots.forEach(function(affectedSlot){
                        var i = $scope.slots[affectedSlot].effects.indexOf(slot.slot);
                        if(i != -1) {
                            $scope.slots[affectedSlot].effects.splice(i, 1);
                        }
                    });
                }
            });
        }, 1000);

        $scope.checkAchieved = function() {
            for(var i = 0; i < $scope.hexalist.length - 1; i++) {
                if($scope.credit >= $scope.hexalist[i].price) {
                    $scope.hexalist[i+1].achieved = true;
                }
            }
        }

        var checkHp = function() {
            var level = $scope.getCurrentLevel();
            if($scope.currentHp >= level.hp) {
                $scope.credit += level.credit;
                $scope.currentLevel += 1;
                $scope.currentHp = 0;

                $scope.checkAchieved();
            }
        }

        $scope.getDPS = function() {
            var sum = 0;
            $scope.slots.forEach(function(slot) {
                if(slot.hexa.type == 1) {
                    var dps = slot.hexa.baseDps * (Math.pow(slot.hexa.increase, $scope.hexaLevels[slot.hexa.id] - 1));

                    slot.effects.forEach(function(index) {
                        dps *= $scope.slots[index].hexa.effect.dps;
                    });

                    sum += dps;
                }
            });

            return sum.toFixed(0);
        }

        $scope.highlight = function(selectedSlot, value) {
            var affectedSlots = $scope.getAffectedSlots(selectedSlot, $scope.slots[selectedSlot].hexa.effect.type);

            affectedSlots.forEach(function(slot) {
                $scope.slots[slot].highlighted = value;
            });
        }

    }])
    .directive('slot', function() {
        return {
            templateUrl: 'slot.html',
            scope: {
                slotData: '='
            },
            link: function($scope, element) {
                $scope.purchaseActive = false;

                $scope.$on('purchase', function(event, state){
                    $scope.purchaseActive = state;
                });

                $scope.selectSlot = function(id) {
                    if($scope.purchaseActive) {
                        $scope.$emit('slotSelected', id);
                    }
                }
            }
        };
    })

    .directive('hexa', function(){
        return {
            templateUrl: 'hexa.html',
            scope: {
            },
            link: function($scope, element) {

                $scope.calcDps = function(baseDps, increase, level){
                    return (baseDps * Math.pow(increase, level-1)).toFixed();
                }
            }
        };
    })

    .directive('upgrade', function(){
        return {
            templateUrl: 'upgrade.html',
            scope: {
            },
            link: function($scope, element) {
                $scope.activate = function() {
                    if($scope.$parent.slotData.cooldown <= 0) {
                        console.log('activate');
                        $scope.$parent.slotData.cooldown = $scope.$parent.slotData.hexa.cooldown;

                        var affectedSlots = $scope.$parent.$parent.getAffectedSlots($scope.$parent.slotData.slot, $scope.$parent.slotData.hexa.effect.type);
                        affectedSlots.forEach(function(slot) {
                            $scope.$parent.$parent.slots[slot].effects.push($scope.$parent.slotData.slot);
                        });
                    }
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
                hexaData: '='
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
    .filter('prettify', function(){
        return function(input) {
            return prettify(input);
        }
    })

    ;