var relPath = (window.location.pathname !== '/admin/tests/buildIndex.html') ? '../../' : '',
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
if (window.location.pathname !== '/admin/tests/buildIndex.html') {

    var Harness = Siesta.Harness.Browser.ExtJS,
        protoCal = window.location.protocol;

    Harness.configure({
        title: "DX Siesta Tests",
        waitForExtReady: true,
        autoCheckGlobals: false,
        enableCodeCoverage: true,
        expectedGlobals: ['Ext', 'Taco'],
        testClass: Taco.TestClass.Core,
        hostPageUrl: relPath + 'homepages/Mystic.cshtml'

    });
    
    Harness.start(DXTestObject);

}