/**
 * @class Taco.core.ux.grid.RowExpander
 * @author Jimmy Sanford
 * Overrides the RowExpander plugin. The primary override is changing the rowbody feature to our own taco.rowbody,
 * but we are also slightly changing the generated DOM and interactions with grids using selection.CheckboxModel.
 */

Ext.define('Taco.core.ux.grid.RowExpander', {
    override: 'Ext.grid.plugin.RowExpander',
    requires: ['Taco.core.ux.grid.RowBody'],

    // overrides: changed feature ftype from rowbody to taco.rowbody
    //setCmp: function (grid) {
    //    var me = this,
    //        rowBodyTpl,
    //        features;

    //    me.callParent(arguments);

    //    me.recordsExpanded = {};
    //    // <debug>
    //    if (!me.rowBodyTpl) {
    //        Ext.Error.raise("The 'rowBodyTpl' config is required and is not defined.");
    //    }
    //    // </debug>

    //    me.rowBodyTpl = Ext.XTemplate.getTpl(me, 'rowBodyTpl');
    //    rowBodyTpl = this.rowBodyTpl;
    //    features = [{
    //        ftype: 'taco.rowbody',
    //        lockableScope: 'normal',
    //        recordsExpanded: me.recordsExpanded,
    //        rowBodyHiddenCls: me.rowBodyHiddenCls,
    //        rowCollapsedCls: me.rowCollapsedCls,
    //        setupRowData: me.getRowBodyFeatureData,
    //        setup: me.setup,
    //        getRowBodyContents: function (record) {
    //            return rowBodyTpl.applyTemplate(record.getData());
    //        }
    //    }, {
    //        ftype: 'rowwrap',
    //        lockableScope: 'normal'
    //    }];

    //    if (grid.features) {
    //        grid.features = Ext.Array.push(features, grid.features);
    //    } else {
    //        grid.features = features;
    //    }
    //    // NOTE: features have to be added before init (before Table.initComponent)
    //},

    // overrides: removed valign, rowspan attributes; removed colspan decrement
    //getRowBodyFeatureData: function(record, idx, o) {
    //    var me = this,
    //        //o = me.self.prototype.getAdditionalData.apply(this, arguments),
    //        id = me.columnId;

    //    me.self.prototype.setupRowData.apply(me, arguments);

    //    o.rowBody = me.getRowBodyContents(record);
    //    o.rowCls = me.recordsExpanded[record.internalId] ? '' : me.rowCollapsedCls;
    //    o.rowBodyCls = me.recordsExpanded[record.internalId] ? '' : me.rowBodyHiddenCls;
    //    o[id + '-tdAttr'] = ' ';
    //    //if (orig[id+'-tdAttr']) {
    //    //    o[id+'-tdAttr'] += orig[id+'-tdAttr'];
    //    //}
    //    return o;
    //},

    // overrides: does not toggle row if dblclick occurred on a checkbox
    onDblClick: function(view, record, row, rowIdx, e) {
        if (!e.getTarget('.x-grid-row-checker')) {
            this.toggleRow(rowIdx, record);
        }
    },

    expandAllRows: function(expand) {
        var me = this;
        Ext.suspendLayouts();
        this.cmp.store.each(function (record, idx) {
            var row = Ext.fly(me.view.getNode(idx), '_rowExpander'),
                shouldToggle = row.hasCls(me.rowCollapsedCls);
            if (expand === false) shouldToggle = !shouldToggle;
            if (shouldToggle) me.toggleRow(idx, record);
        });
        Ext.resumeLayouts(true);
    },

    // overrides: removed toggling of hidden class on rowbody; parent's collapsed class is sufficient
    toggleRow: function(rowIdx, record) {
        var me = this,
           view = me.view,
           rowNode = view.getNode(rowIdx),
           row = Ext.fly(rowNode, '_rowExpander'),
           nextBd = row.down(me.rowBodyTrSelector, true),
           isCollapsed = row.hasCls(me.rowCollapsedCls),
           addOrRemoveCls = isCollapsed ? 'removeCls' : 'addCls',
           ownerLock, rowHeight, fireView;

        // Suspend layouts because of possible TWO views having their height change
        Ext.suspendLayouts();
        row[addOrRemoveCls](me.rowCollapsedCls);
        me.recordsExpanded[record.internalId] = isCollapsed;
        view.refreshSize();

        // Sync the height and class of the row on the locked side
        if (me.grid.ownerLockable) {
            ownerLock = me.grid.ownerLockable;
            fireView = ownerLock.getView();
            view = ownerLock.lockedGrid.view;
            rowHeight = row.getHeight();
            row = Ext.fly(view.getNode(rowIdx), '_rowExpander');
            row.setHeight(rowHeight);
            row[addOrRemoveCls](me.rowCollapsedCls);
            view.refreshSize();
        } else {
            fireView = view;
        }
        fireView.fireEvent(isCollapsed ? 'expandbody' : 'collapsebody', row.dom, record, nextBd);
        // Coalesce laying out due to view size changes
        Ext.resumeLayouts(true);
    },

    // overrides: added row-expander class to td element
    getHeaderConfig: function() {
        var me = this;

        return {
            //id: me.getHeaderId(),
            width: 24,
            lockable: false,
            sortable: false,
            resizable: false,
            draggable: false,
            hideable: false,
            menuDisabled: true,
            cls: Ext.baseCSSPrefix + 'grid-header-special',
            renderer: function(value, metadata, record) {
                var cls = Ext.baseCSSPrefix + 'grid-row-expander';

                metadata.tdCls = Ext.baseCSSPrefix + 'grid-cell-special ' + Ext.baseCSSPrefix + 'grid-cell-row-expander';
                
                if (Ext.isEmpty(me.rowBodyTpl.applyOut(record.getData(), []))) {
                    cls += (' empty');
                }
                return '<div class="' + cls + '">&#160;</div>';
            },
            processEvent: function(type, view, cell, rowIndex, cellIndex, e, record) {
                if (type === "mousedown" && e.getTarget('.x-grid-row-expander')) {
                    me.toggleRow(rowIndex, record);
                    return me.selectRowOnExpand;
                }
            }
        };
    },

    /**
     * An empty function by default, but provided so you can hide the expander if there is nothing to expand.
     * @param {Ext.data.Model} record The record
     * @return {Boolean} hidden True if the expander should be hidden for this record, else false
     * @template
     */
    hideExpanderFn: function (record) {
        return false;
    }
});