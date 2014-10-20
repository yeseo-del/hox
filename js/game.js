angular.module('HexaClicker', [])
    .controller('GameCtrl', ['$scope', '$interval', 'Progress', 'Grid', 'Data', 'Status', function($scope, $interval, Progress, Grid, Data, Status) {

        $scope.Grid = Grid;

        $scope.Grid.setGrid(0);

        $scope.Progress = Progress.getProgress();

        $scope.Progress.setLevel(1);

        $scope.Status = Status.getStatus();

        $scope.Data = Data;

        $scope.selectedHexaForPurchase = undefined;

        $scope.selectedSlot = undefined;

        $scope.selectSlot = function(slot) {
            $scope.selectedSlot = slot;
        }

        $scope.buyHexa = function(slot) {
            if($scope.selectedHexaForPurchase.price <= $scope.Status.credit) {
                slot.setHexaEntity(new HexaEntity($scope.selectedHexaForPurchase));
                $scope.Status.credit -= $scope.selectedHexaForPurchase.price;

                //Activate passive effect
                if($scope.selectedHexaForPurchase.type == 2 && !$scope.selectedHexaForPurchase.active) {
                    $scope.Grid.getGrid().getAffectedSlots(slot).forEach(function(affectedSlot) {
                        affectedSlot.effects.push(slot);
                    });
                }

                $scope.canContinuePurchase();
            }
        }

        $scope.sellSlot = function(slot) {
            $scope.Status.addCredit(slot.hexaEntity.sellPrice());


            removeEffectOfSlot(slot);

            slot.hexaEntity = undefined;
        }

        var removeEffectOfSlot = function(slot) {
            $scope.Grid.getGrid().getAffectedSlots(slot).forEach(function(affectedSlot) {
                affectedSlot.effects.splice(affectedSlot.effects.indexOf(slot.id), 1);
            });
        }

        $scope.highlight = function(slot) {
            $scope.Grid.getGrid().getAffectedSlots(slot).forEach(function(highlightedSlot) {
                $scope.highlighted.push(highlightedSlot.id);
            });
        }

        $scope.activateSlot = function(activatedSlot) {
            var affected = activatedSlot.getAffectedPositions();
            affected.forEach(function(position) {
                var slot = $scope.Grid.getGrid().getSlotByPos(position);
                if(slot != undefined) {
                    slot.effects.push(activatedSlot);
                }
            });

            activatedSlot.hexaEntity.activateTimers();
        }

        $scope.clearHighlight = function() {
            $scope.highlighted = [];
        }

        $scope.highlighted = [];

        $scope.selectedPurchaseList = 1;

        $scope.click = function() {
            $scope.Progress.currentLevel.dealDamage(50 + $scope.Grid.getGrid().getDPS() * 0.1);
        }

        $scope.toggleProgress = function() {
            $scope.Progress.progressMode = !$scope.Progress.progressMode;
        }

        $scope.canContinuePurchase = function() {
            if($scope.Grid.getGrid().emptySlotCount() == 0
                || $scope.Status.credit < $scope.selectedHexaForPurchase.price) {
                $scope.selectedHexaForPurchase = undefined;
            }
        }

        $scope.checkAchievedHexas = function() {
            var hexas = $scope.Data.getHexas(Hexa.TYPE.DPS);
            hexas.forEach(function(hexa, index) {
                if(hexa.price <= $scope.Status.credit && $scope.Status.achievedHexas.indexOf(hexas[index + 1].id) == -1) {
                    console.log("Achieved hexa: ", hexa.id);
                    $scope.Status.achievedHexas.push(hexas[index + 1].id);
                }
            });
        }

        $scope.$on('kill', function(event) {
            console.log('onKill');
            $scope.Status.addCredit($scope.Progress.currentLevel.credit);
            $scope.checkAchievedHexas();
        });

        $scope.$on('purchase', function(event, hexa) {
            console.log('onPurchase', hexa);
            $scope.selectedHexaForPurchase = hexa;
        });

        $scope.$on('changelevel', function(event, level) {
            switch(level) {
                case 3:
                    $scope.Status.tier = 2;
                    break;
                case 5:
                    $scope.Status.tier = 3;
                    break;
            }
        });

        $scope.$on('gridchange', function(event) {
            $scope.selectedHexaForPurchase = undefined;
            $scope.selectedSlot = undefined;
        });

        //DPS
        var dpsTimestamp = Date.now();
        var dpsInterval = $interval(function(){
            $scope.Progress.currentLevel.dealDamage($scope.Grid.getDPS(true) * ((Date.now() - dpsTimestamp) / 1000));
            dpsTimestamp = Date.now();
        },100);

        var timerInterval = $interval(function(){
            $scope.Grid.grids.forEach(function(grid) {
                grid.slots.forEach(function(slot){
                    if(slot.hexaEntity) {
                        if(slot.hexaEntity.cooldown > 0) {
                            slot.hexaEntity.cooldown--;
                        }
                        if(slot.hexaEntity.duration > 0) {
                            slot.hexaEntity.duration--;
                            if(slot.hexaEntity.duration == 0) {
                                removeEffectOfSlot(slot);
                            }
                        }
                    }
                });
            });

        },1000);

        $scope.saveGame = function(){
            var saveObj = {};

            //------
            saveObj.credit = $scope.Status.credit;
            saveObj.currentLevel = $scope.Progress.currentLevel.level;
            saveObj.maxLevel = $scope.Progress.maxLevel;
            saveObj.kills = $scope.Progress.currentLevel.kills;
            saveObj.currentHp = $scope.Progress.currentLevel.currentHp;
            saveObj.progressMode = $scope.Progress.progressMode;
            if($scope.Progress.currentLevel.bossTimer) {
                saveObj.bossTimer = $scope.Progress.currentLevel.bossTimer.time;
            }
            saveObj.tier = $scope.Status.tier;

            var grids = [];
            $scope.Grid.grids.forEach(function(grid) {
                var gridsave = { slots: []};

                grid.slots.forEach(function(slot) {
                    var slotsave = { effects: [] };

                    if(slot.hexaEntity) {
                        slotsave.hexaEntity = {hexaId: slot.hexaEntity.hexa.id, level: slot.hexaEntity.level,
                            cooldown: slot.hexaEntity.cooldown, duration: slot.hexaEntity.duration};
                    }

                    slot.effects.forEach(function(effectslot) {
                        slotsave.effects.push(effectslot.id);
                    })

                    gridsave.slots.push(slotsave);
                });

                grids.push(gridsave);
            })

            saveObj.grids = grids;

            //------
            //console.log("Save: ", saveObj);
            window.localStorage.setItem("hexaclickersave", JSON.stringify(saveObj));
            window.localStorage.setItem("hexaclickersaveversion", $scope.SAVE_VERSION);
        }

        $scope.loadGame = function(){
            var saveObj = JSON.parse(window.localStorage.getItem("hexaclickersave"));
            var saveVersion = window.localStorage.getItem("hexaclickersaveversion");

            if(saveObj != undefined && saveVersion != undefined && saveVersion >= $scope.SAVE_VERSION) {
                console.log("LOAD: ", saveObj);

                $scope.Status.credit = saveObj.credit;
                $scope.Progress.setLevel(saveObj.currentLevel);
                $scope.Progress.maxLevel = saveObj.maxLevel;
                $scope.Progress.currentLevel.kills = saveObj.kills;
                $scope.Progress.currentLevel.currentHp = saveObj.currentHp;
                $scope.Progress.progressMode = saveObj.progressMode;
                if(saveObj.bossTimer) {
                    $scope.Progress.currentLevel.startBossTimer(saveObj.bossTimer);
                }
                $scope.Status.tier = saveObj.tier;

                if(saveObj.grids.length > 1) {
                    for(var i = 0; i < saveObj.grids.length - 1; i++) {
                        var grid = new Grid();
                        $scope.Grid.grids.push(grid);
                    }
                }

                saveObj.grids.forEach(function(gridsave, gindex){
                    gridsave.slots.forEach(function(slotsave, sindex) {
                        var slot = $scope.Grid.grids[gindex].slots[sindex];

                        if(slotsave.hexaEntity) {
                            slot.hexaEntity = new HexaEntity($scope.Data.getHexa(slotsave.hexaEntity.hexaId));
                            slot.hexaEntity.level = slotsave.hexaEntity.level;
                            slot.hexaEntity.cooldown = slotsave.hexaEntity.cooldown;
                            slot.hexaEntity.duration = slotsave.hexaEntity.duration;
                        }

                        slotsave.effects.forEach(function(id) {
                            slot.effects.push($scope.Grid.grids[gindex].slots[id]);
                        });
                    });
                });
            } else {
                console.log('NO SAVE FOUND');
            }
        }

        $scope.SAVE_VERSION = 3;

        $scope.prettify = function(number) {
            return prettify(number);
        }

         var saveInterval = $interval(function(){
            $scope.saveGame();
         }, 1000);

        $scope.calcOfflineCredit = function() {
            var timestamp = window.localStorage.getItem('hexaclickertimestamp');
            if(timestamp != undefined){
                var hp = $scope.Progress.currentLevel.hp;
                var credit = $scope.Progress.currentLevel.credit;
                var elapsedTime = (Date.now() - timestamp) / 1000;
                var dps = $scope.Grid.getDPS(false);

                var dCredit = Math.floor(elapsedTime * dps / hp) * credit;
                console.log("Offline credit: ", dCredit);
                $scope.Status.credit += dCredit;
            }


            $interval(function() {
                window.localStorage.setItem('hexaclickertimestamp', Date.now());
            }, 1000);
        }

        $scope.resetGame = function() {
            if(confirm("Are you sure? You'll lose all your progress.")) {
                window.localStorage.removeItem("hexaclickersave");
                window.location.reload();
            }
        }

        $scope.loadGame();
        $scope.checkAchievedHexas();
        $scope.calcOfflineCredit();

    }])

    .filter('prettify', function(){
        return function(input) {
            return prettify(input);
        }
    })

    ;