Ext.define('Taco.view.entityManager.DynamicFormContainer', {
    extend: 'Ext.panel.Panel',
    mixins: {
        // editorwrapper: 'Taco.core.ux.form.EditorWrapper',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    requires: [
        'Taco.shared.view.field.GridField',
        'Taco.shared.view.field.ArrayField',
        'Taco.core.ux.form.field.Code',
        'Ext.form.FieldSet',
        'Taco.core.ux.form.entities.EntityEditorForm',
        'Taco.core.ux.form.field.SingleImageField',
        'Taco.core.ux.form.entities.WebPageEditorForm',
        'Taco.core.ux.HtmlEditor',
        'Taco.core.ux.form.SlugField',
        'Taco.core.ux.form.field.PageTemplate',
        'Taco.core.ux.form.field.BaseImageField',
        'Ext.form.field.Hidden',
        'Taco.platter.fields.SimpleFields'
    ],
    saveButtonEnabled: true,
    autoScroll :true,
    createButtonEnabled: false,
    showNameEditor:true,
   // layout:'vbox',
   // layout: 'default',
    enableNavHeader: false,

  //  padding: '20px',
    initComponent: function () {
        this.data = Ext.clone(this.record.get('fields'));
        this.dynamicForm = eval(this.editor.get('code'));

        if (!this.dynamicForm) {
            throw 'doh!';
        }

        this.dynamicForm.data = this.data;
        this.dynamicForm.ui = 'subform';


        if (this.dynamicForm.initForm) {
            this.dynamicForm.initForm({
                data: this.data,
                name: this.record('name'),
                containerData: this.record.data,
                parent: this
            });

        }


        if (this.dynamicForm.initEditor) {
            this.dynamicForm.initEditor(this.data, this.name, this.record.data);
        }


        if (this.dynamicForm.setData) {
            this.dynamicForm.setData(this.data, this.name);
        } else if (this.dynamicForm.getForm) {
            var form = this.dynamicForm.getForm().setValues(this.data);
        }


        // if (this.dynamicForm.setParent) {
        //     this.dynamicForm.setParent(this);
        // }
        //// this.title = this.dynamicForm.title || this.title;
        // if (this.dynamicForm.getTitle) {
        //     this.title = this.dynamicForm.getTitle();
        // }
        this.items = [];
        if (this.record.get('entityType') == 'cms' && this.showNameEditor ) {
            this.items.push({
                xtype: 'taco-slugfield',
                itemId:'cms_entity_name',
                allowBlank: false,
                allowOnlyWhitespace: false,
              //  name: 'name',
                width: '100%',
                value:this.record.get('name'),
                fieldLabel: 'Entity Name'
            });
        }

        this.items.push(this.dynamicForm);

        if (this.enableNavHeader) {
            this.mixins.navHeader.init.apply(this);
        }
        this.callParent(arguments);
    },


    persistFormValues:function (silientError) {
        var me = this,
           containerData,
           data;
        if (me.fireEvent('beforesave', me) === false) {
            me.resetSaveButton();
            if (!silientError) {
                throw false;
            }
            return false;
        }


        if (me.dynamicForm.onBeforeSave && me.dynamicForm.onBeforeSave() === false) {
            me.resetSaveButton();
            if (!silientError) {
                throw false;
            }
            return false;
        }

        if (me.dynamicForm.getContainerData) {
            containerData = me.dynamicForm.getContainerData();
        }


        if (me.dynamicForm.getData) {
            data = me.dynamicForm.getData();
        }

        data = data || (this.record.get('entityType') == 'mzdb' ? containerData.item : containerData.properties);

        //this.record.data.properties = this.data;
        //this.record.data.item = this.data;
        if (this.record.get('entityType') == 'mzdb') {
            this.record.set('item', data);
        } else {
            this.record.set('properties', data);
            if (this.showNameEditor) {
                this.record.set('name', this.down('#cms_entity_name').getValue());
            }
            
        }
        if (containerData) {
            delete containerData.item;
            delete containerData.properties;
            this.record.set(containerData);
        }
    },
    doSave: function () {

        var me = this;
        if (me.persistFormValues(true)===false) {
            return false;
        }

        this.record.save({
            failure: function (record, operation) {
                var msg = operation.error;
                if (msg && msg.remoteException) {
                    msg = msg.remoteException.getMessage();
                }

                if (msg) {
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            },
            callback: function (r, o, s) {
                me.saveSuccess(r);
            }

        });

    }

});