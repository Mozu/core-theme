StartTest(function (test) {
    test.diag("Running sanity-test in Simple Mozu Test Suite");

    test.ok(Ext, "Ext exists");
    test.requireOk('Taco');
    test.requireOk('Taco.view.site.widget.HorizontalRule');

    test.done();
});