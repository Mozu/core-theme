Ext.define('Taco.shared.view.form.ExtensibleAttribute', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco.extensibleattribute.subform',
    requires: ['Taco.model.ExtensibleAttributeValue'],
    width: 960,
    ui: 'subform',
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    cls: Taco.baseCSSPrefix + 'extensibleattributes',
    statics: {
        editors: {
            'Date': function (ptAttribute, values) {
                return [{
                    xtype: 'datefield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('name'),
                    value: (values && values.length) ? values[0] : null
                    
                }];
            },
            'TextArea': function (ptAttribute, values) {
                return [{
                    xtype: 'textareafield',
                    fieldLabel: ptAttribute.get('name'),
                    name: this.getFieldName(ptAttribute),
                    value:(values && values.length) ? values[0] : null,
                    width: '100%',
                    rows: 12,
                    resizable: true,
                    resizeHandles: 's'
                }];
            },
            'YesNo': function (ptAttribute, values) {
                return [{
                    xtype: 'checkboxfield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('name'),
                    value:(values && values.length) ? values[0] : null
                }];
            },
            'List': function (ptAttribute, values) {
                return [{
                    xtype: ptAttribute.get('allowMulti') ? 'taco.field.multiselect' : 'selectfield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('name'),
                    displayField: 'value',
                    valueField: 'id',
                    allowBlank: ptAttribute.get('isRequired') === true ? false: true,
                    value: (values && values.length) ? values[0] : null,
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            {name: 'id', type: 'string'},
                            {name: 'value', type: 'string'}
                        ],
                        data: ptAttribute.get('values')
                    })
                }];
            },
            'TextBox': function (ptAttribute, values) {
                
                return [{
                    xtype: 'textfield',
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: ptAttribute.get('name'),
                    value: (values && values.length) ? values[0] : null,
                    width: '100%'
                }];
            },
            'productPicker': function (ptAttribute, values) {
                return [
                    {
                        xtype: 'taco.field.product',
                        name: this.getFieldName(ptAttribute),
                        fieldLabel: ptAttribute.get('name'),
                        width:600,
                        value: values,
                    }
                ];
            },
            
        }
    },
    initComponent: function () {
        this.attrs = [];

        if (!this.attributeDefinitionStore)
            throw "Configuration problem: there was no attributeDefinitionStore provided to this subform.";

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
            items.push(this.buildContainer(attributeDefinition));
        }, this);

        if (!items.length) items.push(this.getEmptyComponent());

        this.removeAll();
        this.add(items);
    },

    getLoadingComponent: function () {
        return {
            xtype: 'component',
            html: 'Loading attribute definitions..'
        };
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'You do not have any attributes defined.'
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
            cls: 'taco-attribute-form',
            items: editorCfg
        });
        
    },

    buildEditor: function (attributeDefinition, attr, attrValue) {
       
        var editor = attributeDefinition.get('inputType'),
            //attributeFQN = ptAttribute.get('attributeFQN'),
            //prop = this.product.getProperties().getById(attributeFQN),
            values = attrValue.get('values');

        if (typeof this.statics().editors[editor] !== 'function') {
            return [{
                xtype: 'component',
                html: 'Error: could not find editor type: ' + editor
            }];
        }

        return this.statics().editors[editor].apply(this, [attributeDefinition, values]);
    },

    findAttribute: function (attributeDefinition) {
        return this.record.getAttributes().findRecord('attributeFQN', attributeDefinition.get('attributeFQN'));
    },

    getFieldName: function (attributeDefinition) {
        return 'attribute-' + attributeDefinition.getId();
    },
    beforeSave: function () {
        var form = this.getForm();
        debugger
        /*
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
                    pRecord = properties.add({ attributeFQN: record.getId() })[0];
                }
                pRecord.set('values', values);
            }

        }, this);
        */
    }
});
