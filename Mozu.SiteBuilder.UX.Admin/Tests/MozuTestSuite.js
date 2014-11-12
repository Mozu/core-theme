var Harness = Siesta.Harness.Browser.ExtJS,
    protoCal = window.location.protocol,
    simAndSinPreloads = [
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimXhr.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/Simlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/DataSimlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/JsonSimlet.js',
        protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimManager.js',
        '/admin/tests/sinon.js'
    ];



Harness.configure({
    title: "SBAdmin Siesta Tests",
    waitForExtReady: true,
    autoCheckGlobals: false,
    expectedGlobals: ['Ext', 'Taco'],
    testClass: Taco.TestClass.Core,
    preload: simAndSinPreloads,
    hostPageUrl: 'homepages/Mystic.cshtml'

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
                                title: 'Product Save'
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
                    },
                    {
                        url: 'integration/entities/grid-t.js'
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
        items: [+
            {
                group: 'Forms',
                expanded: true,
                items: [
                    {
                        url: 'customunit/core/ux/form/model-binds.t.js',
                        title: 'Cascading Model Binding'
                    }
                ]
            },
            //C:\projects\mzt\UI\Dev\Dev-branch\Mozu.SiteBuilder\Mozu.SiteBuilder.UX.Admin\Tests\customunit\core\ux\form\field\BaseImageFiled.js
             {
                 group: 'field',
                 expanded: true,
                 items: [
                     {
                         url: 'customunit/core/ux/form/field/BaseImageField.t.js',
                         
                     }
                 ]
             },


            {
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
                group: 'Customers',
                expanded: true,
                items: [{
                    url: 'unit/view/customers/subform/information.t.js',
                    title: 'Customer Information Subform'
                }, {
                    url: 'unit/view/customers/modal/createCustomer.t.js',
                    title: 'Create Customer Modal'
                }, {
                    url: 'unit/view/customers/contacts.t.js',
                    title: 'Customer Contacts selector'
                }, {
                    url: 'unit/view/customers/modal/contacts.t.js',
                    title: 'Customer Contacts Modal'
                }]
            }, {
                group: 'Orders',
                expanded: true,
                items: [
                    {
                        url: 'customunit/view/order/header.t.js',
                        title: 'Order Header Unit Tests'
                    },
                    {
                        url: 'customunit/view/order/pendingreview-should-not-allow-add-payment.js',
                        title: 'PendingReview Should Not Allow Add Payment'
                    },
                    {
                        url: 'unit/view/order/subform/fulfillment.t.js',
                        title: 'Customer Fulfillment Tests'
                    }
                ]
            }, {
                group: 'Product',
                expanded: true,
                items: [
                    {
                        url: 'customunit/view/product/subforms/ListExtraEditor.t.js',
                        title: 'product List Extra Tests'
                    },
                    {
                        url: 'customunit/view/product/subforms/allow-changing-product-code.t.js',
                        title: 'Change Product Code'
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
{
                group: 'Settings',
                expanded: true,
                alsoPreload: [],
                items: [
                    {
                        url: 'customunit/view/settings/shipping/Zones-t.js',
                        title: 'settings shipping zones'
                    }
                ]
},

            , {
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
