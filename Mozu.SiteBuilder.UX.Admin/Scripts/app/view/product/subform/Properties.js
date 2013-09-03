/**
 * @class Taco.view.product.subform.Properties
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Properties', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productpropertiesform',

    title: 'Properties',

    statics: {
        editors: {
            'Date': function (ptAttribute, values) {
                return [{
                    xtype: 'datefield',
                    name: this.getFieldName(ptAttribute),
                    value: (values && values.length) ? values[0] : null
                    
                }];
            },
            'TextArea': function (ptAttribute, values) {
                return [{
                    xtype: 'textareafield',
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
                    value:(values && values.length) ? values[0] : null
                }];
            },
            'List': function (ptAttribute, values) {
                return [{
                    xtype: ptAttribute.get('allowMulti') ? 'taco.field.multiselect' : 'selectfield',
                    name: this.getFieldName(ptAttribute),
                    displayField: 'value',
                    valueField: 'id',
                    allowBlank: ptAttribute.get('isRequired') === true ? false: true,
                    value: (values && values.length) ? values[0] : null,
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            {name: 'id', type: 'string'},
                            {name: 'value', type: 'string'}
                        ],
                        data: ptAttribute.get('selectedValues')
                    })
                }];
            },
            'TextBox': function (ptAttribute, values) {
                
                return [{
                    xtype: 'textfield',
                    name: this.getFieldName(ptAttribute),
                    value: (values && values.length) ? values[0] : null,
                    width: '100%'
                }];
            }
        }
    },
    
    initComponent: function () {
        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.items = [this.getEmptyComponent()];

        this.callParent(arguments);
        
        if (this.productTypeStore.loading) {
            this.productTypeStore.on('load', this.loadByProductTypeId, this, { single: true });
        } else {
            this.loadByProductTypeId();
        }
    },

    
    beforeSave:function() {
        if (this.productType == null) {
            return;
        }
        var form = this.getForm(),
            properties = this.product.getProperties();
        
        this.productTypeProperties.each(function (record) {

            var fieldName = this.getFieldName(record),
                values=null,
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
                debugger
            }

        }, this);
    },

    loadByProductTypeId: function (id) {
        
        var type ,
            properties,
            items = [];
        if (!id || !Ext.isNumeric( id )) {
            id = this.product.get('productTypeId');
        }
        if (!id) {
            return;
        }
        this.productType = type = this.productTypeStore.getById(id);
        if (!type) {
            return;
        }

        this.productTypeProperties = properties = type.getProperties();

        properties.each(function (ptAttribute) {
            items.push(this.buildContainer(ptAttribute));
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
            html: 'Sorry, but this product type does not have any properties associated to it.'
        };
    },

    buildContainer: function (ptAttribute) {
        var items = this.buildEditor(ptAttribute);
        
        items.unshift({
            xtype: 'container',
            padding: '0 0 10',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'component',
                flex: 1,
                html: ptAttribute.get('attributeName')
            }/*, { part of a larger story; uncomment when that time comes
                xtype: 'action',
                text: 'Remove',
                hidden: ptAttribute.get('isRequired'),
                attributeFQN: ptAttribute.get('attributeFQN'),
                listeners: {
                    click: Ext.bind(function (it) {
                        this.remove(it.up().up());
                        var index = this.productTypeProperties.find('attributeFQN', it.attributeFQN);
                        this.productTypeProperties.removeAt(index);
                        this.productTypeProperties.commitChanges();

                        var initLength = this.product.data.properties.length;
                        for (var x = 0; x < initLength; x++) {
                            if (this.product.data.properties[x].attributeFQN == it.attributeFQN) {
                                this.product.data.properties.splice(x, 1);
                                x--;
                                initLength--;
                            }
                        }
                    },this)
                }
            }*/]
        });
        
        return Ext.widget({
            xtype: 'container',
            cls: 'taco-attribute-form',
            items: items        
        });
    },

    buildEditor: function (ptAttribute) {
        var editor = ptAttribute.get('inputType'),
            attributeFQN = ptAttribute.get('attributeFQN'),
            prop = this.product.getProperties().getById(attributeFQN),
            values = prop ? prop.get('values') : null;
        
        if (typeof this.statics().editors[editor] !== 'function') {
            return [{
                xtype: 'component',
                html: 'Error: could not find editor type: ' + editor
            }];
        }
        
        return this.statics().editors[editor].apply(this, [ptAttribute, values]);
    },

    getFieldName: function (ptAttribute) {
        return 'product-property-' + ptAttribute.getId();
    }
});