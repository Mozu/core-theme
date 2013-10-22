/**
 * @class Taco.core.ux.form.field.EditableDisplayField 
 * 
 */
Ext.define('Taco.core.ux.form.field.EditableDisplayField', {
    extend: 'Ext.form.field.Display',
    validateOnChange: true,
    readOnly: false,
    initComponent: function () {
        this.callParent(arguments);
    },
    
    onRender: function () {
        var me = this;
        me.callParent(arguments);
        
        me.mon(me.el, {
            click: me.onClick,
            scope: me
        });
    },
    
    // override this method to handle click on the field;
    onClick : Ext.emptyFn,
    
    // fix to make the isEqual do a deep compare
    isEqual: function (value1, value2) {
        if (Ext.isObject(value1)) {
            return Taco.core.util.Common.isEqual({ data: value1, template: value2 });
        } else {
            return String(value1) === String(value2);
        }
    },

    isDirty: function () {
        var me = this;
        return !me.disabled && !me.isEqual(me.getValue(), me.originalValue);
    },
    
    isValid: function () {
        var me = this,
            disabled = me.disabled,
            validate = me.forceValidation || !disabled;
        
        // var value = me.processRawValue(me.getRawValue());
        var value = me.getValue();
        return validate ? me.validateValue(value) : disabled;
    },
    
    validateValue: function (value) {
        
        var me = this,
            errors = me.getErrors(value),
            isValid = Ext.isEmpty(errors);
        if (!me.preventMark) {
            if (isValid) {
                me.clearInvalid();
            } else {
                me.markInvalid(errors);
            }
        }

        return isValid;
    },

    
    getErrors: function(value) {
        
        var me = this,
            errors = [],
            validator = me.validator,
            msg;

        if (Ext.isFunction(validator)) {
            msg = validator.call(me, value);
            if (msg !== true) {
                errors.push(msg);
            }
        }
        
        return errors;
    },
    
    // validator. to be over written by instances.
    validator: function (value) {
        return true;
    },
    
    validate: function () {
        var me = this,
            isValid = me.isValid();
        if (isValid !== me.wasValid) {
            me.wasValid = isValid;
            me.fireEvent('validitychange', me, isValid);
        }
        return isValid;
    },

    // fixing issue in extjs where you setValue an object and it gets converted to string by the default valueToRaw method
    valueToRaw: function (value) {
        if (value && Ext.isObject(value)) {
            return value;
        } else {
            return this.callParent(arguments);
        }
    }
});