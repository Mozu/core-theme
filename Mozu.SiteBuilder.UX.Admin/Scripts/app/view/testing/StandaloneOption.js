/**
 * @class Taco.view.testing.StandaloneOption
 */
    Ext.define('Taco.view.testing.StandaloneOption', {
        extend: 'Ext.container.Container',
        requires: [
            'Taco.core.ux.BaseGrid',
            'Taco.core.ux.form.TextFieldColumn',
            'Taco.core.ux.CellEditing',
            'Taco.core.ux.action.Action',
            'Taco.core.ux.BoxReorderer'
        ],
        cls: Taco.baseCSSPrefix + 'fieldgroup',
        reorderable: true,

        initComponent: function () {
            var me = this,
                store = Ext.create('Ext.data.Store', {
                    model: 'Taco.model.ProductOptionValue',
                    filters: [{
                        property: 'option_id',
                        value: me.data.get('id')
                    }, {
                        property: 'productCode',
                        value: me.data.get('productCode')
                    }],
                    modelDefaults: [{
                        property: 'option_id',
                        value: me.data.get('id')
                    }, {
                        property: 'productCode',
                        value: me.data.get('productCode')
                    }]
                });

            store.load({
                callback: function () {
                    me.up('container').up('container').productOptionValueStores.push(store);
                }
            });
            store.on({
                datachanged: me.onStoreChange,
                update: me.onStoreChange,
                scope: me
            });

            //me.up('container').up('container').productOptionValueStores.push(store);

            me.items = [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'fieldgroup-title',
                width: 360,
                tpl: '<span class="taco-draghandle">Drag to reorder</span>{internalName} '
                    + '<em>(<span>{inputType}</span>)</em>',
                data: me.data.data
            }, {
                xtype: 'component',
                autoEl: {
                    tag: 'a',
                    cls: 'taco-option-delete',
                    html: 'remove'
                },
                listeners: {
                    click: {
                        element: 'el',
                        fn: function () {
                            me.data.store.remove(me.data);
                            me.destroy();
                        },
                        scope: this.el
                    }
                }
            }, {
                xtype: 'basegrid',
                bodyBorder: false,
                store: store,
                enableColumnHide: false,
                border: 0,
                rowLines: false,
                hideHeaders: true,
                disableSelection: true,
                selType: 'cellmodel',
                width: 480,
                plugins: [{
                    ptype: 'tacocellediting',
                    clicksToEdit: 1
                }],
                viewConfig: {
                    stripeRows: false
                },
                columns: [{
                    xtype: 'gridcolumn',
                    header: 'Value',
                    dataIndex: 'internalValue',
                    width: 360,
                    tdCls: Taco.baseCSSPrefix + 'option-value-title'
                }, {
                    xtype: 'textfieldcolumn',
                    header: 'Price',
                    dataIndex: 'deltaPrice',
                    align: 'center',
                    width: 120,
                    tdCls: Taco.baseCSSPrefix + 'option-value-price'
                }]
            }];

            me.callParent(arguments);
        },

        onStoreChange: function () {
            var ct = this.up('container').up('container');

            ct.fireEvent('dirtychange');
        }
    });
