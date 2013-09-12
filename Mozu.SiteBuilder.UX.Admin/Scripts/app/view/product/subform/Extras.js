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
                }];
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
        var items = [];
        
        if (!id || !Ext.isNumeric(id)) id = this.product.get('productTypeId');

        if (!id) return;
        
        this.productType = this.productTypeStore.getById(id);
        
        if (!this.productType) return;

        this.productTypeExtras = this.productType.getExtras();

        this.productTypeExtras.each(function (ptAttribute) {
            items.push(this.buildContainer(ptAttribute));
        }, this);

        if (!items.length) items.push(this.getEmptyComponent());

        this.removeAll();
        this.add(items);
    },

    addSaveTasks: function (tasks) {
        console.log('error on addSaveTasks');
        this.callParent(arguments);
    },

    bindExtras: function () {
        Ext.each(this.extras, function (extra) {
            var pExtra = this.findExtra(extra.ptAttribute),
                field;

            pExtra.set('isRequired', extra.checkbox.getValue());

            if (extra.list) {
                extra.list.bindExtra(pExtra);
            } else {
                field = this.findField(extra.fieldName);
                pExtra.set('values', [{
                   value: extra.ptAttribute.get('attributeName'),
                   delta: parseFloat(field.getValue()) || 0
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
            editorCfg;


        this.extras.push(extra);
            
        if (!pExtra) {
            pExtra = Ext.create('Taco.model.ProductExtra', {
                attributeFQN: extra.ptAttribute.get('attributeFQN')
            });

            this.product.getExtras().add(pExtra);
        }

        editorCfg = this.buildEditor(ptAttribute, extra, pExtra);

        checkbox = Ext.widget({
            xtype: 'checkbox',
            boxLabel: 'Required by Shopper',
            value: pExtra ? pExtra.get('isRequired') : false,
            checked: pExtra ? pExtra.get('isRequired') : false,
            listeners: {
                change: function (checkbox, value) {
                    pExtra.set('isRequired', value);
                }
            }
        });

        extra.checkbox = checkbox;

        items = [{
            xtype: 'container',
            cls: 'extra-header',
            items: [{
                xtype: 'component',
                cls: 'extra-attribute',
                html: ptAttribute.get('attributeName')
            }/*, {  uncomment when the time comes from the larger story of things 
                xtype: 'action',
                text: 'Remove',
                hidden: ptAttribute.get('isRequired'),
                attributeFQN: ptAttribute.get('attributeFQN'),
                listeners: {
                    click: Ext.bind(function (it) {
                        
                        this.remove(it.up().up());
                        var initLength = this.extras.length;
                        for (var x = 0; x < initLength; x++) {
                            if (this.extras[x].ptAttribute.internalId == it.attributeFQN) {
                                this.extras.splice(x, 1);
                                x--;
                                initLength--;
                            }
                        }
                        
                        initLength = this.product.data.extras.length;
                        for (var x = 0; x < initLength; x++) {
                            if (this.product.data.extras[x].attributeFQN == it.attributeFQN) {
                                this.product.data.extras.splice(x, 1);
                                x--;
                                initLength--;
                            }
                        }

                    }, this)
                }
            }*/]
        }, 
        editorCfg, {
            xtype: 'container',
            cls: 'extra-required',
            items: [checkbox]
        }];
        


        return Ext.widget({
            xtype: 'container',
            cls: 'taco-attribute-form',
            items: items
        });
    },

    buildEditor: function (ptAttribute, extra, pExtra) {
        var list,
            value,
            values;

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

        //values = pExtra.get('values');
        
        if (!pExtra.get('values').length) {
            // values.push({
                
            // });

            pExtra.set('values', [{
                value: ptAttribute.get('attributeName'),
                delta: 0,
                createdByThom: true
            }]);
        }

        return {
            xtype: 'container',
            justify: false,
            items: [{
                xtype: 'component',
                html: 'Store Label',
                width: 300
            }, {
                xtype: 'unitfield',
                unitString: '$',
                emptyText: '0',
                unitAtEnd: false,
                name: this.getFieldName(ptAttribute),
                fieldLabel: 'Extra Cost',
                value: pExtra ? pExtra.get('values')[0].delta : null,
                listeners: {
                    change: function (field, value) {
                        pExtra.get('values')[0].delta = value;
                    }
                }
            }]
        };
    },

    getFieldName: function (ptAttribute) {
        return 'product-extra-' + ptAttribute.getId();
    }
});