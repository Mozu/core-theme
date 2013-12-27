using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class CreatePickupArgs
        {
            public string OrderId { get; set; }
            public List<OrderPickupItem> Items { get; set; }

            // optional. means we are moving things out of one package into a new one.
            public string SourcePickupId { get; set; }
        }
        [HttpPostRoute(UriTemplate="fulfillment/pickup/create")]
        public async Task<Response<List<OrderPickup>>> CreatePickup(CreatePickupArgs args)
        {
            // if there is a source package, remove the item from it first.
            if (!String.IsNullOrEmpty(args.SourcePickupId))
            {
                var source = (await _orderWebApiClient.GetPickup(args.OrderId, args.SourcePickupId)).ReadAsSync();
                foreach (var item in args.Items)
                {
                    var sourceItem = source.Items.FirstOrDefault(i => i.ProductCode == item.ProductCode);
                    if (sourceItem == null)
                        continue;

                    sourceItem.Quantity -= item.Quantity;
                    if (sourceItem.Quantity <= 0)
                        source.Items.Remove(sourceItem);
                }

                // if we removed the last or only item from the pickup, delete the pickup.
                if (source.Items.Count == 0)
                    await _orderWebApiClient.DeletePickup(args.OrderId, args.SourcePickupId);
                else
                    await _orderWebApiClient.UpdatePickup(args.OrderId, args.SourcePickupId, source);
            }

            var createTasks = args.Items.GroupBy(i => i.FulfillmentLocationCode).Select(g => {
                var dc = new DCs.Pickup {
                    Items = g.ToList().Map<List<DCs.PickupItem>>(),
                    FulfillmentLocationCode = g.Key
                };
                return _orderWebApiClient.CreatePickup(args.OrderId, dc);
            }).ToList();
            await Task.WhenAll(createTasks);

            return List2( createTasks.Select(t => t.Result.ReadAsSync()).Map<List<OrderPickup>>() );
        }

        public class DeletePickupArgs
        {
            public string OrderId { get; set; }
            public List<string> PackageIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "fulfillment/pickup/delete")]
        public async Task<Response<OrderPickup>> DeletePickup(DeletePackageArgs args)
        {
            var tasks = args.PackageIds.Select(pid => _orderWebApiClient.DeletePackage(args.OrderId, pid));
            await Task.WhenAll(tasks);

            return SuccessWithTotal2<OrderPickup>(args.PackageIds.Count);
        }
    }
}
