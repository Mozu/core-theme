/**
 * @class Taco.view.website.Tree
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.website.Tree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.taco-website-tree',
    requires: [
        'Taco.model.NavigationTreeNode',
        'Taco.store.NavigationTreeNodes'
    ],

    border: false,
    componentCls: 'taco-website-tree',
    hideHeaders: true,
    rootVisible: false,
    useArrows: true,

    initComponent: function () {
        this.columns = [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'name',
            renderer: function (value, metaData, record) {
                var id = record.getId(),
                    isRoot = record.parentNode && record.parentNode.isRoot(),
                    output = '<span class="taco-website-tree-icon"></span><span>' + value + '</span>';
                    // output = '<a href="#" class="taco-action-navigate">' + value + '</a>';

                if (isRoot) {
                    output += ('<span class="taco-website-tree-sublink" data-page-creator="true" data-parent-id="' + id + '" >+ Add Page</span>');
                }

                return output;
            }
        }];

        this.callParent(arguments);
    }
});
