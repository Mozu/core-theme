///**
// * Taco.core.ux.simplegrid.Body
// * @deprecated
// */

//Ext.define('Taco.core.ux.simplegrid.Body', {
//    extend: 'Ext.view.View',
//    alias: 'widget.simplegridbody',

//    autoEl: { tag: 'tbody' },
//    componentCls: Taco.baseCSSPrefix + 'simplegrid-body',
//    selectedItemCls: 'taco-simplegrid-row-selected',
//    selModel: { mode: 'SIMPLE' },
//    bubbleEvents: ['roweditstart'],

//    cellCls: Taco.baseCSSPrefix + 'simplegrid-cell',
//    rowCls: Taco.baseCSSPrefix + 'simplegrid-row',

//    initComponent: function () {
//        var me  = this,
//            sm = {};

//        if (!this.editors) {
//            this.editors = new Ext.util.MixedCollection();
//        }

//        this.tplFragments = [];

//        this.tpl = this.getViewTpl();

//        this.callParent(arguments);

//        sm = this.getSelectionModel();

//        // checkbox override
//        Ext.apply(sm, {
//            selectWithEvent: function (record, e, keepExisting) {
//                var me = this,
//                    cb = e.getTarget('input.taco-simplegrid-checkbox', 10);

//                if (cb) {
//                    switch (me.selectionMode) {
//                        case 'MULTI':
//                            if (e.ctrlKey && me.isSelected(record)) {
//                                me.doDeselect(record, false);
//                            } else if (e.shiftKey && me.lastFocused) {
//                                me.selectRange(me.lastFocused, record, e.ctrlKey);
//                            } else if (e.ctrlKey) {
//                                me.doSelect(record, true, false);
//                            } else if (me.isSelected(record) && !e.shiftKey && !e.ctrlKey && me.selected.getCount() > 1) {
//                                me.doSelect(record, keepExisting, false);
//                            } else {
//                                me.doSelect(record, false);
//                            }
//                            break;
//                        case 'SIMPLE':
//                            if (me.isSelected(record)) {
//                                me.doDeselect(record);
//                            } else {
//                                me.doSelect(record, true);
//                            }
//                            break;
//                        case 'SINGLE':
//                            // if allowDeselect is on and this record isSelected, deselect it
//                            if (me.allowDeselect && me.isSelected(record)) {
//                                me.doDeselect(record);
//                            // select the record and do NOT maintain existing selections
//                            } else {
//                                me.doSelect(record, false);
//                            }
//                            break;
//                    }
//                }
//            },
//            preventFocus: true
//        });

//        this.on({
//            select: function (dvModel, record) {
//                var cb = Ext.select('input.taco-simplegrid-checkbox', false, this.getNode(record));

//                cb.set({ "aria-checked": "true" }).addCls('taco-simplegrid-checkbox-checked');
//            },
//            deselect: function (dvModel, record) {
//                var cb = Ext.select('input.taco-simplegrid-checkbox', false, this.getNode(record));

//                cb.set({ "aria-checked": "false" }).removeCls('taco-simplegrid-checkbox-checked');
//            },
//            refresh: function (view) {
//                console.log('body refresh');
//            },
//            itemclick: function (view, record, item, index, e) {
//                if (e.getTarget('span.edit', 10)) {
//                    view.fireEvent('roweditstart', view, record, item, index, e);
//                }
//            }
//        });
//    },

//    getTplFragments: function (cols) {
//        var output = [];

//        cols = this.cols.getRange();

//        Ext.Array.each(cols, function (col) {
//            var value = col.get('dataIndex') || Ext.emptyString,
//                colIndex = col.get('colIndex'),
//                cellTpl;

//            cellTpl = '<td class="taco-simplegrid-cell taco-simplegrid-cell-align-' + col.get('align') + '" data-column="' + col.get('id') + '" data-index="' + value + '"><div class="innards">{[' + col.get('renderer') + '.apply(this, [values.' + value + ', values])]}</div></td>';

//            if (Ext.isNumeric(colIndex)) {
//                output[colIndex] = cellTpl;
//            }
//        }, this);

//        return output;
//    },

//    insertCheckboxes: function (tplFragments) {
//        return tplFragments.unshift('<td class="taco-simplegrid-cell taco-check-column"><input type="button" role="checkbox" aria-checked="false" class="taco-simplegrid-checkbox" /></td>');
//    },

//    insertActions: function (tplFragments) {
//        return tplFragments.push('<td class="taco-simplegrid-cell taco-actions-column"><span class="edit">Edit</span></td>');
//    },

//    getViewTpl: function (cols) {
//        var me = this,
//            fragments, tpl;

//        if (Ext.isEmpty(cols)) cols = this.cols;

//        fragments = this.getTplFragments(cols);

//        this.insertCheckboxes(fragments);
//        this.insertActions(fragments);

//        tpl = new Ext.XTemplate(
//            '<tpl for=".">',
//                '<tr class="' + me.rowCls + '">' + fragments.join('') + '</tr>',
//            '</tpl>'
//        );

//        return tpl;
//    },

//    sort: function (dataIndex) {
//        var sm = this.getSelectionModel(),
//            store = this.getStore(),
//            sorters = store.sorters,
//            sorterIndex = Ext.Array.indexOf(sorters.keys, dataIndex),
//            isSorted = false;

//        sm.deselectAll(false);

//        if (sorterIndex >= 0) {
//            store.sort(sorters.items[sorterIndex].toggle());
//            isSorted = true;
//        } else {
//            store.sort(dataIndex, 'ASC');
//        }

//        return isSorted;
//    },

//    bufferRender : function(records, index){
//        var me = this,
//            div = me.renderBuffer || (me.renderBuffer = document.createElement('tbody'));

//        me.tpl.overwrite(div, me.collectData(records, index));
//        return Ext.query(me.getItemSelector(), div);
//    }
//});