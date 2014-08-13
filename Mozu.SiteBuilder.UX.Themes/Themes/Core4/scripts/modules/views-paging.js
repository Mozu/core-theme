/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
define(['modules/jquery-mozu','shim!vendor/underscore>_','modules/backbone-mozu'], function($, _, Backbone) {

    var pagingHelpers = ['firstIndex', 'lastIndex', 'middlePageNumbers', 'hasPreviousPage', 'hasNextPage', 'currentPage'];

    var PagingBaseView = Backbone.MozuView.extend({
        initialize: function() {
            if (!this.model._isPaged) {
                throw "Cannot bind a Paging view to a model that does not have the Paging mixin!";
            }
        },
        render: function () {
            var model = this.model.toJSON({ helpers: true }),
                me = this;
            _.each(pagingHelpers, function (helperName) {
                model[helperName] = me.model[helperName]();
            });
            this.undelegateEvents();
            this.$el.html(this.template.render({ model: model }));
            this.delegateEvents();
        }
    });

    var PagingControlsView = PagingBaseView.extend({
        templateName: 'modules/common/paging-controls',
        autoUpdate: ['pageSize'],
        updatePageSize: function (e) {
            var newSize = parseInt($(e.currentTarget).val()),
            currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) this.model.set('pageSize', newSize);
        }
    });

    var PageNumbersView = PagingBaseView.extend({
        templateName: 'modules/common/page-numbers',
        previous: function (e) {
            e.preventDefault();
            return this.model.previousPage();
        },
        next: function (e) {
            e.preventDefault();
            return this.model.nextPage();
        },
        page: function (e) {
            e.preventDefault();
            return this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num')) || 1);
        }
    });

    return {
        PagingControls: PagingControlsView,
        PageNumbers: PageNumbersView
    };

});