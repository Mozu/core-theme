var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title: "Mozu Test Suite",
    waitForExtReady: true,
    autoCheckGlobals: false,
    expectedGlobals: [
        'Ext',
        'Taco'
    ],

    preload: [
        //'/admin/Scripts/ext/ext-all-debug.js',
        '/admin/tests/chalupa/core.js',
        '/admin/Scripts/app/app.js'
    ],

    hostPageUrl: '/admin?testHarnessMode=true'
});

Harness.start(
    {
        group: "Admin Application (Integration tests)",
        expanded: true,
        items: [
            {
                group: 'Dashboard',
                expanded: false
                /*items: [
                    {
                        url: 'integration/my-pickles-test.t.js',
                        title: 'Click main navigation'
                    }
                ]*/
            }
            , {
                group: 'Website',
                expanded: false
                /*items: [
                    {
                        url: '',
                        title: 'Click main navigation'
                    }
                ]*/
            }
            , {
                group: 'Products',
                expanded: false,
                items: [
                    //{
                    //    url: '',
                    //    title: 'Click main navigation'
                    //}
                    {
                        group: 'Products',
                        expanded: false,
                        items: [
                            {
                                url: 'integration/product-basic-edit-save.js',
                                title: 'product-basic-edit-save'
                            }
                        ]
                    }
                    , {
                        group: 'Inventory',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Categories',
                        expanded: false
                        /*, items: [
                            {
                                url: 'integration/category-is-draggable.t.js',
                                title: 'Category is Draggable'
                            }
                        ]*/
                    }
                    , {
                        group: 'Options',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                ]
            }
            , {
                group: 'Orders',
                expanded: false
                /*items: [
                    {
                        url: '',
                        title: 'Click main navigation'
                    }
                ]*/
            }
            , {
                group: 'Customers',
                expanded: false
                /*items: [
                    {
                        url: '',
                        title: 'Click main navigation'
                    }
                ]*/
            }
            , {
                group: 'Discounts',
                expanded: false
                /*items: [
                    {
                        url: '',
                        title: 'Click main navigation'
                    }
                ]*/
            }
            , {
                group: 'Settings',
                expanded: false,
                items: [
                    // {
                    //     url: '',
                    //     title: 'Click main navigation'
                    // }
                    {
                        group: 'General',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Email',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Payment/Checkout',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Tax',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Shipping',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'File Management',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Themes',
                        expanded: false
                        /*items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                    , {
                        group: 'Theme Settings',
                        expanded: false
                       /* items: [
                            {
                                url: '',
                                title: 'Click submenu navigation'
                            }
                        ]*/
                    }
                ]
            }, {
                group: 'Account',
                expanded: true,
                items: [
                    {
                        group: 'Roles',
                        expanded: true,
                        items: [{
                            url: 'unit/roles/edit-form.t.js',
                            title: 'Form Test?'
                        }]
                    }
                ]
            }
        ]
    }, {
        group: 'Components (Unit tests)',
        expanded: true,
        alsoPreload: [
            {
                text: "Taco.showViewPort=false;"
            }
        ],
        items: [
            {
                group: 'Grids',
                expanded: true,
                items: [
                    {
                        url: 'unit/grid-action-buttons.js',
                        title: 'Inline row buttons are clickable'
                    }
                    ,{
                        url: 'unit/treelist-row-is-draggable.t.js',
                        title: 'TreeList rows are draggable'
                    }
                    /*{
                        group: 'Product Grid',
                        expanded: false,
                        items: [
                            {
                                url: '',
                                title: 'Do something'
                            }
                        ]
                    }, {
                        group: 'Inventory Grid',
                        expanded: false,
                        items: [
                            {
                                url: '',
                                title: 'Do something'
                            }
                        ]
                    }, {
                        group: 'Categories Grid',
                        expanded: false,
                        items: [
                            {
                                url: '',
                                title: 'Do something'
                            }
                        ]
                    }, {
                        group: 'Options Grid',
                        expanded: false,
                        items: [
                            {
                                url: '',
                                title: 'Do something'
                            }
                        ]
                    }, {
                        group: 'Email Grid',
                        expanded: false,
                        items: [
                            {
                                url: '',
                                title: 'Do something'
                            }
                        ]
                    }, {
                        group: 'Tax Grid',
                        expanded: false,
                        items: [
                            {
                                url: '',
                                title: 'Do something'
                            }
                        ]
                    }*/
                ]
            }, {
                group: 'Modals',
                expanded: false
                /*items: [
                    {
                        url: '',
                        title: 'Do something'
                    }
                ]*/
            }, {
                group: 'Buttons',
                expanded: false
                /*items: [
                    {
                        url: '',
                        title: 'Do something'
                    }
                ]*/
            }, {
                group: 'Views',
                expanded: false,
                items: [
                    {
                        group: 'General Settings',
                        expanded: false,
                        items: [
                            {
                                url: "unit/disabling-google-analytics-disables-ua-field.js",
                                waitForAppReady: true,
                                title: "Disabling Google Analytics Disables UA Field"
                            },
                            {
                                url: "unit/enabling-robots-txt-override-enabled-robots-field.js",
                                waitForAppReady: true,
                                title: "Enabling Robots.txt override Enables Robots Override Textarea"
                            }
                        ]
                    }
                ]
            }, {
                url: "unit/app-state-matches-uri.t.js",
                waitForAppReady: true,
                // separateContext: true,
                // hostPageUrl: '/admin',
                alsoPreload: [],
                title: "App State Should Match URI"
            }
        ]
    }, {
        url: "sanity-test.t.js",
        hostPageUrl: '/admin'
    }, {
        url: 'speed-test.t.js',
        title: "Speed's test"
    }
);