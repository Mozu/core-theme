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
        formBind: true
    }],

    /**
     * @cfg {Boolean} bindActionsToWindow
     * Scope actions to the window instance (defaults to true).
     */
    bindActionsToWindow: true,

    /**
     * @cfg {String} primaryText
     * Text of the primary action that will fire the 'save' event
     */
    primaryText: 'Save',

    /**
     * @cfg {String} secondaryText
     * Text of the secondary action that will fire the 'cancel' event
     */
    secondaryText: 'Cancel',

    closable: false,
    modal: true,

    bodyPadding: '11 20 0',
    ui: 'modal',

    config: {
        form: undefined
    },

    constructor: function (config) {
        var actions,
            actionBar;

        actions = this.configureActions(config);
        actionBar = this.initActionBar(actions, config.actionBar || this.actionBar);

        config.dockedItems = Ext.Array.merge([actionBar], config.dockedItems);

        this.callParent([config]);
    },

    initComponent: function () {
        this.addEvents(
        /**
         * @event
         * Fired before the cancel event is fired.
         * Returning false from an event listener can prevent the cancel from occurring.
         * @param {Taco.core.ux.window.Modal} this
         */
        'beforecancel',
        /**
         * @event
         * Fired after the cancel button is clicked.
         * @param {Taco.core.ux.window.Modal} this
         */
        'cancel',
        /**
         * @event
         * Fired before the save event is run.
         * Returning false from an event listener can prevent the save from occurring.
         * @param {Taco.core.ux.window.Modal} this
         */
        'beforesave',
        /**
         * @event
         * Fired after the save button is clicked.
         * @param {Taco.core.ux.window.Modal} this
         */
        'save',
        /**
         * @event
         * Fired when a save operation was successful.
         * @param {Taco.core.ux.window.Modal} this
         * @param {Ext.data.Model} record The record that was saved.
         */
        'savesuccess');

        this.callParent(arguments);

        if (this.bindActionsToWindow) {
            this.bindActions(this.down('#actionBar').items);
        }
    },

    /**
     * Set the scope of window actions to the window instance.
     *
     * @private
     * @param  {Ext.util.MixedCollection} items The items collection containing the actions.
     */
    bindActions: function (items) {
        items.each(function (action) {
            action.scope = this;
        }, this);
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

        this.mon(form, {
            savesuccess: {
                scope: this,
                fn: function () {
                    this.fireEvent('savesuccess', this, form.record || null);
                }
            }
        });
    },

    /**
     * Apply configs to the window actions.
     *
     * @private
     * @param  {Object} windowCfg The configuration object passed to the window's constructor.
     * @return {Object[]} The array completed window action configuration objects.
     */
    configureActions: function (windowCfg) {
        var actionsCfg = windowCfg.actions || this.actions,
            actions;

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
     * The function to execute when the primary action is clicked.
     */
    primaryHandler: function () {
        if (this.fireEvent('beforesave', this) !== false) {
            this.fireEvent('save', this);
            this.close();
        }
    },

    /**
     * @cfg secondaryHandler
     * The function to execute when the secondary action is clicked.
     */
    secondaryHandler: function () {
        if (this.fireEvent('beforecancel', this) !== false) {
            this.fireEvent('cancel', this);
            this.close();
        }
    }
});
