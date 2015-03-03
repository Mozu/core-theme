/**
 * @class Taco.view.product.subform.Extras
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Extras', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productextrasform',

    requires: [
        'Taco.view.product.subform.ListExtraEditor',
        'Taco.core.ux.form.CurrencyField'
    ],

    title: 'Extras',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    bodyPadding: '19 0 0 0',

    statics: {
        editors: {
            'List': function (ptAttribute, values) {

            },
            'TextBox': function (ptAttribute) {

            },
            'YesNo': function (ptAttribute) {
                return [
                    {
                        xtype: 'component',
                        html: ''
                    }
                ];
            }
        }
    },

    initComponent: function () {
        this.extras = [];

        this.callParent(arguments);

        this.loadByProductTypeId();
    },

    loadByProductTypeId: function (id) {
        var me = this,
            items = [],
            extraEditor;
        
        this.productType = this.product.productTypeRecord;

        if (!this.productType) {
            return;
        }

        this.productTypeExtras = this.productType.getExtras();

        this.productTypeExtras.each(function (ptAttribute) {
            extraEditor = this.buildContainer(ptAttribute);
            if (extraEditor) {
                items.push(extraEditor);
            }

        }, this);


        if (this.productTypeExtras.getCount() == 0) {
            items.push(this.getEmptyComponent());
        } else {


            me.availableAttributes = Ext.create('Taco.store.ProductTypes', {
                data: [].concat(me.productTypeExtras.data.items)
            });

            me.availableAttributes.addFilter([
                new Ext.util.Filter({
                    filterFn: function (rec) {

                        return !me.findExtra(rec);
                    }
                })
            ]);


            me.adderCombo = Ext.widget({
                xtype: 'combo',
                store: me.availableAttributes,
                editable: false,
                typeAhead: false,
                valueField: 'attributeFQN',
                itemId: 'extraAdder',
                displayField: 'adminName',
                emptyText: 'Add Extra',

                maxWidth: 200,
                queryMode: 'local',
                listeners: {
                    beforequery: function (qp) {
                        qp.forceAll = true;
                    },
                    select: function (field, records) {

                        extraEditor = me.buildContainer(records[0], true);
                        if (extraEditor) {
                            me.add(extraEditor);
                        }

                        field.reset();

                        me.availableAttributes.filter();

                    }
                }
            });


            this.add(me.adderCombo);
        }
        // this.removeAll();
        this.add(items);
    },

    //addSaveTasks: function (tasks) {
    //    console.log('error on addSaveTasks');
    //    this.callParent(arguments);
    //},

    bindExtras: function () {
        Ext.each(this.extras, function (extra) {
            var pExtra = this.findExtra(extra.ptAttribute),
                field;

            if (Ext.isEmpty(pExtra)) return;

            pExtra.set('isRequired', extra.checkbox.getValue());

            if (extra.list) {
                extra.list.bindExtra(pExtra);
            } else {
                field = this.findField(extra.fieldName);
                pExtra.set('values', [
                    {
                        value: extra.ptAttribute.get('adminName'),
                        deltaPrice: parseFloat(field.getValue()) || 0
                    }
                ]);
            }
        }, this);
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'This product type does not have any associated extras.'
        };
    },

    findExtra: function (ptAttribute) {
        return this.product.getExtras().findRecord('attributeFQN', ptAttribute.get('attributeFQN'), 0, false, false, true);
    },

    buildContainer: function (ptAttribute, createIfMissing) {
        var items,
            me = this,
            pExtra = this.findExtra(ptAttribute),
            checkbox,
            isMultiSelect,
            editor,
            extra = {
                ptAttribute: ptAttribute,
                fieldName: this.getFieldName(ptAttribute)
            },
            editorCfg;


        this.extras.push(extra);
        /*should add later */
        if (!pExtra) {
            if (!createIfMissing) {
                return null;
            }

            pExtra = Ext.create('Taco.model.ProductExtra', {
                attributeFQN: extra.ptAttribute.get('attributeFQN')
            });
            pExtra.setDirty();

            this.product.getExtras().add(pExtra);

        }

        editorCfg = this.buildEditor(ptAttribute, extra, pExtra);

        isMultiSelect = Ext.widget({
            xtype: 'checkbox',
            hidden: ptAttribute.get('inputType') != 'List',
            boxLabel: 'Allow Multi Select',
            value: pExtra ? pExtra.get('isMultiSelect') : false,
            checked: pExtra ? pExtra.get('isMultiSelect') : false,
            listeners: {
                change: function (checkbox, value) {
                    pExtra.set('isMultiSelect', value);
                }
            }
        });
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
        extra.isMultiSelect = isMultiSelect;

        

        items = [
            editorCfg, {
                xtype: 'container',
                //cls: 'extra-required',
                items: [checkbox, isMultiSelect]
            }
        ];

        var requiredCls = "";
        if (ptAttribute.data.isRequired) {
            requiredCls = " taco-attribute-form-required";
        }
        return editor = Ext.widget({
            xtype: 'panel',
            cls: 'taco-attribute-form' + requiredCls,
            ui: 'subform-section-child',
            title: ptAttribute.get('adminName'),
            margin: '10 0 10 0',
            bodyPadding: '0 10 10 10',            
            tools: [
                {
                    xtype: "button",
                    text: "Delete",
                    ui: "action",
                    scale: "medium",
                    hidden: ptAttribute.get('isRequired'),
                    scope: this,
                    handler: function () {
                        me.product.getExtras().remove(pExtra);
                        me.availableAttributes.filter();
                        editor.up().remove(editor);
                        me.adderCombo.focus();
                    }
                }
            ],
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

            pExtra.set('values', [
                {
                    value: ptAttribute.get('adminName'),
                    deltaPrice: 0,
                    createdByThom: true
                }
            ]);
        }

        
        return {
            xtype: 'container',
            justify: false,
            items: [
                //{
                //    xtype: "component",
                //    html: "<b>Store Front Label:</b> " + ptAttribute.data.attributeName
                //},
                {
                    xtype: 'currencyfield',
                    currencyCode: Taco.app.context.getCurrent().currencyCode,
                    emptyText: '0',
                    forcePrecision: true,
                    unitAtEnd: false,
                    name: this.getFieldName(ptAttribute),
                    fieldLabel: 'Extra Cost',
                    labelStyle:"padding-top:0px",
                    value: pExtra ? pExtra.get('values')[0].deltaPrice : null,
                    listeners: {
                        change: function (field, value) {
                            pExtra.get('values')[0].deltaPrice = value;
                        }
                    }
                }
            ]
        };
    },

    getFieldName: function (ptAttribute) {
        return 'product-extra-' + ptAttribute.getId();
    }
});