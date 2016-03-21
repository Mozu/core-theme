import {
    CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE,
    CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR,
    CONTENT_WIDGET_ROLE_ATTRIBUTE,
    CONTENT_WIDGET_STYLE_ATTRIBUTE,
    CONTENT_WIDGET_FORMAT_BAR,
    CONTENT_SELECTOR,
    EDITING_STATE_CLASS,
    URL_TOOLTIP_CLASS,
    DATA_WIDGET_ATTRIBUTE,
    TEMP_LINK_ID
} from './../constants';

export default class ContentWidget {

    constructor() {
        this.stylesDropdown = [
            {
                label: 'Heading 1',
                tagName: 'h1'
            },
            {
                label: 'Heading 2',
                tagName: 'h2'
            },
            {
                label: 'Normal',
                tagName: 'p'
            },
            {
                label: 'Special',
                tagName: 'div',
                className: 'special'
            }
        ];

        document.addEventListener('click', (function(event) {

            if (this.shouldDismissEditor(event.target, event)) {
                return false;
            }

            if (this.formatter) {
                this.hideEditor();
                Chorizo.editor.updateAllContentWidgets();
            }

        }).bind(this));

    }

    updateWidget() {
        const newWidgetData = this.currentBlock.element.querySelector(CONTENT_SELECTOR).innerHTML;
        const existingData = JSON.parse(this.currentBlock.element.getAttribute(DATA_WIDGET_ATTRIBUTE));

        existingData.config.body = newWidgetData;

        this.currentBlock.element.setAttribute(DATA_WIDGET_ATTRIBUTE, JSON.stringify(existingData));
    }

    hideEditor() {
        this.toggleDropdown(true);
        this.hideUrlTooltip();
        if (this.formatter) {
            this.formatter.style.top = '-84px';
        }
        this.toggleEditable();
    }

    shouldDismissEditor(target, event) {

        if (this.contains(target, CONTENT_WIDGET_FORMAT_BAR)) {
            return true;
        }

        else if (this.contains(target, URL_TOOLTIP_CLASS)) {
            return true;
        }
    }

    contains(el, cls) {
        while (el !== document.body && el && el.classList) {
            if (el.classList.contains(cls)) {
                return el;
            }
            else {
                el = el.parentNode;
            }
        }
    }

    getUrlTooltip() {
        const urlTooltip = document.createElement('div');

        urlTooltip.classList.add(URL_TOOLTIP_CLASS);

        urlTooltip.innerHTML = '<input type="text" placeholder="http://">';

        urlTooltip.addEventListener('change', this.onUrlUpdate.bind(this));

        urlTooltip.addEventListener('keydown', (function(e) {
            if (e.which === 13 && e.target.value !== '') {
                this.onUrlUpdate(e);
                this.hideUrlTooltip();
            }

        }).bind(this));

        document.body.appendChild(urlTooltip);

        return urlTooltip;
    }

    onUrlUpdate(e) {

        const url = this.urlTooltip.querySelector('input').value;
        const linkElement = this.currentLink.startContainer.querySelector('a');

        linkElement.setAttribute('href', url);

        this.updateWidget();

        e.target.value = '';
    }

    revealEditor(block) {

        this.toggleAllContentWidgets();

        this.formatter = this.formatter || this.getFormatter();

        this.urlTooltip = this.urlTooltip || this.getUrlTooltip();

        this.formatter.classList.add(CONTENT_WIDGET_FORMAT_BAR);

        this.currentBlock = block;

        this.toggleEditable(true);

        setTimeout(() => {
            this.formatter.style.top = '0px';
        }, 30);

    }

    toggleAllContentWidgets() {
        Array.from(document.querySelectorAll(CONTENT_SELECTOR)).forEach((widget) => {

            widget.contentEditable = false;
            widget.parentNode.classList.remove(EDITING_STATE_CLASS);

        });
    }

    toggleEditable(on) {

        if (!this.currentBlock) {
            return false;
        }

        const content = this.currentBlock.element.querySelector(CONTENT_SELECTOR);
        const block = this.currentBlock.element;

        if (!block || !content) {
            console.warn('An error occurred');
            return false;
        }

        if (on) {
            content.contentEditable = true;
            block.classList.add(EDITING_STATE_CLASS);
        }

        else {
            content.contentEditable = false;
            block.classList.remove(EDITING_STATE_CLASS);
        }
    }

    toggleDropdown(dismiss) {
        if (this.dropDownMenuMount) {
            this.dropDownMenuMount.style.display = this.dropDownMenuMount.style.display === 'block'
                || dismiss === true
                ? 'none' : 'block';
        }
    }

    addStyleDropdown(formatterComponent) {

        this.dropDownMenuMount = formatterComponent.querySelector(CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR);

        const dropDownMenu = this.dropDownMenuMount.parentNode;

        dropDownMenu.addEventListener('click', this.toggleDropdown.bind(this));

        this.stylesDropdown.forEach((style) => {

            const li = document.createElement('li');

            li.innerHTML = style.label;

            li.setAttribute(CONTENT_WIDGET_STYLE_ATTRIBUTE, JSON.stringify(style));

            li.setAttribute(CONTENT_WIDGET_ROLE_ATTRIBUTE, 'style');

            this.dropDownMenuMount.appendChild(li);

        }, this);
    }

    doCustomStyle(item) {
        const style = JSON.parse(item.getAttribute(CONTENT_WIDGET_STYLE_ATTRIBUTE));

        document.execCommand('formatBlock', false, style.tagName);
    }

    handleStyleEvent(e) {

        e.preventDefault();
        e.stopImmediatePropagation();

        const item = e.target;
        const role = item.getAttribute(CONTENT_WIDGET_ROLE_ATTRIBUTE)
            ? item.getAttribute(CONTENT_WIDGET_ROLE_ATTRIBUTE)
            : item.parentElement.getAttribute(CONTENT_WIDGET_ROLE_ATTRIBUTE);

        switch (role) {

        case 'style':
            this.doCustomStyle(item);
            break;
        case 'createLink':
            this.createLink();
        default:
            document.execCommand(role, false, null);
            break;
        }

    }

    createLink() {
        document.execCommand('createLink', false, TEMP_LINK_ID);

        this.showUrlTooltip();
    }

    showUrlTooltip() {
        const element = document.querySelector('[href="' + TEMP_LINK_ID + '"]');
        const position = element.getBoundingClientRect();

        this.urlTooltip.style.left = '40%';
        this.urlTooltip.style.top = `${position.top + 30}px`;

        this.urlTooltip.style.display = 'block';

        this.currentLink = this.saveSelection()[0];

    }

    saveSelection() {
        if (window.getSelection) {
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                var ranges = [];
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    ranges.push(sel.getRangeAt(i));
                }
                return ranges;
            }
        } else if (document.selection && document.selection.createRange) {
            return document.selection.createRange();
        }
        return null;
    }

    hideUrlTooltip() {
        if (this.urlTooltip) {
            this.urlTooltip.style.display = 'none';
        }
    }

    getFormatter() {

        const iconClass = {
            bold: 'fa fa-bold',
            italic: 'fa fa-italic',
            underline: 'fa fa-underline',
            link: 'fa fa-link',
            unlink: 'fa fa-unlink',
            alignLeft: 'fa fa-align-left',
            alignRight: 'fa fa-align-right',
            alignCenter: 'fa fa-align-center',
            unorderedList: 'fa fa-list-ul',
            orderedList: 'fa fa-list-ol',
            indent: 'fa fa-indent',
            outdent: 'fa fa-outdent'
        };

        const formatterInnerHTML = [
            '<ul>',
            '<li ', CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE, ' class="mz-cms-styles"',
            '<span>Styles</span>',
            '<i class="fa fa-caret-down"></i>',
            '<ul></ul>',
            '</li>',
            '<li data-role="bold"><i class="', iconClass.bold, '"></i></li>',
            '<li data-role="italic"><i class="', iconClass.italic, '"></i></li>',
            '<li data-role="underline"><i class="', iconClass.underline, '"></i></li>',
            '<li data-role="createLink"><i class="', iconClass.link, '"></i></li>',
            '<li data-role="unlink"><i class="', iconClass.unlink, '"></i></li>',
            '<li data-role="justifyLeft"><i class="', iconClass.alignLeft, '"></i></li>',
            '<li data-role="justifyCenter"><i class="', iconClass.alignCenter, '"></i></li>',
            '<li data-role="justifyRight"><i class="', iconClass.alignRight, '"></i></li>',
            '<li data-role="insertUnorderedList"><i class="', iconClass.unorderedList, '"></i></li>',
            '<li data-role="insertOrderedList"><i class="', iconClass.orderedList, '"></i></li>',
            '<li data-role="indent"><i class="', iconClass.indent, '"></i></li>',
            '<li data-role="outdent"><i class="', iconClass.outdent, '"></i></li>',
            '</ul>'
        ].join('');

        const formatterComponent = document.createElement('div');

        formatterComponent.innerHTML = formatterInnerHTML;

        formatterComponent.addEventListener('mousedown', this.handleStyleEvent.bind(this));

        document.body.appendChild(formatterComponent);

        this.addStyleDropdown(formatterComponent);

        return formatterComponent;
    }
}

export const contentWidget = new ContentWidget();