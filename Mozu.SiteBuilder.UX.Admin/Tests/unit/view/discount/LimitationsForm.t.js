StartTest(function (t) {
    var m = {};

    function getDiscount(cb) {
        Taco.model.Discount.load(1, {
            success: function(discountRecord) {
                m.record = discountRecord;
                cb(discountRecord);
            },
            failure: function() {
                t.fail('Failed to load the discount');
            }
        });
    }

    t.setOnlyMocks();
    t.simManager().register([
        {
            url: '/admin/app/discount/list',
            jsonFile: '/admin/tests/mocks/Mystic1/Discounts1.json'
        }
    ]);

    t.describe("The Discount Limitations Form", function (t) {
        t.chain(

            function (next) {
                t.it("Should have required files", function (t) {
                    t.requireOk(
                        'Taco.model.Discount',
                        'Taco.view.discount.LimitationsForm',
                        'Taco.store.Discounts',
                        next
                    );
                });
            },

            getDiscount,

            function (next) {
                t.it("Should create a discount.LimitationsForm", function (t) {
                    m.form = Ext.create('Taco.view.discount.LimitationsForm', {
                        record: m.record,
                        renderTo: Ext.getBody()
                    });
                    t.waitForComponentVisible(m.form, next);
                });
            },

            function (next, res) {
                t.setFormValues('Set maxDiscountValuePerOrder to positive number', m.form, {
                    maximumDiscountValuePerOrder: 123
                }, next);
            },

            function (next) {
                t.it("Should have a maxDiscountValuePerOrder", function (t) {
                    m.maxDiscountValuePerOrderFld = m.form.down('#maxDiscountValuePerOrder');
                    t.ok(m.maxDiscountValuePerOrderFld !== null, 'new product code field should not be null');
                    t.ok(m.maxDiscountValuePerOrderFld.getValue() === 123, 'Value should be 123');
                    next();
                });
            },

            function (next, res) {
                t.setFormValues('Set maxDiscountValuePerOrder to negative number', m.form, {
                    maximumDiscountValuePerOrder: -123
                }, next);
            },

            function (next) {
                t.it("Should prevent a negative maxDiscountValuePerOrder", function (t) {
                    t.notOk(m.maxDiscountValuePerOrderFld.isValid(), 'Max field should be invalid after entering a negative number');
                });
            }

        );
    });

});

