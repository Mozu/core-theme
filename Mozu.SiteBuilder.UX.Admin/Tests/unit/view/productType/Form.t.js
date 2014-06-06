StartTest(function(t) {
    t.setOnlyMocks();

    t.describe("Product Type", function(t) {
        var m = {};

        t.requireOk('Taco.view.productType.Form', 'Taco.core.ux.form.field.MultiSelect',
            'Taco.core.ux.BoxReorderer',
            'Taco.model.ProductTypeAttribute',
            'Taco.model.ProductType',
            'Taco.view.productType.AttributeGroup');

        t.describe('To increase revenue and profits, as a merchant, I want to offer Gift Cards', function(t) {

            t.it("Should allow a merchant to designate a digital credit/gift card goods type.", function(t) {

                m = {};

                t.chain(

                    function setup (next) {
                        Taco.app.viewPort.removeAll(true);
                        m.record = Ext.create('Taco.model.ProductType', { });
                        m.form = Ext.create('Taco.view.productType.Form', {
                            record: m.record
                        });
                        Taco.app.viewPort.add(m.form);
                        t.waitForComponentVisible(m.form, next);
                    },

                    function setName (next) {
                        m.name = m.form.down('#nameItemId');
                        t.type(m.name, 'MyFirstSiesta_Olay!', next);
                    },

                    function selectDigitalCreditCheckbox (next) {
                        m.digitalCreditCheckbox = m.form.down('#digitalCreditItemId');
                        t.click(m.digitalCreditCheckbox, next);
                    },

                    function saveForm (next) {
                        t.is(m.record.get('goodsType'), 'Physical', "Before save, goods type should be default 'Physical'");
                        //t.expect(m.record.get('goodsType')).toBe('Physical'); //default expected
                        m.form.save();
                        next();
                    },

                    function assert (next) {
                        t.is(m.record.get('goodsType'), 'DigitalCredit', "After save, goods type should be 'DigitalCredit'");
                        //t.expect(m.record.get('goodsType')).toBe('DigitalCredit');
                    }
                );
            });
        });

    });
});

function RegisterMocks (t, next, m) {
    t.simManager().register([
            //{
            //    url: '/admin/app/ProductType/read',
            //    jsonFile: '/admin/tests/mocks/Mystic1/ProductTypes1.json'
            //},
            {
                url: '/admin/app/ProductType/create',
                stype: 'json',
                getData: function () {
                    return [
                        {
                            goodsType: m.goodsType
                        }
                    ];
                },
                doPost: function () {
                    return this.doGet.apply(this, arguments);
                }
            }
    ]);


}
