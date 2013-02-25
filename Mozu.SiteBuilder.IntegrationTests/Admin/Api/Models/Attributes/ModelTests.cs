using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using NUnit.Framework;
using Should;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api.Models.Attributes
{
    [TestFixture]
    public class ModelTests
    {
        [Test, Explicit("Run to create some sample JSON")]
        public void Can_create_a_test_ProductType()
        {
            var id = 198;
            var options = GetOptions(id);
            var properties = GetProperties(id);
            var extras = GetExtras(id);
             
            var productType = new ProductType
            {
                Extras = extras.ToList(),
                Options = options.ToList(),
                Properties = properties.ToList(),
                Name = "Buckets",
                Id = id,
                IsBase = true,
                NumberOfProducts = 12,
                ModifiedDate = DateTime.Now 
            };


            var text = new DumpTag().Process(productType);

            Console.WriteLine(text);
        }

        [Test, Explicit("Run to create some sample JSON")]
        public void Can_create_an_Attribute_with_AttributeValues()
        {
            var id = "92348u502u";
            var attribute = new Attribute
            {
                Id = id,
                Values = new List<AttributeValue>
                {
                    new AttributeValue { Id = "3233", AttributeFQN = id, Value = 123 },
                    new AttributeValue { Id = "3233", AttributeFQN = id, Value = 456 },
                    new AttributeValue { Id = "3233", AttributeFQN = id, Value = 789 },
                }
            };

            var text = new DumpTag().Process(attribute);

            Console.WriteLine(text);
        }

        [Test]
        public void Can_map_Attribute_Enums_to_Strings()
        {
            var attribute = new Attribute
            {
                ValueType = AttributeValueType.Shopper,
                InputType = AttributeInputType.TextBox,
                DataType = AttributeDataType.DateTime,
            };
            var mapped = AutoMapper.Mapper.Map<ProductAdmin.Contracts.Attribute>(attribute);

            mapped.ValueType.ShouldEqual("Shopper");
            mapped.InputType.ShouldEqual("TextBox");
            mapped.DataType.ShouldEqual("DateTime");
        }

        [Test]
        public void Can_map_Attribute_Strings_to_Enums()
        {
            var attribute = new ProductAdmin.Contracts.Attribute
            {
                ValueType = "Shopper",
                InputType = "TextBox",
                DataType = "DateTime",
            };
            var mapped = AutoMapper.Mapper.Map<Attribute>(attribute);

            mapped.ValueType.ShouldEqual(AttributeValueType.Shopper);
            mapped.InputType.ShouldEqual(AttributeInputType.TextBox);
            mapped.DataType.ShouldEqual(AttributeDataType.DateTime);
        }

        private IEnumerable<ProductTypeAttribute> GetExtras(int productTypeId)
        {
            var attributeId = 93;
            var index = 0;

            yield return new ProductTypeAttribute
            {
                AllowMulti = false,
                AllValues = new List<AttributeValue>
                {
                    new AttributeValue { AttributeFQN = attributeId.ToString( ), Id = 659.ToString( ), Value = "With Handle" },
                },
                AttributeFQN = (attributeId++).ToString( ),
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
            var index = 0;
            var attributeId = 412;

            var attributeValues = new List<AttributeValue>
                {
                    new AttributeValue { AttributeFQN = attributeId.ToString(), Id = 3209.ToString(), Value = "Blue"},
                    new AttributeValue { AttributeFQN = attributeId.ToString(), Id = 3210.ToString(), Value = "Red" },
                    new AttributeValue { AttributeFQN = attributeId.ToString(), Id = 3211.ToString(), Value = "Green" },
                    new AttributeValue { AttributeFQN = attributeId.ToString(), Id = 3212.ToString(), Value = "White" },
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
                SelectedValues = new List<AttributeValue> { attributeValues[0], attributeValues[1], attributeValues[2] },
            };

            var allValues = new List<AttributeValue>
                {
                    new AttributeValue { AttributeFQN = attributeId.ToString(), Id = 2332.ToString(), Value = "Matte" },
                    new AttributeValue { AttributeFQN = attributeId.ToString(), Id = 2333.ToString(), Value = "Glossy" },
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
                SelectedValues = new List<AttributeValue> { allValues[0] },
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
    }
}