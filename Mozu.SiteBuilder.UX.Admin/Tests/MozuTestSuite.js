var Harness = Siesta.Harness.Browser.ExtJS,
    protoCal = window.location.protocol,
    simAndSinPreloads = [
        protoCal + '//cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimXhr.js',
        protoCal + '//cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/Simlet.js',
        protoCal + '//cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/DataSimlet.js',
        protoCal + '//cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/JsonSimlet.js',
        protoCal + '//cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimManager.js',
        '/admin/tests/sinon.js'
    ];


Harness.configure({
    title: "Mozu Test Suite",
    waitForExtReady: true,
    autoCheckGlobals: false,
    expectedGlobals: ['Ext', 'Taco'],
    testClass: Taco.TestClass.Core,
    preload: simAndSinPreloads,
    hostPageUrl: 'homepages/Mystic.cshtml',

});

Harness.start(
    {


        /*********** ADMIN COMPONENT INTEGRATION TEST ***********/
        group: "Admin Integration",
        expanded: true,
        runCore: 'sequential',

        items: [
            {
                runCore: 'sequential',
                alsoPreload: simAndSinPreloads,
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
    },
    {

        // hostPageUrl: '/admin?testHarnessMode=true',
        /*********** ADMIN COMPONENT INTEGRATION TEST ***********/
        group: "Admin Functional",
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
        group: 'Components ',
        expanded: true,
        alsoPreload: [
            {
                text: "Taco.app.viewPort.removeAll(true);"
            }
        ],
        items: [
            {
                group: 'Forms',
                expanded: true,
                items: [
                    {
                        url: 'unit/core/ux/form/model-binds.t.js',
                        title: 'Cascading Model Binding'
                    }
                ]
            }, {
                group: 'Grids',
                expanded: true,
                items: [
                    {
                        url: 'unit/core/ux/grid/grid-action-buttons.js',
                        title: 'Inline row buttons are clickable'
                    }
                ]
            }, {
                group: 'Tabs',
                expanded: true,
                alsoPreload: [
                ],
                items: [
                    {
                        url: 'unit/core/ux/tab/picker.t.js',
                        title: 'Tab Picker Tests'
                    }
                ]
            }, {
                group: 'Orders',
                expanded: true,
                alsoPreload: [
                ],
                items: [
                    {
                        url: 'unit/view/order/pendingreview-should-not-allow-add-payment.js',
                        title: 'PendingReview Should Not Allow Add Payment'
                    }
                ]
            }, {
                group: 'Product',
                expanded: true,
                items: [
                    {
                        url: 'unit/view/product/subforms/ListExtraEditor.t.js',
                        title: 'product List Extra Tests'
                    }
                ]
            },
            {
                group: 'WebSite',
                expanded: true,
                items: [
                    {
                        url: 'unit/view/website/settings/doc-seo.js',
                        title: 'web-doc-seo'
                    }
                ]
            }, {
                group: 'StateManager',
                items: [
                    {
                        url: "unit/core/app-state-matches-uri.t.js",
                        waitForAppReady: false,
                        alsoPreload: [],
                        title: "App State Should Match URI"
                    }
                ]
            }
        ]
    });