Ext.define('Taco.view.publishing.modal.CreatePublishSet', {
    extend:'Taco.core.ux.window.Modal',
    scale: 'medium',
    title: 'Create Publish Set',
    modal: true,
    closeAction: 'destroy',
    height: 400,
    width: 800,
    primaryText: 'Save',
    secondaryText: 'Cancel',
    initComponent: function() {
        console.log(this.record);
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
                            fieldLabel: 'Name',
                            width: 340,
                            allowOnlyWhitespace: false
                        },
                        {
                            xtype: 'textfield',
                            name: 'code',
                            fieldLabel: 'Code',
                            readOnly: this.isEdit,
                            width: 340,
                            required: true,
                            emptyText: 'If left blank, a code will be generated'
                        },
                        {
                            xtype: 'datefield',
                            name: 'publishDate',
                            fieldLabel: 'Publish Date',
                            minDate: new Date(),
                            autoShow: false,
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
                            fieldLabel: 'Notes',
                            width: 375,
                            height: 225,
                            afterLabelTextTpl: '<float style="float:right; font-weight:normal;">For internal use</span>'
                        }
                    ]
                }
            ]
        });
    },
    onSave: function() {
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
                success: me.callback,
                failure: function() {
                    Taco.app.fireEvent('setmessage', 'There was an error with this Publish Set!', 'error');
                }
            });
    }
});