angular.module('HexaClicker')
    .service('Grid', function(){
        var grid = new Grid();

        this.getGrid = function() {
            return grid;
        }
    });