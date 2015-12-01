(function(win, doc) {

    const GRID_CLASSNAME = 'mz-drop-zone';
    const GRID_SELECTOR = `.${GRID_CLASSNAME}`;
    const COL_CLASSNAME = 'mz-cms-col-';
    const COL_SELECTOR = `.${COL_CLASSNAME}`;
    const ALL_COL_SELECTOR = `[class*="${COL_CLASSNAME}"]`;
    const ROW_CLASSNAME = 'mz-cms-row';
    const ROW_SELECTOR = `.${ROW_CLASSNAME}`;
    const BLOCK_CLASSNAME = 'mz-cms-block';
    const BLOCK_SELECTOR = `.${BLOCK_CLASSNAME}`;
    const CONTENT_CLASSNAME = 'mz-cms-content';
    const CONTENT_SELECTOR = `.${CONTENT_CLASSNAME}`;

    const DROP_HINT_TEXT = 'Drop an Element';

    let _mouseposition = null;

    class Target {
        constructor(el) {
            this.element = el;
        }
        attachEvents(events) {
            Object.keys(events).forEach((k) => this.element.addEventListener(k, events[k]), this);
        }
        get(cls, all) {
            return all ? this.element.querySelectorAll(cls) : this.element.querySelector(cls);
        }
        createLayout(isEmptyGrid) {
            this.layout = new Layout();
            this.layout.create(isEmptyGrid);
            this.element.appendChild(this.layout.element);
        }

        dragleave(e) {
            e.preventDefault();
        }

        dragover(e) {
            e.preventDefault();
        }

        closest(el, cls) {
            while (el !== doc.body) {
                if (el.classList.contains(cls)) {
                    return el;
                }
                else {
                    el = el.parentNode;
                }
            }
        }
        setMousePosition(x, y, w, h, el) {
            // element is divided into four triangles
            // using mouseX, mouseY, and width and height, we find which quad
            let quadrants = [['left', 'bottom'], ['top', 'right']];

            if (y > h / w * x) {
                quadrants = quadrants[0];
            }
            else {
                quadrants = quadrants[1];
            }

            _mouseposition = {
                position: (y < -h / w * x + h) ? quadrants[0] : quadrants[1],
                element: el,
                type: 'row'
            };
        }
        wrapLayout(isEmptyGrid) {
            // if there is existing dropzone content, we need to wrap it with a layout element, and then init the column
            this.element.innerHTML = ['<div class="mz-layout-widget mz-layout-row mz-cms-row mz-editing">',
                                            '<div class="mz-layout-col mz-cms-col- mz-editing" style="width:100%">',
                                                 this.element.innerHTML,
                                            '</div>',
                                      '</div>'].join('');
            const wrapper = new Col(this.element.querySelector(COL_SELECTOR), isEmptyGrid);

            // adding the class to correct padding -- not to the newly generated wrapper layout
            Array.from(this.element.querySelectorAll(ROW_SELECTOR)).forEach((row) => {
                if (!row.parentNode.classList.contains('mz-cms-grid')) {
                    row.classList.add('content-view');
                }
            });
        }

        createFromDrop(html) {
            const shell = doc.createElement('div');
            this.element.appendChild(shell);
            shell.outerHTML = html;
            // first child gets around the shell div created from safe insert of outerHTML
            this.element = this.element.firstChild;
            this.element.classList.add('content-view');
        }

        makeDraggable(el, events) {

            el.setAttribute('draggable', 'true');

            events.forEach(function(ev) {
                el.addEventListener(ev.type, ev.func.bind(this));
            });

        }

        setMouseIndicator(e) {
            e.dataTransfer.dropEffect = 'none';
            return false;
        }

        showResizer(e) {
            e.stopPropagation();

            Array.from(doc.querySelectorAll(`${ALL_COL_SELECTOR}, ${BLOCK_SELECTOR}`)).forEach((col) => {
                col.classList.remove('mz-cms-state-selected');
            });

            if (this._type === 'block'
                    && Chorizo.editor.hideLayouts
                    && this.widgetData
                    && this.widgetData.config.heightResizable) {
                this.resizer = Chorizo.editor.getResizer();
                this.element.classList.add('mz-cms-state-selected');
                this.element.appendChild(this.resizer);
            }

        }
    }

    class Grid extends Target {
        constructor(el) {
            super(el);
            this._type = 'grid';

            this.dropZoneData = JSON.parse(this.element.getAttribute('data-drop-zone'));
            this.span = this.dropZoneData ? this.dropZoneData.span : null;

            this.attachEvents({
                dragover: this.dragover.bind(this),
                dragleave: this.dragleave.bind(this)
            });

            this.rebase();
        }

        rebase() {

            if (!this.get(ROW_SELECTOR)) {
                this.createLayout(true);
            }

            else {
                this.wrapLayout(true);
            }
        }

        type(val) {
            if (val) {
                this._type = val;
                return this.element;
            }
            return this._type;
        }

        dragover(e) {
            e.preventDefault();
        }

        dragleave(e) {
            e.preventDefault();
        }
    }

    class Block extends Target {
        constructor(el) {
            super(el || doc.createElement('div'));
            this._type = 'block';
            this.widgetData = JSON.parse(this.element.getAttribute('data-widget'));
            this.content = this.element.querySelector('.mz-cms-content') || doc.createElement('div');
            this.attachEvents({
                mouseover: this.onHover.bind(this),
                mouseleave: this.ondragLeave.bind(this),
                dblclick: this.onDoubleClick.bind(this),
                click: this.showResizer.bind(this)
            });

            this.addTools();

            if (this.move) {
                this.makeDraggable(this.move, [
                    { type: 'dragend', func: this.onDragEnd.bind(this) },
                    { type: 'dragstart', func: this.onDragStart.bind(this) },
                    { type: 'drag', func: this.onDrag.bind(this) }
                ]);
            }
        }

        onDrag(e) {
            Chorizo.editor.setDirtyState(true);
            e.preventDefault();
            Chorizo.editor.updateDragIconPosition(e);
        }

        onDragStart(e) {
            const widgetData = JSON.parse(this.element.getAttribute('data-widget'));
            const body = this.element.innerHTML;

            Chorizo.editor.initDragIcon(Chorizo.editor.getWidgetIcon(widgetData.definitionId));

            this.element.id = 'mz-widget-copy';

            e.dataTransfer.setData('text/plain',
                JSON.stringify({
                    id: widgetData.definitionId,
                    body: body, type: 'content',
                    data: widgetData,
                    dragMethod: 'widgetDrag'
                }));

        }

        onDragEnd(e) {
            e.preventDefault();
            Chorizo.editor.hideDragIcon();
        }

        ondragLeave() {
            this.element.querySelector('.mz-cms-tools').style.display = 'none';
        }

        onHover() {
            if (Chorizo.editor.hideLayouts) {
                this.element.querySelector('.mz-cms-tools').style.display = 'block';
            }
        }

        doEdit() {
            const block = this;
            const isContentWidget = block.widgetData.definitionId === 'content';

            if (!isContentWidget) {
                Chorizo.editor.fireEvent('widgetedit', {
                    widgetTypeId: this.widgetData.definitionId,
                    type: 'content',
                    element: this.element,
                    data: this.widgetData,
                    callback: function(html, cfg) {
                        block.update(html, cfg);
                    }
                });
            }

            else {
                Chorizo.contentEditor.revealEditor(block);
            }
        }

        update(html, cfg) {
            this.content.innerHTML = html;
            this.widgetData = cfg;
            this.element.setAttribute('data-widget', JSON.stringify(cfg));

            if (cfg.config.imageHeight) {
                this.content.style.height = Number(cfg.config.imageHeight)
                                                ? cfg.config.imageHeight + 'px'
                                                : cfg.config.imageHeight;
            }
        }

        onDoubleClick() {
            this.doEdit();
        }

        onDrop(e) {
            e.preventDefault();
        }

        create(cfg, html) {
            this.element.className = BLOCK_CLASSNAME;
            this.content.className = CONTENT_CLASSNAME;
            this.element.appendChild(this.content);
            this.widgetData = cfg;
            this.element.setAttribute('data-widget', JSON.stringify(cfg));

            if (cfg.config && cfg.config.height) {
                this.content.style.height = cfg.config.height + 'px';
            }

            this.insertWidget(html);

            if (this.move) {
                this.makeDraggable(this.move, [
                    { type: 'dragend', func: this.onDragEnd.bind(this) },
                    { type: 'dragstart', func: this.onDragStart.bind(this)}
                ]);
            }
        }

        addTools() {
            this.toolbar = doc.createElement('ul');
            this.del = doc.createElement('li');
            this.edit = doc.createElement('li');
            this.move = doc.createElement('li');

            [this.del, this.edit, this.move].forEach(function(el) {
                el.classList.add('chorizo-icon');
            });

            this.toolbar.className = 'mz-cms-tools';
            this.del.classList.add('trash');
            this.edit.classList.add('pencil');
            this.move.classList.add('drag-handle');

            this.toolbar.appendChild(this.edit);
            this.toolbar.appendChild(this.move);
            this.toolbar.appendChild(this.del);

            this.element.appendChild(this.toolbar);

            this.addEditEvents();
        }

        addEditEvents() {
            [{ el: this.del, ev: this.destroy }, { el: this.edit, ev: this.doEdit }]
                .forEach((ob) => ob.el.addEventListener(ob.type || 'click', ob.ev.bind(this)), this);
        }

        destroy() {
            const tempCol = new Col();
            Chorizo.editor.setDirtyState(true);

            tempCol.element = this.element.parentNode;
            this.element.remove();
            tempCol.addDropHint();
        }

        insertWidget(html) {
            const shell = doc.createElement('div');
            this.content.appendChild(shell);
            shell.outerHTML = html;
            // first child gets around the shell div created from safe insert of outerHTML
            this.content = this.content.firstChild;
        }
    }

    class Layout extends Target {
        constructor(el) {
            super(el || doc.createElement('div'));
            this._type = 'layout';
        }

        create(isEmptyGrid, numOfCols) {
            this.row = new Row(null, isEmptyGrid);
            this.col = new Col(null, isEmptyGrid);

            if (!numOfCols) {
                this.element = this.row.element;
                this.droppableArea = this.col.element;
                this.droppableArea.style.width = '100%';
                this.element.appendChild(this.droppableArea);
            }
            else {
                this.element = this.row.element;
                for (let i = 0; i < numOfCols; i++) {
                    this['col' + '_' + i] = new Col();
                    this['col' + '_' + i].element.style.width = '50%';
                    this.element.appendChild(this['col' + '_' + i].element);
                }
            }

        }
    }

    class LayoutComponent extends Target {
        constructor(el) {
            super(el);
        }

        resetMousePosition() {
            this._colmouseposition = null;
            _mouseposition = null;
        }

        addLayoutHeader(isEmptyGrid) {
            const child = this.element.firstChild;
            const header = doc.createElement('div');

            header.classList.add('mz-layout-widget-header');
            header.classList.add('col');

            this.header = header;

            if (!isEmptyGrid) {
                this.addHeaderEvents();
                this.element.insertBefore(this.header, child);
                this.addEditEvents();
                // hiding edit of columns for now
                this.edit.style.display = 'none';
            }

        }

        addHeaderEvents() {
            this.toolbar = doc.createElement('ul');
            this.del = doc.createElement('li');
            this.edit = doc.createElement('li');
            this.move = doc.createElement('li');

            this.toolbar.className = 'mz-cms-tools';
            this.del.className = 'trash';
            this.edit.className = 'pencil';
            this.move.className = 'drag-handle';

            this.toolbar.appendChild(this.edit);
            this.toolbar.appendChild(this.move);
            this.toolbar.appendChild(this.del);

            this.header.appendChild(this.toolbar);
        }

        addEditEvents() {
            [{el: this.del, ev: this.destroy}]
                .forEach((ob) => ob.el.addEventListener(ob.type || 'click', ob.ev.bind(this)), this);
        }

        editLayout(e) {
            Chorizo.editor.edit({
                element: this.closest(e.target, COL_CLASSNAME),
                type: 'content'
            });
        }

        rebase(containingRow) {
            const cols = Array.from(containingRow.querySelectorAll(ALL_COL_SELECTOR))
                .filter((col) => col.parentNode.isSameNode(containingRow));

            cols.forEach((col) => {
                col.style.width = (1 / cols.length) * 100 + '%';
            });
        }

        getCol(e) {
            return e.target.parentNode.parentNode.parentNode;
        }

        destroy() {
            Chorizo.editor.setDirtyState(true);

            const containingRow = this.closest(this.element, 'mz-layout-row');
            let parentLayout;
            let col;
            let children;

            this.element.remove();

            // are there any existing columns in the element being deleted
            // not including the hint bar | and not including the row header?
            // if not, we need to readd the drophint son

            children = Array.from(containingRow.childNodes)
                .some((child) => child.classList
                        && !child.classList.contains('mz-layout-widget-header')
                        && !child.classList.contains('mz-cms-hint-bar'));

            parentLayout = containingRow.parentNode ? this.closest(containingRow.parentNode, COL_CLASSNAME) : null;

            // if the element has children DONT add the drop hint
            if (!children) {

                containingRow.remove();

                col = new Col();
                col.element = parentLayout;

                // if the element has no children, but the parent container DOES have children
                // do not add a drop hint
                if(!col.element.querySelector(ROW_SELECTOR)) {
                    col.addDropHint();
                }
            }
            else {
                this.rebase(containingRow);
            }
        }

        drop(e) {
            this.dragleave(e);
        }

        removeElementWhereDragStarted() {
            if (doc.querySelector('#mz-node-copy')) {
                const tempCol = new Col();
                tempCol.element = doc.querySelector('#mz-node-copy');
                tempCol.destroy();
            }
        }

        dropWithContent(layout) {

            const previousHTML = doc.querySelector('#mz-node-copy')
                    ? doc.querySelector('#mz-node-copy').cloneNode(true) : null;

            if (previousHTML) {
                layout.removeDropHint();

                Array.from(previousHTML.querySelectorAll('.mz-cms-tools, .mz-layout-widget-header'))
                    .forEach((toolset) => {
                        // if (toolset.parentNode.id !== 'mz-node-copy') toolset.remove();
                        toolset.remove();
                    });

                layout.element.innerHTML = previousHTML.innerHTML;

                this.reinitializeContent(layout);
            }

            this.removeElementWhereDragStarted();

        }

        reinitializeContent(layout) {
            const rows = layout.element.querySelectorAll(ROW_SELECTOR);
            const cols = layout.element.querySelectorAll(ALL_COL_SELECTOR);
            const blocks = layout.element.querySelectorAll(BLOCK_SELECTOR);
            const nodeList = Array.prototype.slice.call(rows)
                .concat(Array.prototype.slice.call(cols))
                .concat(Array.prototype.slice.call(blocks));

            // reinit the layouts edit events becuase theyve been destroyed
            //  by the html insert -- 'true' means dont add drop event
            layout.init(null, true);

            nodeList.forEach(function(el){

                let constructor;
                let temp;

                if (el.classList.contains(ROW_CLASSNAME)) {
                    constructor = Row;
                }

                else if (el.classList.contains(BLOCK_CLASSNAME)) {
                    constructor = Block;
                }

                else {
                    constructor = Col;
                }

                temp = new constructor(el);

                if (temp instanceof Col) {
                    temp.removeDropHint();
                }

            });
        }

        setupDraggable() {
            this.makeDraggable(this.move, [
                { type: 'dragend', func: this.onDragEnd.bind(this) },
                { type: 'dragstart', func: this.onDragStart.bind(this) },
                { type: 'drag', func: this.onDrag.bind(this)}
            ]);
        }

        onDragEnd(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        onDrag(e) {
            e.preventDefault();
            Chorizo.editor.updateDragIconPosition(e);
        }

        onDragStart(e) {
            let widgetData;
            const hasContent = this.element
                                .querySelectorAll(`${BLOCK_SELECTOR}, ${ALL_COL_SELECTOR}, mz-cms-row`).length > 0;

            if (this.element.querySelector(BLOCK_SELECTOR)) {
                widgetData = this.element.querySelector(BLOCK_SELECTOR).getAttribute('data-widget');
            }

            Chorizo.editor.initDragIcon('layout');

            this.element.id = 'mz-node-copy';

            e.dataTransfer
                .setData('text/plain', JSON.stringify({
                    dragMethod: 'layoutDrag',
                    id: 'mz-1-col',
                    type: 'layout',
                    data: widgetData,
                    hasContent: hasContent
                }));
        }
    }

    class Row extends LayoutComponent {
        constructor(el, isEmptyGrid) {

            super(el || doc.createElement('div'));
            this._type = 'row';
            this.init(isEmptyGrid);
            ['mz-layout-widget', 'mz-layout-row', ROW_CLASSNAME, 'mz-editing']
                .forEach((cls) => this.element.classList.add(cls), this);
        }

        ondragLeave(e) {
            e.preventDefault();
            _mouseposition = null;
            Chorizo.editor.hideHintBar();
        }

        isValidHint() {

            if (_mouseposition && _mouseposition.position === 'right'
                    || _mouseposition && _mouseposition.position === 'left') {
                if (this.element.parentNode.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                    return false;
                }
            }
            return true;
        }

        ondragOver(e) {
            this.resetMousePosition();
            e.preventDefault();
            e.stopPropagation();

            if (!this.isValidHint()) {
                this.setMouseIndicator(e, false);
            }
            // if you're hovering over a row, and not a droppable column
            if (!Chorizo.editor.hideLayouts && e.target.classList.contains('mz-layout-row')) {
                const x = e.offsetX;
                const y = e.offsetY;
                const width = parseInt(window.getComputedStyle(e.target, null).width, 10);
                const height = parseInt(window.getComputedStyle(e.target, null).height, 10);

                this.showHintBarMessage(e.target, x, y, width, height);
            }

        }

        showHintBarMessage(element, x, y, width, height) {
            this.setMousePosition(x, y, width, height, element);
            Chorizo.editor.showRowHintBar(element, x, y, width, _mouseposition.position);
        }
        dragleave() {

        }

        init(isEmptyGrid) {

            if (!isEmptyGrid) {
                this.addRowHeader(isEmptyGrid);
            }

            this.attachEvents({
                dragover: this.ondragOver.bind(this),
                dragleave: this.ondragLeave.bind(this),
                drop: this.drop.bind(this)
            });

            // currently rows aren't draggable
            // if (this.move) this.setupDraggable();
        }

        addRowHeader() {
            const child = this.element.firstChild;
            const header = doc.createElement('div');
            const layoutJSON = JSON.parse(this.element.getAttribute('data-widget'));
            const title = layoutJSON ? layoutJSON.title : 'Mozu Layout Element';

            header.classList.add('mz-layout-widget-header');
            header.classList.add('row');

            this.header = header;

            this.updateRowTitle({title: title});

            // if the row isnt the inherited row for the dropzone
            if (!this.element.parentNode || !this.element.parentNode.classList.contains(GRID_CLASSNAME)) {
                this.addHeaderEvents();
                this.element.insertBefore(this.header, child);
                this.addRowHeaderEvents();
            }

            // hiding row drag
            if (this.move) {
                this.move.style.display = 'none';
            }

        }

        addRowHeaderEvents() {
            [{el: this.del, ev: this.destroy}, {el: this.edit, ev: this.editLayout}]
                .forEach((ob) => ob.el.addEventListener(ob.type || 'click', ob.ev.bind(this)), this);
        }

        destroy() {
            Chorizo.editor.setDirtyState(true);
            const parentLayout = this.closest(this.element.parentNode, COL_CLASSNAME);
            let col;

            this.element.remove();

            if (Array.from(parentLayout.childNodes)
                    .filter((child) => child.classList && !child.classList.contains('mz-layout-widget-col-header'))) {
                col = new Col();
                col.element = parentLayout;
                if (!col.element.querySelector(ROW_SELECTOR)) {
                    col.addDropHint();
                }
            }

        }

        updateRowTitle(cfg) {

            const title = cfg.title || 'Mozu Layout Element';
            let titleRow;

            if (this.element.querySelector('.mozu-row-title')) {
                this.element.querySelector('.mozu-row-title').innerHTML = title;
            }

            else {
                titleRow = doc.createElement('span');
                titleRow.innerHTML = title;
                titleRow.classList.add('mozu-row-title');
                this.header.appendChild(titleRow);
            }

            this.element.setAttribute('data-widget', JSON.stringify({title: title}));

        }

        getConvertedWidth(col) {
            let width;
            let str;
            let nums;

            if (col.style.width) {
                width = col.style.width;
            }

            else {
                col.classList.forEach((cls) => {
                    if (cls.indexOf(COL_CLASSNAME) != -1) {
                        str = cls.substring(COL_CLASSNAME.length);
                        if (str) {
                            nums = str.split('-');
                            width = parseInt(nums[0], 10) / parseInt(nums[1], 10) * 100;
                        }
                    }
                });
            }

            return width;

        }

        editLayout() {
            const me = this;
            const config = {};
            const layoutJSON = JSON.parse(this.element.getAttribute('data-widget'));
            let counter = 1;

            Array.from(this.element.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {

                if (col.parentNode.isSameNode(this.element)) {

                    config['mz-col' + counter] = me.getConvertedWidth(col);
                    counter++;
                }

            }, this);

            config.title = layoutJSON ? layoutJSON.title : 'mz-col-' + counter;

            // if you dont know about 0 index, you're gonna have a bad time;
            counter -= 1;

            // dont have widget editor for greater than 4 columns, so we'll just use that one
            if (counter > 4) {
                counter = 4;
            }

            Chorizo.editor.fireEvent('widgetedit', {
                widgetTypeId: 'mz-' + counter + '-col',
                type: 'layout',
                data: {
                    definitionId: 'mz-' + counter + '-col',
                    config: config
                },
                layoutCallback: function(cfg) {
                    const widths = Object.keys(cfg.config);
                    let colIndex = 0;
                    me.updateRowTitle(cfg.config);

                    widths.splice(widths.indexOf('title'), 1);

                    Array.from(me.element.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {
                        if (col.parentNode.isSameNode(me.element)) {
                            col.style.width = cfg.config[widths[colIndex]] + '%';
                            colIndex++;
                        }
                    }, me);
                }
            });
        }
    }

    class Col extends LayoutComponent {
        constructor(el, isEmptyGrid) {
            super(el || doc.createElement('div'));
            this._type = 'col';
            this.init(isEmptyGrid);
            this._colmouseposition = null;

            ['mz-layout-col', COL_CLASSNAME, 'mz-editing', 'content-view', 'mz-cms-show-zone']
                .forEach((cls) => this.element.classList.add(cls), this);

            if (Chorizo.editor.areDropzonesHidden) {
                this.element.classList.remove('mz-cms-show-zone');
            }

            this.addDropHint();
        }

        init(isEmptyGrid, ignoreDropEvent) {
            this.addLayoutHeader(isEmptyGrid);

            this.attachEvents({
                dragover: this.dragover.bind(this),
                dragleave: this.dragleave.bind(this),
                mouseover: this.showDragHandle.bind(this),
                mouseout: this.showDragHandle.bind(this)
            });

            if (!ignoreDropEvent) {
                this.attachEvents({
                    drop: this.drop.bind(this)
                });
            }

            if (this.move) {
                this.setupDraggable();
            }

            if (!isEmptyGrid) {
                this.addDragHandle();
            }

        }

        showDragHandle(e) {

            if (this.handle && this.element.nextElementSibling) {
                this.handle.style.display = e.type === 'mouseover' ? 'block' : 'none';
            }

            this.onHover();

        }

        addDragHandle() {
            this.handle = doc.createElement('div');
            ['ui-draggable', 'resizer-column'].forEach((cls) => this.handle.classList.add(cls), this);
            this.element.appendChild(this.handle);

            this.handle.addEventListener('mousedown', this.doDragWidth.bind(this));
            this.handle.addEventListener('mouseup', this.doDragWidth.bind(this));
        }

        doDragWidth(e) {
            Chorizo.editor._draggingColumn = e.type === 'mousedown' ? this.element : null;

        }

        isValidDrop(e) {

            // if werre trying to drag a layoutelement onto a a layout with a widget (YOU CANT DROP -- DONT SHOW HINT)
            if (this.element.querySelector(BLOCK_SELECTOR) && e.type === 'dragover') {
                return false;
            }

            // if this is a drop zone, and you're trying to drop right or left
            if ((_mouseposition && _mouseposition.position === 'right'
                || _mouseposition && _mouseposition.position === 'left')
                && this.element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                return false;
            }

            // if you're trying to drop a col into a place where theres already a widget
            if (!_mouseposition
                    && this._colmouseposition
                    && !this._colmouseposition.position
                    && this.element.querySelector(BLOCK_SELECTOR)) {
                return false;
            }

            return true;
        }

        dragover(e) {
            this.resetMousePosition();
            this.element.classList[!this.isValidDrop(e) ? 'remove' : 'add']('mz-cms-drop-over');

            e.preventDefault();

            const x = e.offsetX;
            const y = e.offsetY;
            const width = parseInt(window.getComputedStyle(e.target, null).width);
            const height = parseInt(window.getComputedStyle(e.target, null).height);

            this._colmouseposition = this.getHintingData(
                                        Chorizo.editor.hideLayouts,
                                        x,
                                        y,
                                        width,
                                        height,
                                        this.element,
                                        e.target,
                                        e);

            if (!Chorizo.editor.hideLayouts) {
                if (this._colmouseposition.position) {
                    this.showHintBarMessage(x, y, width, height, e.target, this._colmouseposition.position);
                }

                else {
                    Chorizo.editor.hideHintBar();
                }
            }

            else {
                this.showWidgetHintBarMessage(x, y, width, height, e.target, this._colmouseposition.position);
            }

        }

        getHintingData(hideLayouts, x, y, width, height, element, hoveredTarget) {
            let position;
            let targetedBlock;
            let pos = false;

            // if were in layout mode, hint for that
            if (!hideLayouts) {

                position = x / width;

                if (element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                    pos = false;
                }

                else if (position < 0.09) {
                    pos = 'left';
                }

                else if (position > 0.89) {
                    pos = 'right';
                }

                return {
                    position: pos,
                    element: element,
                    type: 'col'
                };
            }

            // else were hinting on widgets -- top and bottom
            else {
                targetedBlock = this.closest(hoveredTarget, BLOCK_CLASSNAME);

                if (targetedBlock) {
                    position = y / parseInt(window.getComputedStyle(targetedBlock, null).height, 10);
                }

                if (position < 0.49) {
                    pos = 'top';
                }

                else {
                    pos = 'bottom';
                }

                return {
                    position: pos,
                    element: targetedBlock,
                    type: 'widget-col'
                };
            }
        }

        showHintBarMessage(x, y, width, height, element, msg) {
            Chorizo.editor.showColHintBar(this.element.querySelector('.mz-layout-widget-header'), x, y, width, msg);
        }

        showWidgetHintBarMessage(x, y, width, height, element, msg) {
            Chorizo.editor.showWidgetHintBar(this.closest(element, BLOCK_CLASSNAME), this.element, x, y, height, msg);
        }

        dragleave() {
            Array.from(doc.querySelectorAll(ALL_COL_SELECTOR))
                .forEach((col) => col.classList.remove('mz-cms-drop-over'));
        }

        drop(e) {
            e.stopPropagation();
            this.dragleave(e);
            Chorizo.editor.hideDragIcon();

            if (!this.isValidDrop(e)) {
                return false;
            }

            Chorizo.editor.setDirtyState(true);

            const widgetData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const afterDropCallback = function(layout) {
                if (widgetData.hasContent) {
                    this.dropWithContent(layout);
                }
                else {
                    this.removeElementWhereDragStarted();
                }
            };

            // if were dragging a widget, lets ignore the widget editor
            if (widgetData.dragMethod === 'widgetDrag') {

                Chorizo.editor.fireEvent('widgetdrop', {
                    widgetTypeId: widgetData.id,
                    type: widgetData.type,
                    ignoreEditor: true,
                    element: this.element,
                    data: JSON.parse(doc.querySelector('#mz-widget-copy').getAttribute('data-widget')),
                    callback: this.afterDrop.bind(this, function() {
                        // destory the dragged element relic
                        const tempBlock = new Block(doc.querySelector('#mz-widget-copy'));
                        tempBlock.destroy();
                    })
                }, true); // true means theres incoming data || not a brand new widget drop

            }

            // if the layout drop occurs as an addition to a row, ignore the widget editor
            else if ((this._colmouseposition && this._colmouseposition.position) && !_mouseposition) {

                Chorizo.editor.fireEvent('widgetdrop', {
                    widgetTypeId: widgetData.id,
                    type: widgetData.type,
                    callback: this.afterDrop.bind(this, afterDropCallback),
                    ignoreEditor: widgetData.type !== 'content'
                });
            }

            else {
                Chorizo.editor.fireEvent('widgetdrop', {
                    widgetTypeId: widgetData.id,
                    type: widgetData.type,
                    callback: this.afterDrop.bind(this, afterDropCallback),
                    ignoreEditor: false
                });
            }

            Chorizo.editor.hideHintBar();
        }

        afterDrop(cb, html, cfg) {

            if (cfg.type === 'layout') {
                this.layout = new Layout();
                this.layout.createFromDrop(html, cfg);
                this.insertLayoutElement(cfg, cb);
            }

            else {
                this.insertWidgetElement(cb, html, cfg);
            }

            this.resetMousePosition();
        }

        insertWidgetElement(cb, html, cfg) {
            let block;
            let layout;

            this.removeDropHint();
            block = new Block();
            block.create(cfg, html);

            // if we drop a widget into a dropzone, lets create a layout element around it
            if (this.element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                layout = new Layout();
                layout.create(false);
                layout.col.removeDropHint();
                layout.col.element.appendChild(block.element);
                this.element.appendChild(layout.element);
                Chorizo.editor.showLayoutHeaders(false);
            }

            else if (this._colmouseposition.position === 'bottom') {
                if (!this.element.querySelector(BLOCK_SELECTOR)) {
                    this.element.appendChild(block.element);
                }

                else {
                    this._colmouseposition.element.parentNode.insertBefore(
                                                                block.element,
                                                                this._colmouseposition.element.nextSibling);
                }
            }

            else if (this._colmouseposition.position === 'top') {
                this.element.insertBefore(block.element, this._colmouseposition.element);
            }

            if (cb) {
                cb.call(this);
            }
        }

        containsInteriorRow(element) {
            return element.classList && element.classList.contains(ROW_CLASSNAME);
        }

        doColumnInsert(positionObject, cb) {
            const cols = this.layout.element.querySelectorAll('.mz-layout-col');
            let newlyAddedCol;

            Array.from(cols).forEach((col) => {

                if (positionObject.position === 'right') {

                    // if the drop element has children, we need to append it to the containing row, and not the column
                    if (this.containsInteriorRow(positionObject.element)) {
                        positionObject.element.parentNode.parentNode.insertBefore(
                                                                        col,
                                                                        positionObject.element.parentNode.nextSibling);
                        newlyAddedCol = new Col(col);
                        this.rebase(positionObject.element.parentNode.parentNode);
                    }

                    else {
                        positionObject.element.parentNode.insertBefore(col, positionObject.element.nextSibling);
                        newlyAddedCol = new Col(col);
                    }
                }

                else {
                    // adding new columns to left

                    // if the drop element has children, we need to append it to the containing row, and not the column
                    if (this.containsInteriorRow(positionObject.element)) {
                        positionObject.element.parentNode.parentNode.insertBefore(col, positionObject.element.parentNode);
                        newlyAddedCol = new Col(col);
                        this.rebase(positionObject.element.parentNode.parentNode);
                    }

                    else {
                        positionObject.element.parentNode.insertBefore(col, positionObject.element);
                        newlyAddedCol = new Col(col);
                    }
                }

                if (cb) {
                    cb.call(this, newlyAddedCol);
                }
            });

            this.rebase(positionObject.element.parentNode);

        }

        insertLayoutElement(cfg, cb) {

            let newCol;
            let row;
            // defer to column actions first
            if (this._colmouseposition && this._colmouseposition.position) {
                this.doColumnInsert(this._colmouseposition, cb);
            }
            // else, a action happend within a row
            else {

                // since action happened in a row -- we may need to remove drop hint
                this.removeDropHint();

                if (!_mouseposition) {
                    this.element.appendChild(this.layout.element);
                }

                else if (_mouseposition.position === 'top') {
                    this.element.insertBefore(this.layout.element, _mouseposition.element);

                }

                else if (_mouseposition.position === 'bottom') {
                    _mouseposition.element.parentNode.insertBefore(
                                                        this.layout.element,
                                                        _mouseposition.element.nextSibling);

                }

                else if (_mouseposition.position === 'right' || _mouseposition.position === 'left') {
                    if (this.element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                        return false;
                    }
                    this.doColumnInsert(_mouseposition, cb);
                }
            }

            row = new Row(this.layout.element);

            row.updateRowTitle(cfg.config);

            Array.from(this.layout.element.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {
                newCol = new Col(col);
            }, this);

            // if the cb wasnt handled already, its a new row, so we need to see if content was dragged
            if (newCol && cb) {
                cb.call(newCol, newCol);
            }
        }

        removeDropHint() {

            if (this.element.querySelector('.content')
                    && this.element.querySelector('.content').parentNode.isSameNode(this.element)) {
                this.element.querySelector('.content').remove();
            }

        }

        addDropHint() {

            const content = doc.createElement('div');
            content.innerHTML = DROP_HINT_TEXT;
            content.classList.add('content');

            if (!this.element.querySelector(`${BLOCK_SELECTOR}, ${ROW_SELECTOR}, ${ALL_COL_SELECTOR}`)) {
                this.element.appendChild(content);
            }
        }

        onHover() {
            // possibly show hide, row/col tools?
        }
    }

    doc.addEventListener('DOMContentLoaded', function() {

        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        // init grids that aren't inherited

        Chorizo.helper.factory(GRID_SELECTOR + '.mz-cms-editing', Grid);
        Chorizo.helper.factory(ROW_SELECTOR, Row);
        Chorizo.helper.factory(ALL_COL_SELECTOR, Col);
        Chorizo.helper.factory(BLOCK_SELECTOR, Block);

        if (Chorizo.editor.hideLayouts) {
            Chorizo.editor.showLayoutHeaders(false);
        }

        const target = new Target();

        doc.addEventListener('click', target.showResizer);
    });

})(window, document);