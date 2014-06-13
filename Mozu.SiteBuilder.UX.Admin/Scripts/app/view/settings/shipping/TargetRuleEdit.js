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
        var labels = {};
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