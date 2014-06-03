StartTest(function (t) {
    t.setOnlyMocks();

    t.describe("Product Type", function(t) {
        var m = {};

        t.setOnlyMocks();
        t.simManager().register([
            //{
            //    url: '/admin/app/ProductType/update',
            //    jsonFile: '/admin/tests/mocks/Mystic1/ProductTypes1.json'
            //},
            {
                url: '/admin/app/ProductType/create',
                stype: 'json',
                getData: function() {
                    return [
                        {
                            goodsType: m.goodsType
                        }
                    ];
                },
                doPost: function() {
                    return this.doGet.apply(this, arguments);
                }
            }
        ]);

        t.describe('To increase revenue and profits, as a merchant, I want to offer Gift Cards', function (t) {

            t.it("Should allow a merchant to designate a digital gift card goods type.", function(t) {

                m = {};

                t.chain(
                    function requireClasses(next) {
                        //t.diag('extra add tests');
                        t.requireOk('Taco.view.productType.Form', 'Taco.core.ux.form.field.MultiSelect',
                            'Taco.core.ux.BoxReorderer',
                            'Taco.model.ProductTypeAttribute',
                            'Taco.model.ProductType',
                            'Taco.view.productType.AttributeGroup', next);
                    },
                    function setup(next) {
                        SetupModesAndViewForCreateTests(t, next, m);
                    },
                    function(next) {

                        t.subTest('Select Digital Gift Card checkbox', function(t) {
                            t.chain([
                                function (next) {
                                    m.digitalCreditCheckbox = m.form.down('#digitalCreditItemId');
                                    t.clickSelect(m.digitalCreditCheckbox, next);
                                },
                                function (next) {
                                    m.nameItemId = m.form.down('#nameItemId');
                                    //t.is(m.grid.store.getAt(0).getId(), 'aaaa', 'item found in store');
                                    //m.grid.store.commitChanges();
                                    t.clickSelect(m.itemAdder, 'Gift Card Test', next);

                                },
                                function(next) {
                                    //t.matchGridCellContent(m.grid, 1, 0, 'bbb', 'found second extra value');
                                    //t.is(m.grid.store.getAt(1).getId(), 'bbb', 'item found in store');
                                    //t.is(m.grid.store.isDirty(), true, 'extras store was updated as dirty');
                                    next();
                                }
                            ]);

                        }, next);
                    });

            });
        });

    });

});

function SetupModesAndViewForCreateTests (t, next, m) {

    m.productType = Ext.create('Taco.model.ProductType', {

    });

    t.chain(
        function (next) {
            t.waitForComponentVisible(m.form, next);
        },
        //function (next) {
        //    m.digitalCreditCheckbox = m.form.down('#digitalCreditItemId');
        //    next();
        //},
        next);


}