/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.discount.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.discount.Form',
        'Taco.core.ux.action.DeleteMenuItem'
    ],
    formCls: 'Taco.view.discount.Form',
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

        menuItems.push({
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
        });

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

        this.additionalActions = [{
            xtype: 'button',
            itemId: 'moreButton',
            ui: 'action',
            scale: 'medium',
            text: 'More',
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                items: menuItems
            }
        }];

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

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});