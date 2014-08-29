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

    // is this used anywhere?
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
            if (!this.items) {
                this.items = [];
            }

            
            this.items.push(
                {
                    xtype: 'container',
                    padding:20,
                    cls: 'taco-editor-wrapper',
                    items: [this.form]
                }
            );
        }

        this.on({
            beforerender: this.onBeforeRender,
            scope: this
        });

        this.relayEvents(this.form, ['beforeload', 'afterload', 'change']);
    },
    
    onBeforeRender: function () {
        this.dirtybutton = this.down('button#save');

        if (!this.form) {
            return;
        }

        this.form.on({            
            savesuccess: function () {
                this.onComplete();
                this.fireEvent('aftersave', this, this.record, this.isEdit());                
                if (this.record && this.record.getId() != this.originalId) {
                    this.fireEvent('idchange', this, this.record, this.originalId);
                }

                this.saveSuccess(this.record);

            },
            // fire when the client code cancels save during a call to the beforeSave method on the form class;
            // Typically this is a client side validation error; 
            // The form is responsible to call setMessage to display the errors or update the form fields with error messaging where appropriate;
            beforesavefailure: function (view, errors) {                                
                this.saveFailure(arguments)
            },
            // fire when a service returns an error saving the record;
            savefailure: function (view, errors) {
                this.saveFailure(arguments)
            },
            savecomplete: function () {

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

    updateTitle: function (title) {        
        if (!title) {
            return;
        }
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
    }    
});


