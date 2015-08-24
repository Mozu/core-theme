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

            // optional. means we are moving things out of one pickup into a new one.
            public string SourcePickupId { get; set; }
        }
        [HttpPostRoute(UriTemplate="fulfillment/pickup/create")]
        public async Task<Response<List<OrderPickup>>> CreatePickup(CreatePickupArgs args)
        {
            // if there is a source pickup, remove the item from it first.
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

            if (createTasks.Any(t => t.Result.HasException))
            {
                throw createTasks.First(t => t.Result.HasException).Result.ReadException();
            }

            return List2( createTasks.Select(t => t.Result.ReadAsSync()).Map<List<OrderPickup>>() );
        }

        public class DeletePickupArgs
        {
            public string OrderId { get; set; }
            public List<string> PickupIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "fulfillment/pickup/delete")]
        public async Task<Response<OrderPickup>> DeletePickup(DeletePickupArgs args)
        {
            var tasks = args.PickupIds.Select(pid => _orderWebApiClient.DeletePickup(args.OrderId, pid));
            await Task.WhenAll(tasks);

            return SuccessWithTotal2<OrderPickup>(args.PickupIds.Count);
        }

        public class MovePickupItemArgs
        {
            public string OrderId { get; set; }
            public string SourcePickupId { get; set; }
            public string DestinationPickupId { get; set; }
            public List<OrderPickupItem> Items { get; set; }
        }
        [HttpPostRoute(UriTemplate = "fulfillment/pickup/moveitems")]
        public async Task<Response<List<OrderPickup>>> MovePickupItems(MovePickupItemArgs args)
        {
            var updateTasks = new List<Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<DCs.Pickup>>>();

            // case 1: moving from 1 pickup to another
            if (!String.IsNullOrEmpty(args.SourcePickupId) && !String.IsNullOrEmpty(args.DestinationPickupId))
            {
                DCs.Pickup source;
                DCs.Pickup dest;

                var getPickupTasks = new Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<DCs.Pickup>>[] {
                    _orderWebApiClient.GetPickup(args.OrderId, args.SourcePickupId),
                    _orderWebApiClient.GetPickup(args.OrderId, args.DestinationPickupId)
                };

                await Task.WhenAll(getPickupTasks);
                source = getPickupTasks[0].Result.ReadAsSync();
                dest = getPickupTasks[1].Result.ReadAsSync();

                foreach (var argItem in args.Items)
                {
                    var sourcePickupItem = source.Items.First(i => i.ProductCode == argItem.ProductCode);
                    if (sourcePickupItem.Quantity == argItem.Quantity)
                    {
                        source.Items.Remove(sourcePickupItem);
                    }
                    else
                    {
                        sourcePickupItem.Quantity -= argItem.Quantity;
                    }

                    var destPickupItem = dest.Items.FirstOrDefault(i => i.ProductCode == argItem.ProductCode);
                    if (destPickupItem == null)
                    {
                        destPickupItem = new DCs.PickupItem { ProductCode = argItem.ProductCode, Quantity = 0 };
                        dest.Items.Add(destPickupItem);
                    }
                    destPickupItem.Quantity += argItem.Quantity;
                }

                // if we removed the last or only item from the pickup, delete the pickup.

                Task removeTask;
                if (source.Items.Count == 0)
                {
                    removeTask = _orderWebApiClient.DeletePickup(args.OrderId, source.Id);
                }
                else
                {
                    removeTask = _orderWebApiClient.UpdatePickup(args.OrderId, args.SourcePickupId, source);
                }

                // and save the destination pickup.
                updateTasks.Add(
                    removeTask.ContinueWith<Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<DCs.Pickup>>>(t =>
                    {
                        return _orderWebApiClient.UpdatePickup(args.OrderId, args.DestinationPickupId, dest);
                    }).Unwrap()
                );
            }
            // case 2: removing item from a pickup
            else if (!String.IsNullOrEmpty(args.SourcePickupId) && String.IsNullOrEmpty(args.DestinationPickupId))
            {
                var source = (await _orderWebApiClient.GetPickup(args.OrderId, args.SourcePickupId)).ReadAsSync();

                foreach (var argItem in args.Items)
                {
                    var sourcePickupItem = source.Items.First(i => i.ProductCode == argItem.ProductCode);
                    if (sourcePickupItem.Quantity == argItem.Quantity)
                    {
                        source.Items.Remove(sourcePickupItem);
                    }
                    else
                    {
                        sourcePickupItem.Quantity -= argItem.Quantity;
                    }
                }
                // if we removed the last or only item from the pickup, delete the pickup.
                if (source.Items.Count == 0)
                {
                    await _orderWebApiClient.DeletePickup(args.OrderId, source.Id);
                }
                else
                {
                    updateTasks.Add(_orderWebApiClient.UpdatePickup(args.OrderId, args.SourcePickupId, source));
                }
            }
            // case 3: adding item to a pickup
            else if (String.IsNullOrEmpty(args.SourcePickupId) && !String.IsNullOrEmpty(args.DestinationPickupId))
            {
                var dest = (await _orderWebApiClient.GetPickup(args.OrderId, args.DestinationPickupId)).ReadAsSync();

                foreach (var argItem in args.Items)
                {
                    var destPickupItem = dest.Items.FirstOrDefault(i => i.ProductCode == argItem.ProductCode);
                    if (destPickupItem == null)
                    {
                        destPickupItem = new DCs.PickupItem { ProductCode = argItem.ProductCode, Quantity = 0 };
                        dest.Items.Add(destPickupItem);
                    }
                    destPickupItem.Quantity += argItem.Quantity;
                }
                updateTasks.Add(_orderWebApiClient.UpdatePickup(args.OrderId, args.DestinationPickupId, dest));
            }
            else
            {
                throw new ArgumentException("SourcePickupId and DestinationPickupId cannot both be empty.");
            }

            List<OrderPickup> newPickups = new List<OrderPickup>();

            if (updateTasks.Count > 0)
            {
                await Task.WhenAll(updateTasks);
                newPickups = Mapper.Map<List<OrderPickup>>(updateTasks.Select(t => t.Result.ReadAsSync()));
            }
            return List2(newPickups);
        }

        public class MarkPickupsFulfilledArgs
        {
            public string OrderId { get; set; }
            public List<string> PickupIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "fulfillment/pickup/markfulfilled")]
        public async Task<Response<Order>> MarkPickupsFulfilled(MarkPickupsFulfilledArgs args)
        {
            var dcOrder = (await _orderWebApiClient.PerformFulfillmentAction(args.OrderId, new DCs.FulfillmentAction() { ActionName = DCs.FulfillmentAction.FulfillmentActionNameConst.PICK_UP, PickupIds = args.PickupIds, PackageIds = new List<string>() })).ReadAsSync();

            return Single2(dcOrder.Map<Order>());
        }
    }
}
