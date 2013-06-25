/**
 * @class Taco.core.ux.modal.Modal
 */
Ext.define('Taco.core.ux.modal.Modal', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.modal.Cover'],
    alias: 'widget.taco.modal',
    baseCls: 'taco-modal',
    content: {
        items: []
    },
    actions: {
        items: []
    },
    autoShow: false,
    isModal: true,
    closeButton: true,
    destroyOnHide: true,
    fullHeight: false,

    
    opacity: 1,
    easingShow: 'easeOut',
    easingHide: 'easeIn',
    duration: 300,

    initComponent: function () {
        this.renderTo = Ext.getBody();
        Ext.apply(this.content, {
            cls: 'taco-body'
        });

        Ext.apply(this.actions, {
            cls: 'taco-actions'
        });

        this.hidden = true;

        this.content = Ext.create('Ext.container.Container', this.content);
        this.actions = Ext.create('Ext.container.Container', this.actions);

        this.close = Ext.create('Ext.Component', {
            cls: 'taco-close',
            html: 'Close Modal',
            listeners: {
                click: {
                    fn: this.hide,
                    element: 'el'
                },
                scope: this
            }
        });

        this.cover = Ext.create('Taco.core.ux.modal.Cover', Ext.apply({
            destroyOnHide: this.destroyOnHide
        }, this.coverCfg))

        this.callParent(arguments);

        this.animation = {
            opacity: this.opacity,
            duration: this.duration
        };

        this.add([this.content, this.actions]);

        if (this.closeButton) {
            this.add(this.close);
        }

        this.cover.on({
            click: function () {
                this.fireEvent('coverclick');
            },
            scope: this
        });

        if (this.destroyOnHide) {
            this.on({
                afterhide: this.destroy,
                scope: this
            });
        }
    },

    setMargins: function (forceWidth, forceHeight) {
        return {
            marginLeft: -(forceWidth || this.getEl().getWidth()) / 2,
            marginTop: -(forceHeight || this.getEl().getHeight()) / 2 -10
        };
    },

    show: function () {
        var forceHeight,
            padding;

        this.fireEvent('beforeshow');

        if (this.isModal) {
            this.cover.show();
        }

        this.getEl().setStyle({
            display: 'block'
        });

        if (this.fullHeight) {
            forceHeight = Ext.getBody().getViewSize().height - 200;
            padding = parseFloat(this.getEl().getStyle('paddingTop')) + parseFloat(this.getEl().getStyle('paddingBottom'));
            this.setHeight(forceHeight);
            this.content.setHeight(forceHeight - padding - this.actions.getHeight());
        }
        
        this.addListener('afterlayout', function () {
            this.finishShow(forceHeight);
        }, this, {single: true});

        this.hidden = false;

        this.doLayout();

        //Ext.defer(this.finishShow, 1, this, [forceHeight]);

        //this.hidden = false;
    },

    finishShow: function (forceHeight) {
        var zIndex = this.getNextZIndex(),
            margins = this.setMargins(undefined, forceHeight);

        this.getEl().setStyle({
            marginLeft: margins.marginLeft + 'px',
            marginTop: margins.marginTop - 10 + 'px'
        });

        if (zIndex > 1) {
            this.cover.getEl().setStyle({
                zIndex: zIndex
            })
            this.getEl().setStyle({`
                zIndex: zIndex + 1
            })
        }

        //this.doLayout();

        this.getEl().animate({
            duartion: this.duration,
            easing: this.easingShow,
            to: {
                marginTop: margins.marginTop,
                opacity: 1
            },
            listeners: {
                beforeanimate: function () {
                    this.doLayout();
                },
                afteranimate: function () {
                    this.fireEvent('aftershow');
                },
                scope: this
            }
        });

        this.hidden = false;
        this.fireEvent('show');
    },

    hide: function () {
        var marginTop;


        if (this.isHiding || this.hidden) {
            console.log('already hidden', this.isHiding, this.hidden)
            return;
        }

        this.isHiding = true;

        marginTop = parseInt(this.getEl().getStyle('marginTop'), 10);

        if (!this.fireEvent('beforehide')) {
            return;
        }

        

        this.cover.hide();

        // TODO: Temp modal fix if it fails to close for some reason
        this.fallBackFail = true;
        Ext.defer(function () {
            if (!this.fallBackFail) {
                return;
            }
            this.getEl().setStyle('opacity', 0);
            this.fireEvent('afterhide');
        }, this.animation.duration + 200, this);

        this.getEl().animate(Ext.apply(this.animation, {
            listeners: {
                afteranimate: function () {
                    this.isHiding = false;
                    Ext.defer(function () {
                        this.fallBackFail = false;
                        this.fireEvent('afterhide');
                    }, 10, this);
                },
                scope: this
            },
            easing: this.easingHide,
            opacity: 0,
            marginTop: marginTop + 10 + 'px'
        }));



        this.hidden = true;
        this.fireEvent('hide');
    },

    gracefullDestroy: function () {
        this.hide();
    },

    getNextZIndex: function () {
        var highest = 0
        Ext.each(Ext.query('.x-window:not(.x-window-ghost), .x-layer'), function () {
            var num = window.parseInt(Ext.fly(this).getStyle('zIndex'))

            if (!window.isNaN(num) && window.isFinite(num) && num > highest) {
                highest = num
            }
        });

        return highest + 1
    }
});