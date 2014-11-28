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
                m.record = o;
                cb(o);
            },
            failure: function() {
                t.fail('Failed to load the order');
            }
        })
    }

    function getStoreCreditsStore(cb) {
        var store = m.store = Taco.store.StoreCredits.createForCustomer(1003);
        store.load({
            callback: cb
        });
        return store;
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

    t.describe("The gift card grid inside the modal", function(t) {
        t.chain(

            function(next) {
                t.it("Should have requireable files", function(t) {
                    t.requireOk(
                        'Taco.model.Order',
                        'Taco.view.order.widget.GiftCardGrid',
                        'Taco.store.StoreCredits',
                        next
                    );
                });
            },

            getStoreCreditsStore,

            getOrder,

            function(next) {
                t.waitForStoresToLoad(m.store, next);
                m.store.load();
            },

            function(next) {
                t.it("should create with a store and an order", function(t) {
                    m.modal = Ext.create('Taco.view.order.modal.AddGiftCard', {
                        storeCreditsStore: m.store,
                        record: m.record,
                        listeners: {
                            activate: function() {
                                t.ok(this.getEl(), "modal created and showing");
                                next();
                            }
                        }
                    });
                    Taco.app.viewPort.removeAll();
                    m.modal.show();
                });
            },

            function(next) {
                var editor, context;
                m.grid = m.modal.down('taco-order-gift-card-grid');
                t.it("should have a getOrderBalance method", function(t) {
                    t.ok(m.grid.getOrderBalance() == m.record.getNewPaymentAmountHint());
                });

                // Note: I (simeon) removed this test, because I disabled the autoEdit feature in the view. it merely focuses on the cell so user can initiate the edit or choose another credit to use; Also I renamed the method to startInitialFocus();
                //t.it("should have a startInitialEdit method that edits the first credit", function(t) {
                //    var plugin = m.grid.findPlugin('cellediting');
                //    context = plugin.editingContext;
                //    t.ok(m.store.count() > 0, "store contains credits");
                //    m.grid.startInitialEdit();
                //    t.ok(editor = plugin.getActiveEditor(), "editor exists");
                //    t.ok(context.rowIdx === 0, "and is editing first row");
                //});
                //t.it("should set the editor value to be either the max card value or the order balance", function(t) {
                //    t.fieldHasValue(editor.field, context.record.get('currentBalance'));
                //});
                //t.it("should have a getTotalCardBalance method which reflects the total of all applied amounts", function(t) {
                //    t.willFireNTimes(m.grid, 'amountchanged', 1, "amountchanged event fired");
                //    m.grid.findPlugin('cellediting').completeEdit();
                //    t.is(m.grid.getTotalCardBalance(), m.store.first().get('currentBalance'));
                //});
            }

        );
    });

});

