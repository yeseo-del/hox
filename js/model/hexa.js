Hexa.TYPE = {
    "DPS": 1,
    "ACTIVE_UTILITY": 2,
    "PASSIVE_UTILITY": 3
}

UtilityHexa.TARGET = {
    "HORIZONTAL": 1,
    "AREA": 2,
    "GLOBAL": 3
}

////////////////

function Hexa(id, type, color, price, upgrade) {
    this.id = id;
    this.type = type;
    this.color = color;
    this.price = price;
    this.upgrade = upgrade;
}

Hexa.prototype.calcUpgrade = function(level) {
    return Math.floor(this.upgrade * Math.pow(1.07, level - 1));
}

////////////////


function DpsHexa(id, color, price, upgrade, baseDps) {
    Hexa.call(this, id, Hexa.TYPE.DPS, color, price, upgrade);

    this.baseDps = baseDps;
}

DpsHexa.prototype.calcDps = function(level) {
    return this.baseDps * level;
}

////////////////


function UtilityHexa(id, type, color, price, upgrade, description, target, effect) {
    Hexa.call(this, id, type, color, price, upgrade);

    this.description = description;
    this.target = target;
    this.effect = effect;

}

UtilityHexa.prototype.getAffectedPositions = function(position) {
    var DIRECTION = [
        { q: 0, r: -1 },
        { q: 1, r: -1 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 1 },
        { q: -1, r: 0 }
    ];

    var positions = [];

    switch (this.target) {
        case UtilityHexa.TARGET.HORIZONTAL:
            for(var i = -3; i <= 3; i++) {
                positions.push({q: i, r: position.r});
            }
            break;
        case UtilityHexa.TARGET.AREA:
            DIRECTION.forEach(function(direction) {
                var dq = position.q + direction.q;
                var dr = position.r + direction.r;

                if(dq <= 3 && dq >= -3 && dr <= 3 && dr >= -3) {
                    positions.push({q: dq, r: dr });
                }
            });
            break;
    }

    return positions;

}

function ActiveUtilityHexa(id, color, price, upgrade, description, target, effect, duration, cooldown) {
    UtilityHexa.call(this, id, Hexa.TYPE.ACTIVE_UTILITY, color, price, upgrade, description, target, effect);

    this.duration = duration;
    this.cooldown = cooldown;
}

function PassiveUtilityHexa(id, type, color, price, upgrade, description, target, effect) {
    UtilityHexa.call(this, id, Hexa.TYPE.PASSIVE_UTILITY, color, price, upgrade, description, target, effect);
}

//////////////

function CooldownStatus(duration, cooldown) {
    this.duration = duration;
    this.cooldown = cooldown;
}

function HexaEntity(hexa) {
    this.hexa = hexa;
    this.level = 1;

    this.getDPS = function() {
        return this.hexa.calcDps(this.level);
    }
}