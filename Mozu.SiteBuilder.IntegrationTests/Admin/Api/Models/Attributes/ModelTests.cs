using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product;
using NUnit.Framework;
using Should;
using Attribute = Mozu.ProductAdmin.Contracts.Attribute;
using ProductType = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product.ProductType;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api.Models.Attributes
{
    [Category("Mapping")]
    [TestFixture]
    public class ModelTests
    {
        //[Test]
        //public void Can_map_from_Contract_Attribute_to_SiteBuilder_Attribute_for_String()
        //{
        //    var attribute = new ProductAdmin.Contracts.Attribute
        //    {
        //        DataType = "String",
        //        Validation = new AttributeValidation
        //        {
        //            MaxStringLength = 40,
        //            MinStringLength = 20,
        //        },
        //    };

        //    var actual = AutoMapper.Mapper.Map<Attribute>(attribute);

        //    actual.Min.ShouldBeType<int>();
        //    actual.Min.ShouldEqual(attribute.Validation.MinStringLength);

        //    actual.Max.ShouldBeType<int>();
        //    actual.Max.ShouldEqual(attribute.Validation.MaxStringLength);
        //}

        private IEnumerable<ProductTypeAttribute> GetExtras(int productTypeId)
        {
            int attributeId = 93;
            int index = 0;

            yield return new ProductTypeAttribute
                         {
                             AllowMulti = false,
                             AllValues = new List<AttributeValue>
                                         {
                                             new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 659.ToString(), Value = "With Handle"},
                                         },
                             AttributeFQN = (attributeId++).ToString(),
                             Index = index++,
                             IsHidden = false,
                             IsLocked = true,
                             IsRequired = true,
                             ProductTypeId = productTypeId,
                             SelectedValues = new List<AttributeValue>(),
                         };
        }

        private IEnumerable<ProductTypeAttribute> GetOptions(int productTypeId)
        {
            int index = 0;
            int attributeId = 412;

            var attributeValues = new List<AttributeValue>
                                  {
                                      new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 3209.ToString(), Value = "Blue"},
                                      new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 3210.ToString(), Value = "Red"},
                                      new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 3211.ToString(), Value = "Green"},
                                      new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 3212.ToString(), Value = "White"},
                                  };
            yield return new ProductTypeAttribute
                         {
                             AllowMulti = false,
                             AllValues = attributeValues,
                             AttributeFQN = (attributeId++).ToString(),
                             Index = index++,
                             IsHidden = false,
                             IsLocked = true,
                             IsRequired = true,
                             ProductTypeId = productTypeId,
                             SelectedValues = new List<AttributeValue> {attributeValues[0], attributeValues[1], attributeValues[2]},
                         };

            var allValues = new List<AttributeValue>
                            {
                                new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 2332.ToString(), Value = "Matte"},
                                new AttributeValue {AttributeFQN = attributeId.ToString(), Id = 2333.ToString(), Value = "Glossy"},
                            };
            yield return new ProductTypeAttribute
                         {
                             AllowMulti = true,
                             AllValues = allValues,
                             AttributeFQN = (attributeId++).ToString(),
                             Index = index++,
                             IsHidden = false,
                             IsLocked = true,
                             IsRequired = false,
                             ProductTypeId = productTypeId,
                             SelectedValues = new List<AttributeValue> {allValues[0]},
                         };
        }

        private IEnumerable<ProductTypeAttribute> GetProperties(int productTypeId)
        {
            yield return new ProductTypeAttribute
                         {
                             AllValues = null,
                             AllowMulti = false,
                             AttributeFQN = 342.ToString(),
                             Index = 0,
                             IsHidden = false,
                             IsLocked = true,
                             IsRequired = false,
                             ProductTypeId = productTypeId,
                             SelectedValues = new List<AttributeValue>(),
                         };
        }

        [Test, Explicit("Run to create some sample JSON")]
        public void Can_create_a_test_ProductType()
        {
            int id = 198;
            IEnumerable<ProductTypeAttribute> options = GetOptions(id);
            IEnumerable<ProductTypeAttribute> properties = GetProperties(id);
            IEnumerable<ProductTypeAttribute> extras = GetExtras(id);

            var productType = new ProductType
                              {
                                  Extras = extras.ToList(),
                                  Options = options.ToList(),
                                  Properties = properties.ToList(),
                                  Name = "Buckets",
                                  Id = id,
                                  IsBase = true,
                                  ProductCount = 12,
                                  ModifiedDate = DateTime.Now
                              };


            string text = new DumpTag().Process(productType);

            Console.WriteLine(text);
        }

        [Test, Explicit("Run to create some sample JSON")]
        public void Can_create_an_Attribute_with_AttributeValues()
        {
            string id = "92348u502u";
            var attribute = new UX.Admin.Api.Models.Attributes.Product.Attribute
                            {
                                Id = id,
                                Values = new List<AttributeValue>
                                         {
                                             new AttributeValue {Id = "3233", AttributeFQN = id, Value = 123},
                                             new AttributeValue {Id = "3233", AttributeFQN = id, Value = 456},
                                             new AttributeValue {Id = "3233", AttributeFQN = id, Value = 789},
                                         }
                            };

            string text = new DumpTag().Process(attribute);

            Console.WriteLine(text);
        }

        [Test]
        public void Can_map_Attribute_Enums_to_Strings()
        {
            var attribute = new UX.Admin.Api.Models.Attributes.Product.Attribute
                            {
                                ValueType = AttributeValueType.ShopperEntered,
                                InputType = AttributeInputType.TextBox,
                                DataType = AttributeDataType.DateTime,
                            };
            var mapped = Mapper.Map<Attribute>(attribute);

            mapped.ValueType.ShouldEqual("ShopperEntered");
            mapped.InputType.ShouldEqual("TextBox");
            mapped.DataType.ShouldEqual("DateTime");
        }

        [Test]
        public void Can_map_Attribute_Strings_to_Enums()
        {
            var attribute = new Attribute
                            {
                                ValueType = "ShopperEntered",
                                InputType = "TextBox",
                                DataType = "DateTime",
                                Validation = new AttributeValidation {RegularExpression = "/bla(h|H)"},
                            };
            var mapped = Mapper.Map<UX.Admin.Api.Models.Attributes.Product.Attribute>(attribute);

            mapped.ValueType.ShouldEqual(AttributeValueType.ShopperEntered);
            mapped.InputType.ShouldEqual(AttributeInputType.TextBox);
            mapped.DataType.ShouldEqual(AttributeDataType.DateTime);
            mapped.Regex.ShouldEqual("/bla(h|H)");
        }

        [Test]
        public void Can_map_from_Contract_Attribute_to_SiteBuilder_Attribute_for_Date()
        {
            var attribute = new Attribute
                            {
                                DataType = "DateTime",
                                Validation = new AttributeValidation
                                             {
                                                 MaxDateValue = new DateTime(2001, 1, 1),
                                                 MinDateValue = new DateTime(1999, 12, 31),
                                             },
                            };

            var actual = Mapper.Map<UX.Admin.Api.Models.Attributes.Product.Attribute>(attribute);

            // TODO: not possible.
            // actual.Min.ShouldBeType<DateTime>();
            // actual.Min.ShouldEqual(attribute.Validation.MinDateValue);

            // actual.Max.ShouldBeType<DateTime>();
            // actual.Max.ShouldEqual(attribute.Validation.MaxDateValue);
        }

        [Test]
        public void Can_map_from_Contract_Attribute_to_SiteBuilder_Attribute_for_Numeric()
        {
            var attribute = new Attribute
                            {
                                DataType = "Number",
                                Validation = new AttributeValidation
                                             {
                                                 MaxNumericValue = 9000m,
                                                 MinNumericValue = 42.23589m,
                                             },
                            };

            var actual = Mapper.Map<UX.Admin.Api.Models.Attributes.Product.Attribute>(attribute);

            actual.Min.ShouldBeType<decimal>();
            actual.Min.ShouldEqual(attribute.Validation.MinNumericValue);

            actual.Max.ShouldBeType<decimal>();
            actual.Max.ShouldEqual(attribute.Validation.MaxNumericValue);
        }

        [Test]
        public void Travis_test()
        {
            var attribute = new UX.Admin.Api.Models.Attributes.Product.Attribute
                            {
                                Regex = "travis",
                                Id = "UPC",
                                DataType = AttributeDataType.String,
                                InputType = AttributeInputType.TextBox,
                                Name = "UPC1",
                                ValueType = AttributeValueType.AdminEntered,
                                IsOption = false,
                                IsExtra = false,
                                IsProperty = true,
                                Min = null,
                                Max = null,
                                Values = new List<AttributeValue>(),
                            };
            var dcAttribute = Mapper.Map<Attribute>(attribute);

            dcAttribute.ShouldNotBeNull();
        }
    }
}