using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Should;
using F = Kibo.Fulfillment.Contracts.Model;
using CR = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.ModelMapping
{
    [TestFixture]
    public class FulfillmentMappingTests
    {
        [OneTimeSetUp]
        public void FixtureSetup()
        {
            Mapper.Reset();
            Mapper.Initialize(cfg => { cfg.AddProfile<FulfillmentMapping>(); });
        }

        [Test]
        public void Check_mapping_of_pickup_info_from_fulfillment_to_commerce_contracts()
        {
            var source = new F.EntityModelOfShipment
            {
                ShipmentNumber = 123,
                PickupInfo = new Dictionary<string, object>
                {
                    { "Make and model", "Firetruck" },
                    { "Parking spot", 15 },
                    { "Coordinates", new Tuple<decimal, decimal>(30.390062m, -97.706812m) }
                }
            };

            var mapped = source.Map<CR.Shipment>();

            mapped.Number.ShouldEqual(123);
            mapped.PickupInfo.ShouldNotBeEmpty();
            mapped.PickupInfo["Make and model"].Value<string>().ShouldEqual("Firetruck");
            mapped.PickupInfo["Parking spot"].Value<int>().ShouldEqual(15);
            mapped.PickupInfo["Coordinates"]["Item1"].Value<decimal>().ShouldEqual(30.390062m);
            mapped.PickupInfo["Coordinates"]["Item2"].Value<decimal>().ShouldEqual(-97.706812m);
        }

        [Test]
        public void Check_mapping_of_pickup_info_from_commerce_to_fulfillment_contracts()
        {
            var source = new CR.Shipment
            {
                Number = 123,
                PickupInfo = new JObject(
                    new JProperty("Make and model", "Firetruck"),
                    new JProperty("Parking spot", 15),
                    new JProperty("Coordinates", new JObject(
                        new JProperty("Item1", 30.390062m),
                        new JProperty("Item2", -97.706812m)
                    ))
                )
            };

            var mapped = source.Map<F.EntityModelOfShipment>();

            mapped.ShipmentNumber.ShouldEqual(123);
            mapped.PickupInfo.ShouldNotBeEmpty();
            ((JValue) mapped.PickupInfo["Make and model"]).Value<string>().ShouldEqual("Firetruck");
            ((JValue) mapped.PickupInfo["Parking spot"]).Value<int>().ShouldEqual(15);
            ((JObject) mapped.PickupInfo["Coordinates"])["Item1"].Value<decimal>().ShouldEqual(30.390062m);
            ((JObject) mapped.PickupInfo["Coordinates"])["Item2"].Value<decimal>().ShouldEqual(-97.706812m);
        }

        [Test]
        public void Should_be_able_to_map_fulfillment_style_data_bags_to_commerce()
        {
            var source = new F.EntityModelOfShipment
            {
                Data = new Dictionary<string, object>
                {
                    { "ship-number", 123 },
                    { "ship-string", "the-shipment" },
                    { "ship-list", new List<string> { "s1", "s2" } }
                },
                Items = new List<F.Item>
                {
                    new F.Item
                    {
                        Data = new Dictionary<string, object>
                        {
                            { "item-number", 456 },
                            { "item-string", "the-item" },
                            { "item-list", new List<string> { "i1", "i2" } }
                        }
                    }
                }
            };

            var mapped = source.Map<CR.Shipment>();
            mapped.Data.ShouldNotBeNull();
            mapped.Data["ship-number"].Value<int>().ShouldEqual(123);
            mapped.Data["ship-string"].Value<string>().ShouldEqual("the-shipment");
            mapped.Data["ship-list"][0].Value<string>().ShouldEqual("s1");
            mapped.Data["ship-list"][1].Value<string>().ShouldEqual("s2");

            var item = mapped.Items.First();
            item.Data.ShouldNotBeNull();
            item.Data["item-number"].Value<int>().ShouldEqual(456);
            item.Data["item-string"].Value<string>().ShouldEqual("the-item");
            item.Data["item-list"][0].Value<string>().ShouldEqual("i1");
            item.Data["item-list"][1].Value<string>().ShouldEqual("i2");
        }

        [Test]
        public void Should_be_able_to_handle_null_fulfillment_data_bags()
        {
            var fulfillmentShipment = new F.EntityModelOfShipment
            {
                Items = new List<F.Item>
                {
                    new F.Item()
                }
            };

            var shipment = fulfillmentShipment.Map<CR.Shipment>();

            shipment.Data.ShouldBeNull();
            shipment.Items.First().Data.ShouldBeNull();
        }

        [Test]
        public void Should_be_able_to_map_commerce_style_data_bags_to_fulfillment()
        {
            var source = new CR.Shipment
            {
                Data = new JObject(
                    new JProperty("ship-number", 123),
                    new JProperty("ship-string", "the-shipment"),
                    new JProperty("ship-list", new JArray("s1", "s2"))
                )
            };

            var mapped = source.Map<F.EntityModelOfShipment>();

            mapped.Data.ShouldBeNull();
        }

        [Test]
        public void Should_be_able_to_map_fulfillment_destination_to_commerce()
        {
            var source = new F.EntityModelOfShipment
            {
                Destination = new F.Destination
                {
                    DestinationContact = new F.Contact
                    {
                        Address = new F.Address
                        {
                            Attributes = new Dictionary<string, object> { { "a-test", "123" } }, // Not supported
                            Address1 = "1500 Baker St.",
                            AddressType = "Residential",
                            CityOrTown = "Austin",
                            StateOrProvince = "TX",
                            CountryCode = "US",
                            PostalOrZipCode = "78727",
                            Latitude = "30.01", // Not supported
                            Longitude = "-30.02" // Not supported
                        },
                        Attributes = new Dictionary<string, object> { { "c-test", "456" } }, // Not supported
                        Email = "foo@gmail.com",
                        FirstName = "Testy",
                        MiddleNameOrInitial = "M.",
                        LastNameOrSurname = "McTest",
                        FullName = "Testy M. McTest", // Not supported
                        ShortFullName = "Testy", // Not supported
                        PhoneNumbers = new F.Phone
                        {
                            Attributes = new Dictionary<string, object> { { "p-test", "789" } }, // Not supported
                            Home = "5555555555"
                        }
                    },
                    IsDestinationCommercial = false,
                    LocationCode = "FOOBAR" // Not supported
                }
            };

            var mapped = source.Map<CR.Shipment>();

            mapped.Destination.ShouldNotBeNull();
            mapped.Destination.Id.ShouldBeNull(); // Ignored in mapping
            mapped.Destination.DestinationContact.ShouldNotBeNull();
            mapped.Destination.DestinationContact.Address.ShouldNotBeNull();
            //mapped.Destination.DestinationContact.Address.Attributes.ShouldNotBeNull(); // Not supported
            mapped.Destination.DestinationContact.Address.Address1.ShouldEqual("1500 Baker St.");
            mapped.Destination.DestinationContact.Address.AddressType.ShouldEqual("Residential");
            mapped.Destination.DestinationContact.Address.CityOrTown.ShouldEqual("Austin");
            mapped.Destination.DestinationContact.Address.StateOrProvince.ShouldEqual("TX");
            mapped.Destination.DestinationContact.Address.CountryCode.ShouldEqual("US");
            mapped.Destination.DestinationContact.Address.PostalOrZipCode.ShouldEqual("78727");
            //mapped.Destination.DestinationContact.Address.Latitude.ShouldEqual("30.01"); // Not supported
            //mapped.Destination.DestinationContact.Address.Longitude.ShouldEqual("-30.02"); // Not supported
            //mapped.Destination.DestinationContact.Attributes.ShouldNotBeNull(); // Not supported
            mapped.Destination.DestinationContact.Email.ShouldEqual("foo@gmail.com");
            mapped.Destination.DestinationContact.FirstName.ShouldEqual("Testy");
            mapped.Destination.DestinationContact.MiddleNameOrInitial.ShouldEqual("M.");
            mapped.Destination.DestinationContact.LastNameOrSurname.ShouldEqual("McTest");
            //mapped.Destination.DestinationContact.FullName.ShouldEqual("Testy M. McTest"); // Not supported
            //mapped.Destination.DestinationContact.ShortFullName.ShouldEqual("Testy"); // Not supported
            mapped.Destination.DestinationContact.PhoneNumbers.ShouldNotBeNull();
            //mapped.Destination.DestinationContact.PhoneNumbers.Attributes.ShouldNotBeNull(); // Not supported
            mapped.Destination.DestinationContact.PhoneNumbers.Home.ShouldEqual("5555555555");
            mapped.Destination.IsDestinationCommercial.ShouldEqual(false);
            //mapped.Destination.LocationCode.ShouldEqual("FOOBAR"); // Not supported
        }

        [Test]
        public void Should_be_able_to_map_commerce_destination_to_fulfillment()
        {
            var source = new CR.Shipment
            {
                Destination = new CR.Destination
                {
                    Id = Guid.NewGuid().ToString(), // Not supported
                    DestinationContact = new Core.Api.Contracts.Contact
                    {
                        Address = new Core.Api.Contracts.Address
                        {
                            Address1 = "1500 Baker St.",
                            AddressType = "Residential",
                            CityOrTown = "Austin",
                            StateOrProvince = "TX",
                            CountryCode = "US",
                            PostalOrZipCode = "78727"
                        },
                        Email = "foo@gmail.com",
                        FirstName = "Testy",
                        MiddleNameOrInitial = "M.",
                        LastNameOrSurname = "McTest",
                        PhoneNumbers = new Core.Api.Contracts.Phone
                        {
                            Home = "5555555555"
                        }
                    },
                    IsDestinationCommercial = false
                }
            };

            var mapped = source.Map<F.EntityModelOfShipment>();

            mapped.Destination.ShouldNotBeNull();
            //mapped.Destination.Id.ShouldNotBeNull(); // Not supported
            mapped.Destination.DestinationContact.ShouldNotBeNull();
            mapped.Destination.DestinationContact.Address.ShouldNotBeNull();
            mapped.Destination.DestinationContact.Address.Address1.ShouldEqual("1500 Baker St.");
            mapped.Destination.DestinationContact.Address.AddressType.ShouldEqual("Residential");
            mapped.Destination.DestinationContact.Address.CityOrTown.ShouldEqual("Austin");
            mapped.Destination.DestinationContact.Address.StateOrProvince.ShouldEqual("TX");
            mapped.Destination.DestinationContact.Address.CountryCode.ShouldEqual("US");
            mapped.Destination.DestinationContact.Address.PostalOrZipCode.ShouldEqual("78727");
            mapped.Destination.DestinationContact.Attributes.ShouldBeNull(); // Ignored in mapping
            mapped.Destination.DestinationContact.Email.ShouldEqual("foo@gmail.com");
            mapped.Destination.DestinationContact.FirstName.ShouldEqual("Testy");
            mapped.Destination.DestinationContact.MiddleNameOrInitial.ShouldEqual("M.");
            mapped.Destination.DestinationContact.LastNameOrSurname.ShouldEqual("McTest");
            mapped.Destination.DestinationContact.FullName.ShouldBeNull(); // Ignored in mapping
            mapped.Destination.DestinationContact.ShortFullName.ShouldBeNull(); // Ignored in mapping
            mapped.Destination.DestinationContact.PhoneNumbers.ShouldNotBeNull();
            mapped.Destination.DestinationContact.PhoneNumbers.Home.ShouldEqual("5555555555");
            mapped.Destination.IsDestinationCommercial.ShouldEqual(false);
            mapped.Destination.LocationCode.ShouldBeNull(); // Ignored in mapping
        }
    }
}