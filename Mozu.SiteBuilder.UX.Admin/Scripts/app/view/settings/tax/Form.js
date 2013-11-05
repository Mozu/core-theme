/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.tax.Form', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.store.TaxRates', 'Taco.store.States'],
    enableStoreSyncTasks: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    title: 'Tax',
    initComponent: function() {


        this.taxStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.TaxRates');        
        this.taxStore.addListener('load', this.loadState, this);
        
        this.statesStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.States');
        this.stores = [this.taxStore];
        
        this.taxFreeCheck = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: 'Tax Exempt',
            handler: this.taxExemptClick,
            scope: this
        });
        

        this.statesInput = Ext.create('Ext.ux.form.field.BoxSelect', {
            forceSelection:true,
            fieldLabel: 'Choose State' ,
            store: this.statesStore,
            queryMode: 'local',
            displayField: 'Value',
            valueField: 'Code'
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
    }
});