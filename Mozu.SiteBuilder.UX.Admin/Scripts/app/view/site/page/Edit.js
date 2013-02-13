/**
 * @class Taco.view.site.page.Edit
 */
    Ext.define('Taco.view.site.page.Edit', {
        extend: 'Taco.core.ux.form.Editor',
        requires: ['Taco.view.site.page.EditSurface','Taco.view.site.CreateModal', 'Taco.view.site.Toolbox', 'Taco.view.site.page.dataViews.Blog', 'Taco.view.site.page.dataViews.Meta',
            'Taco.view.site.page.Creator', 'Taco.model.PageTypeDefinition', 'Taco.store.TempPages', 'Taco.store.CmsDocuments', 'Taco.core.EventChain',
            'Taco.view.site.page.entityAdapters.DocumentEntityAdapter',
            'Taco.view.site.page.entityAdapters.ProductEntityAdapter',
            'Taco.view.site.page.entityAdapters.CategoryEntityAdapter',
            'Taco.view.site.page.entityAdapters.ExternalLinkEntityAdapter',
            'Taco.view.product.edit.Inline',
            'Taco.view.site.navigation.ExternalLinkEditor',
            'Taco.core.ux.form.Form',
            'Taco.model.WidgetInstance',
            'Taco.store.WidgetInstances'
        ],
        alias: 'widget.inlineeditor',
        title: 'Page Editor',
        model: 'Taco.model.Product',
        // TODO
        type: 'product',

        initComponent: function () {

            var me = this;

            this.toolBox = Ext.create('Taco.view.site.Toolbox', {
                listeners: {
                    themechange: function () {
                        this.editSurface.iframe.getDoc().location.reload();
                    },
                    navigationchange: function (store, record) {
                      //  pants
                       // this.editSurface.iframe.getDoc().location.reload();
                    },
                    editlink: function (record, element) {
                        console.log('editlink');
                        this.createModal.loadLink(record, element, [0, -20]);
                    },
                    scope: this
                }
            });

            this.toolBar = Ext.create('Ext.toolbar.Toolbar', {
                margin: '3 0 0 0',
                getButton:function(key){
                   return  this.down('#'+key);
                },
                resetButtons:function()
                {
                    this.enableButtons( {
                        add:true,
                        copy:false,
                        preview:false,
                        settings:false,
                        hide:false,
                        destroy: false,
                        formView:false
                    });
                },
                enableButtons: function (config) {
                    Ext.Object.each(config, function(key, value){
                        this.getButton(key).setDisabled(!value);
                    },this);
                },
                listeners: {
                    added: function (me) {
                        me.resetButtons();
                    }
                },
                items: [
                    {
                        text: 'Edit in Form View',
                        itemId: 'formView',
                        handler: this.doFormView,
                        scope: this
                    },
                    {
                        xtype: 'tbseparator'
                    },
                    {
                        text: 'Add',
                        itemId:'add',
                        handler:this.createRecord,
                        scope:this
                    },
                    {
                        text: 'Copy',
                        itemId: 'copy',
                        handler:function(){alert('tbd')},
                        scope:this
                    },
                    {
                        text: 'Preview',
                        itemId: 'preview',
                        handler:this.viewPage,
                        scope:this
                    },
                    {
                        text: 'Info',
                        itemId: 'settings',
                        handler: this.settings,
                        scope:this
                    },
                    //{
                    //    text:'food',
                    //    handler: function () {
                    //        cbp = me.toolBox.down('#cardPanel');
                    //        fc = me.down('#newCardPanel');
                    //    }
                    //},
                    {
                        text: 'Hide',
                        itemId: 'hide',
                        enableToggle: true,
                        listeners: {
                            toggle: function (btn, pressed) {
                                this.adapter.setHidden(pressed);
                            },
                            scope: this
                        }
                    },
                    {
                        text: 'Delete',
                        itemId: 'destroy',
                        handler: this.deleteRecord,
                        scope:this
                    },
                    {
                        xtype:'tbseparator'
                    },
                    {
                        text: 'ToolBox',
                        itemId: 'toolBox',
                        enableToggle: true,
                        listeners: {
                            toggle: function (btn, pressed) {
                                this.toolBox[pressed ? 'show' : 'hide']();
                            },
                            scope: this
                        }
                        
                    }
             

                ]
            });

            this.widgets = new Ext.create('Taco.store.WidgetInstances', {
                listeners: {
                    add: this.onFormStateChange,
                    datachanged: this.onFormStateChange,
                    update: this.onFormStateChange,
                    scope: this
                }
            });
            window.pageEditor = this;
            this.cmsDocs = new Ext.create('Taco.store.CmsDocuments', {
                listeners: {
                    add: this.onFormStateChange,
                    datachanged: this.onFormStateChange,
                    update: this.onFormStateChange,
                    scope: this
                }
            });


            this.products = new Ext.create('Taco.store.Products', {
                listeners: {
                    add: this.onFormStateChange,
                    datachanged: this.onFormStateChange,
                    update: this.onFormStateChange,
                    scope: this
                }
            });
            this.categories = new Ext.create('Taco.store.Categories', {
                listeners: {
                    add: this.onFormStateChange,
                    datachanged: this.onFormStateChange,
                    update: this.onFormStateChange,
                    scope: this
                }
            });

            Taco.app.relayEvents( this.categories, ['update'], 'pageentity-');


            this.basic = Ext.create('Taco.view.site.page.EditSurface', {
                pageSrc: this.pageSrc,
                cmsDocs: this.cmsDocs,
                widgets: this.widgets,
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
            this.editSurface = this.basic;


            this.createModal = Ext.create('Taco.view.site.CreateModal', {
                editor: this
            });

            this.actions = [
                this.toolBar,
                {
                    xtype: 'secondarybutton',
                    text: 'Cancel',
                    eventName: 'cancel'
                }, {
                    xtype: 'dirtybutton',
                    text: 'Save',
                    eventName: 'save'
                }];

            this.cardStore = Ext.create('Ext.data.Store', {
                fields: ['index', 'title'],
                data: [
                    { 'index': 1, 'title': 'Pages' },
                    { 'index': 2, 'title': 'Widgets' },
                    { 'index': 3, 'title': 'Themes' },
                    { 'index': 4, 'title': 'Customize' }
                ]
            });

            this.tabs = [{
                title: 'Basic',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    this.basic,
                    {
                        xtype: 'container',
                        layout: 'fit',
                        width: 300,
                        items: []
                    }
                ]
            }];

            

            this.callParent(arguments);

            this.on('destroy', function (cmp) {
                cmp.toolBox.close();
            });

            this.pagesSelectField = this.down('#pagesSelectField');

            this.body.addCls('taco-site-editor');

            this.sideBar.on('boxready', function () {
                console.log('boxready', this);
            });
        },


        onFormStateChange: function () {
            var isDirty = this.isDirty();
            if (this.dirtyButton) {
                this.dirtyButton.setDirty(isDirty);
            }
            this.editSurface.setDirty(isDirty);
            if (isDirty) {
                this.toolBox.down('#navigationTree').disable();
            } else {
                this.toolBox.down('#navigationTree').enable();
            }

        },

        cancel: function () {
            this.cmsDocs.rejectChanges();
            this.categories.rejectChanges();
            this.products.rejectChanges();
            this.widgets.rejectChanges();
            this.navigateIframe( {
                suppressAddState:true,
                url:this.pageSrc
            });
        },

        isDirty: function () {
            return  this.widgets.getNewRecords().length > 0 ||
                    this.widgets.getUpdatedRecords().length > 0 ||
                    this.widgets.getRemovedRecords().length > 0 ||
                    this.cmsDocs.getNewRecords().length > 0 ||
                    this.cmsDocs.getUpdatedRecords().length > 0 ||
                    this.cmsDocs.getRemovedRecords().length > 0 ||
                    this.categories.getUpdatedRecords().length > 0 ||
                    this.products.getUpdatedRecords().length > 0;
   
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

            var cfg, initter, me = this,
                key, fn, editors, doc;

            this.toolBar.resetButtons();

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
            this.adapter.load();
            return;
        },

        getPageConfig: function () {
            return this.editSurface.documentData;
        },

        onBeforeEdit: function (e) {
            // TODO: ???
        },

        initSaveTasks: function (chain) {
            var me = this;

            chain.addSyncStoreTask({
                key: 'cmsDocs',
                depends: [],
                store: me.cmsDocs
            });
            chain.addSyncStoreTask({
                key: 'widgets',
                depends: [],
                store: me.widgets
            });
            chain.addSyncStoreTask({
                key: 'inlineProducts',
                depends: [],
                store: me.products
            });
            chain.addSyncStoreTask({
                key: 'inlineCategories',
                depends: [],
                store: me.categories
            });
            chain.add({
                key: 'dirtybtn',
                depends: ['inlineProducts', 'cmsDocs', 'widgets'],
                fn: function (chn) {
                    me.onFormStateChange();
                    chn.callback();
                }
            });

            this.callParent(arguments);
        },
        onEdit: function (value, props) {
            var me = this,
                key, doc, product;

            switch (props.entityType) {
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
                    configuration: dropEvent.configuration,
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
            //debugger;
            Ext.
            key = props.collection + '_' + props.documentId;
            if (props.isShadow) {s
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
                jsonData: {
                    definitionId: eventData.metaData.definitionId,
                    zoneId: eventData.metaData.zoneId,
                    pageContext: eventData.pageData.pageContext,
                    document: eventData.document.data
                },
                success: function (response) {
                    var jsonData = Ext.JSON.decode(response.responseText),
                        html;

                    // records = me.cmsDocs.add(jsonData.document);
                    // records[0].phantom = true;
                    me.onFormStateChange();
                    html = jsonData.output;
                    eventData.callback({
                        html: html
                    });
                    //                    var el = Ext.get(eventData.widget);
                    //                    Ext.DomHelper.insertHtml('afterEnd', el.dom, html);
                    //                    el.remove();
                }
            });

        },
        beforeDeleteWidget: function (eventData) {
            var me = this,
                props = eventData.metaData,
                key = props.collection + '_' + props.documentId,
                doc = me.cmsDocs.getById(key);


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
            me.cmsDocs.remove(doc);
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
                        continueFn();
                    },
                    autoShow: true
                });
                return false;

            }
        },
        viewPage: function (e) {
            window.open(this.editSurface.pageSrc, 'preview');

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
            this.createModal.show(this.toolBar.getButton('add'), 't-b');
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

            Ext.create('Taco.core.ux.modal.Helper', {
                form: {
                    editors: this.adapter.editors,
                    record: this.adapter.get()
                }
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
                    url:  newState.getUri().substring("sites".length ),
                    suppressAddState: true
                };
                md.navigateMetaData = md;
                
                if (md.nodeType == 'link') {

                    config = this.entityTypeEditConfig[md.nodeType];
                    this.adapter = Ext.create(config.adapter, {
                        metaData: md,
                        editor: this,
                        editors: config.editors,
                        listeners: {
                            destroy: function (record) { Taco.app.fireEvent('page-destroy', this.editor.pageSrc, record); },
                            load: function () { console.log('load', arguments); }
                        }
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

