StartTest(function (test) {
    test.diag("Running Speed's test");

    test.ok(Ext, "Ext exists");
    test.ok(Taco, "Taco exists");

//    test.requireOk('Taco');
    test.requireOk('Taco.view.site.widget.HorizontalRule', function () {
        window.ttt = this;

        var hr = Ext.create('Taco.view.site.widget.HorizontalRule');

        test.diag("In requireOk fn");
    });

    // test.ok(Taco, "Taco exists!");
    // test.ok(Taco.app, "Taco.app also exists!");

    test.done();
});