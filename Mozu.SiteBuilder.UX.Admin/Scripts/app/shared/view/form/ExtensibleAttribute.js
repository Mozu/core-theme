Ext.define('Taco.shared.view.form.ExtensibleAttribute', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.extensibleattribute.subform',
    requires: [
        'Taco.model.ExtensibleAttributeValue'
    ],

    ui: 'subform',
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    cls: Taco.baseCSSPrefix + 'extensibleattributes',

    statics: {
        editors: {
            'Date': function (ptAttribute, values) {

                var date = (!values[0]) ? '' : new Date(values[0]),
                    displayDate = '';

                if (date) {
                    var day = date.getUTCDate(),
                        month = date.getUTCMonth(),
                        year = date.getUTCFullYear();

                    displayDate = new Date(year, month, day);
                }
                
                return [{
                    xtype: 'datefield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('adminName'),
                    allowBlank: ptAttribute.get('isRequired') === true ? false: true,
                    value: displayDate,
                    disabled: ptAttribute.get('valueType') === 'ShopperEntered' || this.isFieldReadonly(ptAttribute)
                }];
            },
            'TextArea': function (ptAttribute, values) {
                return [{
                    xtype: 'textareafield',
                    fieldLabel: ptAttribute.get('adminName'),
                    name: this.getFieldName(ptAttribute),
                    allowBlank: ptAttribute.get('isRequired') === true ? false: true,
                    value:(values && values.length) ? values[0] : null,
                    width: '100%',
                    cols: 100,
                    rows: 6,
                    resizable: true,
                    resizeHandles: 's',
                    disabled: ptAttribute.get('valueType') === 'ShopperEntered' || this.isFieldReadonly(ptAttribute)
                }];
            },
            'YesNo': function (ptAttribute, values) {
                var currentValue = (values[0] || '').toString().toLowerCase();

                return [{
                    xtype: 'radiogroup',
                    name: this.getFieldName(ptAttribute),
                    allowBlank: ptAttribute.get('isRequired') === true ? false : true,
                    fieldLabel: ptAttribute.get('adminName'),
                    items: [
                        { boxLabel: "Yes", name: ptAttribute.get('id'), inputValue: 'true', checked: currentValue === 'true' },
                        { boxLabel: "No", name: ptAttribute.get('id'), inputValue: 'false', checked: currentValue === 'false' }
                    ],
                    disabled: ptAttribute.get('valueType') === 'ShopperEntered' || this.isFieldReadonly(ptAttribute)
                }];
            },
            'List': function (ptAttribute, values) {
                return [{
                    xtype: ptAttribute.get('allowMulti') ? 'taco.field.multiselect' : 'selectfield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('adminName'),
                    displayField: 'value',
                    valueField: 'id',
                    allowBlank: ptAttribute.get('isRequired') === true ? false: true,
                    value: (values && values.length) ? values[0] : null,
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            {name: 'id', type: 'auto' , convert:function (v, record) {
                                var dt = ptAttribute.get('dataType');
                                if (dt == 'Number') {
                                    v=parseFloat(v);
                                }
                                return v;
                            }},
                            {name: 'value', type: 'string'}
                        ],
                        data: ptAttribute.get('values')
                    }),
                    disabled: ptAttribute.get('valueType') === 'ShopperEntered' || this.isFieldReadonly(ptAttribute)
                }];
            },
            'TextBox': function (ptAttribute, values) {
                var cfg = {
                    xtype: 'textfield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('adminName'),
                    allowBlank: ptAttribute.get('isRequired') === true ? false: true,
                    value: (values && values.length) ? values[0] : null,
                    width: '100%',
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    disabled: ptAttribute.get('valueType') === 'ShopperEntered' || this.isFieldReadonly(ptAttribute)
                };

                if (ptAttribute.get('dataType') === 'Number') {
                    cfg.xtype = 'numberfield';
                    cfg.rawToValue = function (rawValue) {
                        var value = isNaN(rawValue) ? null : parseFloat(Ext.Number.toFixed(parseFloat(rawValue), 2));
                        value = isNaN(value) ? 0 : value;

                        if (value === null) {
                            value = rawValue || null;
                        }
                        return value;
                    };
                }

                return [cfg];
            },
            'productPicker': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'taco.field.product',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('adminName'),
                        width: 600,
                        value: values,
                        disabled: ptAttribute.get('valueType') === 'ShopperEntered'
                    }
                ];
            }
        }
    },
    initComponent: function () {
        this.attrs = [];

        if (!this.attributeDefinitionStore)
            throw Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.configuration_problem;

        this.items = [ this.getLoadingComponent() ];

        this.callParent(arguments);

        if (this.attributeDefinitionStore.loading) {
            this.attributeDefinitionStore.on('load', this.loadAttributes, this, { single: true });
        } else {
            this.loadAttributes();
        }
    },

    loadAttributes: function () {
        var items = [];
        
        this.attributeDefinitions = this.attributeDefinitionStore.getRange();
        
        if (!this.attributeDefinitions) return;

        Ext.Array.each(this.attributeDefinitions, function (attributeDefinition) {

            if (attributeDefinition.get('isActive')) {
                items.push(this.buildContainer(attributeDefinition));
            }

        }, this);

        if (!items.length) items.push(this.getEmptyComponent());

        this.removeAll();
        this.add(items);
    },

    getLoadingComponent: function () {
        return {
            xtype: 'component',
            html: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.loading_attribute
        };
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.attributes_defined
        };
    },

    buildContainer: function (attributeDefinition) {
        var items,
            attrValue = this.findAttribute(attributeDefinition),
            checkbox,
            attr = {
                attribute: attributeDefinition,
                fieldName: this.getFieldName(attributeDefinition)
            },
            editorCfg;


        this.attrs.push(attr);
            
        if (!attrValue) {
            attrValue = Ext.create('Taco.model.ExtensibleAttributeValue', {
                fullyQualifiedName: attributeDefinition.get('attributeFQN'),
                attributeDefinitionId: attributeDefinition.get('attributeId'),
                values: []
            });

            this.record.getAttributes().add(attrValue);
        }


        editorCfg = this.buildEditor(attributeDefinition, attr, attrValue);

        return Ext.widget({
            xtype: 'container',            
            items: editorCfg
        });
        
    },

    buildEditor: function (attributeDefinition, attr, attrValue) {
        var editor = attributeDefinition.get('inputType'),
            values = attrValue.get('values');

        if (typeof this.statics().editors[editor] !== 'function') {
            return [{
                xtype: 'component',
                html: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_editor_type + editor
            }];
        }

        return this.statics().editors[editor].apply(this, [attributeDefinition, values]);
    },

    findAttribute: function (attributeDefinition) {
        return this.record.getAttributes().findRecord('fullyQualifiedName', attributeDefinition.getId(), null, null, null, true);
    },

    getFieldName: function (attributeDefinition) {
        return 'attribute-' + attributeDefinition.getId();
    },
    parseFieldName: function (fieldName) {
        return fieldName.replace(/^attribute-/, '');
    },

    isFieldReadonly: function (att) {
        var submittedDate = this.record.get('submittedDate'),
            orderHasBeenSubmitted = submittedDate !== null && submittedDate !== undefined;

        var result = orderHasBeenSubmitted && att.get('isReadOnly');
        return result;
    },

    beforeSave: function () {
        var me = this,
            form = me.getForm(),
            fields = form.getFields(),
            attrs = [];

        Ext.each(fields.items, function (field) {
            var fqn = me.parseFieldName(field.getName()),
                definition = me.attributeDefinitionStore.getById(fqn),
                val = field.getValue(),
                item = {};

            // we get only active ones, hence the check.
            if (definition)
            {
                item['attributeDefinitionId'] = definition.get('attributeId');
                item['fullyQualifiedName'] = fqn;
                item['id'] = null;

                var inputType = definition.get('inputType');

                //if (field.getXType() != 'datefield') {
                if (!Ext.isDate(val)) {

                    if (inputType == 'YesNo') {
                        if (val[fqn]) {
                            item['values'] = [val[fqn]];
                        }
                    }
                    else if (val || (field.originalValue && inputType == 'TextBox')) {
                        item['values'] = val ? [val] : [];
                    }

                } else {
                    item['values'] = [Ext.isEmpty(val) ? val : Ext.Date.format(val, 'c')];
                }

                if (item.values) {
                    attrs.push(item);
                }
            }
        });

        this.record.set('attributes', attrs);
    }
});
