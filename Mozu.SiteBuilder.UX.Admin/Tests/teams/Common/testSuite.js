var Harness = Siesta.Harness.Browser.ExtJS,
    protoCal = window.location.protocol,
    relPath = '../../',
    simAndSinPreloads = [
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimXhr.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/Simlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/DataSimlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/JsonSimlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimManager.js',
        '/admin/tests/sinon.js',
        {
            instrument: true,
            url: relPath + "customunit/view/Header.t.js"
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
    hostPageUrl: relPath + 'homepages/Mystic.cshtml'

});

Harness.start({
    group: 'Common',
    items: [         
        {
            group: 'Forms',
            expanded: false,
            items: [
                {
                    url: relPath + relPath + 'customunit/core/ux/form/model-binds.t.js',
                    title: 'Cascading Model Binding'
                }
            ]
        },
        {
             group: 'Field',
             expanded: false,
             items: [
                 {  
                    url: relPath + 'customunit/core/ux/form/field/BaseImageField.t.js',
                    title: 'Base Image Field'
                 },
                 {
                    url: relPath + "unit/platter/fields/SimpleFields.t.js",
                    title: "Platter Simple Fields"
                 }
             ]
        },
        {
            group: 'Grids',
            expanded: false,
            items: [
                {
                    url: relPath + 'customunit/core/ux/grid/grid-action-buttons.js',
                    title: 'Inline row buttons are clickable'
                }
            ]
        }, 
        {
            group: 'Tabs',
            expanded: false,
            alsoPreload: [],
            items: [
                {
                    url: relPath + 'customunit/core/ux/tab/picker.t.js',
                    title: 'Tab Picker Tests'
                }
            ]
        },
        {
            group: 'StateManager',
            expanded: false,
            items: [
                {
                    url: relPath + "customunit/core/app-state-matches-uri.t.js",
                    waitForAppReady: false,
                    alsoPreload: [],
                    title: "App State Should Match URI"
                }
            ]
        },
        {
            group: 'Settings',
            expanded: false,
            alsoPreload: [],
            items: [
                {
                    url: relPath + 'customunit/view/settings/shipping/Zones-t.js',
                    title: 'settings shipping zones'
                }
            ]
        }
    ]
});
