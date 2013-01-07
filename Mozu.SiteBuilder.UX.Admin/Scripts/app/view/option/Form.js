/**
 * @class Taco.view.option.Form
 */

Ext.define('Taco.view.option.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.option.valueEditor.MultiValue',
        'Taco.view.option.valueEditor.TextField',
        'Taco.view.option.preview.TextField',
        'Taco.view.option.preview.DropDown',
        'Taco.view.option.preview.RadioButtons'
    ],
    statics: {

        inputTypeStores: {
            configurable: [
                ['NotSpecified', 'Select a Display Option'],
                ['Dropdown', 'Drop Down Menu']
            ],
            standalone: [
                ['NotSpecified', 'Select a Display Option'],
                ['Textbox', 'Single-line Text'],
                ['CheckBox', 'Checkbox'],
                ['Dropdown', 'Drop Down Menu'],
                ['Radio', 'Radio Button']
            ]
        },

        valueSteps: {
            'NotSpecified': {
                isMultiValue: false,
                preview: function (optionName, store) {

                },
                items: function (store) {
                    return [{
                        xtype: 'optionvalueeditor',
                        store: store
                    }];
                }
            },

            'Textbox': {
                isMultiValue: false,
                preview: function (optionName, store, option) {
                    return Ext.create('Taco.view.option.preview.TextField', {
                        optionName: optionName,
                        option: option
                    });
                },
                items: function (store, option) {
                    return Ext.create('Taco.view.option.valueEditor.TextField', {
                        option: option,
                        store: store
                    });
                }
            },

            'CheckBox': {
                isMultiValue: true,
                preview: function (optionName, store) {

                },
                items: function (store) {
                    return [{
                        xtype: 'optionvalueeditor',
                        store: store
                    }];
                }
            },

            'Dropdown': {
                isMultiValue: true,
                preview: function (optionName, store) {
                    return Ext.create('Taco.view.option.preview.DropDown', {
                        optionName: optionName,
                        store: store
                    });
                },
                items: function (store) {
                    return [{
                        xtype: 'optionvalueeditor',
                        store: store
                    }];
                }
            },

            'Radio': {
                isMultiValue: true,
                preview: function (optionName, store) {
                    return Ext.create('Taco.view.option.preview.RadioButtons', {
                        optionName: optionName,
                        store: store
                    });
                },
                items: function (store) {
                    return [{
                        xtype: 'optionvalueeditor',
                        store: store
                    }];
                }
            }
        }
    },

    optionType: null,

    editTitle: [
        'Edit Existing ',
        '<tpl if="this.get(record, \'isConfigurable\')">',
            'Configurable',
        '<tpl else>',
            'Standalone',
        '</tpl>',
        ' Option'
    ],
    createTitle: 'Create New Option',

    initComponent: function() {

        this.stores = [this.record.optionValues()];

        this.buildFormComponents();

        this.callParent(arguments);

        this.stepContainer = this.down('formstepcontainer');

        this.bindEvents();

        this.loadOptionValueStore();

    },

    buildFormComponents: function () {
        var stepContainerConfig = {
            xtype: 'formstepcontainer',
            width: 400,
            enableStepIndex: this.isEdit() ? 3 : 0,
            defaults: {
                width: 290,
                xtype: 'formstep'
            },
            stepDefaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                width: 250,
                maxWidth: 250
            },
            items: [{
                toolTipTpl: ['<h2>Option Name</h2>', '<p>Give your option a name to blah blah...<p>'],
                toolTipData: {},
                items: [{
                    name: 'internalName',
                    fieldLabel: 'Name your Option',
                    emptyText: 'Example: Shirt Sizes'
                }]
            }, {
                toolTipTpl: ['<h2>Option Display Name</h2>', '<p>This is what is displayed on the product page in your store.</p>'],
                items: [{
                    name: 'name',
                    fieldLabel: 'Create a Display Name',
                    emptyText: 'Example: Size'
                }]
            }, {
                toolTipTpl: ['<h2>Display Type</h2>', '<p>This is how your customer will make their selection on your store.<p>'],
                items: [{
                    xtype: 'selectfield',
                    name: 'inputType',
                    fieldLabel: 'Choose how you would like to Display Your Option',
                    mode: 'local',
                    value: '',
                    store: this.statics().inputTypeStores[this.optionType || 'standalone']
                }]
            }, {
                toolTipTpl: ['<h2>Display Type</h2>', '<p>This is how your customer will make their selection on your store.<p>'],
                items: [{
                    xtype: 'label',
                    baseCls: 'taco-label',
                    text: 'Now, create some Values for your Option'
                }]
            }]
        };


        // Only show the Configurable/standalone selection if nothing
        if(!this.isEdit() && this.optionType === null) {
            stepContainerConfig.items.unshift({
                toolTipTpl: ['<h2>Option Type</h2>', '<p>Select an option type.</p>'],
                toolTipData: {},
                items: [{
                    xtype: 'selectfield',
                    name: 'type',
                    fieldLabel: 'Select option type',
                    mode: 'local',
                    value: '',
                    store: [
                        ['configurable', 'Configurable'],
                        ['standalone', 'Standalone']
                    ],
                    listeners: {
                        change: function(typeInput, value) {
                            this.changeType(value);
                        },
                        scope: this
                    }
                }]
            });
        }

        this.items = [stepContainerConfig];
    },

    bindEvents: function () {
        this.getForm().findField('inputType').on({
            change: function(field, value, oldValue) {
                this.loadValueStep(value, oldValue);
            },
            scope: this
        });

        this.stepContainer.on({
            activatestep: {
                fn: this.onActivateStep,
                scope: this
            }
        });
    },

    loadOptionValueStore: function () {
        var store = this.record.optionValues(),
            title,
            fnCleanupLoad,
            me = this;

        if (store.getCount() === 0) {
            store.add({
                value: ''
            });
        }

        this.addStore(store);
        

        fnCleanupLoad = function () {
            this.loadValueStep(this.record.get('inputType'), null);
        };
        
        if (this.rendered) {
            fnCleanupLoad.apply(this);
        } else {
            this.on('afterrender', fnCleanupLoad, this);

        }
    },

    loadValueStep: function (inputType, oldInputType) {
        var stepType = inputType,
            step = this.stepContainer.get(this.stepContainer.items.length - 1),
            valueStep = this.statics().valueSteps[inputType],
            oldValueStep = this.statics().valueSteps[oldInputType],
            store;

        if (!valueStep || !valueStep.items) {
            return;
        }

        if (inputType === oldInputType) {
            return;
        }

        step.inputType = inputType;

        step.setActive();

        if (valueStep.isMultiValue && oldValueStep && oldValueStep.isMultiValue) {
            return;
        }

        step.items.each(function (item, index) {
            if (index === 0) {
                return;
            }
            step.remove(item);
            item.destroy();
        });

        if (inputType === 'NotSpecified') {
            return;
        }

        store = this.record.optionValues();

        step.add(valueStep.items.apply(this, [store, this.record]));
        this.doLayout();
    },

    addSaveTasks: function (tasks) {

        tasks.add([{
            key: this.buildTaskKey('setparentid'),
            fn: function (tasks) {
                var recordId = this.record.getId();
                this.record.optionValues().each(function (value) {
                    value.set('option_id', recordId);
                });
                this.record.optionValues().modelDefaults.option_id = recordId;
                tasks.callback();
            },
            dependencies: this.buildTaskKey('saverecord'),
            scope: this
        }, {
            key: this.buildTaskKey('syncstore'),
            store: this.record.optionValues(),
            dependencies: this.buildTaskKey('setparentid')
        }]);

        return this.callParent(arguments);
    },

    changeType: function (type, oldType) {
        var field;

        if (!this.statics().inputTypeStores.hasOwnProperty(type)) {
            return;
        }

        this.optionType = type;

        field = this.getForm().findField('inputType');
        field.clearValue();
        field.bindStore(this.statics().inputTypeStores[type]);
        field.setValue('NotSpecified');

    },

    onActivateStep: function (step, index) {
        var valueStep,
            optionName,
            store;

        if (index !== this.stepContainer.items.length - 1) {
            return;
        }

        valueStep = this.statics().valueSteps[step.inputType];

        if (!valueStep || !valueStep.preview) {
            return;
        }

        optionName = this.getForm().findField('name').getValue();
        store = this.record.optionValues();

        Ext.defer(function () {
            var preview = valueStep.preview.apply(this, [optionName, store, this.record]);
            
            if (!preview) {
                return;
            }
            
            //this.hint.add(preview);
        }, 1, this);
    }
});