/**
 * @class Taco.core.util.RangeFilter
 * An Ext.util.Filter that supports a range of dates.
 */

Ext.define('Taco.core.util.RangeFilter', {
    extend: 'Ext.util.Filter',
    alias: 'widget.rangefilter',

    low: null,
    high: null,
    property: '',

    configure: function () {
    	var me = this;

    	var baseDate = function () {
    		var today = new Date();
    		return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    	};
    	var fromDate = function (date, days, months, years) {
    		return new Date(date.getFullYear() + (years || 0), date.getMonth() + (months || 0), date.getDate() + (days || 0));
    	};

    	if (me.today) {

    		me.low = baseDate();
    		me.high = fromDate(me.low, 1);

    	} else if (me.yesterday) {

    		me.high = baseDate();
			me.low = fromDate(me.high, -1);

    	} else if (me.lastWeek) {

    		me.high = baseDate();
    		me.low = fromDate(me.high, -7);

    	} else if (me.lastMonth) {

    		me.high = baseDate();
    		me.low = fromDate(me.high, 0, -1);
    	}
    },

	filterFn: function (item) {
		var me = this;

		me.configure();

		return this.low <= item[property] && item[property] <= this.high;
	}
});
