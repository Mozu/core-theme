var relPath = helpers.isBuildTask(window) ? '' : '../../',
    CatalogTestObject = {
        group: 'Catalog',
        expanded: true,
        items: [
            {   
                group: 'Integration Tests',
                expanded: false,
                items: [
                    {
                        group: 'Products',
                        expanded: false,
                        items: [
                            {
                                url: relPath + 'integration/product/product-basic-edit-save.js',
                                title: 'Product Save'
                            }
                        ]
                    }, 
                    {
                        group: 'Inventory',
                        expanded: false
                    }, 
                    {
                        group: 'Categories',
                        expanded: false
                    }, 
                    {
                        group: 'Attributes',
                        expanded: false,
                        items: [
                            {
                                url: relPath + 'integration/attribute/attribute-create.t.js',
                                title: 'Attribute Creation'
                            }
                        ]
                    }
                ]
            },
            {
                group: 'Functional Tests',
                expanded: false,
                items: [
                    {
                        group: 'Products',
                        expanded: false,
                        items: [
                            {
                                url: relPath + 'functional/product/product-basic-edit-save.js',
                                title: 'Product Save'

                            }
                        ]
                    }
                ]
            },
            {
                group: 'Unit Tests',
                expanded: false,
                items: [
                    {
                        group: 'Location',
                        expanded: false,
                        items: [
                            {
                              url: relPath + "unit/view/location/subform/Location.t.js",
                              title: "Location Subform"
                            }
                        ]
                    },
                    {
                        group: 'Product',
                        expanded: false,
                        items: [
                            {
                              url: relPath + "customunit/view/product/subforms/General.t.js",
                              title: "Product General Subform"
                            }
                        ]
                    }
               ]
            }

        ]
    };

if (!helpers.isBuildTask(window)) {

    var Harness = Siesta.Harness.Browser.ExtJS,
        protoCal = window.location.protocol,
        simAndSinPreloads = [
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimXhr.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/Simlet.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/DataSimlet.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/JsonSimlet.js',
            protoCal + '//cdn.sencha.io/ext/gpl/4.2.0/examples/ux/ajax/SimManager.js',
            '/admin/tests/sinon.js',
            {
                instrument: true,
                url: relPath + "customunit/view/Header.t.js"
            }
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

    Harness.start(CatalogTestObject);
}