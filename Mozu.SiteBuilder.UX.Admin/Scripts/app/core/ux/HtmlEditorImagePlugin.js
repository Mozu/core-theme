Ext.define('Taco.core.ux.HtmlEditorImagePlugin', {
    extend: 'Ext.util.Observable',
    urlSizeVars: ['width', 'height'],
    basePath: 'image.php',
    init: function (cmp) {
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
        this.cmp.on('initialize', this.onInit, this, { delay: 100, single: true });
    },
    onEditorMouseUp: function (e) {
        Ext.get(e.getTarget()).select('img').each(function (el) {
            var w = el.getAttribute('width'), h = el.getAttribute('height'), src = el.getAttribute('src') + ' ';
            src = src.replace(new RegExp(this.urlSizeVars[0] + '=[0-9]{1,5}([&| ])'), this.urlSizeVars[0] + '=' + w + '$1');
            src = src.replace(new RegExp(this.urlSizeVars[1] + '=[0-9]{1,5}([&| ])'), this.urlSizeVars[1] + '=' + h + '$1');
            el.set({ src: src.replace(/\s+$/, "") });
        }, this);

    },
    onInit: function () {
        Ext.EventManager.on(this.cmp.getDoc(), {
            'mouseup': this.onEditorMouseUp,
            buffer: 100,
            scope: this
        });
    },
    onRender: function () {
        var btn = this.cmp.getToolbar().add({
            iconCls: 'x-edit-pictures',
            handler: this.selectImage,
            scope: this,
            tooltip: 'Insert Image'
        });
    },
    selectImage: function () {
        this.cmp.insertAtCursor("<img src='http://scienceblogs.com/gregladen/files/2012/12/Beautifull-cat-cats-14749885-1600-1200.jpg' height='200' >");
    },
    insertImage: function (img) {
        this.cmp.insertAtCursor('<img src="' + this.basePath + '?' + this.urlSizeVars[0] + '=' + img.Width + '&' + this.urlSizeVars[1] + '=' + img.Height + '&id=' + img.ID + '" title="' + img.Name + '" alt="' + img.Name + '">');
    }
});