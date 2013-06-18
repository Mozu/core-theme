/**
 * @class Taco.core.ux.modal.ContentWithActions
 */
Ext.define('Taco.core.ux.modal.ContentWithActions', {
    extend: 'Taco.core.ux.modal.Content',
    alias: 'widget.selectormodal',

    /**
     * @cfg {String} title
     * Title that appears on the top of the Modal
     */
    title: null,

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

    initComponent: function() {

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
        /**
         * @event
         * Fired when the validity state changes
         * @param {Taco.core.ux.modal.ContentWithActions} this
         * @param {Boolean} isValid
         */
        'validitychange');

        this.content = {
            items: [{
                xtype: 'contentcontainer',
                header: {
                    title: this.title,
                    instructionText: this.instructionText,
                    actions: this.actions
                },
                body: {
                    items: this.content && this.content.items && this.content.items.length > 0 ? this.content.items : this.items
                }
            }]
        };

        //  This is a load bearing code, do not remove!
        this.items = [];

        this.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            text: this.primaryText,
            listeners: {
                click: function() {
                    if (!this.fireEvent('beforesave')) {
                        return;
                    }

                    this.fireEvent('save');
                },
                scope: this
            }
        });

        this.actions = {
            items: [this.dirtyButton,
            {
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
            }]
        };

        this.callParent(arguments);

        this.on({
            dirtychange: function (obj, isDirty) {
                console.log('dirtychange');
                this.isDirty = isDirty;
                this.checkDirtyButton();
            },
            validitychange: function (obj, isValid) {
                console.log('valchange');
                this.isValid = isValid;
                this.checkDirtyButton();
            },
            afterrender: function() {
                var form = this.down('form');

                if (form) {
                    this.isValid = this.isDirty ||  form.getForm().isValid();
                    this.isDirty = this.isDirty ||  form.getForm().isDirty();
                }
                this.checkDirtyButton();
            },
            savablestatechange: function (form, state) {
                this.setDirty(state);
            },
            scope: this
        });
    },

    setDirty: function (value) {
        this.dirtyButton.setDirty(value);
    },

    /**
     * @private
     */
    checkDirtyButton: function() {
        this.dirtyButton.setDirty(this.isDirty && this.isValid);
    }
});