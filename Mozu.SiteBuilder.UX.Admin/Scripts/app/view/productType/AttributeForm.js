Ext.define('Taco.view.productType.AttributeForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.producttype.attributeform',
    requires: [
        'Taco.store.Attributes',
        'Taco.core.ux.form.SelectField'
    ],
    layout: {
        type: 'hbox',
        align: 'top',
        defaultMargins: '0 20 0 0'
    },
    containerWidth: 150,
    ignoreParentFormTracking: true,

    initComponent: function () {
        var me = this;

        this.addEvents([
            'save',
            'cancel'
        ]);

        this.attributeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Attributes',
            createOnly:true,
            remoteFilter: false,
            clearFilters: true,
            clearSort: true,
            id: 'attributes',
            autoLoad: true
        });

        this.createFilter = function (attributeRecord) {
            return !me.ptAttributeStore.containsById(attributeRecord);
        };

        this.editFilter = function (attributeRecord) {
            var pta = me.ptAttributeStore.containsById(attributeRecord);

            if (!pta) {
                return false;
            }

            return !pta.get('isLocked');
        };

        this.callParent(arguments);
    },

    create: function () {
        this.removeAll();
        this.addButtons();
        this.addAttributes([
            {
                property: this.filterProperty,
                value: true
            },
            {
                filterFn: this.createFilter
            }
        ]);
    },

    edit: function (ptAttribute) {
        this.removeAll();
        this.addButtons();
        this.addAttributes([
            {
                filterFn: this.editFilter
            }
        ], ptAttribute);
    },

    addButtons: function () {
        this.saveButton = Ext.widget({
            xtype: 'button',
            ui: 'action-primary',
            scale: 'medium',
            text: 'Done',
            scope: this,
            handler: this.onSave
        });

        this.cancelButton = Ext.widget({
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Cancel',
            scope: this,
            handler: function () {
                this.fireEvent('cancel');
            }
        });

        this.buttonContainer = Ext.create('Ext.container.Container', {
            minWidth: this.containerWidth,
            layout: {
                type: 'hbox',
                align: 'top',
                defaultMargins: '0 0 0 10'
            },
            items: [this.cancelButton, this.saveButton]
        });

        this.add(this.buttonContainer);
    },

    onSave: function () {
        this.record.set('isRequired', this.findField('isRequired').getValue());
        this.record.set('dataType', this.selectedAttribute.get('dataType'));
        this.record.set('attributeName', this.selectedAttribute.get('name'));
        this.record.set('adminName', this.selectedAttribute.get('adminName'));
        this.record.set('inputType', this.selectedAttribute.get('inputType'));

        switch (this.selectedAttribute.get('inputType')) {

        case 'List':
            this.record.set('selectedValues', Ext.Array.pluck(this.selectionStore.data.items, 'raw'));
            break;
        }

        this.record.set('attributeFQN', this.selectedAttribute.getId());
        this.record.phantom = true;
        this.fireEvent('save', this, this.record);
    },

    addAttributes: function (filter, attribute) {
        var me = this;
        this.attributeStore.suspendEvents(false);
        this.attributeStore.clearFilter();
        this.attributeStore.filter(filter);
        this.attributeStore.sort({
            property: 'adminName',
            direction: 'ASC'
        });
        
        this.attributeStore.resumeEvents();
        
        this.insert(this.items.getCount() - 1, Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'attribute',
            fieldLabel: 'Attribute',
            store: this.attributeStore,
            minWidth: this.containerWidth,
            displayField: 'adminName',
            height: 300,
            ignoreParentFormTracking: true,
            valueField: 'id',
            value: attribute ? attribute.getId() : null,
            maxSelections: 1,
            listConfig: {
                selModel: {
                    allowDeselect: false,
                    deselectOnContainerClick: false,
                    mode: 'SINGLE',
                    listeners: {
                        selectionchange: {
                            fn: me.onSelectedAttributeChanged,
                            scope: this
                        },
                        buffer: 1,
                        scope: this
                    }
                }
            }
        }));
    },

    onSelectedAttributeChanged: function (selectionModel, records) {
        if (!Ext.isArray(records) || records.length !== 1) {
            return;
        }
        this.addEditor(records[0]);
        // this.saveButton.setDirty(true);
        this.selectedAttribute = records[0];
    },

    selectAttributeAndUpdateValues : function(ptAttribute) {
        var modelAttr = this.attributeStore.getById(ptAttribute.getId());
        if (modelAttr) {
            ptAttribute.set('values', modelAttr.get('values'));
        }
        this.onSelectedAttributeChanged(null, [ptAttribute]);
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
            dataType = attribute.get("dataType"),
            fields = [
                {
                    name: 'id',
                    type: 'string'
                },
                {
                    name: 'value',
                    type: (dataType && dataType == "Number") ? 'float' : 'string'
                }
            ];
        
        valuesStore = Ext.create('Ext.data.Store', {
            fields: fields,
            sorters: [{
                property: 'value',
                direction: 'ASC',
                sorterFn: function (a, b) {
                    a = a.data.value;
                    b = b.data.value;
                    var reA = /[^a-zA-Z]/g;
                    var reN = /[^0-9]/g;
                    var aA = (typeof a === 'string') ? a.replace(reA, "") : a; // check for option type 'number' since its supplied as int
                    var bA = (typeof b === 'string') ? b.replace(reA, "") : b;
                    if (aA === bA) {
                        var aN = parseInt(a.replace(reN, ""), 10);
                        var bN = parseInt(b.replace(reN, ""), 10);
                        return aN === bN ? 0 : aN > bN ? 1 : -1;
                    } else {
                        return aA > bA ? 1 : -1;
                    }
                }
            }],
            data: attribute.get('values')
        });

        this.selectionStore = Ext.create('Ext.data.Store', {
            fields: fields,
            sorters:[{
                property: 'value',
                direction: 'ASC',
                sorterFn: function (a, b) {
                    return a.index - b.index;
                }
            }],
            data: this.record.get('selectedValues')
        });

        
        // Ext.util.Observable.capture(this.selectionStore, function (eventName, e) { console.log(eventName, e); });

        valuesField = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'values',
            height: 300,
            ignoreParentFormTracking: true,
            fieldLabel: 'Values',
            removeOnAttributeChange: true,
            store: valuesStore,
            displayField: 'value',
            valueField: 'id',
            value: Ext.Array.pluck(this.record.get('selectedValues'), 'id'),
            minWidth: this.containerWidth,
            listConfig: {
                cls: Ext.baseCSSPrefix + 'boundlist-with-hidden-selections',
                selModel: {
                    deselectOnContainerClick: false,
                    mode: 'SIMPLE',
                    listeners: {
                        selectionchange: function (selectionModel, selected) {
                            Ext.each(selected, function (record) {
                                if (this.selectionStore.find('id', record.get('id'), 0, false, false, true) > -1) {
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
            height: 300,
            ignoreParentFormTracking: true,
            removeOnAttributeChange: true,
            fieldLabel: 'Selections',
            store: this.selectionStore,
            ddReorder: true,
            minWidth: this.containerWidth,
            displayField: 'value',
            valueField: 'id',

            listConfig: {

                itemTpl: [
                    '<span class="x-boundlist-item-drag">Drag </span>',
                    '<span class="x-boundlist-item-content">{value}</span>',
                    '<span class="x-boundlist-item-close"> </span>'
                ],

                listeners: {
                    itemclick: function (boundlist, record, item, index, e) {
                        if (!Ext.fly(e.target).hasCls('x-boundlist-item-close')) {
                            return;
                        }

                        this.selectionStore.remove(record);
                        valuesField.deselect(record.get('id'));
                    },
                    scope: this
                }
            }
        });
        //setting the sel css to be dummy.  Need selection for drag drop.
        selectionsField.boundList.selectedItemCls = 'dummy';
        this.insert(this.items.getCount() - 1, valuesField);
        this.insert(this.items.getCount() - 1, selectionsField);
    },

    addCheckboxes: function (attribute) {
        var me = this,
            fieldGroup = Ext.create('Ext.container.Container', {
                removeOnAttributeChange: true,
                defaults: {
                    xtype: 'checkbox',
                    inputValue: true,
                    ignoreParentFormTracking: true
                },
                items: [{
                    name: 'isRequired',
                    checked: this.record.get('isRequired'),
                    boxLabel: 'Required by admin'
                }]
            });

        if (attribute.get('inputType') === 'List' && this.type !== 'options') {
            fieldGroup.add({
                name: 'allowMulti',
                checked: this.record.get('allowMulti'),
                boxLabel: 'Allow Multi select'
            });
        }

        if (this.type === 'properties') {
            this.isAdminOnlyStore = Ext.create('Ext.data.Store', {
                fields: ['id', "name"],
                data: [
                    {
                        name: "Admin & Storefront",
                        id: false
                    }, {
                        name: "Admin Only",
                        id: true
                    }
                ]
            });

            this.displayGroupSelector = Ext.widget({
                xtype: 'selectfield',
                itemId: "displayGroupSelector",
                fieldLabel: 'Display Group',
                name: 'isAdminOnly',
                queryMode: 'local',
                margin: '0 0 10 0',
                width: 185,
                displayField: 'name',
                valueField: 'id',
                value: this.record.get('isAdminOnly'),
                store: this.isAdminOnlyStore,
                listeners: {
                    change: function (view, value) {
                        me.isHiddenFromShopper.setDisabled(value);
                    }
                }
            });

            this.isHiddenFromShopper = Ext.create('Ext.form.field.Checkbox', {
                name: 'isHidden',
                checked: this.record.get('isHidden'),
                disabled: this.record.get('isAdminOnly'),
                boxLabel: 'Hidden from Shopper'
            });

            fieldGroup.add(this.displayGroupSelector);
            fieldGroup.add(this.isHiddenFromShopper);
        }


        this.insert(this.items.getCount() - 1, fieldGroup);
    }
});