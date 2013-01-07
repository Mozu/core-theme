/**
 * @class Taco.core.ux.modal.Content
 */

Ext.define('Taco.core.ux.modal.Content', {
    extend: 'Taco.core.ux.modal.Modal',
    alias: 'widget.contentmodal',

    cls: 'taco-content',

    marginTop: 74,
    autoSize: false,
    contentPadding: 30,

    constructor: function (cfg) {
        var me = this;

        cfg = cfg || {};

        // WTF?? Hacky...
        if (cfg.items) {
            if (cfg.items.length && !cfg.content) {
                cfg.content = {
                    items: cfg.items
                };
                cfg.items = null;
            }
        }
        else {
            if (!cfg.content) {
                cfg.content = {
                    items: this.items
                };

                cfg.items = null;
            }
        }

        this.callParent(arguments);

        //Ext.getBody().addListener('resize', this.setPosition, this);
        Taco.app.viewPort.on({
            resize: {
                fn: me.setPosition,
                scope: me
            }
        });
    },

    initComponent: function () {

        var me = this,
            actionItems, contentContainer;

        //Ext.each(items, )
        if (me.items && me.items.length && !(me.content.items && me.content.items.length)) {
            me.content.items = me.items.splice(0);
            me.items = [];
        }

        me.callParent(arguments);

        contentContainer = me.down('contentcontainer');

        if (contentContainer && contentContainer.header && contentContainer.header.actionsContainer) {
            actionItems = contentContainer.header.actionsContainer.items.items.slice(0);
            Ext.each(actionItems, function (item) {

                me.actions.add(item);
                contentContainer.header.actionsContainer.remove(item);
            });

            contentContainer.header.actionsContainer.hide();
        }

        if (this.autoSize) {
            this.cls += ' taco-auto-size';
        }

        this.getContentContainer = function () {
            return contentContainer;
        };

        this.getHeader = function () {
            return contentContainer.header;
        };

        this.getContent = function () {
            return contentContainer.body;
        };

    },

    show: function () {
        this.el.setStyle({
            display: 'block'
        });

        this.isHidden = false;

        this.setPosition();

        if (this.autoSize) {
            this.setAutoHeight();
        }

        this.callParent(arguments);

        // TODO: Fix hack
        //Ext.defer(this.doLayout, 3000, this);
    },

    /**
     * @private
     */
    setPosition: function () {
        var bodyHeight = Ext.getBody().getViewSize().height;

        if (this.isHidden) {
            return;
        }

        this.setContentHeight(bodyHeight - 200);

        return bodyHeight;
    },

    /**
     * @private
     */
    setAutoHeight: function () {
        var contentHeight = this.content.getHeight(),
            headerHeight = this.down('contentheader').getHeight(),
            itemsHeight = 2,
            contentBody = this.down('contentbody'),
            contentBodyEl = contentBody.getEl();

        itemsHeight += parseInt(contentBodyEl.getStyle('padding-top')) || 0;
        itemsHeight += parseInt(contentBodyEl.getStyle('padding-bottom')) || 0;

        contentBody.items.each(function (item) {
            itemsHeight += item.getHeight();
        });

        //  Check to see if the content modal will be larder than the screen
        if (contentHeight <= headerHeight + itemsHeight) {
            return;
        }

        this.setContentHeight(headerHeight + itemsHeight);
    },

    /**
     * @private
     */
    setContentHeight: function (height) {
        var contentContainer = this.down('contentcontainer');

        this.content.setHeight(height);

        if (contentContainer && contentContainer.setHeight) {
            contentContainer.setHeight(height);
        }
    }
});
