Ext.define('Taco.view.productType.AttributeForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.producttype.attributeform',
    requires: ['Taco.store.Attributes'],
    flexLayout: true,

    containerWidth: 150,
    height: 400,

    ignoreParentFormTracking: true,

    initComponent: function () {
        var me = this;

        this.addEvents([
            'save',
            'cancel'
        ]);

        this.attributeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Attributes',
            remoteFilter: false,
            id: 'product-type-available-attributes-' + this.filterProperty
        });

        this.attributeStore.load();

        this.createFilter = function (attributeRecord) {
            return !me.ptAttributeStore.containsById(attributeRecord);
        };

        this.editFilter = function (attributeRecord) {
            return me.ptAttributeStore.containsById(attributeRecord);
        };

        this.callParent(arguments);
    },

    create: function () {
        this.removeAll();
        this.addButtons();
        this.addAttributes([
            {property: this.filterProperty, value: true},
            {filterFn: this.createFilter}
        ]);
    },

    edit: function (ptAttribute) {
        this.removeAll();
        this.addButtons();
        this.addAttributes(this.editFilter, ptAttribute);
    },

    addButtons: function () {
        this.saveButton = Ext.widget({
            xtype: 'dirtybutton',
            text: 'Done',
            click: this.onSave,
            scope: this
        });

        this.cancelButton = Ext.widget({
            xtype: 'secondarybutton',
            text: 'Cancel',
            click: function () {
                this.fireEvent('cancel');
            },
            scope: this
        });

        this.buttonContainer = Ext.create('Ext.container.Container', {
            width: this.containerWidth,
            items: [this.cancelButton, this.saveButton]
        });

        this.add(this.buttonContainer);
    },

    onSave: function () {
        this.record.set('isRequired', this.findField('isRequired').getValue());
        this.record.set('dataType', this.selectedAttribute.get('dataType'));
        this.record.set('attributeName', this.selectedAttribute.get('name'));
        this.record.set('inputType', this.selectedAttribute.get('inputType'));

        switch(this.selectedAttribute.get('inputType')) {
            
            case 'List':
                this.record.set('selectedValues', Ext.Array.pluck(this.selectionStore.data.items, 'raw'));
                break;
        }
        
        this.record.set('attributeFQN', this.selectedAttribute.getId());
        this.record.phantom = true;
        this.fireEvent('save', this, this.record);
    },

    addAttributes: function (filter, attribute) {
        this.attributeStore.clearFilter();
        this.attributeStore.filter(filter);

        this.insert(this.items.getCount() - 1, Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'attribute',
            fieldLabel: 'Attribute',
            store: this.attributeStore,
            width: this.containerWidth,
            displayField: 'name',
            valueField: 'id',
            value: attribute ? attribute.getId() : null,
            maxSelections: 1,
            listConfig: {
                selModel: {
                    allowDeselect: false,
                    mode: 'SINGLE',
                    listeners: {
                        selectionchange: function (selectionModel, records) {
                            if (!Array.isArray(records)
                                || records.length !== 1) {
                                return;
                            }
                            this.addEditor(records[0]);
                            this.saveButton.setDirty(true);
                            this.selectedAttribute = records[0];
                        },
                        buffer: 1,
                        scope: this
                    }
                }
            }
        }));
    },

    addEditor: function (attribute) { 
        var ptAttribute = this.ptAttributeStore.containsById(attribute);

        Ext.each(this.query('[removeOnAttributeChange]'), function (cmp) {
            this.remove(cmp);
        }, this);

        if (ptAttribute) {
            this.record = ptAttribute;
        }


        if (attribute.get('inputType') === 'List') {
            this.addListEditor(attribute);
        }
        this.addCheckboxes(attribute);
    },

    addListEditor: function (attribute) {
        var valuesField, selectionsField, valuesStore,
            fields = [
                {name: 'id', type: 'string'},
                {name: 'value', type: 'string'}
            ];

        valuesStore = Ext.create('Ext.data.Store', {
            fields: fields,
            data: attribute.get('values')
        });

        this.selectionStore = Ext.create('Ext.data.Store', {
            fields: fields,
            data: this.record.get('selectedValues')
        });

        //debugger;
        valuesField = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'values',
            fieldLabel: 'Values',
            removeOnAttributeChange: true,
            store: valuesStore,
            displayField: 'value',
            valueField: 'id',
            value: Ext.Array.pluck(this.record.get('selectedValues'), 'id'),
            width: this.containerWidth,
            listConfig: {
                cls: Ext.baseCSSPrefix + 'boundlist-with-hidden-selections',
                selModel: { 
                    mode: 'SIMPLE',
                    listeners: {
                        selectionchange: function (selectionModel, selected) {
                            Ext.each(selected, function (record) {
                                if (this.selectionStore.find('id', record.get('id')) > -1) {
                                    return;
                                }
                                this.selectionStore.add(record);
                            }, this);
                        },
                        scope: this,
                        buffer: 1
                    }
                }
            }
        });

        selectionsField = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'selections',
            removeOnAttributeChange: true,
            fieldLabel: 'Selections',
            store: this.selectionStore,
            ddReorder: true,
            width: this.containerWidth,
            margin: '0 40',
            listConfig: {
                selModel: { mode: 'MULTI' },
                itemTpl: [
                    '<span class="x-boundlist-item-drag">Drag </span>',
                    '<span class="x-boundlist-item-content">{value}</span>',
                    '<span class="x-boundlist-item-close"> Close</span>'
                ],
                listeners: {
                    itemclick: function (boundlist, record, item, index, e) {
                        if(!Ext.fly(e.target).hasCls('x-boundlist-item-close')) {
                            return;
                        }
                        
                        this.selectionStore.remove(record);
                        valuesField.deselect(record.get('id'));
                    },
                    scope: this
                }
            }
        });

        this.insert(this.items.getCount() - 1, valuesField);
        this.insert(this.items.getCount() - 1, selectionsField);
    },

    addCheckboxes: function (attribute) {
        var fieldGroup = Ext.create('Ext.container.Container', {
            removeOnAttributeChange: true,
            defaults: {
                xtype: 'checkbox',
                inputValue: true
            },
            items: [{
                name: 'isRequired',
                checked: this.record.get('isRequired'),
                boxLabel: 'Required by admin'
            }]
        });

        if (attribute.get('inputType') === 'list' && !attribute.get('isOption')) {
            fieldGroup.add({
                name: 'allowMulti',
                checked: this.record.get('allowMulti'),
                boxLabel: 'Allow Multi select'
            });
        }

        if (this.type === 'properties') {
            fieldGroup.add({
                name: 'isHidden',
                checked: this.record.get('isHidden'),
                boxLabel: 'Hidden from Shopper'
            });
        }


        this.insert(this.items.getCount() - 1, fieldGroup);
    }
});