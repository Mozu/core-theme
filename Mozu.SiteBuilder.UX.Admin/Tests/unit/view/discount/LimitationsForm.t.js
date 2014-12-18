StartTest(function (t) {
    var m = {};

    function getDiscount(cb) {
        Taco.model.Discount.load(3, {
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

    t.describe("Setup the Discount Limitations Form", function (t) {
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
            }
        );
    });

    t.describe("MaxDiscountValuePerOrder Field", function (t) {
        t.chain(

            function (next) {
                t.setFormValues('Set maxDiscountValuePerOrder to positive number', m.form, {
                    maximumDiscountValuePerOrder: 123
                }, next);
            },

            function (next) {
                t.it("Should have a maxDiscountValuePerOrder", function (t) {
                    m.maxDiscountValuePerOrderFld = m.form.down('#maxDiscountValuePerOrder');
                    t.ok(m.maxDiscountValuePerOrderFld !== null, 'maxDiscountValuePerOrder field should not be null');
                    t.ok(m.maxDiscountValuePerOrderFld.getValue() === 123, 'Value should be 123');
                    next();
                });
            },

            function (next) {
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

    t.describe("MaxRedemptionsPerOrderLimits Field", function (t) {
        t.chain(

            function (next) {
                t.setFormValues('Set maxDiscountValuePerOrder to positive number', m.form, {
                    maximumRedemptionsPerOrder: 123
                }, next);
            },

            function (next) {
                t.it("Should have a maximumRedemptionsPerOrder", function (t) {
                    m.maxRedemptionsPerOrderFld = m.form.down('#maxRedemptionsPerOrder');
                    t.ok(m.maxRedemptionsPerOrderFld !== null, 'maxRedemptionsPerOrder field should not be null');
                    t.ok(m.maxRedemptionsPerOrderFld.getValue() === 123, 'Value should be 123');
                    next();
                });
            },

            function (next) {
                t.setFormValues('Set maxRedemptionsPerOrder to negative number', m.form, {
                    maximumRedemptionsPerOrder: -123
                }, next);
            },

            function (next) {
                t.it("Should prevent a negative maxRedemptionsPerOrder", function (t) {
                    t.notOk(m.maxRedemptionsPerOrderFld.isValid(), 'Max field should be invalid after entering a negative number');
                    next();
                });
            },

            function (next) {
                t.it("Should hide the maxRedemptionsPerOrder field for Order level discounts", function (t) {
                    m.form.setFieldVisibility(false);
                    t.notOk(m.maxRedemptionsPerOrderFld.isVisible(), 'Max field should be hidden for order level discounts');
                    t.ok(m.maxRedemptionsPerOrderFld.getValue() === null, 'Value should be set to null when hidden.');
                });
            }

        );
    });

});

