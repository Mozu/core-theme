var relPath = helpers.isBuildTask(window) ? '' : '../../',
    DXTestObject = {
    group: 'SiteBuilder',
    expanded: true,
    items: [
        {   
            group: 'Integration Tests',
            expanded: false,
            items: []
        },
        {
            group: 'Functional Tests',
            expanded: false,
            items: []
        },
        {
            group: 'Unit Tests',
            expanded: false,
            items: [
                {
                    url: relPath + "customunit/view/Header.t.js",
                    waitForAppReady: true,
                    alsoPreload: [],
                    title: 'SiteBuilder Header'
                }
            ]
        }

    ]
};

if (!helpers.isBuildTask(window)) {

    var Harness = Siesta.Harness.Browser.ExtJS,
        protoCal = window.location.protocol,
        simAndSinPreloads = [
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimXhr.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/Simlet.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/DataSimlet.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/JsonSimlet.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimManager.js',
            '/admin/tests/sinon.js'
        ];

    Harness.configure({
        title: "DX Siesta Tests",
        waitForExtReady: true,
        autoCheckGlobals: false,
        enableCodeCoverage: true,
        expectedGlobals: ['Ext', 'Taco'],
        testClass: Taco.TestClass.Core,
        preload: simAndSinPreloads,
        hostPageUrl: relPath + 'homepages/Mystic.cshtml'
    });
    
    Harness.start(DXTestObject);
}