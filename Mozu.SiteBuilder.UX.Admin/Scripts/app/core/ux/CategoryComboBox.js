/**
 * @class  Taco.core.ux.CategoryComboBox
 */

Ext.define('Taco.core.ux.CategoryComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.categorycombobox',
    requires: ['Taco.store.Categories'],
    displayField: 'nameAndCode',
    valueField: 'id',
    minChars: 1,
    queryMode: 'local',
    store: { type: 'Taco.store.Categories' },
    

    setValue: function (value) {
        if (value === -1) {
            value = null;
        }
        this.callParent(arguments);
    }
});
