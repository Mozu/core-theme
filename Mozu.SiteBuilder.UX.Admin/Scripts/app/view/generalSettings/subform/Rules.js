/**
 * @class Taco.view.generalSettings.subform.Rules
 * @author Bradley Friemel
 * @date 6/10/2013
 *
 */
/*
******** Note: (Simeon 10/30/2013) this class was deprecated and is no longer in use.*******

Ext.define('Taco.view.generalSettings.subform.Rules', {
    //extend: 'Taco.view.product.subform.Subform',
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.IpRanges'],
    title: 'IP Address Security',
    margin: "0 0 20 0",
    ui: "subform",
    
    initComponent: function () {
        var me = this;

        this.defaults = {
            width: 200,
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        me.ipRangeStore = Ext.create('Taco.store.IpRanges', {
            autoLoad: true,
            listeners: {
            }
        });
        
        me.addform = Ext.create('Ext.form.Panel', {
            layout: { type: 'hbox', align: 'middle' },
            defaults: {
                xtype: 'container',
                width: 180,
                layout: { type: 'vbox', align: 'left' },
                cls: Taco.baseCSSPrefix + 'toolbar-form-cell'
            },
            items: [{
                items: [{
                    xtype: 'hiddenfield',
                    name: 'id',
                    value: 0
                }, {
                    xtype: 'textfield',
                    name: 'ipStart'
                }]
            }, {
                items: [{
                    xtype: 'textfield',
                    name: 'ipEnd'
                }]
            }, {
                width: 48,
                layout: { type: 'vbox', align: 'center' },
                items: [{
                    xtype: 'component',
                    autoEl: { tag: 'a', html: 'Add' },
                    listeners: {
                        click: {
                            element: 'el',
                            fn: function () {
                                var form = me.addform.getForm();
                                me.fireEvent('addiprange', form.getFieldValues());
                                form.reset();
                            },
                            scope: this
                        }
                    }
                }]
            }]
        });
        
        me.ipAddressGrid = Ext.create('Taco.core.ux.BaseGrid', {
            store: me.ipRangeStore,
            width: 440,
            selType: 'cellmodel',

            columns: [{
                dataIndex: 'id',
                hidden: true
            }, {
                dataIndex: 'start',
                text: 'IP address start',
                flex: 1
            }, {
                dataIndex: 'end',
                text: 'IP address end',
                width: 215
            }],

            actions: [{
                tooltip: 'Remove',
                iconCls: Taco.baseCSSPrefix + 'action-remove',
                eventName: 'removeip'
            }],

            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                weight: 101,
                layout: { type: 'vbox', align: 'stretch' },
                cls: Taco.baseCSSPrefix + 'toolbar-form',
                items: [me.addform]
            }],

            listeners: {
                removeip: {
                    fn: me.removeIpRange,
                    scope: me
                }
            }
        });

        this.items = [{
            xtype: 'radiogroup',
            layout: 'vbox',
            defaults: {
                xtype: 'radio',
                name: 'ipaddress'
            },
            items: [{
                boxLabel: 'Allow all IP addresses',
                inputValue: 'allow'
            }, {
                boxLabel: 'Block 1 or a range of IP addresses',
                inputValue: 'block'
            }],
            listeners: {
                change: function (field, newValue, oldValue) {
                    (hasIpBlockList = newValue.ipaddress === 'block') ? me.ipAddressGrid.show() : me.ipAddressGrid.hide();
                    if (oldValue.ipaddress) { // not changing this for the first time
                        me.onFormStateChange();
                    }
                },
                scope: me
            }
        }, me.ipAddressGrid];

        this.callParent(arguments);
    }
});

*/