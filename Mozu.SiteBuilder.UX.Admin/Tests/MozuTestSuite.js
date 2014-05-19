var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: "Mozu Test Suite",
    waitForExtReady: true,
    autoCheckGlobals: false,
    expectedGlobals: ['Ext', 'Taco'],
    testClass: Taco.TestClass.Core,
    preload: [
        'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimXhr.js',
        'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/Simlet.js',
        'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/DataSimlet.js',
        'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/JsonSimlet.js',
        'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimManager.js',
        '/admin/tests/sinon.js'
    ],
    //  loaderPath  : { 'Ext.ux': 'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux' },
    hostPageUrl: 'homepages/Mystic.html',
});

Harness.start({


        /*********** ADMIN COMPONENT INTEGRATION TEST ***********/
        group: "Admin  (Integration tests)",
        expanded: true,

     
        items: [
            {
                alsoPreload: [
                      'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimXhr.js',
                      'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/Simlet.js',
                      'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/DataSimlet.js',
                      'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/JsonSimlet.js',
                      'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimManager.js',
                      '/admin/tests/sinon.js'
                ],
                hostPageUrl: '/admin',
                group: 'Products',
                expanded: true,
                items: [
                    {
                        group: 'Products',

                        items: [
                            {
                                url: 'integration/product/product-basic-edit-save.js',
                                title: 'Product Save',
                            }
                        ]
                    }, {
                        group: 'Attributes',
                        expanded: true,
                        items: [
                            {
                                url: 'integration/attribute/attribute-create.t.js',
                                title: 'Attribute Creation'
                            }
                        ]
                    }
                ]
            }
        ]
    }, {

        // hostPageUrl: '/admin?testHarnessMode=true',
        /*********** ADMIN COMPONENT INTEGRATION TEST ***********/
        group: "Admin Application (Functional tests)",
        expanded: true,
        items: [
            {
                group: 'Products',

                items: [
                    {
                        url: 'functional/product/product-basic-edit-save.js',
                        title: 'Product Save'

                    }
                ]
            }
        ]
    },

    /*********** UNIT TESTS ***********/
    {
        group: 'Components (Unit tests)',
        expanded: true,
        alsoPreload: [
            {
                text: "Taco.showViewPort=false;"
            }
        ],
        items: [
            {
                group: 'Forms',
                expanded: true,
                items: [
                    {
                        url: 'unit/form/model-binds.t.js',
                        title: 'Cascading Model Binding'
                    }
                ]
            }, {
                group: 'Grids',
                expanded: true,
                items: [
                    {
                        url: 'unit/grid/grid-action-buttons.js',
                        title: 'Inline row buttons are clickable'
                    }
                ]
            }, {
                group: 'Tabs',
                expanded: true,
                items: [
                    {
                        url: 'unit/tab/picker.t.js',
                        title: 'Tab Picker Tests'
                    }
                ]
            }, {
                group: 'StateManager',
                items: [
                    {
                        url: "unit/app-state-matches-uri.t.js",
                        waitForAppReady: false,
                        alsoPreload: [],
                        title: "App State Should Match URI"
                    }
                ]
            }
        ]
    });