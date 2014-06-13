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
    title: "SBAdmin Siesta Tests",
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
    window.AllMozuUnitTests,
    {
        group: 'Custom Unit',
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
                        url: 'customunit/core/ux/form/model-binds.t.js',
                        title: 'Cascading Model Binding'
                    }
                ]
            }, {
                group: 'Grids',
                expanded: true,
                items: [
                    {
                        url: 'customunit/core/ux/grid/grid-action-buttons.js',
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
                        url: 'customunit/core/ux/tab/picker.t.js',
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
                        url: 'customunit/view/order/pendingreview-should-not-allow-add-payment.js',
                        title: 'PendingReview Should Not Allow Add Payment'
                    }
                ]
            }, {
                group: 'Product',
                expanded: true,
                items: [
                    {
                        url: 'customunit/view/product/subforms/ListExtraEditor.t.js',
                        title: 'product List Extra Tests'
                    }
                    //,
                    //{
                    //    url: 'customunit/view/product/subforms/General.t.js',
                    //    title: 'Gift Cards'
                    //}
                ]
            },
            {
                group: 'Product Type',
                expanded: true,
                items: [
                    {
                        url: 'customunit/view/productType/Form.t.js',
                        title: 'Product Type Tests'
                    }
                ]
            },
//{
//                group: 'Settings',
//                expanded: true,
//                alsoPreload: [],
//                items: [
//                    {
//                        url: 'customunit/view/settings/shipping/Zones-t.js',
//                        title: 'settings shipping zones'
//                    }
//                ]
//},

            {
                group: 'WebSite',
                expanded: true,
                items: [
                    {
                        url: 'customunit/view/website/settings/doc-seo.js',
                        title: 'web-doc-seo'
                    }
                ]
            }, {
                group: 'StateManager',
                items: [
                    {
                        url: "customunit/core/app-state-matches-uri.t.js",
                        waitForAppReady: false,
                        alsoPreload: [],
                        title: "App State Should Match URI"
                    }
                ]
            }
        ]
    });