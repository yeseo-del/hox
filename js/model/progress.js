Level.DIRECTION = {
    "FORWARD": 1,
    "BACKWARD": -1
}

Level.KILL = {
    "NORMAL": 10,
    "BOSS": 1
}

function Level(level) {
    this.level = level;

    this.currentHp = 0;

    this.kills = 0;

    this.hp = (level % 5 == 0
        ? 10 * Math.pow( 1.6, level - 1) * 10
        : 10 * Math.pow( 1.6, level - 1)
        );

    this.credit = (level % 5 == 0
        ? (10 * Math.pow( 1.6, level - 1) * 10) / 15 * 2
        : 10 * Math.pow( 1.6, level - 1) / 15 * 2
        );

    this.boss = level % 5 == 0;

    if(this.boss) {
        var onFail = function() {
            this.currentHp = 0;
            this.fireEvent("bossFailed");
        }

        this.bossTimer = new BossTimer(30, onFail);
    }
}

Level.prototype.dealDamage = function(damage) {
    var newHp = this.currentHp + damage;

    if(newHp >= this.hp) {
        this.kills++;
        this.fireEvent("kill", this.kills);
    }
}

function BossTimer(time, onFail){
    this.time = time;

    this.timer = setInterval(function(){
        this.time -= 1;
        if(this.time == 0) {
            this.time = time;
            onFail();
        }
    }, 1000);
}

BossTimer.prototype.cancel = function(){
    clearInterval(this.timer);
}