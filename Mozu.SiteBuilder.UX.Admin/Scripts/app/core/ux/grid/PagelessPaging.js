/**
 * Extension of PagingToolbar to replace paging controls with a set of link buttons
 */
var MOVE_NEXT = 'MOVE_NEXT';
var MOVE_PREVIOUS = 'MOVE_PREVIOUS';
var MOVE_FIRST = 'MOVE_FIRST'
var MOVE_LAST = 'MOVE_LAST';

Ext.define('Taco.core.ux.grid.PagelessPaging', {
    extend: 'Ext.toolbar.Paging',
    alias: 'widget.taco.linkpagingtoolbar',

    pageChooser: null,

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
        var lastDisplayed;
        var firstDisplayed;
        var arrowLeftCls = currPage === 1 ? this.getClsName('tbar-page-link', 'arrow-disabled') : this.getClsName('tbar-page-link');
        var arrowRightCls = currPage === lastPage ? this.getClsName('tbar-page-link', 'arrow-disabled') : this.getClsName('tbar-page-link');
        var refreshCls = this.getClsName('refresh-btn');
        var refreshBtn = {
            itemId: 'refresh',
            cls: refreshCls,
            handler: function () {
                this.store.reload();
            },
            text: '',
            scope: me
        };

        lastDisplayed = Math.max(currPage + 2, 5);
        lastDisplayed = Math.min(lastDisplayed, lastPage);
        firstDisplayed = Math.min(currPage - 2, lastPage - 4);
        firstDisplayed = Math.max(firstDisplayed, 1);


        pageNumberItems.push({
            itemId: 'prev',
            cls: arrowLeftCls + ' paginationArrows pagination-arrow-left pageless',
            handler: function () {
                return me.handlePagerAction(MOVE_PREVIOUS)
            },
            text: 'Prev',
            scope: me,
        });
        

        pageNumberItems.push({
            itemId: 'next',
            cls: arrowRightCls + ' paginationArrows pagination-arrow-right pageless',
            handler: function () {
                return me.handlePagerAction(MOVE_NEXT)
            },
            text: 'Next',
            style: {
                width: '45px'
            },
            scope: me,
        });

        pageNumberItems.push(refreshBtn);


        return pageNumberItems;
    },

    initComponent: function () {
        var me = this;

        if (me.grid) me.grid.on('reconfigure', me.onReconfigure, this);

        me.moveNext = function(){
            var me = this,
                store = me.store;

                if(me.store.data.items.length === me.store.pageSize) {
                    if (me.fireEvent('beforechange', me) !== false) {
                        store.nextPage();
                        return true;
                    }
                }

            return false;
        };

        me.movePrevious = function(){
            var me = this,
                store = me.store;

            if (me.fireEvent('beforechange', me) !== false) {
                store.previousPage();
                return true;
            }

            return false;
        };

        me.callParent();
    },

    onReconfigure: function (grid, store) {
        if (!store) {
            return;
        }
        this.store = store;
        this.store.on('load', this.onLoad, this, { single: true });
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

        me.syncPager();

        if (me.rendered) {
            me.fireEvent('change', me, pageData);
        }
    },

    getClsName: function () {
        var prefix = Ext.baseCSSPrefix;
        var args = Array.prototype.slice.call(arguments);

        return args.map(function (str) { return prefix + str + ' ' });
    },

    onPageClicked: function () {
        var me = this.scope,
            idx = this.idx;

        if (me.fireEvent('beforechange', me, idx) !== false) {
            me.store.loadPage(idx);
            me.syncPager();
        }
    },

    handlePagerAction: function (action) {
        var me = this;
        
        switch (action) {
            case MOVE_NEXT:
                me.moveNext();
                break;
            case MOVE_PREVIOUS:
                me.movePrevious();
                break;
            case MOVE_FIRST:
                me.moveFirst();
                break;
            case MOVE_LAST:
                me.moveLast();
                break;
            default:
                return;
        }
        me.syncPager();
    },

    syncPager: function () {
        var me = this;
        var viewmenu = me.getComponent('taco-view-menu');

        for (var i = 0; me.items.items.length > i;) {
            if (me.items.items[i] === viewmenu) {
                i++
            }
            else {
                me.remove(me.items.items[i]);
            }
        }

        var pagingItems = me.getPagingItems();
        pagingItems = viewmenu
            ? Ext.Array.insert(pagingItems, pagingItems.length - 2, [viewmenu])
            : pagingItems;

        me.add(pagingItems);
        me.updateInfo();
    },

    onChoosePage: function () {
        var me = this.scope;
        var button = me.child(this.buttonId);


        if (!me.pageChooser) {
            me.pageChooser = new Ext.menu.Menu({
                plain: true,
                cls: Ext.baseCSSPrefix + 'page-chooser',
                shadow: 'frame',
                defaultAlign: 'b-t',
                items: [{
                    xtype: 'toolbar',
                    items: [
                        {
                            xtype: 'numberfield',
                            itemId: 'pageNumberField',
                            name: 'pageNumberField',
                            cls: me.getClsName('tbar-page-number'),
                            allowDecimals: false,
                            minValue: 1,
                            hideTrigger: true,
                            keyNavEnabled: false,
                            submitValue: false,
                            // mark it as not a field so the form will not catch it when getting fields
                            isFormField: false,
                            width: me.inputItemWidth,
                            margins: '-1 2 3 2',
                            listeners: {
                                specialkey: {
                                    scope: me,
                                    fn: function (cmp, e) {
                                        if (e.keyCode === 13) {
                                            Ext.ComponentQuery.query("#go-to-page")[0].handler();
                                        }
                                    }
                                }
                            }
                        },
                        {
                            text: 'Go to Page',
                            itemId: 'go-to-page',
                            cls: me.getClsName('page-choose-btn'),
                            handler: function () {
                                var v = Ext.ComponentQuery.query("#pageNumberField")[0].getValue(),
                                    pageNum = parseInt(v, 10);

                                if (v && !isNaN(pageNum)) {
                                    var pageData = me.getPageData();
                                    pageNum = Math.min(Math.max(1, pageNum), pageData.pageCount);
                                    if (me.fireEvent('beforechange', me, pageNum) !== false) {
                                        me.store.loadPage(pageNum);
                                        me.syncPager();
                                    }
                                }
                                me.pageChooser.hide();
                            }
                        }
                    ]
                }]
            });

            me.pageChooser.addListener('show', function () {
                var pageData = me.getPageData(),
                    pageNumberField = Ext.ComponentQuery.query("#pageNumberField")[0];

                if (!pageNumberField) {
                    console.log('pageNumberField not found');
                    return;
                }
                pageNumberField.setValue(pageData.currentPage);
                pageNumberField.focus(true, true);
                return true;
            });

        }

        me.pageChooser.showBy(button);
    }

});