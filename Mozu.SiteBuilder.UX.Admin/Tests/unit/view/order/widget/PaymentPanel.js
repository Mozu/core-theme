StartTest(function(t) {
    var m = {};

    //Bug 28406:SEO fields missing for CMS pages in Site Builder

    function makeOrder(details) {
        var o = Ext.create('Taco.model.Order', Ext.Object.merge({
            "id": "abc",
            "orderNumber": 2,
            "name": "seo-name",
            "payments": [
                {
                    "orderId": "abc",
                    "status": "New",
                    "amountCollected": 0.0,
                    "amountAuthorized": 0.0,
                    "amountCredited": 0.0,
                    "interactions": [
                    ],
                    "availableActions": [
                    ],
                    "isManual": false,
                    "createDate": "2014-05-30T23:22:36.122Z"
                },
                {
                    "orderId": "abc",
                    "paymentServiceTransactionId": "6bbbef677ae74f92aeb80dbdfc631c8d",
                    "status": "Authorized",
                    "amountCollected": 0.0,
                    "amountAuthorized": 64.0,
                    "amountCredited": 0.0,
                    "interactions": [
                      {
                          "id": "ba8b3fa1bc214a2cada7a33b010de3ce",
                          "paymentId": "3164ef3ae479426fb7c2a33b010de136",
                          "gatewayTransactionId": "2214106066",
                          "gatewayInteractionId": 0,
                          "interactionType": "Authorization",
                          "status": "Authorized",
                          "gatewayResponseCode": "1",
                          "gatewayResponseText": "This transaction has been approved.",
                          "amount": 64.0,
                          "isManual": false,
                          "createDate": "2014-05-30T16:22:38.337Z",
                          "canEdit": false,
                          "canDelete": false
                      }
                    ],
                    "paymentType": "CreditCard",
                    "cardType": "VISA",
                    "cardNumber": "************1111",
                    "nameOnCard": "CreditCardName",
                    "availableActions": [
                      "VoidPayment",
                      "CapturePayment",
                      "DeclinePayment",
                      "ManualVoidPayment",
                      "ManualCapturePayment",
                      "ManualDeclinePayment"
                    ],
                    "isManual": false,
                    "createDate": "2014-05-30T16:22:36.122Z"
                },
                {
                    "orderId": "abc",
                    "paymentServiceTransactionId": "bb09f5c71c764d8b8cc0783be5f37eb6",
                    "status": "Pending",
                    "amountCollected": 0.0,
                    "amountAuthorized": 0.0,
                    "amountCredited": 0.0,
                    "interactions": [
                      {
                          "id": "1c50ce8fce5e4c2f928ca33b010dcd5b",
                          "paymentId": "2f3c12151b6945708dc6a33b010dc352",
                          "gatewayTransactionId": "0",
                          "gatewayInteractionId": 0,
                          "interactionType": "Authorization",
                          "status": "Failed",
                          "gatewayResponseCode": "78",
                          "gatewayResponseText": "The card code is invalid.",
                          "amount": 64.0,
                          "isManual": false,
                          "createDate": "2014-05-30T16:22:19.179Z",
                          "canEdit": false,
                          "canDelete": false
                      }
                    ],
                    "paymentType": "CreditCard",
                    "cardType": "VISA",
                    "cardNumber": "************1111",
                    "nameOnCard": "CreditCardName",
                    "availableActions": [
                      "VoidPayment",
                      "ManualVoidPayment"
                    ],
                    "isManual": false,
                    "createDate": "2014-05-30T16:22:10.614Z"
                }
            ],
        }, details)
        );
        var passoc = o.associations.getByKey('payments');
        passoc.read(o, passoc.getReader(), o.data.payments);
        return o;
    }

    var completedOrder = makeOrder({
        orderStatus: "Completed",
        authorizationInfo: {
            amountCollected: 121,
            captureAmount: 0,
            totalAmount: 121
        }
    });

    function setupPanels(details) {
        var record = makeOrder(details);
        return function(next) {
            t.diag('order status ' + details.orderStatus);
            Taco.app.viewPort.removeAll(true);
            m.newPanel = Ext.create(
                'Taco.view.order.widget.PaymentPanel', { order: record, record: record.payments().getAt(0), width: 500 }
            );
            Taco.app.viewPort.add(m.newPanel);
            m.authorizedPanel = Ext.create(
                'Taco.view.order.widget.PaymentPanel', { order: record, record: record.payments().getAt(1), width: 500 }
            );
            Taco.app.viewPort.add(m.authorizedPanel);
            m.pendingPanel = Ext.create(
                'Taco.view.order.widget.PaymentPanel', { order: record, record: record.payments().getAt(2), width: 500 }
            );
            Taco.app.viewPort.add(m.pendingPanel);

            t.waitForComponentVisible(m.pendingPanel, next);
        }
    }

    t.setOnlyMocks();

    t.chain(
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
            var moreActionsButton = m.authorizedPanel.down('#moreActionsButton');

            t.ok(moreActionsButton && moreActionsButton.getEl() && (moreActionsButton.menu.items.filter('hidden', false).length === Ext.Array.filter(m.authorizedPanel.record.data.availableActions, function(act) { return act !== "CapturePayment"; }).length), "More Actions menu items display the available actions on the order");
            

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

            next();

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

        }

    );

});

