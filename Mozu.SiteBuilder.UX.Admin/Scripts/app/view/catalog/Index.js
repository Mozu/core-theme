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

        inner = Ext.create('Ext.form.Panel', {
            itemId: 'inner',
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
                itemId: 'saveButton',
                ui: 'action-primary',
                scale: 'medium',
                text: 'inner button',
                disabled: true,
                formBind: true,
                scope: this,
                handler: function (btn) {
                    var form = btn.up('form').getForm(),
                        record = this.record;

                    record.set('color', form.findField('colorEditor').getValue());

                    this.outer.loadRecord(record);
                }
            }]
        });

        outer = Ext.create('Ext.form.Panel', {
            ui: 'subform',
            tools: [{
                type: 'gear',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'hello'
                    }]
                }
            }],
            header: {
                title: 'Outer Form',
                titlePosition: 0,
                items: [{
                    xtype: 'button',
                    ui: 'action',
                    scale: 'medium',
                    text: 'Hello'
                }]
            },
            items: [{
                xtype: 'textfield',
                name: 'color',
                fieldLabel: 'Color',
                margin: '0 0 20',
                allowBlank: false
            },
            inner,
            {
                xtype: 'button',
                itemId: 'saveButton',
                ui: 'action-primary',
                scale: 'medium',
                text: 'outer button',
                disabled: true,
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

        this.record = store.first();
        this.inner = inner;
        this.outer = outer;

        // Ext.util.Observable.capture(this.outer.down('#inner'), function (eventName, e) { console.log(eventName, e); });

        this.replaceMonitor(outer);

        this.outer.loadRecord(this.record);
        this.outer.getForm().getFields().each(function (item) {
            if (item.isFormField) {
                item.resetOriginalValue();
            }
        });

        this.inner.getForm().findField('colorEditor').setValue(this.record.get('color')).resetOriginalValue();
    },

    replaceMonitor: function (form) {
        var basic = form.getForm();

        basic.monitor.unbind();

        basic.monitor = new Ext.container.Monitor({
            selector: '[isFormField]:not([isIndependent])',
            scope: basic,
            addHandler: basic.onFieldAdd,
            removeHandler: basic.onFieldRemove
        });

        basic.monitor.bind(form);
    }
});