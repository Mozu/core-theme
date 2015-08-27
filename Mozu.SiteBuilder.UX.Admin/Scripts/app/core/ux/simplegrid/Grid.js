/**
 * Taco.core.ux.simplegrid.Grid
 * @deprecated
 */


//Ext.define('Taco.core.ux.simplegrid.Grid', {
//    extend: 'Ext.container.Container',
//    requires: ['Taco.core.ux.simplegrid.Header', 'Taco.core.ux.simplegrid.Body', 'Taco.model.SimplegridColumn'],
//    alias: 'widget.simplegrid',

//    autoEl: { tag: 'table' },
//    baseCls: Taco.baseCSSPrefix + 'simplegrid',
//    itemSelector: 'tr.taco-simplegrid-row',

//    cellCls: Taco.baseCSSPrefix + 'simplegrid-cell',

//    initComponent: function () {
//        var me = this;

//        this.cols = [];

//        Ext.Array.each(this.columns, function (column, colIndex) {
//            var colModel;

//            Ext.applyIf(column, {
//                id: Ext.id(null, 'simplegridcolumn-'),
//                colIndex: colIndex
//            });

//            colModel = Ext.create('Taco.model.SimplegridColumn', column);
//            me.cols.push(colModel);
//        });

//        this.headerStore = Ext.create(Ext.data.Store, {
//            model: Taco.model.SimplegridColumn,
//            data: this.cols
//        });

//        this.headerView = Ext.create('Taco.core.ux.simplegrid.Header', {
//            store: this.headerStore,
//            bodyStore: this.store,
//            itemSelector: 'th.taco-simplegrid-column-header',
//            cellCls: this.cellCls
//        });

//        this.view = Ext.create('Taco.core.ux.simplegrid.Body', {
//            store: this.store,
//            itemSelector: this.itemSelector,
//            cols: this.headerStore,
//            cellCls: this.cellCls
//        });

//        if (!this.editors) {
//            this.editors = new Ext.util.MixedCollection();
//        }

//        if (!this.actions) {
//            this.actions = Ext.create('Ext.Container', {
//                floating: true,
//                shadow: false,
//                shrinkWrap: 3,
//                padding: '7 10 3',
//                items: [{
//                    xtype: 'secondaryaction',
//                    text: 'Cancel',
//                    listeners: {
//                        click: function () {
//                            me.fireEvent('coleditend', 'cancel');
//                            me.fireEvent('roweditend', 'cancel');
//                        }
//                    }
//                }, {
//                    xtype: 'dirtybutton',
//                    text: 'Save',
//                    listeners: {
//                        click: function () {
//                            me.fireEvent('coleditend', 'save');
//                            me.fireEvent('roweditend', 'save');
//                        }
//                    }
//                }]
//            });
//        }

//        this.items = [this.headerView, this.view];

//        this.callParent(arguments);

//        this.addEvents(
//            /**
//             * @event roweditstart
//             * Fires when a row's edit trigger is clicked.
//             * @param {Ext.view.View} view The DataView object
//             * @param {Ext.data.Model} record The record that belongs to the item
//             * @param {HTMLElement} item The item's element
//             * @param {Number} index The item's index
//             * @param {Ext.EventObject} The raw event object
//             */
//            'roweditstart',
//            /**
//             * @event roweditend
//             * Fires when editing of a row (or column. TODO: fix) is ended by a grid action.
//             */
//            'roweditend',
//            /**
//             * @event colclick
//             * Fires when a column header is clicked.
//             * @param {Ext.view.View} view The DataView object
//             * @param {Ext.data.Model} record The record that belongs to the item
//             * @param {HTMLElement} item The item's element
//             * @param {Number} index The item's index
//             * @param {Ext.EventObject} The raw event object
//             */
//            'colclick',
//            /**
//             * @event coleditstart
//             * Fires when a column header's edit trigger is clicked.
//             * @param {Ext.view.View} view The DataView object
//             * @param {Ext.data.Model} record The record that belongs to the item
//             * @param {HTMLElement} item The item's element
//             * @param {Number} index The item's index
//             * @param {Ext.EventObject} The raw event object
//             */
//            'coleditstart',
//            /**
//             * @event coleditend
//             * Fires when editing of a column (or row. TODO: fix) is ended by a grid action.
//             */
//            'coleditend',
//            /**
//             * @event coldragstart
//             * Fires when dragging of a column header begins.
//             */
//            'coldragstart',
//            /**
//             * @event coldragend
//             * Fires when dragging of a column header ends.
//             */
//            'coldragend',
//            /**
//             * @event coldragmove
//             * Fires during column header dragging when the dragged item triggers a reorder.
//             */
//            'coldragmove',
//            /**
//             * @event coldropinvalid
//             * Fires when a column header is dropped in an invalid location.
//             */
//            'coldropinvalid',
//            /**
//             * @event coldropvalid
//             * Fires when a column header is dropped in a valid location.
//             */
//            'coldropvalid'
//        );

//        this.on({
//            roweditstart: this.onRowEditStart,
//            roweditend: this.onRowEditEnd,
//            colclick: this.onColClick,
//            coleditstart: this.onColEditStart,
//            coleditend: this.onColEditEnd,
//            coldragstart: this.onColDragStart,
//            coldragend: this.onColDragEnd,
//            coldragmove: this.onColDragMove,
//            coldropinvalid: this.onColDropInvalid,
//            coldropvalid: this.onColDropValid,
//            scope: this
//        });

//        this.headerStore.on({
//            refresh: {
//                fn: function (store) {
//                    this.view.tpl = this.view.getViewTpl(store.getRange());
//                    this.view.refresh();
//                },
//                scope: this
//            }
//        });

//        this.view.on({
//            viewready: this.getEditors,
//            refresh: this.getEditors,
//            scope: this
//        });

//        this.editors.on({
//            beforedirtychange: {
//                fn: function (editor, newDirtyState) {
//                    var dirtyFields, isFormDirty;

//                    dirtyFields = this.filterBy(function (item) {
//                        return (item.isDirty() && item.isValid());
//                    });
//                    isFormDirty = dirtyFields.getCount() > 0;

//                    delete dirtyFields;
//                    return newDirtyState == isFormDirty;
//                },
//                scope: this.editors
//            }
//        });
//    },

//    getEditors: function (view) {
//        var me = this,
//            records = this.store.getRange(),
//            cols = this.headerStore.query('editable', true),
//            refresh = !!(this.editors.getCount());

//        Ext.Array.each(records, function (record, recordIndex) {
//            var rid = record.getId(),
//                node = view.getNode(record),
//                rowEditors = [];

//            cols.each(function (col, colIndex) {
//                var cid = col.get('id'),
//                    dataIndex = col.get('dataIndex'),
//                    cell = Ext.select('td[data-column="' + cid + '"]', false, node).first(),
//                    cellIndex, editor, cfg;

//                if (refresh) {
//                    // TODO: add more editors if necessary
//                    cellIndex = recordIndex * cols.length + colIndex;
//                    editor = me.editors.getAt(cellIndex);

//                    Ext.apply(editor, { boundRow: rid });
//                    editor.setValue(record.get(dataIndex));
//                    editor.resetOriginalValue();

//                    editor.getEl().appendTo(cell);
//                } else {
//                    cfg = col.get('editor');
//                    Ext.Object.merge(cfg, {
//                        value: record.get(dataIndex),
//                        hidden: true,
//                        hideMode: 'display',
//                        boundRow: rid,
//                        boundCol: cid
//                    });

//                    editor = Ext.widget(cfg.xtype, cfg);
//                    editor.on({
//                        show: me.onToggleEditor,
//                        hide: me.onToggleEditor,
//                        dirtychange: me.onEditorStateChange,
//                        scope: me
//                    });

//                    editor.render(cell);
//                    rowEditors.push(editor);
//                }
//            });

//            if (!refresh) {
//                me.editors.addAll(rowEditors);
//            }
//        });
//    },

//    onRowEditStart: function (view, record, item, index, e) {
//        var rowId = record.getId(),
//            fields = this.editors.filter('boundRow', rowId),
//            target = Ext.select('td.taco-actions-column', false, item).first();

//        if (fields.length < 1) {
//            return false;
//        }

//        this.disable();
//        this.actions.show().alignTo(target, "c-c");
//        this.actions.addCls('taco-simplegrid-row-edit-actions');
//        Ext.fly(item).addCls('taco-simplegrid-row-editing');

//        fields.each(function (field) {
//            field.show();
//        });
//        this.enable();
//    },

//    onRowEditEnd: function (action) {
//        var row = Ext.select('tr.taco-simplegrid-row-editing', false, this.view.getId()).first();

//        if (row) {
//            row.removeCls('taco-simplegrid-row-editing');
//        }
//    },

//    onColEditStart: function (view, record, item, index, e) {
//        var colId = record.getId(),
//            fields = this.editors.filter('boundCol', colId);

//        if (fields.length < 1) {
//            return false;
//        }

//        this.disable();
//        this.actions.show().alignTo(item, "bl-tl", [-18, -1]);
//        this.actions.addCls('taco-simplegrid-column-edit-actions');

//        fields.each(function (field) {
//            field.show();
//        });
//    },

//    onColEditEnd: function (action) {
//        var me = this,
//            btn = this.actions.down('dirtybutton');

//        this.editors.each(function (field) {
//            var record, col, dataIndex, newValue, btn;

//            if (action === 'save' && field.isDirty() && field.isValid()) {
//                record = me.store.getById(field.boundRow);
//                col = me.headerStore.getById(field.boundCol);
//                dataIndex = col.get('dataIndex');
//                newValue = field.getValue();

//                field.reset();
//                field.hide();

//                record.set(dataIndex, newValue);
//            } else {
//                field.reset();
//                field.hide();
//            }
//        });

//        btn.setDirty(false);
//        this.actions.hide();
//        this.actions.removeCls('taco-simplegrid-column-edit-actions', 'taco-simplegrid-row-edit-actions');
//        this.enable();
//        this.store.sync();
//    },

//    onColClick: function (view, record, item, index, e) {
//        var dataIndex = item.getAttribute('data-index'),
//            isSorted = this.view.sort(dataIndex);

//        if (isSorted) {
//            Ext.fly(item).toggleCls('x-sorted-ASC').toggleCls('x-sorted-DESC');
//        } else {
//            Ext.Array.each(view.getNodes(), function (node, nodeIndex) {
//                Ext.fly(node).removeCls(['x-sorted-ASC', 'x-sorted-DESC']);
//            }, view);
//            Ext.fly(item).addCls('x-sorted-ASC');
//        }
//    },
//    onColDragStart: function (dd) {
//        var record = dd.dragData.draggedRecord,
//            colId = record.get('id'),
//            clones = Ext.create('Ext.dom.CompositeElement', {}),
//            cells, ghostEl;

//        ghostEl = dd.getProxy().getGhost();
//        cells = Ext.select('td[data-column="' + colId + '"]', false, this.view.getId());

//        cells.each(function (cell) {
//            var clone = cell.dom.cloneNode(true);
//            clones.add(clone);
//            cell.addCls('taco-being-hidden');
//        });

//        clones.appendTo(ghostEl);
//    },

//    onColDragEnd: function (dd) {
//        var record = dd.dragData.draggedRecord,
//            colId = record.get('id'),
//            cells;

//        cells = Ext.select('td[data-column="' + colId + '"]', false, this.view.getId());
//        cells.removeCls('taco-being-hidden');
//    },

//    onColDragMove: function (el, offset) {
//        var colId = el.getAttribute('data-column'),
//            cells;

//        cells = Ext.select('td[data-column="' + colId + '"]', false, this.view.getId());
//        cells.setLeft(offset);
//    },

//    onColDropInvalid: function (dd) {
//        var cells = Ext.select('td', false, this.view.getId());

//        cells.setLeft(0);
//    },

//    onColDropValid: function (dd) {
//        var cells = Ext.select('td', false, this.view.getId());

//        cells.setLeft(0);
//    },

//    onToggleEditor: function (editor) {
//        var cell = editor.getEl().up('td');

//        cell.toggleCls(this.cellCls + '-editing');
//    },

//    onEditorStateChange: function (editor) {
//        var btn = this.actions.down('dirtybutton'),
//            isBtnDirty = btn.isDirty();

//        if (editor.isHidden()) { return; }

//        if (isBtnDirty && (!editor.isDirty() || !editor.isValid())) {
//            if (!this.editors.fireEvent('beforedirtychange', editor, false)) { return; }
//            else btn.setDirty(false);
//        } else if (!isBtnDirty && editor.isDirty && editor.isValid()) {
//            if (!this.editors.fireEvent('beforedirtychange', editor, true)) { return; }
//            else btn.setDirty(true);
//        }
//    }
//});