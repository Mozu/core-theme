/**
 * @author Travis Johnson
 * @class Taco.view.site.page.WidgetDropZone
 */


    Ext.define('Taco.view.site.page.WidgetDropZone', {
        extend: 'Ext.container.Container',
        iframeDropZoneEl: null,
        ddGroup: 'taco-widget-create',
        cls: 'taco-widget-dropzone',
        bubbleEvents: ['createwidget'],

        constructor: function () {
            this.callParent(arguments);

            this.addEvents('createwidget', 'removewidget');
        },

        afterRender: function () {
            var me = this;

            this.callParent(arguments);

            //            me.add({
            //                xtype: 'component',
            //                id: me.id + '-placeholder',
            //                cls: 'taco-reorderable-placeholder',
            //                html: 'placeholder',
            //                hidden: true
            //            });

            Ext.create('Ext.dd.DragZone', this.el, {
                ddGroup: me.ddGroup,

                getDragData: function (e) {
                    var sourceEl = e.getTarget('.taco-shim-widget', 10),
                    d;

                    if (!sourceEl) {
                        return;
                    }

                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    Ext.fly(d).addCls('widget-source');
                    return {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d,
                        widgetMetaData: Ext.getCmp(sourceEl.id).widgetMetaData
                    };
                },

                getRepairXY: function () {
                    return this.dragData.repairXY;
                }
            });

            Ext.create('Ext.dd.DropZone', this.el, {
                ddGroup: this.ddGroup,

                getTargetFromEvent: function (e) {
                    return e.getTarget('.' + me.cls);
                },
                onNodeEnter: function (nodeData, source, e, data) {
                    Ext.fly(nodeData).addCls('taco-widget-dropzone-hover');
                },
                onNodeOut: function (nodeData, source, e, data) {
                    Ext.fly(nodeData).removeCls('taco-widget-dropzone-hover');
                    //me.child('#' + me.id + '-placeholder').hide();
                },
                onNodeOver: function (nodeData, source, e, data) {
                    //                    me.child('#' + me.id + '-placeholder').show(null, function () {
                    //                        var ph = this.getEl();
                    //                        ph.setHTML(data.widgetData.previewHtml);
                    //                        ph.applyStyles({
                    //                            display: 'inline-block',
                    //                            height: '198' + 'px', // data.widgetData.minHeight
                    //                            width: '300' + 'px', // data.widgetData.minWidth,
                    //                            padding: '80px 40px',
                    //                            textAlign: 'center'
                    //                        });
                    //                    });

                    return Ext.dd.DropZone.prototype.dropAllowed;
                },
                onNodeDrop: function (nodeData, source, e, data) {
                    var dragOp = me.getDragOp(data, nodeData),
                        dropEvent = {
                            nodeData: nodeData,
                            source: source,
                            e: e,
                            data: data,
                            iframeDropZoneEl: me.iframeDropZoneEl,
                            droppedWidgetEl: me.dropWidget(data.widgetMetaData, data.widgetDefinition, dragOp),
                            droppedWidgetCmp: me.addWidgetToShim(data.widgetMetaData, data.widgetDefinition, dragOp),
                            dragOp: dragOp,
                            index: 0,
                            widgetDefinition: data.widgetDefinition || {},
                            widgetMetaData: data.widgetMetaData || {},
                            zoneData: Ext.decode(me.iframeDropZoneEl.getAttribute('data-editing-zone'))
                        },
                        cmpIdx;

                    console.log(dropEvent.dragOp);
                    if (dropEvent.dragOp == 'reorder') {
                    }
                    if (dropEvent.dragOp == 'move') {
                        me.removeWidget(dropEvent);
                    }
                    if (dropEvent.dragOp != 'reorder') {
                        me.fireEvent('createwidget', dropEvent);
                    }
                    return true;
                }
            });
        },

        alignToIframe: function () {
            var box = this.iframeDropZoneEl.getBox();

            this.getEl().setStyle({
                position: 'absolute',
                width: box.width + 'px',
                //height: box.height + 'px',
                height: 'auto',
                top: box.y + 'px',
                left: box.x + 'px'
            });
        },

        getDragOp: function (data, nodeData) {
            var op = 'move';

            if (data.sourceEl.id == '') {
                op = 'create';
            }
            else if (data.sourceEl.parentNode.id == nodeData.id) {
                op = 'reorder';
            }

            return op;
        },

        dropWidget: function (metaData, definition, op) {
            var element,
                el;

            if (op == 'reorder') {
                console.log('reorder detected in dropWidget');
                return false;
            }

            element = this.iframeDropZoneEl.dom.ownerDocument.createElement('div');
            element.innerHTML = definition.previewHtml ||  '<img src="/admin/scripts/Ext/resources/themes/images/default/grid/loading.gif" />';

            el = Ext.get(element);
            el.addCls('taco-widget-element');

            this.iframeDropZoneEl.appendChild(el);
            this.alignToIframe();

            return el;
        },

        addWidgetToShim: function (metaData, definition, op) {
            var cmp;

            if (op == 'reorder') {
                console.log('reorder detected in addWidgetToShim');
                return false;
            }

            cmp = Ext.create('Ext.Component', {
                xtype: 'component',
                cls: 'taco-shim-widget',
                html: definition.previewHtml || '<img src="/admin/scripts/Ext/resources/themes/images/default/grid/loading.gif" />',
                style: {
                    backgroundColor: '#CCF',
                    height: '198px',
                    width: '300px',
                    padding: '80px 40px',
                    textAlign: 'center'
                },
                widgetDefinition: definition,
                widgetMetaData: metaData,
                listeners: {
                    dblclick: function () { this.destroy(); },
                    element: 'el'
                }
            });

            this.alignToIframe();
            this.add(cmp);

            return cmp;
        },

        removeWidget: function (dropEvent) {
            var cmpIdx = Ext.Array.indexOf(Ext.getCmp(dropEvent.data.sourceEl.parentNode.id).items.keys, dropEvent.data.sourceEl.id);

            Ext.getCmp(dropEvent.data.sourceEl.parentNode.id).remove(dropEvent.data.sourceEl.id);
            console.log(dropEvent.iframeDropZoneEl.dom.children[cmpIdx]);

        }

    });
