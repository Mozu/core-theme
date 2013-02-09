
StartTest(function(t) {

    var m = {
        initUI: function () {
            t.diag('Initialized the picker');
        }
    };

    t.requireOk('Taco.core.ux.tab.Picker', function () {
        m.initUI();
    });
});