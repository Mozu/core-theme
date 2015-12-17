Ext.define('Taco.core.ux.PrevNextArrowButtons', {
    extend: 'Ext.Component',
    alias: 'widget.taco.prevnext',

    cls: 'taco-prev-next-arrows',

    initComponent: function () {

        this.addEvents([
            'navigateToPrevious',
            'navigateToNext'
        ]);

        this.tpl = '<div class="{prevCls}">P</div><div class="{nextCls}">N</div>';

        this.data = {
            prevCls: 'arrow prev',
            nextCls: 'arrow next'
        };

        this.callParent(arguments);

        this.on({
            click: function (e) {
                var el = Ext.fly(e.target);

                if (el.hasCls('prev')) {
                    return this.fireEvent('navigateToPrevious');
                }

                if (el.hasCls('next')) {
                    return this.fireEvent('navigateToNext');
                }
            },
            element: 'el',
            scope: this
        })
    }
});