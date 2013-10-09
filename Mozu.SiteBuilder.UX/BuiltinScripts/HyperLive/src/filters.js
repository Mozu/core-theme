(function () {
    function formatMoney(n, decPlaces, thouSeparator, decSeparator, symbol, symbolIsSuffix) {
        var decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
            symbol = symbol || "$",
            decSeparator = decSeparator == undefined ? "." : decSeparator,
            thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
            sign = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0,
            s = (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
        return sign + (symbolIsSuffix ? s + symbol : symbol + s);
    }

    HyperLive.engine.setFilter('currency', function (num, symbol) {
        return formatMoney(num);
    });


    HyperLive.engine.setFilter('divisibleby', function (num, divisor) {
        return num % divisor === 0;
    });

}());