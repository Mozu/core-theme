/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Extends Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.MultiSelect', {
    extend: 'Ext.ux.form.MultiSelect',
    alias: 'widget.taco.field.multiselect',

    initComponent: function () {
        this.callParent(arguments);
    },

    deselect: function (id) {
        this.setValue(Ext.Array.remove(this.getValue(), id));
    },

   

    setReadOnly: function () {},

    setValue: function(value){
        var me = this,
            selModel = me.boundList.getSelectionModel(),
            store = me.getStore();

        // Store not loaded yet - we cannot set the value
        if ((value && value.length) && (!store.data || !store.getCount())) {
            store.on({
                load: Ext.Function.bind(me.setValue, me, [value]),
                single: true
            });
            return;
        }

        value = me.setupValue(value);
        me.mixins.field.setValue.call(me, value);
        
        if (me.rendered) {
            ++me.ignoreSelectChange;
            selModel.deselectAll();
            selModel.select(me.getRecordsForValue(value));
            --me.ignoreSelectChange;
        } else {
            me.selectOnRender = true;
        }
    }
});