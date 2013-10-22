/*
    fix for issues with displayField in 4.2.1
    valueToRaw casts all values to string
    dirty state code is suppressed by default; needed to add it back in.
    The isEqual method that comes with extjs doesn't do a deep compare which is necessary when the value is an object.


    // need to add red border for field when allowBlank
    //x-form-required-field x-form-text x-form-invalid-field

*/

Ext.define('Taco.overrides.form.field.Display', {
    override: 'Ext.form.field.Display',
    requires: [
        'Ext.form.field.Text'
    ],
    validateOnChange: true,
    readOnly: false,
    initComponent: function () {
        this.callParent(arguments);
    },
    // fix to make the isEqual do a deep compare
    isEqual: function (value1, value2) {
        if (Ext.isObject(value1)){
            return Taco.core.util.Common.isEqual({ data: value1, template: value2 });
        } else {
            return String(value1) === String(value2);
        }        
    },
        
    validator: function (value) {
       // debugger;
        return "validator error"

    },
    
    isDirty: function () {
        //debugger
        return false;
    },

    isValid: function () {
    //    debugger
        return true;
    },

    validate: function () {
      //  debugger
        return true;
    },



    /*

    renderActiveError: function() {
        
        var me = this,
            hasError = me.hasActiveError();
        if (me.inputEl) {
            // Add/remove invalid class
            me.inputEl[hasError ? 'addCls' : 'removeCls'](me.invalidCls + '-field');
        }
        me.mixins.labelable.renderActiveError.call(me);
    },
    
    hasActiveError : function() {
    
        return this.callParent(arguments);
    },
    
    getActiveError: function () {
    
        return this.callParent(arguments);
    },

    
    isDirty: function () {
        var me = this;
        return !me.disabled && !me.isEqual(me.getValue(), me.originalValue);
    },
    
    
    
    getErrors: function (value) {
        debugger
        return ["asdf"]
    },
    
    
    // need to override this method if you want any custom validation
    
    isValid: function () {
        return this.superclass.isValid();
    },
    


    // need to override this method if you want any custom validation
    
    validate: function () {
        return this.superclass.validate();
    },
    
    */
    

    // fixing issue in extjs where you setValue an object and it gets converted to string by the default valueToRaw method
    valueToRaw: function (value) {
        if (value && Ext.isObject(value)) {
            return value;
        } else {
            return this.callParent(arguments);
        }        
    }
}, function () {
    
    this.borrow(Ext.form.field.Text, [
        // 'onDirtyChange',
//        'isValid',
//        'validateValue',
//        'markInvalid',
//        'clearInvalid',
//        'setError',
//        'renderActiveError',
//        'onChange',
//        'isDirty',
//        'checkDirty',
//        'getErrors',
//        'validate'
    ]);

});
