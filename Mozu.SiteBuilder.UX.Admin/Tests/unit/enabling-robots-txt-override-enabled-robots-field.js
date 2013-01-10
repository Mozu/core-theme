StartTest(function (test) {
    test.ok(Taco, "Taco is ready");

    test.requireOk('Taco.view.generalsettings.Index', function () {
        test.diag("Initializing general settings UI with robots override pre-enabled");
        var settingsUI = Ext.create('Taco.view.generalsettings.Index', {
            settings: {
                robotsOverrideEnabled: true
            }
        });
        test.isaOk(settingsUI, 'Taco.view.generalsettings.Index', "Settings UI successfully created");
        var robotsCheckbox = settingsUI.robots.getComponent('robotsOverrideEnabled');
        test.ok(robotsCheckbox, "Robots checkbox exists");
        test.ok(robotsCheckbox.getValue(), "Robots checkbox checked");
        var robotsOverrideField = settingsUI.robots.getComponent('robotsOverride');
        test.ok(robotsOverrideField, "Robots field exists");
        test.ok(!robotsOverrideField.isDisabled(), "Robots field is enabled")
        test.diag("Unchecking checkbox");
        robotsCheckbox.setValue(false);
        test.ok(robotsOverrideField.isDisabled(), "Robots field is now disabled");
        test.diag("Checking checkbox again");
        robotsCheckbox.setValue(true);
        test.ok(!robotsOverrideField.isDisabled(), "Robots field is enabled again");
    });
});