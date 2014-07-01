/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.shipping.TargetRuleEdit', {
    extend: 'Taco.core.ux.form.FullEditor',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.action.SecondaryButton',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.store.ShippingZones',
        'Taco.model.TargetRule'
    ],

    formCls: 'Taco.core.ux.form.Form',

    enableNavHeader: true,
    autoTitle: true,

    autoScroll: true,
    initComponent: function () {
        
        var me =this,
            labels = {};

        if (this.record.get('domain') == 'Shipping.DestinationAddress') {
            this.title = 'Shipping Zone';
        
            this.indexRoute = 'shipping/zones';
            this.editRoute = 'shipping/zonesedit';
      
        }
        if (this.record.get('domain' ) =='Product' ) {
            this.title = 'Product Rule';
            this.indexRoute = 'shipping/productrules';
            this.editRoute = 'shipping/productrules/edit';
        }

        this.formCfg = {
            // flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            title: this.title,
            items: [
                {
                    xtype: 'textfield',
                    name: 'code',
                    fieldLabel: 'Name',
                    maxWidth: 400
                },
                {
                    xtype: 'textarea',
                    name: 'description',
                    fieldLabel: 'Description',
                    fieldStyle: 'resize:both',
                    maxWidth: 400,
                },
                {
                    xtype: 'textarea',
                    name: 'expression',
                    fieldLabel: 'Expression',
                    flex: 1,
                    cols: 60,
                    grow: true,
                    fieldStyle: 'resize:both',
                    minHeight: 400
                }

                /*
                ,

                // temporariy prototype for ace editor inclusion. See jGill for info

                {
                    xtype: "component",
                    itemId: "aceEditor",
                    
                    height:200,
                    html: "test",
                    listeners: {
                        scope: me,
                        render: function (cmp) {                            
                            var me = this;
                            var editDom = cmp.getEl().dom;
                            debugger;
                            if (!ace) {
                                return
                            }

                            me.editor = ace.edit(editDom);
                            me.editor.setTheme("ace/theme/tomorrow");
                            me.editor.getSession().setMode("ace/mode/mozufilter");
                            me.originalData = me.editor.getValue();
                            me.editor.on('change', function (e) {
                                var prevState = me.isDirtyFlag;
                                me.isDirtyFlag = (me.editor.getValue() != me.originalData);
                                if (prevState != me.isDirtyFlag) {
                                    // Somebody fire the isDirtyFlag
                                }
                            });

                        }
                    }
                }
                */


            ]

        };
     

        this.callParent(arguments);
    },
    getIndexRoute: function () {
        return this.indexRoute;
    },

    getEditRoute: function () {
        return this.editRoute;
    },

});