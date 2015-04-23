/**
 * @class Taco.view.category.ConfirmDeleteWithCheckboxModal
 */

Ext.define('Taco.view.category.ConfirmDeleteWithCheckboxModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.form.field.Checkbox'
    ],

    autoShow: true,
    closeAction: 'destroy', 
    scale: "",
    height: 200,
    width: 380,
    layout: {
        type: 'fit'
    },

    //customize
    title: 'Delete',
    confirmMessage: 'Are you sure you want to delete this record?',
    primaryText: 'OK',
    optionCheckboxDefaultValue: false,
    optionCheckboxLabel: '',
    hideOptionCheckbox: false,
    onDeleteIt: Ext.emptyFn,
    
    initComponent: function() {
        var me = this;
        console.log(me.hideOptionCheckbox);
        
        me.optionCheckbox = Ext.widget({
            xtype: 'checkbox',
            value: me.optionCheckboxDefaultValue,
            boxLabel: me.optionCheckboxLabel,
            hidden: me.hideOptionCheckbox,
            margin: '10 0 0 0'
        });
        me.items = [
            {
                xtype: 'container',
                items: [
                    {
                        xtype: 'label',
                        text: me.confirmMessage,
                        margin: '0 0 20 0'
                    },
                    me.optionCheckbox
                ]
            }
        ];

        me.callParent(arguments);
    },

    doSave: function () {
        this.onDeleteIt(this, this.optionCheckbox.getValue());
        this.saveSuccess(this.optionCheckbox.getValue());
    }
});
