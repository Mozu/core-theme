/**
 * @class Taco.core.ux.form.field.plugins.InputMask
 * Field Plugin that provides support for speicalized type of mask that can be used to represent a selection that contains complex data. 
 * Typically fields/combo reflect a single data value. if for instance you have a combo that represents multiple values when selected, there is not easy way to reflect the data that was selected;
 * this plugin allows you to use an xTemplate to customize the contents of the mask to display any data you want;
 * This allows the user to contiue to tab to the field via keyboard navigation;
 * When the field is focused via keyboard or programatically, the mask will hide;
 * reselection of a new value will cause the mask to rerender
 * clicking on the "x" will clear the selection
 * clicking on the msg part of the mask will fire an event and call a template method;
  
 * to include this mixin in your grid class:

        plugin: [
            "InputMask"
        ],  
 
 */

Ext.define('Taco.core.ux.form.field.plugins.InputMask', {
    alias: 'plugin.inputmask',
    pluginId:"inputmask",
    extend: 'Ext.AbstractPlugin',
    mixins: {
        observable: 'Ext.util.Observable'
    },    
    config : {

    },
    
    constructor: function () {
        var me = this;
        me.callParent(arguments);
        // need to initialize the observable mixin
        me.mixins.observable.constructor.call(me);
    },
    

    init: function (field) {
        var me = this
        
        me.field = field;
        field.inputMask = me;        
        
        me.initClearTrigger();

        me.initEvents();

        // Add some plugin methods to the grid panel to make it easier for the grid to set properties
        //me.field.showInputMask = Ext.Function.bind(me.showInputMask, me);
        //me.field.onInputMaskClick = Ext.Function.bind(me.onInputMaskClick, me);
        //me.field.clearInputMask = Ext.Function.bind(me.clearInputMask, me);        

        me.callParent(arguments);

    },

    clearTriggerDisabledCls: "x-form-trigger-disabled",

    initClearTrigger: function () {
        var me = this;
        var lastTriggerIndex = 2,
            triggerPrefix = "trigger";

        // find the last trigger index that isn't used;
        while (me.field["onTrigger"+ lastTriggerIndex + "Click"]) {
            lastTriggerIndex++
        }

        me.lastTriggerIndex = lastTriggerIndex;
        
        triggerPrefix += lastTriggerIndex;

        me.field[triggerPrefix + "Config"] = {
            disabled: true
        }

        me.field[triggerPrefix + "Cls"] = "x-form-clear-trigger"

        me.field["onTrigger" + lastTriggerIndex + "Click"] = function (e) {            
            // stop the event from propogating;                
            e.stopEvent();            
            if (!me.isClearTriggerDisabled()) {
                me.onClearTriggerClick();
            }
        }
    },

    // @private
    initEvents: function () {
        var me = this;
        
        me.mon(me.field, 'focus', me.onFieldFocus, me)
        me.mon(me.field, 'blur', me.onFieldBlur, me)
        me.mon(me.field, 'boxReady', me.onBoxReady, me)

        // need to call the plugin reset before calling the field reset;
        me.field.reset = Ext.Function.createInterceptor(me.field.reset, me.reset, me);
        // Note: when the field gains focus we need to add a cls to the mask
    },

    onBoxReady: function () {
        var me = this;
        
        var index = me.lastTriggerIndex - 1;
        // cache a scoped reference to the clear trigger;
        me.clearTriggerEl = me.field.triggerEl.elements[index];

        // add listeners for focus and blur on the clear button;
        me.mon(me.clearTriggerEl, 'focus', me.onClearTriggerFocus, me);
        me.mon(me.clearTriggerEl, 'blur', me.onClearTriggerBlur, me);

    },

    // reset the plugin
    reset : function() {
        var me = this;
        // disable the clear trigger;        
        me.disableClearTrigger()
        // reset the input mask
        me.clearInputMask();
        me.field.focus();
    },

    isClearTriggerDisabled: function () {
        var me = this;
        return me.clearTriggerEl.hasCls(me.clearTriggerDisabledCls)
    },

    onClearTriggerClick: function () {        
        var me = this;
        console.log("clear trigger clicked")
        
        if (!me.field.fireEvent('beforecleartriggerclick', this)) {
            
            return;
        }
        
        // reset the plugin          
        me.field.reset();

    },

    onClearTriggerFocus: function () {
        var me = this;
        if (!me.isClearTriggerDisabled()) {
            console.log("onClearTriggerFocus")
            me.field.fireEvent("cleartriggerfocus", me.field, me.clearTriggerEl);
        }
    },

    onClearTriggerBlur: function () {
        var me = this;
        
        if (!me.isClearTriggerDisabled()) {
            console.log("onClearTriggerBlur")
            me.field.fireEvent("cleartriggerblur", me.field, me.clearTriggerEl);
        }
    },

    onFieldFocus: function () {
        var me = this;
        if (me.mask) {
            me.mask.addCls("taco-combo-mask-hidden");
            me.maskMsg.addCls("taco-combo-mask-hidden");
        }
    },

    onFieldBlur: function () {
        var me = this;
        if (me.mask) {
            me.mask.removeCls("taco-combo-mask-hidden");
            me.maskMsg.removeCls("taco-combo-mask-hidden");
        }
    },

    hide: function(){
        
    },

    show: function (data, cls) {
        var me = this,
            maskCls = "taco-combo-mask "

        if (cls) {
            maskCls += cls;
        }
        
        me.mask = me.field.inputCell.mask(data, "taco-combo-mask-msg");
        //me.mask = me.field.triggerWrap.mask(data, "taco-combo-mask-msg");        
        me.mask.addCls("taco-combo-mask");
        // hide the mask since it will prevent clicking on any extra triggers;
        me.mask.hide();
        
        var triggerWidth = 1;

        //  if multiple triggers; we need to reduce the width of the masking div to allow the triggers to be seen;
        if (me.field.triggerEl.elements.length) {
            triggerWidth = me.field.triggerEl.elements[1].getWidth();
        }

        me.maskMsg = Ext.get(me.mask.dom.nextSibling);
        me.maskMsg.setStyle({
            'left': '0px',
            //'right': triggerWidth + 'px',
            'right': '0px',
            'top': '0px',
            'bottom': '0px' 
        })
        
        me.mon(me.maskMsg, 'click', me.onInputMaskClick, me);

        
        /*
        var index = me.lastTriggerIndex - 1;
        // cache a scoped reference to the clear trigger;
        me.clearTriggerEl = me.field.triggerEl.elements[index];

        me.mon(me.clearTriggerEl, 'focus', me.onClearTriggerFocus, me);
        me.mon(me.clearTriggerEl, 'focus', me.onClearTriggerBlur, me);
        */
        
        

        //enable the clear button;
        me.enableClearTrigger();
    },

    enableClearTrigger: function () {
        var me = this;
        me.clearTriggerEl.removeCls(me.clearTriggerDisabledCls)
        
        me.clearTriggerEl.el.set({
            tabIndex: 0
        })
    },

    disableClearTrigger : function (){
        var me = this;
        me.clearTriggerEl.addCls(me.clearTriggerDisabledCls)
        
        me.clearTriggerEl.el.set({
            tabIndex: -1
        })
    },

    onInputMaskClick: function (field, dom) {        
        var me = this,
            msgClicked = Ext.fly(arguments[1]).hasCls("x-mask-msg-text")
        
        this.onMsgClicked();
    },

    onMsgClicked: function () {
        var me = this;
        me.field.focus();
        me.fireEvent('maskmessageclick')
    },

    clearInputMask: function () {
        var me = this;
        
        me.field.fireEvent('clearinputmask', this);

        if (me.field.inputCell && me.mask && me.maskMsg) {
            me.field.inputCell.unmask();
            delete me.mask;
            delete me.maskMsg;            
        }
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    beforeDestroy: function () {
        var me = this,
            field = me.field
                
        me.reset();

        // Clear all listeners from all our events, clear all managed listeners we added to other Observables
        me.clearListeners();
        
        if (field) {
            me.clearTriggerEl = field.inputMask = me.maskMsg = me.mask = me.field = null;
        }
        
    }
});