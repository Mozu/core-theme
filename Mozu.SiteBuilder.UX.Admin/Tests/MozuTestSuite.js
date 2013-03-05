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
    items: [{
        group: 'Dashboard',
        expanded: false
    }, {
        group: 'Website',
        expanded: false
    }, {
        group: 'Products',
        expanded: true,
        items: [{
            group: 'Products',
            expanded: false,
            items: [{
                url: 'integration/product-basic-edit-save.js',
                title: 'product-basic-edit-save'
            }]
        }, {
            group: 'Inventory',
            expanded: false
        }, {
            group: 'Categories',
            expanded: false
        }, {
            group: 'Attributes',
            expanded: true,
            items: [{
                url: 'integration/attributes/attribute-create.t.js',
                title: 'Attribute Creation'
            }]
        }]
    }, {
        group: 'Orders',
        expanded: false
    }, {
        group: 'Customers',
        expanded: false
    }, {
        group: 'Discounts',
        expanded: false
    }, {
        group: 'Settings',
        expanded: false,
        items: [{
            group: 'General',
            expanded: false
        }, {
            group: 'Email',
            expanded: false
        }, {
            group: 'Payment/Checkout',
            expanded: false
        }, {
            group: 'Tax',
            expanded: false
        }, {
            group: 'Shipping',
            expanded: false
        }, {
            group: 'File Management',
            expanded: false
        }, {
            group: 'Themes',
            expanded: false
        }, {
            group: 'Theme Settings',
            expanded: false
        }]
    }, {
        group: 'Account',
        expanded: true,
        items: [{
            group: 'Roles',
            expanded: true,
            items: [{
                url: 'unit/roles/edit-form.t.js',
                title: 'Form Test?'
            }]
        }]
    }]
},



/*********** UNIT TESTS ***********/

{
    group: 'Components (Unit tests)',
    expanded: true,
    alsoPreload: [{
        text: "Taco.showViewPort=false;"
    }],
    items: [
        {
            url: 'unit/scrolling-content-body-adds-scroll-class.js',
            title: 'Scrolling Content Body Adds Scroll Class'
        },
        {
        group: 'Forms',
        expanded: true,
        items: [{
            url: 'unit/form/model-binds.t.js',
            title: 'Cascading Model Binding'
        }]
    }, {
        group: 'Grids',
        expanded: true,
        items: [{
            url: 'unit/grid-action-buttons.js',
            title: 'Inline row buttons are clickable'
        }, {
            url: 'unit/treelist-row-is-draggable.t.js',
            title: 'TreeList rows are draggable'
        }]
    }, {
        group: 'Tabs',
        expanded: true,
        items: [{
            url: 'unit/tab/picker.t.js',
            title: 'Tab Picker Tests'
        }]
    }, {
        group: 'Modals',
        expanded: false
    }, {
        group: 'Buttons',
        expanded: false
    }, {
        group: 'Views',
        expanded: false,
        items: [{
            group: 'General Settings',
            expanded: false,
            items: [{
                url: "unit/disabling-google-analytics-disables-ua-field.js",
                waitForAppReady: true,
                title: "Disabling Google Analytics Disables UA Field"
            }, {
                url: "unit/enabling-robots-txt-override-enabled-robots-field.js",
                waitForAppReady: true,
                title: "Enabling Robots.txt override Enables Robots Override Textarea"
            }]
        }]
    }, {
        url: "unit/app-state-matches-uri.t.js",
        waitForAppReady: true,
        alsoPreload: [],
        title: "App State Should Match URI"
    }]
}, {
    url: "sanity-test.t.js",
    hostPageUrl: '/admin'
}, {
    url: 'speed-test.t.js',
    title: "Speed's test"
});