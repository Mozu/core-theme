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
    public class LocalizedAttributeValueMappingTest
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

        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"blu","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttributeValue_LocalizedContent_To_JObject(string scenario, string[] locales, string[] values)
        {
            //arrange
            var reportAttribute = ConstructReportAttributeValue(locales, values);

            //act
            var actual = Mapper.Map<ReportAttributeValue, JObject>(reportAttribute);

            //assert
            for (int i = 0; i < locales.Length; i++)
            {
                Assert.That((string)actual["value_" + locales[i]], Is.EqualTo(values[i]), scenario);
            }

        }
        
        [TestCase("normal", new []{"fr-FR","ru-RU","es-ES","fr-CA"}, new[]{"blu","цвет",null,""})]
        [TestCase("empty", new string[0], new string[0])]
        public void It_Should_Map_ReportAttributeValue_To_LocalizedAttributeValue(string scenario, string[] locales, string[] values)
        {
            //arrange
            var reportAttributeValue = ConstructReportAttributeValue(locales, values);

            //act
            var jObject = Mapper.Map<ReportAttributeValue, JObject>(reportAttributeValue);
            var actual = jObject.ToObject<LocalizedAttributeValue>();

            //assert
            Assert.That(actual.AdminName, Is.EqualTo(reportAttributeValue.AdminName), scenario);
            Assert.That(actual.AttributeFQN, Is.EqualTo(reportAttributeValue.AttributeFQN), scenario);
            Assert.That(actual.StringValue, Is.EqualTo(reportAttributeValue.StringValue), scenario);
            Assert.That(actual.LocaleCode, Is.EqualTo(reportAttributeValue.LocaleCode), scenario);

            var matched =
                locales.Select(x => reportAttributeValue.LocalizedValues.Select(y => y.LocaleCode).Contains(x)).ToList();
            Assert.That(matched.Count, Is.EqualTo(locales.Length));

        }

        private static ReportAttributeValue ConstructReportAttributeValue(string[] locales, string[] values)
        {
            return new ReportAttributeValue
            {
                AdminName = "adminName",
                AttributeFQN = "tenant~color",
                Value = null,
                LocaleCode = "en-US",
                StringValue = "Blue",
                LocalizedValues = ConstructLocalizedValues(locales, values)
            };
        }

        private static List<ReportAttributeValueLocalizedContent> ConstructLocalizedValues(string[] locales, string[] values)
        {
            return locales.Select((t, i) => new ReportAttributeValueLocalizedContent
            {
                LocaleCode = t, StringValue = values[i], Exists = (!string.IsNullOrEmpty(values[i]))
            }).ToList();
        }

    }
}