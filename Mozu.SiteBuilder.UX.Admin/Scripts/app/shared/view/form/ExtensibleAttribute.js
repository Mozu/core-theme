Ext.define('Taco.shared.view.form.ExtensibleAttribute', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco.extensibleattribute.subform',
    requires: ['Taco.model.ExtensibleAttributeValue'],
    width: 960,
    ui: 'subform',
    bodyPadding: '19 0',
    margin: '0 0 20 0',
    cls: Taco.baseCSSPrefix + 'extensibleattributes',

    initComponent: function () {
        this.attrs = [];

        if (!this.attributeDefinitionStore)
            throw "Configuration problem: there was no attributeDefinitionStore provided to this subform.";

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

        Ext.Array.each(this.attributeDefinitions, function (attributeDefinition) {
            items.push(this.buildContainer(attributeDefinition));
        }, this);

        if (!items.length) items.push(this.getEmptyComponent());

        this.removeAll();
        this.add(items);
    },

    getLoadingComponent: function () {
        return {
            xtype: 'component',
            html: 'Loading attribute definitions..'
        };
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'You don\'t have any attributes defined.'
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
                cls: 'attribute-header',
                items: [{
                    xtype: 'component',
                    cls: 'attribute',
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

    buildEditor: function (attributeDefinition, attr, attrValue) {
        return {
            xtype: 'label',
            text: 'popsicles.'
        };
    },

    findAttribute: function (attributeDefinition) {
        return this.record.getAttributes().findRecord('attributeFQN', attributeDefinition.get('attributeFQN'));
    },

    getFieldName: function (attributeDefinition) {
        return 'attribute-' + attributeDefinition.getId();
    }
});
