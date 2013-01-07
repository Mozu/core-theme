/**
 * @class Taco.view.site.widget.ColumnDivider
 */
Ext.define('Taco.view.site.widget.ColumnDivider', {
    extend: 'Taco.view.site.widget.Editor',
    requires: [
        'Taco.core.ux.ColorPicker',
        'Taco.core.ux.form.ColorField',
        'Ext.data.UuidGenerator'
    ],
    title: 'Multi Column Widget Editor',
    // instructionText: 'Customize the horizontal rule with the options below.',

    width: 480,
    // autoSize: false,

    initComponent: function () {
        var me = this;
        this.items = [ Ext.create('Taco.core.ux.form.FlexBox', {
            defaults: {
              //  xtype: 'combobox',
                //editable: false,
                labelAlign: 'top',
                labelSeparator: '',
                width: 120,
                padding: '0 20 20 0'
                
            },
            items: [{
                fieldLabel: 'Number of Columns',
                name: 'columnCnt',
                xtype: 'combobox',
                editable:false,
                store: [2,3,4,5,7]
                
            }, {
                xtype: 'hidden',
                name: 'baseId'
            }]
        })];

        

        this.callParent( arguments );
    },

    buildWidgetConfig: function () {
        var cfg = this.form.getValues();
        cfg.columns = [];
        for (var i=0;i<cfg.columnCnt ;i++) {
            cfg.columns.push({
                id: cfg.baseId + "_" + i,
                width: 100 / cfg.columnCnt
            });
        }
        return cfg;
    },
    initWidgetConfig: function () {
        var baseId = Ext.data.IdGenerator.get('uuid').generate(),
            conf = {
                baseId:baseId,
                columnCnt:3,
                columns:[
                    {
                        id:baseId +"_0",
                        width:50
                    },
                    {
                        id:baseId +"_1",
                        width:50
                    }
                ]
            };
        return conf;
    }
});


       