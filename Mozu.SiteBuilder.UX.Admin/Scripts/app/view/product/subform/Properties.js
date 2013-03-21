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
            'Date': function (ptAttribute) {
                return [{
                    xtype: 'datefield',
                    name: this.getFieldName(ptAttribute)
                }];
            },
            'TextArea': function (ptAttribute) {
                return [{
                    xtype: 'textareafield',
                    name: this.getFieldName(ptAttribute)
                }];
            },
            'Yes/No': function (ptAttribute) {
                return [{
                    xtype: 'checkboxfield',
                    name: this.getFieldName(ptAttribute)
                }];
            },
            'List': function (ptAttribute) {
                return [{
                    xtype: ptAttribute.get('allowMulti') ? 'taco.field.multiselect' : 'selectfield',
                    name: this.getFieldName(ptAttribute),
                    displayField: 'value',
                    valueField: 'id',
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            {name: 'id', type: 'string'},
                            {name: 'value', type: 'string'}
                        ],
                        data: ptAttribute.get('selectedValues')
                    })
                }];
            },
            'TextBox': function (ptAttribute) {
                return [{
                    xtype: 'textfield',
                    name: this.getFieldName(ptAttribute),
                    store: ptAttribute.get('selectedValues')
                }];
            }
        }
    },
    
    initComponent: function () {
        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.items = [this.getEmptyComponent()];

        this.callParent(arguments);
    },

    loadByProductTypeId: function (id) {
        var type = this.productTypeStore.getById(id),
            properties,
            items = [];

        if (!type) {
            return;
        }

        properties = type.getProperties();

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
            html: 'Super sorry, but this product type does not have any properties associated to it....<small style="color: #eee;">    <i>idiot</i></small>'
        };
    },

    buildContainer: function (ptAttribute) {
        var items = this.buildEditor(ptAttribute);

        items.unshift({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'component',
                flex: 1,
                html: ptAttribute.get('attributeName')
            }, {
                xtype: 'action',
                text: 'Remove',
                hidden: ptAttribute.get('isRequired')
            }]
        });
        
        return Ext.widget({
            xtype: 'container',
            cls: 'taco-attribute-form',
            items: items        
        });
    },

    buildEditor: function (ptAttribute) {
        var editor = ptAttribute.get('inputType');
        
        if (typeof this.statics().editors[editor] !== 'function') {
            return [{
                xtype: 'component',
                html: 'Error: could not find editor type: ' + editor
            }];
        }

        return this.statics().editors[editor].apply(this, [ptAttribute]);
    },

    getFieldName: function (ptAttribute) {
        return 'product-property-' + ptAttribute.getId();
    }
});