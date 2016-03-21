import {
    DATA_WIDGET_ATTRIBUTE,
    DRAG_EVENTS,
    WIDGET_COPY_ID,
    BLOCK_CLASSNAME,
    CONTENT_CLASSNAME,
    CONTENT_SELECTOR,
    BLOCK_TYPES,
    MZ_CMS_TOOLS_CLASS,
    MZ_CMS_TOOLS_SELECTOR
} from './../../constants';

import {
    addDropHint,
    createDomNode,
    showResizer,
    attachEvents,
    makeDraggable,
    remove
} from './../../utilities';

export default class Block {
    constructor(el) {
        this.element = el || createDomNode('div');
        this._type = BLOCK_TYPES.BLOCK;
        this.widgetData = JSON.parse(this.element.getAttribute(DATA_WIDGET_ATTRIBUTE));
        this.content = this.element.querySelector(CONTENT_SELECTOR) || createDomNode('div');
        attachEvents(this, {
            mouseover: this.onHover.bind(this),
            mouseleave: this.ondragLeave.bind(this),
            dblclick: this.onDoubleClick.bind(this),
            click: showResizer.bind(this, this)
        });

        // to do: use addLayoutHeader instead of custom layout
        // widget impl
        this.addTools();

        if (this.move) {
            makeDraggable(this, this.move, [
                { type: DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) },
                { type: DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) },
                { type: DRAG_EVENTS.drag, func: this.onDrag.bind(this) }
            ]);
        }
    }

    onDrag(e) {
        Chorizo.editor.setDirtyState(true);
        Chorizo.editor.updateDragIconPosition(e);
    }

    onDragStart(e) {

        const widgetData = JSON.parse(this.element.getAttribute(DATA_WIDGET_ATTRIBUTE));
        const body = this.element.innerHTML;

        Chorizo.editor.initDragIcon(Chorizo.editor.getWidgetIcon(widgetData.definitionId));

        this.element.id = WIDGET_COPY_ID;

        e.dataTransfer.setData('text',
            JSON.stringify({
                id: widgetData.definitionId,
                body: body,
                type: 'content',
                data: widgetData,
                dragMethod: 'widgetDrag'
            }));

    }

    onDragEnd(e) {
        e.preventDefault();
        Chorizo.editor.hideDragIcon();
    }

    ondragLeave() {
        this.element.querySelector(MZ_CMS_TOOLS_SELECTOR).style.display = 'none';
    }

    onHover() {
        if (Chorizo.editor.hideLayouts) {
            this.element.querySelector(MZ_CMS_TOOLS_SELECTOR).style.display = 'block';
        }
    }

    doEdit() {
        const block = this;
        const isContentWidget = block.widgetData.definitionId === 'content';

        Chorizo.editor.setDirtyState(true);

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
            Chorizo.contentWidget.revealEditor(block);
        }
    }

    update(html, cfg) {
        this.content.innerHTML = html;
        this.widgetData = cfg;
        this.element.setAttribute(DATA_WIDGET_ATTRIBUTE, JSON.stringify(cfg));

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
        this.element.setAttribute(DATA_WIDGET_ATTRIBUTE, JSON.stringify(cfg));

        if (cfg.config && cfg.config.height) {
            this.content.style.height = cfg.config.height + 'px';
        }

        this.insertWidget(html);

        if (this.move) {
            makeDraggable(this, this.move, [
                { type: DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) },
                { type: DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) }
            ]);
        }
    }

    addTools() {
        this.toolbar = createDomNode('ul', MZ_CMS_TOOLS_CLASS, 'chorizo-icon');
        this.del = createDomNode('li', 'trash', 'chorizo-icon');
        this.edit = createDomNode('li', 'pencil', 'chorizo-icon');
        this.move = createDomNode('li', 'drag-handle', 'chorizo-icon');

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
        const colParent = this.element.parentNode;
        Chorizo.editor.setDirtyState(true);
        remove(this.element);
        addDropHint(colParent);
    }

    insertWidget(html) {
        const shell = createDomNode('div');
        this.content.appendChild(shell);
        shell.outerHTML = html;
        // first child gets around the shell div created from safe insert of outerHTML
        this.content = this.content.firstChild;
    }
}
