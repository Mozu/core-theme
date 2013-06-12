/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.tax.Form', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.TaxRates', 'Taco.store.States'],
    enableStoreSyncTasks: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function() {

        this.taxToggle = Ext.create('Ext.form.RadioGroup', {
            //fieldLabel: 'Two Columns',
            // Arrange radio buttons into two columns, distributed vertically
            columns: 1,
            vertical: true,
            items: [
                { boxLabel: 'My Store is Tax Exempt', name: 'taxtogglerg', inputValue: '1' },
                { boxLabel: 'Collect Tax in these States', name: 'taxtogglerg', inputValue: '2', checked: true }
            ],
            listeners: {
                change: function() {
                    alert('tbd');
                }
            }
        });

        this.taxStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.TaxRates');        
        
        
        this.statesStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.States');

        this.stores = [this.taxStore];
        this.statesInput = Ext.create('Taco.core.ux.form.BoxSelect', {
            forceSelection:true,
            fieldLabel: 'Choose State',
            store: this.statesStore,
            queryMode: 'local',
            displayField: 'Value',
            valueField: 'Code'
        });

        this.items = [this.taxToggle, this.statesInput];

        this.callParent(arguments);
        if (this.taxStore.isLoading) {
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
    }
});