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
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.store.ShippingZones',
        'Taco.model.TargetRule',
        'Taco.core.ux.form.field.Code'
    ],

    formCls: 'Taco.core.ux.form.Form',

    enableNavHeader: true,
    autoTitle: true,

    autoScroll: true,
    initComponent: function () {

        var me = this,
            labels = {};

        if (this.record.get('domain') == 'Shipping.DestinationAddress') {
            this.title = 'Shipping Zone';

            this.indexRoute = 'shipping/zones';
            this.editRoute = 'shipping/zonesedit';

        }
        if (this.record.get('domain') == 'Product') {
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
                    allowBlank: false,
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
                    xtype: "component",
                    html: '<label class="x-form-item-label x-unselectable x-form-item-label-top" unselectable="on">Expression</label>',
                    padding: '0 0 5 0'

                },
                {
                    xtype: 'taco-codefield',
                    name: 'expression',
                    showGutter: false,
                    mode: 'mozufilter',
                    flex: 1

                }
            ]

        };


        this.callParent(arguments);
        // me.expressionValue = me.down('#expressionValue');
    },
    getIndexRoute: function () {
        return this.indexRoute;
    },

    getEditRoute: function () {
        return this.editRoute;
    },

});