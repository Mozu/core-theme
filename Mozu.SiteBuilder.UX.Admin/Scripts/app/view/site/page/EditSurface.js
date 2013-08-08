/**
* @class Taco.view.site.page.EditSurface
* @extends Ext.container.Container
* @requires Ext.ux.IFrame
* @requires Taco.view.site.page.inlineeditors.InlineHtml
* @requires Taco.view.site.page.inlineeditors.InlineText
* @requires Taco.view.site.page.inlineeditors.InlineTags
* @requires Taco.view.site.page.inlineeditors.InlineImage
* @requires Taco.view.site.page.Shim

* @xtype editsurface
* @author James Zetlen
* The iframe-based storefront inline editor.
*/



    var newSequentialEditingId = (function () {
        var editingIds = 0,
            prefix = "editing-";
        return function () { return prefix + editingIds++; };
    } ());

    var isComponentChild = function (elm, extComponent) {
        do {
            if (!elm) {
                return false;
            }
            if (!elm.id) {
                continue;
            }
            if (elm.id.indexOf(extComponent.id) !== -1) { return true; }
        } while (elm = elm.parentNode);
        return false;
    };

    Ext.define('Taco.view.site.page.EditSurface', {
        extend: 'Ext.container.Container',
        alias: 'widget.editsurface',
        requires: [
            'Ext.ux.IFrame',
            'Taco.view.site.page.inlineeditors.InlineHtml',
            'Taco.view.site.page.inlineeditors.InlineText',
            'Taco.view.site.page.inlineeditors.InlineTags',
            'Taco.view.site.page.Shim', 'Taco.view.site.page.inlineeditors.InlineImage'
            ],

        items: [],

        statics: {
            getDocHeight: function (doc) {
                return Math.max(
                    doc.body.scrollHeight,
                    doc.body.offsetHeight,
                    doc.body.clientHeight,
                    doc.documentElement.scrollHeight,
                    doc.documentElement.offsetHeight,
                    doc.documentElement.clientHeight
                );
            },

            getDocWidth: function (doc) {
                return Math.max(
                    doc.body.scrollWidth,
                    doc.body.offsetWidth,
                    doc.body.clientWidth,
                    doc.documentElement.scrollWidth,
                    doc.documentElement.offsetWidth,
                    doc.documentElement.clientWidth
                );
            }
        },

        initComponent: function () {
            var me = this,
                iframe = this.iframe = Ext.create('Ext.ux.IFrame', {
                    cls: Taco.baseCSSPrefix + 'document-frame',
                    src: this.getPageSrc(),
                    width: 800,
                    listeners: {
                        load: {
                            fn: this.onIframeLoad,
                            scope: this
                        }
                    }
                });

            this.items = [this.iframe];

            this.callParent(arguments);

            this.activeEditors = {};



        

            this.shim = Ext.create('Taco.view.site.page.Shim', {
                iframe: this.iframe,
                listeners: {
                    begineditelement: {
                        fn: this.onBeginEditElement,
                        scope: this
                    },
                    createwidget: {
                        fn: function (dropEvent) {
                          //  console.log('es-createwidget');
                            var me = this;
                            dropEvent = Ext.clone(dropEvent);
                            dropEvent.callback = function () {
                               // console.log('es-dropEventcb-createwidget');
                                me.shim.createWidgetCallback().apply(dropEvent, arguments);
                              //  me.onRecalcShim();
                            };
                            dropEvent.pageData = this.documentData;
                            this.fireEvent('createwidget', dropEvent);
                            return false;
                        },
                        scope: this
                    },
                    aftercreatewidget: {
                        fn: function (data, surface, newEl) {
                           // console.log('b-aftercreatewidget');
                            
                            

                            var eventData = {
                                hint: {},
                                widget: newEl,
                                pageData: this.documentData
                            };
                            eventData.metaData = Ext.decode(eventData.widget.getAttribute('data-editing-widget'));
                            eventData.widgetDefinition = me.widgetDefinitions.getById(eventData.metaData.definitionId);
                            eventData.callback = function (config) {
                                var el = Ext.get(eventData.widget);
                                Ext.DomHelper.insertHtml('afterEnd', el.dom, config.html);
                                el.remove();
                                me.onRecalcShim();
                            };

                         
                            
                            eventData.widgetDefinition = me.widgetDefinitions.getById(eventData.metaData.definitionId);

                            if (eventData.widgetDefinition && eventData.widgetDefinition.get('editView')) {//}eventData.metaData.editView) {
                                me.createWidgetEditor(eventData);
                            } else {
                                this.onRecalcShim();
                            }



                           
                            //console.log('e-aftercreatewidget');
                            return false;
                            
                        },
                        scope: this
                    },
                    movewidget: {
                        fn: function (dropEvent) {
                            dropEvent = Ext.clone(dropEvent);
                            dropEvent.pageData = this.documentData;
                            dropEvent.callback = this.shim.moveWidgetCallback();
                            this.fireEvent('movewidget', dropEvent);
                            return false;
                        },
                        scope: this
                    },
                    aftermovewidget: {
                        fn: this.onRecalcShim,
                        scope: this
                    },
                    reorderwidget: {
                        fn: function (dropEvent) {
                            dropEvent = Ext.clone(dropEvent);
                            dropEvent.callback = this.shim.reorderWidgetCallback();
                            dropEvent.pageData = this.documentData;
                            this.fireEvent('reorderwidget', dropEvent);
                            return false;
                        },
                        scope: this
                    },
                    afterreorderwidget: {
                        fn: this.onRecalcShim,
                        scope: this
                    },
                    editwidget: {
                        fn: function (hint) {
                            var eventData = {
                                hint: hint,
                                widget: Ext.getDom(hint.associatedEl),
                                pageData: this.documentData
                            }, widgetDev;
                            
                            eventData.metaData = Ext.decode(eventData.widget.getAttribute('data-editing-widget'));
                            eventData.callback = function (config){
                                var el = Ext.get(eventData.widget);
                                Ext.DomHelper.insertHtml('afterEnd', el.dom, config.html);
                                el.remove();
                                me.onRecalcShim();
                            };
                            eventData.widgetDefinition = me.widgetDefinitions.getById(eventData.metaData.definitionId);
                            
                            if (eventData.widgetDefinition && eventData.widgetDefinition.get('editView')){//}eventData.metaData.editView) {
                                me.createWidgetEditor(eventData);
                            }
                            
                            return false;
                        },
                        scope: this
                    },
                    aftereditwidget: {
                    },
                    deletewidget: {
                        fn: function (hint) {
                            var eventData = {
                                hint: hint,
                                widget: Ext.getDom(hint.associatedEl)
                            };
                            eventData.metaData = Ext.decode(eventData.widget.getAttribute('data-editing-widget'));

                            eventData.callback = this.shim.deleteWidgetCallback();
                            this.fireEvent('deletewidget', eventData);
                            return false;
                        },
                        scope: this
                    },
                    afterdeletewidget: {
                        fn: this.onRecalcShim,
                        scope: this
                    }
                }
            });

            this.add(this.shim);
            this.on({
                edit: {
                    fn: this.onRecalcShim,
                    scope: this
                },
                afterrender: {
                    fn:function(){
                        if (!this.firstIframeLoad) {
                            this.setLoading({ useMsg: false });
                        }
                    },
                    scope:this
                }
               
            });
        },

        onBeginEditElement: function (hint, associatedEl) {
            var me = this,
                metaData = Ext.JSON.decode(associatedEl.getAttribute('data-editing-element'));

            if (this.editCmp && !this.editCmp.isDestroyed) {
                this.editCmp.attemptCompleteEdit();
                this.editCmp.destroyEditor();

            }


            this.editCmp = this.createEditor(associatedEl, metaData);

            if (!this.editCmp.isWindow) {
                this.add(this.editCmp);
            }



        },

        editorConfigs: {
            text: { editor: 'Taco.view.site.page.inlineeditors.InlineText', additionalConfig: {} },
            html: { editor: 'Taco.view.site.page.inlineeditors.InlineHtml', additionalConfig: {} },
            image: { editor: 'Taco.view.site.page.inlineeditors.InlineImage', additionalConfig: { isWindow: true} },
            productImage: { editor: 'Taco.view.site.page.inlineeditors.InlineImage', additionalConfig: { isWindow: true , setDimensions:false} },
            'text-repeating': { editor: 'Taco.view.site.page.inlineeditors.InlineTags' }
        },


        createWidgetEditor: function (eventData ) {
            var me = this,
            editor,
            widgetEditorCls,
                widgetEditorConfig,
            widgetModel;
            if (!me.widgets) {
                return;
            }
            widgetModel = me.widgets.getById(eventData.metaData.id);
            if (!widgetModel) {
                me.widgets.loadData([eventData.metaData], true);
                widgetModel = me.widgets.getById(eventData.metaData.id);
            }
            //todo    allow for complex json def;
            widgetEditorCls = eventData.widgetDefinition.get('editView');
            widgetEditorConfig = Ext.apply({}, eventData.widgetDefinition.get('editViewConfig'));
            
            widgetEditorConfig.fields = widgetEditorConfig.fields ||  Ext.clone(eventData.widgetDefinition.get('editViewFields'));
           
            eventData.model = widgetModel;
            widgetEditorConfig = Ext.apply(widgetEditorConfig, {
                title: eventData.widgetDefinition.get('displayName'),
                widgetEditData: eventData,
                metaData: eventData.metaData,
                autoShow: true
            });

            editor = Ext.create(widgetEditorCls, widgetEditorConfig);
            editor.on(
                {
                    aftersave: function() {
                        //console.log('aftersave');
                        this.fireEvent('editwidget', eventData);
                        //editor.destroyEditor();
                        this.resizeIframe();
                    },
                    cancel: function() {
                       // console.log('cancel it');
                        me.fireEvent('cancelwidgetedit', eventData);
                    },
                    scope: me
                }
            );

        },

        createEditor: function (editableElement, metaData) {

            var me = this,
                fieldType = metaData.fieldType || 'text',
                //processor = Ext.create('Taco.view.site.page.FieldNodeProcessor', { fieldType: metaData.fieldType, dom: editableElement ? editableElement.dom : null }),
                editorConfig = this.editorConfigs[fieldType],
                editor = Ext.create(editorConfig.editor, Ext.apply(
                    {
                        editableElement: editableElement,
                        metaData: metaData,
                        //processor: processor,
                        editSurfaceParent: me,
                        style:{
                            zIndex:102
                        },
                        destroyEditor: function () {
                            if (editor.isDestroyed || editor.isGracefullDestroying || editor.destroyingEditor) {
                                return;
                            }
                            editor.destroyingEditor = true;

                            if (editor.gracefullDestroy) {
                                editor.isGracefullDestroying = true;
                                editor.gracefullDestroy();
                            } else {
                                editor.destroy();
                            }

                        },
                        sizingBox: editableElement.getBox(),
                        listeners: {
                            complete: function (val, md, ed) {
                                me.fireEvent('edit', val, md, me.documentData);
                                editor.destroyEditor();
                                //this.resizeIframe();
                            },
                            cancel: function (ed) {
                                me.fireEvent('cancel', arguments);
                                editor.destroyEditor();
                            },
                            scope: me
                        }
                    }, editorConfig.additionalConfig));


            return editor;
        },

        onRecalcShim: function () {
           
            var me = this;
            Ext.Function.defer(function () {
                console.log('onRecalcShim');
                var isVis = me.shim.isVisible();
                var doc = this.iframe.getDoc();
                me.shim.show();
                if ( !doc ){
                   console.log ( 'try again');
                   return;
                }
                
                
                me.resizeIframe();
                me.shim.load(me.onlyThomCanMakeATree());
                if (!isVis) {
                    me.shim.hide();
                }
            }, 1, me);

        },

        setDirty: function(dirty) {
            if ( this.iframe && this.iframe.getWin()){
                this.iframe.getWin().onbeforeunload = dirty ? function() {
                    return "You have unsaved changes. Leave this page anyway?";
                } : null;
            }
        },

        onIframeLoad: function () {
            var me = this,
                height= this.up('contentbody').getHeight() -100;

                //used for race condition in loader
            this.firstIframeLoad = true;
            window.clearInterval(this.resizeInterval);

            this.setLoading(false);
            this.onRecalcShim();
            //  this.shim.load(this.onlyThomCanMakeATree());
            this.bindMetadata();

            this.iframe.setWidth(980);
            this.iframe.setHeight(height);

            // this.iframe.getEl().down('iframe').setStyle({
            //     padding: '20px'
            // });
            //  this.resizeIframe();

            Ext.EventManager.on(Ext.getDoc(), 'click', this.onClickAway, this);
            Ext.EventManager.on(this.iframe.getDoc(), 'click', function (e, target, eOpts){
                if ( target.hostname == this.iframe.getWin().location.hostname) {
                    me.fireEvent('beforeIframeClickNavigate', { url: target.pathname + target.search });
                    e.stopEvent();
                } 
                
                
                }, this, {
                delegate: 'a'
                });

            this.fireEvent ('documentload', this, this.documentData );
            
        },
        getPageSrc: function () {
            pageSrc = (this.pageSrc || '/').toLowerCase();

            if (pageSrc.indexOf('iseditmode=true') == -1) {
                if (pageSrc.indexOf('?') == -1) {
                    pageSrc += '?';
                } else {
                    pageSrc += '&';
                }
                pageSrc += 'iseditmode=true';
            }
            return pageSrc;
            //"?isEditMode=true"
        },
        onClickAway: function (e, elm) {



            if (!this.editCmp || this.editCmp.isDestroyed) {
                return;
            }


            if (!e.within(this.editCmp.el) && !isComponentChild(elm, this.editCmp.el)) {
                if (this.editCmp.beforeCompleteEdit(e, elm)) {
                    this.editCmp.attemptCompleteEdit(e, elm);
                    this.editCmp.destroyEditor(e, elm);
                    this.editCmp = null;
                }
            }
        },

        resizeIframe: function () {

            var doc = this.iframe.getDoc(),
                height,
                width = this.statics().getDocWidth(doc) + 47 - 47;

            this.iframe.setWidth(width);

            height = this.statics().getDocHeight(doc) + 42 - 42;

            this.iframe.setHeight(height);

            // var deltaWidth = width - this.lastWidth;
            // var deltaHeight = height - this.lastHeight;
            // console.log('iframe ('+width+', '+height+'), (' + this.lastWidth + ', ' + this.lastHeight +'), (' + deltaWidth + ', ' + deltaHeight + ')');
            //             
            // this.lastWidth = width;
            // this.lastHeight = height;

            // this.secondLoad = true;
        },

        bindMetadata: function () {
            var doc = this.iframe.getDoc(),
                widgetNodelList = doc.querySelectorAll('[data-editing-widget]'),
                widgetRawArray = [];
            
            this.documentData = Ext.decode(Ext.get(doc.body).getAttribute('data-editing-document'));
            Ext.each(widgetNodelList, function (item) { widgetRawArray.push(JSON.parse(item.getAttribute('data-editing-widget'))); });
            this.widgets.loadData(widgetRawArray);
        },



        navigate: function (newSrc, skipEvents) {
            var me = this;
            if (!skipEvents && me.fireEvent('beforenavigate', newSrc, function () { me.navigate(newSrc, true); }) === false) {
                return;
            }
            this.pageSrc = newSrc;
            //   this.shim.destroy();
            this.setLoading({useMsg:false});
            this.iframe.iframeEl.set({ src: this.getPageSrc() });
        },

        onlyThomCanMakeATree: function () {
            var iframeEl = this.iframe.iframeEl,
                tdoc = Ext.get(iframeEl.dom.contentDocument.documentElement),
                treeProcessor = {
                    query: '[data-editing-widget], [data-editing-zone], [data-editing-element]',
                    tree: {
                        branches: [],
                        items: []
                    },
                    init: function (doc) {
                        var me = this,
                        rawItems = doc.select(me.query).elements;
                        Ext.Array.each(rawItems, function (node) {
                            me.tree.items.push({ node: Ext.get(node) });
                        });

                    },
                    processTree: function () {
                        var me = this;
                        Ext.Array.each(me.tree.items, function (item) {
                            me.processBranch(item);

                        });
                    },
                    processBranch: function (branch) {
                        var me = this,
                        parentBranch,
                        parent;
                        branch.node.findParent2 = me.findParent2;
                        parent = branch.node.findParent2();
                        if (parent) {
                            parentBranch = me.toBranch(parent);
                            parentBranch.branches.push(branch);
                        }
                        else {
                            me.tree.branches.push(branch);
                        }

                    },
                    toBranch: function (dom) {
                        var me = this,
                            branch = null;
                        Ext.Array.each(me.tree.items, function (item) {
                            if (item.node.dom === dom) {
                                branch = item;
                                if (!item.branches) {
                                    item.branches = [];
                                }
                                return false;
                            }
                        });
                        return branch;
                    },
                    findParent2: function (simpleSelector, limit, returnEl) {
                        var target = this.dom.parentNode,
                            topmost = document.documentElement,
                            depth = 0,
                            stopEl;

                        limit = limit || 50;
                        if (isNaN(limit)) {
                            stopEl = Ext.getDom(limit);
                            limit = Number.MAX_VALUE;
                        }
                        while (target && target.nodeType == 1 && depth < limit && target != topmost && target !== stopEl) {
                            if (Ext.DomQuery.is(target, '[data-editing-widget]') || Ext.DomQuery.is(target, '[data-editing-zone]')) {
                                return returnEl ? Ext.get(target) : target;
                            }
                            depth++;
                            target = target.parentNode;
                        }
                        return null;
                    }


                };
            treeProcessor.init(tdoc);
            treeProcessor.processTree();
            return treeProcessor.tree;
        },

        jamesCanMakeABetterTreeThanThom: function () {
            return document.createTreeWalker(
                this.iframe.getBody(),
                NodeFilter.SHOW_ELEMENT,
                {
                    acceptNode: function (node) {
                        if (node.hasAttribute('data-editing-widget') || node.hasAttribute('data-editing-element') || node.hasAttribute('data-editing-zone')) {
                            return NodeFilter.FILTER_ACCEPT;
                        } else {
                            return NodeFilter.FILTER_SKIP;
                        }
                    }
                },
                true
            );
    }
    });
