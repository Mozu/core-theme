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
            xtype: 'button',
            ui: 'action-primary',
            scale: 'medium',
            itemId: 'createActionButton',
            text: 'Add',
            scope: this,
            handler: this.create
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
        //var value = ;
       // console.log("xxx",value);
        attributeView = Ext.create('Ext.panel.Panel', {
            //strip out the spaces from the name so it will be a valid itemId tfs-17235
            attributeFQN: Ext.String.createVarName(ptAttribute.get('attributeFQN')),
            ui: 'subform-subform',
            cls: Taco.baseCSSPrefix + 'attribute-item',
            margin: '0 0 10',
            header:false,
           
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    xtype: 'numberfield',
                    margin: '0 10 0 0',
                    hideTrigger: true,
                    name:'order',
                    width: 60,
                    //value: ptAttribute.get('order'),
                    value: ptAttribute.get('order'),
                    listeners: {
                        change: function (cmp,value) {
                            ptAttribute.set('order', value);
                        }
                    }
                }, {
                    xtype: 'component',
                    html: '<b>' + ptAttribute.get('attributeName') + "</b>"
                },
                
                 { xtype: 'tbfill' },
                {
                    xtype: 'tool',
                    type: 'delete',
                    hidden: ptAttribute.get('isLocked'),
                    scope: this,
                    handler: function () {
                        console.log('delete');
                        this.removeAttribute(ptAttribute, attributeView);
                    }
                }, {
                    xtype: 'tool',
                    type: 'edit',
                    hidden: ptAttribute.get('isLocked'),
                    scope: this,
                    handler: function () {
                        console.log('edit');
                        this.edit(ptAttribute);
                    }
                }
                ]
            }],
            items: [
           {
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
        this.down('#createActionButton').disable();
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

        this.down('#createActionButton').enable();

        listCt = this.getLayout().setActiveItem(0);

        if (record && record.isModel) {
            //strip out the spaces from the name so it will be a valid itemId
            name = record.get('attributeFQN');
            listCt.down('[attributeFQN="' + name + '"]').down('#placeholder').update(record.getData());
        }
    }
});