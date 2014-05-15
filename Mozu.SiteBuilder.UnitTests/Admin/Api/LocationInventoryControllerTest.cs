using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
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
        private static DCloc.FulfillmentType sp = new DCloc.FulfillmentType { Code = "SP", Name = "In-store Pickup" };
        private static DCloc.FulfillmentType ds = new DCloc.FulfillmentType { Code = "DS", Name = "Direct Ship" };
        private static DCloc.Location location_ship_only = new DCloc.Location { Code = "location_ship_only", FulfillmentTypes = new List<DCloc.FulfillmentType> { ds } };
        private static DCloc.Location location_pickup_only = new DCloc.Location { Code = "location_pickup_only", FulfillmentTypes = new List<DCloc.FulfillmentType> { sp } };
        private static DCloc.Location location_both = new DCloc.Location { Code = "location_both", FulfillmentTypes = new List<DCloc.FulfillmentType> { sp, ds } };
        private static UX.Admin.Api.Models.PagingParamaters empty_paging_params = new UX.Admin.Api.Models.PagingParamaters();
        private static UX.Admin.Api.Models.FilterCollection empty_filter_collection = new UX.Admin.Api.Models.FilterCollection();

        [Test]
        public void When_Product_Has_One_Location_With_One_Fulfillment_Type_Should_Get_One_Entry()
        {
            var controller = CreateController(location_ship_only);
            var result = controller.GetLocationsForProduct(empty_paging_params, empty_filter_collection, product_code);
            Assert.IsNotNull(result);
        }

        private LocationInventoryController CreateController(params DCloc.Location[] locations)
        {
            var locationInventoryClient = NSubstitute.Substitute.For<DCprod.Clients.ILocationInventoryWebApiClient>();
            var productWebApiClient = NSubstitute.Substitute.For<DCprod.Clients.IProductWebApiClient>();
            var locationAdminWebApiClient = NSubstitute.Substitute.For<DCloc.Clients.ILocationAdminWebApiClient>();

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
            productWebApiClient.GetLocationInventories(product_code).Returns(locationInventoryCollection.AsServiceClientResponseAsync());

            foreach (var loc in locations)
            {
                locationAdminWebApiClient.GetLocation(loc.Code).Returns(loc.AsServiceClientResponseAsync());
            }

            return new LocationInventoryController(locationInventoryClient, productWebApiClient, locationAdminWebApiClient);
        }
    }
}
