/**
 * @class Taco.view.website.entityAdapters.DocumentEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.DocumentEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',
    requires: [
        'Taco.model.Entity',
        'Taco.view.website.settings.General',
        'Taco.view.website.settings.DocumentSeo',
        'Taco.view.entityManager.DynamicFormContainer',
        'Taco.core.ux.HtmlEditor'
    ],
    modelName: 'Taco.model.CmsDocument',

    allowedActions: {
        copy: true,
        preview: true,
        destroy: true,
        publishPage: true
    },

    constructor: function () {
       
        this.callParent(arguments);
    },

    getId: function () {
        if (!this.pageContext.cmsContext.page.documentListName || !this.pageContext.cmsContext.page.id)
            return undefined;
        return { documentListName: this.pageContext.cmsContext.page.documentListName, id: this.pageContext.cmsContext.page.id };
    },

    getPageSettings: function () {
        var me = this,
            doc = this.get(),
            props = doc.data.properties || {},
            ptd,
            customerEditor,
            ret = [
                Ext.create('Taco.view.website.settings.General', {
                    record: me.get()
                }),
                Ext.create('Taco.view.website.settings.DocumentSeo', {
                    record: me.get()
                })
            ];
        if (props.page_type_definition) {
            ptd = me.manager.pageTypeDefinitions.getById(props.page_type_definition);
            if (ptd&& ptd.raw.customEditor) {
                customerEditor = me.manager.entityEditors.getById('theme_'+ ptd.raw.customEditor);
            }

        }
        if (! customerEditor) {
            customerEditor = me.manager.entityEditors.findEditor(doc);
        }
        if (customerEditor) {
          
          
            if (customerEditor) {
                me.dynamicFormContainer = Ext.create('Taco.view.entityManager.DynamicFormContainer', { editor: customerEditor, record: doc });
                ret.push(me.dynamicFormContainer);
            }
            
        }
        

        return ret;
    },

    getSaveTask: function () {
        var tasks = this.callParent(arguments);
        if (this.dynamicFormContainer) {
            tasks.add({
                updateRecord: this.get(),
                updateForm: this.dynamicFormContainer
            });
        }
        tasks.on('complete', function () {
            if (this.pageContext.cmsContext.page.path != this.get().data.name) {
                Taco.core.StateManager.attemptNavigate('/website/page/' + this.get().data.name);
            }
        }, this, {
            delay: 200
        });
        return tasks;
    },

    getStore: function () {
        return this.editor.cmsDocs;
    },

    load: function () {
        var me = this;

        if (!this.getId()) {
            return;
        }

        Taco.model.Entity.load(this.getId(), {
            scope: this,
            success: function (record, operation) {
                this.set(record);
            }
        });

    }
});