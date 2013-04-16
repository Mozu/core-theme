/**
 * @class Taco.view.site.page.hint.Zone
 * Hint for drop zones used for inline editing
 */
Ext.define('Taco.view.site.page.hint.Zone', {
    extend: 'Taco.view.site.page.hint.Hint',
    alias: 'widget.tacohintzone',
    type: 'zone',
    hintCls: 'taco-hint-zone',
    ddGroup: 'taco-widget-create',
    cls: 'taco-widget-dropzone',
    bubbleEvents: [
        'createwidget',
        'movewidget',
        'reorderwidget'
    ],

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            afterrender: {
                fn: this.createDragDropZones,
                scope: this
            }
        });
    },

    createDragDropZones: function () {
        var me = this;

        Ext.create('Ext.dd.DragZone', this.el, {
            ddGroup: me.ddGroup,

            onBeforeDrag: function (data, e) {
                // The drag handle is a disabled action (a.taco-action) with no handler.
                // Disabled actions receive a mask (div.x-mask) that causes the event to skip the underlying action.
                // Here we check if the mousedown occurred on the mask, if its parent is a handle, and coerce the result to a boolean.
                return !!(e.target.className === 'x-mask' && Ext.fly(e.getTarget('.x-mask')).findParent('.taco-widgethandle', 2, true).hasCls('taco-widgethandle'));
            },

            getDragData: function (e) {
                var sourceEl = e.getTarget('.taco-hint-widget', 10),
                d,
                dom;

                if (!sourceEl) {
                    return;
                }

                d = sourceEl.cloneNode(true);
                d.id = Ext.id();
                dom = Ext.getDom(Ext.getCmp(sourceEl.id).associatedEl);
                return {
                    sourceEl: sourceEl,
                    repairXY: Ext.fly(sourceEl).getXY(),
                    ddel: d,
                    dropWidget: dom,
                    widgetMetaData: Ext.decode(dom.getAttribute('data-editing-widget'))


                };
            },

            getRepairXY: function () {
                return this.dragData.repairXY;
            }
        });

        Ext.create('Ext.dd.DropZone', this.el, {
            ddGroup: me.ddGroup,

            getTargetFromEvent: function (e) {
                return e.getTarget('.taco-widget-dropzone');
            },
            onNodeEnter: function (nodeData, source, e, data) {
                Ext.fly(nodeData).addCls('taco-widget-dropzone-hover');
            },
            onNodeOut: function (nodeData, source, e, data) {
                Ext.fly(nodeData).removeCls('taco-widget-dropzone-hover');
            },
            onNodeOver: function (nodeData, source, e, data) {
                return Ext.dd.DropZone.prototype.dropAllowed;
            },
            onNodeDrop: function (nodeData, source, e, data) {
                var dragOp = me.getDragOp(data, nodeData),
                    targetNode,
                    dropEvent = {
                        nodeData: nodeData,
                        source: source,
                        e: e,
                        data: data,
                        associatedEl: me.associatedEl,
                        droppedWidgetEl: me.dropWidget(data, dragOp),
                        dragOp: dragOp,
                        index: 0,
                        widgetMetaData: data.widgetMetaData || {},
                        widgetDefinition: data.widgetDefinition || {},
                        zoneData: Ext.decode(me.associatedEl.getAttribute('data-editing-zone'))
                    };
                if (!Ext.fly(e.target).is('.taco-hint-zone')) {
                    targetNode = e.getTarget('.taco-hint-widget', 10);
                }
                if (targetNode) {
                    targetAssociatedEl = Ext.getCmp(targetNode.id).associatedEl;
                    targetAssociatedElMetaData = Ext.decode(targetAssociatedEl.getAttribute('data-editing-widget'));
                    nextTargetCmp = targetAssociatedEl.next('[data-editing-widget]');
                    if (nextTargetCmp && nextTargetCmp.dom) {
                        nextTargetMetaData = Ext.decode(nextTargetCmp.getAttribute('data-editing-widget'));
                        dropEvent.index = (nextTargetMetaData.sequence + targetAssociatedElMetaData.sequence) / 2;
                        dropEvent.index = dropEvent.index ? dropEvent.index : 1;
                    }
                    else {
                        dropEvent.index = targetAssociatedElMetaData.sequence + 1;
                    }

                }

                if (targetNode) {
                    dropEvent.target = Ext.getCmp(targetNode.id);
                }
                if (dropEvent.dragOp == 'create') {
                    me.fireEvent('createwidget', dropEvent);
                    if (targetNode) {
                        me.fireEvent('reorderwidget', dropEvent);
                    }
                }
                if (dropEvent.dragOp == 'move') {
                    me.fireEvent('movewidget', dropEvent);
                    if (targetNode) {
                        me.fireEvent('reorderwidget', dropEvent);
                    }
                }
                if (dragOp == 'reorder') {
                    if (targetNode && targetNode.id != data.sourceEl.id) {
                        me.fireEvent('reorderwidget', dropEvent);
                    } else {
                        return false;
                    }
                }
                return true;
            }
        });
    },

    getDragOp: function (data, nodeData, targetNode) {
        var op = 'move';

        if (data.sourceEl.id == '') {
            op = 'create';
        } else if (Ext.get(data.sourceEl).up('.taco-widget-dropzone').id == nodeData.id) {
            op = 'reorder';
        }

        console.log(op);
        return op;
    },

    dropWidget: function (data, op) {
        var element,
        el;

        if (op == 'create') {
            element = this.associatedEl.dom.ownerDocument.createElement('div');
            element.innerHTML = data.widgetDefinition.previewHtml || '<img src="/admin/scripts/resources/images/legacy/loading.gif" />';

            el = Ext.get(element);
            el.addCls('taco-widget-element');

            this.associatedEl.appendChild(el);
            this.alignToEl();
            return el;
        } else {
            return Ext.get(data.dropWidget);
        }

    }
});
