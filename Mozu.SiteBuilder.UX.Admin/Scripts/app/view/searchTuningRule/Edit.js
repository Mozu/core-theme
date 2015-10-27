/**
 * @class  Taco.view.searchTuningRule.Edit
 */

Ext.define('Taco.view.searchTuningRule.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.core.ux.action.DeleteMenuItem',
        'Taco.view.searchTuningRule.Form'
    ],
    formCls: 'Taco.view.searchTuningRule.Form',
    statics: {
        factory: function (cfg, callback, scope) {
            //cfg = Ext.apply(cfg,
            //{
            //    shippingMethodsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods'),

            //    shippingZonesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones')
            //});
          
            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.searchTuningRule.Edit', cfg));
                },
                tasks: [
                    
                ],
                autoExecute: true
            });
        }
    },
    isPopUp: false,

    isCreate:true,

    isCatalogLevel: false,

    //enableNextPrevious: true,

    //nextPreviousCfg: {
    //    store: "Taco.store.SearchTuningRuleGrid",
    //    url: "/discounts/edit/",
    //    nextButtonTipTpl: "Next Discount <div style='padding-top:10px;'>{name}</div><div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:center;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
    //    previousButtonTipTpl: "Previous Discount <div style='padding-top:10px;'>{name}</div><div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:center;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
    //    stateId: "statefulDiscountGrid"
    //},

    initComponent: function () {
        var me = this,
            menuItems = [],
            delMenuItem;

        if (me.isCreate && !me.record) {
            me.record = Ext.create('Taco.model.SearchTuningRule', {});
        }
        //else if (!me.record) {
        //
        //}
        me.formCfg = {
            record: me.record,
            isCatalogLevel: me.isCatalogLevel
        };

        if (me.isPopUp) {
            //me.enableNextPrevious = false;
            me.enableNavHeader = false;
            this.callParent(arguments);
            return;
        }

        me.enableNavHeader = true;
        //me.saveAndCreateButtonEnabled = true;
        //me.enableNextPrevious = true;
        //if (me.isDuplicate) {
        //    me.record.isDuplicate = true;
        //}


        //menuItems.push({
        //    text: 'Duplicate',
        //    disabled: me.record.phantom,
        //    requiredBehaviors: {
        //        model: 'Taco.model.SearchTuningRule',
        //        behavior: 'create'
        //    },
        //    handler: function(item) {
        //        var record = me.record,
        //            metaData = {
        //                id: record.getId()
        //            };

        //        Taco.app.StateManager.attemptNavigate('searchtuningrules/duplicate/' + record.getId(), metaData);
        //    }
        //});

        delMenuItem = Ext.create('Taco.core.ux.action.DeleteMenuItem', {
            record: me.record,
            modelName: 'Taco.model.SearchTuningRule',
            storeName: 'Taco.store.SearchTuningRules',
            collectionName: 'searchTuningRules'
            //promptMessage: 'tbd' //me.record.getDeletePromptMessage()
        });
        menuItems.push(delMenuItem);

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

        this.callParent(arguments);
    },

    ///**
    // * Call the service and get an updated record.
    // */
    //loadRecord: function () {
    //    var me = this,
    //        code = me.record ? me.record.get('code') : null,
    //        searchTuningRuleModel = Ext.ModelManager.getModel('Taco.model.SearchTuningRule');
    //
    //    me.setLoading({
    //        msg: "Loading"
    //    }, me.body);
    //
    //    searchTuningRuleModel.load(code, {
    //        failure: function () {
    //            Taco.app.fireEvent('setmessage', "Error loading Search Tuning Rule", 'error');
    //            me.setLoading(false, this.body);
    //        },
    //        success: function (record) {
    //            me.record = record;
    //            me.onLoadRecord();
    //        },
    //        callback: function (record, operation) {
    //            //do something whether the load succeeded or failed
    //        }
    //    });
    //},
    //
    //// when the draft record has loaded create and add the total and grid and hide the loading mask;
    //onLoadRecord : function() {
    //    this.setLoading(false, this.body);
    //},
    //afterDuplicate: function () {
    //    if (this.record.get("couponCode")) {
    //        Taco.app.fireEvent('setmessage', "Please change the coupon code. Coupon codes must be unique", 'info');
    //        this.mon(this, 'afterrender', function () {

    //            var couponCode = this.form.findField("couponCode");
    //            if (couponCode) {
    //                couponCode.markInvalid("Coupon codes must be unique")
    //            }

    //        }, this);
    //    }
    //},

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});