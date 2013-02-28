StartTest(function (t) {
    var m = {
        init: function () {
            t.diag('init complete');
        }
    }

    t.requireOk('Taco.controller.Attributes', function () {
        m.init();
    })
});