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
        var lastPage = pageData.pageCount;

        var lastDisplayed = Math.max(currPage + 2, 5);
        lastDisplayed = Math.min(lastDisplayed, lastPage);
        var firstDisplayed = Math.min(currPage - 2, lastPage - 4);
        firstDisplayed = Math.max(firstDisplayed, 1);

        if (currPage > 1) {
            pageNumberItems.push({
                itemId: 'prev',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.movePrevious,
                text: "<",
                scope: me,
            });
        }

        if (firstDisplayed - 1 > 0) {
            pageNumberItems.push({
                itemId: 'first',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.moveFirst,
                text: "1",
                scope: me,
            });
        }

        if (firstDisplayed - 1 > 1) {
            pageNumberItems.push({
                itemId: 'prev-ellipsis',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.movePrevious,
                text: "&#x22ef;",
                scope: me,
            });
        }

        for (var pageNumber = firstDisplayed; pageNumber <= lastDisplayed; pageNumber++) {
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

        if (lastPage - lastDisplayed > 1) {
            pageNumberItems.push({
                itemId: 'next-ellipsis',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.moveNext,
                text: "&#x22ef;",
                scope: me,
            });
        }

        if (lastPage - lastDisplayed > 0) {
            pageNumberItems.push({
                itemId: 'last',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.moveLast,
                text: lastPage,
                scope: me,
            });
        }

        if (currPage < lastPage) {
            pageNumberItems.push({
                itemId: 'next',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.moveNext,
                text: ">",
                scope: me,
            });
        }

        if (me.displayInfo) {
            pageNumberItems.push('->');
            pageNumberItems.push({ xtype: 'tbtext', itemId: 'displayItem' });
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
        me.updateInfo();

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