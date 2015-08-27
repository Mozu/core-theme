/**
 * @class Taco.core.ux.form.field.EditableDisplayField 
 * provide a tpl for field rendering or override the renderer method;
 */
Ext.define('Taco.core.ux.form.field.EditableDisplayField', {
    extend: 'Ext.form.field.Display',
    alias: 'widget.editabledisplayfield',
    
    validateOnChange: true,
    readOnly: false,
    border: true,

    /**
     * @cfg {Boolean} handleMouseEvents
     * False to disable visual cues on mouseover, mouseout and mousedown.
     */
    handleMouseEvents: true,

    /**
     * @cfg {String} overCls
     * The CSS class to add to a button when it is in the over (hovered) state.
     */
    overCls: 'over',

    enableKeyEvents:true,


    /**
     * @cfg {String} [requiredCls='x-form-required-field']
     * The CSS class to apply to a required field, i.e. a field where **{@link #allowBlank}** is false.
     */
    requiredCls: Ext.baseCSSPrefix + 'form-required-field',

    
    allowBlank: true,

    tabIndex: 0,

    /**
     * @cfg {String} pressedCls
     * The CSS class to add to a button when it is in the pressed state.
     */
    pressedCls: 'pressed',

    /**
     * @cfg {String} [focusCls='x-form-checkbox-focus']
     * The CSS class to use when the checkbox receives focus
     */
    focusCls: 'focus',

    baseCls: "taco-editable-display-field",

    fieldCls: 'taco-editable-display-field-inner',

    fieldSubTpl: [
        '<a id="{id}" tabIndex="0" role="{role}" {inputAttrTpl}',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' class="{fieldCls}">{value}</a>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    initComponent: function () {
        
        var me = this;

        // the autoEl object can't be on the prototype because we add tabIndex and href
        // properties to it conditionally.
        /*
        me.autoEl = {
            tag: 'a',
            role: 'button',
            hidefocus: 'on',
            unselectable: 'on'
        };
        */

        me.fieldCls += (me.allowBlank) ? '' : ' ' + me.requiredCls;

        if (this.border) {
            this.fieldCls += " taco-editable-display-field-inner-border";
        }
        this.callParent(arguments);


        //copied from Ext.form.field.Text
        
        me.addEvents( 
            /**
             * @event keydown
             * Keydown input field event. This event only fires if **{@link #enableKeyEvents}** is set to true.
             * @param {Ext.form.field.Text} this This text field
             * @param {Ext.EventObject} e
             */
            'keydown',
            /**
             * @event keyup
             * Keyup input field event. This event only fires if **{@link #enableKeyEvents}** is set to true.
             * @param {Ext.form.field.Text} this This text field
             * @param {Ext.EventObject} e
             */
            'keyup',
            /**
             * @event keypress
             * Keypress input field event. This event only fires if **{@link #enableKeyEvents}** is set to true.
             * @param {Ext.form.field.Text} this This text field
             * @param {Ext.EventObject} e
             */
            'keypress'
        );
        


        //me.addStateEvents('change');

        //labelClsExtra
        
    },

    initEvents: function () {
        var me = this;
        me.callParent();        

        var focusEl = me.getFocusEl()
        
        me.mon(focusEl, 'mousedown', me.onMouseDown, me);

        if (me.enableKeyEvents) {
            me.mon(focusEl, {
                scope: me,
                blur : me.onBlur,
                focus: me.onFocus,
                keyup: me.onKeyUp,
                keydown: me.onKeyDown,
                keypress: me.onKeyPress
            });
        }

    },


    // inherit docs
    getFocusEl: function () {        
        return this.inputEl;
    },

    onFocus: function (component, e, eOpts) {
        this.callParent(arguments)
    },

    onBlur: function (component, e, eOpts) {
        this.callParent(arguments)
    },

    // override this method to handle click on the field;
    onClick: Ext.emptyFn,

    /**
     * @private mouseover handler called when a mouseover event occurs anywhere within the encapsulating element.
     * The targets are interrogated to see what is being entered from where.
     * @param e
     */
    onMouseOver: function (e) {
        var me = this;        
        if ((!me.disabled && !me.readOnly) && !e.within(me.el, true, true)) {
            me.onMouseEnter(e);
        }
    },

    /**
     * @private
     * mouseout handler called when a mouseout event occurs anywhere within the encapsulating element -
     * or the mouse leaves the encapsulating element.
     * The targets are interrogated to see what is being exited to where.
     * @param e
     */
    onMouseOut: function (e) {
        var me = this;
        if (!e.within(me.el, true, true)) {
            if (me.overMenuTrigger) {
                me.onMenuTriggerOut(e);
            }
            me.onMouseLeave(e);
        }
    },


    /**
     * @private
     * virtual mouseenter handler called when it is detected that the mouseout event
     * signified the mouse entering the encapsulating element.
     * @param e
     */
    onMouseEnter: function (e) {
        // overCls is handled by AbstractComponent
        this.fireEvent('mouseover', this, e);
    },

    /**
     * @private
     * virtual mouseleave handler called when it is detected that the mouseover event
     * signified the mouse entering the encapsulating element.
     * @param e
     */
    onMouseLeave: function (e) {
        // overCls is handled by AbstractComponent
        this.fireEvent('mouseout', this, e);
    },


    addOverCls: function () {
        if (!this.disabled && !this.readOnly) {
            this.addClsWithUI(this.overCls);
        }
    },

    removeOverCls: function () {
        this.removeClsWithUI(this.overCls);
    },

    onKeyDown: function (e, target) {
        if (!this.disabled && !this.readOnly) {
            if (e.getKey() == e.ENTER) {
                if (this.onClick) {
                    this.onClick(e, target)
                }
            }

        }

        this.fireEvent('keydown', this, e);
    },

    onKeyUp: function (e) {
        this.fireEvent('keyup', this, e);
    },

    onKeyPress: function (e) {
        this.fireEvent('keypress', this, e);
    },

    onChange: function (newVal, oldVal) {
        this.callParent(arguments);
    },

    // @private
    onMouseDown: function (e) {
        var me = this;
        if (!me.disabled && !me.readOnly) {
            if (Ext.isIE) {
                // In IE the use of unselectable on the button's elements causes the element
                // to not receive focus, even when it is directly clicked.
                me.getFocusEl().focus();
            }
        }
        /*
        if (!me.disabled && e.button === 0) {
            Ext.button.Manager.onButtonMousedown(me, e);
            me.addClsWithUI(me.pressedCls);
        }
        */
    },

    // @private
    onMouseUp: function (e) {
        var me = this;
        if (!this.disabled) {
            if (e.button === 0) {
                if (!me.pressed) {
                    me.removeClsWithUI(me.pressedCls);
                }
            }
        }
    },


    onDisable: function () {        
        this.inputEl.dom.tabIndex = "-1";
        this.callParent();
    },

    //private
    onEnable: function () {        
        this.inputEl.dom.tabIndex = "0";
        this.callParent();        
    },


    /**
     * Resets the current field value to the originally-loaded value and clears any validation messages.
     * Also adds **{@link #emptyText}** and **{@link #emptyCls}** if the original value was blank.
     */
    reset: function () {
        this.callParent();
        this.applyEmptyText();
    },

    applyEmptyText: function () {
        var me = this,
            emptyText = me.emptyText,
            isEmpty;

        

        if (me.rendered && emptyText) {
            isEmpty = me.getRawValue().length < 1 && !me.hasFocus;

            if (Ext.supports.Placeholder) {
                me.inputEl.dom.placeholder = emptyText;
            } else if (isEmpty) {
                me.setRawValue(emptyText);
                me.valueContainsPlaceholder = true;
            }

            //all browsers need this because of a styling issue with chrome + placeholders.
            //the text isnt vertically aligned when empty (and using the placeholder)
            if (isEmpty) {
                me.inputEl.addCls(me.emptyCls);
            }

            me.autoSize();
        }
    },

    

    // Array of strings or XTemplate component that will be used to render the field automatically;
    tpl: null, 

    // override this method if you need to do any especially complex rendering;
    renderer: function(value, field) {
        if (field.tpl) {
            if (field.tpl.$className != "Ext.XTemplate") {
                field.tpl = Ext.create('Ext.XTemplate', field.tpl);
            }
            return field.tpl.apply(value);
        } else {
            return value;
        }
    },

    
    
    onRender: function () {
        var me = this;
        me.callParent(arguments);

        me.mon(me.el, {
            click: function (e, el, eOpts) {
                if (!me.disabled) {
                    me.onClick(e, el, eOpts);
                }
            },
            scope: me
        });
    },

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