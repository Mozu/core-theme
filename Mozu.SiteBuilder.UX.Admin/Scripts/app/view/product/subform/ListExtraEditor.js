/**
 * @class  Taco.view.product.subform.ListExtraEditor
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.ListExtraEditor', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.product.listextraeditor',

    header: false,
    ignoreParentFormTracking: true,

    layout: 'card',

    initComponent: function () {
        this.loadData();

        this.listContainer = Ext.widget({
            xtype: 'container'
        });

        this.listEditor = Ext.widget({
            xtype: 'container'
        });

        this.items = [this.listContainer, this.listEditor];

        
        this.callParent(arguments);

        this.buildList();

        this.on({
            savablestatechange: this.onSavableStateChange,
            scope: this
        });
    },

    loadData: function () {
        var extra = this.product.getExtras().findRecord('attributeFQN', this.productTypeAttribute.getId());

        this.listItems = [];

        if (!extra) {
            return;
        }

        Ext.each(extra.get('values'), function (value) {
            console.log('load value', value);
        });
    },

    buildList: function (values) {
        var items = []

        if (values) {
            this.listItems = values;
        }
        
        this.listContainer.removeAll();

        Ext.each(this.listItems, function (li) {
            items.push({
                xtype: 'formflexbox',
                justify: false,
                items: [{
                    xtype: 'component',
                    html: li.value,
                    width: 300
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Extra Cost'
                }]
            });
        });

        items.push({
            xtype: 'action',
            text: 'Add/Edit',
            click: this.edit,
            scope: this
        });

        this.listContainer.add(items);
    },

    buildEditor: function () {
        var multiSelect,
            items = [],
            possibleValues = [],
            values;

        Ext.each(this.productTypeAttribute.get('selectedValues'), function (value) {
            possibleValues.push([value.id, value.value]);
        });

        this.listEditor.removeAll();

        multiSelect = Ext.widget({
            xtype: 'taco.field.multiselect',
            store: possibleValues,
            value: Ext.Array.pluck(this.listItems, 'id'),
            minSelections: 1
        });

        this.doneButton = Ext.widget({
            xtype: 'dirtybutton',
            text: 'Done',
            click: function () {
                var results = [];

                Ext.each(multiSelect.getSelected(), function (value) {
                    results.push({id: value.get('field1'), value: value.get('field2')});
                });

                this.buildList(results);
                this.getLayout().setActiveItem(0);
            },
            scope: this
        });

        items.push(multiSelect, {
            xtype: 'container',
            items: [{
                xtype: 'action',
                text: 'Cancel',
                click: function () {
                    this.getLayout().setActiveItem(0);
                },
                scope: this
            },
            this.doneButton]
        });

        this.listEditor.add(items);

        this.resetSavableState();
    },

    onSavableStateChange: function (form, state) {
        if (!this.doneButton) {
            return;
        }

        this.doneButton.setDirty(state);
    },

    bindExtra: function (extra) {
        console.log('do stuff!');
    },

    edit: function () {
        this.buildEditor();
        this.getLayout().setActiveItem(1);
    }
})