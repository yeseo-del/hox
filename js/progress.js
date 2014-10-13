angular.module('HexaClicker')
    .service('Progress', function(){
        var currentLevel = undefined;
        var maxLevel = 1;

        var farmMode = false;

        this.setLevel = function(level) {
            currentLevel = this.getLevel(level);
        }

        this.changeLevel = function(direction) {
            var newLevel = currentLevel.level + direction;

            if(newLevel <= maxLevel) {
                this.setLevel(currentLevel.level + direction);
                this.currentLevel.on('kill', onKill);
                this.currentLevel.on('bossFailed', onBossFailed);
            }
        }

        var enoughToProgress = function(kills) {
            return (this.currentLevel.boss && kills == Level.KILL.BOSS)
                || (!this.currentLevel.boss && kills == Level.KILL.NORMAL);
        }

        var onKill = function(kills) {
            if(enoughToProgress(kills)) {
                if(this.currentLevel.boss) {
                    this.currentLevel.bossTimer.cancel();
                }

                this.changeLevel(Level.DIRECTION.FORWARD);
            }
        }

        var onBossFailed = function() {
            if(!this.farmMode) {
                this.changeLevel(Level.DIRECTION.BACKWARD);
                this.farmMode = false;
            }
        }

        this.getLevel = function(level) {
            return new Level(level);
        }


    });