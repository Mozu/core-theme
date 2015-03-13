using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using NUnit.Framework;
using DCprod = Mozu.ProductAdmin.Contracts;
using DCloc = Mozu.Location.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api;
using NSubstitute;
using Mozu.SiteBuilder.UnitTests.Extensions;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api
{
    [Category("Inventory")]
    [TestFixture]
    public class LocationInventoryControllerTest
    {
        private static string product_code = "SOMEPROD-001";
        private static DCloc.FulfillmentType sp = FulfillmentTypeConstants.InStorePickup;
        private static DCloc.FulfillmentType ds = FulfillmentTypeConstants.DirectShip;
        private static DCloc.FulfillmentType dg = FulfillmentTypeConstants.DigitalFulfillmentType;
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
            var controller = CreateController(new []{"DirectShip","InStorePickup"}, location_ship_only);

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
            var controller = CreateController(new []{"DirectShip","InStorePickup"}, location_both, location_ship_only, location_pickup_only);

            // act
            var t = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code);
            List<LocationWithInventory> result = t.Result.Items;

            // assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result.Count(lwi => lwi.Fulfillment == ds), Is.EqualTo(1), "should be exactly one directship location in this list.");
            Assert.That(result.Count(lwi => lwi.Fulfillment == sp), Is.EqualTo(2), "should be two pickup locations in this list.");
        }

        /// <summary>
        /// Mozu currently supports a single shipping origin for all packages on an order.
        /// The location inventory list should ONLY list the directship location configured
        /// in Site Settings as a possible DirectShip source.
        /// </summary>
        [Test]
        public void Given_Digital_Product_Should_Return_One_Digital_Location()
        {
            // arrange
            var controller = CreateController(new[] { "Digital" }, location_both, location_ship_only, location_pickup_only);

            // act
            var t = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code);
            List<LocationWithInventory> result = t.Result.Items;

            // assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result.Count(lwi => lwi.Fulfillment == dg), Is.EqualTo(1), "should be exactly one directship location in this list.");
        }

        //manage stock      out of stock behavior                       inv        show
        //  true            DisplayMsg, HideProduct                     0          false
        //  true            DisplayMsg, HideProduct, AllowBack         > 0         true
        //  true            AllowBackorder                              0          true

        //DisplayMessage
        [TestCase("display msg, has stock, DS & SP", new[] { "DirectShip", "InStorePickup" }, "DisplayMessage", 10, 10, 2)]
        [TestCase("display msg, has stock, DS", new[] { "DirectShip" }, "DisplayMessage", 10, 10, 1)]
        [TestCase("display msg, no stock, DS & SP", new[] { "DirectShip", "InStorePickup" }, "DisplayMessage", 0, 0, 0)]
        //HideProduct
        [TestCase("hide product, has stock, DS & SP", new[] { "DirectShip", "InStorePickup" }, "HideProduct", 10, 10, 2)]
        [TestCase("hide product, has stock, DS", new[] { "DirectShip" }, "HideProduct", 10, 10, 1)]
        [TestCase("hide product, no stock, DS & SP", new[] { "DirectShip", "InStorePickup" }, "HideProduct", 0, 0, 0)]
        //AllowBackorder
        [TestCase("allow backorder, no stock, DS & SP", new[] { "DirectShip", "InStorePickup" }, "AllowBackorder", 0, 0, 2)]
        [TestCase("allow backorder, has stock, DS & SP", new[] { "DirectShip", "InStorePickup" }, "AllowBackorder", 10, 10, 2)]
        [TestCase("allow backorder, has stock, DS", new[] { "DirectShip" }, "AllowBackorder", 10, 10, 1)]
        public void Given_Managed_Stock_When_Location_Has_Both_DirectShip_And_Pickup_Location_Then_Should_Return_As_Separate_Records(string scenario, 
            string[] fulfillmentTypes, string outOfStockBehavior, int stockAvailable, int stockOnHand, int expectedCount)
        {
            //arrange
            var sut = new ProductAvailableInventoryHelper();
            var inventories = CreateLocationInventoryCollection(stockAvailable, stockOnHand, new List<DCloc.Location>{location_both});
            var locations = new List<DCloc.Location> { location_both };
            var product = CreateProduct(true, outOfStockBehavior, fulfillmentTypes);

            //act
            var actual = sut.GetShipAndPickupLocationsWithInventory(inventories, locations, product, null);

            //assert
            Assert.That(actual.Count, Is.EqualTo(expectedCount), scenario);
        }

        //manage stock      out of stock behavior                       inv        show
        //  false           DisplayMsg, HideProduct, AllowBack          >0         true
        //  false           DisplayMsg, HideProduct, AllowBack          0          true
        [TestCase("unmanaged stock", new[]{"DirectShip"}, 1)]
        [TestCase("unmanaged stock", new[]{"DirectShip","InStorePickup"}, 2)]
        public void When_Unmanaged_Shows_All_Pickup_Locations_With_No_Inventory_Shown(string scenario, string[] fulfillmentTypes, int expectedCount)
        {
            //arrange
            var sut = new ProductAvailableInventoryHelper();
            var locations = new List<DCloc.Location> { location_both };
            var product = CreateProduct(false, "DisplayProduct", fulfillmentTypes, "UNMGD_INV", "Unmanaged Inventory");
            
            //act
            var actual = sut.GetAllShipAndPickupLocationsForUnmanagedProducts(locations, product, null);

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
            var product = CreateProduct(manageStock, outOfStockBehavior, new[] {"DirectShip", "InStorePickup"});
            
            //act
            var actual = sut.GetShipAndPickupLocationsWithInventory(inventories, locations, product, null);

            //assert
            Assert.That(actual[0].Fulfillment.Code, Is.EqualTo(ds.Code) );
            Assert.That(actual[1].Fulfillment.Code, Is.EqualTo(ds.Code) );
            Assert.That(actual[2].Fulfillment.Code, Is.EqualTo(sp.Code) );
            Assert.That(actual[3].Fulfillment.Code, Is.EqualTo(sp.Code) );
        }

        [TestCase("inherited both types", new[]{"DirectShip", "InStorePickup"}, new string[]{}, new[]{"DS", "SP"} )]
        [TestCase("inherited one type", new[]{"InStorePickup"}, new string[]{}, new[]{"SP"} )]
        [TestCase("overriden both", new[] { "InStorePickup" }, new []{ "DirectShip", "InStorePickup" }, new[] { "DS", "SP" })]
        [TestCase("overriden single", new[] { "DirectShip", "InStorePickup" }, new []{ "InStorePickup" }, new[] { "SP" })]
        public void Given_Variant_With_Empty_FulfillmentTypes_Should_Inherit_From_Product(string scenario, string[] prodFulfill, string[] variantFulfill, string[] expectedFulfill)
        {
            const string variantCode = "var1";
            // arrange
            var controller = CreateController(prodFulfill, variantCode, variantFulfill, location_both);

            // act
            var t = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code, variantCode);
            List<LocationWithInventory> result = t.Result.Items;

            // assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            var match = from r in result
                        join exp in expectedFulfill on r.Fulfillment.Code equals exp
                        select r;
            Assert.That(match.Count(), Is.EqualTo(expectedFulfill.Length));
        }

        private static DCprod.Product CreateProduct(bool manageStock, string outOfStockBehavior, string[] fulfillmentTypes, string code = "prodCode", string name = "hat")
        {
            var product = new DCprod.Product
            {
                InventoryInfo = new DCprod.ProductInventoryInfo
                {
                    ManageStock = manageStock,
                    OutOfStockBehavior = outOfStockBehavior
                },
                ProductCode = code,
                Content = new DCprod.ProductLocalizedContent
                {
                    ProductName = name
                },
                FulfillmentTypesSupported = fulfillmentTypes
            };
            return product;
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

        private LocationInventoryController CreateController(string[] fulfillmentTypesSupported,
            params DCloc.Location[] locations)
        {
            return CreateController(fulfillmentTypesSupported, null, null, locations);
        }

        private LocationInventoryController CreateController(string[] fulfillmentTypesSupported, string productVariantCode, string[] variantFulfillmentTypes, params DCloc.Location[] locations)
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
                    Content = new DCprod.ProductLocalizedContent{
                   //     LocaleCode = "??-??",
                        ProductName = product_code + " name"},
                    InventoryInfo = new DCprod.ProductInventoryInfo {
                        ManageStock = true, OutOfStockBehavior = "HideProduct"
                    },
                    FulfillmentTypesSupported = fulfillmentTypesSupported
                }.AsServiceClientResponseAsync());

            if (productVariantCode != null)
            {
                SetupMockVariants(productVariantCode, variantFulfillmentTypes, productWebApiClient);
            }

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

        private static void SetupMockVariants(string productVariantCode, string[] variantFulfillmentTypes,
            DCprod.Clients.IProductWebApiClient productWebApiClient)
        {
            productWebApiClient.GetProductVariations(product_code)
                .ReturnsForAnyArgs(new DCprod.ProductVariationPagedCollection
                {
                    Items = new List<DCprod.ProductVariation>
                    {
                        new DCprod.ProductVariation
                        {
                            FulfillmentTypesSupported = variantFulfillmentTypes,
                            VariationProductCode = productVariantCode,
                        }
                    }
                }.AsServiceClientResponseAsync());
        }
    }
}
