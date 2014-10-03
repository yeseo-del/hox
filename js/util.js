var units = ['K', 'M', 'B', 'T'];

function prettify(number) {

    for(var i = units.length - 1; i >= 0; i--) {
        if(number >= Number('1e+' + (3 * (i + 1) + 2))) {
            return addThousandsSeparator(
                Math.floor(
                    (number / Number('1e+' + 3 * (i + 1))) * 10
                ) / 10
            ) + units[i];
        }
    }

    return addThousandsSeparator(number);
}

function addThousandsSeparator(value) {
    return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}