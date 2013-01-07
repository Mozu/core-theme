/**
 * @class Taco.core.ux.modal.Mini
 */
Ext.define('Taco.core.ux.modal.Mini', {
    extend: 'Taco.core.ux.modal.Modal',
    alias: 'widget.minimodal',

    cls: 'taco-mini-modal',

    coverCfg: {
        opacity: 0
    },

    target: null,
    position: 't-b',
    offset: [0,0],

    initComponent: function () {

        this.callParent(arguments)

        this.close.hide()

        this.on({
            coverclick: this.hide,
            scope: this
        })
    },

    alignTo: function (target, position, offsets) {
        var el, targetEl, alignXY
        
        if (!target)
            target = this.target
        if (!position)
            position = this.position

        targetEl = target.isComponent ? target.getEl() : Ext.fly(target)
        el = this.getEl()

        alignXY = el.getAlignToXY(targetEl, position, offsets)

        el.setStyle({
            left: alignXY[0] + 'px',
            top: alignXY[1] + 'px'
        })

        el.set({
            'data-align-to-target': position
        })
    },

    show: function (target, position, offset) {
        var marginLeft, marginTop, zIndex = this.getNextZIndex()

        if (target) {
            this.target = target
        }

        if (position) {
            this.position = position
        }

        if (offset) {
            this.offset = offset
        }

        this.fireEvent('beforeshow')

        if (this.isModal) {
            this.cover.show();
        }

        this.getEl().setStyle({
            display: 'block',
            marginLeft: 0,
            marginTop: 0
        })

        if (zIndex > 1) {
            this.cover.getEl().setStyle({
                zIndex: zIndex
            })
            this.getEl().setStyle({
                zIndex: zIndex + 1
            })
        }

        this.doLayout()

        this.alignTo(this.target, this.position, this.offset)

        this.getEl().animate({
            duartion: this.duration,
            easing: this.easingShow,
            to: {
                marginTop: 20,
                opacity: 1
            },
            listeners: {
                afteranimate: function () {
                    this.fireEvent('aftershow');
                },
                scope: this
            }
        })

        this.hidden = false
        this.fireEvent('show')
    }
})