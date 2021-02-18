
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
        var dataSet = new options.model({ pageSize: options.pageSize });        
        dataSet.apiGet().then(function (accounts) {            
            lastPageIndex = accounts.data.pageCount;
            var divElm = "";
            _.each(accounts, function (data, i) {
                if (!_.isUndefined(data.data[options.textField])) {
                    divElm += '<a class="mozu-dropdown" data-mz-value="' + data.data[options.valueField] + '" tabindex="-1" href="javascript:void(0)">' + data.data[options.textField] + '</a>'; 
                }     
            });
            $(self.selector).append('<div tabindex="-1" class="mz-listData">' + divElm + '</div>');
            $('<div class="mz-pagination-url"><a class="firstPage" data-page-val="0" href="javascript:void(0)"><<</a> <a class="prevPage" href="javascript:void(0)"><</a>  <span class="displayPageCount"> <span clss="count_val">' + (accounts.data.startIndex + 1) + '</span> of ' + lastPageIndex + ' </span> <a class="nextPage" data-pagination="0" href="javascript:void(0)">></a> <a class="lastPage" href="javascript:void(0)">>></a><div class="mz-dd-loading"></div></div>').appendTo(self.selector);     

            $(document).on('click', '.mz-dd-open', function () {
                $('.mz-dropdown-data').hide();
                $(this).removeClass('mz-dd-open').addClass('mz-dd-close');
            });

            $(document).on('click', '.mz-dd-close', function () {
                $('.mz-dropdown-data').show();
                $(this).removeClass('mz-dd-close').addClass('mz-dd-open');
            });

            // API call for pagination click
            function paginationLoad(pageNumber) {
                $('.mz-dd-loading').show();
                var inputValue = $('.mz-dd-search').val();
                var dataSet = new options.model({ startIndex: options.pageSize * pageNumber, pageSize: options.pageSize, isActive: true });
                if (filteredVal) {
                    dataSet = new options.model({ startIndex: options.pageSize * pageNumber, pageSize: options.pageSize, filter: options.textField + ' ' + options.filterOption + ' "' + inputValue + '"', isActive: true });
                }
                dataSet.apiGet().then(function (accounts) {   
                    $('.mz-listData').text('');
                    _.each(accounts, function (data) {
                        if (!_.isUndefined(data.data[options.textField])) {
                            $('.mz-listData').append('<a class="mozu-dropdown" data-mz-value="' + data.data[options.valueField] + '" tabindex="-1" href="javascript:void(0)">' + data.data[options.textField] + '</a>');
                        }
                    });
                    $('.mz-dd-loading').hide();
                });
            }

            $(document).on('click', '.lastPage', function (evt) {
                evt.stopImmediatePropagation();
                paginationLoad(lastPageIndex - 1);
                $('.displayPageCount').text((lastPageIndex + ' of ' + lastPageIndex));
                pageIndex = lastPageIndex - 1; 
            });

            $(document).on('click', '.firstPage', function (evt) {
                evt.stopImmediatePropagation();
                paginationLoad(0);
                pageIndex = 0;
                $('.displayPageCount').text((pageIndex+1 + ' of ' + lastPageIndex));
            });

            $(document).on('click', '.prevPage', function (evt) {
                evt.stopImmediatePropagation();
                if (pageIndex >= 1) {
                    $('.displayPageCount').text((pageIndex + ' of ' + lastPageIndex));
                    pageIndex--;
                    paginationLoad(pageIndex);
                }
                            
                
            });

            $(document).on('click', '.nextPage', function (evt) {
                evt.stopImmediatePropagation();
                pageIndex++;
                if (pageIndex <= lastPageIndex-1) {
                    paginationLoad(pageIndex);
                    $('.displayPageCount').text((pageIndex + 1 + ' of ' + lastPageIndex));
                }     
            });

            $('<input class="mz-dd-search" type="text" placeholder="' + options.placeHolder + '" /><a class="mz-dd-open" href="javascript:void(0)">&#x2B9F</a>').prependTo(self.selector);
            $(self.selector).wrapAll("<div class='mz-dd-block' />");
            $('.mz-pagination-url').wrapAll("<div class='pagination_btn'></div>");
            $('.pagination_btn, .mz-listData').wrapAll("<div class='mz-dropdown-data'></div>");
            
            $(document).on("click", '.mz-listData > a', function () {
                $(self.selector + '> .mz-dd-search').val('');
                $(self.selector + '> .mz-dd-search').val($(this).text());
                $('.mz-listData > a').removeClass("mz-dd-active");
                $(this).addClass("mz-dd-active");
                $('.mz-dropdown-data').hide();
                $(self.selector + '> .mz-dd-search').attr('data-mz-value', $(this).data('mz-value'));
                filteredVal = false;                
            });
                    
            $(document).on('click focus', '.mz-dd-search', function () {
                $('.mz-dropdown-data').show();
            });

            // API call for dropdown search
            $(self.selector + '> .mz-dd-search').keyup(function (e) {
                filteredVal = true;
                $(self.selector + '> .mz-dd-search').removeAttr("data-mz-value"); 
                if (e.which !== KEY_DOWN && e.which !== KEY_UP) {
                    var inputValue = $(self.selector + '> .mz-dd-search').val();
                    $('.mz-dropdown-data').show();
                    clearTimeout(timeout);
                    var dataSet = new options.model({ filter: options.textField + " " + options.filterOption + " '" + inputValue + "'", isActive: true });
                    if (inputValue === "") {
                        dataSet = new options.model({ pageSize: options.pageSize });
                        filteredVal = false;
                    }

                    timeout = setTimeout(function () {
                        $('.mz-dd-loading').show();
                        dataSet.apiGet().then(function (accounts) {
                            $('.mz-listData').text('');
                            _.each(accounts, function (data) {
                                if (!_.isUndefined(data.data[options.textField])) {
                                    $('.mz-listData').append('<a class="mozu-dropdown" data-mz-value="' + data.data[options.valueField] + '" tabindex="-1" href="javascript:void(0)">' + data.data[options.textField] + '</a>');
                                }
                            });
                            lastPageIndex = accounts.data.pageCount;
                            pageIndex = 0;
                            $('.displayPageCount').text((accounts.data.startIndex + 1) + ' of ' + accounts.data.pageCount);
                            if (lastPageIndex === 0) {
                                $('.displayPageCount').text(options.noRecords);
                            }
                            $('.mz-dd-loading').hide();
                        });
                    }, debounceDelay);
                } else {
                    $('.mz-listData > a').eq(0).focus().addClass('mz-dd-focus');
                    filteredVal = false;
                }
            });

            $(document).on('keyup', '.mz-listData', function (e) {
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
