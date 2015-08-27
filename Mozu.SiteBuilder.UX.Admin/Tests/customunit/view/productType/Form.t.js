StartTest(function(t) {
    t.setOnlyMocks();

    t.describe("Product Type", function(t) {
        var m = {};

        var setUp = function(data, next) {
            Taco.app.viewPort.removeAll(true);
            m.record = Ext.create('Taco.model.ProductType', data);
            m.form = Ext.create('Taco.view.productType.Form', {
                record: m.record
            });
            Taco.app.viewPort.add(m.form);
            t.waitForComponentVisible(m.form, next);
        };

        var selectDigitalCreditCheckbox = function(next) {
            m.digitalCreditCheckbox = m.form.down('#digitalCreditItemId');
            t.click(m.digitalCreditCheckbox, next);
        };

        var setName = function(name, next) {
            m.name = m.form.down('#nameItemId');
            t.type(m.name, name, next);
        };

        
        // To increase revenue and profits, as a merchant, I want to offer Gift Cards
        t.describe('Merchants want to offer Gift Cards to increase revenue and profits', function (t) {

            t.it("Should allow a merchant to designate a digital credit/gift card goods type.", function(t) {

                m = {};

                t.chain(

                    function arrange (next) {
                        setUp({}, next);
                    },

                    function makeSelections (next) {
                        setName('Gift Card');
                        selectDigitalCreditCheckbox(next);
                    },

                    function saveForm(next) {
                        t.is(m.record.get('goodsType'), 'Physical', "Before save, goods type should be 'Physical'");
                        m.form.save();
                        next();
                    },

                    function assert (next) {
                        t.is(m.record.get('goodsType'), 'DigitalCredit', "After save, goods type should be 'DigitalCredit'");
                    }
                );
            });

            t.it("Should make 'Physical' the default goods type.", function (t) {

                m = {};

                t.chain(

                    function arrange(next) {
                        setUp({}, next);
                    },

                    function enterName (next) {
                        setName('Physical Product Type', next);
                    },

                    function saveForm (next) {
                        t.is(m.record.get('goodsType'), 'Physical', "Before save, goods type should be default 'Physical'");
                        m.form.save();
                        next();
                    },

                    function assert (next) {
                        t.is(m.record.get('goodsType'), 'Physical', "After save, goods type should be 'Physical'");
                    }
                );
            });

            t.it("Should disable gift card checkbox after saving", function(t) {

                m = {};

                t.chain(
                    function arrange(next) {
                        var data = {
                            id: 1,
                            name: 'Existing',
                            goodsType: 'Physical',
                            numberOfProducts: 1,
                            productUsages: ["Standard", "Configurable", "Component"]
                        };
                        setUp(data, next);
                    },

                    function verifyDigitalCheckboxIsDisabled (next) {
                        m.digitalCreditCheckbox = m.form.down('#digitalCreditItemId');
                        t.is(m.digitalCreditCheckbox.isDisabled(), true, 'Digital Credit checkbox should be disabled.');
                        next();
                    },

                    function saveForm(next) {
                        t.is(m.record.get('goodsType'), 'Physical', "Before save, goods type should be 'Physical'");
                        m.form.save();
                        next();
                    },

                    function assert(next) {
                        t.is(m.record.get('goodsType'), 'Physical', "Should not be able to change goodsType after creation");
                    }
                );
            });

            t.xit("Should disable bundle type when creating digital credit/gift card goods type.", function (t) {

                m = {};

                t.chain(

                    function arrange(next) {
                        setUp({}, next);
                    },

                    function makeSelections(next) {
                        setName('Gift Card');
                        selectDigitalCreditCheckbox(next);
                    },

                    function verifyProductBundleIsDisabled(next) {
                        //t.is(m.form.down('#productBundleItemId').isDisabled(), true, 'Product Bundle should be disabled after selecting Digital goods type');
                        next();
                    },

                    function saveForm(next) {
                        t.is(m.record.get('goodsType'), 'Physical', "Before save, goods type should be 'Physical'");
                        m.form.save();
                        next();
                    },

                    function assert(next) {
                        t.is(m.record.get('goodsType'), 'DigitalCredit', "After save, goods type should be 'DigitalCredit'");
                       // t.is(m.record.get('productUsages').indexOf('Bundle'), -1, 'Should not contain Product Bundle after saving');
                    }
                );
            });

        });

    });
});


function SetupMocks (t, next, m) {
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
