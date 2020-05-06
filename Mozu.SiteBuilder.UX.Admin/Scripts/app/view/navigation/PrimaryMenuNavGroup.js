/**
 * @class Taco.view.navigation.PrimaryMenuNavGroup
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenuNavGroup', {
    //id: 'color' + this.get('menucolor'),
    extend: 'Ext.container.Container',
    alias: 'widget.primary-menu-nav-group',
    requires: ['Taco.view.navigation.PrimarySubMenu'],
    record: null,
    collapsible: true,
    width: '100%',

    initComponent: function () {
        var me = this,
            htmlText = "",
            subItemStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.NavigationItem',
                data: this.record.get('items')
            });

        this.collapsedStateKey = 'primary-nav-collapsed-' + me.record.get('id');

        Ext.state.Manager.set(this.collapsedStateKey, true);
        if (this.compareState(this.record.get('id'), this.record.get('items'))) {
            Ext.state.Manager.set(this.collapsedStateKey, false);
        }
        this.subMenuItems = Ext.create('Taco.view.navigation.PrimarySubMenu', {
            hidden: Ext.state.Manager.get(this.collapsedStateKey),
            store: subItemStore,
            record: this.record
        });
        htmlText = me.returnHtmlText(this.record.get('id'));
        this.items = [{
            html: htmlText,
            width: '100%',
            listeners: {
                element: 'el',
                click: function (e) {
                    me.redirectToLinks(e.target.innerText);
                    if (!me.subMenuItems) {
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();

                    if (me.subMenuItems.isVisible()) {
                        //var t = e.getTarget('i', true);
                        var colorel = Ext.get('color-' + me.record.get('label'));
                        var colorel2 = Ext.get(colorel); // takes an Ext.Element
                        var t2 = Ext.get(colorel.dom); // takes an HTMLElement
                        Ext.fly(t2).removeCls('fas');
                        Ext.fly(t2).addCls('fal');

                        var el1 = Ext.get(me.record.get('label')); // takes an element id
                        var el2 = Ext.get(el1); // takes an Ext.Element
                        var t = Ext.get(el1.dom); // takes an HTMLElement
                        Ext.fly(t).removeCls('fa-chevron-up');
                        Ext.fly(t).addCls('fa-chevron-down');
                        me.subMenuItems.hide();
                        var className = document.querySelectorAll('.taco-primary-menu-heading .fa-chevron-down');
                        Ext.state.Manager.set(me.collapsedStateKey, true);
                    } else {
                        var colorel = Ext.get('color-' + me.record.get('label'));
                        var colorel2 = Ext.get(colorel); // takes an Ext.Element
                        var t2 = Ext.get(colorel.dom); // takes an HTMLElement
                        Ext.fly(t2).removeCls('fal');
                        Ext.fly(t2).addCls('fas');

                        if (!(e.target.innerText == 'Fulfiller' || e.target.innerText == 'Order Routing' || e.target.innerText == 'Home' || e.target.innerText == 'Help')) {
                            var el1 = Ext.get(me.record.get('label')); // takes an element id
                            var el2 = Ext.get(el1); // takes an Ext.Element
                            var t = Ext.get(el1.dom); // takes an HTMLElement
                            console.log(t);
                            Ext.fly(t).removeCls('fa-chevron-down');
                            Ext.fly(t).addCls('fa-chevron-up');
                            me.subMenuItems.show();
                            Ext.state.Manager.set(me.collapsedStateKey, false);
                        }
                    }

                    return false;
                }
            }
        },
        this.subMenuItems
        ];

        this.callParent(arguments);

    },

    returnHtmlText: function (id) {
        var htmlText = "",
            recordLabel = this.record.get('label'),
            recordId = id,
            recordMenuColor = this.record.get('menucolor'),
            recordIcon = this.record.get('icon'),
            collapsedStateKey = Ext.state.Manager.get(this.collapsedStateKey),
            isShowChevronIcon = (recordLabel == "Home" || recordLabel === "Help" || recordId === "switchToClassic" || recordId === "fulfillment" || recordId === "orderRoutingParent" || recordId === "report");
        switch (id) {
            case 'userName':
                htmlText = '<div style="width:316px;height:4px;background-image:linear-gradient(to bottom,rgba(0, 0, 0, 0),rgba(0, 0, 0, 0.08)99%);"></div><label class="taco-primary-menu-heading color-kibo-' + recordMenuColor + ' "><i id="color-' + recordLabel + '" class="usericon menuicon fal ' + recordIcon + ' color-kibo-' + recordMenuColor + '"></i><span>' + recordLabel + '</span><i id="' + recordLabel + '" class="chevronicon fal ' + (isShowChevronIcon ? ' ' : ((collapsedStateKey ? 'fa-chevron-down' : 'fa-chevron-up'))) + '"></i></label>';
                return htmlText;
            case 'tenantName':
                htmlText = '<label class="tenant-wrapper taco-primary-menu-heading"><i id="color-' + recordLabel + '" class="menuicon fal ' + recordIcon + ' color-kibo-' + recordMenuColor + '"></i><span>' + recordLabel + '</span> <i id="' + recordLabel + '" class="chevronicon fal ' + (isShowChevronIcon ? ' ' : ((collapsedStateKey ? 'fa-chevron-down' : 'fa-chevron-up'))) + '"></i></label><hr>';
                return htmlText;
            case 'switchToClassic':
                htmlText = '<label class="taco-primary-menu-heading main-menu-' + recordId + ' color-kibo-' + recordMenuColor + ' "><i id="color-' + recordLabel + '" class="menuicon fal ' + recordIcon + ' color-kibo-light' + recordMenuColor + '"></i><span class = "color-kibo-light' + recordMenuColor + '">' + recordLabel + '</span><i id="' + recordLabel + '" class="chevronicon fal ' + (isShowChevronIcon ? ' ' : ((collapsedStateKey ? 'fa-chevron-down' : 'fa-chevron-up'))) + '"></i></label>';
                return htmlText;
            default:
                htmlText = '<label class="taco-primary-menu-heading main-menu-' + recordId + ' color-kibo-' + recordMenuColor + ' "><i id="color-' + recordLabel + '" class="menuicon fal ' + recordIcon + ' color-kibo-' + recordMenuColor + '"></i><span>' + recordLabel + '</span><i id="' + recordLabel + '" class="chevronicon fal ' + (isShowChevronIcon ? ' ' : ((collapsedStateKey ? 'fa-chevron-down' : 'fa-chevron-up'))) + '"></i></label>';
                return htmlText;
        }
    },

    redirectToLinks: function (innerText) {
        switch (innerText) {
            case 'Home':
                window.location.href = '/admin';
                return;
            case 'Fulfiller':
                var fulFillerURL = window.location.origin + '/_fulfiller';
                window.location.href = fulFillerURL;
                return;
            case 'Order Routing':
                var orderRoutingURL = Taco.app.context.getOrderRoutingURI() + '?service=/_orderRouting/login/cas';
                window.location.href = orderRoutingURL;
                return;
            case 'Reports':
                var reprotsURL = window.location.origin + '/admin/' + Taco.app.context.getReportURL();
                window.location.href = reprotsURL;
                return;
            case 'Help':
                window.open('https://www.mozu.com/docs/guides/guides.htm');
                return;
            case 'Switch to Classic UI':
                Ext.util.Cookies.set('isUnified', false);
                window.location.reload(true);
                return;
        }
    },

    compareState: function (address, items) {
        var data = Taco.app.StateManager.getCurrentState().complexMetaData;
        var returnVal = (address === data.controller || address === data.controller + '/' + data.action);
        if (!returnVal) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === data.controller) {
                    return true;
                }
            }
        }
        return returnVal;
    },

    updateCurrentPage: function () {
        Ext.each(this.subMenuItems, function (item) {
            item.updateCurrentPage();
        });
    }

});