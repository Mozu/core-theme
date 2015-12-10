/**
 * Extension of PagingToolbar to replace paging controls with a set of link buttons
 */
Ext.define('Taco.core.ux.grid.LinkPaging', {
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
        var arrowLeftCls = currPage === 1 ? this.getClsName('tbar-page-link ', 'tbar-page-link-current', 'arrow-left') : this.getClsName('tbar-page-link');
        var arrowRightCls = currPage === lastPage ? this.getClsName('tbar-page-link ', 'tbar-page-link-current', 'arrow-right') : this.getClsName('tbar-page-link');

        lastDisplayed = Math.max(currPage + 2, 5);
        lastDisplayed = Math.min(lastDisplayed, lastPage);
        firstDisplayed = Math.min(currPage - 2, lastPage - 4);
        firstDisplayed = Math.max(firstDisplayed, 1);

        if (pageData.pageCount !== 0) {

            pageNumberItems.push({
                itemId: 'prev',
                cls: arrowLeftCls,
                handler: me.movePrevious,
                text: "<",
                scope: me,
            });
        }


        if (firstDisplayed - 1 > 0) {
            pageNumberItems.push({
                itemId: 'first',
                cls: this.getClsName('tbar-page-link'),
                handler: me.moveFirst,
                text: "1",
                scope: me,
            });
        }

        if (firstDisplayed - 1 > 1) {
            pageNumberItems.push({
                itemId: 'prev-ellipsis',
                cls: Ext.baseCSSPrefix + 'tbar-page-link',
                handler: me.onChoosePage,
                text: '&#x22ef;',
                scope: {
                    scope: me,
                    buttonId: '#prev-ellipsis'
                },
            });
        }

        for (var pageNumber = firstDisplayed; pageNumber <= lastDisplayed; pageNumber++) {

            var cls = (function() { 

                var iconCls = pageNumber == currPage ? this.getClsName('tbar-page-link-current', 'tbar-page-link') : this.getClsName('tbar-page-link');

                if (pageNumber === 1 && pageNumber == currPage) {
                    iconCls = this.getClsName('tbar-page-link', 'tbar-page-link-current');
                }

                if (pageNumber === lastDisplayed && pageNumber == currPage) {
                    iconCls = this.getClsName('tbar-page-link', 'tbar-page-link-current');
                }

                return iconCls;

            }).call(this);

            pageNumberItems.push({
                itemId: 'tbar-page-link' + pageNumber,
                cls: cls,
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
                cls: this.getClsName('tbar-page-link'),
                handler: me.onChoosePage,
                text: "&#x22ef;",
                scope: {
                    scope: me,
                    buttonId: '#next-ellipsis'
                },
            });
        }

        if (lastPage - lastDisplayed > 0) {
            pageNumberItems.push({
                itemId: 'last',
                cls: this.getClsName('tbar-page-link'),
                handler: me.moveLast,
                text: lastPage,
                scope: me,
            });
        }

        if (pageData.pageCount !== 0) {
            
            pageNumberItems.push({
                itemId: 'next',
                cls: arrowRightCls,
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

        me.grid.on('reconfigure', me.onReconfigure, this);

        me.callParent();
    },

    onReconfigure: function(grid, store) {
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

        me.removeAll();
        me.add(me.getPagingItems());
        me.updateInfo();

        if (me.rendered) {
            me.fireEvent('change', me, pageData);
        }
    },

    getClsName: function() {
        var prefix = Ext.baseCSSPrefix;
        var args = Array.prototype.slice.call(arguments);

        return args.map(function(str) { return prefix + str + ' '});

    },

    onPageClicked: function () {
        var me = this.scope,
            idx = this.idx;

        if (me.fireEvent('beforechange', me, idx) !== false) {
            me.store.loadPage(idx);
        }
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
                                    fn: function(cmp, e) {
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
                                    }
                                }
                                me.pageChooser.hide();
                            }
                        }
                    ]
                }]
            });

            me.pageChooser.addListener('show', function () {
                var pageData = me.getPageData();
                Ext.ComponentQuery.query("#pageNumberField")[0].setValue(pageData.currentPage);
                return true;
            });

        }

        me.pageChooser.showBy(button);
    }

});