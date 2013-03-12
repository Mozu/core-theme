Ext.define('Taco.view.productType.AttributeGroup', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco.producttype.attributegroup',
    requires: ['Taco.view.productType.AttributeForm'],

    layout: 'card',
    header: {
        margin: '0 0 7'
    },
    cls: Taco.baseCSSPrefix + 'producttype-attribute-panel',
    margin: '0 0 21',

    attributeItemTpl: [
        '<tpl for=".">',
            '<span class="', Taco.baseCSSPrefix, 'draghandle"></span>',
            '<span class="', Taco.baseCSSPrefix, 'attribute-item-header-text">{attributeFQN}</span>',
        '</tpl>'
    ],

    initComponent: function () {
        this.tools = [{
            xtype: 'primarybutton',
            text: 'Add',
            click: this.create,
            scope: this
        }];

        this.title = Ext.util.Format.capitalize(this.type);

        this.editor = Ext.create('Taco.view.productType.AttributeForm', {

        });

        this.listContainer = Ext.create('Ext.container.Container', {
            items: this.buildAttributeList()
        });

        this.callParent(arguments);
    },

    buildAttributeList: function () {
        var items = [];

        this.store.each(function (attribute) {
            items.push(Ext.create('Ext.container.Container', {
                attribute: attribute,
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
                    items: [{
                        xtype: 'component',
                        flex: 1,
                        data: attribute.raw,
                        tpl: this.attributeItemTpl
                    }, {
                        xtype: 'secondarybutton',
                        text: 'Delete',
                        click: function () { this.removeAttribute(attribute); },
                        scope: this
                    }, {
                        xtype: 'secondarybutton',
                        text: 'Edit',
                        click: function () { this.edit(attribute); },
                        scope: this
                    }]
                }, {
                    xtype: 'container',
                    itemId: 'body',
                    minHeight: 50,
                    cls: Taco.baseCSSPrefix + 'attribute-item-body',
                    items: [{
                        xtype: 'component',
                        itemId: 'placeholder',
                        data: attribute.raw,
                        tpl: [
                            '<tpl if="this.isList(inputType)">',
                                '{[Ext.Array.pluck(values.allValues, "value").join(", ")]}',
                            '<tpl else>',
                                '{inputType}',
                            '</tpl>',
                            {
                                isList: function (inputType) { return inputType === 'List'; }
                            }
                        ]
                    }]
                }]
            }));
        }, this);
        
        return items;
    },

    create: function () {

    },

    edit: function (attribute) {
        this.editor.edit(attribute);
    },

    removeAttribute: function (attribute) {

    }
});