/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.formform',
    requires: [
        'Taco.core.ux.form.Tasks'
    ],

    cascadeChildTasks: true,
    cascadeRecordLoad: true,
    enableStoreSyncTasks: false,
    form: null,
    formCfg: null,
    isFormForm: true,
    persistChangesToModel: false,
    records: null,
    savableState: false,
    savePrefix: null,

    createTitle: 'Create',
    editTitle: 'Edit',
    model: '',
    storeType: '',
    tasksKeyPrefix: '',

    manageHeight: false,
    trackResetOnLoad: true,

    componentCls: Taco.baseCSSPrefix + 'formform',

    basicFormConfigs: [
        'api', 
        'baseParams', 
        'errorReader', 
        'jsonSubmit',
        'method', 
        'paramOrder',
        'paramsAsHash',
        'reader',
        'requireDirty',
        'standardSubmit',
        'timeout',
        'trackResetOnLoad',
        'url',
        'waitMsgTarget',
        'waitTitle'
    ],

    initComponent: function () {
        var formCfg;

        if (!this.formCfg) {
            this.formCfg = {};
        }

        formCfg = Ext.applyIf(this.formCfg, {
            record: this.record
        });

        if (this.title) {
            this.originalTitle = this.title;
        }

        this.addEvents([
            /**
             * @event beforeload
             * Fired before the record loads into the form
             * @param {Taco.core.ux.Form.Form} form Form where the record will be loaded
             * @param {Ext.data.Model} record The record that will be loaded into the form
             */
            'beforeload',
            /**
             * @event afterloadg
             * Fired after the record has been successfully loaded for this form
             * @param {Taco.core.ux.Form.Form} form Form where the record was loaded
             * @param {Ext.data.Model} record The record that was loaded into the form
             */
            'afterload'
        ]);

        if (!this.items) {
            this.items = [];
        }

        Ext.applyIf(this, {
            items: [],
            stores: []
        });

        if (this.stores.isStore) {
            this.stores = [this.stores];
        }

        if (this.store && this.store.isStore) {
            this.stores.push(this.store);
        }

        Ext.Array.forEach(this.items, function (item) {
            // Don't override models that have already been set manually
            if (!item || (item.record && item.record.isModel)) {
                return;
            }

            if (item.isFormForm) {
                Ext.applyIf(item, formCfg);
            }
        }, this);

        this.saveTasks = Ext.create('Taco.core.ux.form.Tasks');

        this.callParent(arguments);

        this.loadForm();

        this.saveTasks.on({
            complete: {
                scope: this,
                fn: function (tasks) {
                    Ext.defer(function () {
                        if (tasks.complete) {
                            this.resetOriginalValues();
                            this.fireEvent('savesuccess', this);
                        } else {
                            this.fireEvent('savefailure', this, tasks);
                        }
                        this.fireEvent('savecomplete', this, tasks);
                    }, 1, this);
                }
            }
        });
    },

    addChildSaveTasks: function (tasks) {
        Ext.Array.forEach(this.getTrackedForms(), function (form) {
            if (!form.isDestroyed) {
                form.addSaveTasks(tasks);
            }
        }, this);

        return tasks;
    },

    addSaveTasks: function (tasks, updateRecord, saveRecord) {
        var saveTask;
        if (this.cascadeChildTasks) {
            this.addChildSaveTasks(tasks);
        }
        if (updateRecord !== false) {
            tasks.add({
                updateRecord: this.record,
                updateForm: this
            });
        }
        if (saveRecord !== false && this.record && this.record.getProxy().api && this.record.getProxy().api.read) {
            saveTask = {
                saveRecord: this.record
            };
            
            tasks.add(saveTask);
        }
        this.addStoreSaveTasks(tasks);
        return tasks;
    },

    addStore: function (store) {
        this.stores.push(store);
    },

    addStoreSaveTasks: function (tasks) {
        var record = this.record;
        if (this.enableStoreSyncTasks && this.stores) {
            Ext.Array.forEach(this.stores, function (store) {
                var saveTask = {
                    store: store
                };

                if (record) {
                    saveTask.dependencyFilter = function (task) {
                        return task.saveRecord === record;
                    };
                }

                tasks.add(saveTask);
            }, this);
        }

        return tasks;
    },

    beforeSave: function () {
        var res = true;

        Ext.Array.each(this.getTrackedForms(), function (form) {
            if (!form.isDestroyed && form.beforeSave() === false) {
                return res = false;
            }
        }, this);

        return res;
    },

    

    findField: function (id) {
        return this.getForm().findField(id);
    },

    getTrackedFields: function () {
        var cmpId = this.getId();

        return this.query('[isFormField]{up("form").getId()==="' + cmpId + '"}');
    },

    getTrackedFieldsValues: function (asString, dirtyOnly, includeEmptyText, useDataValues) {
        var values  = {},
        fields  = this.getTrackedFields(),
        f,
        fLen    = fields.length,
        isArray = Ext.isArray,
        field, data, val, bucket, name;

        for (f = 0; f < fLen; f++) {
            field = fields[f];            
            
            if (!dirtyOnly || field.isDirty()) {
                data = field[useDataValues ? 'getModelData' : 'getSubmitData'](includeEmptyText);


                if (Ext.isObject(data)) {
                    for (name in data) {
                        if (data.hasOwnProperty(name)) {
                            val = data[name];

                            if (includeEmptyText && val === '') {
                                val = field.emptyText || '';
                            }

                            //this is a check for an extention of radio which lets you save the value on the selected radio button instead of passing an array of values for each button with the same name;
                            // this is to support the use case where you have multiple radio buttons that share a common name;. Only the selected radio will return its inputValue; The default behavior returns an array of values for all buttons;
                            if (field.xtype == "radio" && field.persistSelectedValueOnly) {                                
                                // only persist if the radio button is selected;
                                if (field.checked) {
                                    values[name] = val;
                                }

                            } else if (values.hasOwnProperty(name)) {
                                bucket = values[name];

                                if (!isArray(bucket)) {
                                    bucket = values[name] = [bucket];
                                }

                                if (isArray(val)) {
                                    values[name] = bucket.concat(val);
                                } else {
                                    bucket.push(val);
                                }
                            } else {
                                values[name] = val;
                            }
                        }
                    }
                }
            }
        }

        if (asString) {
            values = Ext.Object.toQueryString(values);
        }
        return values;
    },

    getTrackedForms: function () {
        var cmpId = this.getId();

        return this.query('[isFormForm]{up("form").getId()==="' + cmpId + '"}');
    },

    initTitle: function () {
        var tplInput, data, tpl;


        if (this.originalTitle) {
            return;
        }

        tplInput = this.isEdit() ? this.editTitle : this.createTitle;
        data = Ext.apply({}, {
            record: this.record
        }, this.titleData);

        if (typeof tplInput === 'string') {
            tplInput = [tplInput];
        }

        if (typeof tplInput.push !== 'function') {
            return;
        }

        tplInput.push({
            get: function (rec, field) {
                return rec.get(field);
            }
        });

        tpl = new Ext.XTemplate(tplInput);

        this.setTitle(tpl.apply(data));
    },

    /**
     * Check to see if the form is in Create Mode or Edit Mode.
     * Determines this based on the state of the loaded record.
     * @return {Boolean} True for edit mode, false for create mode
     */
    isEdit: function () {
        if (!this.isCreate) {
            this.isCreate = this.record && this.record.phantom;
            //!(this.record && !this.record.phantom);
        }
        return !this.isCreate;
    },

    loadForm: function (record, noCascade) {
        var noCascadeArg = noCascade,
            recordArg = record;

        if (!record) {
            record = this.record;
        }

        if (record && this.fireEvent('beforeload', this, record)) {
            this.loadRecord(record);

            if (noCascade === undefined) {
                noCascade = !this.cascadeRecordLoad;
            }

            if (!noCascade) {
                Ext.Array.forEach(this.getTrackedForms(), function (form) {
                    if (!form.isDestroyed) {
                        form.loadForm(recordArg, noCascadeArg);
                    }
                }, this);
            }

            this.initTitle();

            this.fireEvent('afterload', this, record);
        }
    },

    loadSingleValue: function (fieldName, value, trackedFields) {
        var me = this,
            trackedFields,
            field;

        Ext.Array.each(trackedFields, function (trackedField) {
            if (trackedField && trackedField.name === fieldName) {
                field = trackedField;
                return false;
            }
        }, this);

        if (field) {
            field.batchChanges(function () {
                field.setValue(value);
                field.initValue();
                if (me.getForm().trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            });
        }
    },

    loadRecord: function (record, cascade) {
        var trackedFields = this.getTrackedFields();

        if (cascade) {
            return this.callParent([record]);
        }

        Ext.Object.each(record.getData(), function (key, value) {
            this.loadSingleValue(key, value, trackedFields);
        }, this);
    },

    persistFormValues: function () {
        this.update();
    },

    resetOriginalValues: function (tasks) {
        var trackedFields = this.getTrackedFields(),
            trackedForms = this.getTrackedForms();

        Ext.Array.forEach(trackedForms, function (form) {
            if (!form.isDestroyed) {
                form.resetOriginalValues();
            }
        }, this);

        Ext.Array.forEach(trackedFields, function (field) {
            if (field.resetOriginalValue) {
                field.resetOriginalValue();
            }
        }, this);
    },

    save: function () {
        //todo ? clear save tasks?
        if (this.beforeSave() !== false) {
            this.addSaveTasks(this.saveTasks);            
            this.fireEvent('beforesaveexecute', this);            
            this.saveTasks.execute();
        }
    },

    setReadOnly: function (readOnly) {
        Ext.Array.forEach(this.query('[isFormField]'), function (cmp) {
            if (typeof cmp.setReadOnly === 'function') cmp.setReadOnly(readOnly);
        }, this);
    },

    showHint: function (config) {
        // If hint is already on, move it rather than creating a new one
        if (this.hint) {
            if (this.hint.target !== config.target) {
                this.hint.updateTarget(config);
            }
            return;
        }

        this.hint = Ext.create('Taco.core.ux.Hint', config);
    },

    /**
     * Updates the model bound to the form and calls update() on each form in forms.
     */
    update: function () {
        var fields, values, obj, name;

        if (this.record) {
            fields = this.record.fields.items;
            values = this.getTrackedFieldsValues(false, false, false, true);
            obj = {};
            // i = 0,
            // len = fields.length,
            // name;

            Ext.Array.forEach(fields, function (field) {
                var name = field.name;

                if (values.hasOwnProperty(name)) {
                    obj[name] = values[name];
                }
            }, this);

            // for (var i = 0; i < len; ++i) {
            //     name = fields[i].name;

            //     if (values.hasOwnProperty(name)) {
            //         obj[name] = values[name];
            //     }
            // }

            this.record.beginEdit();
            this.record.set(obj);
            this.record.endEdit();
        }

        Ext.Array.forEach(this.getTrackedForms(), function (form) {
            if (!form.isDestroyed) {
                form.update();
            }
        }, this);
    },

    updateForm: function (callback, scope) {
        var remTasks = [],
            updateTasks;

        if (this.beforeSave === false) return;

        updateTasks = Ext.create('Taco.core.ux.form.Tasks');

        if (callback) updateTasks.on('complete', callback, scope);

        this.addSaveTasks(updateTasks, true, false);

        updateTasks.tasks.each(function (task) {
            if (!task.updateForm) remTasks.push(task);
        });

        updateTasks.tasks.removeAll(remTasks);

        updateTasks.execute();
    },

    destroy: function () {
        if (this.hint && this.hint.isComponent) {
            this.hint.destroy();
        }

        this.callParent(arguments);
    },

    // removed functions

    bindStore: function (store) {
        throw 'deprecated function: bindStore';
    },

    checkFields: function (container, cmp) {
        throw 'deprecated function: checkFields';
    },

    getSavableState: function () {
        throw 'deprecated function: getSavableState';
    },

    markRequired: function () {
        throw 'deprecated function: markRequired';
    },

    onFormAdded: function (me, container) {
        throw 'deprecated function: onFormAdded';
    },

    resetSavableState: function (isSavable) {
        throw 'deprecated function: resetSavableState';
    },

    savableStateCheck: function () {
        throw 'deprecated function: savableStateCheck';
    },

    trackFields: function () {
        throw 'deprecated function: trackFields';
    },

    validateModel: function () {
        throw 'deprecated function: validateModel';
    }
});
