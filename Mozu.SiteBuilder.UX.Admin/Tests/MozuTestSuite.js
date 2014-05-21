var Harness = Siesta.Harness.Browser.ExtJS,
    protoCal = window.location.protocol,
    simAndSinPreloads = [
    protoCal+ '//cdn.sencha.io/ext-4.2.0-gpl/examples/ux/ajax/SimXhr.js',
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

    //  loaderPath  : { 'Ext.ux': 'http://cdn.sencha.io/ext-4.2.0-gpl/examples/ux' },
    hostPageUrl: 'homepages/Mystic.cshtml',
    //listeners: {
    //    testsuitestart:function (event, harness) {
    //        debugger;
    //    }
    //},
    //setup: function (callback) {
    //    var protoCal = window.location.protocol;
    //    Ext.Array.each(simAndSinPreloads, function (item, index, arr) {
    //        if (item.indexOf("//") == 0) {
    //            arr[index] = protoCal + item;
    //        }
    //    });
    //    //debugger;
    //    callback();
    //}
});

Harness.start(
    {


        /*********** ADMIN COMPONENT INTEGRATION TEST ***********/
        group: "Admin Integration",
        expanded: true,
        runCore :'sequential',
     
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
                text: "Taco.app.viewPort.removeAll(true)"
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
                alsoPreload: [
           
                ],
                items: [
                    {
                        url: 'unit/tab/picker.t.js',
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
                        url: 'unit/order/pendingreview-should-not-allow-add-payment.js',
                        title: 'PendingReview Should Not Allow Add Payment'
                    }
                ]
            }, {
                group: 'WebSite',
                expanded: true,
                items: [
                    {
                        url: 'unit/website/settings/doc-seo.js',
                        title: 'web-doc-seo'
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