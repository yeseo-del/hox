angular.module('HexaClicker', [])
    .controller('GameCtrl', ['$scope', '$interval', function($scope, $interval) {
        $scope.SAVE_VERSION = 2;
        $scope.credit = 0;

        $scope.bossTimer = 0;

        $scope.prettify = function(number) {
            return prettify(number);
        }

/*        $scope.getPosition = function(slot) {
            for(var q = -3; q <= 3; q++) {
                for(var r = -3; r <= 3; r++) {
                    if($scope.positionMap[q][r] == slot) {
                        return {q: q, r: r};
                    }
                }
            }
        }*/

        $scope.selectedHexaForPurchase = undefined;

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
            if($scope.selectedHexaForPurchase != undefined){
                return;
            }
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
                var dps = $scope.getPureDPS();

                var dCredit = Math.floor(elapsedTime * dps / hp) * credit;
                $scope.credit += dCredit;
            }


            $interval(function() {
                window.localStorage.setItem('hexaclickertimestamp', Date.now());
            }, 1000);
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

            if($scope.currentLevel == 31) {
                $scope.tier = 2;
            } else if( $scope.currentLevel == 61 ) {
                $scope.tier = 3;
            }
        }

        $scope.changeLevel = function(value) {
            if(value == -1 && $scope.currentLevel == 1 || value == 1 && $scope.currentLevel == $scope.maxLevel) {
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
            if(confirm("Are you sure? You'll lose all your progress.")) {
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