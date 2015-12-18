Ext.define('Taco.core.ux.PrevNextArrowButtons', {
    extend: 'Ext.Component',
    alias: 'widget.taco.prevnext',

    cls: 'taco-prev-next-arrows',

    initComponent: function () {

        this.addEvents([
            'navigateToPrevious',
            'navigateToNext'
        ]);

        this.tpl = [
            '<div class="{prevCls}"></div>',
            '<div class="{nextCls}"></div>'
        ];

        this.data = {
            prevCls: 'arrow prev ' + (!this.canNavigateToPrevious ? 'disabled' : ''),
            nextCls: 'arrow next ' + (!this.canNavigateToNext ? 'disabled' : '')
        };

        this.callParent(arguments);

        this.on({
            click: {
                fn: function (e) {
                    var el = Ext.fly(e.target),
                        me = this;

                    if (el.hasCls('prev') && this.canNavigateToPrevious) {
                        this.tooltip.hideTooltip(function () {
                            me.fireEvent('navigateToPrevious');
                        });
                        return;
                    }

                    if (el.hasCls('next') && this.canNavigateToNext) {
                        this.tooltip.hideTooltip(function () {
                            me.fireEvent('navigateToNext');
                        });
                        return;
                    }
                },
                element: 'el',
            },
            beforedestroy: function () {
                Ext.destroy(this.tooltip);
            },
            scope: this
        });

        this.tooltip = Ext.create('Taco.core.ux.content.Tooltip', {
            arrowPosition: 'bottom',
            elementId: this.itemId,
            hoverTarget: 'el',
            defaultTpl: [
                '1 of 1'
            ],
            defaultTplData: {
                publishSetName: 'Unassigned',
                publishDate: 'Unscheduled'
            },
            offsetTop: 25
        })
    }
});