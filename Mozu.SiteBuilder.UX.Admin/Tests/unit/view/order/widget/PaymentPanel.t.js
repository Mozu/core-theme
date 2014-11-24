StartTest(function(t) {
    var m = {};

    function getOrder(cb) {
        Taco.model.Order.load('Orders2Payments', {
            success: function(o) {
                //var passoc = o.associations.getByKey('payments');
                //passoc.read(o, passoc.getReader(), o.data.payments);
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

   
    function setupPanels(details) {
        return function(next) {
            t.diag('order status ' + details.orderStatus);
            getOrder(function(record) {
                record.set(details);
                Taco.app.viewPort.removeAll(true);
                m.newPanel = Ext.create(
                    'Taco.view.order.widget.PaymentPanel', { order: record, record: record.payments().getAt(0), width: 500 }
                );
                Taco.app.viewPort.add(m.newPanel);
                m.pendingPanel = Ext.create(
                    'Taco.view.order.widget.PaymentPanel', { order: record, record: record.payments().getAt(2), width: 500 }
                );
                Taco.app.viewPort.add(m.pendingPanel);
                m.authorizedPanel = Ext.create(
                    'Taco.view.order.widget.PaymentPanel', { order: record, record: record.payments().getAt(1), width: 500 }
                );
                Taco.app.viewPort.add(m.authorizedPanel);

                t.waitForComponentVisible(m.authorizedPanel, next);
            });
        }   
       
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
            t.it("Should have requireable files", function(t) {
                t.requireOk(
                    'Taco.model.Order',
                    'Taco.view.order.subform.Payment',
                    'Taco.view.order.widget.PaymentPanel',
                    next
                );
            });
        },

        setupPanels({
            orderStatus: "Accepted",
            authorizationInfo: {
                amountCollected: 0,
                captureAmount: 64,
                totalAmount: 64
            }
        }),
        function(next) {
            // statusRow
            t.diag("panel for authorized payment");
            var statusField = m.authorizedPanel.statusField;
            t.is(statusField.getEl().getHTML(), "Status: Authorized", "status displays as Authorized");
            var orderApprovedNotice = m.authorizedPanel.down('#orderApprovedNotice');
            t.ok(orderApprovedNotice && orderApprovedNotice.isHidden(), "orderApprovedNotice is hidden");
            
            // more actions menu
            var moreActionsButton = m.authorizedPanel.down('#moreActionsButton'),
                menuActions = moreActionsButton && moreActionsButton.getEl() && moreActionsButton.menu.items.filter('hidden', false) || [],
                dataActions = Ext.Array.filter(m.authorizedPanel.record.data.availableActions, function(act) { return act !== "CapturePayment"; });
            
            t.ok(menuActions.length === dataActions.length, "More Actions menu items display the available actions on the order");
            

            // capture button
            t.ok(m.authorizedPanel.captureButton && m.authorizedPanel.captureButton.getEl() && !m.authorizedPanel.captureButton.isDisabled(), "capturebutton exists and is enabled");

            t.diag("panel for pending payment");
            statusField = m.pendingPanel.statusField;
            t.is(statusField.getEl().getHTML(), "Status: Pending", "status displays as Pending");
            orderApprovedNotice = m.pendingPanel.down('#orderApprovedNotice');
            t.ok(orderApprovedNotice && orderApprovedNotice.isHidden(), "orderApprovedNotice is hidden");
            
            // more actions menu
            moreActionsButton = m.pendingPanel.down('#moreActionsButton');
            t.ok(moreActionsButton && moreActionsButton.getEl() && (moreActionsButton.menu.items.filter('hidden', false).length === Ext.Array.filter(m.pendingPanel.record.data.availableActions, function(act) { return act !== "CapturePayment"; }).length), "More Actions menu items display the available actions on the order");


            t.ok(m.pendingPanel.captureButton && m.pendingPanel.captureButton.getEl() && m.pendingPanel.captureButton.isDisabled(), "capturebutton exists but disabled");

            // displayamount
            var displayAmountElement;
            t.ok(m.authorizedPanel.displayAmount && (displayAmountElement = m.authorizedPanel.displayAmount.getEl()), "displayAmount exists and has an element");

            function confirmVisible(name) {
                t.is(t.cq1('window{isVisible()}'), m.authorizedPanel.actionModal, name + " modal is showing");
            }




            Taco.app.viewPort.removeAll(true);
            var r = m.authorizedPanel.order;
            m.authorizedPanel = Ext.create(
                    'Taco.view.order.widget.PaymentPanel', { order: r, record: r.payments().getAt(1), width: 500 }
                );
            Taco.app.viewPort.add(m.authorizedPanel);

            // actions
            var chain = [function(next) {
                t.diag('capture button');
                t.clickCQ('#captureButton', m.authorizedPanel, function() {
                    confirmVisible("capture");
                    m.authorizedPanel.actionModal.destroy();
                    next();
                });
            }, function(next) {
                t.waitForComponentVisible(m.authorizedPanel, function() {
                    moreActionsButton = m.authorizedPanel.down('#moreActionsButton');
                    t.diag("More Actions menu");
                    next(); 
                })
            }].concat(m.authorizedPanel.record.data.availableActions.filter(function(action) { return action !== "CapturePayment" && action !== "ManualDeclinePayment"; }).map(function(action) {
                return function(next) {
                    t.click(moreActionsButton, function() {
                        t.waitForComponentVisible(moreActionsButton.menu, function() {
                            t.click(moreActionsButton.menu.down('#' + action), function() {
                                t.waitForCQ('window{isVisible()}', function() {
                                    confirmVisible(action);
                                    m.authorizedPanel.actionModal.destroy();
                                    t.waitForComponentVisible(moreActionsButton, next);
                                });
                            });
                        });
                    });
                }
            }));

            t.chain(chain.concat([next]));

        },
        setupPanels({
            orderStatus: "PendingReview",
            authorizationInfo: {
                amountCollected: 0,
                captureAmount: 64,
                totalAmount: 64
            }
        }),
        function(next) {
            // statusRow
            t.diag("panel for authorized payment");
            var statusField = m.authorizedPanel.statusField;
            t.is(statusField.getEl().getHTML(), "Status: Authorized", "status displays as Authorized");
            var orderApprovedNotice = m.authorizedPanel.down('#orderApprovedNotice');
            t.ok(orderApprovedNotice && orderApprovedNotice.getEl() && !orderApprovedNotice.isHidden(), "orderApprovedNotice is showing");

            // more actions menu
            var moreActionsButton = m.authorizedPanel.down('#moreActionsButton');
            t.ok(moreActionsButton && moreActionsButton.getEl() && (moreActionsButton.menu.items.filter('hidden', false).length === Ext.Array.filter(m.authorizedPanel.record.data.availableActions, function(act) { return act !== "CapturePayment"; }).length), "More Actions menu items display the available actions on the order");
            

            // capture button
            t.ok(m.authorizedPanel.captureButton && m.authorizedPanel.captureButton.getEl() && m.authorizedPanel.captureButton.isDisabled(), "capturebutton exists and disabled");

            t.diag("panel for pending payment");
            statusField = m.pendingPanel.statusField;
            t.is(statusField.getEl().getHTML(), "Status: Pending", "status displays as Pending");
            orderApprovedNotice = m.pendingPanel.down('#orderApprovedNotice');
            t.ok(orderApprovedNotice && !orderApprovedNotice.isHidden(), "orderApprovedNotice is showing");

            // more actions menu
            moreActionsButton = m.pendingPanel.down('#moreActionsButton');
            t.ok(moreActionsButton && moreActionsButton.getEl() && (moreActionsButton.menu.items.filter('hidden', false).length === Ext.Array.filter(m.pendingPanel.record.data.availableActions, function(act) { return act !== "CapturePayment"; }).length), "More Actions menu items display the available actions on the order");


            t.ok(m.pendingPanel.captureButton && m.pendingPanel.captureButton.getEl() && m.pendingPanel.captureButton.isDisabled(), "capturebutton exists but disabled");


            t.diag("panel for new payment");
            statusField = m.newPanel.statusField;
            t.is(statusField.getEl().getHTML(), "Status: New", "status displays as New");
            orderApprovedNotice = m.newPanel.down('#orderApprovedNotice');
            t.ok(orderApprovedNotice && !orderApprovedNotice.isHidden(), "orderApprovedNotice is showing");

            // more actions menu
            moreActionsButton = m.newPanel.down('#moreActionsButton');
            t.ok(moreActionsButton && moreActionsButton.getEl() && (moreActionsButton.menu.items.filter('hidden', false).length === Ext.Array.filter(m.newPanel.record.data.availableActions, function(act) { return act !== "CapturePayment"; }).length), "More Actions menu items display the available actions on the order");


            t.ok(m.newPanel.captureButton && m.newPanel.captureButton.getEl() && m.newPanel.captureButton.isDisabled(), "capturebutton exists but disabled");


            // testing all actions


        }

    );

});

