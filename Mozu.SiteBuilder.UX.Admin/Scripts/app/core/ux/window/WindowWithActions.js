

Ext.define('Taco.core.ux.window.WindowWithActions', {
    extend: 'Taco.core.ux.window.Window',
    alias: 'widget.taco-windowwithactions',

    /**
     * @cfg {String} primaryText
     * Text of the primary button that will fire the 'save' event
     */
    primaryText: 'Save',

    /**
     * @cfg {String} secondaryText
     * Text of the secondary link that will fire the 'cancel' event
     */
    secondaryText: 'Cancel',

    /**
     * @cfg {Boolean} isDirty
     * Initializes the dirty state of the modal
     */
    isDirty: false,

    /**
     * @cfg {Boolean} isValid
     * Initializes the valid state of the modal
     */
    isValid: false,

    initComponent: function () {

        this.addEvents(
        /**
         * @event
         * Fired before the cancel event is fired.
         * Returning false from an event listener can prevent the cancel from occurring.
         * @param {Taco.core.ux.modal.ContentWithActions} this
         */
        'beforecancel',
        /**
         * @event
         * Fired after the cancel button is clicked.
         * @param {Taco.core.ux.modal.ContentWithActions} this
         */
        'cancel',
        /**
         * @event
         * Fired before the save event is run.
         * Returning false from an event listener can prevent the save from occurring.
         * @param {Taco.core.ux.modal.ContentWithActions} this
         */
        'beforesave',
        /**
         * @event
         * Fired after the save button is clicked.
         * @param {Taco.core.ux.modal.ContentWithActions} this
         */
        'save',
        /**
         * @event
         * Fired when the dirty state changes
         * @param {Taco.core.ux.modal.ContentWithActions} this
         * @param {Boolean} isDirty
         */
        'dirtychange',
        'savesuccess',
        /**
         * @event
         * Fired when the validity state changes
         * @param {Taco.core.ux.modal.ContentWithActions} this
         * @param {Boolean} isValid
         */
        'validitychange');

        this.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            text: this.primaryText,
            listeners: {
                click: function() {
                    if (this.fireEvent('beforesave') === false) {
                        return;
                    }

                    this.fireEvent('save');
                },
                scope: this
            }
        });

        this.dockedItems = [{
            xtype: 'container',
            cls: 'action-bar',
            dock: 'bottom',
            items: [{
                xtype: 'secondaryaction',
                text: this.secondaryText,
                listeners: {
                    click: function() {
                    if (!this.fireEvent('beforecancel')) {
                            return;
                        }
                        this.hide();
                        this.fireEvent('cancel');
                    },
                    scope: this
                }
            },
            this.dirtyButton]
        }];

        this.callParent(arguments);

        this.on({
            dirtychange: function (obj, isDirty) {
                this.isDirty = isDirty;
                this.checkSavableButton();
            },
            validitychange: function (obj, isValid) {
                this.isValid = isValid;
                this.checkSavableButton();
            },
            afterrender: function() {
                this.form = this.down('form');

                if (this.form) {
                    this.isValid = this.isDirty ||  this.form.getForm().isValid();
                    this.isDirty = this.isDirty ||  this.form.getForm().isDirty();
                    this.relayEvents(this.form, ['savablestatechange']);

                    this.form.on({
                        savesuccess: function () {
                            this.fireEvent('savesuccess', this, this.form.record);
                            this.hide();
                        },
                        scope: this
                    });
                }
                this.checkSavableButton();
            },
            savablestatechange: function (form, state) {
                this.setSavable(state);
            },
            scope: this
        });
    },

    setSavable: function (value) {
        this.dirtyButton.setDirty(value);
    },

    /**
     * @private
     */
    checkSavableButton: function() {
        console.log('checksavable');
        this.dirtyButton.setDirty(this.isDirty && this.isValid);
    }
});