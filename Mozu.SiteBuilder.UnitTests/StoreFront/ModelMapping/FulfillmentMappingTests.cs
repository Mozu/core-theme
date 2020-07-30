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
    }
}