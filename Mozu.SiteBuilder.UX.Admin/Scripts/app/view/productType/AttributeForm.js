Ext.define('Taco.view.productType.AttributeForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.producttype.attributeform',
    requires: ['Taco.store.Attributes'],
    flexLayout: true,

    containerWidth: 240,

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

        this.createFilter = function (record) {
            return me.assignedAttributeStore.indexOf(record) < 0;
        };

        this.editFilter = function (record) {
            return me.assignedAttributeStore.indexof(record) >= 0;
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

    edit: function (attribute) {
        this.removeAll();
        this.addButtons();
        this.addAttributes(this.editFilter, attribute);
    },

    addButtons: function () {
        this.saveButton = Ext.widget({
            xtype: 'dirtybutton',
            text: 'Done',
            click: function () {
                this.fireEvent('save');
            },
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

    addAttributes: function (filter, attribute) {
        this.attributeStore.clearFilter();
        this.attributeStore.filter(filter);

        this.insert(0, Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'attribute',
            fieldLabel: 'Attribute',
            store: this.attributeStore,
            width: this.containerWidth,
            margin: '0 40 0 0',
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
                                || records.length !== 1
                                || this.selectedAttribute === records[0]) {
                                return;
                            }
                            this.selectedAttribute = records[0];
                            this.addEditor(this.selectedAttribute);
                        },
                        scope: this
                    }
                }
            }
        }));
    },

    addEditor: function (attribute) { 
        console.log('add attribute', attribute);
    }
});