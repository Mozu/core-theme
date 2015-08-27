///**
// * @class Taco.core.ux.form.Editor
// */

// deprecated

//Ext.define('Taco.core.ux.form.Editor', {
//    extend: 'Taco.core.ux.content.Container',
//    alias: 'widget.formeditor',
//    requires: ['Taco.core.ux.TabPanel','Taco.core.ux.action.PrimaryButton', 'Taco.core.ux.action.SecondaryButton', 'Taco.core.FormPanel','Taco.core.ux.Hint'],
//    tabs: [],
//    title: 'Title',
//    data: undefined,
//    model: '',
//    type: '',
//    recordId: undefined,
//    actions: [],
//    displayAssociations: [],
//    initComponent: function () {
//        var me = this,
//            dirtyButton;
            
//        me.header = {
//            title: me.title,
//            instructionText: me.instructionText,
//            actions: me.actions
//        };

//        me.tabPanel = Ext.create('Taco.core.ux.TabPanel', {
//            items: me.tabs
//        });

//        me.tabForm = Ext.create('Taco.core.FormPanel', {
//            layout: 'auto',
//            items: [me.tabPanel],
//            border: false,
//            boundModel: me.model,
//            trackResetOnLoad: true
//        });


//        //me.sideBar = Ext.create('Ext.container.Container', {
//        //    items: [],
//        //    flex:0,
//        //    width:200
//        //});
//        me.body = {
//            items: [{
//                xtype: 'container',
//                items: [me.tabForm],
//                layout: {
//                    type: 'fit',  //changing to vbox as sidebar... now goes below
//                    align: 'stretch'
//                }
//            }]
//        };
//        Ext.each(me.actions, function (action) {
//            if (action.eventName && typeof me[action.eventName] === "function") {
//                action.click = {
//                    fn: me[action.eventName],
//                    scope: me
//                };
//            }
//        });
//        me.callParent(arguments);
//        me.dirtyButton = me.down('dirtybutton');
//        if (me.dirtyButton) {
//            me.tabForm.getForm().on({
//                dirtychange: {
//                    fn: me.onFormStateChange,
//                    scope: me
//                },
//                validitychange: {
//                    fn: me.onFormStateChange,
//                    scope: me
//                }
//            });
//        }
//        if (me.recordId) {
//            me.load(me.recordId);
//        } else {
//            me.load(Ext.create(me.model));
//        }
//        me.on({
//            beforesave: {
//                fn: function () {
//                    if (this.down('form').getForm().hasInvalidField()) {
//                        var form = this.down('form').getForm();
//                        var item = form.getFields().findBy( function(field){
//                            return !field.isValid();
//                        });
//                        Taco.app.fireEvent('setmessage', 'Invalid field ' + (item.fieldLabel ||item.getName()), 'error');
//                        console.log ('notvalid' , item);
//                        return false;
//                    }
//                },
//                scope: me
//            },
//            save: {
//                fn: me.resetOriginalValues,
//                scope: me
//            }
//        });

//    },


//    resetOriginalValues: function () {
//        var me = this;
//        if (me.isDestroyed || me.tabForm.isDestroyed) {
//            return;
//        }
//        Ext.each(me.tabForm.getForm().getFields().items, function (field) {
//            field.resetOriginalValue();
//        });
//    },
//    initSaveTasks: function (chain) {
//        var me = this,
//            model = this.data;
//        chain.add({
//            key: 'update-main-record',
//            fn: function (chain) {
//                me.tabForm.getForm().updateRecord(model);
//                chain.callback();
//            },
//            scope: me
//        });
//        chain.addModelSaveTask({
//            key: 'main',
//            depends: ['update-main-record'],
//            model: me.tabForm.getRecord()
//        });
//        this.fireEvent('initSaveChain', chain);
//        return chain;
//    }
//    ,
//    createRecord: function () {
//        var me = this,
//            chain;
//        if (!me.fireEvent('beforeCreate')) {
//            return;
//        }
//        var newData = Ext.create(me.model);
//        me.fireEvent('create', newData);
//    },
//    save: function () {
//        var me = this,
//            chain;
//        if (!me.fireEvent('beforesave')) {
//            return;
//        }
//        chain = Ext.create('Taco.core.EventChain', {
//            shouldLog: true,
//            record: me.tabForm.getRecord(),
//            finalCallback: {
//                fn: function (chain) {
//                    me.fireEvent('save');
//                },
//                scope: me
//            }
//        });
//        this.initSaveTasks(chain);
//        chain.doWork();
//    },
//    deleteRecord: function () {
//        var me = this,
//            model,
//            isPhantom,
//            store;
//        if (!me.fireEvent('beforedeleterecord')) {
//            return;
//        }
//        model = me.tabForm.getRecord();
//        isPhantom = model.phantom;
//        store = (model.stores && model.stores.length > 0) ? model.stores[0] : null;
//        //doesnt fire events correctly

//        Ext.create('Taco.core.ux.modal.Confirmation', {
//            autoShow: true,
//            content: {
//                html: 'Are you sure?'
//            },
//            listeners: {
//                cancel: function () { },
//                confirm: function () {
//                    var autoSync = false;
//                    if (store) {
//                        autoSync = store.autoSync;
//                        store.autoSync = false;
//                        store.remove(model);
//                        store.autoSync = autoSync;
//                        if (isPhantom) {
//                            me.fireEvent('deleterecord');
//                            me.close();
//                        } else {
//                            store.sync({
//                                success: function (m) {
//                                    me.fireEvent('deleterecord');
//                                    me.close();
//                                },
//                                failure: function (m) {
//                                    Taco.app.fireEvent('setmessage', 'deletion failed.', 'error', m);
//                                    me.fireEvent('deleterecord');
//                                    me.close();
//                                }
//                            });
                            
//                        }
                        
                        
//                    } else {
//                        model.destroy({
//                            callback: function(c, r, s) {
//                                me.fireEvent('deleterecord');
//                                me.close();
//                            }
//                        });
//                    }
//                }
//            }
//        });



//        //me.close();
//    },
//    close: function () {
//        var me = this;
//        if (!me.fireEvent('beforeclose')) {
//            return;
//        }
//        me.hide();
//        me.fireEvent('close');
//        me.destroy();
//    },
//    copyRecord: function () {
//        var me = this,
//            model;

//        if (!me.fireEvent('beforecopyrecord')) {
//            return;
//        }
//        if (me.data.duplicate) {
//            me.data.duplicate({
//                success: function (copy) {
//                    if (me.data.stores && me.data.stores.length > 0) {
//                        me.data.store.add([copy]);
//                    }
                        
//                    Taco.app.fireEvent('setmessage', 'item copied.', 'status');
//                    me.fireEvent('copyrecord', copy);

//                },
//                failure: function (m, operation) {
//                    Taco.app.fireEvent('setmessage', 'failed to copy.', 'error', m);
//                }
//            });
//        }


//    },
//    cancel: function () {
//        var me = this;
//        if (!me.fireEvent('beforecancel')) {
//            return;
//        }
//        me.fireEvent('cancel');
//    },
//    loaded: false,

//    load: function (id) {
//        var me = this,
//            record, fnSuccess, model;
//        if (typeof id === "object") {
//            record = id;
//            id = 0;
//        }

//        fnSuccess = function (data) {

//            if (!me.fireEvent('beforeload', data)) {
//                return;
//            }
//            me.loaded = true;
//            me.data = data;
//            me.tabForm.loadRecord(data);
          
//            me.fireEvent('load', data);
//        };
//        if (id) {
//            Ext.ModelManager.getModel(me.model).load(id, {
//                success: fnSuccess,
//                failure: function () {
//                    me.fireEvent('loadfail');
//                    Taco.app.fireEvent('setmessage', 'item load fail', 'error');
//                }
//            });
//        } else if (record) {
//            fnSuccess(record);
//        } else {
//            me.fireEvent('loadfail');
//        }
//    },
//    onBeforeNavigate: function (newState, continueNavigate) {
//        var me = this,
//            confirm;
//        if (me.isDirty()) {
//            confirm = Ext.create('Taco.core.ux.modal.Confirmation', {
//                text: 'You have unsaved changes.<br><br>Would you like to continue and discard these changes?',
//                confirm: function () {
//                    confirm.hide();
//                    me.resetOriginalValues();
//                    // now try that navigation again
//                    continueNavigate();
//                },
//                autoShow: true
//            });
//            return false;
//        }
//    },
//    isDirty: function () {
//        var form = this.tabForm.getForm()
//        if (form) {
//            return form.isValid () && form.isDirty();
//        }
//        return false;
//    },

//    onFormStateChange: function (form) {
//        this.onDirtyChange();
//    },

//    onDirtyChange: function ()
//    {
//        var isDirty = this.isDirty();
//        if (this.dirtyButton) this.dirtyButton.setDirty(isDirty);
//        window.onbeforeunload = isDirty ? function () { return "You have unsaved changes. Continue anyway?" } : null;
//    },


//    showHint: function (config) {
//        // If hint is already on, move it rather than creating a new one
//        if (this.hint) {
//            if (this.hint.target !== config.target) {
//                this.hint.updateTarget(config);
//            }
//            return;
//        }

//        this.hint = Ext.create('Taco.core.ux.Hint', config);
//        //this.body.add(this.hint);
//    },

//    destroy: function () {
//        if (this.hint && this.hint.isComponent) {
//            this.hint.destroy();
//        }

//        this.callParent(arguments);
//    }

//});