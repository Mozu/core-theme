/**
 * @class  Taco.view.priceList.entry.Entries'
 * @description Price List Entry Form
 */
Ext.define('Taco.view.priceList.entry.Entries', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-entries',
    cls: 'pricelist-entries-header',
    requires: [
        'Taco.core.util.Validation',
        'Taco.view.priceList.widget.EntriesGrid',
        'Ext.container.Container'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Pricing',
    record: null,

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();

        this.entriesGrid = Ext.create('Taco.view.priceList.widget.EntriesGrid', {
            priceListCode: (!this.record.phantom) ? this.record.get('code') : null,
            priceListRecord: this.record
        });

        this.items = [{
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                this.entriesGrid
            ]
        }];

        this.callParent(arguments);
    },



    beforeSave: function () {
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});