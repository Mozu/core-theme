/**
 * @class Taco.core.ux.window.Modal
 * @author Jimmy Sanford
 *
 * The base class for a modal dialog window.
 * 
 * Modal dialogs are used when a response is required from the user or when critical information that cannot be
 * ignored needs to be presented to the user.
 *
 * This class extends the base class for dialog windows, {@link Taco.core.ux.window.Window}, adding a toolbar
 * containing actions to the bottom of the window.
 */

Ext.define('Taco.core.ux.window.Modal', {
    extend: 'Taco.core.ux.window.Window',
    alias: 'widget.taco-modal',

    /**
     * @cfg {Object} actionBar
     * Optional configuration for the internal action toolbar. If present, this is passed straight through to the
     * toolbar's constructor.
     */
    actionBar: null,

    /**
     * @cfg {Object[]} actions
     * An array of actions to be added to the window's actions toolbar.
     * - An action configured with `itemId: primaryAction` will be automatically configured as a primary action.
     * - An action configured with `itemId: secondaryAction` will be automatically configured as a secondary action.
     */
    actions: [{
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction',
        // this will tie this button to the validity of the form if one is assigned in the config. If the form is invalid, this action will be disabled.
        formBind: true
    }],

    /**
     * @cfg {String} primaryText
     * Text of the primary action that will fire the 'save' event
     */
    primaryText: 'Save',

    /**
     * @cfg {Boolean} scopeActionsToWindow
     * Scope actions to the window instance (defaults to true).
     */
    scopeActionsToWindow: true,

    /**
     * @cfg {String} secondaryText
     * Text of the secondary action that will fire the 'cancel' event
     */
    secondaryText: 'Cancel',
    
    closable: true,
    draggable: true,
    modal: true,
    resizable: true,

    bodyPadding: '11 20 0',
    ui: 'modal',

    // this is set prior to closing the dialog so that the close code can fire the correct afterclose events;
    isSave: false,

    closeOnSave : true,

    // this is set prior to closing the dialog so that the close code can pass the saved data along when it fires the afterclosesave event;
    saveData: null,

    enableKeyMap : true,

    config: {
        form: undefined
    },

    showActionsBar: true,

    constructor: function (config) {
        var actions,
            actionBar;
        
        // Init config if not passed in on create
        if (typeof config === 'undefined') config = {};

        actions = this.configureActions(config);
        actionBar = this.initActionBar(actions, config.actionBar || this.actionBar);

        if (this.showActionsBar) {
            config.dockedItems = Ext.Array.merge([actionBar], config.dockedItems);
        }
        

        this.callParent([config]);
    },

    initComponent: function () {
        var me = this;

        me.addEvents(
        /**
         * @event
         * Fired before the cancel event is fired.
         * Returning false from an event listener can prevent the cancel from occurring.
         * @param {Taco.core.ux.window.Modal} this
         */
        'beforecancel',
        /**
         * @event
         * Fired after the cancel button is clicked, but before the close code executes.
         * @param {Taco.core.ux.window.Modal} this
         */
        'cancel',
        /**
         * @event
         * Fired after the close code has completed tearing down the window but just before the destroy is called.
         * This is useful for passing focus back to an element or component after the window is destroyed. 
         * This was needed since the window competes for focus while its closing
         * @param {Taco.core.ux.window.Modal} this
         */
        'afterclose',
        /**
         * @event
         * This is fired just after the afterclose event. It is fired when the window closes after a save;
         * Fired after the close code has completed tearing down the window but just before the destroy is called.
         * This is useful for passing focus back to an element or component after the window is destroyed. 
         * This was needed since the window competes for focus while its closing
         * @param {Taco.core.ux.window.Modal} this
         * @param {Mixed} data
         */
        'aftersaveclose',
        /**
         * @event
         * Fired after the close code has completed tearing down the window but just before the destroy is called.
         * This is useful for passing focus back to an element or component after the window is destroyed. 
         * This was needed since the window competes for focus while its closing
         * @param {Taco.core.ux.window.Modal} this
         */
        'aftercancelclose',
        /**
         * @event
         * Fired before the save event is run.
         * Returning false from an event listener can prevent the save from occurring.
         * @param {Taco.core.ux.window.Modal} this
         */
        'beforesave',
        /**
         * @event
         * Fired after the save button is clicked, but before the save process has completed. See savesuccess for the event you should listen to to get data fromt his modal.
         * @param {Taco.core.ux.window.Modal} this
         */
        'save',
        /**
         * @event
         * Fired when a save operation was successful.
         * @param {Taco.core.ux.window.Modal} this
         * @param {Mixed} data. Typically a record, but it could be an array, json, or string as well. Optional, but strongly recommended;
         */
        'savesuccess');

        
        if (me.enableKeyMap) {
            me.mon(me, 'render', function () {                
                me.initKeyMap();
            }, me)
        }

        me.callParent(arguments);

        if (me.scopeActionsToWindow && this.showActionsBar) {
            me.scopeActions(me.down('#actionBar').items);
        }
        
        me.initCancelListener();
    },

    /**
    * This sets up some standard keyboard shortcuts for Modal Dialogs.
    */
    initKeyMap: function () {
        var me = this;

        me.formLessKeyMap = new Ext.util.KeyMap({
            target: me.el,
            ignoreInputFields: true,
            
            binding: [
                 {
                    // Backspace on windows and delete key on mac. need to prevent the navigate
                    key: 8,

                    fn: function () {
                        console.log("preventing modals from causing a navigate");
                    },
                    // prevents the event from bubbling past the modal;
                    defaultEventAction: 'stopEvent',
                    scope: me
                }
            ]
        });
        // adding key listeners for dialogs
        me.keyMap = new Ext.util.KeyMap({
            target: me.el,
            binding: [{
                // Ctrl + Shift + S
                key: Ext.EventObject.S,
                ctrl: true,
                shift: true,
                fn: me.primaryHandler,
                // prevents the event from bubbling past the modal;
                defaultEventAction: 'stopEvent',
                scope: me
            }]
        });
    },

    /**
     * Attach listeners and bind this window's actions to a form, if there is one.
     *
     * @private
     * @param  {Ext.form.Panel} form The form panel.
     */
    bindToForm: function (form) {
        var actionBar = this.down('#actionBar'),
            actions = actionBar.query('[formBind]'),
            boundItems = form.getForm().getBoundItems();

        boundItems.add(actions);

        // Note we are deprecating this auto save listener here;
        // if the subclasses of this modal need to call the service then they should override the doSave Method and call saveSuccess(data) when it is complete;

        /*
        this.mon(form, {
            savesuccess: {
                scope: this,
                fn: function () {                    
                    this.saveSuccess()
                }
            }
        });
        */
    },

    /**
     * Apply configs to the window actions.
     *
     * @private
     * @param  {Object} windowCfg The configuration object passed to the window's constructor.
     * @return {Object[]} The array completed window action configuration objects.
     */
    configureActions: function (windowCfg) {
        var actionsCfg,
            actions;

        windowCfg = windowCfg || {};

        actionsCfg = windowCfg.actions || this.actions

        // actions may be one object instead of an array of them
        actionsCfg = Ext.isArray(actionsCfg) ? actionsCfg : [actionsCfg];

        // map the actionsCfg to a new array so we don't mutate the window's prototype
        actions = Ext.Array.map(actionsCfg, function (actionCfg) {
            var action;

            if (actionCfg.isComponent === true) {
                // if actionCfg is an instantiated component, return it
                action = actionCfg;
            } else {
                // else make a new config object from it and apply defaults
                action = {};

                if (actionCfg.itemId === 'primaryAction') {
                    Ext.apply(action, actionCfg, {
                        ui: 'action-primary',
                        scale: 'medium',
                        text: windowCfg.primaryText || this.primaryText,
                        handler: windowCfg.primaryHandler || this.primaryHandler
                    });
                } else if (actionCfg.itemId === 'secondaryAction') {
                    Ext.apply(action, actionCfg, {
                        ui: 'action',
                        scale: 'medium',
                        text: windowCfg.secondaryText || this.secondaryText,
                        handler: windowCfg.secondaryHandler || this.secondaryHandler
                    });
                } else {
                    Ext.apply(action, actionCfg);
                }
            }

            return action;
        }, this);

        return actions;
    },

    getForm: function () {
        return this.form = this.form || this.down('form') || this.down('#form');
    },

    /**
     * Create a toolbar from a toolbar configuration object or items list. This function is based initToolbar, a
     * function used by Ext.panel.Panel's {@link Ext.panel.Panel#bridgeToolbars bridgeToolbars} method.
     *
     * @private
     * @param  {Object/Object[]} toolbar The configuration object for a toolbar, or an array of items.
     * @param  {String} pos The dock position of the toolbar. Defaults to 'bottom'.
     * @return {Object} The completed toolbar configuration object.
     */
    initActionBar: function (toolbar, config) {
        var defaults;

        if (Ext.isArray(toolbar)) {
            toolbar = {
                xtype: 'toolbar',
                items: toolbar
            };
        }

        defaults = {
            xtype: 'toolbar',
            dock: 'bottom',
            itemId: 'actionBar',
            cls: ['taco-window-action-toolbar', toolbar.cls].join(' '),
            layout: {
                type: 'hbox',
                pack: 'end'
            }
        };

        Ext.apply(toolbar, config, defaults);

        if (toolbar.dock === 'left' || toolbar.dock === 'right') {
            toolbar.vertical = true;
        }

        return toolbar;
    },

    /**
     * @private
     */
    onRender: function () {
        var form = this.getForm();

        this.callParent(arguments);

        if (form && form.isComponent) {
            this.bindToForm(form);
        }
    },

    /**
     * @cfg primaryHandler
     * The function to execute when the primary action button is clicked.
     */
    primaryHandler: function () {
        this.save();
    },

    
    /**
     * @private
     * The function to execute when the default save button is pressed
     * This is the beginning of the save process not the end. 
     * Listen to the "savesuccess" event to get the final data after the save process completes
     * Subclasses should NOT override this method with their own behavior. They should override the doSave()
     */
    save: function () {
        var me = this;

        if (me.fireEvent('beforesave', me) !== false) {
            me.onSave();
            me.fireEvent('save', me);
            me.doSave();
        }
    },

    /**
    *  Template method called just before the save event is fired;
    */
    onSave: Ext.emptyFn,
    
    /**
     * @cfg doSave
     * The function to execute the persistance code if needed;  
     * Subclasses should override this method with their own behavior. 
     * Be sure to call the "saveSuccess(data)" method with the new data as an argument when the save process is complete;
     */
    doSave: function () {
        var me = this,
            form = me.getForm(),           
            data = null;
        
        // see if there is a form to extract the data from ;
        if (form) {
            if (form.record) {
                data = form.record;
            } else {
                data = form.getValues();
            }
        }

        console.warn("The instances and subclasses of this Modal typically overide the doSave() Method and this modal has not.")

        /*
        
        // your persistance code goes here. 
        Call saveSuccess(data)

        */

        //This is required. don't forget to call this method when your override finishes the persistance process.
        me.saveSuccess(data);
    },
        
    /**
    * Callback method that announces when a bound form has saved successfuly    
    * When no bound form exists, this method is called immediately when the save button is clicked;
    * Pass in data argument if you want to override the default arguments for the savesuccess event
    * @param  {mixed} data the data that was saved. Could be record, string, object, array. Optional, but strongly recommended; If data not passed the method will attempt to pull the data from a child form;
    */
    saveSuccess: function (data) {
        var me = this;                    
        
        // this will control whether the afterclosecancel event or the afterclosesave event fires
        me.isSave = true;

        // Setting some data to be included in the afterclosesave event which fires after the window close code completes;
        me.saveData = data;

        me.onSaveSuccess(this.saveData);

        me.fireEvent('savesuccess', me, me.saveData);

        if (me.closeOnSave) {
            me.close();
        }        
    },

    /**
    *  Template method called just before the savesuccess event is fired; 
    */
    onSaveSuccess : Ext.emptyFn,

    /**
     * Set the scope of window actions to the window instance.
     *
     * @private
     * @param  {Ext.util.MixedCollection} items The items collection containing the actions.
     */
    scopeActions: function (items) {
        items.each(function (action) {
            action.scope = this;
        }, this);
    },

    /**
     * @cfg secondaryHandler
     * The function to execute when the secondary action is clicked.
     */
    secondaryHandler: function () {        
        this.close();
    },

    /**
    *  Need to listen for the close of the window to determine if it was closed due to cancel or save;
    *  The cancel event happens after the close code has finished its tear down;
    */
    initCancelListener : function (){
        var me =this;
        // need to defer the firing of the afterClose event until after the close event so that the window has finished its tear down; otherwise the window competes for focus with anything listening for the cancel event;
        me.mon(me, 'close', function () {
            me.onAfterClose();        
        }, me);
    },
    /**
    * After the window close code has finisehd but before the destroy code executes.
    */
    onAfterClose: function () {
        var me = this;

        // regardless of the reason for the window close we let everyone know; If you don't care if its a save or a cancel this is your event; 
        // this event will allow you to pass focus to an element without the window causing you woe. 
        me.fireEvent('afterclose', me);

       if (me.isSave) {
            // if you need to get the save data after the window closes, this is your ticket to paradise. or misery depending on which version of extjs your working with...
            me.fireEvent('aftersaveclose', me, me.saveData);
       } else  {
           me.fireEvent('aftercancelclose', me);
       }
    },

    /**
    * when user hits cancel button or x in upper right corner or hits escape key; modal will close.
    */    
    close: function () {
        var me = this;
        if (!me.isSave) {
            // check to make sure the cancel is allowed. this will allow the dialog close to pre-empted by a confirmation dialog;
            if (me.fireEvent('beforecancel', me) !== false) {
                me.fireEvent('cancel', me);
                me.callParent(arguments)
            }
        } else {            
            me.callParent(arguments)
        }
    },

    destroy: function () {
        var me = this;        
        if (me.keyMap) {
            me.keyMap.destroy();
        }
        this.callParent(arguments);
    }
});
