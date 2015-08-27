/**
 * @class Taco.core.ux.form.SelectField
 */
Ext.define('Taco.core.ux.form.SelectField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.selectfield',

    allowBlank: false,
    editable: false,
    triggerAction: 'all',
    typeAhead: false,
    isSelectField: true,
    listConfig: {
        shadow: false
    },
    

    initComponent: function () {

        this.fieldCls += ' taco-no-select';

        if (this.readOnly) {
            this.editable = false;
        }

        this.callParent(arguments);

        this.addCls('taco-select-field');
    },

    afterRender: function () {
        this.callParent(arguments);

        this.getPicker().addCls('taco-select-picker');
    },

    afterFirstLayout: function () {
        this.callParent(arguments);
        this.inputEl.unselectable();
    }
});