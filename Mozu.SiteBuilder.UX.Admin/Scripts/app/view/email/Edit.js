/**
 * @class Taco.view.email.Edit
 */
Ext.define('Taco.view.email.Edit', {
    extend: 'Taco.core.ux.form.Editor',
    requiresContextOfType: 's',
    requires: ['Taco.view.site.CreateModal', 'Taco.view.site.Toolbox', 'Taco.view.site.page.dataViews.Blog', 'Taco.view.site.page.dataViews.Meta',
        'Taco.view.site.page.Creator', 'Taco.model.PageTypeDefinition', 'Taco.store.TempPages', 'Taco.store.CmsDocuments', 'Taco.core.EventChain',
        'Taco.view.site.page.entityAdapters.DocumentEntityAdapter', 'Taco.view.site.page.entityAdapters.ProductEntityAdapter', 'Taco.view.site.page.entityAdapters.CategoryEntityAdapter',
        'Taco.view.site.navigation.ExternalLinkEditor', 'Taco.core.ux.form.Form'
    ],
    title: 'Email Editor',
    // TODO
    model: 'Taco.model.Product',
    
    type: 'product',

    initComponent: function () {
        this.cmsDocs = new Ext.create('Taco.store.CmsDocuments', {
            listeners: {
                add: this.onFormStateChange,
                datachanged: this.onFormStateChange,
                update: this.onFormStateChange,
                scope: this
            }
        });
        
        this.editSurface = Ext.create('Taco.view.site.page.EditSurface', {
            pageSrc: this.pageSrc,
            cmsDocs: this.cmsDocs,
            listeners: {
                edit: this.onEdit,
                scope: this
            }
        });
        this.actions = [
                {
                    xtype: 'secondarybutton',
                    text: 'Cancel',
                    eventName: 'cancel'
                }, {
                    xtype: 'dirtybutton',
                    text: 'Save',
                    eventName: 'save'
                }];

        this.tabs = [{
            layout: {
                type: 'fit'
            },
            items: [
                this.editSurface
            ]
        }];
        this.callParent(arguments);
        this.body.addCls('taco-site-editor');
      
    },
    initSaveTasks: function (chain) {
        var me = this;

        chain.addSyncStoreTask({
            key: 'cmsDocs',
            depends: [],
            store: me.cmsDocs
        });
       
        chain.add({
            key: 'dirtybtn',
            depends: [ 'cmsDocs'],
            fn: function (chn) {
                me.onFormStateChange();
                chn.callback();
            }
        });

        this.callParent(arguments);
    },
    cancel:function (){
        this.editSurface.navigate(this.pageSrc, true);
    },

    onEdit: function (value, props) {
        var me = this,
            key, doc, product;
        if (props.entityType != "cms") {
            return;
        }

        if (Ext.isObject(value)) {
            value = Ext.JSON.encode(value);
        }

        key = props.collection + '_' + props.documentId;
        if (props.isShadow) {
            doc = me.cmsDocs.findRecord('documentId', props.documentId);
        } else {
            doc = me.cmsDocs.getById(key);
        }

        if (doc === null) {
            doc = Ext.create('Taco.model.CmsDocument', {
                id: key,
                documentId: props.documentId,
                collectionName: props.collection,
                items: []
            });
            doc.editingInfo = props;
            me.cmsDocs.add(doc);
        }
        doc.setItem(props.fieldName, value);


    },
    
    isDirty: function () {
        return this.cmsDocs.getUpdatedRecords().length > 0;
   
    },
    onFormStateChange: function () {
        var isDirty = this.isDirty();
        if (this.dirtyButton) {
            this.dirtyButton.setDirty(isDirty);
        }
    },

    resetOriginalValues: function () {
        this.cmsDocs.rejectChanges();
    }
});