angular.module('HexaClicker', [])
    .controller('GameCtrl', ['$scope', '$interval', 'Progress', 'Grid', 'Data', 'Status', function($scope, $interval, Progress, Grid, Data, Status) {

        $scope.Grid = Grid.getGrid();

        $scope.Progress = Progress.getProgress();

        $scope.Progress.setLevel(1);

        $scope.Status = Status.getStatus();

        $scope.Data = Data;

        $scope.selectedHexaForPurchase = undefined;

        $scope.click = function() {
            $scope.Progress.currentLevel.dealDamage(50 + $scope.Grid.getDPS() * 0.1);
        }

        $scope.toggleProgress = function() {
            $scope.Progress.progressMode = !$scope.Progress.progressMode;
        }

        $scope.$on('kill', function(event) {
            console.log('onKill');
            $scope.Status.addCredit($scope.Progress.currentLevel.credit);

            if($scope.Progress.currentLevel.boss){
                $scope.Status.addPower(1);
            }
        });

        $scope.$on('purchase', function(event, hexa) {
            console.log('onPurchase', hexa);
            $scope.selectedHexaForPurchase = hexa;
        });

        //DPS
        var dpsTimestamp = Date.now();
        var dpsInterval = $interval(function(){
            $scope.Progress.currentLevel.dealDamage($scope.Grid.getDPS() * ((Date.now() - dpsTimestamp) / 1000));
            dpsTimestamp = Date.now();
        },100);

        ///////////////////////////////------------------------------------------------------------------------------
        // INIT TESTDATA

        ////////////////////////////-----------------------------------------------------------------------------

        $scope.SAVE_VERSION = 2;

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

        /*
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
        }, 1000);*/

        $scope.highlight = function(selectedSlot, value) {
            if($scope.slots[selectedSlot].hexa.type == 2) {
                var affectedSlots = $scope.getAffectedSlots(selectedSlot, $scope.slots[selectedSlot].hexa.effect.type);

                affectedSlots.forEach(function(slot) {
                    $scope.slots[slot].highlighted = value;
                });
            }
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

        //$scope.loadGame();
        //$scope.calcOfflineCredit();

    }])

    .filter('prettify', function(){
        return function(input) {
            return prettify(input);
        }
    })

    ;