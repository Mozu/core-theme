define(['vendor/handlebars'], function(handlebars) {
    // {{#each_with_index records}}
    //      <li class="legend_item{{index}}"><span></span>{{Name}}</li>
    // {{/each_with_index}}
    handlebars.registerHelper('each_with_index', function(array, fn) {
        var buffer = '';
        for (var i = 0, j = array.length; i < j; i++) {
            var item = array[i];

            // stick an index property onto the item, starting with 1, may make configurable later
            item.index = i + 1;

            // show the inside of the block
            buffer += fn(item);
        }

        // return the finished buffer
        return buffer;
    });


    handlebars.registerHelper('each_with_context', function(array, context, fn) {
        var buffer = '';
        for (var i = 0, j = array.length; i < j; i++) {
            var item = array[i];

            item.context = context;

            buffer += fn(item);
        }

        return buffer;
    });

    handlebars.registerHelper('currency', function(amount, fn) {
        return '$' + amount.formatMoney(2, '.', ',')
    })

    Number.prototype.formatMoney = function (decimals, kDelimeter, dDelimeter) {
        var number = this
            ,decimals = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals
            ,kDelimeter = kDelimeter || ','
            ,dDelimeter = dDelimeter || '.'
            ,sign = number < 0 ? '-' : ''
            ,integer = parseInt(number = Math.abs(+number || 0).toFixed(decimals)) + ''
            ,thousands = (thousands = integer.length) > 3 ? thousands % 3 : 0
        return sign + (thousands ? integer.substr(0, thousands) + dDelimeter : '') + integer.substr(thousands).replace(/(\d{3})(?=\d)/g, "$1" + dDelimeter) + (decimals ? kDelimeter + Math.abs(number - integer).toFixed(decimals).slice(2) : '')
    }

    return handlebars;
});