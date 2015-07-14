Ext.define('Taco.view.publishing.modal.PublishSetPicker', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.publishing.grid.Publish'
    ],
    scale: 'small',
    title: 'Publishing',
    modal: true,
    closeAction: 'destroy',
    height: 300,
    width: 500,
    primaryText: 'Done',
    layout: { 
        type: 'fit' 
    },
    initComponent: function() {

        this.items = [{
            xtype: 'panel',
            layout: { 
                type: 'fit' 
            },
            items: [this.buildForm.call(this)]
        }];

        this.callParent(arguments);
    },

    buildForm: function() {
        var me = this;
        return Ext.create('Ext.form.Panel', {
            layout: 'hbox',
            items: [{
                xtype: 'container',
                itemId: 'publish-set-picker',
                layout: { 
                    type: 'hbox' 
                },
                items: [
                   {    
                        xtype: 'combobox',
                        fieldLabel: 'Publish Set',
                        name: 'publishSetName',
                        itemId: 'publish-set-picker-combobox',
                        width: 457,
                        // width: 375,
                        editable: true,
                        forceSelection: true,
                        store: this.getPublishSetStore(),
                        valueField: 'code',
                        displayField: 'name',
                        validator: function(name) {
                            if (this.store.data.items.some(function(rec){ return rec.get('name') === name;})) {
                                return true;
                            }
                            else {
                                return 'Please choose a valid publish set!';
                            }
                        },
                        listeners: {
                            afterrender: function(cmp) {
                                cmp.store.load({
                                    scope: me,
                                    callback: function() {
                                        cmp.setValue(me.record.get('publishSetCode'));
                                        // me.disableButton(me.record.get('publishSetCode'));
                                    }
                                });
                            },
                            change: function(record, value) {
                                // me.disableButton.call(me, value);
                            }
                        }
                   },
                   // {
                   //      xtype: 'button',
                   //      ui: 'action-primary',
                   //      scale: 'medium',
                   //      itemId: 'createActionButton',
                   //      text: 'Edit',
                   //      margin: '41 0 0 10',
                   //      scope: this,
                   //      handler: this.showEditModal.bind(this)
                   // }
                ]
            }]
        });
    },

    disableButton: function(value) {
        var func = value.toLowerCase() === 'unassigned' || !value ? 'disable' : 'enable';
        this.down('#createActionButton')[func]();
    },

    doSave: function() {
        this.callback.call(this, this.form.getValues().publishSetName);
        this.close();
    },

    getPublishSetStore: function() {
        return Ext.create('Taco.store.PublishSets', {includeCounts: false});
    },

    showEditModal: function(item, eventData) {
        var combobox = item.up('#publish-set-picker').down('#publish-set-picker-combobox'),
            record = combobox.store.getById(combobox.getValue());

        Ext.create('Taco.view.publishing.modal.CreatePublishSet', {
            record: record,
            isEdit: true,
            callback: function() {
                record.store.reload();
            }
        }).show();
    }
});