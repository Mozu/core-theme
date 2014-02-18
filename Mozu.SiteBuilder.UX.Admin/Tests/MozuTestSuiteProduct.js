var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: "Mozu Test Suite",
    waitForExtReady: true,
    autoCheckGlobals: false,
    expectedGlobals: ['Ext', 'Taco'],

    preload: ['/admin/tests/chalupa/core.js', '/admin/Scripts/app/app.js', '/admin/tests/sinon.js'],

    hostPageUrl: '/admin?testHarnessMode=true'
});

Harness.start({


    /*********** ADMIN COMPONENT INTEGRATION TEST ***********/
    group: "Admin Application (Integration tests)",
    expanded: true,
    items: [
        {
            group: 'Products',
            expanded: true,
            items: [
                {
                    group: 'Products',
                    expanded: false,
                    items: [
                        {
                            url: 'integration/product-basic-edit-save.js',
                            title: 'product-basic-edit-save'
                        }
                    ]
                }, {
                    group: 'Inventory',
                    expanded: false
                }, {
                    group: 'Categories',
                    expanded: false
                }, {
                    group: 'Attributes',
                    expanded: true,
                    items: [
                        {
                            url: 'integration/attributes/attribute-create.t.js',
                            title: 'Attribute Creation'
                        }
                    ]
                }
            ]
        }
    ]
});