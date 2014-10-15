angular.module('HexaClicker')
    .service('Grid', function(){
        var POSITIONMAP_DEFAULT = {
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

        this.getGrid = function() {
            return new Grid();
        }

        function Slot(id, tier) {
            this.id = id;
            this.tier = tier;

            this.hexaEntity = undefined;
            this.effects = [];

            this.setHexaEntity = function(hexaEntity) {
                this.hexaEntity = hexaEntity;
            }
        }

        function Grid() {
            this.slots = [];

            this.tier = 1;

            var me = this;
            _.range(0,7).forEach(function(num) {
                me.slots.push(new Slot(num, 1));
            });

            _.range(7,19).forEach(function(num) {
                me.slots.push(new Slot(num, 2));
            });

            _.range(19,37).forEach(function(num) {
                me.slots.push(new Slot(num, 3));
            });

            var positionMap = POSITIONMAP_DEFAULT;

            this.getDPS = function(withEffects){
                var sum = 0;
                this.slots.forEach(function(slot) {
                    if(slot.hexaEntity && slot.hexaEntity.hexa instanceof DpsHexa) {

                        var dps = slot.hexaEntity.getDPS();

                        if(withEffects) {
                            slot.effects.forEach(function(effect) {
                                dps *= effect.effect.dps;
                            });
                        }

                        sum += dps;
                    }
                });

                return Math.floor(sum);
            }

            this.getSlot = function(id) {
                return this.slots.filter(function(slot) {
                    return slot.id == id;
                })[0];
            }

            this.getSlotByPos = function(position) {
                return this.getSlot(this.positionMap[position.q][position.r]);
            }

            this.emptySlotCount = function() {
                return this.slots.filter(function(slot){
                    return slot.tier <= this.tier && slot.hexaEntity == undefined;
                }).length;
            }

            this.maxUpgrades = function() {
                switch (this.tier) {
                    case 1:
                        return 1;
                    case 2:
                        return 3;
                    case 3:
                        return 6;
                }
            }
        }
    });