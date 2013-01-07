/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.formeditor2',
    requires: ['Taco.core.ux.form.Tasks', 'Taco.core.ux.form.StepContainer'],
    model: '',
    storeType: '',
    records: null,
    savePrefix: null,
    mixins: {
        formInterface: 'Taco.core.ux.form.Interface'
    },
    editor: null,
    isFormEditor: true,
    isEditorContainer: false,
    editors: null,
    savableState: false,
    formCfg: null,
    trackResetOnLoad: true,

    initComponent: function () {

        var editorCfg = {
            record: this.record
        };

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
             * @event afterload
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

        Ext.each(this.items, function (item) {
            if (!item.isFormEditor) {
                return;
            }
            Ext.applyIf(item, editorCfg);
        }, this);

        Ext.each(this.editors, function (editor) {
            if (typeof editor === 'string') {
                editor = Ext.create(editor, editorCfg);
            }
            this.items.push(editor);
        }, this);

        this.saveTasks = Ext.create('Taco.core.ux.form.Tasks');

        this.callParent(arguments);

        this.editors = [];

        this.trackFields();

        //this.editors = editors;

        this.loadEditor();

        this.on({
            change: this.savableStateCheck,
            validitychange: this.savableStateCheck,
            dirtychange: this.savableStateCheck,
            add: this.checkFields,
            scope: this
        });

        Ext.each(this.stores, this.bindStore, this);

        this.validateModel();

        this.getHeader().hide();

        this.saveTasks.on({
            complete: function () {
                console.log('fucking complete bitch!');
                this.fireEvent('savesuccess', this);
            },
            scope: this
        });
    },

    checkFields: function (container, cmp) {
        if (container !== this && container.up('[isFormEditor]') !== this) {
            return;
        }
        this.trackFields();
    },

    trackFields: function () {
        Ext.each(this.query('[isFormEditor],[isFormField]'), function (cmp) {
            if(cmp.isTrackedField || cmp.up('[isFormEditor]') !== this) {
                return;
            }

            this.relayEvents(cmp, ['change']);
            cmp.isTrackedField = true;

            if (!cmp.isFormEditor) {
                return;
            }

            this.relayEvents(cmp, ['savablestatechange']);

            this.isEditorContainer = true;
            this.editors.push(cmp);
        }, this);
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

    addSaveTasks: function (tasks) {
        tasks.add([{
            key: this.buildTaskKey('updaterecord'),
            updateRecord: this.record,
            updateForm: this
        }, {
            key: this.buildTaskKey('saverecord'),
            saveRecord: this.record,
            dependencies: this.buildTaskKey('updaterecord')
        }]);

        return tasks;
    },

    buildTaskKey: function (key) {
        return (this.savePrefix || this.getId()) + key;
    },

    save: function () {
        console.log('do save!');
        //debugger;
        this.addSaveTasks(this.saveTasks);
        this.saveTasks.execute();
        this.fireEvent('savesuccess');
    },

    loadEditor: function () {
        if (!this.record) {
            return;
        }

        if (!this.fireEvent('beforeload', this, this.record)) {
            return;
        }

        this.loadRecord(this.record);

        Ext.each(this.editors, function (editor) {
            editor.loadEditor();
        });

        this.initTitle();

        this.fireEvent('afterload', this, this.record);
    },

    initTitle: function () {
        var tplInput = (this.isEdit() ? this.editTitle : this.createTitle) || this.title,
            data = Ext.applyIf({
                record: this.record
            }, this.titleData),
            tpl;

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

    //  TODO: Refactor to Update Record
    /**
     * Updates the model bound to the form and calls update() on each editor in editors.
     */
    update: function () {
        this.getForm().updateRecord(this.record);

        Ext.each(this.editors, function (editor) {
            editor.update();
        });
    },

    isDirty: function () {
        var isDirty = this.callParent(arguments);

        if (isDirty) {
            return true;
        }

        Ext.each(this.stores, function (store) {
            if (store.isDirty()) {
                isDirty = ture;
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

    setSavableState: function (savableState) {
        this.savableState = savableState;
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
        return this.record && !this.record.phantom;
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
            if (typeof rules[validation.name] === 'undefined') {
                rules[validation.name] = [];
            }
            rules[validation.name].push(validation);
        });

        fields = this.query('[isFormField]');

        Ext.each(fields, function (field) {
            if(field.up('[isFormEditor]') !== this) {
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