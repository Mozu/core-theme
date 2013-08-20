/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.formform',
    requires: [
        'Taco.core.ux.form.Tasks',
        'Taco.core.ux.form.StepContainer'
    ],

    componentCls: Taco.baseCSSPrefix + 'formform',

    model: '',
    storeType: '',
    records: null,
    savePrefix: null,
    mixins: {
        formInterface: 'Taco.core.ux.form.Interface'
    },
    form: null,
    isFormForm: true,
    isFormContainer: false,
    forms: null,
    savableState: false,
    formCfg: null,
    trackResetOnLoad: true,
    createTitle: 'Create',
    editTitle: 'Edit',
   // header: { layout: 'auto' },
    persistChangesToModel: false,
    enableStoreSyncTasks:false,
    tasksKeyPrefix: '',
    cascadeChildTasks: true,
    cascadeRecordLoad: true,
    manageHeight: false,

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
             * @event savablestatechange
             * Fired when the Savable State is changed
             * @param {Taco.core.ux.Form.Form} form Form where the savable state was changed
             * @param {Boolean} value The new Savable State
             */
            'savablestatechange',

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

        Ext.each(this.items, function (item) {
            if (!item.isFormForm) {
                return;
            }
            // Don't override models that have already been set manually
            if (item.record && item.record.isModel) {
                return;
            }
            Ext.applyIf(item, formCfg);
        }, this);

        Ext.each(this.forms, function (form) {
            if (typeof form === 'string') {
                form = Ext.create(form, formCfg);
            }
            this.items.push(form);
        }, this);

        this.saveTasks = Ext.create('Taco.core.ux.form.Tasks');

        this.callParent(arguments);
        this.forms = [];
        this.trackedFields = [];

        this.trackFields();
        this.markRequired();
        //this.forms = forms;

        this.loadForm();

        this.on({
            change: function (field, newValue) {
                this.savableStateCheck();

                if (!this.record || !this.persistChangesToModel || !Ext.Array.contains(this.trackedFields, field) || (!this.record.fields.getByKey(field.name) && !this.record.dictField)) {
                    return;
                }

                this.record.set(field.name, field.getValue());

            },
            validitychange: this.savableStateCheck,
            dirtychange: this.savableStateCheck,
            add: this.checkFields,
            added:this.onFormAdded,
            scope: this
        });

        Ext.each(this.stores, this.bindStore, this);

        this.validateModel();

        this.saveTasks.on({
            complete: function (tasks) {
                if (!tasks.complete) {
                    this.fireEvent('savablestatechange', this, true);
                    return;
                }
                this.resetOriginalValues();
                Ext.defer(function() {
                    this.fireEvent('savesuccess', this);
                },1, this);
               
            },
            scope: this
        });

        if (this.record && this.record.dictField) {
            this.enableFormForDictField(this.record.dictField);
        }
    },

    // TODO: Unhack this, JBZ. We are hardcoding some functionality out of Ext, here. It's the record that needs to get better at this, not the form.
    enableFormForDictField: function (fieldName) {
        var form = this.getForm().updateRecord = function (record) {
            record = record || this._record;
            if (!record) {
                Ext.Error.raise("A record is required.");
                return this;
            }
        
            var fields = record.fields.items,
                values = this.getFieldValues(),
                obj = {},
                i = 0,
                j = 0,
                len = fields.length,
                dlen,
                dict = Ext.clone(record.get(fieldName)||[]),
                dictTuple,
                existing,
                name;
            dlen = dict.length;
            for (var k in values) {
                if (values.hasOwnProperty(k) && !(k in record.self.realFields)) {
                    for (; j < dlen; ++j) {
                        dictTuple = dict[j];
                        if (dictTuple.key === k) {
                            dictTuple.value = values[k];
                            existing = true;
                            break;
                        }
                    }
                    if (!existing) dict.push({ key: k, value: values[k] });
                }
                existing = false;
            }
                    
            for (; i < len; ++i) {
                name  = fields[i].name;

                if (values.hasOwnProperty(name) && name !== fieldName) {
                    obj[name] = values[name];
                }
            }

            obj[fieldName] = dict;

            record.beginEdit();
            record.set(obj);
            record.endEdit();

            return this;
            
        };
    },

    resetOriginalValues: function (tasks) {
        
        Ext.each(this.forms, function (form) {
            form.resetOriginalValues();
        });

        Ext.each(this.trackedFields, function(field) {
            if (!field.resetOriginalValue) {
                return;
            }
            field.resetOriginalValue();
        });
    },

    loadSingleValue: function (fieldName, value) {
        var me=this,field;
        
        Ext.each(this.trackedFields, function (trackedField) {
            if (trackedField && trackedField.name === fieldName) {
                field = trackedField;
                return false;
            }
        });

        if (!field) {
            return;
        }

        field.batchChanges(function() {
            field.setValue(value);
            field.initValue();
            if (me.getForm().trackResetOnLoad) {
                field.resetOriginalValue();
            }
        });
        
        
        
    },


    loadRecord: function(record, cascade) {
        if (cascade) {
            return this.callParent([record]);
        }

        Ext.iterate(record.data, this.loadSingleValue, this);

        if (record.dictField) Ext.iterate(record.get(record.dictField), function (kvp) {
            this.loadSingleValue(kvp.key, kvp.value);
        }, this);
    },
    onFormAdded:function ( me , container, pos, eOpts) {
        var parentFormForm;
        if (container.isFormForm) {
            return;
        }
        parentFormForm = me.up('[isFormForm]');
        if (parentFormForm) {
            parentFormForm.trackFields();
        }
    },
    checkFields: function (container, cmp) {
        if (container !== this && container.up('[isFormForm]') !== this) {
            return;
        }
        this.trackFields();
    },
    markRequired: function() {
        Ext.each(this.query('[isFormForm],[isFormField]'), function (cmp) {
            if (cmp.required === true && cmp.fieldLabel.toString().substring(0, 1) != '*') {
                cmp.addCls('taco-required-label-text');
            }
        }, this);
    },
    
    trackFields: function () {

        Ext.each(this.query('[isFormForm],[isFormField]'), function (cmp) {
            if (cmp.ignoreParentFormTracking
                || cmp.isTrackedField
                || cmp.up('[isFormForm]') !== this
                || cmp.isTrackedForm) {
                return;
            }

            this.relayEvents(cmp, ['change']);
            cmp.isTrackedField = true;

            if (!cmp.isFormForm) {
                this.trackedFields.push(cmp);
                return;
            }

            this.relayEvents(cmp, ['savablestatechange']);
            cmp.isTrackedForm = true;
            this.isFormContainer = true;
            this.forms.push(cmp);
        }, this);
    },

    setReadOnly: function (readOnly) {
        Ext.each(this.query('[isFormField]'), function (cmp) {
            if (typeof this.setReadOnly === 'function') this.setReadOnly(readOnly);
        });
    },

    addStore: function (store) {
        this.bindStore(store);
        this.stores.push(store);
    },

    bindStore: function (store) {
        store.on({
            dirtychange: function () {
                this.savableStateCheck();
            },
            scope: this
        });
    },

    addChildSaveTasks: function (tasks) {
        Ext.each(this.forms, function (form) {
            form.addSaveTasks(tasks);
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
                key: this.tasksKeyPrefix + 'update-record',
                updateRecord: this.record,
                updateForm: this,
                dependencies: this.updateRecordDependencies
            });
        }
        if (saveRecord !== false) {
            saveTask = {
                key: this.tasksKeyPrefix + 'save-record',
                saveRecord: this.record
            };
            if (updateRecord !== false) {
                saveTask.dependencies = this.tasksKeyPrefix + 'update-record';
            }
            tasks.add(saveTask);
        }
        this.addStoreSaveTasks(tasks);
        return tasks;
    },
    

    addStoreSaveTasks: function (tasks) {
        var recordKey = this.tasksKeyPrefix + 'save-record';
        if (this.enableStoreSyncTasks && this.stores) {
            Ext.each(this.stores, function(store) {
                var saveTask = {
                    key: store.$className,
                    store: store
                };
                if (tasks.tasks.getByKey(recordKey)) {
                    saveTask.dependencies = [recordKey];
                }
                tasks.add(saveTask);
            });

        }
        return tasks;
    },

    buildTaskKey: function (key) {
        return (this.savePrefix || this.getId()) + key;
    },
    beforeSave: function() {
        var res = true;
        Ext.each(this.forms, function(form) {
            if (form.beforeSave() === false) {
                res = false;
                return false;
            }
            return true;
        }, this);

        return res;
    },

    save: function () {
        if (this.beforeSave() === false) {
            return;
        }
        this.addSaveTasks(this.saveTasks);
        this.saveTasks.execute();
    },
    
    updateForm: function () {
        if (this.beforeSave() === false) {
            return;
        }
        this.addSaveTasks(this.saveTasks, true, false );
        this.saveTasks.execute();
    },

    loadForm: function (record, noCascade) {
        var noCascadeArg = noCascade,
            recordArg = record;

        if (!record) {
            record = this.record;
        }

        if (!record) {
            return;
        }

        if (!this.fireEvent('beforeload', this, record)) {
            return;
        }

        this.loadRecord(record);

        if (noCascade === undefined) {
            noCascade = !this.cascadeRecordLoad;
        }

        if (!noCascade) {
            Ext.each(this.forms, function (form) {
                form.loadForm(recordArg, noCascadeArg);
            });
        }

        this.initTitle();

        this.fireEvent('afterload', this, record);
    },

    initTitle: function () {
        var tplInput, data, tpl;

        
        if (this.originalTitle) {
            return;
        }

        tplInput = this.isEdit() ? this.editTitle : this.createTitle;
        data = Ext.applyIf({
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


    findField: function (id) {
        return this.getForm().findField(id);
    },
    
    //  TODO: Refactor to Update Record
    /**
     * Updates the model bound to the form and calls update() on each form in forms.
     */
    update: function () {
        this.getForm().updateRecord(this.record);

        Ext.each(this.forms, function (form) {
            form.update();
        });
    },

    isDirty: function () {
        var isDirty = this.callParent(arguments);

        if (isDirty) {
            return true;
        }

        Ext.each(this.forms, function (form) {
            if (form.isDirty()) {
                isDirty = true;
                return false;
            }
        });

        if (isDirty) {
            return true;
        }

        Ext.each(this.stores, function (store) {
            if (store.isDirty()) {
                isDirty = true;
                return false;
            }
        }, this);

        return isDirty;
    },

    savableStateCheck: function () {
        var oldState = this.savableState,
            newState = this.isValid() && (!this.isEdit() ||  this.isDirty());

        if (oldState === newState) {
            return;
        }

        this.savableState = newState;

        this.fireEvent('savablestatechange', this, newState);
    },

    resetSavableState: function (isSavable) {
        this.savableState = isSavable === true;
    },

    getSavableState: function () {
        return this.savableState;
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

    destroy: function () {
        if (this.hint && this.hint.isComponent) {
            this.hint.destroy();
        }

        this.callParent(arguments);
    },

    validateModel: function () {
        var i,
            me = this,
            model,
            validations,
            rules = {},
            fnAllowedValues,
            fields;

        if (!this.record || !this.record.isModel) {
            return;
        }

        model = this.record.self.getName();

        validations = Ext.ModelManager.getModel(model).prototype.validations;

        Ext.each(validations, function (validation) {
            // adding check for validation.name. barfing in IE8;
            if (validation && validation.name) {
                if (typeof rules[validation.name] === 'undefined') {
                    rules[validation.name] = [];
                }
                rules[validation.name].push(validation);
            }
        });

        fields = this.query('[isFormField]');

        Ext.each(fields, function (field) {
            
            if (field.up('[isFormForm]') !== me) {
                return;
            }
            
            if (!rules[field.name]) {
                return;
            }
            
            Ext.each(rules[field.name], function (rule) {
                field.vtype = 'custom';
                
                switch(rule.type) {
                    case 'format':
                        field.filter = rule.matcher;
                        field.filterType = 'format';
                        break;
                    case 'exclusion':
                        field.filter = rule.list;
                        field.filterType = 'exclusion';
                        break;
                    case 'inclusion':
                        field.filter = rule.list;
                        field.filterType = 'inclusion';
                        break;
                    case 'length':
                        field.minLength = rule.min;
                        field.maxLength = rule.max;
                        break;
                    case 'presence':
                        field.allowBlank = false;
                        break;
                }
            });
        });

        fnAllowedValues = function (list) {
            var pattern = '';
            Ext.each(list, function (item) {
                pattern += '|^' + item + '$';
            });
            return new RegExp(pattern.substr(1), 'i');
        };

        Ext.apply(Ext.form.field.VTypes, {
            custom: function (val, field) {
                var result = true,
                    value = field.getValue();

                if (field.filterType === 'format') {
                   result = field.filter.test(value) ? result : false;
                }
                if (field.filterType === 'exclusion') {
                    result = !fnAllowedValues(field.filter).test(value) ? result : false;
                }
                if (field.filterType === 'inclusion') {
                    result = fnAllowedValues(field.filter).test(value) ? result : false;
                }
                if (field.minLength > 0) {
                    result = value.length >= field.minLength ? result : false;
                }
                if (field.maxLength > 0) {
                    result = value.length <= field.maxLength ? result : false;
                }

                return result;
            },
            customText: 'Did not pass the filter'
        });
    }
});