/**
 * @class Taco.view.priceList.widget.CurrentValueLabel
 * Label to display current value
 */
 Ext.define('Taco.view.priceList.widget.CurrentValueLabel', {
    extend: 'Ext.form.FieldContainer',
    requires: [
        'Ext.Component',
        'Ext.form.Label'
    ],
    alias: 'widget.current-value-label',
    cls: Taco.baseCSSPrefix + 'overridefield',
    layout: {
        type: 'column',
        align: 'top'
    },
    margin: '0 30 0 0',

    initComponent: function() {
        var me = this;

        me.currentVal = Ext.widget('component', {
            columnWidth: 0.75,
            border: false,
            style: "font-size:12px;color:#acacac;text-align:right;",
            tpl: [
                "<tpl if='currentValue'>",
                "<span>{currentValue}</span>",
                "</tpl>"
            ]
        });

        me.items = [{
                xtype: 'label',
                columnWidth: 0.25,
                cls: 'taco-rolledup-price',
                text: 'Current:',
                // text: 'Default:',
                forId: me.itemId,
                style: "font-size:12px;color: #acacac;text-align: left;"
            },
            me.currentVal
        ];

        me.callParent(arguments);
    },
     setValue: function(val) {
         this.currentVal.update({currentValue: val});
     }
 });