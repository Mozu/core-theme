/**
 * @class Taco.core.ux.picker.DateTime
 * A date & time picker. This class is used by Taco.core.ux.form.DateTime to allow browsing and selection of
 * valid dates in a popup next to the field, but may also be used with other components.
 */
Ext.define('Taco.core.ux.picker.DateTime', {
    extend: 'Ext.picker.Date',
    alias: 'widget.datetimepicker',
   
    childEls: [
        'innerEl', 'eventEl', 'prevEl', 'nextEl', 'middleBtnEl', 'footerEl'
    ],
    
    border: false,
    hideOnSelect: false,

    renderTpl: [
        '<div class="taco-pointer-before">&nbsp;</div>',
        '<div class="taco-pointer-after">&nbsp;</div>',
        '<div id="{id}-innerEl" role="grid">',
            '<div role="presentation" class="{baseCls}-header">',
                '<div class="{baseCls}-prev"><a id="{id}-prevEl" href="#" role="button" title="{prevText}"></a></div>',
                '<div class="{baseCls}-month" id="{id}-middleBtnEl">{%this.renderMonthBtn(values, out)%}</div>',
                '<div class="{baseCls}-next"><a id="{id}-nextEl" href="#" role="button" title="{nextText}"></a></div>',
            '</div>',
            '<table id="{id}-eventEl" class="{baseCls}-inner" cellspacing="0" role="presentation">',
                '<thead role="presentation"><tr role="presentation">',
                    '<tpl for="dayNames">',
                        '<th role="columnheader" title="{.}"><span>{.:this.firstInitial}</span></th>',
                    '</tpl>',
                '</tr></thead>',
                '<tbody role="presentation"><tr role="presentation">',
                    '<tpl for="days">',
                        '{#:this.isEndOfWeek}',
                        '<td role="gridcell" id="{[Ext.id()]}">',
                            '<a role="presentation" href="#" hidefocus="on" class="{parent.baseCls}-date" tabIndex="1">',
                                '<em role="presentation"><span role="presentation"></span></em>',
                            '</a>',
                        '</td>',
                    '</tpl>',
                '</tr></tbody>',
            '</table>',
            '<div class="taco-datepicker-time">',
                'Time {%this.renderTimeCmp(values, out)%} <span class="taco-time-am">am</span> <span class="taco-time-pm">pm</span>',
            '</div>',
            '<tpl if="showToday">',
                '<div id="{id}-footerEl" role="presentation" class="{baseCls}-footer">{%this.renderTodayBtn(values, out)%}</div>',
            '</tpl>',
        '</div>',
        {
            firstInitial: function(value) {
                return Ext.picker.Date.prototype.getDayInitial(value);
            },
            isEndOfWeek: function(value) {
                // convert from 1 based index to 0 based
                // by decrementing value once.
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },
            renderTimeCmp: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.timeCmp.getRenderTree(), out);
            },
            renderTodayBtn: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.todayBtn.getRenderTree(), out);
            },
            renderMonthBtn: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.monthBtn.getRenderTree(), out);
            }
        }
    ],

    initComponent: function () {
        this.timeValue = this.value;

        this.callParent(arguments);

        this.timeValue = this.timeValue || new Date();
    },

    beforeRender: function () {
        this.callParent(arguments);

        this.monthBtn = Ext.create('Ext.Component', {
            ownerCt: this,
            ownerLayout: this.getComponentLayout(),
            cls: 'taco-datepicker-month',
            setText: function(text) {
                this.update(text);
            }
        });

        this.timeCmp = Ext.create('Ext.Component', {
            autoEl: {
                tag: 'input',
                type: 'text',
                value: Ext.Date.format(this.timeValue, 'g:i')
            },
            ownerCt: this,
            ownerLayout: this.getComponentLayout()
        });

        if (this.showToday && this.todayBtn) {
            this.todayBtn = Ext.create('Taco.core.ux.action.Action', {
                ownerCt: this,
                ownerLayout: this.getComponentLayout(),
                text: 'Current date/time',
                listeners: {
                    click: this.selectToday,
                    scope: this
                }
            });
        }
    },

    afterRender: function () {
        this.timeAmEl = this.getEl().down('.taco-time-am');
        this.timePmEl = this.getEl().down('.taco-time-pm');
        this.timeInputEl = this.getEl().down('.taco-datepicker-time input');

        this.timeAmEl.on('click', function () {
            this.setPeriod('am');
        }, this);
        
        this.timePmEl.on('click', function () {
            this.setPeriod('pm');
        }, this);

        this.timeInputEl.on('focus', function () {
            this.oldTime = this.timeInputEl.dom.value;
            Ext.defer(function () {
                this.timeInputEl.dom.select();
            }, 10, this);
        }, this).on('blur', this.validateTime, this);

        this.callParent(arguments);
    },

    validateTime: function () {
        var newTime = this.timeInputEl.dom.value.trim(),
            forcePeriod;

        // Detect if only a number between 1 and 12 is entered
        // and assume its on the hour
        if (newTime.indexOf(':') === -1 && newTime.search(/^([0-1]?\d)|(2[0-4])$/) === 0) {
            newTime += ':00';
        }

        //  Check for the special case of 24:00 and convert it to 0:00 (am)
        if (newTime === '24:00') {
            newTime = '0:00'
        }

        // If the input value is not valid
        // reload the last value used
        if (newTime.search(/^((([0-1]?\d)|(2[0-3])):[0-5]{1}\d)$/) !== 0) {
            newTime = this.oldTime;
        }

        // If hour is in 24-hour mode, switch time to PM
        if (newTime.search(/^(1[3-9])|(2[0-4]):\d{2}$/) === 0) {
            forcePeriod = 'pm';
        };

        if (newTime === '0:00') {
            forcePeriod = 'am';
        }

        this.timeValue = new Date(Ext.Date.format(this.timeValue, 'm/d/Y ' + newTime + (forcePeriod ? '' : ' a')));
        
        if (forcePeriod) {
            this.setPeriod(forcePeriod, true);
        }
        

        this.timeInputEl.dom.value = Ext.Date.format(this.timeValue, 'g:i');

        this.onSelect();
    },

    setValue: function(value) {
        this.timeValue = value;
        this.callParent(arguments);
    },

    getValue: function () {
        return this.bindDateAndTime(this.value, this.timeValue);
    },

    bindDateAndTime: function (dateValue, timeValue) {
        var dateString = Ext.Date.format(dateValue, 'm/d/Y'),
            timeString = Ext.Date.format(timeValue, ' g:i a');

        return new Date(dateString + timeString);
    },

    update: function(value) {
        this.callParent(arguments);

        if (this.rendered) {
            this.getEl().down('input[type=text]').set({value: Ext.Date.format(this.timeValue, 'g:i')});
            this.setPeriod(Ext.Date.format(this.timeValue, 'a'));
        }
    },

    setPeriod: function (mode, suppress) {
        var timeString = Ext.Date.format(this.timeValue, 'm/d/Y g:i '),
            selectedEl,
            toBeSelectEl = this.getEl().down('.taco-time-' + mode);

        this.timeValue = new Date(timeString + mode);

        selectedEl = this.getEl().down('.taco-selected');

        if (selectedEl) {
            selectedEl.removeCls('taco-selected');
        }

        if (toBeSelectEl) {
            toBeSelectEl.addCls('taco-selected');
        }



        this.onSelect();
    },

    selectToday: function () {
        this.setValue(new Date());
        this.timeInputEl.dom.value = Ext.Date.format(this.timeValue, 'g:i');
        this.onSelect();
        return this;
    },

    /**
     * Respond to a date being clicked in the picker
     * @private
     * @param {Ext.EventObject} e
     * @param {HTMLElement} t
     */
    handleDateClick : function(e, t){
        var me = this,
            handler = me.handler;

        e.stopEvent();
        if(!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)){
            me.doCancelFocus = me.focusOnSelect === false;
            me.setValue(me.bindDateAndTime(new Date(t.dateValue), me.timeValue));
            delete me.doCancelFocus;
            me.onSelect();
        }
    },

    onSelect: function () {
        var value = this.getValue();
        this.fireEvent('select', this, value);
        if (typeof this.handler === 'function') {
            this.handler.call(this.scope || this, this, value);
        }

        if (this.hideOnSelect) {
            this.hide();
        }
    },

    beforeDestroy: function () {
        if (this.rendered) {
            Ext.destroy(this.timeCmp);
        }
        this.callParent(arguments);
    }
});