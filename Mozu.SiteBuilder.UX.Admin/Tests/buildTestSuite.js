var Harness = Siesta.Harness.Browser.ExtJS,
    protoCal = window.location.protocol,
    simAndSinPreloads = [
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimXhr.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/Simlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/DataSimlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/JsonSimlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimManager.js',
        '/admin/tests/sinon.js',
        {
            instrument: true,
            url: "customunit/view/Header.t.js"
        }
    ];

Harness.configure({
    title: "DX Siesta Tests",
    waitForExtReady: true,
    autoCheckGlobals: false,
    enableCodeCoverage: true,
    expectedGlobals: ['Ext', 'Taco'],
    testClass: Taco.TestClass.Core,
    preload: simAndSinPreloads,
    hostPageUrl:'homepages/Mystic.cshtml'
});

/* global DXTestObject, CommerceTestObject, CatalogTestObject, CommonTestObject */
Harness.start(DXTestObject, CommerceTestObject, CatalogTestObject, CommonTestObject);
