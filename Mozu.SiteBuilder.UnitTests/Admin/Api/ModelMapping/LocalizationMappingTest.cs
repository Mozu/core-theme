using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Burrows;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using DC = Mozu.Customer.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping
{
    [TestFixture]
    public class LocalizationMappingTest
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

        #region Attribute

        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"Coleur","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttribute_LocalizedContent_To_JObject(string scenario, string[] locales, string[] names)
        {
            //arrange
            var reportAttribute = ConstructReportAttribute(locales, names);

            //act
            var actual = Mapper.Map<ReportAttribute, JObject>(reportAttribute);

            //assert
            for (int i = 0; i < locales.Length; i++)
            {
                Assert.That((string)actual[locales[i] + "_name"], Is.EqualTo(names[i]), scenario);
            }

        }
        
        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"Coleur","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttribute_To_LocalizedAttribute(string scenario, string[] locales, string[] names)
        {
            //arrange
            var reportAttribute = ConstructReportAttribute(locales, names);

            //act
            var jObject = Mapper.Map<ReportAttribute, JObject>(reportAttribute);
            var actual = jObject.ToObject<LocalizedAttribute>();

            //assert
            Assert.That(actual.AdminName, Is.EqualTo(reportAttribute.AdminName), scenario);
            Assert.That(actual.AttributeFQN, Is.EqualTo(reportAttribute.AttributeFQN), scenario);
            Assert.That(actual.Description, Is.EqualTo(reportAttribute.Description), scenario);
            Assert.That(actual.Locale, Is.EqualTo(reportAttribute.LocaleCode), scenario);
            Assert.That(actual.Name, Is.EqualTo(reportAttribute.Name), scenario);

            var matched =
                locales.Select(x => reportAttribute.LocalizedValues.Select(y => y.LocaleCode).Contains(x)).ToList();
            Assert.That(matched.Count, Is.EqualTo(locales.Length));

        }

        private static ReportAttribute ConstructReportAttribute(string[] locales, string[] names)
        {
            return new ReportAttribute
            {
                AdminName = "adminName",
                AttributeFQN = "tenant~color",
                Description = null,
                LocaleCode = "en-US",
                Name = "Color",
                LocalizedValues = ConstructLocalizedValues(locales, names)
            };
        }

        private static List<ReportAttributeLocalizedContent> ConstructLocalizedValues(string[] locales, string[] names)
        {
            return locales.Select((t, i) => new ReportAttributeLocalizedContent
            {
                LocaleCode = t, Name = names[i], Exists = (!string.IsNullOrEmpty(names[i]))
            }).ToList();
        }

        #endregion
        
        #region Variant

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
            Assert.That(actual.DeltaPrice, Is.EqualTo(reportVariant.DeltaPrice.Value), scenario);
            Assert.That(actual.DeltaMSRP, Is.EqualTo(reportVariant.DeltaPrice.MSRP), scenario);
            Assert.That(actual.DeltaCreditValue, Is.EqualTo(reportVariant.DeltaPrice.CreditValue), scenario);
            Assert.That(actual.CurrencyCode, Is.EqualTo(reportVariant.DeltaPrice.CurrencyCode), scenario);
        }

        private static ReportProductVariation ConstructReportVariant(string[] locales, decimal?[] prices, List<ReportProductOption> options = null)
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
                DeltaPrice = new ReportProductVariationDeltaPrice
                {
                    CurrencyCode = "USD",
                    Value = 100M,
                    MSRP = 119.95M,
                    Exists = true
                },
                ParentProductCode = "zzz",
                VariantProductCode = "zzz2",
                ProductName = "Soufle poker",
                Options = options,
                LocalizedDeltaPrices = ConstructLocalizedPrices(locales, prices)
            };
        }

        private static List<ReportProductVariationDeltaPrice> ConstructLocalizedPrices(string[] currencies, decimal?[] prices)
        {
            return currencies.Select((t, i) => new ReportProductVariationDeltaPrice
            {
                CurrencyCode = t, Value = prices[i], Exists = prices[i].HasValue,
                MSRP = (prices[i].HasValue) ? prices[i]+10M : null
            }).ToList();
        }

        #endregion

    }
}
