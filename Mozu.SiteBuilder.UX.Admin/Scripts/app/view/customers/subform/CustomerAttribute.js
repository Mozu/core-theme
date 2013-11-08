Ext.define('Taco.view.customers.subform.CustomerAttribute', {
    extend: 'Taco.view.customers.subform.Subform',
    requires: ['Taco.model.ExtensibleAttributeValue'],
    title: 'Customer Attribute',
    cls: Taco.baseCSSPrefix + 'customer-notes',

    initComponent: function () {
        this.attrs = [],

        this.attributeDefinitionStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerAttributes');

        this.items = [ this.getLoadingComponent() ];

        this.callParent(arguments);

        if (this.attributeDefinitionStore.loading) {
            this.attributeDefinitionStore.on('load', this.loadAttributes, this, { single: true });
        } else {
            this.loadAttributes();
        }
    },

    loadAttributes: function () {
        var items = [];
        
        this.attributeDefinitions = this.attributeDefinitionStore.getRange();
        
        if (!this.attributeDefinitions) return;

        Ext.Array.each(this.attributeDefinitions, function (custAttributeDefinition) {
            items.push(this.buildContainer(custAttributeDefinition));
        }, this);

        if (!items.length) items.push(this.getEmptyComponent());

        this.removeAll();
        this.add(items);
    },

    getLoadingComponent: function () {
        return {
            xtype: 'component',
            html: 'Loading customer attribute definitions..'
        };
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'You don\'t have any customer attributes defined.'
        };
    },

    buildContainer: function (attributeDefinition) {
        var items,
            attrValue = this.findAttribute(attributeDefinition),
            checkbox,
            attr = {
                attribute: attributeDefinition,
                fieldName: this.getFieldName(attributeDefinition)
            },
            editorCfg;


        this.attrs.push(attr);
            
        if (!attrValue) {
            attrValue = Ext.create('Taco.model.ExtensibleAttributeValue', {
                fullyQualifiedName: attributeDefinition.get('attributeFQN'),
                attributeDefinitionId: attributeDefinition.get('attributeId'),
                values: []
            });

            this.record.getAttributes().add(attrValue);
        }

        editorCfg = this.buildEditor(attributeDefinition, attr, attrValue);

        items = [
            {
                xtype: 'container',
                cls: 'extra-header',
                items: [{
                    xtype: 'component',
                    cls: 'extra-attribute',
                    html: attributeDefinition.get('name')
                }]
            }, 
            editorCfg
        ];

        return Ext.widget({
            xtype: 'container',
            cls: 'taco-attribute-form',
            items: items
        });
    },

    buildEditor: function (ptAttribute, extra, pExtra) {
        return {
            xtype: 'label',
            text: 'popsicles.'
        };
    },

    findAttribute: function (custAttribute) {
        return this.record.getAttributes().findRecord('attributeFQN', custAttribute.get('attributeFQN'));
    },

    getFieldName: function (custAttribute) {
        return 'customer-attribute-' + custAttribute.getId();
    }
});