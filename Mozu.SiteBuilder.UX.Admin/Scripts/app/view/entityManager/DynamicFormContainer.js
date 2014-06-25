Ext.define('Taco.view.entityManager.DynamicFormContainer', {
    extend: 'Ext.panel.Panel',
    mixins: {
        // editorwrapper: 'Taco.core.ux.form.EditorWrapper',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    saveButtonEnabled: true,
    createButtonEnabled: true,
    createButtonEnabled: false,
    
    layout: 'fit',
    enableNavHeader: false,
 
    padding:'20px',
    initComponent: function () {
        this.data = Ext.clone(this.record.get('fields'));
        this.dynamicForm = eval(this.editor.get('body'));

        if (!this.dynamicForm) {
            throw 'doh!';
        }

        this.dynamicForm.data = this.data;
        this.dynamicForm.ui = 'subform';
        if (this.dynamicForm.initForm) {
            this.dynamicForm.initForm({
                data: this.data,
                parent: this
            });

        }

        if (this.dynamicForm.setData) {
            this.dynamicForm.setData(this.data);
        } else if (this.dynamicForm.getForm) {
            var form = this.dynamicForm.getForm().setValues(this.data);
        }
                    

        if (this.dynamicForm.setParent) {
            this.dynamicForm.setParent(this);
        }
       // this.title = this.dynamicForm.title || this.title;
        if (this.dynamicForm.getTitle) {
            this.title = this.dynamicForm.getTitle();
        }
        this.items = [this.dynamicForm];
        if (this.enableNavHeader) {
            this.mixins.navHeader.init.apply(this);
        }
        this.callParent(arguments);
    },


    doSave: function () {
        var me = this,
            data;

        if (me.fireEvent('beforesave', me) !== false) {
            if (me.dynamicForm.doSave) {
                me.dynamicForm.doSave();
            }
            if (me.dynamicForm.getData) {
                data = me.dynamicForm.getData();
            } else {
                data = me.dynamicForm.data;
            }

        }
        this.record.data.properties = this.data;
        this.record.data.item = this.data;
        if (this.record.get('entityListName')) {
            this.record.set('item', data);
        } else {
            this.record.set('properties', data);
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