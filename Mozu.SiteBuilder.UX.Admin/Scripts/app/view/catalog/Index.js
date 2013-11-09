/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [],

    header: {
        title: 'Catalog Testing',
        flexFirstItem: false,
        items: [{
            xtype: 'component',
            html: 'hi',
            flex: 1
        }],
        actions: [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Test'
        }]
    },

    initComponent: function () {
        var items;

        items = [{
            xtype: 'form',
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'Name',
                msgTarget: 'under',
                allowOnlyWhitespace: false
            }, {
                xtype: 'textfield',
                name: 'email',
                fieldLabel: 'Email Address',
                msgTarget: 'under',
                regexText: 'Please enter a valid email address',
                regex: /^\S+@\S+$/,
                allowOnlyWhitespace: false
            }, {
                xtype: 'combobox',
                name: 'customerType',
                fieldLabel: 'Type',
                msgTarget: 'under',
                store: [
                    'Personal',
                    'Professional'
                ],
                validator: function (value) {
                    return value === 'Personal' ? true : 'Please select "Personal"';
                }
            }, {
                xtype: 'radiogroup',
                name: 'subscribe',
                fieldLabel: 'Special Offers',
                msgTarget: 'under',
                columns: 1,
                vertical: true,
                items: [{
                    name: 'subscribe',
                    boxLabel: 'Yes, I would like to receive special offers',
                    inputValue: 'true'
                }, {
                    name: 'subscribe',
                    boxLabel: 'No, thank you',
                    inputValue: 'false'
                }]
            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Save',
                margin: '20 0 0',
                formBind: false,
                scope: this,
                handler: this.handleSave
            }]
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    },

    handleSave: Ext.emptyFn
});
