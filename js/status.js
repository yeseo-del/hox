angular.module('HexaClicker')
    .service('Status', function(){

        var status = new Status();

        function Status() {
            this.allCredit = 0;
            this.credit = 0;
            this.utility = 1;
            this.power = 1;

            this.addCredit = function(credit) {
                this.credit += credit;
                this.allCredit += credit;
            }

            this.addPower = function(power) {
                this.power += power;
            }
        }

        this.getStatus = function() {
            return status;
        }
    });