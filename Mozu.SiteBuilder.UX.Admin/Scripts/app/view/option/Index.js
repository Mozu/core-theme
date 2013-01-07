
/**
 * @class Taco.view.option.Index
 * The Index view for options
 * @extends Taco.core.ux.content.Container
 */



Ext.define('Taco.view.option.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.BaseGrid','Taco.view.option.Edit'],
    alias: 'widget.optionindex',
    //store: ,
    initComponent: function () {
        var me = this;
        me.store = Taco.app.getStore('Taco.store.Options');
        me.store.clearFilter(true);
        if (!me.store.lastOptions) {
            me.store.load();
        }
        me.header = {
            title: 'Product Options',
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Option',
                onClick: function () {
                    me.addState();
                    me.launchEditor(Ext.create('Taco.model.Option'), true);
                }
            }]
        };

        me.pager = Ext.create('Taco.core.ux.GridPager', {
            store: me.store
        });
        me.search = Ext.widget('toolbar', {
            dock: 'top',
            items: [{
                xtype: 'textfield',
                flex: 2,
                emptyText: 'Search',
                enableKeyEvents: true,
                listeners: {
                    'keyup': {
                        fn: function(field){
                            var val = field.getValue();
                            if (val) {
                                me.store.filter({
                                    anyMatch: true,
                                    property: 'internalName',
                                    value: val,
                                    root: 'data'
                                });
                            } else {
                                me.store.clearFilter();
                            }
                        },
                        scope: me
                    }
                }
            }]
        });


        me.gridpanel = Ext.create('Taco.core.ux.BaseGrid', {
            store: me.store,
            disableSelection:true,
            listeners: {
                itemclick:this.onItemClick,
                deleteoption: this.onDeleteOption,
                dupoption: this.onDuplicateOption,
                scope:this
            },
            dockedItems: [me.search, me.pager],
            columns: [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'internalName',
                    text: 'Options Name',
                    flex: 1,
                    hideable: false,
                    cls: 'taco-frozen',
                    renderer: function (value) {
                        return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                    }
                }, {
                text: 'Options Type',
                dataIndex: 'isConfigurable',
                width:200,
                renderer: function (value) {
                    if (value ) {
                        return 'Configurable';
                    }
                    return 'Stand Alone';
                }
                }],
            actions: [{
                tooltip: 'Duplicate Product',
                iconCls: 'taco-action-addsub',
                eventName: 'dupoption'
            },
            {
                tooltip: 'Delete',
                iconCls: 'taco-action-delete',
                eventName: 'deleteoption'
            }],
            viewConfig: {
                loadMask: true //hahahahahahahahahah ............ gay
            }
        });

        Ext.apply(me.body, {
            layout:'fit',
            items: [me.gridpanel]
        });
        this.callParent(arguments);
      

        //console.log('index record', this.record);
        if (this.record) {
            this.launchEditor(this.record);
        }

    },

    bindStore: function (store) {
        var me = this;

        //me.down('gridpanel').store = store;
        //me.down('pagingtoolbar').store = store;
        //store.load();

    },

    addState: function (record) {
        var token = 'options/edit/';

        if (!record) {
            token = 'options/create';
        }
        else if (record.phantom) {
            token = 'options/create';
        }
        else if (record.getId) {
            token += record.getId();
        } else {
            token += record;
        }
        Taco.app.StateManager.addState(token);
    },

    launchEditor: function (record) {
        var valStore = record.optionValues();
            
        if (valStore.isLoading()) {
            valStore.on('load', function () { this.launchLoadedEditor(record); }, this, { single: true });
            return;
        }
        this.launchLoadedEditor(record);
    },
    
    launchLoadedEditor :function (record) {
        var token = 'options/edit/',
            store = this.store,
            editorView;
        editorView = Ext.create('Taco.view.option.Edit', {
            logicalParent: this,
            listeners: {
                cancel: function () {
                    editorView.destroy();
                    Taco.core.StateManager.addState('options');
                },
                aftersave: function (editor, record, isEdit) {
                    if (!isEdit) {
                        store.add(record);
                    }
                    editorView.destroy();
                    Taco.core.StateManager.addState('options');

                }
            },
            record: record
        });

        Taco.app.contentView.add(editorView);
    },

    onDeleteOption: function (v, index, idx, action, e, record) {
        var me = this;
        Ext.create('Taco.core.ux.modal.Confirmation', {
            autoShow: true,
            content: {
                html: 'Are you sure you want to delete this option?'
            },
            listeners: {
                cancel: function () { },
                confirm: function () {
                    me.store.remove(record);
                    me.store.sync({
                        success: function (m) {
                            Taco.app.fireEvent('setmessage', 'Option deleted.', 'status', m);
                        },
                        failure: function (m) {
                            Taco.app.fireEvent('setmessage', 'Option deletion failed.', 'error', m);
                        }
                    });
                    
                }
            }
        });
    },
    onDuplicateOption: function (v, index, idx, action, e, record) {
       
        var recordValues = record.optionValues() , me=this;
        if (recordValues.getCount() == 0) {
            recordValues.load({
                callback: function () {
                    me.onDuplicateOptionLoaded(record);
                }
            });
        } else {
            me.onDuplicateOptionLoaded(record);
        }
       

        
    },
    onDuplicateOptionLoaded: function (record) {
        var config, newRecord, recordValues = record.optionValues() ,newRecordValues , me = this;
        config = Ext.apply({ id: null }, record.data);
        config.internalName = config.internalName + "-copy";
        newRecord = Ext.create('Taco.model.Option', config);
        newRecord["optionValuesStore"] = Ext.data.AbstractStore.create({ model: 'Taco.model.OptionValue', remoteFilter: false });
        newRecordValues = newRecord.optionValues();
        recordValues.each(function (item) {
            newRecordValues.add({ value: item.get('value') });
        });
        this.launchLoadedEditor(newRecord, true );
    },
    onItemClick: function (view, record, elm, index, e) {
        if (e.target.className === 'taco-launch-editor') {
            this.addState(record);
            this.launchEditor(record);
        }
        
    }

});