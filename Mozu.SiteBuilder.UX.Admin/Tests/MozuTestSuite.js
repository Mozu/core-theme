var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: "Mozu Test Suite",
    waitForExtReady: true,
    autoCheckGlobals: false,
    expectedGlobals: ['Ext', 'Taco'],

    preload: ['/admin/tests/chalupa/core.js', '/admin/tests/sinon.js'],

    hostPageUrl: '/admin'
});

Harness.start({

    // hostPageUrl: '/admin?testHarnessMode=true',
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

                    items: [
                        {
                            url: 'integration/product/product-basic-edit-save.js',
                            title: 'Product Save'
                        }
                    ]
                },
                {
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
        },
        {
            group: 'StateManager',
            items: [
                {
                    url: "unit/app-state-matches-uri.t.js",
                    waitForAppReady: true,
                    alsoPreload: [],
                    title: "App State Should Match URI"
                }
            ]
        }
    ]
});