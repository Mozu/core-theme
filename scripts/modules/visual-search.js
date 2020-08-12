define(['modules/jquery-mozu', 'configs/visual-search'], function ($, visualSearchConfig) {
    var waitForCertonaVisualSearch = function() { //waitForCertonaVisualSearch([vsConfig path[, max # of tries[, interval]]])
        try {
            var args = Array.prototype.slice.call(arguments);
            var vsConfig = args[0];
            var counter = args[1] || 0;
            var interval = 200;
            counter += 1;
            args[1] = counter;
            if (typeof window.CertonaVisualSearch === "undefined") {
                window.setTimeout(function () {
                    if (counter < 10) {
                        waitForCertonaVisualSearch.apply(null, args);
                    }
                }, interval);
            } else {
                window.CertonaVisualSearch.automatedTestVisualSearch(visualSearchConfig);
            }
        } catch (ignore) {
            window.console.error('Fail on VS Init');
        }
    };

    $(document).ready(function () {
        var visualSearch = document.createElement("script");
        visualSearch.type = "text/javascript";
        visualSearch.async = true;
        visualSearch.src = "//s.certona.net/VisualSearch2/Production/CertonaVisualSearch.js";
        $("head").append(visualSearch);

        waitForCertonaVisualSearch();
    });
});





