/**
 * @class Taco.core.ux.tinymce.TinyMCE
 * @extends Ext.form.field.TextArea
 * @requires Taco.core.ux.tinymce.WindowManager
 * @requires Taco.view.fileManagement.MultiFileAssociator
 *
 * The Initial Developer of the Original Code is daanlib with some methods of
 * Fady Khalife (http://code.google.com/p/ext-js-4-tinymce-ux/source/browse/trunk/ux/form/TinyMCE.js)
 * @see http://www.sencha.com/forum/showthread.php?138436-TinyMCE-form-field
 *
 * @contributor Harald Hanek
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */


    var fireXBrowserMouseEvent = function (obj, evt) {

        var fireOnThis = obj,
            evObj;
        if (document.createEvent) {
            evObj = document.createEvent('MouseEvents');
            evObj.initEvent(evt, true, false);
            fireOnThis.dispatchEvent(evObj);

        }
        else if (document.createEventObject) {
            evObj = document.createEventObject();
            fireOnThis.fireEvent('on' + evt, evObj);
        }
    };

    window.tinyMCEPreInit = {
        base: "/admin/Scripts/resources/lib/tinymce/jscripts/tiny_mce",
        suffix: ""
    };

    
    window.tinyMCE.init({
                language: "en",
                mode: "none",
                skin: "o2k7",
                skin_variant: 'silver',
                theme: "advanced",
                relative_urls: false,
                plugins: 'autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,-TacoImage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template'});


     var preloader = function () {
                var each=this.each,

                    explode=this.explode,
                    PluginManager = this.PluginManager,
                    ThemeManager = this.ThemeManager,
                    t = this,
                    s = t.settings,
                    id = t.id,
                    sl = tinymce.ScriptLoader;

                if (s.language && s.language_load !== false)
                    sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

                if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
                    ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

                each(explode(s.plugins), function(p) {
                    if (p &&!PluginManager.urls[p]) {
                        if (p.charAt(0) == '-') {
                            p = p.substr(1, p.length);
                            var dependencies = PluginManager.dependencies(p);
                            tinyMCE.each(dependencies, function(dep) {
                                var defaultSettings = {prefix:'plugins/', resource: dep, suffix:'/editor_plugin' + tinymce.suffix + '.js'};
                                dep = PluginManager.createUrl(defaultSettings, dep);
                                PluginManager.load(dep.resource, dep);
                            });
                        } else {
                            // Skip safari plugin, since it is removed as of 3.3b1
                            if (p == 'safari') {
                                return;
                            }
                            PluginManager.load(p, {prefix:'plugins/', resource: p, suffix:'/editor_plugin' + tinymce.suffix + '.js'});
                        }
                    }
                });

                // Init when que is loaded
                sl.loadQueue(function() {
                    if (!t.removed)
                        t.init();
                });
            };
           
            preloader.call(tinymce, tinyMCE.settings,tinymce.ScriptLoader);



    Ext.define("Taco.core.ux.tinymce.TinyMCE", {
        extend: 'Ext.form.field.TextArea',
        alias: 'widget.tinymcefield',

        requires: ['Taco.core.ux.tinymce.WindowManager', 'Taco.view.fileManagement.MultiFileAssociator'],

        

        shadow: false,

        statics: {
            tinyMCEInitialized: false,
            globalSettings: {
                accessibility_focus: false,
                language: "en",
                mode: "none",
                skin: "o2k7",
                skin_variant: 'silver',
                theme: "advanced",
                relative_urls: false,
                plugins: 'autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,-TacoImage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template',
                theme_advanced_buttons1: 'undo,redo,|,styleselect,|,bold,italic,underline,strikethrough,|,removeformat,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,|,link,unlink,|,numlist,bullist,|,code,|,image',
                theme_advanced_buttons2: '',
                theme_advanced_buttons3: '',
                theme_advanced_buttons4: '',
                accessibility_warnings: 0,
                theme_advanced_styles: "Header 1=header1;Header 2=header2;Header 3=header3;Accent=accent",
                theme_advanced_statusbar_location: 'none',
                theme_advanced_resize_horizontal: false,
                theme_advanced_resizing: false,
                theme_advanced_resizing_min_height: 10,
                theme_advanced_resizing_min_width: 10,
                width: '100%',
                height: '100%'

            },

            setGlobalSettings: function (settings) {
                Ext.apply(this.globalSettings, settings);
            }
        },

        constructor: function (config) {
            var me = this,
                globalSettings = me.statics().globalSettings;

            config.tinymceConfig = config.tinymceConfig || globalSettings;

            config.height = (config.height && config.height >= me.config.height) ? config.height : me.config.height;

            Ext.applyIf(config.tinymceConfig, me.statics().globalSettings);

            if (me.tinymceConfig) {
                Ext.apply(config.tinymceConfig, me.tinymceConfig);
            }

            // Init values we do not want changed
            config.tinymceConfig.mode = 'none';

            me.addEvents({
                "editorcreated": true
            });

            me.callParent([config]);
            //return me;
        },

        createTinyMCE: function () {
            var me = this;



            me.editor = new tinymce.Editor(me.inputEl.id, me.tinymceConfig);
            me.editor.extParent = me;
            me.loadTacoImagePlugin();
            // Validate value onKeyPress
            var validateContentTask = Ext.Function.createBuffered(me.validate, 250, this);
            me.editor.onKeyPress.add(validateContentTask);

            me.editor.onKeyUp.add(function (ed, e) {
                var extEvent = new Ext.EventObjectImpl(e);
                if (extEvent.isSpecialKey() && extEvent.getKey() !== extEvent.ENTER) {
                    me.fireEvent('specialkey', extEvent);
                }
                else {
                    me.fireEvent('keyup', extEvent);
                }
            }, me);

            me.editor.onPostRender.add(Ext.Function.bind(function (editor, controlManager) {
                editor.windowManager = Ext.create("Taco.core.ux.tinymce.WindowManager", {
                    editor: me.editor
                });
                me.tableEl = Ext.get(me.editor.id + "_tbl");
                me.iframeEl = Ext.get(me.editor.id + "_ifr");

                me.editor.focus();

                fireXBrowserMouseEvent(me.editor.dom.getRoot(), 'mouseup');

                if (me.width && me.height) {
                    editor.theme.resizeTo(me.width, me.height);
                }

            }, me));

            me.on('resize', me.onResize, me);

            me.editor.render();
            tinyMCE.add(me.editor);
        },


        beforeCompleteEdit: function () {
            var me = this;
            return me.editor == null || me.editor.imageModal == null || me.editor.imageModal.getEl() == null;
        },

        loadTacoImagePlugin: function () {

            tinymce.create('tinymce.plugins.TacoImage', {
                init: function (ed, url) {
                    // Register commands
                    ed.addCommand('mceTacoImage', function () {
                        var el = ed.selection.getNode(),
                            parts,
                            initialSelected;

                        // Internal image object like a flash placeholder
                        if (ed.dom.getAttrib(ed.selection.getNode(), 'class', '').indexOf('mceItem') != -1) {
                            return;
                        }

                        //grab selected node
                        if (el && el.nodeName == 'IMG') {
                            parts = el.getAttribute('src').split('/');
                            initialSelected = [{
                                id: parts[parts.length - 1],
                                alt: el.getAttribute('alt')
                            }];
                        }

                        ed.imageModal = Ext.create('Taco.view.fileManagement.MultiFileAssociator', {
                            style: {
                                zIndex: 20001
                            },
                            initialSelected: initialSelected,
                            allowMultiple: false,
                            listeners: {
                                save: function () {
                                    var store = ed.imageModal.getSelectedRecords(),
                                        url, args, el, record;
                                    if (store.getCount() === 0) {
                                        return;
                                    }
                                    record = store.getAt(0);

                                    args = {
                                        src: '/admin/img/files/' + record.getId(),
                                        height: record.get('height'),
                                        width: record.get('width'),
                                        alt: record.get('alt')
                                    };

                                    url = '/admin/img/files/' + record.getId();


                                    if (el && el.nodeName == 'IMG') {
                                        ed.dom.setAttribs(el, args);
                                    }
                                    else {
                                        var imgTag = ed.dom.createHTML('img', args);
                                        ed.execCommand('mceInsertContent', false, imgTag);
                                    }
                                    ed.extParent.fireEvent('insert', ed.extParent);
                                    ed.imageModal.hide();
                                    ed.imageModal = null;
                                }
                            }
                        });



                    });

                    // Register buttons
                    ed.addButton('image', {
                        title: 'advimage.image_desc',
                        cmd: 'mceTacoImage'
                    });
                },

                getInfo: function () {
                    return {
                        longname: 'Advanced image',
                        author: 'volusion'
                    };
                }
            });
            tinymce.PluginManager.add('TacoImage', tinymce.plugins.TacoImage);
        },
        afterRender: function () {
            this.callParent(arguments);
            this.createTinyMCE();
        },

        isDirty: function () {
            var me = this;
            if (me.disabled || !me.rendered) {
                return false;
            }
            return me.editor && me.editor.initialized && me.editor.isDirty();
        },

        getValue: function () {
            return this.editor.getContent();
        },

        setValue: function (value) {
            var me = this;
            me.value = value;
            if (me.rendered) me.withEd(function () {
                me.editor.undoManager.clear();
                me.editor.setContent(value === null || value === undefined ? '' : value);
                me.editor.startContent = me.editor.getContent({
                    format: 'raw'
                });
                me.validate();
                // me.editor.resizeToContent();
            });
        },

        getSubmitData: function () {
            var ret = {};
            ret[this.getName()] = this.getValue();
            return ret;
        },

        insertValueAtCursor: function (value) {
            var me = this;

            if (me.editor && me.editor.initialized) {
                me.editor.execCommand('mceInsertContent', false, value);
            }
        },

        onDestroy: function () {
            var me = this;

            tinymce.remove(me.editor.id);
            me.editor.destroy();
            me.callParent(arguments);
        },

        onResize: function (component, adjWidth, adjHeight) {
            var width, bodyWidth = component.bodyEl.getWidth();

            if (component.iframeEl) {
                width = bodyWidth - component.iframeEl.getBorderWidth('lr') - 2;
                component.iframeEl.setWidth(width);
            }

            if (component.tableEl) {
                width = bodyWidth - component.tableEl.getBorderWidth('lr') - 2;
                component.tableEl.setWidth(width);
            }
        },

        getEditor: function () {
            return this.editor;
        },

        getRawValue: function () {
            var me = this;

            return (!me.editor || !me.editor.initialized) ? Ext.valueFrom(me.value, '') : me.editor.getContent();
        },

        disable: function () {
            this.withEd(function () {
                var bodyEl = this.editor.getBody();
                bodyEl = Ext.get(bodyEl);
                if (bodyEl.hasCls('mceContentBody')) {
                    bodyEl.removeCls('mceContentBody');
                    bodyEl.addCls('mceNonEditable');
                }
            });
        },

        enable: function () {
            this.withEd(function () {
                var bodyEl = this.editor.getBody();
                bodyEl = Ext.get(bodyEl);
                if (bodyEl.hasCls('mceNonEditable')) {
                    bodyEl.removeCls('mceNonEditable');
                    bodyEl.addCls('mceContentBody');
                }
            });
        },

        withEd: function (func) {
            // If editor is not created yet, reschedule this call.
            if (!this.editor) this.on("editorcreated", function () {
                this.withEd(func);
            }, this);
            // Else if editor is created and initialized
            else if (this.editor.initialized) func.call(this);
            // Else if editor is created but not initialized yet.
            else this.editor.onInit.add(Ext.Function.bind(function () {
                Ext.Function.defer(func, 10, this);
            }, this));
        },

        validateValue: function (value) {
            var me = this;

            if (Ext.isFunction(me.validator)) {
                var msg = me.validator(value);
                if (msg !== true) {
                    me.markInvalid(msg);
                    return false;
                }
            }

            if (value.length < 1 || value === me.emptyText) { // if it's blank
                if (me.allowBlank) {
                    me.clearInvalid();
                    return true;
                }
                else {
                    me.markInvalid(me.blankText);
                    return false;
                }
            }

            if (value.length < me.minLength) {
                me.markInvalid(Ext.String.format(me.minLengthText, me.minLength));
                return false;
            }
            else me.clearInvalid();

            if (value.length > me.maxLength) {
                me.markInvalid(Ext.String.format(me.maxLengthText, me.maxLength));
                return false;
            }
            else me.clearInvalid();

            if (me.vtype) {
                var vt = Ext.form.field.VTypes;
                if (!vt[me.vtype](value, me)) {
                    me.markInvalid(me.vtypeText || vt[me.vtype + 'Text']);
                    return false;
                }
            }

            if (me.regex && !me.regex.test(value)) {
                me.markInvalid(me.regexText);
                return false;
            }
            return true;
        }
    });

