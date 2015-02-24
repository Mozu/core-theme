using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    public partial class OrderController
    {
        [HttpGetRoute(UriTemplate = "changemessages")]
        public async Task<Response<List<ChangeMessage>>> ChangeMessages(OrderIdArgs args, [FromUri]PagingParamaters pagingParams, [FromUri]SortingCollectionItem sortingParam, [FromUri]FilterCollection extFilter)
        {
            var changeMessages = (await _orderWebApiClient.GetChangeMessages(args.OrderId, pagingParams.pageIndex, pagingParams.pageSize, sortingParam.direction, extFilter.query)).ReadAsSync();

            return List2(changeMessages.Items);
        }
    }
}