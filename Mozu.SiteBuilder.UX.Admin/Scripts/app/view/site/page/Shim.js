/**
 * @author Travis Johnson
 * @class Taco.view.site.page.Shim
 */


    Ext.define('Taco.view.site.page.Shim', {
        extend: 'Ext.container.Container',
        requires: [
            'Taco.view.site.page.WidgetDropZone',
            'Taco.view.site.page.hint.Hint',
            'Taco.view.site.page.hint.Element',
            'Taco.view.site.page.hint.Widget',
            'Taco.view.site.page.hint.Zone',
            'Taco.view.site.widget.AddThis',
            'Taco.view.site.widget.BlogArchive',
            'Taco.view.site.widget.ColumnDivider',
            'Taco.view.site.widget.Editor',
            'Taco.view.site.widget.FacebookComments',
            'Taco.view.site.widget.FeaturedProducts',
            'Taco.view.site.widget.HorizontalRule',
            'Taco.view.site.widget.ImagesGallery',
            'Taco.view.site.widget.JasonImage',
            'Taco.view.site.widget.RecentBlogPosts',
            'Taco.view.site.widget.TagCollection'
        ],
        autoEl: {
            tag: 'div',
            cls: 'taco-shim'
        },

        iframe: null,
        dropZones: null,
        dropZoneSelector: '[data-editing-zone]',
        hideMode: 'offsets',

        constructor: function () {
            this.callParent(arguments);

            this.addEvents(
                'begineditelement',
                'createwidget',
                'aftercreatewidget',
                'movewidget',
                'aftermovewidget',
                'reorderwidget',
                'afterreorderwidget',
                'deletewidget',
                'afterdeletewidget'
            );
        },

        initComponent: function () {
            this._preventFinalHide = 0;

            this.callParent(arguments);

            this.activeHints = [];
        },

        afterRender: function () {
            this.callParent(arguments);

            // this.getEl().setStyle({
            //     top: '-5000px',
            //     left: '-5000px'
            // });

            return;

            this.getEl().on('mouseleave', function () {
                // console.log('leave', this.isHinting);
                if (!this.isHinting) {
                    return;
                }
                this.isHinting = false;
                this.hide();
            }, this);
        },

        createWidgetCallback: function () {
            var newEl, me = this;
            return function (data) {
            //    console.log('createWidgetCallback');
                if (this.dragOp == 'create') {
                    newEl = Ext.DomHelper.insertHtml('afterEnd', this.droppedWidgetEl.dom, data.html);
                    Ext.Array.each(this.droppedWidgetEl.dom.parentElement.children, function(child, idx) {
                        if (child == this.droppedWidgetEl.dom)
                            newEl = this.droppedWidgetEl.dom.parentElement.children[idx + 1];
                    }, this);
                    
                    this.droppedWidgetEl.remove();
                    this.activeHints = [];
                }
                me.fireEvent('aftercreatewidget', data, me, newEl);
            };
        },

        moveWidgetCallback: function () {
            var me = this;
            return function () {
                Ext.getDom(this.associatedEl).appendChild(this.droppedWidgetEl.dom.parentNode.removeChild(this.droppedWidgetEl.dom));
                me.fireEvent('aftermovewidget', this, me);
            }
        },

        reorderWidgetCallback: function () {
            var me = this;
            return function () {
                me.fireEvent('afterreorderwidget', this, me);
            };
        },

        deleteWidgetCallback: function () {
            var me = this;
            return function () {
                var dom = this.widget;
                dom.parentNode.removeChild(dom);
                me.fireEvent('afterdeletewidget', this, me);

            };
        },

        alignHints: function () {
            this.items.each(function (item) {
                item.alignToEl();
            }, this);
        },

        load: function (tree) {
            this.removeAll();

            Ext.each(tree.branches, function (branch) {
                var hint = Taco.view.site.page.hint.Hint.createHint(branch, this);
                this.add(hint);
                hint.alignToEl();
            }, this);
        },

        hint: function () {
            this.isHinting = true;
            this.show();
        },

        show: function (hint) {
            var iframeXY;

            if ( Taco.logLevel == 1 ) {
            //    console.log('show', this.activeHints.length, hint);
            }
          
            if (hint) {
                this.activeHints.push(hint);
            }
            //console.log('shim - show hint', hint, this.activeHints.length, this.activeHints);
            
            if (this.activeHints.length > 0 || true) {
                this.callParent(arguments);
            }

            Ext.defer(function () {
                if (!this.activeHints.length && !this._preventFinalHide) {
                    this.hide();
                }
            }, 100, this);

            if (this.iframe.getEl()) {
                iframeXY = this.iframe.getEl().getXY();
                this.el.setSize(this.iframe.getEl().getSize(false));
                this.el.position('absolute', null, iframeXY[0], iframeXY[1]);
            }
        },

        hide: function (hint) {
            var hintCmp;
            if (hint) {
                this.activeHints.pop();

                // TODO remove any remaning hints on the stack that no longer exist
                // This only happens when drag and drop occurs
                while (this.activeHints[this.activeHints.length - 1] && !this.activeHints[this.activeHints.length - 1].getEl()) {
                    this.activeHints.pop();
                }

                //console.log('shim - hide hint', hint, this.activeHints.length, this.activeHints);
                if (this.activeHints.length) {
                    return;
                }
            }

            if (this._preventFinalHide) {
                return;
            }
            this.callParent(arguments);
        },

        startWidgetDrag: function () {
            this.preventFinalHide();
            this.getEl().addCls('show-hint-zones');
            this.show();
        },

        stopWidgetDrag: function () {
            this.preventFinalHide(false);
            this.getEl().removeCls('show-hint-zones');
            this.hide();
        },

        preventFinalHide: function (option) {
            if (option === false) {
                this._preventFinalHide--;

                if (this._preventFinalHide < 0) {
                    this._preventFinalHide = 0;
                }
                return;
            }

            this._preventFinalHide++;
        }
    });