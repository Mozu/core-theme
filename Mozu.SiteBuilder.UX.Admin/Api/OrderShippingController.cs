using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        [WebInvoke(Method="POST", UriTemplate="shipping/createpackage")]
        public async Task<Response<List<Order>>> CreatePackage(string orderId, OrderPackage package)
        {
            throw new NotImplementedException();
        }

        public Task<Response<List<Order>>> EditPackage(string orderId, OrderPackage package)
        {
            throw new NotImplementedException();
        }
    }
}
