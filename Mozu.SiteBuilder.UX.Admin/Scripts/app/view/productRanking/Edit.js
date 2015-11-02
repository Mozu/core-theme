/**
 * @class  Taco.view.productRanking.Edit
 */

Ext.define('Taco.view.productRanking.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.core.ux.action.DeleteMenuItem',
        'Taco.view.productRanking.Form'
    ],
    formCls: 'Taco.view.productRanking.Form',
    statics: {
        factory: function (cfg, callback, scope) {
            //cfg = Ext.apply(cfg,
            //{
            //    shippingMethodsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods'),

            //    shippingZonesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones')
            //});
          
            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.productRanking.Edit', cfg));
                },
                tasks: [
                    
                ],
                autoExecute: true
            });
        }
    },

    isCreate:true,

    //enableNextPrevious: true,

    //nextPreviousCfg: {
    //    store: "Taco.store.ProductRankingGrid",
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
            me.record = Ext.create('Taco.model.ProductRanking', {});
        }
        //else if (!me.record) {
        //
        //}
        me.formCfg = {
            record: me.record,
            isCatalogLevel: false
        };

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
        //        model: 'Taco.model.ProductRanking',
        //        behavior: 'create'
        //    },
        //    handler: function(item) {
        //        var record = me.record,
        //            metaData = {
        //                id: record.getId()
        //            };

        //        Taco.app.StateManager.attemptNavigate('productrankings/duplicate/' + record.getId(), metaData);
        //    }
        //});

        delMenuItem = Ext.create('Taco.core.ux.action.DeleteMenuItem', {
            record: me.record,
            modelName: 'Taco.model.ProductRanking',
            storeName: 'Taco.store.ProductRankings',
            collectionName: 'productRankings'
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
    //        productRankingModel = Ext.ModelManager.getModel('Taco.model.ProductRanking');
    //
    //    me.setLoading({
    //        msg: "Loading"
    //    }, me.body);
    //
    //    productRankingModel.load(code, {
    //        failure: function () {
    //            Taco.app.fireEvent('setmessage', "Error loading Product Ranking Rule", 'error');
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

    onCreate: function(data) {
        this.saveSuccess(data);
        this.record = data;
        Taco.app.fireEvent('productrankingrulecreated', this.record);
        this.isCreateMode = false;
        Ext.defer(function() {
            this.focusEl.focus();
        }, 1, this);
    },

    doSave: function () {
        var me = this,
            onSuccess = (!me.isCreateMode)
                ? me.saveSuccess
                : me.onCreate;

        if (!me.form.beforeSave()) {
            me.saveFailure();
            return;
        }
        this.record.save({
            success: onSuccess,
            failure: function(item, response) {
                Taco.core.util.ExceptionWhiner.handleRemoteFailure(response);
            },
            scope: me
        });
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});