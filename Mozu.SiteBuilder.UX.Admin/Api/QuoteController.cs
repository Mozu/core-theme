using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.Core.EnsureThat;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.CommerceRuntime.Contracts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Extensions;
using DC = Mozu.CommerceRuntime.Contracts.Quotes;
using DCOrderItem = Mozu.CommerceRuntime.Contracts.Orders.OrderItem;
using Mozu.SiteBuilder.UX.Admin.Helpers.QuoteHelpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/quote", SuppressDescriptorGeneration = true)]
    public class QuoteController : BaseController
    {
        private readonly IQuoteWebApiClient _quoteWebApiClient;

        public QuoteController(IQuoteWebApiClient quoteWebApiClient)
        {
            _quoteWebApiClient = quoteWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.QuoteCollection quotes;
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var quote = (await _quoteWebApiClient.GetQuote(pagingParams.id)).ReadAsSync();

                if (quote == null) throw new HttpResponseException(HttpStatusCode.NotFound);

                quotes = new DC.QuoteCollection { Items = new List<DC.Quote> { quote }, TotalCount = 1 };
            }
            else
            {

                string filter = extFilter.ToFilterString();
                string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;
                quotes = (await _quoteWebApiClient.GetQuotes(startIndex: pagingParams.startIndex,
                    pageSize: pagingParams.pageSize,
                    sortBy: sort,
                    filter: filter
                    )).ReadAsSync();
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(quotes.Items, (int)quotes.TotalCount));
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<HttpResponseMessage> Create(DC.Quote quote)
        {
            var quoteCreateResponse = (await _quoteWebApiClient.CreateQuote(quote)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(quoteCreateResponse));
        }


        [HttpPostRoute(UriTemplate = "update")]
        public async Task<HttpResponseMessage> Edit(DC.Quote quote)
        {
            if (quote.Id.IsNullOrEmpty())
            {
                throw new ArgumentException("Quote Id required");
            }

            var quoteUpdateResponse = (await _quoteWebApiClient.UpdateQuote(quote.Id, quote)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(quoteUpdateResponse));
        }

        [HttpGetRoute(UriTemplate = "{quoteId}")]
        public async Task<Response<DC.Quote>> GetWishlist([FromUri]string quoteId)
        {
            var quoteGetResponse = (await _quoteWebApiClient.GetQuote(quoteId)).ReadAsSync();
            return Single2(quoteGetResponse);
        }

        [HttpDeleteRoute(UriTemplate = "{quoteId}")]
        public async Task<Response<DC.Quote>> DeleteQuote([FromUri]string quoteId)
        {
            var quoteDeleteResponse = (await _quoteWebApiClient.DeleteQuote(quoteId)).ReadAsSync();
            return Message3<DC.Quote>(true, "Quote Successfully Deleted");
        }


        [HttpGetRoute(UriTemplate = "{quoteId}/items")]
        public async Task<HttpResponseMessage> QuoteItems([FromUri]string quoteId, [FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.QuoteItemCollection quoteItems;
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var quoteItem = (await _quoteWebApiClient.GetQuoteItem(quoteId, pagingParams.id)).ReadAsSync();
                quoteItems = new DC.QuoteItemCollection();
                quoteItems.Items.Add(quoteItem);
                quoteItems.TotalCount = 1;
            }
            else
            {
                string filter = extFilter.ToFilterString();
                string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;
                quoteItems = (await _quoteWebApiClient.GetQuoteItems(quoteId, startIndex: pagingParams.startIndex,
                    pageSize: pagingParams.pageSize,
                    sortBy: sort,
                    filter: filter
                )).ReadAsSync();
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(quoteItems.Items, (int)quoteItems.TotalCount));
        }

        [HttpGetRoute(UriTemplate = "{quoteId}/items/{quoteItemId}")]
        public async Task<Response<DCOrderItem>> GetQuoteItemWishlist([FromUri]string quoteId, [FromUri]string quoteItemId)
        {
            var quoteItemGetResponse = (await _quoteWebApiClient.GetQuoteItem(quoteId, quoteItemId)).ReadAsSync();
            return Single2(quoteItemGetResponse);
        }

        [HttpDeleteRoute(UriTemplate = "{quoteId}/items/{quoteItemId}")]
        public async Task<Response<DC.Quote>> DeleteQuoteItem([FromUri]string quoteId, [FromUri]string quoteItemId)
        {
            var quoteItemDeleteResponse = (await _quoteWebApiClient.DeleteQuoteItem(quoteId, quoteItemId)).ReadAsSync();
            return Message3<DC.Quote>(true, "QuoteItem Successfully Deleted");
        }
    }
}