///**
// * Taco.core.ux.simplegrid.Header
// * @deprecated
// */


//Ext.define('Taco.core.ux.simplegrid.Header', {
//    extend: 'Ext.view.View',
//    alias: 'widget.simplegridheader',

//    autoEl: { tag: 'thead' },
//    componentCls: Taco.baseCSSPrefix + 'simplegrid-header',
//    disableSelection: true,
//    bubbleEvents: ['colclick', 'coleditstart', 'coldragstart', 'coldragend', 'coldragmove', 'coldropinvalid', 'coldropvalid', 'selectall'],

//    cellCls: Taco.baseCSSPrefix + 'simplegrid-cell',
//    rowCls: Taco.baseCSSPrefix + 'simplegrid-column-header-row',
//    beforeViewTpl: '<th class="taco-simplegrid-cell taco-check-column"><input type="button" role="checkbox" aria-checked="false" class="taco-simplegrid-checkbox" /></th>',
//    afterViewTpl: '<th class="taco-simplegrid-cell taco-actions-column">Actions</th>',
//    viewTpl: [
//        '<tpl for=".">',
//            '<th class="taco-simplegrid-column-header taco-simplegrid-cell taco-simplegrid-cell-align-{align}" data-column="{id}" data-index="{dataIndex}">{text} <span class="edit">Edit</span></th>',
//        '</tpl>'
//    ],

//    initComponent: function () {
//        var me = this,
//            sm = {},
//            viewTplHtml,
//            beforeViewTplHtml;

//        if (!this.viewTpl.isTemplate) {
//            this.viewTpl = Ext.create('Ext.XTemplate', this.viewTpl);
//            viewTplHtml = this.viewTpl.html;
//        }

//        if (!this.beforeViewTpl.isTemplate) {
//            this.beforeViewTpl = Ext.create('Ext.XTemplate', this.beforeViewTpl);
//            beforeViewTplHtml = this.beforeViewTpl.html;
//        }

//        if (!this.afterViewTpl.isTemplate) {
//            this.afterViewTpl = Ext.create('Ext.XTemplate', this.afterViewTpl);
//            afterViewTplHtml = this.afterViewTpl.html;
//        }

//        this.tpl = new Ext.XTemplate(
//            '<tr class="' + me.rowCls + '">',
//                beforeViewTplHtml,
//                viewTplHtml,
//                afterViewTplHtml,
//            '</tr>'
//        );

//        this.callParent(arguments);

//        sm = this.getSelectionModel();

//        this.on({
//            viewready: function (view, e) {
//                view.dragZone = new Ext.dd.DragZone(view.getEl(), {
//                    getDragData: function (e) {
//                        var sourceEl = e.getTarget('th.taco-simplegrid-column-header', 10),
//                        d, ret;

//                        if (sourceEl) {
//                            d = sourceEl.cloneNode(true);
//                            d.id = Ext.id();
//                            ret = {
//                                ddel: d,
//                                sourceEl: sourceEl,
//                                repairXY: Ext.fly(sourceEl).getXY(),
//                                sourceStore: view.store,
//                                draggedRecord: view.getRecord(sourceEl)
//                            };

//                            return ret;
//                        }
//                    },
//                    getRepairXY: function () {
//                        return this.dragData.repairXY;
//                    },
//                    onStartDrag: function (x, y) {
//                        var sourceEl = this.dragData.sourceEl,
//                            items = Ext.select('th.taco-simplegrid-column-header', false, view.getId()),
//                            slots = [];

//                        this.setXConstraint(0, view.getEl().getWidth() * 2);
//                        // this.setYConstraint(0, 0);

//                        items.each(function (el, c, index) {
//                            slots[el.getAttribute('data-column')] = {
//                                origin: el.getLeft(false),
//                                index: index,
//                                offset: 0
//                            };
//                        });
//                        view.dropZone.slots = slots;

//                        view.fireEvent('coldragstart', this);
//                        Ext.fly(sourceEl).addCls('taco-being-hidden');
//                    },
//                    onEndDrag: function (data, e) {
//                        var sourceEl = data.sourceEl;

//                        view.fireEvent('coldragend', this);
//                        Ext.fly(sourceEl).removeCls('taco-being-hidden');
//                    },
//                    afterInvalidDrop: function (e) {
//                        var items = Ext.select('th.taco-simplegrid-column-header', false, view.getId());

//                        items.each(function (el) {
//                            el.setLeft(0);
//                        });
//                        view.fireEvent('coldropinvalid', this);
//                    },
//                    afterValidDrop: function (dd, e) {
//                        var items = Ext.select('th.taco-simplegrid-column-header', false, view.getId()),
//                            store = view.getStore(),
//                            slots = view.dropZone.slots;

//                        items.each(function (el) {
//                            el.setLeft(0);
//                        });
//                        view.fireEvent('coldropvalid', this);

//                        store.each(function (record) {
//                            record.set({ colIndex: slots[record.getId()].index });
//                        });
//                        store.sort('colIndex', 'ASC');
//                    }
//                });

//                view.dropZone = new Ext.dd.DropZone(view.getEl(), {
//                    allowSwap: false,
//                    getTargetFromEvent: function (e) {
//                        return e.getTarget('th.taco-simplegrid-column-header');
//                    },
//                    onNodeEnter: function (target, dd, e, data) {
//                        this.allowSwap = !(target === data.sourceEl);
//                        Ext.fly(target).addCls('taco-valid-drop');
//                    },
//                    onNodeOut: function (target, dd, e, data) {
//                        Ext.fly(target).removeCls('taco-valid-drop');
//                    },
//                    onNodeOver: function (target, dd, e, data) {
//                        var cursor, sourceEl, targetEl, sid, tid, sourceBox, targetBox;

//                        if (this.allowSwap) {
//                            cursor = e.getPoint().left;
//                            sourceEl = Ext.get(data.sourceEl);
//                            targetEl = Ext.get(target);
//                            sid = sourceEl.getAttribute('data-column');
//                            tid = targetEl.getAttribute('data-column');
//                            sourceBox = sourceEl.getPageBox();
//                            targetBox = targetEl.getPageBox();

//                            if (this.slots[sid].index > this.slots[tid].index && cursor - targetBox.left <= targetBox.width * 0.5) {
//                                this.doSwap(sourceEl, sourceBox.width, targetEl, targetBox.width, true);
//                            } else if (this.slots[sid].index < this.slots[tid].index && targetBox.right - cursor <= targetBox.width * 0.5) {
//                                this.doSwap(sourceEl, sourceBox.width, targetEl, targetBox.width, false);
//                            }
//                        }

//                        return Ext.dd.DropZone.prototype.dropAllowed;
//                    },
//                    onNodeDrop: function (target, dd, e, data) {
//                        return true;
//                    },
//                    doSwap: function (sourceEl, sourceWidth, targetEl, targetWidth, isLeft) {
//                        var sid = sourceEl.getAttribute('data-column'),
//                            tid = targetEl.getAttribute('data-column'),
//                            indices = [this.slots[sid].index, this.slots[tid].index],
//                            modifier = isLeft ? 1 : -1,
//                            dest = this.slots[tid].origin + this.slots[tid].offset - this.slots[sid].origin;

//                        this.allowSwap = false;

//                        dest += (isLeft ? 0 : targetWidth - sourceWidth);
//                        this.slots[sid].offset = dest;
//                        sourceEl.setLeft(dest);
//                        view.fireEvent('coldragmove', sourceEl, dest);
//                        this.slots[sid].index = indices[1];
                        
//                        Ext.Object.each(this.slots, function (key, value, obj) {
//                            var curEl;

//                            if (value.index >= Ext.Array.min(indices) && value.index <= Ext.Array.max(indices) && key !== sid) {
//                                curEl = Ext.select('th[data-column="' + key + '"]', false, view.getId()).first();
                                
//                                value.offset += (sourceWidth * modifier);
//                                curEl.setLeft(value.offset);
//                                view.fireEvent('coldragmove', curEl, value.offset);
//                                value.index += modifier;
//                            }
//                        });
//                    }
//                });
//            },
//            containerclick: function (view, e) {
//                var cb = e.getTarget('input.taco-simplegrid-checkbox', 10),
//                    cbState, bodyView;

//                if (cb) {
//                    cb = Ext.get(cb);
//                    cbState = cb.getAttribute('aria-checked') === 'true';

//                    this.fireEvent('selectall', e);
//                    bodySelModel = view.ownerCt.view.getSelectionModel();

//                    if (cbState) {
//                        bodySelModel.deselectAll(false);
//                    } else {
//                        bodySelModel.selectAll(false);
//                    }
//                    cb.set({ "aria-checked": !cbState }).toggleCls('taco-simplegrid-checkbox-checked');
//                }
//            },
//            itemclick: function (view, record, item, index, e) {
//                if (e.getTarget('span.edit', 10)) {
//                    view.fireEvent('coleditstart', view, record, item, index, e);
//                } else {
//                    view.fireEvent('colclick', view, record, item, index, e);
//                }
//            }
//        });
//    },

//    bufferRender: function (records, index) {
//        var me = this,
//            div = me.renderBuffer || (me.renderBuffer = document.createElement('thead'));

//        me.tpl.overwrite(div, me.collectData(records, index));
//        return Ext.query(me.getItemSelector(), div);
//    }
//});