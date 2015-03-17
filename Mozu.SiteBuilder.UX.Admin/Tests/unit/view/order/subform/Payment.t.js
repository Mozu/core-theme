
StartTest(function(t) {
    var m = {};

    function getOrder(cb) {
        Taco.model.Order.load('Orders2Payments', {
            success: function(o) {
                o.associations.each(function(assoc) {
                    if (assoc.name in o.data) assoc.read(o, assoc.getReader(), o.data[assoc.name] || []);
                });
                cb(o);
            },
            failure: function() {
                t.fail('Failed to load the order');
            }
        })
    }

    t.setOnlyMocks();

    t.simManager().register([
    {
        url: '/admin/app/order/list',
        jsonFile: '/admin/tests/mocks/Mystic1/Orders2Payments.json'
    }
    ]);

    t.chain(

        function(next) {
            getOrder(function(order) {
                m.record = order;
                next();
            });
        },

        function(next) {
            Taco.app.viewPort.removeAll(true);
            m.panel = Ext.create(
                'Taco.view.order.subform.Payment', { record: m.record, width: 500 }
            );

            m.panel.on('boxready', next, { single: true });

            Taco.app.viewPort.add(m.panel);

            

            //t.waitForComponentVisible(m.panel, next);

        },

        function(next) {
            m.panel.on('rerender', next, { single: true });
            m.record.set({
                authorizationInfo: {
                    amountCollected: 1045.85,
                    totalAmount: 1045.85
                }
            });
            m.record.commit();
        },

        function(next) {
            t.diag("panel header bound to record");
            m.panel.on('rerender', next, { single: true });
            t.isHandleHtml(m.panel, 'order-payment-status', 'Paid', 'panel header reflects fully paid status');
            m.record.set({
                authorizationInfo: {
                    amountCollected: 0,
                    totalAmount: 1045.85
                }
            });

            m.record.commit();
            //t.waitForMs(500, next);
        },

        function(next) {
            t.isHandleHtml(m.panel, 'order-payment-status', 'Unpaid', 'panel header reflects unpaid status and updates');
            m.panel.on('rerender', next, { single: true });
            m.record.set({
                authorizationInfo: {
                    amountCollected: 1000,
                    totalAmount: 1045.85
                }
            });

            m.record.commit();
            //t.waitForMs(500, next);
        },

        
        function(next) {
            t.isHandleHtml(m.panel, 'order-payment-status', 'Pending', 'panel header reflects partially paid status and updates');

            t.diag("payment actions should be available when order is pending");

            Ext.Object.each(m.panel.paymentActions, function(k, action) {
                t.notOk(action.isDisabled(), k + " is enabled");
            });



            //t.elementIsVisible(m.panel.down('#paymentGear').getEl(), 'gear shoul be visable on Processing');

            m.record.set('orderStatus', 'PendingReview');
            Taco.app.viewPort.removeAll(true);
            m.panel = Ext.create(
                'Taco.view.order.subform.Payment', { record: m.record, width: 500 }
            );
            m.panel.on('boxready', next, { single: true });

            Taco.app.viewPort.add(m.panel);
        },
        function(next) {

            t.diag("payment actions should be unavailable when order is pending review");
            Ext.Object.each(m.panel.paymentActions, function(k, action) {
                t.ok(action.isDisabled(), k + " is disabled");
            });
            //t.elementIsNotVisible(m.panel.down('#paymentGear').getEl(), 'gear shoul be hidden  on PendingReview');


        }

    );

});