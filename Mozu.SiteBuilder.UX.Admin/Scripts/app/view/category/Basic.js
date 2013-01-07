/**
 * @class Taco.view.category.Basic
 */
Ext.define('Taco.view.category.Basic', {
    extend: 'Taco.core.ux.form.Form',
    height: 500,
    width:560,
    requires: ['Taco.core.ux.CategoryComboBox', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Taco.core.ux.action.DirtyButton'],
    layout: {
        type:'fit'
    },
    
    listeners: {
        afterrender: function (foo) {
            foo.doLayout();
        }
    },
    items: [
        {
            height:1000,
            autoScroll: true,
            xtype: 'container',
            title:'xxx',
            //layout: {
            //    type: 'vbox',
            //    align:'stretch'

            //},
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                width: 500

            },
            items: [
        {
            name: 'name',
            fieldLabel: 'Category Name',
            allowBlank: false
        }, {
            xtype: 'categorycombobox',
            name: 'parentId',
            fieldLabel: 'Assign to Other Category',
            validator: function (value) {
                if (value == this.up().child('component[name="name"]').value) {
                    return 'Category name is in use';
                }
                else {
                    return true;
                }
            }
        }, {
            xtype: 'selectfield',
            name: 'pageSize',
            fieldLabel: 'Default Number of Products per Page',
            mode: 'local',
            valueField: 'storedValue',
            displayField: 'displayValue',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: [{
                    name: 'storedValue',
                    type: 'int'
                }, {
                    name: 'displayValue',
                    type: 'string'
                }],
                data: [
                    [2, '2'],
                    [4, '4']
                ]
            }),
            listeners: {
                afterrender: function (select) {
                    if (select.value === null) {
                        select.setValue(select.store.getAt(0).get('storedValue'));
                    }
                }
            }
        }, {
            xtype: 'container',
            itemId: 'sortGroup',
            //fieldLabel: 'Default Product Sort Order',
            layout: {
                type: 'hbox',
                align: 'top'
            },
            defaults: {
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [{
                xtype: 'selectfield',
                name: 'sortCriterion',
                fieldLabel: 'Default Product Sort Order',
                mode: 'local',
                valueField: 'storedValue',
                displayField: 'displayValue',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: [{
                        name: 'storedValue',
                        type: 'string'
                    }, {
                        name: 'displayValue',
                        type: 'string'
                    }],
                    data: [
                        ['title', 'Title'],
                        ['price', 'Price']
                    ]
                }),
                listeners: {
                    afterrender: function (select) {
                        if (select.value === null) {
                            select.setValue(select.store.getAt(0).get('storedValue'));
                        }
                    }
                }
            }, {
                xtype: 'selectfield',
                name: 'sortOrder',
                fieldLabel: 'Sort Order',
                labelClsExtra: 'taco-label-hidden',
                beforeSubTpl: '<span class="taco-selectfield-pretext">from</span>',
                mode: 'local',
                valueField: 'storedValue',
                displayField: 'displayValue',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: [{
                        name: 'storedValue',
                        type: 'string'
                    }, {
                        name: 'displayValue',
                        type: 'string'
                    }],
                    data: [
                        ['ASC', 'Ascending'],
                        ['DESC', 'Descending']
                    ]
                }),
                listeners: {
                    afterrender: function (select) {
                        if (select.value === null) {
                            select.setValue(select.store.getAt(0).get('storedValue'));
                        }
                        
                    }
                }
            }]
        }, {
            name: 'showDescriptions',
            xtype: 'checkboxfield',
            boxLabel: 'Show product descriptions'
        }, {
            name: 'slug',
            fieldLabel: 'SEO Friendly URL',
            xtype: 'slugfield',
            slugPrefix: 'www.mystore.com/category/'
        },
        {
            name: 'pageTitle',
            fieldLabel: 'Page Title'
        }, {
            name: 'metaTitle',
            fieldLabel: 'Meta Title'
        }, {
            name: 'metaDescription',
            fieldLabel: 'Meta Description'
        }, {
            name: 'metaKeywords',
            fieldLabel: 'Keywords'
        }]
        }]





});