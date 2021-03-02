
define(["jquery", "underscore"], function ($, _) {

    $.fn.mozuPaginatedSearchableGrid = function (options) {
        var self = this;
        var timeout = null;
        var pageIndex = 0;
        var lastPageIndex = 0;
        var filteredVal = false;
        var debounceDelay = 400;
        var KEY_UP = 38;
        var KEY_DOWN = 40;
        var KEY_ENTER = 13;
        var specialCharactersObj = {
            "^": "^^",
            "'": "^'",
            "\"": "^\"",
            "[": "^[",
            "]": "^]",
            " ": "^ ",
            "(": "^(",
            ")": "^)"
        };
        var dataSet = new options.model({ pageSize: options.pageSize, filter: 'isActive eq true', sortBy: options.textField + ' ' + 'asc' });
        dataSet.apiGet().then(function (accounts) {
            lastPageIndex = accounts.data.pageCount;
            var divElm = "";
            _.each(accounts, function (data) {
                 divElm += '<a class="mozu-dropdown" data-mz-value="' + data.data[options.valueField] + '" tabindex="-1" href="javascript:void(0)">' + data.data[options.textField] + '</a>';
            });
            $(self.selector).append('<div tabindex="-1" class="' + options.pageSelector + '-mz-listData mz-data-list">' + divElm + '</div>');
            $('<div class="' + options.pageSelector + '-mz-pagination-url mz-pagination-url"><a class="firstPage" data-page-val="0" href="javascript:void(0)"><<</a> <a class="prevPage" href="javascript:void(0)"><</a>  <span class="displayPageCount"> <span clss="count_val">' + (accounts.data.startIndex + 1) + '</span> of ' + lastPageIndex + ' </span> <a class="nextPage" data-pagination="0" href="javascript:void(0)">></a> <a class="lastPage" href="javascript:void(0)">>></a><div class="mz-dd-loading"></div></div>').appendTo(self.selector);

            $(document).on('click', '.mz-dd-arrow', function () {
                $(this).prev('input').focus();
            });

            // API call for pagination click
            function paginationLoad(pageNumber) {
                $('.' + options.pageSelector + '-mz-pagination-url > .mz-dd-loading').show();
                var inputValue = $('.' + options.pageSelector + '-mz-dd-search').val().replace(/'/g, "^'");
                var dataSet = new options.model({ startIndex: options.pageSize * pageNumber, pageSize: options.pageSize, filter: 'isActive eq true', sortBy: options.textField + ' ' + 'asc' });
                if (filteredVal) {
                    dataSet = new options.model({ startIndex: options.pageSize * pageNumber, pageSize: options.pageSize, filter: options.textField + ' ' + options.filterOption + ' "' + inputValue + '"', sortBy: options.textField + ' ' + 'asc' });
                }
                dataSet.apiGet().then(function (accounts) {
                    $('.' + options.pageSelector + '-mz-listData').text('');
                    _.each(accounts, function (data) {
                        if (!_.isUndefined(data.data[options.textField])) {
                            $('.' + options.pageSelector +'-mz-listData').append('<a class="mozu-dropdown" data-mz-value="' + data.data[options.valueField] + '" tabindex="-1" href="javascript:void(0)">' + data.data[options.textField] + '</a>');
                        }
                    });
                    $('.' + options.pageSelector + '-mz-pagination-url > .mz-dd-loading').hide();
                });
            }

            $(document).on('click', '.' + options.pageSelector + '-mz-pagination-url > .lastPage', function (evt) {
                evt.stopImmediatePropagation();
                paginationLoad(lastPageIndex - 1);
                $('.' + options.pageSelector + '-mz-pagination-url > .displayPageCount').text((lastPageIndex + ' of ' + lastPageIndex));
                pageIndex = lastPageIndex - 1;
                $('.' + options.pageSelector + '-mz-listData').scrollTop(0);
            });

            $(document).on('click', '.' + options.pageSelector + '-mz-pagination-url > .firstPage', function (evt) {
                evt.stopImmediatePropagation();
                paginationLoad(0);
                pageIndex = 0;
                $('.' + options.pageSelector + '-mz-pagination-url > .displayPageCount').text((pageIndex + 1 + ' of ' + lastPageIndex));
                $('.' + options.pageSelector + '-mz-listData').scrollTop(0);
            });

            $(document).on('click', '.' + options.pageSelector + '-mz-pagination-url > .prevPage', function (evt) {
                evt.stopImmediatePropagation();
                if (pageIndex >= 1) {
                    $('.' + options.pageSelector + '-mz-pagination-url > .displayPageCount').text((pageIndex + ' of ' + lastPageIndex));
                    pageIndex--;
                    paginationLoad(pageIndex);
                }
                $('.' + options.pageSelector + '-mz-listData').scrollTop(0);
            });

            $(document).on('click', '.' + options.pageSelector + '-mz-pagination-url > .nextPage', function (evt) {
                evt.stopImmediatePropagation();
                pageIndex++;
                if (pageIndex <= lastPageIndex - 1) {
                    paginationLoad(pageIndex);
                    $('.' + options.pageSelector + '-mz-pagination-url > .displayPageCount').text((pageIndex + 1 + ' of ' + lastPageIndex));
                }
                $('.' + options.pageSelector + '-mz-listData').scrollTop(0);
            });

            $('<input class="' + options.pageSelector + '-mz-dd-search mz-dd-search" type="text" placeholder="' + options.placeHolder + '" /><a class="mz-dd-arrow" href="javascript:void(0)">&#x2B9F</a>').prependTo(self.selector);
            $(self.selector).wrapAll("<div class='mz-dd-block' />");
            $('.' + options.pageSelector + '-mz-pagination-url').wrapAll("<div class='" + options.pageSelector + "-pagination_btn pagination_btn'></div>");
            $('.' + options.pageSelector + '-pagination_btn, '+'.' + options.pageSelector + '-mz-listData').wrapAll("<div class='mz-dropdown-data'></div>");

            $(document).on("click", '.' + options.pageSelector + '-mz-listData > a', function () {
                $(self.selector + '> .' + options.pageSelector +'-mz-dd-search').val('');
                $(self.selector + '> .' + options.pageSelector +'-mz-dd-search').val($(this).text());
                $('.' + options.pageSelector + '- > a').removeClass("mz-dd-active");
                $(this).addClass("mz-dd-active");
                $('.mz-dropdown-data').hide();
                $(self.selector + '> .' + options.pageSelector +'-mz-dd-search').attr('data-mz-value', $(this).data('mz-value'));
                filteredVal = false;
            });

            $(document).on('click focus', '.' + options.pageSelector +'-mz-dd-search', function () {
                $(self.selector + '> .mz-dropdown-data').show();
            });

            // API call for dropdown search
            $(self.selector + '> .' + options.pageSelector +'-mz-dd-search').keyup(function (e) {
                filteredVal = true;
                $('.pagination_btn').show();
                $(self.selector + '> .' + options.pageSelector +'-mz-dd-search').removeAttr("data-mz-value");
                if (e.which !== KEY_DOWN && e.which !== KEY_UP) {
                    var inputValue = $(self.selector + '> .' + options.pageSelector + '-mz-dd-search').val();
                    inputValue = inputValue.replace(/['^(")}{ ]/g, function (m) {
                        return specialCharactersObj[m];
                    });
                    $('.' + options.pageSelector +'> .mz-dropdown-data').show();
                    clearTimeout(timeout);
                    var dataSet = new options.model({ filter: options.textField + " " + options.filterOption + " " + inputValue + "", pageSize: options.pageSize });
                    if (inputValue === "") {
                        dataSet = new options.model({ pageSize: options.pageSize, sortBy: options.textField + ' ' + 'asc', filter: 'isActive eq true' });
                        filteredVal = false;
                    }
                    $('.' + options.pageSelector + '-mz-listData').scrollTop(0);
                    timeout = setTimeout(function () {
                        $('.' + options.pageSelector + '-mz-pagination-url > .mz-dd-loading').show();
                        dataSet.apiGet().then(function (accounts) {
                            $('.'+ options.pageSelector + '-mz-listData').text('');
                            _.each(accounts, function (data) {
                                if (!_.isUndefined(data.data[options.textField])) {
                                    $('.' + options.pageSelector + '-mz-listData').append('<a class="mozu-dropdown" data-mz-value="' + data.data[options.valueField] + '" tabindex="-1" href="javascript:void(0)">' + data.data[options.textField] + '</a>');
                                }
                            });
                            lastPageIndex = accounts.data.pageCount;
                            pageIndex = 0;
                            $('.' + options.pageSelector +'-mz-pagination-url >  .displayPageCount').text((accounts.data.startIndex + 1) + ' of ' + accounts.data.pageCount);
                            if (lastPageIndex === 0) {
                                $('.'+ options.pageSelector + '-mz-listData').html('<div style="text-align: center">'+ options.noRecords + '</div>');
                                $('.pagination_btn').hide();
                            }
                            $('.' + options.pageSelector + '-mz-pagination-url > .mz-dd-loading').hide();
                        });
                    }, debounceDelay);
                } else {
                    $('.' + options.pageSelector + '-mz-listData > a').eq(0).focus().addClass('mz-dd-focus');
                    filteredVal = false;
                }
            });

            $(document).on('keyup', '.' + options.pageSelector + '-mz-listData', function (e) {
                e.stopImmediatePropagation();
                // key code 40 is for DOWN arrow key
                if (e.keyCode === KEY_DOWN) {
                    $("a.mozu-dropdown:focus").next().addClass('mz-dd-focus').focus().siblings().removeClass('mz-dd-focus');
                }
                // key code 38 is for UP arrow key
                if (e.keyCode === KEY_UP) {
                    $("a.mozu-dropdown:focus").prev().addClass('mz-dd-focus').focus().siblings().removeClass('mz-dd-focus');
                }
                // key code 13 is for ENTER key
                if (e.keyCode === KEY_ENTER) {
                    $(this > 'a.mozu-dropdown').click();
                }
            }
            );

            $(document).mouseup(function (e) {
                var container = $(".mz-dropdown-data");
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    container.hide();
                }
            });

        });
    };

});
