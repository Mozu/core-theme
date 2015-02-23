using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
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
        public async Task<Response<List<OrderAuditLog>>> ChangeMessages(OrderIdArgs args)
        {
            var changeMessages = (await _orderWebApiClient.GetChangeMessages(args.OrderId)).ReadAsSync();

            return List2(Mapper.Map<List<OrderAuditLog>>(changeMessages.Items), (int)changeMessages.TotalCount);
        }
    }
}