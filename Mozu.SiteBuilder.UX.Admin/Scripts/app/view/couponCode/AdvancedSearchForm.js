/**
 * @class Taco.view.couponCode.AdvancedSearchForm
 */
Ext.define('Taco.view.couponCode.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this;

        this.items = [
            {
                name: 'couponCode',
                fieldLabel: 'Coupon Code'
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Create Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'createDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '8 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'createDateTo',
                    flex: 1
                }]
            }
        ];

        this.callParent(arguments);
    }
});