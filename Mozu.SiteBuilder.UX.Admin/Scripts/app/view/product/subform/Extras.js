/**
 * @class Taco.view.product.subform.Extras
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Extras', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productextrasform',

    requires: [
        'Taco.view.product.subform.ListExtraEditor'
    ],

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
        this.extras = [];

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

    addSaveTasks: function (tasks) {
        console.log('shit fuck');
        this.callParent(arguments);
    },

    bindExtras: function () {
        Ext.each(this.extras, function (extra) {
            var pExtra = this.findExtra(extra.ptAttribute),
                field;
            
            if (!pExtra) {
                pExtra = Ext.create('Taco.model.ProductExtra', {
                    attributeFQN: extra.ptAttribute.get('attributeFQN')
                });

                this.product.getExtras().add(pExtra);
            }

            pExtra.set('isRequired', extra.checkbox.getValue());

            if (extra.list) {
                extra.list.bindExtra(pExtra);
            } else {
                field = this.findField(extra.fieldName);
                pExtra.set('values', [{
                   value: extra.ptAttribute.get('attributeName'),
                   delta: field.getValue()
                }]);
            }
        }, this);
    },


    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'Sorry, but this product type does not have any extras associated to it.'
        };
    },

    findExtra: function (ptAttribute) {
        return this.product.getExtras().findRecord('attributeFQN', ptAttribute.get('attributeFQN'));
    },

    buildContainer: function (ptAttribute) {
        var items,
            pExtra = this.findExtra(ptAttribute),
            checkbox,
            extra = {
                ptAttribute: ptAttribute,
                fieldName: this.getFieldName(ptAttribute)
            },
            editorCfg = this.buildEditor(ptAttribute, extra, pExtra);


        this.extras.push(extra);

        checkbox = Ext.widget({
            xtype: 'checkbox',
            boxLabel: 'Required by Shopper',
            value: pExtra ? pExtra.get('isRequired') : false
        });

        extra.checkbox = checkbox;

        items = [{
            xtype: 'formflexbox',
            items: [{
                xtype: 'component',
                html: ptAttribute.get('attributeName')
            }, {
                xtype: 'action',
                text: 'Remove',
                hidden: ptAttribute.get('isRequired')
            }]
        }, 
        editorCfg, checkbox];
        
        return Ext.widget({
            xtype: 'container',
            cls: 'taco-attribute-form',
            items: items
        });
    },

    buildEditor: function (ptAttribute, extra, pExtra) {
        var list;

        //debugger;
        if (ptAttribute.get('inputType') === 'List') {
            list = Ext.widget({
                xtype: 'taco.product.listextraeditor',
                productTypeAttribute: ptAttribute,
                product: this.product,
                productExtra: pExtra
            });

            extra.list = list;

            return list;
        }

        return {
            xtype: 'formflexbox',
            justify: false,
            items: [{
                xtype: 'component',
                html: 'Store Label',
                width: 300
            }, {
                xtype: 'numberfield',
                name: this.getFieldName(ptAttribute),
                fieldLabel: 'Extra Cost',
                value: pExtra ? pExtra.get('values')[0].delta : null
            }]
        };
    },

    getFieldName: function (ptAttribute) {
        return 'product-extra-' + ptAttribute.getId();
    }
});