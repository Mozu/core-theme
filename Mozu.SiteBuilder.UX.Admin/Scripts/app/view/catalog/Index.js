/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.tab.Panel'],

    header: {
        title: 'TabPanel Testing'
    },

    initComponent: function () {
        var me = this,
            tp;

        tp = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: true,
            items: [{
                xtype: 'form',
                title: 'One',
                defaults: {
                    xtype: 'textfield',
                    labelAlign: 'top',
                    labelSeparator: '',
                    msgTarget: 'under'
                },
                items: [{
                    name: 'firstName',
                    fieldLabel: 'First Name',
                    validator: function (value) {
                        var msg = "That's not a real first name.";

                        return (value === 'the' ? msg : true);
                    }
                }, {
                    name: 'lastName',
                    fieldLabel: 'Last Name'
                }, {
                    name: 'address1',
                    fieldLabel: 'Address Line 1'
                }, {
                    name: 'address2',
                    fieldLabel: 'Address Line 2'
                }]
            }, {
                title: 'Two',
                defaults: {
                    margin: '0 0 10 0',
                    style: { backgroundColor: '#ccf' },
                },
                items: [{
                    xtype: 'component',
                    height: 400,
                    html: 'consectetuer'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'adipiscing'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'elit'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'nullam'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'justo'
                }]
            }]
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [tp]
        });

        this.callParent(arguments);
    }
});
