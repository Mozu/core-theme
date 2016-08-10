/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.discount.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.discount.Form',
        'Taco.core.ux.action.DeleteMenuItem'
    ],
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.discount.Form',
    parentTitleCfg: {
        title: 'Discounts',
        controller: 'discounts'
    },
    statics: {
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                shippingMethodsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods'),

                shippingZonesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones')
            });
          
            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.discount.Edit', cfg));
                },
                tasks: [
                    {
                        storeToLoad: cfg.shippingMethodsStore
                    },
                    {
                        storeToLoad: cfg.shippingZonesStore
                    }
                ],
                autoExecute: true,
            });
        }
    },

    enableNextPrevious: true,

    nextPreviousCfg: {
        store: "Taco.store.DiscountGrid",
        url: "/discounts/edit/",
        nextButtonTipTpl: "Next Discount <div style='padding-top:10px;'>{name}</div><div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:center;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
        previousButtonTipTpl: "Previous Discount <div style='padding-top:10px;'>{name}</div><div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:center;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
        stateId: "statefulDiscountGrid"
    },

    initComponent: function () {
        var me = this,
            menuItems = [],
            delMenuItem;

        if (me.isDuplicate) {
            me.record.isDuplicate = true;
        }

        me.moreButtonCfg = {
            menu: [
               {
                text: 'Duplicate',
                    disabled: me.record.phantom,
                    requiredBehaviors: {
                        model: 'Taco.model.Discount',
                        behavior: 'create'
                    },
                    handler: function(item) {
                        var record = me.record,
                            metaData = {
                                id: record.getId()
                            };

                        Taco.app.StateManager.attemptNavigate('discounts/duplicate/' + record.getId(), metaData);
                    }
                },
                {
                    text: 'Delete',
                    requiredBehaviors: {
                        model: 'Taco.model.Discount',
                        behavior: 'destroy'
                    },
                    handler: Ext.bind(me.destroyRecord, me)
                }
            ]
        };

        if (me.record.get('canBeDeleted')) {
            delMenuItem = Ext.create('Taco.core.ux.action.DeleteMenuItem', {
                record: me.record,
                modelName: 'Taco.model.Discount',
                storeName: 'Taco.store.DiscountGrid',
                collectionName: 'discounts',
                promptMessage: me.record.getDeletePromptMessage(),
            });
            menuItems.push(delMenuItem);
        }

        this.callParent(arguments)
    },
    afterDuplicate: function () {
        if (this.record.get("couponCode")) {
            Taco.app.fireEvent('setmessage', "Please change the coupon code. Coupon codes must be unique", 'info');
            this.mon(this, 'afterrender', function () {

                var couponCode = this.form.findField("couponCode");
                if (couponCode) {
                    couponCode.markInvalid("Coupon codes must be unique")
                }

            }, this);
        }
    },

    destroyRecord: function () {
        var me = this;
    
        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: 'Are you sure you want to delete this?',
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {                    
                    me.setLoading(true, me.body);
                    me.record.destroy({
                        success: function (m) {
                            var discountStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.DiscountGrid');
                            if (discountStore) {
                                discountStore.needsRefresh = true;
                            }

                            var contextUrl = Taco.app.context.getCurrentContext().urlToken;                            
                            // need to invalidate the grid store so that the record is removed;
                            Taco.core.StateManager.attemptNavigate(contextUrl + '/discounts');
                        },
                        failure: function (m) {
                            Taco.app.fireEvent('setmessage', 'error deleting discount', 'error');
                        },
                        callback: function () {
                            me.setLoading(true, me.body);
                        }
                    });
                }
            }
        });

    },
    onSaveSuccess: function(record) {
        this.updateTitle(record.get('name'));
    },
    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});