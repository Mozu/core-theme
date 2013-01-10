StartTest(function (test) {
    test.ok(Taco, "Taco is ready");

    test.requireOk('Taco.view.generalsettings.Index', function () {
        test.diag("Initializing general settings UI with google analytics pre-enabled");
        var settingsUI = Ext.create('Taco.view.generalsettings.Index', {
            settings: {
                googleAnalyticsEnabled: true
            }
        });
        test.ok(settingsUI, "Settings UI successfully created");
        var gaCheckbox = settingsUI.analytics.getComponent('googleAnalyticsEnabled');
        test.ok(gaCheckbox, "GA checkbox exists");
        test.ok(gaCheckbox.getValue(), "GA checkbox checked");        var gaUAField = settingsUI.analytics.getComponent('googleAnalyticsId');
        test.ok(gaUAField, "GA UA field exists");
        test.ok(!gaUAField.isDisabled(), "GA UA field is enabled")
        test.diag("Unchecking checkbox");
        gaCheckbox.setValue(false);
        test.ok(gaUAField.isDisabled(), "GA UA field is now disabled");
        test.diag("Checking checkbox again");
        gaCheckbox.setValue(true);
        test.ok(!gaUAField.isDisabled(), "GA UA field is enabled again");
    });
});