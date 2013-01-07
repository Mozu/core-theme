/**
 * @class Taco.core.ux.GridPager
 */
Ext.define('Taco.core.ux.GridPager', {
    extend: 'Ext.toolbar.Toolbar',
    requires: ['Taco.core.ux.action.Action'],
    alias: 'widget.gridpager',
    cls: Taco.baseCSSPrefix + 'gridpager',
    dock: 'bottom',
    store: null,
    tpl: [
        '<div class="taco-gridpager">',
            '<tpl if="previous"><a href="{previous}" style="margin-right:6px" class="taco-action"><-</a></tpl>',
            '<tpl for="pages">',
                '<a class="taco-action {cls}" href="{page}">{page}</a>',
            '</tpl>',
            '<tpl if="next"><a href="{next}" style="margin-left:6px" class="taco-action">-></a></tpl>',
        '</div>'
        ],
    initComponent: function () {
        var me = this;

        this.callParent(arguments);
        me.mon(me.store, 'load', me.onLoad, me);
        me.on('beforerender', me.onLoad, me, {
            single: true
        });
        me.on({
            click: {
                element: 'el',
                fn: me.onClick
            },
            scope: me
        });
    },

    onLoad: function (store) {

        var me = this,
            pageData = me.getPageData();

        me.update(pageData);
        return;

    },

    onClick: function (e, t, options) {
        e.preventDefault();
        var page = t.getAttribute('href');
        this.store.loadPage(page);

    },
    getPageData: function () {
        var store = this.store,
            currentPage = parseInt(store.currentPage, 10),
            lastPage = Math.ceil(store.totalCount / store.pageSize),
            i, data;

        if (lastPage < 2) {
            if (store.count() === 0 && currentPage > 1) {
                store.loadPage(1);
            }
            return {};
        }


        data = {
            currentPage: currentPage,
            lastPage: lastPage,
            previous: currentPage !== 1 ? currentPage - 1 : 1,
            next: currentPage !== lastPage ? currentPage + 1 : lastPage,
            pages: []
        };

        for (i = 1; i <= data.lastPage; i++) {
            data.pages.push({
                page: i,
                cls: i === data.currentPage ? 'active' : ''
            });
        }

        return data;
    },

    movePrevious: function () {
        var me = this,
            prev = me.store.currentPage - 1;

        if (prev > 0) {
            me.store.previousPage();
        }
    },

    moveNext: function () {
        var me = this,
            total = me.getPageData().pageCount,
            next = me.store.currentPage + 1;

        if (next <= total) {
            me.store.nextPage();
        }
    },

    moveFirst: function () {
        this.store.loadPage(1);
    },

    moveLast: function () {
        var me = this,
            last = me.getPageData().pageCount;

        me.store.loadPage(last);
    }
});