angular.module('HexaClicker')
    .service('Progress', function(){
        var currentLevel = undefined;
        var maxLevel = 1;
        var kills = 0;

        var farmMode = false;

        this.setLevel = function(level) {
            currentLevel = this.getLevel(level);
        }

        this.changeLevel = function(direction) {
            var newLevel = currentLevel.level + direction;

            if(newLevel <= maxLevel) {
                this.setLevel(currentLevel.level + direction);
            }
        }

        this.getLevel = function(level) {
            return new Level(level);
        }
    });