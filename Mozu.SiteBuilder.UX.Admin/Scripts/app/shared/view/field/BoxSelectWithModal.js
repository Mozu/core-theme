/**
 * @class Taco.shared.view.field.BoxSelectWithModal
 */

Ext.define('Taco.shared.view.field.BoxSelectWithModal', {
    extend: 'Ext.container.Container',
    layout: 'auto',

    initComponent: function() {
        var store = this.getSelectStore();
        // reset the list's dirty state when its store first loads

        store.on({
            load: function() {
                this.list.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.list = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: this.name,
            width: this.width || 290,
            multiSelect: this.multiSelect,
            margin: 0,
            store: store,
            getStore: function() {
                return store;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: this.displayField || 'name',
            valueField: this.valueField || 'id',
            fieldLabel: this.fieldLabel || 'Select',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        this.items = [
             this.list,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: this.buttonLabel || 'Add',
                    margin: '0 0 0 10',
                    width: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: this.launchModal,
                    scope: this
                }
        ]

        this.callParent(arguments);
    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchModal: function() {
        var list = this.list;

        this.modal = this.getModal();

        this.modal.on({
            savesuccess: function(modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    }
});
