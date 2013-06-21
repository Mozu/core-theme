/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Extends Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.MultiSelect', {
    extend: 'Ext.ux.form.MultiSelect',
    alias: 'widget.taco.field.multiselect',

    listConfig: {
        selModel: { mode: 'SIMPLE' }
    },

    initComponent: function () {
        this.callParent(arguments);
    },

    deselect: function (id) {
        this.setValue(Ext.Array.remove(this.getValue(), id));
    },

    setReadOnly: function () {},

    setValue: function(value){
        var selModel = this.boundList.getSelectionModel(),
            store = this.getStore();

        // Store not loaded yet - we cannot set the value
        if ((value && value.length) && (!store.data || !store.getCount())) {
            store.on({
                load: Ext.Function.bind(this.setValue, this, [value]),
                single: true
            });
            return;
        }

        value = this.setupValue(value);
        this.mixins.field.setValue.call(this, value);
        
        if (this.rendered) {
            ++this.ignoreSelectChange;
            selModel.deselectAll();
            selModel.select(this.getRecordsForValue(value));
            --this.ignoreSelectChange;
        } else {
            this.selectOnRender = true;
        }
    }
});