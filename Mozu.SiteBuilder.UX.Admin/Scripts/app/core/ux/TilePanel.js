/**
 * @class Taco.core.ux.TilePanel
 */
Ext.define('Taco.core.ux.TilePanel', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.core.ux.TileView'],
    mixins: ['Taco.core.ux.FileDragDroppable'],
    alias: 'widget.tilepanel',
    cls: Taco.baseCSSPrefix + 'tilepanel',

    actions: [],
    editorTriggerCls: 'name',
    imageCollection: false,
    imageField: 'thumbnail',
    nameField: 'name',
    overflowY: 'auto',
    editable: true,
    isDragable:true,
    getSelectionModel: function() {
        return this.view.getSelectionModel.apply(this.view, arguments);
    },

    initComponent: function () {
        var me = this;

        me.items = me.items || [];
        me.items.push({
            xtype: 'tileview',
            actions: me.actions,
            isDragable: me.isDragable,
            imageCollection: me.imageCollection,
            imageField: me.imageField,
            nameField: me.nameField,
            tileSizes: [90, 160, 230]
        });

        if (me.isDragable) {
            me.mixins["Taco.core.ux.FileDragDroppable"].init.call(this);
        }

        me.editor = new Ext.Editor({
            shadow: false,
            field: {
                xtype: 'textfield'
            }
        });
        me.editor.on('complete', function (editor, value, previous) {
            if (value != previous) {
                editor.record.set(me.nameField, value);
                editor.record.save();
            }
        });

        me.callParent(arguments);

        me.view = me.down('tileview');
        me.view.bindStore(me.store);

        if (me.simpleSelect) {
            me.view.getSelectionModel().setSelectionMode('SIMPLE');
        }

        me.view.on({
            'render': { fn: me.initFileDragZone, scope: me },
            'itemclick': { fn: me.onItemClick, scope: me }
        });

        me.on({
            edit: {
                fn: function (v, record, item, index, e, eOpts) {
                    var cls = '.' + me.editorTriggerCls,
                        dom = Ext.get(item).down(cls);
                        
                    me.editor.completeEdit();
                    me.editor.startEdit(dom);
                    me.editor.record = record;
                },
                scope: me
            }
        });
    },

    onItemClick: function (v, record, item, index, e, eOpts) {
        var me = this,
            handled = false,
            dom = Ext.get(e.getTarget());

        Ext.Array.each(me.actions, function (action) {
            if (dom.hasCls(action.iconCls)) {
                handled = true;
                me.fireEvent(action.eventName, v, record, item, index, e, eOpts);
            }
        });

        if (me.editable && dom.hasCls(me.editorTriggerCls)) {
            handled = true;
            me.fireEvent('edit', v, record, item, index, e, eOpts);
        }
        if (!handled) {
            me.fireEvent('tileclick', v, record, item, index, e, eOpts);
        }

        return handled;
    },

    getView: function () {
        return this.view;
    },

    initFileDragZone: function (v) {
        if (!this.isDragable) {
            return;
        }

        v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
            getDragData: function (e) {
                var sourceEl = e.getTarget(v.itemSelector, 10),
                    d;

                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return v.dragData = {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d,
                        fileData: v.getRecord(sourceEl)
                    };
                }
            },

            getRepairXY: function () {
                return this.dragData.repairXY;
            }
        });
    }
});