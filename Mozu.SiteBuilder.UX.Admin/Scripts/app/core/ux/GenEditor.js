/**
 * @class Taco.core.ux.GenEditor
 */
Ext.define('Taco.core.ux.GenEditor', {
    extend: 'Taco.core.ux.content.Container',

    header: {
        title: 'Generic Edit'
    },
    body: {
        items: [

        ]
    },
    formItems: [],
    saveCallback: null,
    data: {},
    store: {},
    initComponent: function (eOpts) {

        var me = this;
        var frmCfg = {
            xtype: 'form',
            bodyPadding: 10,
            flex: 1,
            autoScroll: true,
            items: [],
            buttons: [{
                text: 'Save',
                handler: function () {
                    me.down('form').getForm().updateRecord(me.data);
                    if (me.saveCallback) {
                        me.saveCallback(me);
                    }
                    me.data.save();

                    me.fireEvent('save');
                }
            }]
        };

        for (fid in me.data.fields.items) {
            var field = me.data.fields.items[fid];

            var ftype = 'textfield';
            if (field.type.type == 'int') ftype = 'numberfield';
            if (field.type.type == 'bool') ftype = 'checkboxfield';
            if (field.isHidden) ftype = 'hiddenfield';

            if (field.type.type != 'auto') {
                frmCfg.items.push({
                    xtype: ftype,
                    fieldLabel: field.name,
                    name: field.name,
                    anchor: '100%'
                });
            }
        }


        frmCfg.items = frmCfg.items.concat(me.formItems);


        // .push ( frmCfg );

        Ext.Object.merge(me.body, {
            items: [frmCfg]
        });


        me.callParent(arguments);
        me.down('form').loadRecord(me.data);

    }

});