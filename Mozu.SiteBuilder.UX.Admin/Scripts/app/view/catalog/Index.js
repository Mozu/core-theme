/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.form.FilterContainer'
    ],

    header: {
        title: 'Component Testing'
    },

    initComponent: function () {
        var store, stores, form, items;

        store = Ext.create('Ext.data.ArrayStore', {
            fields: [
                { name: 'item', type: 'string' },
                { name: 'isMeal', type: 'boolean' },
                { name: 'price', type: 'number' },
                { name: 'size', type: 'string' }
            ],
            data: [
                ['Big Mac', true, 3.99],
                ['Chicken McNuggets, 20 pieces', false, 5],
                ['Chocolate Shake, large', false, 2.89, 'large'],
                ['French Fries, small', false, 0.99, 'small']
            ]
        });

        stores = {
            'size': Ext.create('Ext.data.ArrayStore', {
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'name', type: 'string' }
                ],
                data: [
                    ['S', 'Small'],
                    ['M', 'Medium'],
                    ['L', 'Large']
                ]
            })
        };

        form = Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'textfield',
                name: 'item',
                fieldLabel: 'Item'
            }, {
                xtype: 'checkbox',
                name: 'isMeal',
                fieldLabel: 'Other Filters',
                boxLabel: 'Limit search to value meals'
            }, {
                xtype: 'combobox',
                name: 'size',
                fieldLabel: 'Size',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                store: stores['size']
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Price Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'minPrice',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 200
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'numberfield',
                    name: 'maxPrice',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 200
                }]
            }]
        });

        items = [{
            xtype: 'taco-filtercontainer',
            width: '100%',
            advancedForm: form,
            filterStores: stores
        }, {
            xtype: 'dataview',
            itemId: 'list',
            itemSelector: 'li.mcds',
            store: store,
            height: 400,
            width: 400,
            tpl: '<tpl for="."><li class="mcds">{item} {price:usMoney} {isMeal} {size}</li></tpl>'
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    }
});
