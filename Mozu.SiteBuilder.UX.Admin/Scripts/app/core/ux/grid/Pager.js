/**
 * @class Taco.core.ux.grid.Pager
 */
Ext.define('Taco.core.ux.grid.Pager', {
    extend: 'Ext.Component',
    requires: ['Taco.core.ux.action.Action'],
    alias: 'widget.taco.pager',

    componentCls: Taco.baseCSSPrefix + 'pager',
    dock: 'bottom',
    tpl: [
        '<tpl if="previous"><a href="{previous}" style="margin-right:6px" class="taco-action"><-</a></tpl>',
        '<tpl for="pages">',
            '<a class="taco-action {cls}" href="{page}">{page}</a>',
        '</tpl>',
        '<tpl if="next"><a href="{next}" style="margin-left:6px" class="taco-action">-></a></tpl>'
    ],

    store: null,

    initComponent: function () {
        var me = this;

        this.callParent(arguments);

        this.mon(this.store, 'load', this.onLoad, this);
        this.on('beforerender', this.onLoad, this, {
            single: true
        });
        this.on({
            click: {
                element: 'el',
                fn: this.onClick
            },
            scope: this
        });
    },

    onLoad: function (store) {
        var pageData = this.getPageData();

        this.update(pageData);
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

    movePrevious: function () {
        var me = this,
            prev = me.store.currentPage - 1;

        if (prev > 0) {
            me.store.previousPage();
        }
    },

    moveNext: function () {
        var total = this.getPageData().lastPage,
            next = this.store.currentPage + 1;

        if (next <= total) {
            this.store.nextPage();
        }
    },

    moveFirst: function () {
        this.store.loadPage(1);
    },

    moveLast: function () {
        var last = this.getPageData().lastPage;

        this.store.loadPage(last);
    }
});