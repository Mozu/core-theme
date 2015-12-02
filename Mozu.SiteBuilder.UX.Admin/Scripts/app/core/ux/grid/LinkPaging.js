/**
 * Extension of PagingToolbar to replace paging controls with a set of link buttons
 */
Ext.define('Taco.core.ux.grid.LinkPaging', {
    extend: 'Ext.toolbar.Paging',
    alias: 'widget.taco.linkpagingtoolbar',

    /**
     * Gets the standard paging items in the toolbar
     * @private
     */
    getPagingItems: function () {
        var me = this;

        var pageData = me.getPageData();
        var pageNumberItems = [];
        var currPage = pageData.currentPage;

        for (var idx = 0; idx < pageData.pageCount; idx++) {
            var pageNumber = idx + 1;
            var cls = pageNumber == currPage ? 'tbar-page-link-current' : 'tbar-page-link';
            pageNumberItems.push({
                itemId: 'tbar-page-link' + pageNumber,
                cls: Ext.baseCSSPrefix + cls,
                handler: me.onPageClicked,
                text: pageNumber,
                scope: {
                    scope: me,
                    idx: pageNumber
                }
            });
        }

        return pageNumberItems;
    },

    initComponent: function () {
        var me = this;
        me.callParent();
    },


    onLoad: function () {
        var me = this;
        var container = me.container;
        var pageData, count, isEmpty;

        count = me.store.getCount();
        isEmpty = count === 0;

        if (!isEmpty) {
            pageData = me.getPageData();
        }

        // TODO: verify that the page controls need to change before doing a layout
        me.removeAll();
        me.add(me.getPagingItems());

        if (me.rendered) {
            me.fireEvent('change', me, pageData);
        }
    },

    onPageClicked: function () {
        var me = this.scope,
            idx = this.idx;

        if (me.fireEvent('beforechange', me, idx) !== false) {
            me.store.loadPage(idx);
        }
    }


});