/**
 * @class  Taco.view.product.subform.ListExtraEditor
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.ListExtraEditor', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.product.listextraeditor',
    
    header: false,
    ignoreParentFormTracking: true,

    //layout: {
    //    type: 'vbox',
    //    align: 'left'
    //},
    initComponent: function () {

        var me = this,
            dataType = me.productTypeAttribute.get('dataType'),
            values = me.productExtra.getValues();
    
        me.availableOptions = Ext.create('Ext.data.Store', {
            fields: [
                'id', 'value'
            ],
            data: me.productTypeAttribute.get('selectedValues')
        });

        me.availableOptions.addFilter([
            new Ext.util.Filter({
                filterFn: function (rec) {
                    return !values.getById(rec.get('id'));
                }
            })
        ]);

        me.mon(values, 'add', me.loadProductExtraData, me);

        me.adderCfg = {
            xtype: 'combo',
            store: me.availableOptions,
            valueField: 'id',
            itemId:'itemAdder',
            displayField: 'value',
            emptyText: 'Add Value',
            queryMode: 'local',
            minWidth:200,
            listeners: {
                beforequery: function (qp) {
                    qp.forceAll = true;
                },
                select: function (field) {

                    var val = field.getValue(),
                        newRecord;
                    me.down('grid').show();
                    field.reset();
                    newRecord= values.model.create({
                        value: val,
                        deltaPrice: 0
                    });
                    newRecord.setDirty();

                    me.productExtra.getValues().add(newRecord);
                    me.availableOptions.filter();

                }
            }
        };

        me.gridConfg = {
            xtype: 'grid',
            hidden: values.getCount()==0,
            sortableColumns: false,
            disableSelection: true,
            flex:1,
            hideHeaders: false,
            enableColumnHide: false,
            store: values,
            plugins: [
                {
                    ptype: 'cellediting',
                    clicksToEdit: 1
                }
            ],
            viewConfig: {
                stripeRows: false,
                onRowFocus: Ext.emptyFn,
                markDirty: false
            },

           
            columnConfigs: {
                all: [
                    {
                        dataIndex: 'value',
                        text: 'Value',
                        flex: 1

                    },
                    {
                        dataIndex: 'deltaPrice',
                        text: 'Price',
                        renderer: function (value) {
                            return (value || value === 0) ? me.product.formatCurrency(value) : '--';
                        },
                        editor: {
                            xtype: 'currencyfield',
                            currencyCode: me.product.getCurrencyCode(),
                            hideTrigger: true
                        }

                    },
                    {
                        dataIndex: 'deltaWeight',
                        text: 'Weight',
                        editor: {
                            xtype: 'numberfield',
                            hideTrigger: true
                        }

                    },
                  
                    {
                        dataIndex: 'isDefaulted',
                        text: 'Defaulted',
                        xtype: 'booleancolumn',

                        trueText: 'Yes',
                        falseText: 'No',

                        editor: {
                            xtype: 'checkbox'
                        }

                    }
                ],
                productcode: [
                    {
                        dataIndex: 'value',
                        text: 'Code'
                    },
                    {
                        dataIndex: 'productName',
                        text: 'Product Name',
                        flex: 1

                    },
                    {
                        dataIndex: 'price',
                        text: 'Mast Catalog Price',
                        renderer: function (v) {
                            return v ? me.product.formatCurrency(v) : undefined;
                        }

                    },
                    {
                        dataIndex: 'salePrice',
                        text: 'Mast Catalog Sale Price',
                        renderer: function (v) {
                            return v ? me.product.formatCurrency(v) : undefined;
                        }

                    },
                    {
                        dataIndex: 'deltaPrice',
                        text: 'Price',
                        renderer: function (value) {
                            return me.product.formatCurrency(value);
                        },
                        editor: {
                            xtype: 'currencyfield',
                            currencyCode: me.product.getCurrencyCode(),
                            hideTrigger: true
                        }

                    },
                    {
                        dataIndex: 'quantity',
                        text: 'Quantity',
                        editor: {
                            xtype: 'numberfield',
                            hideTrigger: true
                        }

                    },
                    {
                        dataIndex: 'isDefaulted',
                        text: 'Defaulted',
                        xtype: 'booleancolumn',
                        trueText: 'Yes',
                        falseText: 'No',
                        editor: {
                            xtype: 'checkbox'
                        }

                    }
                ]

            },
            columns: [],
            listeners: {
                cellclick: function (view, td, cellIndex, record, tr, rowIndex, e) {

                    if (e.getTarget('.taco-actioncolumn-icon-remove', 10)) {
                        view.getStore().remove(record);
                    }
                    me.availableOptions.filter();
                }
            }

        };
        me.gridConfg.columns = [].concat(me.gridConfg.columnConfigs[dataType.toLowerCase()] || me.gridConfg.columnConfigs.all).concat([
            {
                xtype: 'templatecolumn',
                // text: '',
                tdCls: 'taco-actioncolumn',
                width: 26,
                tpl: ['<div class="taco-actioncolumn-icon taco-actioncolumn-icon-remove"></div>']
            }
        ]);

        me.loadProductExtraData();


        me.items = [me.adderCfg ,me.gridConfg];

        me.callParent(arguments);


    },
  
    //beforeSave:function () {
    //    this.productExtra.getValues().commitChanges();
    //},
    loadProductExtraData: function () {

        var dataType = this.productTypeAttribute.get('dataType').toLowerCase(),
            values = this.productExtra.getValues();

        if (dataType != 'productcode') {
            return;
        }


        var prodIds = [], productStore;
        values.each(function (record) {
            if (!record.get('productName')) {
                prodIds.push(record.getId());
            }
        });


        if (!prodIds.length) {
            return;
        }
        productStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductComboBox');
        productStore.load({
            filters: [
                {
                    property: 'productcode',
                    value: prodIds.join()
                }
            ],
            callback: function (products) {
                if (!products) {
                    return;
                }
                Ext.Array.each(products, function (prod) {
                    var valRec = values.getById(prod.getId());
                    if (valRec) {
                        valRec.set('productName', prod.get('productName'));
                        valRec.set('price', prod.get('price'));
                        valRec.set('salePrice', prod.get('salePrice'));
                        valRec.commit();
                    }
                });
            }
        });
    }


});