/**
 * @class Taco.view.product.subform.Extras
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Extras', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productextrasform',

    title: 'Extras',

    statics: {
        editors: {
            'List': function (ptAttribute, values) {

            },
            'TextBox': function (ptAttribute) {

            },
            'YesNo': function (ptAttribute) {
                return [{
                    xtype: 'component',
                    html: ''
                }]
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

    loadByProductTypeId: function (id) {
        
        var type ,
            extras,
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

        this.productTypeExtras = extras = type.getExtras();

        extras.each(function (ptAttribute) {
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
            html: 'Super sorry, but this product type does not have any extras associated to it....<small style="color: #eee;">    <i>idiot</i></small>'
        };
    },

    buildContainer: function (ptAttribute) {
        var items = [{
            xtype: 'formflexbox',
            items: [{
                xtype: 'component',
                html: ptAttribute.get('attributeName')
            }, {
                xtype: 'action',
                text: 'Remove',
                hidden: ptAttribute.get('isRequired')
            }]
        }, {
            xtype: 'formflexbox',
            justify: false,
            items: [{
                xtype: 'component',
                html: 'Store Label',
                width: 300
            }, {
                xtype: 'textfield',
                fieldLabel: 'Extra Cost'
            }]
        }, {
            xtype: 'checkbox',
            boxLabel: 'Required by Shopper'
        }];
        
        return Ext.widget({
            xtype: 'container',
            cls: 'taco-attribute-form',
            items: items
        });
    },

    buildContainer1: function (ptAttribute) {
        var items = this.buildEditor(ptAttribute);

        if (!items) {
            return;
        }

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
        return 'product-extra-' + ptAttribute.getId();
    }
});