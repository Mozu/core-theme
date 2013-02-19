using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using NUnit.Framework;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api.Models.Attributes
{
    [TestFixture]
    public class ModelTests
    {
        [Test]
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
            };

            var text = new DumpTag().Process(productType);

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
                    new AttributeValue { AttributeId = attributeId, Id = 659, Value = "With Handle" },
                },
                Id = attributeId++,
                Index = index++,
                IsHidden = false,
                IsLocked = true,
                IsRequired = true,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int>(),
                UsageType = ProductTypeAttributeUsageType.Admin,
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
                    new AttributeValue { AttributeId = attributeId, Id = 3209, Value = "Blue" },
                    new AttributeValue { AttributeId = attributeId, Id = 3210, Value = "Red" },
                    new AttributeValue { AttributeId = attributeId, Id = 3211, Value = "Green" },
                    new AttributeValue { AttributeId = attributeId, Id = 3212, Value = "White" },
                },
                Id = attributeId++,
                Index = index++,
                IsHidden = false,
                IsLocked = true,
                IsRequired = true,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int> { 3209, 3210, 3211 },
                UsageType = ProductTypeAttributeUsageType.Shopper,
            };

            yield return new ProductTypeAttribute
            {
                AllowMulti = true,
                AllValues = new List<AttributeValue>
                {
                    new AttributeValue { AttributeId = attributeId, Id = 2332, Value = "Matte" },
                    new AttributeValue { AttributeId = attributeId, Id = 2333, Value = "Glossy" },
                },
                Id = attributeId++,
                Index = index++,
                IsHidden = false,
                IsLocked = true,
                IsRequired = false,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int> { 2332 },
                UsageType = ProductTypeAttributeUsageType.Shopper,
            };
        }

        private IEnumerable<ProductTypeAttribute> GetProperties(int productTypeId)
        {
            yield return new ProductTypeAttribute
            {
                AllValues = null,
                AllowMulti = false,
                Id = 342,
                Index = 0,
                IsHidden = false,
                IsLocked = true,
                IsRequired = false,
                ProductTypeId = productTypeId,
                SelectedValues = new List<int>(),
                UsageType = ProductTypeAttributeUsageType.Unknown,
            };
        }
    }
}