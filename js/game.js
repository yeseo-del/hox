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
                        var dq = pos.q + direction.q;
                        var dr = pos.r + direction.r;

                        if(dq <= 3 && dq >= -3 && dr <= 3 && dr >= -3) {
                            var s = $scope.getSlot( dq, dr );
                            if(s != undefined) {
                                slots.push(s);
                            }
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
            { id: 0, type: 1, color: "#ea8a00", baseDps: 10, increase: 1.1, price: 100, upgrade: 200, upgradeIncrease: 1.1, achieved: true},
            { id: 1, type: 1, color: "#bae272", baseDps: 20, increase: 1.1, price: 500, upgrade: 1000, upgradeIncrease: 1.1, achieved: false },
            { id: 2, type: 1, color: "#541a30", baseDps: 40, increase: 1.1, price: 1000, upgrade: 2000, upgradeIncrease: 1.1, achieved: false },
            { id: 3, type: 1, color: "#d9afd7", baseDps: 60, increase: 1.1, price: 2000, upgrade: 4000, upgradeIncrease: 1.1, achieved: false },
            { id: 4, type: 1, color: "#f1d888", baseDps: 80, increase: 1.1, price: 4000, upgrade: 8000, upgradeIncrease: 1.1, achieved: false },
            { id: 5, type: 1, color: "#586fa1", baseDps: 100, increase: 1.1, price: 8000, upgrade: 16000, upgradeIncrease: 1.1, achieved: false },
            { id: 6, type: 1, color: "#efeae2", baseDps: 200, increase: 1.1, price: 16000, upgrade: 32000, upgradeIncrease: 1.1,achieved: false },
            { id: 7, type: 1, color: "#00b0ff", baseDps: 400, increase: 1.1, price: 32000, upgrade: 64000, upgradeIncrease: 1.1, achieved: false },
            { id: 8, type: 1, color: "#84b096", baseDps: 600, increase: 1.1, price: 64000, upgrade: 128000, upgradeIncrease: 1.1, achieved: false }
        ]

        $scope.upgradeList = [
            { id: 0, type: 2, color: "#84b096", price: 1000, achieved: true, cooldown: 10, effect: { type: EFFECT.HORIZONTAL, dps: 2 }, description: "Horiz. DPS" },
            { id: 1, type: 2, color: "#d9afd7", price: 2000, achieved: true, cooldown: 5, effect: { type: EFFECT.AREA, dps: 2 }, description: "Area DPS" }
        ]


        $scope.hexaLevels = [
            1,1,1,1,1,1,1,1,1
        ]

        $scope.calcByLevel = function(base, increase, level){
            return (base * Math.pow(increase, level-1)).toFixed();
        }

        $scope.slots = [
            {slot: 0, empty: false, hexa: EMPTY_SLOT, tier: 1, cooldown: -1, effects: [], highlighted: false},
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

        $scope.maxUpgrades = function() {
            switch ($scope.tier) {
                case 1:
                    return 1;
                case 2:
                    return 3;
                case 3:
                    return 6;
            }
        }

        $scope.selectedHexaForPurchase = undefined;

        $scope.emptySlotCount = function() {
            return emptySlots = $scope.slots.filter(function(slot){
                return slot.tier <= $scope.tier && slot.empty;
            }).length;
        }

        var buyHexa = function(event, hexa) {

            if(hexa.type == 2 && $scope.upgradeCount() >= $scope.maxUpgrades()) {
                return;
            }

            if($scope.credit >= hexa.price && emptySlots > 0) {
                $scope.selectedHexaForPurchase = hexa;

                $scope.$broadcast('purchase', true);

                console.log("purchaseActive");
            }
        };

        $scope.$on('buyHexa', buyHexa);

        var upgradeHexa = function(event, id) {
            console.log("upgradeHexa: ", id);
            var cost = $scope.calcByLevel($scope.hexalist[id].upgrade, $scope.hexalist[id].upgradeIncrease, $scope.hexaLevels[id]);
            if($scope.credit >= cost) {
                $scope.credit -= cost;
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

        var selectSlotForSell = function(event, id) {
            if($scope.slots[id].hexa.type == 2) {
                $scope.highlight(id, false);
                var affectedSlots = $scope.getAffectedSlots(id, $scope.slots[id].hexa.effect.type);
                affectedSlots.forEach(function(affectedSlot){
                    var i = $scope.slots[affectedSlot].effects.indexOf(id);
                    if(i != -1) {
                        $scope.slots[affectedSlot].effects.splice(i, 1);
                    }
                });
            }

            $scope.slots[id].hexa = EMPTY_SLOT;
            $scope.slots[id].empty = true;
            $scope.slots[id].cooldown = -1;
            $scope.slots[id].effects = [];
        }

        $scope.$on('slotSelectedForSell', selectSlotForSell);

        $scope.hexaClick = function(index) {
            if($scope.purchaseActive) {
                $scope.slots[index] = $scope.selectedHexaForPurchase;
                $scope.credit -= $scope.getHexa($scope.selectedHexaForPurchase).price;
                $scope.purchaseActive = false;
                console.log($scope.slots);
            }
        }

        $scope.sellActive = false;

        $scope.sellHexa = function(state) {
            $scope.sellActive = state;
            $scope.$broadcast('sell', state);
        }

        $scope.getCurrentLevel = function() {
            return { lvl: $scope.currentLevel, hp: (100 * Math.pow(1.1, $scope.currentLevel)).toFixed(0), credit: (100 * Math.pow(1.1, $scope.currentLevel))}
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

        $interval(function(){
            $scope.saveGame();
        }, 30000);

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

            if($scope.currentLevel == 21) {
                $scope.tier = 2;
            } else if( $scope.currentLevel == 51 ) {
                $scope.tier = 3;
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
            if($scope.slots[selectedSlot].hexa.type == 2) {
                var affectedSlots = $scope.getAffectedSlots(selectedSlot, $scope.slots[selectedSlot].hexa.effect.type);

                affectedSlots.forEach(function(slot) {
                    $scope.slots[slot].highlighted = value;
                });
            }
        }

        $scope.upgradeCount = function(){
            return $scope.slots.filter(function(slot){
                return slot.hexa.type == 2;
            }).length;
        }

        $scope.saveGame = function(){
            var saveObj = {};

            saveObj.credit = $scope.credit;
            saveObj.currentLevel = $scope.currentLevel;
            saveObj.tier = $scope.tier;
            saveObj.currentHp = $scope.currentHp;
            saveObj.hexaLevels = $scope.hexaLevels;
            saveObj.slots = [];

            $scope.slots.forEach(function(slot) {
                saveObj.slots.push({type: slot.hexa.type, id: slot.hexa.id, cooldown: slot.cooldown, empty: slot.empty, effects: slot.effects});
            });

            saveObj.hexalist = [];

            $scope.hexalist.forEach(function(hexa) {
                saveObj.hexalist.push({achieved: hexa.achieved});
            });

            console.log("SAVE: ", saveObj);
            window.localStorage.setItem("hexaclickersave", JSON.stringify(saveObj));
        }

        $scope.loadGame = function(){
            var saveObj = JSON.parse(window.localStorage.getItem("hexaclickersave"));

            if(saveObj != undefined) {
                console.log("LOAD: ", saveObj);

                $scope.credit = saveObj.credit;
                $scope.currentLevel = saveObj.currentLevel;
                $scope.tier = saveObj.tier;
                $scope.currentHp = saveObj.currentHp;
                $scope.hexaLevels = saveObj.hexaLevels;

                saveObj.slots.forEach(function(slot, index) {
                    if(slot.type == 1) {
                        $scope.slots[index].hexa = $scope.hexalist[slot.id];
                    } else if(slot.type == 2) {
                        $scope.slots[index].hexa = $scope.upgradeList[slot.id];
                    }
                    $scope.slots[index].cooldown = slot.cooldown;
                    $scope.slots[index].empty = slot.empty;
                    $scope.slots[index].effects = slot.effects;
                });

                saveObj.hexalist.forEach(function(hexa, index) {
                    $scope.hexalist[index].achieved = hexa.achieved;
                });
            } else {
                console.log('NO SAVE FOUND');
            }
        }

        $scope.loadGame();

    }])
    .directive('slot', function() {
        return {
            templateUrl: 'slot.html',
            scope: {
                slotData: '='
            },
            link: function($scope, element) {
                $scope.purchaseActive = false;
                $scope.sellActive = false;

                $scope.$on('purchase', function(event, state){
                    $scope.purchaseActive = state;
                });

                $scope.$on('sell', function(event, state){
                    $scope.sellActive = state;
                });

                $scope.selectSlotForSell = function(slot) {
                    if($scope.sellActive) {
                        $scope.$emit('slotSelectedForSell', slot);
                    }
                }

                $scope.selectSlot = function(slot) {
                    if($scope.purchaseActive) {
                        $scope.$emit('slotSelected', slot);
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

                $scope.calcDps = function(){
                    var dps = $scope.$parent.slotData.hexa.baseDps * (Math.pow($scope.$parent.slotData.hexa.increase, $scope.$parent.$parent.hexaLevels[$scope.$parent.slotData.hexa.id] - 1));

                    $scope.$parent.slotData.effects.forEach(function(index) {
                        dps *= $scope.$parent.$parent.slots[index].hexa.effect.dps;
                    });

                    return dps.toFixed();
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
                    if($scope.$parent.emptySlotCount() > 0) {
                        $scope.$emit('buyHexa', id);
                    }
                }

                $scope.upgradeHexa = function(id) {
                    console.log('click upgradeHexa');
                    $scope.$emit('upgradeHexa', id);
                }

                $scope.calcByLevel = function(base, increase, level){
                    return (base * Math.pow(increase, level-1)).toFixed();
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