Ext.define('Taco.view.productType.AttributeGroup', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco.producttype.attributegroup',
    requires: ['Taco.view.productType.AttributeForm'],

    layout: 'card',

    attributeItemTpl: [
        '<tpl for=".">',
            '<span class="', Taco.baseCSSPrefix, 'draghandle"></span>',
            '<span class="', Taco.baseCSSPrefix, 'attribute-item-header-text">{attributeName}</span>',
        '</tpl>'
    ],

    initComponent: function () {
        this.cls = [this.cls, Taco.baseCSSPrefix + 'producttype-attribute-panel', Taco.baseCSSPrefix + 'form-section'].join(' ').trim();

        this.tools = [{
            xtype: 'primarybutton',
            text: 'Add',
            click: this.create,
            itemId: 'add',
            scope: this
        }];

        this.title = Ext.util.Format.capitalize(this.type);

        switch (this.type) {
            
            case 'options':
                this.store = this.productType.getOptions();
                this.filterProperty = 'isOption';
                break;
            
            case 'extras':
                this.store = this.productType.getExtras();
                this.filterProperty = 'isExtra';
                break;

            case 'properties':
                this.store = this.productType.getProperties();
                this.filterProperty = 'isProperty';
                break;
        }

        this.editor = Ext.create('Taco.view.productType.AttributeForm', {
            ptAttributeStore: this.store,
            filterProperty: this.filterProperty,
            type: this.type,
            listeners: {
                save: this.onSave,
                cancel: this.onCancel,
                scope: this
            }
        });

        this.listContainer = Ext.create('Ext.container.Container', {
            // height: 300,
            // autoScroll: true,
            items: this.buildAttributeList()
        });

        this.items = [this.listContainer, this.editor];

        this.callParent(arguments);
    },

    buildAttributeList: function () {
        var items = [];

        this.store.each(function (ptAttribute) {
            items.push(this.buildAttribute(ptAttribute));
        }, this);
        
        return items;
    },

    buildAttribute: function (ptAttribute) {
        var attributeView, items;

        items = [{
            xtype: 'component',
            flex: 1,
            data: ptAttribute.data,
            tpl: this.attributeItemTpl
        }];

        if (!ptAttribute.get('isLocked')) {
            items = items.concat([{
                xtype: 'secondarybutton',
                itemId: 'delete',
                text: 'Delete',
                click: function () { this.removeAttribute(ptAttribute, attributeView); },
                scope: this
            }, {
                xtype: 'secondarybutton',
                itemId: 'edit',
                text: 'Edit',
                click: function () { this.edit(ptAttribute); },
                scope: this
            }])
        }

        attributeView = Ext.create('Ext.container.Container', {
            reorderable: true,
            cls: Taco.baseCSSPrefix + 'attribute-item',
            items: [{
                xtype: 'container',
                itemId: 'header',
                cls: Taco.baseCSSPrefix + 'attribute-item-header',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: items
            }, {
                xtype: 'container',
                itemId: 'body',
                minHeight: 50,
                cls: Taco.baseCSSPrefix + 'attribute-item-body',
                items: [{
                    xtype: 'component',
                    itemId: 'placeholder',
                    data: ptAttribute.data,
                    tpl: [
                        '<tpl if="this.isList(inputType)">',
                            '{[Ext.Array.pluck(values.selectedValues, "value").join(", ")]}',
                        '<tpl else>',
                            '{inputType}',
                        '</tpl>',
                        {
                            isList: function (inputType) { return inputType === 'List'; }
                        }
                    ]
                }]
            }]
        });
        
        return attributeView;
    },

    create: function () {
        this.down('[itemId=add]').disable();
        this.editor.record = Ext.create('Taco.model.ProductTypeAttribute', {
            productTypeId: this.productType.getId()
        });
        this.editor.create();
        this.getLayout().setActiveItem(1);
    },

    edit: function (ptAttribute) {
        this.editor.record = ptAttribute;
        this.editor.edit(ptAttribute);
        this.getLayout().setActiveItem(1);
    },

    removeAttribute: function (ptAttribute, attributeView) {
        this.store.remove(ptAttribute);
        this.listContainer.remove(attributeView);
    },

    onSave: function (form, record) {
        //ToDo: revisit after 4.2 upgrade for the .update() funciton on the record
        //have to do this since EXTs form record is stale and doesn't refelct the correct data
        for (x in form.getValues()) {
            form.record.set(x, form.getValues()[x]);
        }

        if (!this.store.containsById(record)) {
            this.store.add(record);
            this.listContainer.add(this.buildAttribute(record));
        }
        this.onCancel();
    },

    onCancel: function () {
        this.down('[itemId=add]').enable();
        this.getLayout().setActiveItem(0);
    }
});