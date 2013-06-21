Ext.define('Taco.core.ux.form.EditorWrapper', {
    
    /**
     * @cfg {Object[]}
     * Any additional actions you want to add on top of the default Save/Cancel actions
     */
    additionalActions: null,

    /**
     * @cfg {String}
     * The Title you want to appear at the top of the page
     */
    title: null,

    /**
     * @cfg {String}
     * The title to appear when Editing a record. This will override the default Title config.
     */
    editTitle: null,

    /**
     * @cfg {String}
     * The title to appear when Creating a record. This will override the default Title config.
     */
    createTitle: null,

    /**
     * @cfg {String}
     * The text to appear inside the save action
     */
    saveText: 'Save',
    
    /**
     * @cfg {String}
     * The text to appear inside the cancel action
     */
    cancelText: 'Cancel',

    formCfg: null,
    formCls: null,
    record: null,
    titleData: null,
    validateSavableStateChange:true,

    initWrapper: function () {
        this.addEvents([
            'beforeload',
            'afterload',
            'aftersave',
            'cancel',
            'destroyrecord'
        ]);
        this.origionalId = this.record ? this.record.getId(): null;
        
        if (!this.form && this.formCls) {
            this.formCfg = Ext.applyIf({
                autoTitle:this.autoTitle,
                record: this.record,
                overflowY: 'auto'
            }, this.formCfg);

            this.form = Ext.create(this.formCls, this.formCfg);
        }

        if (!this.actions) {
            this.actions = [{
                xtype: 'secondarybutton',
                text: this.cancelText,
                click: this.cancel,
                scope: this
            }, {
                xtype: 'dirtybutton',
                text: this.saveText,
                click: this.save,
                scope: this
            }];
        }

        if (this.additionalActions && this.additionalActions.length) {
            this.actions = this.additionalActions.concat(this.actions);
        }

        this.on({
            beforerender: this.onBeforeRender,
            scope: this
        });

        this.relayEvents(this.form, ['beforeload', 'afterload', 'change']);
    },

    onBeforeRender: function () {
        this.dirtybutton = this.down('dirtybutton');

        if (!this.form) {
            return;
        }

        this.form.on({
            savablestatechange: function (form, isSavable) {
                var forms;
                if (isSavable && this.validateSavableStateChange) {
                    forms = this.query('form.form');
                    Ext.each(forms, function (childForm) {
                        if (!childForm.isValid()) {
                            isSavable = false;
                            return;
                        }
                    });
                }
                this.dirtybutton.setDirty(isSavable);
            },
            savesuccess: function () {
                console.log('savesuccess');
                //this.dirtybutton.setLoading(false);
                this.dirtybutton.setDirty(false);
                this.onComplete();
                this.fireEvent('aftersave', this, this.record, this.isEdit());
                if (this.record && this.record.getId() != this.origionalId) {
                    this.fireEvent('idchange', this, this.record, this.origionalId);
                }
                
            },
            titlechange: function (panel, newTitle) {
                this.updateTitle(newTitle);
            },
            afterrender: function () {
                var header = this.form.getHeader();
                if( header ) {
                    header.hide();
                }
            },
            scope: this
        });

        this.updateTitle(this.form.title);
    },

    updateTitle: function (title) {
        if (!this.form.title) {
            return;
        }
        this.title = this.form.title;
        this.getHeader().setTitle(title);
    },

    /**
     * Gets the form from the editor
     * @return {Taco.core.ux.form.Form} This form is responsible for the form UI as well as the processing of records
     */
    getForm: function () {
        return this.form;
    },


    /**
     * Determines whether a record is being edited on the form or not. Uses the phantom tag on the record to determine this.
     * @return {Boolean} Is editting an existing record.
     */
    isEdit: function () {
        if (this.form && this.form.isEdit) {
            return this.form.isEdit();
        }
        return this.record && !this.record.phantom;
    },

    addAction: function (action) {
        //  add action
    },

    /**
     * Initialize the save process on the form
     */
    save: function () {
        this.dirtybutton.setLoading(true);
        this.form.save();
    },
    destroyRecord: function () {
        var me = this;
        me.dirtybutton.setLoading(true);
        me.record.destroy({
            callback: function(records, operation, success) {
                if (operation.success) {
                    me.fireEvent('destroyrecord', this, records, operation);
                }
            }
        });
    },
    /**
     * Cancels the form
     */
    cancel: function () {
        //do stuff
        this.onComplete();
        this.fireEvent('cancel', this, this.record);
    },

    /**
     * Runs whenever the save or cancel operations have completed.
     */
    onComplete: function () {
        // go back to index page
    }
});