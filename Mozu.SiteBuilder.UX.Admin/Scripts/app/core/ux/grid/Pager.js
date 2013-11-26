/**
 * @class Taco.core.ux.grid.Pager
 */
Ext.define('Taco.core.ux.grid.Pager', {
    extend: 'Ext.Component',
    alias: 'widget.taco.pager',
    requires: [
        'Taco.core.ux.action.Action'
    ],

    componentCls: Taco.baseCSSPrefix + 'pager',
    dock: 'bottom',

    tpl: [
        '<tpl if="previous"><a href="{previous}" class="taco-pager-item previous">Previous</a></tpl>',
        '<div class="taco-pager-list"><tpl for="pages">',
            '<a class="taco-pager-item {cls}" href="{page}">{page}</a>',
        '</tpl></div>',
        '<tpl if="next"><a href="{next}" class="taco-pager-item next">Next</a></tpl>'
    ],

    store: null,

    initComponent: function () {
        var me = this;

        this.callParent(arguments);

        this.mon(this.store, {
            load: {
                scope: this,
                fn: 'onLoad'
            }
        });

        this.on({
            beforerender: {
                scope: this,
                fn: 'onLoad',
                single: true
            },
            click: {
                scope: this,
                fn: 'onClick',
                element: 'el'
            }
        });
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

            data = {
                currentPage: 1,
                lastPage: 1,
                previous: false,
                next: false,
                pages: [{ page: 1, cls: 'active' }]
            };
        } else {
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
        }

        return data;
    },

    moveFirst: function () {
        this.store.loadPage(1);
    },

    moveLast: function () {
        var last = this.getPageData().lastPage;

        this.store.loadPage(last);
    },

    moveNext: function () {
        var total = this.getPageData().lastPage,
            next = this.store.currentPage + 1;

        if (next <= total) {
            this.store.nextPage();
        }
    },

    movePrevious: function () {
        var me = this,
            prev = me.store.currentPage - 1;

        if (prev > 0) {
            me.store.previousPage();
        }
    },

    onClick: function (e, t, options) {
        var page = t.getAttribute('href');

        e.preventDefault();

        if (page) {
            this.store.loadPage(page);
        }
    },

    onLoad: function (store) {
        var pageData = this.getPageData();

        this.update(pageData);
    }
});