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

    saveHidden: false,
    cancelHidden: false,

    actionsCfg: null,

    formCfg: null,
    formCls: null,
    record: null,
    titleData: null,
    enableSaveActionToggle: true,    

    initWrapper: function () {
        this.addEvents([
            'beforeload',
            'afterload',
            'aftersave',
            'cancel',
            'destroyrecord'
        ]);
        this.originalId = this.record ? this.record.getId() : null;

        if (!this.form && this.formCls) {
            this.formCfg = Ext.applyIf({
                autoTitle: this.autoTitle,
                record: this.record,
                overflowY: 'auto'
            }, this.formCfg);

            this.form = Ext.create(this.formCls, this.formCfg);
        }

        if (!this.actions) {
            this.actions = [{
                    xtype: 'button',
                    itemId: 'cancel',
                    ui: 'action',
                    scale: 'medium',
                    text: this.cancelText,
                    margin: '0 0 0 10',
                    hidden: this.cancelHidden || !this.allowCreate(),
                    scope: this,
                    handler: this.cancel
                }, {
                    xtype: 'button',
                    itemId: 'save',
                    ui: 'action-primary',
                    scale: 'medium',
                    text: this.saveText,
                    margin: '0 0 0 10',
                    allowDepress: false,
                    enableToggle: this.enableSaveActionToggle,
                    formBind: true,
                    hidden: this.saveHidden || !this.allowCreate(),
                    scope: this,
                    toggleHandler: this.save
                }];
        }

        Ext.each(this.additionalActions, function (additionalAction) {
            var beforeItemId = additionalAction.beforeItemId,
                insertIndex;

            if (beforeItemId) {
                Ext.each(this.actions, function (action, index) {
                    if (action.itemId !== beforeItemId) return;
                    insertIndex = index + 1;
                    return false;
                });
            }

            if (insertIndex) {
                this.actions = Ext.Array.insert(this.actions, insertIndex, [additionalAction]);
            } else {
                this.actions.unshift(additionalAction);
            }
        }, this);

        // if (this.additionalActions && this.additionalActions.length) {
        //     this.actions = this.additionalActions.concat(this.actions);
        // }

        this.on({
            beforerender: this.onBeforeRender,
            scope: this
        });

        this.relayEvents(this.form, ['beforeload', 'afterload', 'change']);
    },
    allowCreate: function () {
        return this.allowMethod('create');
    },

    allowDestroy: function () {
        return this.allowMethod('destroy');
    },

    allowUpdate: function () {
        return this.allowMethod('update');
    },

    allowRead: function () {
        return this.allowMethod('read');
    },
    allowMethod: function (method) {
        var me = this,
            res = true,
            model;

        if (me.behaviors && me.behaviors[method]) {
            Ext.each(me.behaviors[method], function (behavior) {
                if (Taco.User.behaviors.indexOf(behavior) == -1) {
                    res = false;
                    return false;
                }
                return true;
            });
        } else if (me.record && me.record.modelName) {
            model = Ext.ModelManager.getModel(me.record.modelName);
            res = model.allowMethod(method);

        }

        return res;
    },

    onBeforeRender: function () {
        this.dirtybutton = this.down('button#save');

        if (!this.form) {
            return;
        }

        this.form.on({
            // savablestatechange: function (form, isSavable) {
            //     this.dirtybutton.setDirty(this.checkSavable(isSavable));
            // },
            savesuccess: function () {
                this.onComplete();
                this.fireEvent('aftersave', this, this.record, this.isEdit());
                if (this.record && this.record.getId() != this.originalId) {
                    this.fireEvent('idchange', this, this.record, this.originalId);
                }

            },
            savecomplete: function () {
                if (this.dirtybutton) {
                    this.dirtybutton.toggle(false);
                    this.dirtybutton.removeCls('taco-button-processing');
                    this.dirtybutton.setText('Save');
                }
            },
            titlechange: function (panel, newTitle) {
                this.updateTitle(newTitle);
            },
            afterrender: function () {
                var header = this.form.getHeader();
                if (header) {
                    header.hide();
                }
            },
            scope: this
        });

        this.updateTitle(this.form.title);
    },

    checkSavable: function (isSavable) {
        console.log('unimplemented function: checkSavable');
        // if (isSavable && this.validateSavableStateChange) {
        //     Ext.each(this.query('form.form'), function (childForm) {
        //         if (!childForm.isValid()) {
        //             isSavable = false;
        //             return;
        //         }
        //     });
        // }
        // return isSavable;
    },

    updateTitle: function (title) {
        if (!this.form.title) {
            return;
        }
        // this.title = this.form.title;
        // this.getHeader().setTitle(title);
        this.setTitle(title);
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
        if (this.dirtybutton && this.dirtybutton.pressed == false) {
            return;
        }
        if (this.dirtybutton) {
            this.dirtybutton.addCls('taco-button-processing');
            this.dirtybutton.setText('Saving...');
        }
        this.form.save();
    },
    destroyRecord: function () {
        var me = this;
        // me.dirtybutton.setLoading(true);
        me.record.destroy({
            callback: function (records, operation, success) {
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


