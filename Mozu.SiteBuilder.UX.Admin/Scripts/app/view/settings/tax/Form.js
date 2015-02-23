/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.tax.Form', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.store.TaxRates', 'Taco.store.States', 'Taco.model.Capability', 'Taco.store.Capability'],
    enableStoreSyncTasks: true,
    //layout: {
    //    type: 'vbox',
    //    align: 'stretch'
    //},
    title: 'Tax',
    
    initComponent: function() {
        this.taxStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.TaxRates');
        this.taxStore.whenLoaded(this.loadState, this);
        
        this.statesStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.States');
        this.stores = [this.taxStore];
        window.statesStore = this.statesStore;
        
        this.taxFreeCheck = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: 'Tax Exempt',
            handler: this.taxExemptClick,
            scope: this
        });
        

        this.statesInput = Ext.create('Ext.ux.form.field.BoxSelect', {
            forceSelection:true,
            fieldLabel: 'Collect Taxes for the Following States' ,
            store: this.statesStore,
            queryMode: 'local',
            displayField: 'value',
            valueField: 'code'
        });

        this.taxFreeCheck = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: 'Tax Exempt',
            handler: this.taxExemptClick,
            scope: this
        });

        this.items = [this.taxFreeCheck, this.statesInput];

        this.callParent(arguments);
        if (this.taxStore.isLoading()) {
            this.mon(this.taxStore, 'load', this.bindTaxStore, this);
        } else {
            this.bindTaxStore();
        }
    },

    onBoxReady: function () {
        this.callParent(arguments);
        var me = this;
        this.up("#contentView").setLoading(true);

        Ext.Ajax.request({
            url: '/admin/app/capabilities/checktaxcapability',
            method: 'GET',
            success: this.checkCapability
        });
        
    },
    
    checkCapability: function (responseObj) {
        var taxHandled = responseObj.responseText === "true";
        if (taxHandled) {
            Ext.getCmp("contentView").setLoading({
                useMsg: true,
                msg: '<div style="text-align: center;">US tax Settings are managed by your configured capabilities.<br>Please navigate <a href="/capability" class="redirectTax">here</a> to manage tax configuration.</div>',
                maskCls: 'x-mask',
                msgCls: 'taco-loadmask-tax-msg',
                listeners: {
                    click: {
                        element: 'el',
                        scope: this,
                        fn: function(e, el)
                        {
                            if (e.getTarget('.redirectTax', 10)) {
                                e.preventDefault();
                                Taco.core.StateManager.attemptNavigate("/capability");
                            }
                        }
                    }
                }
            });
        } else {
            Ext.getCmp("contentView").setLoading(false);
        }
    },

    beforeSave: function() {
        var values = this.statesInput.getValue() || [], delRecords = [];

        Ext.Array.each(values, function(value) {
            if (!this.taxStore.findRecord('stateCode', value)) {
                this.taxStore.add([{ stateCode: value }]);
            }
        }, this);

        this.taxStore.each(function(record) {
            if (values.indexOf(record.get('stateCode')) == -1) {
                delRecords.push(record);
            }
        }, this);
        this.taxStore.remove(delRecords);
        return this.callParent(arguments);
    },

    bindTaxStore: function() {
        var val = [];
        this.taxStore.each(function(item) {
            val.push(item.get('stateCode'));
        });
        this.suspendEvents();
        this.statesInput.setValue(val);
        this.statesInput.resetOriginalValue();
        this.resumeEvents();
    },

    loadState: function () {
        if (this.taxStore.count() == 0) {
            this.suspendEvents();
            this.taxFreeCheck.setValue(true);
            this.taxFreeCheck.resetOriginalValue();
            this.resumeEvents();
        }
    },

    taxExemptClick: function () {
        if (this.taxFreeCheck.getValue()) {
            this.statesInput.disable();
            this.statesInput.clearValue();
        } else {
            this.statesInput.enable();
        }
    },

    onDestroy: function () {
        Ext.getCmp("contentView").setLoading(false);
    }
});