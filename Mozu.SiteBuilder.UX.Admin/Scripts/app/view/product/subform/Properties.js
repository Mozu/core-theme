/**
 * @class Taco.view.product.subform.Properties
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Properties', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productpropertiesform',
    requires: [
        'Taco.core.ux.form.field.Product'
    ],

    title: 'Properties',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    bodyPadding: '0 0 0 0',

    statics: {
        editors: {
            'Date': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'datefield',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                        value: (values && values.length) ? values[0] : null
                    }
                ];
            },
            'TextArea': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'textareafield',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                        value: (values && values.length) ? values[0] : null,
                        width: 600,
                        rows: 12,
                        resizable: true,
                        resizeHandles: 's'
                    }
                ];
            },
            'YesNo': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'checkboxfield',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                        checked: (values && values.length) ? values[0] : null
                    }
                ];
            },
            'List': function(ptAttribute, values) {
                var allowMulti = ptAttribute.get('allowMulti');
                return [
                    {
                        xtype: allowMulti ? 'taco.field.multiselect' : 'combobox',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        displayField: 'value',
                        valueField: 'id',
                        allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                        value: (values && values.length) ? (allowMulti ? values : values[0]) : (allowMulti ? [] : null),
                        width: 400,
                        store: Ext.create('Ext.data.Store', {
                            fields: [
                                { name: 'id', type: 'string' },
                                { name: 'value', type: 'string' }
                            ],
                            data: ptAttribute.get('selectedValues')
                        })
                    }
                ];
            },
            'TextBox': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'textfield',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                        value: (values && values.length) ? values[0] : null,
                        width: 400
                    }
                ];
            },
            'productPicker': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'taco.field.product',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                        width: 400,
                        value: values
                    }
                ];
            }
        }
    },

    initComponent: function () {
        //this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');


        this.items = [this.getEmptyComponent()];

        this.callParent(arguments);

        //this.on('afterrender', function () {
        //    if (this.productTypeStore.loading) {
        //        this.productTypeStore.on('load', this.loadByProductTypeId, this, { single: true });
        //    } else {
        //        this.loadByProductTypeId();
        //    }
        //}, this, { single: true, delay: 40 });

        this.loadByProductTypeId();
    },

    beforeSave: function () {
        if (this.productType == null) {
            return;
        }

        var form = this.getForm(),
            properties = this.product.getProperties();

        this.productTypeProperties.each(function (record) {
            var fieldName = this.getFieldName(record),
                values = null,
                field = form.findField(fieldName),
                pRecord = properties.getById(record.getId());

            if (field) {
                values = field.getValue();
                if (!Ext.isArray(values)) {
                    values = [values];
                }

                if (!pRecord) {
                    pRecord = properties.add({
                        attributeFQN: record.getId()
                    })[0];
                }

                pRecord.set('values', values);
            }
        }, this);
    },

    loadByProductTypeId: function (id) {
        var type,
            properties,
            items = [];

        if (!id || !Ext.isNumeric(id)) {
            id = this.product.get('productTypeId');
        }
        if (!id) {
            return;
        }
        //this.productType = type = this.productTypeStore.getById(id);
        this.productType = type = this.product.productTypeRecord;
        if (!type) {
            return;
        }

        this.productTypeProperties = properties = type.getProperties();

        properties.each(function (ptAttribute) {
            Ext.Array.push(items, this.buildEditor(ptAttribute));
        }, this);

        if (!items.length) {
            items.push(this.getEmptyComponent());
        }

        this.removeAll();
        this.add(items);
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'This product type does not have any associated properties.'
        };
    },

    buildEditor: function (ptAttribute) {
        var editor = ptAttribute.getAttributeMetaDataValue('uicontrol') || ptAttribute.get('inputType'),
            attributeFQN = ptAttribute.get('attributeFQN'),
            prop = this.product.getProperties().getById(attributeFQN),
            values = prop ? prop.get('values') : null;

        if (typeof this.statics().editors[editor] !== 'function') {
            return [
                {
                    xtype: 'component',
                    html: 'Error: could not find editor type: ' + editor
                }
            ];
        }

        return Ext.widget({
            xtype: 'container',            
            margin: '10 0 0',
            items: this.statics().editors[editor].apply(this, [ptAttribute, values])
        });
    },

    getFieldName: function (ptAttribute) {
        return 'product-property-' + ptAttribute.getId();
    }
});