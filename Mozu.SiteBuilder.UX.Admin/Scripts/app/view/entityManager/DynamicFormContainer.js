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
        'Taco.platter.fields.SimpleFields',
        'Taco.platter.forms.SimpleForms'
    ],
    saveButtonEnabled: true,
    autoScroll :true,
    createButtonEnabled: false,
    showNameEditor:true,
   layout: {
        type: 'vbox',
        align: 'stretch'
    },
    // layout: 'default',
    supportsSaving:true,
    enableNavHeader: false,

  //  padding: '20px',
    initComponent: function () {


        var data = this.data = Ext.clone(this.record.get('fields') || {});

        for (name in this.record.data) {
            if (this.record.data.hasOwnProperty(name)&& name !='properties' && name !='item' ) {
                this.data['document.' + name] = this.record.data[name];
            }
        }

        if (this.editor) {

            try {
                this.dynamicForm = eval(this.editor.get('code'));
                
            } catch (e) {
                console.log(e, this.editor.get('code'));
            }
        }
        if (!this.dynamicForm) {
            this.dynamicForm = Ext.create('Taco.view.entityManager.DynamicFormContainer.DefaultEditor');
            this.supportsSaving = false;


        }


       

        this.dynamicForm.data = this.data;
        //this makes cms ugly
        //this.dynamicForm.ui = 'subform';


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
            this.dynamicForm.getForm().setValues(this.data);
        }


        // if (this.dynamicForm.setParent) {
        //     this.dynamicForm.setParent(this);
        // }
        //// this.title = this.dynamicForm.title || this.title;
        // if (this.dynamicForm.getTitle) {
        //     this.title = this.dynamicForm.getTitle();
        // }
        this.items = [];
        if (this.record.get('entityType') === 'cms' &&
            this.showNameEditor &&
            this.dynamicForm.getForm &&
            !this.dynamicForm.getForm().findField('document.name')) {
            this.items.push({
                xtype: 'taco-slugfield',
                itemId:'cms_entity_name',
                allowBlank: false,
                allowOnlyWhitespace: false,
              //  name: 'name',
                width: '100%',
                value:this.record.get('name'),
                fieldLabel: 'Name'
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
        

        data = data || (this.record.get('entityType') === 'mzdb' ? containerData.item : containerData.properties);

        containerData = containerData || {};

        //clean bad fields out.
        if (Ext.isObject(data)) {
            for (name in data) {
                if (data.hasOwnProperty(name)) {
                    if (name.indexOf('-inputEl') != -1) {
                        delete data[name];
                    }
                    if (name.indexOf('document.') != -1) {
                        containerData[name.substring('document.'.length)] = data[name];
                        delete data[name];
                    }
                    if (name.indexOf('container.') != -1) {
                        containerData[name.substring('container.'.length)] = data[name];
                        delete data[name];
                    }
                }
            }
        }

        



        if (this.record.get('entityType') === 'mzdb') {
            this.record.set('item', data);
        } else {
            this.record.set('properties', data);
            if (this.showNameEditor && this.down('#cms_entity_name')) {
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
            callback: function (r) {
                me.saveSuccess(r);
            }

        });

    }

});

Ext.define('Taco.view.entityManager.DynamicFormContainer.DefaultEditor', {
    extend: 'Taco.core.ux.form.entities.EntityEditorForm',
    //layout: {
    //    type: 'hbox',
    //    align: 'stretch'

    //},
    flex: 1,
    height:'100%',
    items: [
        {
            xtype: 'taco-codefield',
            mode: 'JSON',
            itemId: 'readonlyJSON',
            readOnly: true,
            flex:1
        }
    ],


    setData: function (data) {
        this.down('#readonlyJSON').setValue(data?JSON.stringify(data, undefined, 2):'');
        this.data = data;
    },

   
    getData: function () {
        return Ext.applyIf({}, this.data);
    }
});

