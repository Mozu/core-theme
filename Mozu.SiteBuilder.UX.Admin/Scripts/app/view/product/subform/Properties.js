/**
 * @class Taco.view.product.subform.Properties
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Properties', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productpropertiesform',
    requires: [
        'Taco.core.ux.form.field.Product',
        'Taco.core.ux.form.DateTime'
    ],

    title: 'Properties',

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
                        // BUG: 58777 - need to convert string dates to js dates. Normally this is done in the model but in this case the date is a child entity of an array and doesnt have a date type model to do the transform.
                        value: (values && values.length) ? this.convertDate(values[0]) : null,
                        minHeight: 70
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
                        rows: 12,
                        resizable: true,
                        resizeHandles: 's',
                        minHeight: 70
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
                        checked: (values && values.length) ? values[0] : null,
                        minHeight: 70
                    }
                ];
            },
            'List': function (ptAttribute, values) {
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
                        layout: 'fit',
                        minHeight: 70,
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
                        minHeight: 70
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
                        value: values
                    }
                ];
            }
        }
    },

    initComponent: function () {

        this.items = [this.getEmptyComponent()];

        this.callParent(arguments);

        this.loadByProductTypeId();
    },

    convertDate: function (v) {
        if (!v) {
            return null;
        }
        if (Ext.isDate(v)) {
            return v;
        }
        return Ext.Date.parse(v, 'c');

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
            items = [],
            i,
            fldContainer;

        if (!id || !Ext.isNumeric(id)) {
            id = this.product.get('productTypeId');
        }
        if (!id) {
            return;
        }

        this.productType = type = this.product.productTypeRecord;
        if (!type) {
            return;
        }

        this.productTypeProperties = properties = type.getProperties();

        if (properties && properties.data && properties.data.items) {

            for (i = 0; i < properties.data.items.length; i++) {
                fldContainer = {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    width: '100%',
                    margin: '0 0 20 0',
                    items: [
                        this.buildEditor(properties.data.items[i], '0 15 0 0')
                    ]
                };
                i++;
                if (i < properties.data.items.length) {
                    Ext.Array.push(fldContainer.items, this.buildEditor(properties.data.items[i], '0 0 0 15'));
                }
                Ext.Array.push(items, fldContainer);
            }

        }

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

    buildEditor: function (ptAttribute, margin) {
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
            margin: margin,
            width: '50%',
            layout: 'fit',
            items: this.statics().editors[editor].apply(this, [ptAttribute, values])
        });
    },

    getFieldName: function (ptAttribute) {
        return 'product-property-' + ptAttribute.getId();
    }
});