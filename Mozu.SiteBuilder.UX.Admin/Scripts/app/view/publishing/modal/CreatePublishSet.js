Ext.define('Taco.view.publishing.modal.CreatePublishSet', {
    extend:'Taco.core.ux.window.Modal',
    scale: 'medium',
    title: Localizer.langResources.CATALOG.Products.ProductEdit.create_publish_set,
    modal: true,
    closeAction: 'destroy',
    height: 400,
    width: 800,
    primaryText: Localizer.langResources.SHARED.save,
    secondaryText: Localizer.langResources.SHARED.cancel,
    initComponent: function() {

        this.form = this.buildForm();
        this.items = [this.form];

        if (this.record) this.form.loadRecord(this.record);

        this.callParent(arguments);
    },
    buildForm: function() {

        return Ext.create('Ext.form.Panel', {
            layout: { 
                type: 'hbox' 
            },
            items: [
                {
                    xtype: 'container',
                    width: '50%',
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'name',
                            fieldLabel: Localizer.langResources.SHARED.FileManager.name,
                            width: 340,
                            allowOnlyWhitespace: false
                        },
                        {
                            xtype: 'textfield',
                            name: 'code',
                            fieldLabel: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.code,
                            readOnly: this.isEdit,
                            width: 340,
                            required: true,
                            emptyText: Localizer.langResources.CATALOG.Products.ProductEdit.code_emptytext
                        },

                        {
                            xtype: 'datetime',
                            name: 'publishDate',
                            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.publish_date,
                            minDate: new Date(),
                            width: 340
                        }

                    ]
                },
                {
                    xtype: 'container',
                    width: '50%',
                    items: [
                        {
                            xtype: 'textarea',
                            name: 'notes',
                            fieldLabel: Localizer.langResources.SHARED.notes,
                            width: 375,
                            height: 225,
                            afterLabelTextTpl: '<float style="float:right; font-weight:normal;">' + Localizer.langResources.CATALOG.Products.ProductEdit.for_internal_use + '</span>'
                        }
                    ]
                }
            ]
        });
    },

    doSave: function() {
        var values = this.form.getValues(),
            me = this,
            model = Ext.create('Taco.model.PublishSet', {
                name: values.name,
                code: values.code,
                publishDate: values.publishDate,
                notes: values.notes
            });

            model.phantom = !this.isEdit;

            model.save({
                success: function (data) {                    
                    me.saveSuccess(data);
                },
                failure: function() {
                    Taco.app.fireEvent('setmessage', Localizer.langResources.CATALOG.Products.ProductEdit.publish_error_msg, 'error');
                }
            });
    }
});