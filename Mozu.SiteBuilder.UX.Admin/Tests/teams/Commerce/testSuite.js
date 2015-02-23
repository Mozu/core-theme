var relPath = (window.location.pathname !== '/admin/tests/buildIndex.html') ? '../../' : '',
    CommerceTestObject = {
    group: 'Commerce',
    expanded: true,
    items: [
        {   
            group: 'Integration Tests',
            expanded: false,
            items: [
                {
                    group: 'Product',
                    expanded: false,
                    items: []
                }, 
                {
                    group: 'Inventory',
                    expanded: false
                }, {
                    group: 'Categories',
                    expanded: false
                }, {
                    group: 'Attributes',
                    expanded: false,
                    items: []
                }
            ]
        },
        {
            group: 'Functional Tests',
            expanded: false,
            items: []
        },
        {
            group: 'Unit Tests',
            expanded: false,
            items: [
                {
                    group: 'Customer',
                    expanded: false,
                    items: [
                        {
                            url: relPath + 'unit/view/customers/subform/information.t.js',
                            title: 'Customer Information Subform'
                        }, 
                        {
                            url: relPath + 'unit/view/customers/modal/createCustomer.t.js',
                            title: 'Create Customer Modal'
                        }, 
                        {
                            url: relPath + 'unit/view/customers/contacts.t.js',
                            title: 'Customer Contacts selector'
                        }, 
                        {
                            url: relPath + 'unit/view/customers/modal/contacts.t.js',
                            title: 'Customer Contacts Modal'
                        },
                        {
                          url: relPath + "unit/view/customers/modal/Contacts.t.js",
                          title: "Customer Contacts Modal"
                        },
                        {
                          url: relPath + "unit/view/customers/modal/CreateCustomer.t.js",
                          title: "Create Customer Modal"
                        }
                    ]
                },
                {
                    group: 'Order',
                    expanded: false,
                    items: [
                        {
                            url: relPath + 'customunit/view/order/header.t.js',
                            title: 'Order Header Unit Tests'
                        },
                        {
                            url: relPath + 'customunit/view/order/pendingreview-should-not-allow-add-payment.js',
                            title: 'PendingReview Should Not Allow Add Payment'
                        },
                        {
                            url: relPath + 'unit/view/order/subform/fulfillment.t.js',
                            title: 'Customer Fulfillment Tests'
                        },
                        {
                            url: relPath +"unit/view/order/widget/PaymentPanel.t.js",
                            title: "Payment Panel Order Widget"
                        },
                        {
                            url: relPath + "unit/view/order/widget/GiftCardGrid.t.js",
                            title: "Order Gift Card Grid Widget"
                        },
                        {
                            url: relPath + "unit/view/order/modal/AddGiftCard.t.js",
                            title: "Add Gift Card Order Modal"
                        },
                        {   
                            url: relPath + "unit/view/order/subform/Payment.t.js",
                            title: "Order Payment Sub Form"
                        },
                        {
                            url: relPath + "unit/view/order/subform/Fulfillment.t.js",
                            title: "Order Fullfillment Subform.js"
                        }   
                    ]
                },
                {
                    group: 'Product',
                    expanded: false,
                    items: [
                        {
                            url: relPath + 'customunit/view/product/subforms/ListExtraEditor.t.js',
                            title: 'product List Extra Tests'
                        },
                        {
                            url: relPath + 'customunit/view/product/subforms/allow-changing-product-code.t.js',
                            title: 'Change Product Code'
                        },
                        {
                            url: relPath + 'customunit/view/productType/Form.t.js',
                            title: 'Product Type Tests'
                        }
                    ]
                },
                {
                    group: 'Discount',
                    expanded: false,
                    items: [
                        {
                          url: relPath + "unit/view/discount/LimitationsForm.t.js",
                          title: "LimitationsForm.js"
                        }
                    ]
                }
            ]
        }

    ]
};

if (window.location.pathname !== '/admin/tests/buildIndex.html') {

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
        title: "Commerce Siesta Tests",
        waitForExtReady: true,
        autoCheckGlobals: false,
        enableCodeCoverage: true,
        expectedGlobals: ['Ext', 'Taco'],
        testClass: Taco.TestClass.Core,
        preload: simAndSinPreloads,
        hostPageUrl: relPath + 'homepages/Mystic.cshtml'

    });

    Harness.start(CommerceTestObject);
}