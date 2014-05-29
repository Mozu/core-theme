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
            // arrange
            var controller = CreateController(location_ship_only);

            // act
            var t = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code);
            List<LocationWithInventory> result = t.Result.Items;

            // assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
        }

        /// <summary>
        /// Mozu currently supports a single shipping origin for all packages on an order.
        /// The location inventory list should ONLY list the directship location configured
        /// in Site Settings as a possible DirectShip source.
        /// </summary>
        [Test]
        public void Should_Only_Display_One_Directship_Location() 
        {
            // arrange
            var controller = CreateController(location_both, location_ship_only, location_pickup_only);

            // act
            var t = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code);
            List<LocationWithInventory> result = t.Result.Items;

            // assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result.Count(lwi => lwi.Fulfillment == ds), Is.EqualTo(1), "should be exactly one directship location in this list.");
            Assert.That(result.Count(lwi => lwi.Fulfillment == sp), Is.EqualTo(2), "should be two pickup locations in this list.");
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
        [TestCase("unmanaged stock, hide product, no stock", false, "HideProduct", 0, 0, 2)]
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
            var inventories = CreateLocationInventoryCollection(stockAvailable, stockOnHand, new List<DCloc.Location>{location_both});
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

        [TestCase("Sort", false, "HideProduct", 10, 10, 4)]
        public void Should_Sort_Locations_By_DirectShip_And_Then_InstorePickup(string scenario, bool manageStock,
            string outOfStockBehavior, int stockAvailable, int stockOnHand, int expectedCount)
        {
            //arrange
            var sut = new ProductAvailableInventoryHelper();
            var inventories = CreateLocationInventoryCollection(stockAvailable, stockOnHand, 
                new List<DCloc.Location>{location_both,location_pickup_only,location_ship_only});
            var locations = new List<DCloc.Location> { location_both, location_pickup_only, location_ship_only };
            var product = new DCprod.Product { 
                InventoryInfo = new DCprod.ProductInventoryInfo
                                {
                                    ManageStock = manageStock, OutOfStockBehavior = outOfStockBehavior
                                }
            };

            //act
            var actual = sut.GetShipAndPickupLocationsWithInventory(inventories, locations, product);

            //assert
            Assert.That(actual[0].Fulfillment.Code, Is.EqualTo(ds.Code) );
            Assert.That(actual[1].Fulfillment.Code, Is.EqualTo(ds.Code) );
            Assert.That(actual[2].Fulfillment.Code, Is.EqualTo(sp.Code) );
            Assert.That(actual[3].Fulfillment.Code, Is.EqualTo(sp.Code) );
        }

        private static DCprod.LocationInventoryCollection CreateLocationInventoryCollection(int stockAvailable, int stockOnHand, List<Mozu.Location.Contracts.Location> locations)
        {
            var items = new List<DCprod.LocationInventory>();
            items.AddRange(locations.Select(x => CreateLocationWithInventory(stockAvailable, x)));


            return new DCprod.LocationInventoryCollection
            {
                Items = items
                //Items = new List<DCprod.LocationInventory>
                //{
                //    CreateLocationWithInventory(stockAvailable, location_both),
                //}
            };
        }

        private static LocationWithInventory CreateLocationWithInventory(int stockAvailable, Mozu.Location.Contracts.Location location)
        {
            return new LocationWithInventory
            {
                Location = location,
                ProductCode = product_code,
                ProductName = product_code,
                LocationCode = location.Code,
                StockAvailable = stockAvailable,
                StockOnHand = stockAvailable
            };
        }

        private LocationInventoryController CreateController(params DCloc.Location[] locations)
        {
            var locationInventoryClient = NSubstitute.Substitute.For<DCprod.Clients.ILocationInventoryWebApiClient>();
            var productWebApiClient = NSubstitute.Substitute.For<DCprod.Clients.IProductWebApiClient>();
            var locationAdminWebApiClient = NSubstitute.Substitute.For<DCloc.Clients.ILocationAdminWebApiClient>();
            var locationSettingsWebApiClient = NSubstitute.Substitute.For<DCloc.Clients.ILocationSettingsWebApiClient>();
            var prodAvailInventoryHelper = new ProductAvailableInventoryHelper();

            var locationInventoryCollection = new DCprod.LocationInventoryCollection() {
                Items = (
                    from l in locations
                    select new DCprod.LocationInventory {
                        LocationCode = l.Code,
                        ProductCode = product_code,
                        StockAvailable = 100,
                        StockOnHand = 100
                    }
                ).ToList()
            };

            productWebApiClient.GetLocationInventories(Arg.Any<string>())
                .ReturnsForAnyArgs(locationInventoryCollection.AsServiceClientResponseAsync());
            productWebApiClient.GetProduct(product_code)
                .ReturnsForAnyArgs(new DCprod.Product { 
                    ProductCode = product_code,
                    InventoryInfo = new DCprod.ProductInventoryInfo {
                        ManageStock = true, OutOfStockBehavior = "HideProduct"
                    }
                }.AsServiceClientResponseAsync());

            // location usage is what site settings uses to figure out which directship location is the site's default.
            // the only thing it's looking for is the first child of the locationusage "DS".
            var siteDirectShipLocation = locations.FirstOrDefault(l => l.FulfillmentTypes.Contains(ds));
            var locationUsageList = new DCloc.LocationUsageCollection {
                Items = new List<DCloc.LocationUsage> {
                    new DCloc.LocationUsage {
                        LocationUsageTypeCode = ds.Code,
                        LocationCodes = siteDirectShipLocation != null ? new List<string> { siteDirectShipLocation.Code } : null
                    }
                }
            };
            locationSettingsWebApiClient.GetLocationUsages()
                .Returns(locationUsageList.AsServiceClientResponseAsync());

            foreach (var loc in locations)
            {
                locationAdminWebApiClient.GetLocation(loc.Code).Returns(loc.AsServiceClientResponseAsync());
            }

            return new LocationInventoryController(locationInventoryClient, productWebApiClient, locationAdminWebApiClient, locationSettingsWebApiClient, prodAvailInventoryHelper);
        }
    }
}
