/**
 * @class Taco.view.site.page.Edit
 */
Ext.define('Taco.view.site.page.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.site.page.EditSurface', 'Taco.view.site.CreateModal', 'Taco.view.site.Toolbox', 'Taco.view.site.page.dataViews.Blog', 'Taco.view.site.page.dataViews.Meta',
        'Taco.view.site.page.Creator', 'Taco.model.PageTypeDefinition', 'Taco.store.TempPages', 'Taco.store.CmsDocuments', 'Taco.core.EventChain',
        'Taco.view.site.page.entityAdapters.DocumentEntityAdapter',
        'Taco.view.site.page.entityAdapters.ProductEntityAdapter',
        'Taco.view.site.page.entityAdapters.CategoryEntityAdapter',
        'Taco.view.site.page.entityAdapters.ExternalLinkEntityAdapter',
        'Taco.view.site.navigation.ExternalLinkEditor',
        'Taco.core.ux.form.Form',
        'Taco.model.WidgetInstance',
        'Taco.store.WidgetInstances',
        'Taco.view.site.Toolbar'
    ],
    alias: 'widget.inlineeditor',

    cls: 'taco-site-editor',
    manageHeight: false,
    title: 'Page Editor',
    model: 'Taco.model.Product',
    // TODO
    type: 'product',
    enableStoreSyncTasks: true,

    reloadSurface: function() {
        this.editSurface.iframe.getDoc().location.reload();
    },

    initComponent: function () {
        var me = this;

        this.mon(Taco.core.StateManager, 'navigate', me.onNavigate, this);

       
        this.toolBox.on({
            themechange: function () {
                this.reloadSurface();
            }, 
            navigationchange: function (store, record) {
                //  pants
                // this.editSurface.iframe.getDoc().location.reload();
            },
            editlink: function (record, element) {
                console.log('editlink');
                //this.createModal.loadLink(record, element, [0, -20]);
            },
            scope: this
        });

       
        this.widgets = Ext.create('Taco.store.WidgetInstances', {
            listeners: {
                add: this.onFormStateChange,
                datachanged: this.onFormStateChange,
                update: this.onFormStateChange,
                scope: this
            }
        });

        this.widgetDefinitions = Taco.core.data.StoreManager.getOrCreate('Taco.store.WidgetDefinitions');

        window.pageEditor = this;
        this.cmsDocs = Ext.create('Taco.store.CmsDocuments', {
            listeners: {
                add: this.onFormStateChange,
                datachanged: this.onFormStateChange,
                update: this.onFormStateChange,
                scope: this
            }
        });


        this.products = Ext.create('Taco.store.Products', {
            listeners: {
                add: this.onFormStateChange,
                datachanged: this.onFormStateChange,
                update: this.onFormStateChange,
                scope: this
            }
        });
        this.categories = Taco.core.data.StoreManager.getOrCreate('Taco.store.Categories');

        this.mon(this.categories, {
            add: this.onFormStateChange,
            datachanged: this.onFormStateChange,
            update: this.onFormStateChange,
            scope: this
        });


        this.stores = [this.widgets, this.cmsDocs, this.products, this.categories];


        Taco.app.relayEvents(this.categories, ['update'], 'pageentity-');


        this.editSurface = Ext.create('Taco.view.site.page.EditSurface', {
            pageSrc: this.pageSrc,
            cmsDocs: this.cmsDocs,
            widgets: this.widgets,
            widgetDefinitions: this.widgetDefinitions,
            listeners: {
                documentload: this.onDocumentLoad,
                beforeedit: this.onBeforeEdit,
                edit: this.onEdit,
                beforenavigate: this.onBeforeNavigate,
                beforeIframeClickNavigate: this.navigateIframe,
                createwidget: this.beforeCreateWidget,
                movewidget: this.beforeMoveWidget,
                reorderwidget: this.beforeReorderWidget,
                deletewidget: this.beforeDeleteWidget,
                editwidget: this.onEditwidget,
                scope: this
            }
        });
        


        //this.createModal = Ext.create('Taco.view.site.CreateModal', {
        //    editor: this
        //});

        
        this.cardStore = Ext.create('Ext.data.Store', {
            fields: ['index', 'title'],
            data: [
                { 'index': 1, 'title': 'Pages' },
                { 'index': 2, 'title': 'Widgets' },
                { 'index': 3, 'title': 'Themes' },
                { 'index': 4, 'title': 'Customize' }
            ]
        });


        this.items = [
            this.editSurface
        ];
        
        this.callParent(arguments);

        this.pagesSelectField = this.down('#pagesSelectField');

        this.cmsDocumentDrafts = Taco.core.data.StoreManager.getOrCreate('Taco.store.CmsDocumentDrafts');
        //this.body.addCls('taco-site-editor');

        this.saveTasks.on('complete', me.reloadSurface, me);

    },
    publishAll:function() {
        this.cmsDocumentDrafts.publishAll('All');
    },
    isEdit:function() {
        return true;
    },
    onFormStateChange: function () {
        
        var isDirty = this.isDirty();
        if (this.dirtyButton) {
            this.dirtyButton.setDirty(isDirty);
        }
        

        this.editSurface.setDirty(isDirty);

        if (isDirty) {
            this.toolBox.navigation.disable();
        } else {
            this.toolBox.navigation.enable();
        }

    },

    cancel: function () {
        this.cmsDocs.rejectChanges();
        this.categories.rejectChanges();
        this.products.rejectChanges();
        this.widgets.rejectChanges();
        this.navigateIframe({
            suppressAddState: true,
            url: this.pageSrc
        });
    },

    isDirty: function () {
        return this.widgets.isDirty() ||
            this.cmsDocs.isDirty() ||
            this.categories.isDirty() ||
            this.products.isDirty() ||
            ( this.adapter && this.adapter.isDirty());
    },

    entityTypeEditConfig: {
        blog: {
            editors: ["Taco.view.site.page.dataViews.Blog", "Taco.view.site.page.dataViews.Meta"],
            adapter: 'Taco.view.site.page.entityAdapters.DocumentEntityAdapter'
        },
        "default": {
            editors: ["Taco.view.site.page.dataViews.Meta"],
            adapter: 'Taco.view.site.page.entityAdapters.DocumentEntityAdapter'
        },
        category: {
            editors: ["Taco.view.category.Basic"],
            adapter: 'Taco.view.site.page.entityAdapters.CategoryEntityAdapter'
        },
        product: {
            editors: ["Taco.view.product.edit.Inline"],
            adapter: 'Taco.view.site.page.entityAdapters.ProductEntityAdapter'
        },
        link: {
            editors: [],
            adapter: 'Taco.view.site.page.entityAdapters.ExternalLinkEntityAdapter'
        }
    },



    onDocumentLoad: function (e, d) {

        var cfg, me = this,
            key, fn, editors, doc;


        if (!d || !d.pageContext) {
            return;
        }



        cfg = me.entityTypeEditConfig[d.pageContext.pageType] || me.entityTypeEditConfig["default"];
        this.adapter = Ext.create(cfg.adapter, {
            pageProps: d,
            editor: this,
            editors: cfg.editors,
            listeners: {
                destroy: function (record) { Taco.app.fireEvent('page-destroy', me.pageSrc, record); },
                load: function () { console.log('load', arguments); }
            }
        });

        this.adapter.on('load', function () {
            this.toolBar.populate(this.adapter);

            this.toolBox.populate(this.adapter);

            this.toolBox.enableTabs();
        }, this);

        this.adapter.load();

    },

    getPageConfig: function () {
        return this.editSurface.documentData;
    },

    onBeforeEdit: function (e) {
        // TODO: ???
    },
    
    addChildSaveTasks: function (tasks) {
        this.callParent(arguments);
        if (this.adapter) {
            this.adapter.addSaveTasks(tasks);
        }
        return tasks;
    },
    
    
    //initSaveTasks: function (chain) {
    //    var me = this;

    //    chain.addSyncStoreTask({
    //        key: 'cmsDocs',
    //        depends: [],
    //        store: me.cmsDocs
    //    });
    //    chain.addSyncStoreTask({
    //        key: 'widgets',
    //        depends: [],
    //        store: me.widgets
    //    });
    //    chain.addSyncStoreTask({
    //        key: 'inlineProducts',
    //        depends: [],
    //        store: me.products
    //    });
    //    chain.addSyncStoreTask({
    //        key: 'inlineCategories',
    //        depends: [],
    //        store: me.categories
    //    });
    //    chain.add({
    //        key: 'dirtybtn',
    //        depends: ['inlineProducts', 'cmsDocs', 'widgets'],
    //        fn: function (chn) {
    //            me.onFormStateChange();
    //            chn.callback();
    //        }
    //    });
        
        
        
        


    //    this.callParent(arguments);
    //},
    


    onEdit: function (value, props) {
        var me = this,
            key, doc, product, widget, parts, widgetConfig;

        switch (props.entityType) {
            case "widget":
                widget = this.widgets.getById(props.id);
                parts = props.fieldName.split('.');
                if (parts.length > 1) {
                    Ext.raise('tbd');
                }
                //widgetConfig = Ext.apply({}, widget.get('config') || {});
                widgetConfig = widget.get('config') || {};
                widgetConfig[props.fieldName] = value;
                widget.set('config', widgetConfig);
                break;
            case "cms":
                if (Ext.isObject(value)) {
                    value = Ext.JSON.encode(value);
                }

                key = props.collection + '_' + props.documentId;
                if (props.isShadow) {
                    doc = me.cmsDocs.findRecord('documentId', props.documentId);
                }
                else {
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
                break;

            case "product":
                key = props.productCode;
                product = me.products.getById(key);
                if (product === null) {
                    Ext.ModelManager.getModel(me.model).load(key, {
                        success: function (record) {
                            product = me.products.getById(key) || record;

                            product.editingInfo = props;
                            product.set(props.fieldName, value);
                            if (!me.products.getById(key)) {
                                me.products.add(product);
                            }

                        },
                        failure: function () {

                        }
                    });
                }
                else {
                    product.set(props.fieldName, value);

                }
                break;
            case "category":
                key = props.id;
                cat = me.categories.getById(key);
                if (cat === null) {
                    Ext.ModelManager.getModel("Taco.model.Category").load(key, {
                        success: function (record) {
                            cat = me.categories.getById(key) || record;

                            cat.editingInfo = props;
                            cat.set(props.fieldName, value);
                            if (!me.categories.getById(key)) {
                                me.categories.add(cat);
                            }

                        },
                        failure: function () {

                        }
                    });
                }
                else {
                    cat.set(props.fieldName, value);

                }
                break;

        }


        console.log(arguments);
        // TODO: Add/update the record in the store
    },
    beforeCreateWidget: function (dropEvent) {
        var me = this,
            createView;
        if (dropEvent.widgetDefinition.createView) {

            createView = Ext.create(dropEvent.widgetDefinition.createView, {
                createData: dropEvent,
                listeners: {
                    complete: function () {
                        createView.hide();
                        me.onCreateWidget(dropEvent);
                    },
                    scope: me
                }
            });
            createView.show();
        }
        else {
            me.onCreateWidget(dropEvent);
        }

    },
    onCreateWidget: function (dropEvent) {
        var me = this,
            html, records, jsonData;

        dropEvent.document = dropEvent.document || {
            items: []
        };

        dropEvent.document.items.push({
            key: "widget_sequence",
            value: dropEvent.index
        });
        Ext.Ajax.request({
            url: '/Widgets/preview',
            jsonData: {
                definitionId: dropEvent.widgetDefinition.id,
                zoneId: dropEvent.zoneData.zoneId,
                zoneScope: dropEvent.zoneData.zoneScope,
                context: dropEvent.pageData.pageContext.cms,
                config: dropEvent.widgetDefinition.defaultConfig,
                index: dropEvent.index
            },
            success: function (response) {
                jsonData = Ext.JSON.decode(response.responseText);

                records = me.widgets.add(jsonData);
                records[0].phantom = true;
                me.onFormStateChange();
                html = jsonData.output;
                dropEvent.callback({
                    html: html
                });

            }
        });

    },

    beforeMoveWidget: function (dropEvent) {
        var me = this,
            props = dropEvent.widgetMetaData,
            doc, key;

        dropEvent.callback();
      
        Ext.
        key = props.collection + '_' + props.documentId;
        if (props.isShadow) {
            doc = me.cmsDocs.findRecord('documentId', props.documentId);
        }
        else {
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


        doc.setItem('widget_zone', dropEvent.zoneData.zoneId);
        doc.setItem('widget_sequence', dropEvent.index);

        props.sequence = dropEvent.index;
        me.syncMetaData(dropEvent.droppedWidgetEl, props);

    },
    syncMetaData: function (el, config) {
        var attName = el.getAttribute('data-editing-zone') ? 'data-editing-zone' : el.getAttribute('data-editing-element') ? 'data-editing-element' : 'data-editing-widget',
            elConfig = Ext.decode(el.getAttribute(attName));
        elConfig = Ext.apply(elConfig, config);
        el.dom.setAttribute(attName, Ext.encode(elConfig));
    },

    beforeReorderWidget: function (dropEvent) {
        var me = this,
            props = dropEvent.widgetMetaData,
            editProps;
        //todo:   move out of edit.
        dropEvent.droppedWidgetEl.insertBefore(dropEvent.target.associatedEl);

        props.sequence = dropEvent.index;
        editProps = {
            entityType: 'cms',
            collection: props.collection,
            documentId: props.documentId,
            fieldName: 'widget_sequence'
        };
        if (editProps.documentId) {
            me.onEdit(props.sequence, editProps);
        }
        me.syncMetaData(dropEvent.droppedWidgetEl, props);


        //underpants
        dropEvent.callback();
    },
    onEditwidget: function (eventData) {
        var me = this,
            doc = eventData.document;

        Ext.Ajax.request({
            url: '/Widgets/preview',
            jsonData: eventData.model.data,
            success: function (response) {
                jsonData = Ext.JSON.decode(response.responseText);
                html = jsonData.output;
                me.onFormStateChange();
                html = jsonData.output;
                eventData.callback({
                    html: html
                });


            }
        });



    },
    beforeDeleteWidget: function (eventData) {
        this.widgets.remove(this.widgets.getById(eventData.metaData.id));
        eventData.callback();
    },

    // Change this to onBeforeDocumentLoad?
    onBeforeNavigate: function (uriOrState, continueFn) {
        var me = this,
            confirm;
        if (this.isDirty()) {
            confirm = Ext.create('Taco.core.ux.modal.Confirmation', {
                text: 'You have unsaved changes.<br><br>Would you like to continue and discard these changes?',
                confirm: function () {
                    confirm.hide();
                    me.cmsDocs.removeAll();
                    me.products.removeAll();
                    me.editSurface.setDirty(false);
                    me.adapter.unload();
                    continueFn();
                },
                autoShow: true
            });
            return false;

        }

        this.toolBox.disableTabs();
        
    },
    viewPage: function (e) {
        window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent(this.editSurface.pageSrc), 'taco-preview');
    },
    getPageTypeStore: function () {
        if (!this.pageTypeStore) {
            this.pageTypeStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.PageTypeDefinition'
            });
        }
        return this.pageTypeStore;
    },
    deleteRecord: function (e) {
        this.adapter.deleteRecord();

    },

    createRecord: function () {
        //this.createModal.show(this.toolBar.getButton('add'), 't-b');
    },

    doFormView: function () {
        this.adapter.doFormView();
    },

    createPage: function (e) {
        var me = this,
            modal = Ext.create('Taco.core.ux.modal.Content', {
                autoShow: true,
                content: {
                    items: [{
                        xtype: 'pagecreator',
                        pageTypeStore: me.getPageTypeStore(),
                        listeners: {
                            documentcreated: function (model) {
                                var config = {};
                                //todo push url back into cmsdocapi model
                                if (model.get('collectionName') === 'pages') {
                                    config.url = "/pages/" + model.get('name');
                                }
                                if (model.getItem('page_type_definition') === 'blog') {
                                    config.url = "/blogs";
                                }
                                if (model.getItem('page_type_definition') === 'post') {
                                    config.url = "/blogs/" + model.get('name');
                                }

                                me.navigateIframe(config);
                                modal.hide();

                            },
                            close: function () {
                                modal.hide();
                            }
                        }
                    }]
                }
            });

        // TODO: Tell the Edit Surface to navigate to the newly created page
    },

    settings: function () {
        var form, editors = [], record = this.adapter.get(), modal = null;
        Ext.each(this.adapter.editors, function (cls) {
            editors.push(Ext.create(cls, {
                record: record
            }));
        });

        form = Ext.create('Taco.core.ux.form.Form',
            {
                items: editors,
                record: record,
                width: 600
            });
        form.add({
            xtype: 'button',
            handler: function () {
                form.update();
                modal.hide();
            },
            text: 'DONE'
        });


        modal = Ext.create('Taco.core.ux.modal.Modal', {
            items: form,
            autoShow: true
        });

    },

    navigateIframe: function (config) {
        var me = this;
        if (!config.url) {
            return;
        }
        this.toolBar.resetButtons();

        if (!config.suppressAddState) {
            Taco.core.StateManager.addState('sites' + config.url);
        }
        me.pageSrc = config.url;
        me.editSurface.navigate(config.url);
        Taco.app.fireEvent('page-navigate', config.url);

    },

    onNavigate: function (newState) {
        // navigation events that i can totes handle include:
        var config, md = newState.getMetaData();

        if (md.controller && md.controller === "sites") {

            config = {
                url: newState.getUri().substring(newState.getUri().indexOf('sites/') + 'sites'.length),
                //url:  newState.getUri().substring("sites".length ),
                suppressAddState: true
            };
            md.navigateMetaData = md;

            if (md.nodeType == 'link') {

                config = this.entityTypeEditConfig[md.nodeType];
                this.adapter = Ext.create(config.adapter, {
                    metaData: md,
                    editor: this,
                    editors: config.editors
                   
                });
                this.adapter.load();
                return false;

            }
            else {
                this.navigateIframe(config);
            }


            return false;
        }
    }
});

