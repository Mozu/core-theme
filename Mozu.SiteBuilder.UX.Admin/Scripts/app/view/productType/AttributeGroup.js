Ext.define('Taco.view.productType.AttributeGroup', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco.producttype.attributegroup',
    requires: ['Taco.view.productType.AttributeForm'],

    bodyPadding: '19 0 0',
    margin: '0 0 10',
    ui: 'subform',

    layout: {
        type: 'card'
    },

    initComponent: function () {
        this.cls = [this.cls, Taco.baseCSSPrefix + 'producttype-attribute-panel'].join(' ');

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

        attributeView = Ext.create('Ext.panel.Panel', {
            itemId: ptAttribute.get('attributeName'),
            ui: 'subform-subform',
            cls: Taco.baseCSSPrefix + 'attribute-item',
            margin: '0 0 10',
            title: ptAttribute.get('attributeName'),
            tools: [{
                type: 'delete',
                hidden: ptAttribute.get('isLocked'),
                scope: this,
                handler: function () {
                    console.log('delete');
                    this.removeAttribute(ptAttribute, attributeView);
                }
            }, {
                type: 'edit',
                hidden: ptAttribute.get('isLocked'),
                scope: this,
                handler: function () {
                    console.log('edit');
                    this.edit(ptAttribute);
                }
            }],
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
        this.onCancel(record);
    },

    onCancel: function (record) {
        var listCt, name;

        this.down('[itemId=add]').enable();

        listCt = this.getLayout().setActiveItem(0);

        if (record && record.isModel) {
            name = record.get('attributeName');
            listCt.down('#' + name).down('#placeholder').update(record.getData());
        }
    }
});