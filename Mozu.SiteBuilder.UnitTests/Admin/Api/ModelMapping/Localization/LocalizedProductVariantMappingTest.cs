using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping.Localization
{
    [TestFixture]
    public class LocalizedProductVariantMappingTest
    {
        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.AddProfile<LocalizationMapping>();
        }

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [TestCase("normal", new []{"EUR","RUB"}, new[]{"76.82", "3533.44"})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportVariantPrices_To_JObject_By_CurrencyCode(string scenario, string[] currencies, string[] priceValues)
        {
            //arrange
            var prices = priceValues.Select(x => (!string.IsNullOrEmpty(x) ? Convert.ToDecimal(x): (decimal?)null)).ToArray();
            var reportVariant = ConstructReportVariant(currencies, prices);

            //act
            var actual = Mapper.Map<ReportProductVariation, JObject>(reportVariant);

            //assert
            for (int i = 0; i < currencies.Length; i++)
            {
                Assert.That((decimal?)actual["price_" + currencies[i]], Is.EqualTo(prices[i]), scenario);
            }

        }

        [TestCase("normal", new[] { "EUR", "RUB", "RUP" }, new[] { "76.82", "3533.44", "" })]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportVariant_To_LocalizedVariant(string scenario, string[] currencies, string[] priceValues)
        {
            //arrange
            var prices = priceValues.Select(x => (!string.IsNullOrEmpty(x) ? Convert.ToDecimal(x) : (decimal?)null)).ToArray();
            var reportVariant = ConstructReportVariant(currencies, prices); //, new List<ReportProductOption>());

            //act
            var jObject = Mapper.Map<ReportProductVariation, JObject>(reportVariant);
            var actual = jObject.ToObject<LocalizedProductVariantPrice>();

            //assert
            Assert.That(actual.ParentProductCode, Is.EqualTo(reportVariant.ParentProductCode), scenario);
            Assert.That(actual.VariantProductCode, Is.EqualTo(reportVariant.VariantProductCode), scenario);
            Assert.That(actual.ProductName, Is.EqualTo(reportVariant.ProductName), scenario);
            Assert.That(actual.Options.Count, Is.EqualTo(reportVariant.Options.Count), scenario);
            Assert.That(actual.DeltaPrice, Is.EqualTo(reportVariant.Value), scenario);
            Assert.That(actual.DeltaMSRP, Is.EqualTo(reportVariant.MSRP), scenario);
            Assert.That(actual.DeltaCreditValue, Is.EqualTo(reportVariant.CreditValue), scenario);
            Assert.That(actual.CurrencyCode, Is.EqualTo(reportVariant.CurrencyCode), scenario);
        }

        
        
        private static ReportProductVariation ConstructReportVariant(string[] curencies, decimal?[] prices, List<ReportProductOption> options = null)
        {
            if (options == null)
            {
                options = new List<ReportProductOption>
                {
                    new ReportProductOption
                    {
                        AttributeFQN = "tenant~size",
                        AdminName = "Size",
                        Value = "M"
                    },
                    new ReportProductOption
                    {
                        AttributeFQN = "tenant~color",
                        AdminName = "Color",
                        Value = "Aqua"
                    }
                };
            }
            return new ReportProductVariation
            {
                CurrencyCode = "USD",
                Value = 100M,
                MSRP = 119.95M,
                ParentProductCode = "zzz",
                VariantProductCode = "zzz2",
                ProductName = "Soufle poker",
                Options = options,
                LocalizedDeltaPrices = ConstructLocalizedVariationPrices(curencies, prices)
            };
        }

        private static List<ReportProductVariationDeltaPrice> ConstructLocalizedVariationPrices(string[] currencies, decimal?[] prices)
        {
            return currencies.Select((t, i) => new ReportProductVariationDeltaPrice
            {
                CurrencyCode = t, Value = prices[i], Exists = prices[i].HasValue,
                MSRP = (prices[i].HasValue) ? prices[i]+10M : null
            }).ToList();
        }


    }
}