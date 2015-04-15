/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
define(['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu'], function($, _, Backbone) {

    var PagingBaseView = Backbone.MozuView.extend({
        initialize: function() {
            var me = this;
            if (!this.model._isPaged) {
                throw "Cannot bind a Paging view to a model that does not have the Paging mixin!";
            }

            //handle browser's back button to make sure startIndex is updated.
            Backbone.history.on('route', function () {
                me.model.syncIndex(Backbone.history.fragment);
            });
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.$('select').each(function() {
                var $this = $(this);
                $this.val($this.find('option[selected]').val());
            });
        }
    });

    var PagingControlsView = PagingBaseView.extend({
        templateName: 'modules/common/paging-controls',
        autoUpdate: ['pageSize'],
        updatePageSize: function(e) {
            var newSize = parseInt($(e.currentTarget).val(), 10),
            currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) {
                this.model.set('pageSize', newSize);
                this.model.set("startIndex", 0);
            }
        }
    });

    var PageNumbersView = PagingBaseView.extend({
        templateName: 'modules/common/page-numbers',
        previous: function(e) {
            e.preventDefault();
            return this.model.previousPage();
        },
        next: function(e) {
            e.preventDefault();
            return this.model.nextPage();
        },
        page: function(e) {
            e.preventDefault();
            return this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num'), 10) || 1);
        }
    });

    var scrollToTop = function() {
        $('body').ScrollTo({ duration: 200 });
    };

    var TopScrollingPageNumbersView = PageNumbersView.extend({
        previous: function() {
            return PageNumbersView.prototype.previous.apply(this, arguments).then(scrollToTop);
        },
        next: function() {
            return PageNumbersView.prototype.next.apply(this, arguments).then(scrollToTop);
        },
        page: function() {
            return PageNumbersView.prototype.page.apply(this, arguments).then(scrollToTop);
        }
    });

    var PageSortView = PagingBaseView.extend({
        templateName: 'modules/common/page-sort',
        updateSortBy: function(e) {
            return this.model.sortBy($(e.currentTarget).val());
        }
    });

    return {
        PagingControls: PagingControlsView,
        PageNumbers: PageNumbersView,
        TopScrollingPageNumbers: TopScrollingPageNumbersView,
        PageSortView: PageSortView
    };

});