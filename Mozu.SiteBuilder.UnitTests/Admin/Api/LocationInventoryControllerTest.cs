using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using NUnit.Framework;
using NUnit.Framework.Constraints;
using DCprod = Mozu.ProductAdmin.Contracts;
using DCloc = Mozu.Location.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api;
using NSubstitute;
using Mozu.SiteBuilder.UnitTests.Extensions;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api
{
    [TestFixture]
    public class LocationInventoryControllerTest
    {
        private static string product_code = "SOMEPROD-001";
        private static DCloc.FulfillmentType sp = FulfillmentTypeConstants.InStorePickup;
        private static DCloc.FulfillmentType ds = FulfillmentTypeConstants.DirectShip;
        private static DCloc.Location location_ship_only = new DCloc.Location { Code = "location_ship_only", FulfillmentTypes = new List<DCloc.FulfillmentType> { ds } };
        private static DCloc.Location location_pickup_only = new DCloc.Location { Code = "location_pickup_only", FulfillmentTypes = new List<DCloc.FulfillmentType> { sp } };
        private static DCloc.Location location_both = new DCloc.Location { Code = "location_both", FulfillmentTypes = new List<DCloc.FulfillmentType> { sp, ds } };
        private static UX.Admin.Api.Models.PagingParamaters empty_paging_params = new UX.Admin.Api.Models.PagingParamaters();
        private static UX.Admin.Api.Models.FilterCollection empty_filter_collection = new UX.Admin.Api.Models.FilterCollection();

        [SetUp]
        public void Setup()
        {
            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.LocationInventory, LocationWithInventory>()
                .ForMember(x => x.Location, op => op.Ignore())
                ;
        }

        [Test]
        public void When_Product_Has_One_Location_With_One_Fulfillment_Type_Should_Get_One_Entry()
        {
            var controller = CreateController(location_ship_only);
            var result = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code);
            Assert.IsNotNull(result);
        }

        //manage stock      out of stock behavior                       inv        show
        //  true            DisplayMsg, HideProduct                     0          false
        //  true            DisplayMsg, HideProduct, AllowBack         > 0         true
        //  true            AllowBackorder                              0          true
        //  false           DisplayMsg, HideProduct, AllowBack          >0         true
        //  false           DisplayMsg, HideProduct, AllowBack          0          true

        //DisplayMessage
        [TestCase("unmanaged stock, display msg, has stock", false, "DisplayMessage", 10, 10, 2)]
        [TestCase("unmanaged stock, display msg, no stock", false, "DisplayMessage", 0, 0, 2)]
        [TestCase("managed stock, display msg, has stock", true, "DisplayMessage", 10, 10, 2)]
        [TestCase("managed stock, display msg, no stock", true, "DisplayMessage", 0, 0, 0)]
        //HideProduct
        [TestCase("unmanaged stock, hide product, has stock", false, "HideProduct", 10, 10, 2)]
        [TestCase("unmanaged stock, hide product, no stock", true, "HideProduct", 0, 0, 0)]
        [TestCase("managed stock, hide product, has stock", true, "HideProduct", 10, 10, 2)]
        [TestCase("managed stock, hide product, no stock", true, "HideProduct", 0, 0, 0)]
        //AllowBackorder
        [TestCase("managed stock, allow backorder, no stock", true, "AllowBackorder", 0, 0, 2)]
        [TestCase("managed stock, allow backorder, has stock", true, "AllowBackorder", 10, 10, 2)]
        [TestCase("unmanaged stock, allow backorder, no stock", false, "AllowBackorder", 0, 0, 2)]
        [TestCase("unmanaged stock, allow backorder, has stock", false, "AllowBackorder", 10, 10, 2)]
        public void When_Location_Has_Both_DirectShip_And_Pickup_Location_Then_Should_Return_Expected_Quantity(string scenario, bool manageStock,
            string outOfStockBehavior, int stockAvailable, int stockOnHand, int expectedCount)
        {
            //arrange
            var sut = new ProductAvailableInventoryHelper();
            var inventories = CreateInventoriesWithDualLocation(stockAvailable, stockOnHand);
            var locations = new List<DCloc.Location> { location_both };
            var product = new DCprod.Product { InventoryInfo = new DCprod.ProductInventoryInfo
                {
                    ManageStock = manageStock, OutOfStockBehavior = outOfStockBehavior
                }
            };

            //act
            var actual = sut.GetShipAndPickupLocationsWithInventory(inventories, locations, product);

            //assert
            Assert.That(actual.Count, Is.EqualTo(expectedCount), scenario);
        }

        private static DCprod.LocationInventoryCollection CreateInventoriesWithDualLocation(int stockAvailable, int stockOnHand)
        {
            return new DCprod.LocationInventoryCollection
            {
                Items = new List<DCprod.LocationInventory>
                {
                    new LocationWithInventory
                    {
                        Location = location_both,  //from above
                        ProductCode = product_code,
                        ProductName = product_code,
                        LocationCode = "location_both",
                        StockAvailable = stockAvailable,
                        StockOnHand = stockOnHand
                    }
                }
            };
        }

        private LocationInventoryController CreateController(params DCloc.Location[] locations)
        {
            var locationInventoryClient = NSubstitute.Substitute.For<DCprod.Clients.ILocationInventoryWebApiClient>();
            var productWebApiClient = NSubstitute.Substitute.For<DCprod.Clients.IProductWebApiClient>();
            var locationAdminWebApiClient = NSubstitute.Substitute.For<DCloc.Clients.ILocationAdminWebApiClient>();
            var prodAvailInventoryHelper = new ProductAvailableInventoryHelper();

            var locationInventoryCollection = new DCprod.LocationInventoryCollection() {
                Items = (
                    from l in locations
                    select new DCprod.LocationInventory {
                        LocationCode = l.Code,
                        ProductCode = product_code,
                        StockAvailable = 100
                    }
                ).ToList()
            };

            productWebApiClient.GetLocationInventories(product_code)
                .Returns(locationInventoryCollection.AsServiceClientResponseAsync());

            foreach (var loc in locations)
            {
                locationAdminWebApiClient.GetLocation(loc.Code).Returns(loc.AsServiceClientResponseAsync());
            }

            return new LocationInventoryController(locationInventoryClient, productWebApiClient, locationAdminWebApiClient, prodAvailInventoryHelper);
        }
    }
}
