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
        [WebInvoke(Method="POST", UriTemplate="shipping/package/create")]
        public async Task<Response<List<OrderPackage>>> CreatePackage(OrderPackage package)
        {
            var dc = Mapper.Map<DCs.Package>(package);
            var ret = (await _orderWebApiClient.CreatePackage(package.OrderId, dc)).ReadAsSync();

            return List2( Mapper.Map<OrderPackage>(ret) );
        }

        public class DeletePackageArgs
        {
            public string OrderId { get; set; }
            public List<string> PackageIds { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "shipping/package/delete")]
        public async Task<Response<List<OrderPackage>>> DeletePackage(DeletePackageArgs args)
        {
            var tasks = args.PackageIds.Select(pid => _orderWebApiClient.DeletePackage(args.OrderId, pid));
            await Task.WhenAll(tasks);

            return SuccessWithTotal2<List<OrderPackage>>(args.PackageIds.Count);
        }

        public class MovePackageItemArgs
        {
            public string OrderId { get; set; }
            public string SourcePackageId { get; set; }
            public string DestinationPackageId { get; set; }
            public List<OrderPackageItem> Items { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "shipping/package/moveitems")]
        public async Task<Response<List<OrderPackage>>> MovePackageItems(MovePackageItemArgs args)
        {
            var updateTasks = new List<Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<DCs.Package>>>();

            // case 1: moving from 1 package to another
            if (!String.IsNullOrEmpty(args.SourcePackageId) && !String.IsNullOrEmpty(args.DestinationPackageId))
            {
                DCs.Package source;
                DCs.Package dest;

                var getPackageTasks = new Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<DCs.Package>> [] {
                    _orderWebApiClient.GetPackage(args.OrderId, args.SourcePackageId),
                    _orderWebApiClient.GetPackage(args.OrderId, args.DestinationPackageId)
                };

                await Task.WhenAll(getPackageTasks);
                source = getPackageTasks[0].Result.ReadAsSync();
                dest = getPackageTasks[1].Result.ReadAsSync();

                foreach (var argItem in args.Items)
                {
                    var sourcePackageItem = source.Items.First(i => i.OrderItemId == argItem.OrderItemId);
                    if (sourcePackageItem.Quantity == argItem.Quantity)
                    {
                        source.Items.Remove(sourcePackageItem);
                    }
                    else
                    {
                        sourcePackageItem.Quantity -= argItem.Quantity;
                    }

                    var destPackageItem = dest.Items.FirstOrDefault(i => i.OrderItemId == argItem.OrderItemId);
                    if (destPackageItem == null)
                    {
                        destPackageItem = new DCs.PackageItem { OrderItemId = argItem.OrderItemId, Quantity = 0 };
                        dest.Items.Add(destPackageItem);
                    }
                    destPackageItem.Quantity += argItem.Quantity;
                }

                updateTasks.AddRange(new [] {
                    _orderWebApiClient.UpdatePackage(args.OrderId, args.SourcePackageId, source),
                    _orderWebApiClient.UpdatePackage(args.OrderId, args.DestinationPackageId, dest)
                });
            }
            // case 2: removing item from a package
            if (!String.IsNullOrEmpty(args.SourcePackageId) && String.IsNullOrEmpty(args.DestinationPackageId))
            {
                var source = (await _orderWebApiClient.GetPackage(args.OrderId, args.SourcePackageId)).ReadAsSync();

                foreach (var argItem in args.Items)
                {
                    var sourcePackageItem = source.Items.First(i => i.OrderItemId == argItem.OrderItemId);
                    if (sourcePackageItem.Quantity == argItem.Quantity)
                    {
                        source.Items.Remove(sourcePackageItem);
                    }
                    else
                    {
                        sourcePackageItem.Quantity -= argItem.Quantity;
                    }
                }
                updateTasks.Add( _orderWebApiClient.UpdatePackage(args.OrderId, args.SourcePackageId, source) );
            }
            // case 3: adding item to a package
            if (String.IsNullOrEmpty(args.SourcePackageId) && !String.IsNullOrEmpty(args.DestinationPackageId))
            {
                var dest = (await _orderWebApiClient.GetPackage(args.OrderId, args.DestinationPackageId)).ReadAsSync();

                foreach (var argItem in args.Items)
                {
                    var destPackageItem = dest.Items.FirstOrDefault(i => i.OrderItemId == argItem.OrderItemId);
                    if (destPackageItem == null)
                    {
                        destPackageItem = new DCs.PackageItem { OrderItemId = argItem.OrderItemId, Quantity = 0 };
                        dest.Items.Add(destPackageItem);
                    }
                    destPackageItem.Quantity += argItem.Quantity;
                }
                updateTasks.Add( _orderWebApiClient.UpdatePackage(args.OrderId, args.DestinationPackageId, dest) );
            }
            else
            {
                throw new ArgumentException("SourcePackageId and DestinationPackageId cannot both be empty.");
            }

            await Task.WhenAll(updateTasks);

            var newPackages = Mapper.Map<List<OrderPackage>>( updateTasks.Select(t => t.Result.ReadAsSync()) );

            return List2(newPackages);
        }

        public class MarkPackagesShippedArgs { 
            public string OrderId { get; set; }
            public List<string> PackageIds { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "shipping/package/markshipped")]
        public async Task<Response<List<Order>>> MarkPackagesShipped(MarkPackagesShippedArgs args)
        {
            var dcOrder = (await _orderWebApiClient.PerformShipmentAction(args.OrderId, new DCs.ShipmentAction { ActionName = "Ship", PackageIds = args.PackageIds })).ReadAsSync();

            return List2(Mapper.Map<Order>(dcOrder));
        }

        [WebInvoke(Method = "POST", UriTemplate = "shipping/package/edit")]
        public async Task<Response<List<OrderPackage>>> EditPackages(List<OrderPackage> packages)
        {
            var tasks = packages.Select(p => _orderWebApiClient.UpdatePackage(p.OrderId, p.Id, Mapper.Map<DCs.Package>(p)));

            await Task.WhenAll(tasks);

            var ret = tasks.Select(t => t.Result.ReadAsSync());

            return List2( Mapper.Map<List<OrderPackage>>( ret ));
        }
    }
}
