//using System;
//using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
//using NUnit.Framework;
//using Should;
//using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api.Models.Attributes
//{
//    [TestFixture]
//    public class AttributeValidationRangeTests
//    {
//        [TestCase("2", "4", 2, 4)]
//        [TestCase("", "4", 0, 4)]
//        [TestCase("2", "", 2, 0)]
//        [TestCase("", "", 0, 0)]
//        public void String_DataType_should_give_Min_and_Max_expected_values(decimal? min, decimal? max, int? expectedMin, int? expectedMax)
//        {
//            var actual = GetMappedAttribute(min, max, AttributeDataType.String);
//            actual.Validation.MinStringLength.ShouldEqual(expectedMin);
//            actual.Validation.MaxStringLength.ShouldEqual(expectedMax);
//        }

//        [TestCase("1/2/2013", "02/03/2013", "1/2/2013 12:00:00 AM", "2/3/2013 12:00:00 AM")]
//        public void Date_DataType_should_give_Min_and_Max_expected_values(decimal? min, decimal? max, string expectedMin, string expectedMax)
//        {
//            var actual = GetMappedAttribute(min, max, AttributeDataType.DateTime);
//            actual.Validation.MinDateValue.ShouldEqual(DateTime.Parse(expectedMin));
//            actual.Validation.MaxDateValue.ShouldEqual(DateTime.Parse(expectedMax));
//        }

//        [TestCase("0.1", "0.2", 0.1, 0.2)]
//        [TestCase("", "18", 0, 18)]
//        public void Number_DataType_should_give_Min_and_Max_expected_values(decimal? min, decimal? max, decimal expectedMin, decimal expectedMax)
//        {
//            var actual = GetMappedAttribute(min, max, AttributeDataType.Number);
//            actual.Validation.MinNumericValue.ShouldEqual(expectedMin);
//            actual.Validation.MaxNumericValue.ShouldEqual(expectedMax);
//        }

//        private ProductAdmin.Contracts.Attribute GetMappedAttribute(decimal? min, decimal? max, AttributeDataType attributeDataType)
//        {
//            var attribute = new Attribute { Min = min, Max = max, DataType = attributeDataType };

//            return AutoMapper.Mapper.Map<ProductAdmin.Contracts.Attribute>(attribute);
//        }
//    }
//}

