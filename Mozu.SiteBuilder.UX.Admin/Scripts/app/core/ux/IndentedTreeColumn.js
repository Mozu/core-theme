/**
 * @class Taco.core.ux.IndentedTreeColumn
 */
Ext.define('Taco.core.ux.IndentedTreeColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.indentedtreecolumn',

    tdCls: 'x-grid-cell-treecolumn',

    initComponent: function () {
        var origRenderer = this.renderer || this.defaultRenderer,
            origScope = this.scope || window;

        this.renderer = function (value, metaData, record, rowIdx, colIdx, store, view) {
            var buf = [],
                format = Ext.String.format,
                depth = record.getDepth(),
                treePrefix = Ext.baseCSSPrefix + 'tree-',
                elbowPrefix = treePrefix + 'elbow-',
                expanderCls = treePrefix + 'expander',
                imgText = '<img src="{1}" class="{0}" />',
                checkboxText = '<input type="button" role="checkbox" class="{0}" {1} />',
                indentText = '<div class="taco-tree-indentation">',
                formattedValue = origRenderer.apply(origScope, arguments),
                href = record.get('href'),
                target = record.get('hrefTarget'),
                cls = record.get('cls');

            while (record) {
                if (!record.isRoot() || (record.isRoot() && view.rootVisible)) {
                    if (record.getDepth() === depth) {
                        buf.unshift(format(imgText,
                            treePrefix + 'icon ' +
                            treePrefix + 'icon' + (record.get('icon') ? '-inline ' : (record.isLeaf() ? '-leaf ' : '-empty ')) +
                            (record.get('iconCls') || ''),
                            record.get('icon') || Ext.BLANK_IMAGE_URL
                        ));
                        if (record.get('checked') !== null) {
                            buf.unshift(format(
                                checkboxText,
                                (treePrefix + 'checkbox') + (record.get('checked') ? ' ' + treePrefix + 'checkbox-checked' : ''),
                                record.get('checked') ? 'aria-checked="true"' : ''
                            ));
                            if (record.get('checked')) {
                                metaData.tdCls += (' ' + treePrefix + 'checked');
                            }
                        }
                        if (record.isLast() && record.isExpandable()) {
                            buf.unshift(format(imgText, (elbowPrefix + 'end-plus ' + expanderCls), Ext.BLANK_IMAGE_URL));
                        } else if (record.isExpandable()) {
                            buf.unshift(format(imgText, (elbowPrefix + 'plus ' + expanderCls), Ext.BLANK_IMAGE_URL));
                        }
                    }
                }
                record = record.parentNode;
            }
            if (href) {
                buf.push('<a href="', href, '" target="', target, '">', formattedValue, '</a>');
            } else {
                buf.push(formattedValue);
            }
            while (depth > 0) {
                depth--;
                buf.unshift(indentText);
                buf.push('</div>');
            }
            metaData.tdCls += 'taco-indented-cell';
            if (cls) {
                metaData.tdCls += ' ' + cls;
            }
            return buf.join('');
        };

        this.callParent(arguments);
    },

    defaultRenderer: function (value) {
        return value;
    }
});