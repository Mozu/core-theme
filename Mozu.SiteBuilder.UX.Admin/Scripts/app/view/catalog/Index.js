/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.WindowWithActions',
        'Taco.overrides.panel.Tool',
        'Taco.core.ux.form.field.MultiSelect'
    ],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var me = this,
            outer, store;

        store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            proxy: 'memory',
            fields: ['color'],
            data: [{ color: 'red' }]
        });

        outer = Ext.create('Ext.form.Panel', {
            ui: 'subform',
            title: 'Outer Form',
            items: [{
                xtype: 'textfield',
                name: 'color',
                fieldLabel: 'Color',
                margin: '0 0 20',
                allowBlank: false
            }, {
                xtype: 'form',
                ui: 'subform-subform',
                title: 'Inner Form',
                margin: '0 0 20',
                items: [{
                    xtype: 'textfield',
                    name: 'colorEditor',
                    fieldLabel: 'Color Editor',
                    margin: '0 0 20',
                    allowBlank: false,
                    isIndependent: true
                }, {
                    xtype: 'button',
                    itemId: 'innerButton',
                    ui: 'action-primary',
                    scale: 'medium',
                    text: 'inner button',
                    formBind: true
                }]
            }, {
                xtype: 'button',
                itemId: 'outerButton',
                ui: 'action-primary',
                scale: 'medium',
                text: 'outer button',
                formBind: true
            }]
        });

        // put it all together
        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: [outer]
        });

        this.callParent(arguments);

        outer.loadRecord(store.first());
    }
});