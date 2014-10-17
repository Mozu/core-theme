!(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        cfg,
        states,
        Target,
        Grid,
        Row,
        Col,
        Block,
        BlankBlock;

    cfg = {
        rowHintMargin: 15,
        colHintMargin: 15,
        colHintRatio: 0.25
    };


    //  GRID class

    Grid = function(element, options) {
        var me = this;

        this.options = $.extend({}, Grid.DEFAULTS, options);
        this.element = $(element);

        this.dropZoneData = this.element.data('drop-zone');
        this.span = this.dropZoneData.span;

        this.element
            .on({
                drop: function (event) {
                    Chorizo.editor.drop();
                    event.stopPropagation();
                }, 
                mouseenter: function() {
                    Chorizo.editor.overGrid(true);
                },
                mouseleave: function() {
                    Chorizo.editor.overGrid(false);
                }
            })
            .droppable({
                accept: '.mz-cms-block, .mz-cms-widget',
                tolerance :'pointer'
            })
            .find('.mz-cms-row')
            .mzRow({
                parent: this
            });

        this.type('grid');

        this.rebase();
    }

    Grid.prototype.hover = function() {
        return this._hover;
    }

    Grid.prototype.type = function(val) {
        if (val) {
            this._type = val;
            return this.element;
        }
        return this._type;
    }

    Grid.prototype.initHint = function() {
        //Chorizo.editor.target(this);
    }

    Grid.prototype.rebase = function() {
        if (!this.element.find('.mz-cms-row').length) {
            this.createBlankBlock();
        }
    }

    Grid.prototype.createBlankBlock = function() {
        var row = Row.create({
                block: BlankBlock.create()
            }, this.span)

        row.parent = this;

        this.element.append(row.element);
    }

    Grid.prototype.snapHeights = function() {
        return this.element
                    .find('.mz-cms-content')
                    .map(function (i, el) {
                        var $el = $(el);

                        return $el.offset().top + $el.height();
                    })
                    .sort();
    }


    //  TARGET base class

    Target = function(element, options) {
        this.options = $.extend({}, Target.DEFAULTS, options);
        this.element = $(element);
    }

    Target.prototype.type = function() {
        return this._type;
    }

    Target.prototype.insert = function(quadrant, widgetCfg) {
        var block = widgetCfg.block,
            col,
            target;

        if (block && block.parent) {
            col = block.parent;
        }

        target = this.create(widgetCfg);

        target.parent = this.parent;

        if (quadrant === 'top' || quadrant === 'left') {
            target.element.insertBefore(this.element);
        } else {
            target.element.insertAfter(this.element);
        }

        if (this.parent.type() === 'row') this.parent.rebase();

        if (col) col.rebase();

        Chorizo.editor.dirtyStateCheck();
    }

    Target.prototype.offset = function(clear) {
        if (clear) this._offset = null;

        if (!this._offset) {
            this._offset = this.element.offset();
            this._offset.width = this.element.width();
            this._offset.height = this.element.height();
            this._offset.target = this;
        }
        return clear ? undefined : this._offset;
    }

    Target.prototype.initHint = function() {
        if (this.parent && this.parent.initHint) this.parent.initHint();
        this.offset(true);
    }

    Target.prototype.create = function(widgetCfg) {
        throw 'Must implement create function on Target';
    }

    Target.prototype.rebase = function() {
        throw 'Must implement rebase function on Target';
    }

    Target.prototype.hint = function(x, y) {
        throw 'Must implement hint function on Target';
    }

    Target.prototype.quadrant = function(x, y) {
        throw 'Must implement quadrant function on Target';
    }

    /**
     * Determines what quadrant the mouse is in
     * @return {string} 'top', 'right', 'bottom', or 'left'
     */
    Target.quadrant = function(x, y, offset) {
        var xMax = offset.width,
            yMax = offset.height;

        x -= offset.left;
        y -= offset.top;


        if (yMax * x >= xMax * y) {
            // TOP or RIGHT
            return (xMax * y >= (xMax - x) * yMax) ? 'right' : 'top';
        } else {
            // BOTTOM or LEFT
            return (yMax * x >= (yMax - y) * xMax) ? 'bottom' : 'left';
        }
    }


    //  ROW class

    Row = function(element, options) {
        Target.call(this, element, options);

        this._type = 'row';
        this.parent = options.parent;

        this.element
            .find('[class*="mz-cms-col-"]')
            .mzCol({
                parent: this
            });
    }

    Row.create = function(widgetCfg, gridSpan) {
        var $row = $('<div class="mz-cms-row"></div>'),
            col = Col.create(widgetCfg, gridSpan),
            row;

        $row.append(col.element);

        row = $row.mzRow().data('mozu.mzRow');

        col.parent = row;

        return row;
    }

    Row.prototype = new Target();

    Row.prototype.create = function(widgetCfg) {
        return Row.create(widgetCfg, this.parent.span);
    }

    Row.prototype.rebase = function() {
        var $cols = this.element.find('[class*="mz-cms-col-"]'),
            gridSpan = this.parent.span,
            ans,
            rem;

        // If the ROW has no more COLS, remove the row
        if ($cols.length === 0) {
            this.element.remove();
            this.parent.rebase();
            this.parent = null;
            return;
        }

        ans = Math.floor(gridSpan / $cols.length);
        rem = gridSpan % $cols.length;

        $cols.each(function(i, col) {
            var width = ans + (rem-- > 0 ? 1 : 0);

            $(col).attr('class', 'mz-cms-col-' + width + '-' + gridSpan);
        });
    }

    Row.prototype.hint = function(x, y) {
        this.offset().message = 'row';
        this.offset().quadrant = this.quadrant(x, y);

        return this.offset();
    }

    Row.prototype.quadrant = function(x, y) {
        var quadrant = Target.quadrant(x, y, this.offset());

        x -= this.offset().left;
        y -= this.offset().top;

        if ((quadrant === 'top' || quadrant === 'bottom') && (y <= cfg.rowHintMargin || y >= this.offset().height - cfg.rowHintMargin)) {
            return quadrant;
        }
        return;
    }

    Row.prototype.resizeCol = function(col) {
        var $next = col.element.next();

        if ($next.length !== 1) return;


    }

    //  COL class
    Col = function(element, options) {
        Target.call(this, element, options);

        this._type = 'col';
        this.parent = options.parent;

        this.element
            .droppable()
            .find('.mz-cms-block')
            .mzBlock({
                parent: this
            });

        this.$resizer = $('<div class="resizer-column"><div></div></div>')
            .appendTo(this.element)
            .draggable({
                cursor: 'ew-resize',
                helper: function() {
                    return $('<div>');
                },
                start: $.proxy(this._onStart, this),
                stop: $.proxy(this._onStop, this)
            });
    }

    Col.create = function(widgetCfg, gridSpan) {
        var $col = $('<div class="mz-cms-col-' + gridSpan + '-' + gridSpan + '"></div>'),
            block = (widgetCfg && widgetCfg.block) ? widgetCfg.block : Block.create(widgetCfg),
            col;

        $col.append(block.element);

        col = $col.mzCol().data('mozu.mzCol');

        block.parent = col;

        return col;
    }

    Col.span = function(element) {
        var match = element.attr('class').match(/col-\d{1,2}-\d{1,2}/),
            split;

        if (!match || !match[0]) {
            throw 'Unable to parse Column size from class: ' + this.element.attr('class');
            return;
        }

        return win.parseInt(match[0].split('-')[1]);
    }

    Col.prototype = new Target();

    Col.prototype.create = function(widgetCfg) {
        return Col.create(widgetCfg, this.parent.parent.span);
    }

    Col.prototype.rebase = function() {
        // Don't worry about it if there still are BLOCKS in the COL
        if (this.element.find('.mz-cms-block').length) return;

        // Remove the COL from the ROW since there are no blocks remaining
        this.element.remove();
        this.parent.rebase();
        this.parent = null;

    }

    Col.prototype.hint = function(x, y) {
        var rowOffset = this.parent.hint(x, y);

        //  Prioritize ROW hinting over COL hinting
        if (rowOffset.quadrant) return rowOffset;

        this.offset().quadrant = this.quadrant(x, y);

        this.offset().message = (this.offset().quadrant === 'left' || this.offset().quadrant === 'right') ? 'column' : 'insert';

        return this.offset();
    }

    Col.prototype.quadrant = function(x, y) {
        var quadrant = Target.quadrant(x, y, this.offset()),
            ratio = Math.round(this.offset().width * cfg.colHintRatio),
            margin = ratio > cfg.colHintMargin ? ratio : cfg.colHintMargin;

        x -= this.offset().left;
        y -= this.offset().top;

        // Columns can only be inserted on left or right
        if ((quadrant === 'left' || quadrant === 'right') && (x <= margin || x >= this.offset().width - margin)) {
            return quadrant;
        }

        return;
    }

    Col.prototype.span = function() {
        return Col.span(this.element);
    }

    Col.prototype._onStart = function(e, ui) {
        win.clearTimeout(this._resizeTimeout);
        Chorizo.editor.columnResizing(true);
        this.$resizer.addClass('active');
        this._moveHander = $.proxy(this._onMousemove, this);
        this._offset = this.element.offset();
        this.height = this.element.width();
        this.gridWidth = this.parent.element.width() / 12;
        this.size = this.span();

        $doc.on('mousemove', this._moveHander);
        Chorizo.editor.stopDrag();
        Chorizo.editor.cursor('ew-resize');
    }

    Col.prototype._onStop = function(e, ui) {
        Chorizo.editor.cursor('auto');
        this.$resizer.removeClass('active');
        $doc.off('mousemove', this._moveHander);
        this._resizeTimeout = setTimeout(function () { Chorizo.editor.columnResizing(false); }, 100);
    }

    Col.prototype._onMousemove = function(e, ui) {
        var newWidth = $doc.scrollLeft() + e.clientX - this._offset.left,
            newSize = Math.round(newWidth / this.gridWidth);

        this.changeSize(newSize);
    }

    Col.prototype.changeSize = function(newSize) {
        console.log('newSize', newSize);
        var delta = newSize - this.size,
            gridSpan = this.parent.parent.span,
            $next,
            nextSize;

        if (this.size === newSize || newSize < 1 || newSize > gridSpan - 1) return;

        $next = this.element.next();

        if ($next.length !== 1) return;

        nextSize = Col.span($next);

        if (nextSize - delta < 1) return;

        this.element.attr('class', 'mz-cms-col-' + newSize + '-' + gridSpan);
        $next.attr('class', 'mz-cms-col-' + (nextSize - delta) + '-' + gridSpan);

        this.size = newSize;
        Chorizo.editor.dirtyStateCheck();
    }


    //  BLOCK class
    Block = function(element, options) {
        Target.call(this, element, options);

        this._type = 'block';
        this.parent = options.parent;

        this.$content = this.element.find('.mz-cms-content');

        this.widgetData = this.element.data('widget');

        this.element
            .on({
                dragstart: $.proxy(function() {
                    Chorizo.editor.startDrag(this);
                }, this),
                dropover: $.proxy(function() {
                    this.initHint();
                }, this)
            })
            .droppable({
                accept: '.mz-cms-block, .mz-cms-widget'
            })
            .draggable({
                handle: '.mz-cms-drag-handle',
                distance: 20,
                cursorAt: {
                    top: 15,
                    left: 15
                },
                helper: function() {
                    return $('<div class="dd-helper"></div>');
                }
            });

        if (this.widgetData.isRichText) {
            this.element.mzText({isRichText: true});
        } else {
            this.element.mzImg({isRichText: false});
        }

        // if (this.widgetData.isRichText) {
        //     this.element.mzText()
        // } else if (this.$content.hasClass('mz-cms-image')) {
        //     this.element
        //         .mzImg()
        //         .addClass('mz-cms-drag-handle');
        // } else {
        //     this.element.mzContent()
        //         .addClass('mz-cms-drag-handle');
        // }
    }

    Block.create = function(widgetCfg) {
        var $block,
            block;

        if (widgetCfg.block) return widgetCfg.block;

        $block = $('<div class="mz-cms-block"><div class="mz-cms-content"></div></div>');

        $block
            .data('widget', widgetCfg.data)
            .find('.mz-cms-content')
            .html(widgetCfg.html)
            .height(widgetCfg.data.config.height);

        block = $block.mzBlock().data('mozu.mzBlock') 

        win.setTimeout(function() {
            block.triggerDrop();
        }, 50);

        return block;
    }

    Block.prototype = new Target();

    Block.prototype.triggerDrop = function() {
        var evt = doc.createEvent('CustomEvent');
        evt.initCustomEvent('mozuwidgetdrop', true, false);
        this.element[0].dispatchEvent(evt);
    }

    Block.prototype.update = function(html, data) {
        this.element.data('widget', data);
        this.widgetData = this.element.data('widget');

        this.$content.html(html);

        if (this.widgetData.isRichText) {
            this.element.mzText({isRichText: true});
        } else {
            this.element.mzImg({isRichText: false});
        }

        console.log('update block', this.element[0])

        this.triggerDrop();
    }

    Block.prototype.create = function(widgetCfg) {
        return Block.create(widgetCfg);
    }

    Block.prototype.initHint = function() {
        Chorizo.editor.target(this);
        Target.prototype.initHint.call(this);
    }

    Block.prototype.hint = function(x, y) {
        var colOffset = this.parent.hint(x, y);

        //  Prioritize COL hinting over BLOCK hinting
        if (colOffset.quadrant) return colOffset;

        /* //   Code for FLOAT insertion
            this.offset().quadrant = Chorizo.editor.quadrant(x, y, this.offset());

            this.offset().message = (this.offset().quadrant === 'top' || this.offset().quadrant === 'bottom')
                                    ? 'insert'
                                    : 'float';
        */
       
        this.offset().message = 'insert';

        this.offset().quadrant = this.quadrant(x, y);

        return this.offset();
    }

    Block.prototype.quadrant = function(x, y) {
        y -= this.offset().top;

        return (y <= this.offset().height / 2) ? 'top' : 'bottom';
    }

    Block.prototype.remove = function () {
        this.element.remove();
        this.parent.rebase();
        Chorizo.editor.dirtyStateCheck();
    }


    //  Blank Block Class
    BlankBlock = function(element, options) {
        Target.call(this, element, options);

        this._type = 'blankblock';
        this.parent = options.parent;

        this.$content = this.element.find('.mz-cms-content');

        this.element.on({
            dropover: $.proxy(function() {
                this.initHint();
                this.element.addClass('mz-cms-drop-over');
            }, this),
            dropout: $.proxy(function() {
                this.element.removeClass('mz-cms-drop-over');
            }, this)
        })
        .droppable({
            accept: 'mz-cms-block, .mz-cms-widget'
        })
        .addClass('mz-cms-blank-block');
    }



    BlankBlock.prototype = new Target();

    BlankBlock.create = function() {
        var $block;

        $block = $('<div class="mz-cms-blank-block"><div class="mz-cms-content"></div></div>');

        $block
            .data('widget', {})
            .find('.mz-cms-content')
            .html('<div>Drop your widget here</div>');

        return $block.mzBlankBlock().data('mozu.mzBlankBlock');
    }

    BlankBlock.prototype.create = Block.prototype.create;

    BlankBlock.prototype.hint = function(x, y) {
        this.offset().message = 'replace';
        this.offset().quadrant = 'top';

        return this.offset();
    }

    

    BlankBlock.prototype.initHint = function() {
        Chorizo.editor.target(this);
        Target.prototype.initHint.call(this);
    }

    BlankBlock.prototype.insert = function(quadrant, widgetCfg) {
        Target.prototype.insert.call(this, quadrant, widgetCfg);

        this.parent = null;
        this.element.remove();
    }



    // Plugin definitions

    Chorizo.classFactory(Grid, 'mozu.mzGrid');
    Chorizo.classFactory(Row, 'mozu.mzRow');
    Chorizo.classFactory(Col, 'mozu.mzCol');
    Chorizo.classFactory(Block, 'mozu.mzBlock');
    Chorizo.classFactory(BlankBlock, 'mozu.mzBlankBlock');

}(jQuery, window, document));