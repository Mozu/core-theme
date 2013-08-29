using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCs = Mozu.CommerceRuntime.Contracts.Shipping;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        [HttpGetRoute(UriTemplate = "shipping/runtimemethods")]
        public async Task<Response<List<DCs.ShippingRate>>> GetRuntimeShipmentMethods([FromUri]string orderId)
        {
            List<DCs.ShippingRate> rates = (await _orderWebApiClient.GetAvailableShipmentMethods(orderId)).ReadAsSync();

            return List2(rates);
        }

        // TODO: this should be more like the move arguments.
        // TODO: like CreatePackageArgs { public string OrderId; public List<OrderPackageItem> items; }
        public class CreatePackageArgs
        {
            public string OrderId { get; set; }
            public List<OrderPackageItem> Items { get; set; }

            // optional. means we are moving things out of one package into a new one.
            public string SourcePackageId { get; set; }
        }
        [HttpPostRoute(UriTemplate="shipping/package/create")]
        public async Task<Response<OrderPackage>> CreatePackage(CreatePackageArgs args)
        {
            // if there is a source package, remove the item from it first.
            if (!String.IsNullOrEmpty(args.SourcePackageId))
            {
                var source = (await _orderWebApiClient.GetPackage(args.OrderId, args.SourcePackageId)).ReadAsSync();
                foreach (var item in args.Items)
                {
                    var sourceItem = source.Items.FirstOrDefault(i => i.OrderItemId == item.OrderItemId);
                    if (sourceItem == null)
                        continue;

                    sourceItem.Quantity -= item.Quantity;
                    if (sourceItem.Quantity <= 0)
                        source.Items.Remove(sourceItem);
                }

                // if we removed the last or only item from the package, delete the package.
                if (source.Items.Count == 0)
                    await DeletePackageInternal(args.OrderId, source);
                else
                    await _orderWebApiClient.UpdatePackage(args.OrderId, args.SourcePackageId, source);
            }

            var dc = new DCs.Package {
                Items = Mapper.Map<List<DCs.PackageItem>>(args.Items)
            };
            var ret = (await _orderWebApiClient.CreatePackage(args.OrderId, dc)).ReadAsSync();

            return Single2( ret.Map<OrderPackage>() );
        }

        public class DeletePackageArgs
        {
            public string OrderId { get; set; }
            public List<string> PackageIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipping/package/delete")]
        public async Task<Response<OrderPackage>> DeletePackage(DeletePackageArgs args)
        {
            var tasks = args.PackageIds.Select(pid => _orderWebApiClient.DeletePackage(args.OrderId, pid));
            await Task.WhenAll(tasks);

            return SuccessWithTotal2<OrderPackage>(args.PackageIds.Count);
        }

        public class MovePackageItemArgs
        {
            public string OrderId { get; set; }
            public string SourcePackageId { get; set; }
            public string DestinationPackageId { get; set; }
            public List<OrderPackageItem> Items { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipping/package/moveitems")]
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

                // if we removed the last or only item from the package, delete the package.
                if (source.Items.Count == 0)
                    await DeletePackageInternal(args.OrderId, source);
                else
                    updateTasks.Add(_orderWebApiClient.UpdatePackage(args.OrderId, args.SourcePackageId, source));

                // and save the destination package.
                updateTasks.Add( _orderWebApiClient.UpdatePackage(args.OrderId, args.DestinationPackageId, dest) );
            }
            // case 2: removing item from a package
            else if (!String.IsNullOrEmpty(args.SourcePackageId) && String.IsNullOrEmpty(args.DestinationPackageId))
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
                // if we removed the last or only item from the package, delete the package.
                if (source.Items.Count == 0)
                    await DeletePackageInternal(args.OrderId, source);
                else
                    updateTasks.Add( _orderWebApiClient.UpdatePackage(args.OrderId, args.SourcePackageId, source) );
            }
            // case 3: adding item to a package
            else if (String.IsNullOrEmpty(args.SourcePackageId) && !String.IsNullOrEmpty(args.DestinationPackageId))
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

            List<OrderPackage> newPackages = new List<OrderPackage>();

            if (updateTasks.Count > 0)
            {
                await Task.WhenAll(updateTasks);
                newPackages = Mapper.Map<List<OrderPackage>>(updateTasks.Select(t => t.Result.ReadAsSync()));
            }
            return List2(newPackages);
        }

        public class MarkPackagesShippedArgs { 
            public string OrderId { get; set; }
            public List<string> PackageIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipping/package/markshipped")]
        public async Task<Response<Order>> MarkPackagesShipped(MarkPackagesShippedArgs args)
        {
            var dcOrder = (await _orderWebApiClient.PerformShipmentAction(args.OrderId, new DCs.ShipmentAction { ActionName = "Ship", PackageIds = args.PackageIds })).ReadAsSync();

            return Single2( dcOrder.Map<Order>() );
        }

        [HttpPostRoute(UriTemplate = "shipping/package/edit")]
        public async Task<Response<List<OrderPackage>>> EditPackages(List<OrderPackage> packages)
        {
            var tasks = packages.Select(p => _orderWebApiClient.UpdatePackage(p.OrderId, p.Id, Mapper.Map<DCs.Package>(p)));

            await Task.WhenAll(tasks);

            var ret = tasks.Select(t => t.Result.ReadAsSync()).ToList();

            return List2( ret.Map<List<OrderPackage>>() );
        }

        public class PrepareShipmentArgs {
            public string OrderId { get; set; }
            public List<string> PackageIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipping/package/prepareshipment")]
        public async Task<Response<List<OrderPackage>>> PrepareShipment(PrepareShipmentArgs args)
        {
            var dcPackageTasks = args.PackageIds.Select(pid => _orderWebApiClient.GetPackage(args.OrderId, pid));
            await Task.WhenAll(dcPackageTasks);
            var dcPackages = dcPackageTasks.Select(t => t.Result.ReadAsSync()).ToList();

            // ensure the packages are in a valid state
            // foreach (var packageDc in dcPackages)
            // {
            //     // do not operate on already-shipped packages
            //     if (!String.IsNullOrEmpty(packageDc.ShipmentId))
            //         continue;
            // 
            //     // hard-code a packaging type
            //     packageDc.PackagingType = "CUSTOM";
            //     
            //     // hard-code package dimensions
            //     packageDc.Measurements = new CommerceRuntime.Contracts.Commerce.PackageMeasurements { 
            //         Weight = packageDc.Measurements.Weight,
            //         Height = null,
            //         Length = null,
            //         Width = null
            //     };
            // 
            //     await _orderWebApiClient.UpdatePackage(args.OrderId, packageDc.Id, packageDc);
            // }

            var unshippedPackageIds = dcPackages.Where(p => String.IsNullOrEmpty(p.ShipmentId)).Select(p => p.Id).ToList();
            if (unshippedPackageIds.Count == 0)
                return SuccessWithTotal2<List<OrderPackage>>(0);

            var returnedPackages = (await _orderWebApiClient.CreatePackageShipments(args.OrderId, unshippedPackageIds)).ReadAsSync();
            return List2( Mapper.Map<List<OrderPackage>>(returnedPackages) );
        }

		[HttpGetRoute(UriTemplate = "shipping/package/label")]
        public async Task<HttpResponseMessage> GetPackageLabel([FromUri]string orderId, [FromUri]string packageId)
        {
            var serviceResponse = await _orderWebApiClient.GetPackageLabel(orderId, packageId);

            // var contentStream = await response; // .ReadAsAsync();
            var httpContent = serviceResponse.ResponseMessage.Content;
     
            var contentStream = await httpContent.ReadAsStreamAsync();
            var myResponse = new HttpResponseMessage(HttpStatusCode.OK);
            myResponse.Content = new StreamContent(contentStream);
            myResponse.Content.Headers.ContentLength = serviceResponse.ResponseMessage.Content.Headers.ContentLength;
            myResponse.Content.Headers.ContentType = serviceResponse.ResponseMessage.Content.Headers.ContentType;
            myResponse.Content.Headers.LastModified = serviceResponse.ResponseMessage.Content.Headers.LastModified;
            return myResponse;
        }

        private Task DeletePackageInternal(string orderId, DCs.Package package)
        {
            if (package.ShipmentId != null)
            {
                return
                    _orderWebApiClient.DeleteShipment(orderId, package.ShipmentId)
                    .ContinueWith(t => _orderWebApiClient.DeletePackage(orderId, package.Id))
                    .Unwrap();
            }
            else
            {
                return _orderWebApiClient.DeletePackage(orderId, package.Id);
            }
        }
    }
}
