StartTest(function (test) {
    var async = test.beginAsync();
    test.diag('Visiting general settings page, a good long page');
    Taco.app.on('createpageview', function() {
        if (window.location.href.indexOf('generalsettings') === -1) {
            test.fail('Did not get to settings page');
        }        var contentbody = test.cq1('contentbody');
        test.ok(contentbody instanceof Taco.core.ux.content.Body, 'Body is a Taco.core.ux.content.Body');
        test.cq('contentbody panel').forEach(function (item) {
            if (item.title && item.collapsed && item.collapsible) {
                if (item.rendered) {
                    test.diag('espanding ' + item.title);
                    item.expand(false);
                } else {
                    item.on('render', function () {
                        test.diag('espanding ' + item.title);
                        item.expand(false);
                    });
                }
            }
        });
        test.diag('expanded all panels, we should be all hell of scrollable now');
        test.waitFor(function () { var e = contentbody.getEl(); return e && e.isScrollable() });
        test.diag('and we totes are');

        contentbody.getEl().scrollBy(0, 100);

        test.ok(contentbody.getEl().hasCls('taco-content-scrolled'), 'scrolling gave contentbody a scrolled class');
        contentbody.getEl().scrollBy(0, 0);

        test.pass(!contentbody.getEl().hasCls('taco-content-scrolled'), 'scrolling up removed that class');
        test.endAsync(async);
    });
    Taco.core.StateManager.attemptNavigate('generalsettings');

});