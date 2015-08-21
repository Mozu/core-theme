Ext.define('Taco.view.publishing.modal.PublishSetPicker', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.publishing.grid.Publish'
    ],
    scale: 'small',
    title: 'Move to Publish Set',
    modal: true,
    closeAction: 'destroy',
    height: 350,
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
                    type: 'vbox' 
                },
                items: [
                   {    
                        xtype: 'combobox',
                        fieldLabel: 'Publish Set',
                        name: 'publishSetName',
                        itemId: 'publish-set-picker-combobox',
                        width: 457,
                        editable: true,
                        forceSelection: true,
                        store: this.getPublishSetStore(),
                        valueField: 'code',
                        displayField: 'name',
                        queryMode: 'local',
                        queryParam: 'name',
                        validator: function(name) {
                            if (this.store.data.items.some(function(rec){ return rec.get('name') === name;})) {
                                return true;
                            }

                            else if (this.store.totalCount < 1) {
                                return 'No Publish Sets Have Been Created';
                            }
                            else {
                                return 'Please choose a valid publish set';
                            }
                        },
                        listeners: {
                            afterrender: function(cmp) {
                                cmp.store.load({
                                    scope: me,
                                    callback: function() {
                                        cmp.setValue(me.record.get('publishSetCode'));
                                        if (me.record.get('publishDate')) {
                                            me.down('#publish-date-field').setValue(Ext.util.Format.date(me.record.get('publishDate'), 'M/D/Y g:i a'));
                                        }
                                    }
                                });
                            },
                            change: function(cmp) {
                                if (cmp.valueModels && cmp.valueModels[0] && cmp.getValue() !== -1) me.down('#publish-date-field').setValue(Ext.util.Format.date(cmp.valueModels[0].get('publishDate'), 'M j, Y g:ia T') || 'Unscheduled');
                            }
                        }
                    },

                    Ext.create('Ext.form.field.Text',
                       Taco.core.ux.TooltipLabel.wrapConfig('publishset.publishsetdate', me, {
                        name: 'scope',
                        fieldLabel: 'Publish Date',
                        labelAlign: 'top',
                        itemId: 'publish-date-field',
                        text: 'Publish Date',
                        width: 400,
                        style: 'padding-top:30px;font:bold 14px/14px "SourceSansProRegular",helvetica,arial,verdana,sans-serif;',
                        border: false,
                        listeners: {
                            afterrender: function(cmp) {
                                //disable without changing css
                                cmp.inputEl.dom.disabled = true;
                                cmp.inputEl.dom.style.borderWidth = '0px';
                            }
                        }
                    }))
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
        return Ext.create('Taco.store.PublishSets', {
            includeCounts: false,
            autoLoad: false,
            remoteFilter: false,
            remoteSort: false,
            // gonna remove pagesize, when we create the paginated modal in 1.19
            pageSize: 200,
            listeners: {
                load: {
                    fn: function(store, records) {
                        if (records.length < 1) {
                            this.down('#publish-set-picker-combobox').setValue(Ext.create('Taco.model.PublishSetItem', {
                                name: 'No Publish Sets Have Been Created',
                                code: '-1'
                            }));
                        }
                    },
                    single: true,
                    scope: this
                }
            }
        });
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