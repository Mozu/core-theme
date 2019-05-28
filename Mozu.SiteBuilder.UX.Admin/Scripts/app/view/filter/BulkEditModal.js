
/**
 * @class Taco.view.filter.EditCodeModal.js
 */

Ext.define('Taco.view.filter.BulkEditModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.field.Code'
    ],

    config: {
        type:null
    },

    entityId: null,

    record: null,

    title: "Bulk Edit",

    autoShow: true,

    data: null,

    scale: 'medium',

    layout: 'fit',

    showValidateButton: true,

    primaryText: 'Save',


    initComponent: function(eOpts) {
        var me = this;

        var recsToStrings = this.values.map(function(rec) {
            return rec.get('id') || rec.get('code');
        });

        var values = Ext.isArray(recsToStrings)
            ? recsToStrings.join(',\r\n')
            : '';

        this.items = [
            {
                xtype: 'textarea',
                value: values,
                itemId: 'bulkvalue-field'
            }
        ]

        this.callParent(arguments);
        
    }

});