/**
 * @class Taco.core.ux.ComboFilter
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.ComboFilter', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco.combofilter',

    createNewOnEnter: true,
    displayField: 'value',
    forceSelection: false,
    grow: true,
    hideTrigger: true,
    queryMode: 'local',
    triggerOnClick: false,
    valueField: 'value',

    initComponent: function () {
        if (!this.store) {
            this.store = new Ext.data.Store({ fields: ['property', 'value'], data: [] });
        }
        
        this.labelTpl = '{property} {value}';

        this.callParent(arguments);

        this.on({
            beforequery: function () { return false; },
            change: this.onValueChange,
            scope: this
        });
    },

    filterItemStore: function (records) {
        var filters = Ext.Array.map(records, function (record) {
            var cfg = Ext.applyIf(record.getData(), { root: 'data' });
            return Ext.create('Ext.util.Filter', cfg);
        }, this);

        this.itemStore.clearFilter(true);
        this.itemStore.filter(filters);
    },

    onValueChange: function (field, newValue, oldValue) {
        var records = this.valueStore.getRange();

        Ext.Array.each(records, function (record) {
            if (Ext.isEmpty(record.get('property'))) {
                record.set('property', 'productName');
                record.setId(['productName', record.get('value')].join('-'));
            }
        }, this);

        if (this.itemStore) {
            this.filterItemStore(records);
        }
    }
});