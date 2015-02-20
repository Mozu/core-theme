//StartTest(function(t) {
//    t.setOnlyMocks();

//    t.simManager().register([
//        {
//            url: '/admin/app/ProductType/read',
//            jsonFile: '/admin/tests/mocks/Mystic1/ProductTypes1.json'
//        }
//        //,
//        //{
//        //    url: '/admin/app/ProductType/read',
//        //    stype: 'json',
//        //    getData: function () {
//        //        return [
//        //            {
//        //                id: '1',
//        //                name: 'Gift Card',
//        //                goodsType: 'DigitalCredit',
//        //                productUsages: ["Standard", "Configurable", "Bundle", "Component"]
//        //            }
//        //        ];
//        //    },
//        //    doPost: function () {
//        //        return this.doGet.apply(this, arguments);
//        //    }
//        //}
//    ]);

//    t.describe("Product", function(t) {
//        var m = {};

//        t.requireOk('Taco.view.product.subform.General',
//            'Taco.view.product.subform.Subform',
//            //'Taco.core.ux.HtmlEditor',
//            'Ext.form.field.HtmlEditor',
//            'Taco.view.product.subform.OverrideForm',
//            'Ext.form.field.ComboBox',
//            'Taco.view.product.subform.Bundle',
//            'Taco.core.ux.form.Form',
//            'Ext.data.Store',
//            'Ext.form.field.Text',
//            'Taco.shared.view.field.Image',
//            'Taco.core.ux.form.SelectField',
//            'Taco.store.ProductTypes',
//            'Taco.core.ux.form.CurrencyField');

//        t.describe('To generate revenue and increase customer satisfaction, as a Merchant, I want to setup gift cards for sale', function(t) {

//            t.it("Should create a gift card from a DigitalCredit Product Type", function(t) {

//                m = {};

//                t.chain(
                    
//                    function arrange(next) {

//                        Taco.app.viewPort.removeAll(true);
//                        m.record = Ext.create('Taco.model.Product', {});
//                        m.form = Ext.create('Taco.view.product.subform.General', {
//                            product: m.record,
//                            isGlobal: true
//                        });
//                        Taco.app.viewPort.add(m.form);
//                        t.waitForComponentVisible(m.form, next);
//                    },
//                    //function act(next) {

//                    //},
//                    function assert(next) {
//                        t.is(m.record.get(''), 'expectedValue', "expectation");
//                    }
//                );
//            });

//        });

//    });
//});

//function SetUpMocks(t, next, m) {
//    t.simManager().register([
//        {
//            url: '/admin/app/ProductType/read',
//            stype: 'json',
//            getData: function() {
//                return [
//                    {
//                        id: '1',
//                        name: 'Gift Card',
//                        goodsType: 'DigitalCredit',
//                        productUsages: ["Standard", "Configurable", "Bundle", "Component"]
//                    }
//                ];
//            },
//            doPost: function() {
//                return this.doGet.apply(this, arguments);
//            }
//        }
//    ]);


//}