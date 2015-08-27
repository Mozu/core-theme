StartTest(function(t) {
    var m = {};

    t.setOnlyMocks();

    t.simManager().register([{
            url: '/admin/app/product/renameproductcode',
            stype: 'json',
            getData: function () { },
            doPost: function () {
                t.diag('doPost');
                m.doPostCalled = true;
                return {
                    responseText: Ext.encode({
                        items: [
                        {
                            productCode: 'EXISTING',
                            newProductCode: 'testing'
                        }]
                    }),
                    success: true,
                    status: 200
                };
            }
        }
    ]);

    t.describe("Product", function(t) {
        //var m = {};

        t.requireOk('Taco.model.Product', 'Taco.view.product.widget.productCode.Modal'); //, 'Ext.ux.ajax.SimManager');

        //Ext.ux.ajax.SimManager.init({
        //    delay: 300
        //}).register({
        //    '/admin/app/product/renameproductcode': {
        //        stype: 'json',
        //        data: [
        //            {
        //                productCode: 'EXISTING',
        //                newProductCode: 'testing'
        //            }
        //        ]
        //    }
        //});


        t.describe('To have freedom to setup products as I want them, as a Merchant, I want to be able to change product and product variant codes', function(t) {

            t.it("Should allow changing a product code for an existing product", function (t) {

                m = {};
                m.record = Ext.create('Taco.model.Product', {
                    productCode: 'EXISTING',
                    productUsage: 'Standard'
                });
                m.productType = Ext.create('Taco.model.ProductType', {
                    productUsages: ['Standard']
                });
                m.afterSaveClose = function() {
                    t.diag('after save');
                    m.saved = true;
                };
                m.afterCancelClose = function () {
                    t.diag('after cancel');
                    m.cancelled = true;
                };
                m.saveSuccess = function () {
                    t.diag('after save success');
                    m.saved = true;
                };

                t.chain(
                    function arrange(next) {
                        var me = this;
                        Taco.app.viewPort.removeAll(true);
                        
                        
                        m.form = Ext.create('Taco.view.product.widget.productCode.Modal', {
                            product: m.record,
                            productType: m.productType,

                            listeners: {
                                'aftersaveclose': {
                                    fn: m.afterSaveClose
                                },
                                'aftercancelclose': {
                                    fn: m.afterCancelClose
                                },
                                'savesuccess': {
                                    fn: m.saveSuccess
                                },
                                scope: me
                            }
                        });

                        Taco.app.viewPort.add(m.form);
                        t.waitForComponentVisible(m.form, next);
                    },

                    function act(next) {

                        m.newProductCodeFld = m.form.up("#newProductCode");
                        t.ok(m.newProductCodeFld !== null, 'new product code field should not be null');
                        t.click(m.newProductCodeFld, next);
                        //t.selectText(m.newProductCodeFld);
                        
                    },

                    function actFillOutField(next) {
                        t.type(m.newProductCodeFld, "testing", next);
                    },

                    function actSave(next) {
                        var saveButton = m.form.down('#primaryAction');
                        t.ok(saveButton, 'should have primary (save) button');
                        t.notOk(saveButton.isDisabled(), 'save button should not be disabled after filling out new product code');
                        t.click(saveButton, next);
                    },

                    function actWarning(next) {
                        t.click('>>#yes');
                        t.waitFor({
                            method: function() { return m.doPostCalled; },
                            callback: next
                        });
                    },
                
                    function assert(next) {
                        t.diag('assert');
                        t.ok(m.doPostCalled, 'should have called doPost');
                    }
                );
            });

            t.xit("Should allow cancelling out of dialog", function (t) {

                m = {};
                m.afterSaveClose = function() {
                    t.diag('after save');
                    m.saved = true;
                };
                m.afterCancelClose = function () {
                    t.diag('after cancel');
                    m.cancelled = true;
                };

                t.chain(
                    function arrange(next) {
                        var me = this;
                        Taco.app.viewPort.removeAll(true);
                        m.record = Ext.create('Taco.model.Product', {
                            productUsage: 'Standard'
                        });
                        m.productType = Ext.create('Taco.model.ProductType', {
                            productUsages: ['Standard']
                        });
                        
                        m.form = Ext.create('Taco.view.product.widget.productCode.Modal', {
                            product: m.record,
                            productType: m.productType,

                            listeners: {
                                'aftersaveclose': {
                                    fn: m.afterSaveClose
                                },
                                'aftercancelclose': {
                                    fn: m.afterCancelClose
                                },
                                scope: me
                            }
                        });

                        Taco.app.viewPort.add(m.form);
                        t.waitForComponentVisible(m.form, next);
                    },
                    function act(next) {
                        var cancelButton = m.form.down('#secondaryAction');
                        t.ok(cancelButton !== null, "secondary button");
                        t.click(cancelButton, next);
                    },
                    function assert(next) {
                        t.ok(m.cancelled, 'should be cancelled');
                    }
                );
            });

        });

    });
});

//function SetUpMocks(t, next, m) {
//    t.simManager().register([
//        //{
//        //    url: '/admin/app/ProductType/read',
//        //    jsonFile: '/admin/tests/mocks/Mystic1/ProductTypes1.json'
//        //},
//        {
//            url: '/admin/app/productVariation/list',
//            stype: 'json',
//            getData: function() {
//                return [
//                    //{
//                        // here!
                        
//                    //}
//                ];
//            },
//            doPost: function() {
//                return this.doGet.apply(this, arguments);
//            }
//        },
//        {
//            url: '/admin/app/product/renameproductcode',
//            stype: 'json',
//            getData: function() {},
//            doPost: function () {
//                return {
//                    responseText: Ext.encode({
//                        items: [{}]
//                    }),
//                    status: 200
//                };
//            }
//        }
//    ]);


//}