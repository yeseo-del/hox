Level.DIRECTION = {
    "FORWARD": 1,
    "BACKWARD": -1
}

function Level(level) {
    this.level = level;

    this.currentHp = 0;

    this.hp = (level % 5 == 0
        ? 10 * Math.pow( 1.6, level - 1) * 10
        : 10 * Math.pow( 1.6, level - 1)
        );

    this.credit = (level % 5 == 0
        ? (10 * Math.pow( 1.6, level - 1) * 10) / 15 * 2
        : 10 * Math.pow( 1.6, level - 1) / 15 * 2
        );

    this.boss = level % 5 == 0;
}