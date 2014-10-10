angular.module('HexaClicker', [])
    .controller('GameCtrl', ['$scope', '$interval', function($scope, $interval) {
        $scope.SAVE_VERSION = 1;
        $scope.credit = 0;

        $scope.maxLevel = 1;
        $scope.kills = 0;
        $scope.farmMode = false;
        $scope.bossTimer = 0;

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
            { id: 0, type: 1, color: "#ea8a00", baseDps: 5, price: 50, upgrade: 50, upgradeIncrease: 1.07, achieved: true},
            { id: 1, type: 1, color: "#bae272", baseDps: 22, price: 250, upgrade: 250, upgradeIncrease: 1.07, achieved: false },
            { id: 2, type: 1, color: "#541a30", baseDps: 74, price: 1e+3, upgrade: 1e+3, upgradeIncrease: 1.07, achieved: false },
            { id: 3, type: 1, color: "#d9afd7", baseDps: 245, price: 4e+3, upgrade: 4e+3, upgradeIncrease: 1.07, achieved: false },
            { id: 4, type: 1, color: "#f1d888", baseDps: 976, price: 20e+3, upgrade: 20e+3, upgradeIncrease: 1.07, achieved: false },
            { id: 5, type: 1, color: "#586fa1", baseDps: 3725, price: 100e+3, upgrade: 100e+3, upgradeIncrease: 1.07, achieved: false },
            { id: 6, type: 1, color: "#efeae2", baseDps: 10.859e+3, price: 400e+3, upgrade: 400e+3, upgradeIncrease: 1.07, achieved: false },
            { id: 7, type: 1, color: "#00b0ff", baseDps: 47.143e+3, price: 2.5e+6, upgrade: 2.5e+6, upgradeIncrease: 1.07, achieved: false },
            { id: 8, type: 1, color: "#84b096", baseDps: 186e+3, price: 15e+6, upgrade: 15e+6, upgradeIncrease: 1.07, achieved: false },
            { id: 9, type: 1, color: "#FFF79A", baseDps: 782e+3, price: 100e+6, upgrade: 100e+6, upgradeIncrease: 1.07, achieved: false },
            { id: 10, type: 1, color: "#8882BE", baseDps: 3721e+3, price: 800e+6, upgrade: 800e+6, upgradeIncrease: 1.07, achieved: false },
            { id: 11, type: 1, color: "#6ECFF6", baseDps: 17010e+3, price: 6.5e+9, upgrade: 6.5e+9, upgradeIncrease: 1.07, achieved: false },
            { id: 12, type: 1, color: "#F6989D", baseDps: 69480e+3, price: 50e+9, upgrade: 50e+9, upgradeIncrease: 1.07, achieved: false },
            { id: 13, type: 1, color: "#FDC68A", baseDps: 460e+6, price: 450e+9, upgrade: 450e+9, upgradeIncrease: 1.07, achieved: false },
            { id: 14, type: 1, color: "#C4DF9B", baseDps: 3e+9, price: 4e+12, upgrade: 4e+12, upgradeIncrease: 1.07, achieved: false },
            { id: 15, type: 1, color: "#7EA7D8", baseDps: 20e+9, price: 36e+12, upgrade: 36e+12, upgradeIncrease: 1.07, achieved: false },
            { id: 16, type: 1, color: "#F49AC2", baseDps: 131e+9, price: 320e+12, upgrade: 320e+12, upgradeIncrease: 1.07, achieved: false },
            { id: 17, type: 1, color: "#F7977A", baseDps: 698e+9, price: 2.7e+15, upgrade: 2.7e+15, upgradeIncrease: 1.07, achieved: false },
            { id: 18, type: 1, color: "#8493CA", baseDps: 5330e+9, price: 24e+15, upgrade: 24e+15, upgradeIncrease: 1.07, achieved: false },
            { id: 19, type: 1, color: "#82CA9D", baseDps: 490e+12, price: 300e+15, upgrade: 300e+15, upgradeIncrease: 1.07, achieved: false },
            { id: 20, type: 1, color: "#C69C6E", baseDps: 1086e+12, price: 9e+18, upgrade: 9e+18, upgradeIncrease: 1.07, achieved: false },
            { id: 21, type: 1, color: "#7A0026", baseDps: 31e+15, price: 350e+18, upgrade: 350e+18, upgradeIncrease: 1.07, achieved: false },
            { id: 22, type: 1, color: "#8DC73F", baseDps: 917e+15, price: 14e+21, upgrade: 14e+21, upgradeIncrease: 1.07, achieved: false },
            { id: 23, type: 1, color: "#FFF467", baseDps: 1013e+18, price: 4199e+21, upgrade: 4199e+21, upgradeIncrease: 1.07, achieved: false },
            { id: 24, type: 1, color: "#00AEEF", baseDps: 74e+21, price: 2100e+24, upgrade: 2100e+24, upgradeIncrease: 1.07, achieved: false }
        ]

        $scope.upgradeList = [
            { id: 0, type: 2, color: "#586fa1", price: 1000, achieved: true, cooldown: 10, effect: { type: EFFECT.HORIZONTAL, dps: 2 }, description: "Horiz. DPS" },
            { id: 1, type: 2, color: "#ea8a00", price: 2000, achieved: true, cooldown: 5, effect: { type: EFFECT.AREA, dps: 2 }, description: "Area DPS" }
        ]


        $scope.hexaLevels = [
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
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
            var hp = ($scope.currentLevel % 5 == 0
                ? 10 * Math.pow( 1.6, $scope.currentLevel - 1) * 10
                : 10 * Math.pow( 1.6, $scope.currentLevel - 1)
            );

            var credit = ($scope.currentLevel % 5 == 0
                ? (10 * Math.pow( 1.6, $scope.currentLevel - 1) * 10) / 15 * 2
                : 10 * Math.pow( 1.6, $scope.currentLevel - 1) / 15 * 2
            );

            return { lvl: $scope.currentLevel, hp: hp, credit: credit, boss: $scope.currentLevel % 5 == 0 }
        }

        $scope.clickerHexa = function() {
            $scope.currentHp += 5 + $scope.getDPS() * 0.1;
            checkHp();
        }

        $scope.calcOfflineCredit = function() {
            var timestamp = window.localStorage.getItem('hexaclickertimestamp');
            if(timestamp != undefined){
                var hp = $scope.getCurrentLevel().hp;
                var credit = $scope.getCurrentLevel().credit;
                var elapsedTime = (Date.now() - timestamp) / 1000;
                var dps = $scope.getDPS();

                var dCredit = Math.floor(elapsedTime * dps / hp) * credit;
                console.log('elapsedTime: ', elapsedTime, " kills: ",Math.floor(elapsedTime * dps / hp));
                console.log("Offline credit earned: ",dCredit);
                $scope.credit += dCredit;
            }
        }

        var dpsTimestamp = Date.now();

        $interval(function(){
            $scope.currentHp += $scope.getDPS() * ((Date.now() - dpsTimestamp) / 1000);
            dpsTimestamp = Date.now();
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

        $interval(function() {
            window.localStorage.setItem('hexaclickertimestamp', Date.now());
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
                if(level.boss && $scope.kills < 1 || !level.boss && $scope.kills < 10) {
                    $scope.kills++;
                }

                $scope.currentHp = 0;

                if(level.boss && $scope.bossTimer > 0) {
                    $interval.cancel(bossTimerInterval);
                    $scope.bossTimer = 0;
                }

                if((level.boss && $scope.kills >= 1 || !level.boss && $scope.kills >= 10) && !$scope.farmMode) {
                    $scope.currentLevel += 1;
                    if($scope.maxLevel < $scope.currentLevel) {
                        $scope.maxLevel = $scope.currentLevel;
                    }
                    if($scope.currentLevel == $scope.maxLevel) {
                        $scope.kills = 0;
                    }
                }

                $scope.checkAchieved();
            }

            if($scope.getCurrentLevel().boss && $scope.bossTimer == 0) {
                $scope.startBossTimer();
            }

            if($scope.currentLevel == 30) {
                $scope.tier = 2;
            } else if( $scope.currentLevel == 60 ) {
                $scope.tier = 3;
            }
        }

        $scope.changeLevel = function(value) {
            if(value == -1 && $scope.currentLevel == 0 || value == 1 && $scope.currentLevel == $scope.maxLevel) {
                return;
            }

            if($scope.getCurrentLevel().boss && $scope.bossTimer > 0) {
                $interval.cancel(bossTimerInterval);
                $scope.bossTimer = 0;
            }

            $scope.currentLevel += value;
            $scope.currentHp = 0;

            if(value == -1) {
                $scope.kills = 10;
            }

            if($scope.currentLevel == $scope.maxLevel) {
                $scope.kills = 0;
            }
        }

        var bossTimerInterval = undefined;

        $scope.startBossTimer = function() {

            if($scope.bossTimer == 0) {
                $scope.bossTimer = 30;
            }

            bossTimerInterval = $interval(function(){
                $scope.bossTimer--;
                if($scope.bossTimer == 0) {
                    $interval.cancel(bossTimerInterval);
                    bossTimerInterval = undefined;
                    $scope.currentLevel--;
                    $scope.kills = 10;
                    $scope.currentHp = 0;
                    $scope.farmMode = true;
                }
            }, 1000);
        }

        $scope.getDPS = function() {
            var sum = 0;
            $scope.slots.forEach(function(slot) {
                if(slot.hexa.type == 1) {
                    var dps = slot.hexa.baseDps * $scope.hexaLevels[slot.hexa.id];

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

        $scope.resetGame = function() {
            if(confirm("Are you sure?")) {
                window.localStorage.removeItem("hexaclickersave");
                window.location.reload();
            }
        }

        $scope.saveGame = function(){
            var saveObj = {};

            saveObj.credit = $scope.credit;
            saveObj.currentLevel = $scope.currentLevel;
            saveObj.maxLevel = $scope.maxLevel;
            saveObj.kills = $scope.kills;
            saveObj.bossTimer = $scope.bossTimer;
            saveObj.farmMode = $scope.farmMode;
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
            window.localStorage.setItem("hexaclickersaveversion", $scope.SAVE_VERSION);
        }

        $scope.loadGame = function(){
            var saveObj = JSON.parse(window.localStorage.getItem("hexaclickersave"));
            var saveVersion = window.localStorage.getItem("hexaclickersaveversion");

            if(saveObj != undefined && saveVersion != undefined && saveVersion >= $scope.SAVE_VERSION) {
                console.log("LOAD: ", saveObj);

                $scope.credit = saveObj.credit;
                $scope.currentLevel = saveObj.currentLevel;
                $scope.maxLevel = saveObj.maxLevel;
                $scope.kills = saveObj.kills;
                $scope.bossTimer = saveObj.bossTimer;
                $scope.farmMode = saveObj.farmMode;
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

                if($scope.bossTimer > 0) {
                    $scope.startBossTimer();
                }
            } else {
                console.log('NO SAVE FOUND');
            }
        }

        $scope.loadGame();
        $scope.calcOfflineCredit();

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
                    var dps = $scope.$parent.slotData.hexa.baseDps * $scope.$parent.$parent.hexaLevels[$scope.$parent.slotData.hexa.id];

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

                $scope.preview = false;

                $scope.setPreview = function(value) {
                    $scope.preview = value;
                }

                $scope.buyHexa = function(id) {
                    if($scope.$parent.emptySlotCount() > 0) {
                        $scope.$emit('buyHexa', id);
                    }
                }

                $scope.upgradeHexa = function(id) {
                    console.log('click upgradeHexa');
                    $scope.$emit('upgradeHexa', id);
                }

                $scope.calcUpgrade = function(base, increase, level){
                    return (base * Math.pow(increase, level-1)).toFixed();
                }

                $scope.calcDps = function(base, level){
                    return (base * level).toFixed();
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