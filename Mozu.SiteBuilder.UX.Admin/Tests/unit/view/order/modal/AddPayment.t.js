StartTest(function (t) {
    var m = {};

    function getOrder(cb) {
        Taco.model.Order.load('Orders2Payments', {
            success: function(o) {
                //var passoc = o.associations.getByKey('payments');
                //passoc.read(o, passoc.getReader(), o.data.payments);
                o.associations.each(function(assoc) {
                    if (assoc.name in o.data) assoc.read(o, assoc.getReader(), o.data[assoc.name] || []);
                });
                m.record = o;
                cb(o);
            },
            failure: function() {
                t.fail('Failed to load the order');
            }
        });
    }

    function confirmVisible(name, cmp) {
        t.is(cmp.isVisible(), true, name + " modal is showing");
    }

    t.setOnlyMocks();
    t.simManager().register([
        {
            url: '/admin/app/order/list',
            jsonFile: '/admin/tests/mocks/Mystic1/Orders2Payments.json'
        }
    ]);

    t.describe("Add a new Payment to the order.", function (t) {
        t.chain(

            function (next) {
                t.it("Should have requireable files", function (t) {
                    t.requireOk(
                        'Taco.model.Order',
                        'Taco.view.order.modal.AddPayment',
                        'Taco.model.Card',
                        next
                    );
                });
            },

            getOrder,

            function (next) {
                t.it("Should create with a payment modal", function (t) {
                    m.modal = Ext.create('Taco.view.order.modal.AddPayment', {
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

            /*function (next) {
                t.it('Populate the new card', function(t) {
                    t.waitForComponentVisible(m.modal, function () {
                        confirmVisible(m.modal);
                        m.modal.down('#nameOnCard').setValue('John Doe');
                        m.modal.down('#amount').setValue('30.85');
                        m.modal.down('#cardType').setValue('VISA');
                        m.modal.down('#cardNumber').setValue('4111111111111111');
                        m.modal.down('#expireMonth').setValue('1');
                        m.modal.down('#expireYear').setValue('2020');
                        m.modal.down('#cvv').setValue('111');
                        t.click(m.modal.down('#primaryAction'), function() {
                            next();
                        });
                    });
                });
            },

            function(next) {
                t.it("Should create with a second payment modal", function (t) {
                    m.modal = Ext.create('Taco.view.order.modal.AddPayment', {
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
            },*/

            function(next) {
                t.it('Create a payment with the existing card', function (t) {

                    t.waitForComponentVisible(m.modal, function () {
                        confirmVisible('Main Payment Modal',  m.modal);
                        confirmVisible('Card Use Section', m.modal.down('#cardUse'));

                        var paymentPicker = m.modal.down('#existingPaymentPicker');
                        var chosenPayment = paymentPicker.store.queryBy(function(payment) {
                            return payment.get('id') === '2';
                        });

                        paymentPicker.select(chosenPayment.items[0]);

                        m.modal.down('#existingCardAmount').setValue('20');

                        t.click(m.modal.down('#primaryAction'), function () {
                            var payload = m.modal.getPaymentPayload();
    
                            var existingPayment = m.record.get('payments').filter(function (payment) {
                                return payment.id === '2';
                            })[0];

                            t.is(payload.orderId, m.record.getId(), "order ID present");
                            t.is(payload.billingInfo.paymentServiceCardId, existingPayment.paymentServiceCardId, "payment card ID is present");
                            t.is(payload.billingInfo.nameOnCard, existingPayment.nameOnCard, "name on card is present");
                            t.is(payload.billingInfo.cardType, existingPayment.cardType, "card type is present");
                            t.is(payload.billingInfo.cardNumber, existingPayment.cardNumber, "card number is present");
                            t.is(payload.billingInfo.expireMonth, existingPayment.expireMonth, "expire month is present");
                            t.is(payload.billingInfo.expireYear, existingPayment.expireYear, "expire year is present");

                        });
                    });
                });
            }

        );
    });

});

