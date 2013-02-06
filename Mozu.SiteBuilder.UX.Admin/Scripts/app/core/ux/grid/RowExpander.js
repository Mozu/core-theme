/**
 * @class Taco.core.ux.grid.RowExpander
 * @author Jimmy Sanford
 * Overrides the RowExpander plugin.
 */

Ext.define('Taco.core.ux.grid.RowExpander', {
    override: 'Ext.ux.RowExpander',
    requires: ['Taco.core.ux.grid.RowBody'],

    constructor: function () {
        var me = this,
            grid,
            rowBodyTpl,
            features;

        me.callSuper(arguments);
        grid = me.getCmp();

        me.recordsExpanded = {};
        // <debug>
        if (!me.rowBodyTpl) {
            Ext.Error.raise("The 'rowBodyTpl' config is required and is not defined.");
        }
        // </debug>

        me.rowBodyTpl = Ext.XTemplate.getTpl(me, 'rowBodyTpl');
        rowBodyTpl = this.rowBodyTpl;
        features = [{
            ftype: 'taco.rowbody',
            lockableScope: 'normal',
            columnId: me.getHeaderId(),
            recordsExpanded: me.recordsExpanded,
            rowBodyHiddenCls: me.rowBodyHiddenCls,
            rowCollapsedCls: me.rowCollapsedCls,
            getAdditionalData: me.getRowBodyFeatureData,
            getRowBodyContents: function(data) {
                return rowBodyTpl.applyTemplate(data);
            }
        },{
            ftype: 'rowwrap',
            lockableScope: 'normal'
        },
        // In case the client grid is lockable (At this stage we cannot know; plugins are constructed early)
        // push a Feature into the locked side which sets up the initially collapsed row state correctly
        {
            ftype: 'feature',
            lockableScope: 'locked',
            getAdditionalData: function(data, idx, record, result) {
                if (!me.recordsExpanded[record.internalId]) {
                    result.rowCls = (result.rowCls || '') + ' ' + me.rowCollapsedCls;
                }
            }
        }];

        if (grid.features) {
            grid.features = Ext.Array.push(features, grid.features);
        } else {
            grid.features = features;
        }
    },

    // overrides: removed valign, rowspan attributes; removed colspan decrement
    getRowBodyFeatureData: function(data, idx, record, orig) {
        var me = this,
            o = me.self.prototype.getAdditionalData.apply(this, arguments),
            id = me.columnId;

        o.rowBody = me.getRowBodyContents(data);
        o.rowCls = me.recordsExpanded[record.internalId] ? '' : me.rowCollapsedCls;
        o.rowBodyCls = me.recordsExpanded[record.internalId] ? '' : me.rowBodyHiddenCls;
        o[id + '-tdAttr'] = ' ';
        if (orig[id+'-tdAttr']) {
            o[id+'-tdAttr'] += orig[id+'-tdAttr'];
        }
        return o;
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
            rowHeight;

        // Suspend layouts because of possible TWO views having their height change
        Ext.suspendLayouts();
        row[addOrRemoveCls](me.rowCollapsedCls);
        me.recordsExpanded[record.internalId] = isCollapsed;
        view.refreshSize();
        view.fireEvent(isCollapsed ? 'expandbody' : 'collapsebody', row.dom, record, nextBd);

        // Sync the height and class of the row on the locked side
        if (me.grid.ownerLockable) {
            view = me.grid.ownerLockable.lockedGrid.view;
            rowHeight = row.getHeight();
            row = Ext.fly(view.getNode(rowIdx), '_rowExpander');
            row.setHeight(rowHeight);
            row[addOrRemoveCls](me.rowCollapsedCls);
            view.refreshSize();
        }
        // Coalesce laying out due to view size changes
        Ext.resumeLayouts(true);
    }
});