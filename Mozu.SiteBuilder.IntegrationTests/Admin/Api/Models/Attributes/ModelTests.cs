using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using NUnit.Framework;
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
                    new AttributeValue { Id = "3233", AttributeId = id, Value = 123 },
                    new AttributeValue { Id = "3233", AttributeId = id, Value = 456 },
                    new AttributeValue { Id = "3233", AttributeId = id, Value = 789 },
                }
            };

            var text = new DumpTag().Process(attribute);

            Console.WriteLine(text);
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
                    new AttributeValue { AttributeId = attributeId.ToString( ), Id = 659.ToString( ), Value = "With Handle" },
                },
                Id = (attributeId++).ToString( ),
                Index = index++,
                IsHidden = false,
                IsLocked = true,
                IsRequired = true,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int>(),
                UsageType = ProductTypeAttributeUsage.extra 
            };
        }

        private IEnumerable<ProductTypeAttribute> GetOptions(int productTypeId)
        {
            var index = 0;
            var attributeId = 412;

            yield return new ProductTypeAttribute
            {
                AllowMulti = false,
                AllValues = new List<AttributeValue>
                {
                    new AttributeValue { AttributeId = attributeId.ToString(), Id = 3209.ToString(), Value = "Blue" },
                    new AttributeValue { AttributeId = attributeId.ToString(), Id = 3210.ToString(), Value = "Red" },
                    new AttributeValue { AttributeId = attributeId.ToString(), Id = 3211.ToString(), Value = "Green" },
                    new AttributeValue { AttributeId = attributeId.ToString(), Id = 3212.ToString(), Value = "White" },
                },
                Id = (attributeId++).ToString(),
                
                Index = index++,
                IsHidden = false,
                IsLocked = true,
                IsRequired = true,
                
                ProductTypeId = productTypeId,
                SelectedValues = new List<int> { 3209, 3210, 3211 },
                UsageType = ProductTypeAttributeUsage.extra 
            };

            yield return new ProductTypeAttribute
            {
                AllowMulti = true,
                AllValues = new List<AttributeValue>
                {
                    new AttributeValue { AttributeId = attributeId.ToString(), Id = 2332.ToString(), Value = "Matte" },
                    new AttributeValue { AttributeId = attributeId.ToString(), Id = 2333.ToString(), Value = "Glossy" },
                },
                Id = (attributeId++).ToString(),
                Index = index++,
                IsHidden = false,
                IsLocked = true,
                IsRequired = false,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int> { 2332 },
                UsageType = ProductTypeAttributeUsage.extra,
            };
        }

        private IEnumerable<ProductTypeAttribute> GetProperties(int productTypeId)
        {
            yield return new ProductTypeAttribute
            {
                AllValues = null,
                AllowMulti = false,
                Id = 342.ToString(),
                Index = 0,
                IsHidden = false,
                IsLocked = true,
                IsRequired = false,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int>(),
                UsageType = ProductTypeAttributeUsage.option
            };
        }
    }
}