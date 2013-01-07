/**
 * @author Travis Johnson
 * @class Taco.core.ux.form.Step
 */

    Ext.define('Taco.core.ux.form.Step', {
        extend: 'Ext.container.Container',
        alias: 'widget.formstep',
        componentCls: 'taco-form-step',
        
        toolTipTpl: null,
        toolTipData: {},
        listeners: {},

        initComponent: function() {
            var me = this;

            me.callParent(arguments);
            
            Ext.each(me.getFields(), function (field) {
                field.on({
                    dirtychange: {
                        fn: me.onDirtyChange,
                        scope: me
                    },
                    validitychange: {
                        fn: me.onValidityChange,
                        scope: me
                    },
                    change: {
                        fn: me.onChange,
                        scope: me
                    },
                    focus: {
                        fn: me.setActive,
                        scope: me
                    }
                });
            });
            
            me.dirtyState = this.isDirty();
            me.validState = this.isValid();
        },

        getFields: function() {
            if (!this.fields) {
                this.fields = this.query('[isFormField]');
            }
            return this.fields;
        },
        
        afterRender: function () {
            this.callParent(arguments);
            
            this.getEl().addListener('click', function () {
                //alert('click');
                this.fireEvent('click', this);
            }, this);
        },
        
        getStepContainer: function () {
            if (!this.stepContainer) {
                this.stepContainer = this.findParentByType('formstepcontainer');
            }
            if (!this.stepContainer) {
                Ext.Error.raise({
                    msg: 'Form Steps must be inside Step Containers',
                    widget: this
                });
            }
            return this.stepContainer;
        },
        
        nextStep: function () {
            if (this.getStepContainer().isLastEnabledStep(this)) {
                this.getStepContainer().nextStep();
            }
        },
        
        activateNextStep: function () {
            this.getStepContainer().activateNextStep();
        },
        
        onDirtyChange: function (field, isDirty) {
            var currentState;
            
            if (isDirty && isDirty === this.dirtyState) {
                return;
            }
            
            currentState = this.isDirty();
            
            if (this.dirtyState === currentState) {
                return;
            }
            
            this.dirtyState = currentState;
            this.fireEvent('dirtychange', this, currentState);
        },
        
        onValidityChange: function (field, isValid) {
            var currentState;
            
            if (!isValid && isValid === this.validState) {
                return;
            }
            
            currentState = this.isValid();
            
            if (this.validState === currentState) {
                return;
            }
            
            this.validState = currentState;
            this.fireEvent('validitychange', this, currentState);
            
            if (currentState) {
                this.nextStep();
            }
        },
        
        onChange: function (field) {
            console.log('field change!');
            this.onValidityChange(field, field.isValid());
            this.fireEvent('change', this, field);
        },
        
        setActive: function () {
            this.getStepContainer().setActiveStep(this);
        },
        
        isDirty: function () {
            var isDirty = false;
            Ext.each(this.getFields(), function (field) {
                if (field.isDirty()) {
                    isDirty = true;
                    return false;
                }
            });
            return isDirty;
        },
        
        isValid: function () {
            var isValid = true;
            Ext.each(this.getFields(), function (field) {
                if (!field.isValid()) {
                    isValid = false;
                    return false;
                }
            });
            return isValid;
        }
    });
