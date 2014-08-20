StartTest(function (t) {
    var m = {};

    function getOrder(cb) {
        Taco.model.Order.load('Orders2Payments', {
            success: function (o) {
                //var passoc = o.associations.getByKey('payments');
                //passoc.read(o, passoc.getReader(), o.data.payments);
                o.associations.each(function (assoc) {
                    if (assoc.name in o.data) assoc.read(o, assoc.getReader(), o.data[assoc.name] || []);
                });
                m.record = o;
                cb(o);
            },
            failure: function () {
                t.fail('Failed to load the order');
            }
        })
    }

    t.setOnlyMocks();
    t.simManager().register([
        {
            url: '/admin/app/order/list',
            jsonFile: '/admin/tests/mocks/Mystic1/Orders2Payments.json'
        },
        {
            url: '/admin/app/customer/credits/list',
            jsonFile: '/admin/tests/mocks/Mystic1/StoreCredits1.json'
        }
    ]);

    t.describe("The Add Gift Cards/Store Credit modal", function (t) {
        t.chain(

            function (next) {
                t.it("Should have requireable files", function (t) {
                    t.requireOk(
                        'Taco.model.Order',
                        'Taco.view.order.modal.AddGiftCard',
                        'Taco.model.StoreCredit',
                        next
                    );
                });
            },

            getOrder,

            function (next) {
                t.it("should create with a store and an order", function (t) {
                    m.modal = Ext.create('Taco.view.order.modal.AddGiftCard', {
                        record: m.record,
                        listeners: {
                            activate: function () {
                                t.ok(this.getEl(), "modal created and showing");
                                next();
                            }
                        }
                    });
                    Taco.app.viewPort.removeAll();
                    m.modal.show();
                });
            },

            function (next) {
                t.it("should have a getApplyingCreditData method that returns a collection of credits with positive amounts to apply", function (t) {
                    m.modal.storeCreditsStore.findRecord('code', 'crm114').set('amtToApply', 100);
                    var payload = m.modal.getApplyingCreditData();
                    t.is(payload.orderId, m.record.getId(), "order ID present");
                    t.is(payload.customerId, m.record.get('customerId'), "customer ID present");
                    t.ok(payload.payments && payload.payments.length === 1, "single payment present");
                    t.ok(payload.payments[0].code === "crm114" && payload.payments[0].amtToApply === 100, "the right payment");
                });
            }

        );
    });

});

