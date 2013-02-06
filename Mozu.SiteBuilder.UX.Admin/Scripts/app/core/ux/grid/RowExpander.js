/**
 * @class Taco.core.ux.grid.RowExpander
 * @author Jimmy Sanford
 * Extends the RowExpander plugin.
 */

Ext.define('Taco.core.ux.grid.RowExpander', {
    extend: 'Ext.ux.RowExpander',
    requires: ['Taco.core.ux.grid.RowBody'],
    alias: 'plugin.taco.rowexpander',

    constructor: function() {
        var me = this,
            grid,
            rowBodyTpl,
            features;

        me.callParent(arguments);
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
        // NOTE: features have to be added before init (before Table.initComponent)
    },

    getRowBodyFeatureData: function(data, idx, record, orig) {
        var me = this,
            o = me.self.prototype.getAdditionalData.apply(this, arguments),
            id = me.columnId;

        o.rowBody = me.getRowBodyContents(data);
        o.rowCls = me.recordsExpanded[record.internalId] ? '' : me.rowCollapsedCls;
        o.rowBodyCls = me.recordsExpanded[record.internalId] ? '' : me.rowBodyHiddenCls;
        o[id + '-tdAttr'] = ' valign="top" ';
        if (orig[id+'-tdAttr']) {
            o[id+'-tdAttr'] += orig[id+'-tdAttr'];
        }
        return o;
    }
});