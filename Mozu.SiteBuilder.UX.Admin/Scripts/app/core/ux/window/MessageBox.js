/**
 * @class Taco.core.ux.window.MessageBox
 */

Ext.define('Taco.core.ux.window.MessageBox', {
    extend: 'Taco.core.ux.window.Window',

    /**
 * @property
 * Button config that displays a single OK button
 */
    OK: 1,
    /**
 * @property
 * Button config that displays a single Yes button
 */
    YES: 2,
    /**
 * @property
 * Button config that displays a single No button
 */
    NO: 4,
    /**
 * @property
 * Button config that displays a single Cancel button
 */
    CANCEL: 8,
    /**
 * @property
 * Button config that displays OK and Cancel buttons
 */
    OKCANCEL: 9,
    /**
 * @property
 * Button config that displays Yes and No buttons
 */
    YESNO: 6,
    /**
 * @property
 * Button config that displays Yes, No and Cancel buttons
 */
    YESNOCANCEL: 14,
    /**
 * @property
 * The CSS class that provides the INFO icon image
 */
    INFO: Ext.baseCSSPrefix + 'message-box-info',
    /**
 * @property
 * The CSS class that provides the WARNING icon image
 */
    WARNING: Ext.baseCSSPrefix + 'message-box-warning',
    /**
 * @property
 * The CSS class that provides the QUESTION icon image
 */
    QUESTION: Ext.baseCSSPrefix + 'message-box-question',
    /**
 * @property
 * The CSS class that provides the ERROR icon image
 */
    ERROR: Ext.baseCSSPrefix + 'message-box-error',

    buttonText: {
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
    },
    //</locale>

    buttonIds: [
        'ok', 'yes', 'no', 'cancel'
    ],

    titleText: {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
    },

    initComponent: function () {

        var me = this,
            i,
            baseId,
            button;

        baseId = me.id,
            // Create the buttons based upon passed bitwise config
        me.msgButtons = [];
        for (i = 0; i < 4; i++) {
            button = me.makeButton(i);
            me.msgButtons[button.itemId] = button;
            me.msgButtons.push(button);
        }
        me.items = [
            me.msg = new Ext.form.field.Display({
                id: baseId + '-displayfield',
                cls: me.baseCls + '-text'
            }),
            me.textField = new Ext.form.field.Text({
                id: baseId + '-textfield',
                anchor: '100%',
                enableKeyEvents: true,
                listeners: {
                    keydown: me.onPromptKey,
                    scope: me
                }
            }),
            me.textArea = new Ext.form.field.TextArea({
                id: baseId + '-textarea',
                anchor: '100%',
                height: 75
            })
        ];

        me.bottomTb = Ext.widget({
            xtype: 'container',
            cls: 'action-bar',
            dock: 'bottom',
            padding: '19 19 0',
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'end',
                defaultMargins: '0 0 0 10'
            },
            items: [
                me.msgButtons[3],
                me.msgButtons[2],
                me.msgButtons[1],
                me.msgButtons[0]
            ]
        });

        me.dockedItems = [me.bottomTb];
        
        me.callParent();
    },

    onPromptKey: Ext.emptyFn,

    makeButton: function (btnIdx) {
        var btnId = this.buttonIds[btnIdx];
        return new Ext.button.Button({
            handler: this.btnCallback,
            itemId: btnId,
            scope: this,
            ui: btnId === 'ok' ? 'action-primary' : 'action',
            scale: 'medium',
            text: this.buttonText[btnId],
            minWidth: 75
        });
    },
    updateButtonText: function () {
        var me = this,
            buttonText = me.buttonText,
            buttons = 0,
            btnId,
            btn;

        for (btnId in buttonText) {
            if (buttonText.hasOwnProperty(btnId)) {
                btn = me.msgButtons[btnId];
                if (btn) {
                    if (me.cfg && me.cfg.buttonText) {
                        buttons = buttons | Math.pow(2, Ext.Array.indexOf(me.buttonIds, btnId));
                    }
                    if (btn.text != buttonText[btnId]) {
                        btn.setText(buttonText[btnId]);
                    }
                }
            }
        }
        return buttons;
    },

    updateOkButtonText: function (text) {
        // TODO: Add code
    },

    btnCallback: function (btn) {
        var me = this,
            value,
            field;

        if (me.cfg.prompt || me.cfg.multiline) {
            if (me.cfg.multiline) {
                field = me.textArea;
            } else {
                field = me.textField;
            }
            value = field.getValue();
            field.reset();
        }

        // Component.onHide blurs the active element if the Component contains the active element
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    },

    show: function (cfg) {
        var me = this,
            msgButtons = me.msgButtons,
            hideToolbar = true,
            closeTool,
            textArea,
            textField,
            buttons;

        me.cfg = cfg;


        me.setScale(cfg.scale || 'small');

        me.modal = cfg.modal || false;

        // Create the buttons based upon passed bitwise config
        buttons = cfg.buttons || 0;
        for (i = 0; i < 4; i++) {
            if (buttons & Math.pow(2, i)) {

                // Default to focus on the first visible button if focus not already set
                if (!me.defaultFocus) {
                    me.defaultFocus = msgButtons[i];
                }
                msgButtons[i].show();
                hideToolbar = false;
            } else {
                msgButtons[i].hide();
            }
        }
        me.bottomTb.setVisible(!hideToolbar);
        

        //if (closeTool && closeTool.isComponent) closeTool.setVisible(hideToolbar);
        //me.down('tool[type="close"]').setVisible(hideToolbar);

        // Hide or show the message area
        msg = me.msg;
        if (cfg.msg) {
            msg.setValue(cfg.msg);
            msg.show();
        } else {
            msg.hide();
        }

        // Hide or show the input field
        textArea = me.textArea;
        textField = me.textField;
        if (cfg.prompt || cfg.multiline) {
            me.multiline = cfg.multiline;
            if (cfg.multiline) {
                textArea.setValue(cfg.value);
                textArea.setHeight(cfg.defaultTextHeight || me.defaultTextHeight);
                textArea.show();
                textField.hide();
                me.defaultFocus = textArea;
            } else {
                textField.setValue(cfg.value);
                textArea.hide();
                textField.show();
                me.defaultFocus = textField;
            }
        } else {
            textArea.hide();
            textField.hide();
        }
        
        me.userCallback = Ext.Function.bind(cfg.callback || cfg.fn || Ext.emptyFn, cfg.scope || Ext.global);
        
        me.callParent(arguments);

        me.setTitle(cfg.title);

        // Init the close tool on the window
        if (!me.closeTool) me.closeTool = me.down('tool[type="close"]');

        // Hide the Close if there are no Buttons
        if (me.closeTool) me.closeTool.setVisible(hideToolbar);
    },

    /**
     * Displays a standard read-only message box with an OK button (comparable to the basic JavaScript alert prompt).
     * If a callback function is passed it will be called after the user clicks the button, and the
     * id of the button that was clicked will be passed as the only parameter to the callback
     * (could also be the top-right close button, which will always report as "cancel").
     *
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} [fn] The callback function invoked after the message box is closed.
     * See {@link #method-show} method for details.
     * @param {Object} [scope=window] The scope (<code>this</code> reference) in which the callback is executed.
     * @return {Ext.window.MessageBox} this
     */
    alert: function (cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                msg: msg,
                //buttons: this.OK,
                fn: fn,
                scope: scope,
                scale:'small'
            };
        }
        return this.show(cfg);
    },

    confirm: function (cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                msg: msg,
                buttons: this.OKCANCEL,
                fn: fn,
                scope: scope,
                scale: 'small'
            };
        } else {
            cfg = Ext.apply({}, cfg, {
                buttons: this.OKCANCEL,
                scale: 'small'
            });
        }
        return this.show(cfg);
    }
}, function () {
    /**
 * @class Ext.MessageBox
 * @alternateClassName Ext.Msg
 * @extends Ext.Taco.MessageBox
 * @singleton
 * Singleton instance of {@link Ext.window.MessageBox}.
 */
    Taco.MessageBox = new this();
});
