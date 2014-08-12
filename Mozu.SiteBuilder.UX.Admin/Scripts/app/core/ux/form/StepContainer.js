/**
 * @author Travis Johnson
* @class Taco.core.ux.form.StepContainer
 */


    Ext.define('Taco.core.ux.form.StepContainer', {
        extend : 'Ext.container.Container',
        alias: 'widget.formstepcontainer',
        requires: ['Taco.core.ux.form.Step'],
        cls: 'taco-step-container',
        enableStepIndex: 0,
        
        defaults: {
            xtype: 'formstep'
        },

        initComponent : function() {
            var me = this;
          
            if (me.stepDefaults) {
                Ext.each(me.items, function(item) {
                    Ext.apply(item, {
                        defaults: me.stepDefaults
                    });
                });
            }
            
            
            

            me.callParent(arguments);
            
            Ext.each(this.getSteps(), function (step) {
                step.on({
                    click: {
                        fn: this.setActiveStep,
                        scope: this
                    }
                })
            }, this);
            
            
            
            me.enableStep(me.enableStepIndex);
            if (this.enableStepIndex) {
               // this.on('afterrender', function() { this.setActiveStep(this.enableStepIndex); }, this);
                
            }
            //me.enableStep(3);
        },
        
        enableStep: function (index) {           
            Ext.each(this.getSteps(), function (step, i) {
                // Hide elements after last enabled step
                if (i > index) {
                    step.hide();
                    return;
                }
                
                //  If it's already shown and you need to show it,
                //  then just skip
                if (!step.isHidden()) {
                    return;
                }
                
                //  If this is before render, just set to show
                if (!step.isRendered) {
                    step.show();
                    return;
                }
                
                // If step is already rendered, fade in
                step.getEl().setStyle({opacity: 0});
                step.show();
                step.getEl().fadeIn({duration: 1000});
            });
            this.doLayout();
            this.enabledIndex = index;
        },
        
        setActiveStep: function (step) {
            var index = 0,
                parent = this.findParentByType('formeditor2');
            if (typeof step === 'number') {
                step = this.get(step);
            }
            
            if (!step || this.activeStep === step) {
                return;
            }
            
            // index = this.indexOf(step);
//             
            // if (this.enabledIndex < this.index) {
                // this.enableStep(index);
            // }
//             
            if (this.activeStep && this.activeStep.isComponent) {
                this.activeStep.removeCls('taco-active');
            }
            
            this.activeStep = step;
            
            step.addCls('taco-active');
            step.show();
            
          //  console.log('show hint', step, this.indexOf(step));
             
            if (parent) {
                parent.showHint({
                    items: [{
                        xtype: 'component',
                        tpl: step.toolTipTpl,
                        data: step.toolTipData
                    }],
                    target: step,
                    offset: [20, 29]
                });
            }

            this.fireEvent('activatestep', this.activeStep, this.indexOf(this.activeStep));
        },
        
        get: function(index) {
          if (this.getSteps().length > index) {
              return this.getSteps()[index];
          }  
        },
        
        indexOf: function(step) {
          return this.getSteps().indexOf(step);
        },
        
        getEnabledStep: function () {
            var steps = this.getSteps();
            
            if (steps.length > this.enabledIndex) {
                return steps[this.enabledIndex];
            }
        },
        
        getSteps: function () {
            return this.query('> formstep');
        },
        
        isLastEnabledStep: function (step) {    
            return this.getEnabledStep() === step;
        },
        
        activateNextStep: function () {
            var index = this.indexOf(this.activeStep) + 1;
            this.setActiveStep(index);
        },
        
        nextStep: function () {
            this.enableStep(this.enabledIndex + 1);
        }
    });

