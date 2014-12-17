;
(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        editor;

    editor = {
        _dragging: false,

        init: function() {

            this.$hintBar = $([
                '<div class="mz-cms-hint-bar" style="display:none">',
                    '<div class="mz-cms-hint-message"></div>',
                '</div>'
            ].join('')).appendTo('body');

            $doc.on({
                mousemove: $.proxy(this._onMousemove, this)
            });

            $('body').addClass('mz-cms-editing');

            $('.mz-cms-grid').mzGrid();

            Chorizo.widgets.init();

            this.fireEvent('pageload', this);

            this.resetDirtyState();
        },

        showWidgets: function() {
            this.$widgetModal.show();
        },

        edit: function(block) {
            this.fireEvent('widgetedit', {
                editor: this,
                data: block.element.data('widget'),
                callback: function(html, data) {
                    block.update(html, data);
                }
            });
        },

        fireEvent: function() {
            this.controller().fireEvent.apply(this.controller(), arguments);
        },

        dirtyStateCheck: function() {
            var newState = JSON.stringify(this.persistanceData()),
                dirty = newState !== this._currentState;

            if (this._dirty === dirty) return;
            
            this._dirty = dirty;
            this.fireEvent('dirtychange', this, dirty);
        },
        
        isDirty: function () {
            return this._dirty;
        },

        resetDirtyState: function() {
            this._currentState = JSON.stringify(this.persistanceData());
            this._dirty = false;
        },

        controller: function() {
            if (this._controller) return this._controller;
            if (!win.parent.Taco) {
                // Mock something up
                return {
                    fireEvent: function(name) {
                        if (name === 'widgetdrop') {
                            arguments[1].callback('<h1>Header1</h1><p>Paragraph2</p>', {});
                        }
                        console.log('Editor Event: ', name, Array.prototype.slice.call(arguments, 1));
                    },
                    findWidgetTypeDefinitions: function(filter, callback) {
                        callback([{
                            "name": "Featured Products",
                            "isRichText": false,
                            "icon": "/resources/admin/widgets/_0007_featured-products.png",
                            "id": "featured_product"
                        }, {
                            "name": "Content",
                            "isRichText": true,
                            "icon": "/resources/admin/widgets/_0004_html.png",
                            "id": "content"
                        }, {
                            "name": "test image",
                            "isRichText": false,
                            "icon": "/resources/admin/widgets/_0004_html.png",
                            "id": "image"
                        }, {
                            "name": "Horizontal Rule",
                            "isRichText": false,
                            "icon": "/resources/admin/widgets/_0005_horizontal-divider.png",
                            "id": "horizontal_rule"
                        }, {
                            "name": "AddThis",
                            "isRichText": false,
                            "icon": "/resources/admin/widgets/_0008_share.png",
                            "id": "addthis"
                        }, {
                            "name": "Facebook Comments",
                            "isRichText": false,
                            "icon": "/resources/admin/widgets/_0008_share.png",
                            "id": "facebook_comments"
                        }]);
                    }
                };
            }
            return this._controller = win.parent.Taco.app.controllers.get('Website');
        },

        columnResizing: function(val) {
            if (val !== undefined) this._columnResizing = val;
            return this._columnResizing;
        },

        dragging: function(val) {
            if (typeof val !== 'undefined') this._dragging = val;
            return this._dragging;
        },

        initDragIconMove: function(icon) {

            this.dragIcon = icon;
            icon.appendTo('body');
            var padding = 10; //to keep the dragIcon slightly to the bottom left

            $(document).on('mousemove', function(e) {
                $(icon).css({ left: e.pageX + padding, top: e.pageY + padding});
            });
        },

        destroyDragIcon: function() {
            this.dragIcon.remove();
        },

        startDrag: function(widgetCfg, dragIcon) {
            // if (dragIcon) this.initDragIconMove(dragIcon);

            if (dragIcon) {
                this.initDragIconMove(dragIcon);
            }

            else {
                var widgets = this.widgets(),
                    dragIcon = widgets.getDragIcon( widgets.widgetIconDefinitions[ widgetCfg.widgetData.definitionId ] );

                this.initDragIconMove(dragIcon);
            }

            if (widgetCfg && widgetCfg.type && widgetCfg.type() === 'block') {
                widgetCfg = {
                    block: widgetCfg
                };
            }

            this.widgetCfg = widgetCfg || {};
            $('.mz-cms-grid').addClass('mz-cms-droppable');
            this.dragging(true);
            this.cursor('move');
        },

        stopDrag: function() {
            $('.mz-cms-grid').removeClass('mz-cms-droppable');
            this.cursor('auto');
            this.dragging(false);
            this.$hintBar.css({
                display: 'none',
                left: -1000,
                top: -1000
            });
            
            this.destroyDragIcon();
        },

        widgets: function() {
            return Chorizo.widgets;
        },

        target: function(target) {
            if (!target.hint) return;
            this._target = target;
        },

        clearTarget: function(target) {
            // Only clear if a new target has NOT been set up yet
            if (this._target !== target) return;

            this._target = null;
        },

        showDropZones: function() {
            $('.mz-cms-grid').addClass('mz-cms-show-zone');
        },

        hideDropZones: function() {
            $('.mz-cms-grid').removeClass('mz-cms-show-zone');
        },

        persistanceData: function() {
            var data = [];
            $('.mz-cms-grid').each(function(i, grid) {
                var $grid = $(grid),
                    gridData = {
                        id: $grid.data('drop-zone').id,
                        rows: []
                    };

                $grid.find('.mz-cms-row').each(function(j, row) {
                    var $row = $(row),
                        rowData = {
                            columns: []
                        };

                    $row.find('[class^=mz-cms-col]').each(function(k, col) {
                        var $col = $(col),
                            colData = {
                                span: $col.mzCol('span'),
                                widgets: []
                            };

                        $col.find('.mz-cms-block').each(function(l, block) {
                            var wd = $(block).data('widget');
                            if (wd.definitionId == 'content' && wd.config.body == null) {
                                console.log('content bug travis');
                            }

                            colData.widgets.push($(block).data('widget'));
                        });

                        colData.widgets.length && rowData.columns.push(colData);
                    });

                    rowData.columns.length && gridData.rows.push(rowData);
                });

                data.push(gridData);
            });
            return data;

        },

        drop: function() {
            var target = this._hintTarget,
                quadrant = this._hintQuadrant,
                widgetCfg = this.widgetCfg;

            this.stopDrag();

            // Make sure there is a target and a quadrant
            if (target && quadrant && target.insert) {

                // Moving an existing widget
                if (this.widgetCfg.block) {
                    target.insert(quadrant, widgetCfg);
                } else {
                    // Dropping an new widget
                    this.fireEvent('widgetdrop', {
                        editor: this,
                        widgetTypeId: widgetCfg.id,
                        callback: function(html, data) {
                            data.isRichText = widgetCfg.isRichText;
                            widgetCfg.html = html;
                            widgetCfg.data = data;

                            console.log('drop-data', data);
                            target.insert(quadrant, widgetCfg);
                        }
                    });
                }

            }

            this._hintQuadrant = null;
            this._hintTarget = null;
        },

        overGrid: function(val) {
            this._overGrid = val;
        },
        
        isOverGrid: function(val) {
            return this._overGrid;
        },

        _onMousemove: function(e, ui) {
            var x,
                y,
                data,
                grid;

            // On track when tragging
            if (!this.dragging()) return;

            //  Only fire if tracking a target
            if (!this._target) return;

            x = $doc.scrollLeft() + e.clientX;
            y = $doc.scrollTop() + e.clientY;

            if (!this._overGrid) {
                this.$hintBar.css('display', 'none');
                return;
            }

            data = this._target.hint(x, y);

            this.hint(data)
        },

        hint: function(data) {
            var height = 3,
                width = 3,
                x = data.left - 1,
                y = data.top - 1;

            // If showing the same hint in the same location, abort hinting
            if (this._hintTarget === data.target && this._hintQuadrant === data.quadrant) {
                this.$hintBar.css('display', 'block');
                return;
            }

            this._hintTarget = data.target;
            this._hintQuadrant = data.quadrant;

            switch (data.quadrant) {
                case 'top':
                    width = data.width + 1;
                    break;

                case 'right':
                    height = data.height + 2;
                    x += data.width;
                    break;

                case 'bottom':
                    width = data.width + 1;
                    y += data.height;
                    break;

                case 'left':
                    height = data.height + 2;
                    break;
            }

            this.$hintBar.css({
                left: x,
                top: y,
                height: height,
                width: width,
                display: 'block'
            }).removeClass('mz-cms-upright')
                .find('.mz-cms-hint-message')
                .html(data.message);


            if (data.quadrant === 'left' || data.quadrant === 'right') {
                this.$hintBar.addClass('mz-cms-upright');
            }

        },

        cursor: function(val) {
            if (val !== 'auto') val += ' important!';
            $('body').css('cursor', val);
        }
    };

    $doc.ready(function() {
        if (!win.Chorizo) win.Chorizo = {};
        Chorizo.editor = editor;
        editor.init();
    });

}(jQuery, window, document));