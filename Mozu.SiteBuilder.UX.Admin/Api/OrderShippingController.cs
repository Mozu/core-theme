using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCs = Mozu.CommerceRuntime.Contracts.Shipping;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        [WebInvoke(Method="POST", UriTemplate="shipping/createpackage")]
        public async Task<Response<List<OrderPackage>>> CreatePackage(OrderPackage package)
        {
            var dc = Mapper.Map<DCs.Package>(package);
            var ret = (await _orderWebApiClient.CreatePackage(package.OrderId, dc)).ReadAsSync();

            return List2( Mapper.Map<OrderPackage>(ret) );
        }

        public Task<Response<List<Order>>> EditPackage(OrderPackage package)
        {
            throw new NotImplementedException();
        }
    }
}
