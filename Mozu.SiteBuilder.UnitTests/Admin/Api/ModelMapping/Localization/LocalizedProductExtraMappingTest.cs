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
    public class LocalizedProductExtraMappingTest
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

        [TestCase("normal", new[] { "EUR", "RUB" }, new[] { "76.82", "3533.44" })]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportVariantPrices_To_JObject_By_CurrencyCode(string scenario, string[] currencies, string[] priceValues)
        {
            //arrange
            var prices = priceValues.Select(x => (!string.IsNullOrEmpty(x) ? Convert.ToDecimal(x) : (decimal?)null)).ToArray();
            var reportExtra = ConstructReportExtra(currencies, prices);

            //act
            var actual = Mapper.Map<ReportProductExtra, JObject>(reportExtra);

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
            var reportExtra = ConstructReportExtra(currencies, prices);

            //act
            var jObject = Mapper.Map<ReportProductExtra, JObject>(reportExtra);
            var actual = jObject.ToObject<LocalizedProductExtraPrice>();

            //assert
            Assert.That(actual.ProductCode, Is.EqualTo(reportExtra.ProductCode), scenario);
            Assert.That(actual.AttributeFQN, Is.EqualTo(reportExtra.AttributeFQN), scenario);
            Assert.That(actual.AdminName, Is.EqualTo(reportExtra.AdminName), scenario);
            Assert.That(actual.AttributeName, Is.EqualTo(reportExtra.Value), scenario);
            Assert.That(actual.ProductName, Is.EqualTo(reportExtra.ProductName), scenario);
            Assert.That(actual.SupportedCurrencies.Count, Is.EqualTo(reportExtra.LocalizedDeltaPrices.Count), scenario);
            Assert.That(actual.DeltaPrice, Is.EqualTo(reportExtra.DeltaPrice), scenario);
            Assert.That(actual.CurrencyCode, Is.EqualTo(reportExtra.CurrencyCode), scenario);
        }

        

        private static ReportProductExtra ConstructReportExtra(string[] curencies, decimal?[] prices)
        {
            return new ReportProductExtra
            {
                CurrencyCode = "USD",
                DeltaPrice = 100M,
                ProductCode = "zzz",
                AttributeFQN = "zzz2",
                AdminName = "admin name",
                ProductName = "Soufle poker",
                LocalizedDeltaPrices = ConstructLocalizedExtraPrices(curencies, prices)
            };
        }

        private static List<ReportProductExtraDeltaPrice> ConstructLocalizedExtraPrices(string[] currencies, decimal?[] prices)
        {
            return currencies.Select((t, i) => new ReportProductExtraDeltaPrice
            {
                CurrencyCode = t,
                DeltaPrice = prices[i],
                Exists = prices[i].HasValue,
            }).ToList();
        }
        

    }
}
