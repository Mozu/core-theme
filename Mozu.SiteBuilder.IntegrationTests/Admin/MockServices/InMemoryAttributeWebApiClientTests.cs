//using System.Runtime.Caching;
//using Mozu.Core;
//using Mozu.ProductAdmin.Contracts;
//using Mozu.SiteBuilder.UX.Admin.MockServices;
//using NSubstitute;
//using NUnit.Framework;
//using Should;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.MockServices
//{
//    [TestFixture]
//    public class InMemoryAttributeWebApiClientTests
//    {
//        [Test]
//        public void Can_add_attributes()
//        {
//            var client = GetClient();
//            var startCount = client.GetAttributes().Result.ReadAsAsync().Result.Items.Count;

//            var attribute = new Attribute { AttributeFQN = "21d40050141e4a628b1f43b8c1a3ea1c" };
//            client.AddAttribute(attribute);

//            var allAttributes = client.GetAttributes().Result.ReadAsAsync().Result;
//            allAttributes.Items.Count.ShouldEqual(startCount + 1);
//        }

//        [Test]
//        public void Can_add_attribute_values()
//        {
//            var client = GetClient();
//            var attribute = new Attribute { AttributeFQN = "e82e2cab902644aa9e9dac26e69877d2" };
//            var startCount = client.GetAttributeVocabularyValues(attribute.AttributeFQN).Result.ReadAsAsync().Result.Items.Count;

//            client.AddAttribute(attribute);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Value = "one" }, attribute.AttributeFQN);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Value = "two" }, attribute.AttributeFQN);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Value = "tre" }, attribute.AttributeFQN);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Value = "fou" }, attribute.AttributeFQN);

//            var allAttributeValues = client.GetAttributeVocabularyValues(attribute.AttributeFQN).Result.ReadAsAsync().Result;
//            allAttributeValues.Items.Count.ShouldEqual(startCount + 4);
//        }

//        [Test]
//        public void Can_delete_things()
//        {
//            var fqn = "9697304dd9424d1e97fff7e022a0881c";
//            var client = GetClient();

//            // add stuff
//            client.AddAttribute(new Attribute { AttributeFQN = fqn });
//            client.AddAttribute(new Attribute { AttributeFQN = "sdfjsda" });
//            client.AddAttribute(new Attribute { AttributeFQN = "thing" });

//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Content = new AttributeVocabularyValueLocalizedContent { StringValue = "red" } }, fqn);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Content = new AttributeVocabularyValueLocalizedContent { StringValue = "green" } }, fqn);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Content = new AttributeVocabularyValueLocalizedContent { StringValue = "blue" } }, fqn);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Content = new AttributeVocabularyValueLocalizedContent { StringValue = "yellow" } }, fqn);
//            client.AddAttributeVocabularyValue(new AttributeVocabularyValue { Content = new AttributeVocabularyValueLocalizedContent { StringValue = "orange" } }, fqn);

//            var attributes = client.GetAttributes().Result.ReadAsAsync().Result.Items;
//            var attributeValues = client.GetAttributeVocabularyValues(fqn).Result.ReadAsAsync().Result.Items;

//            // delete all
//            foreach (var attribute in attributes)
//                client.DeleteAttribute(attribute.AttributeFQN);

//            foreach (var attributeValue in attributeValues)
//                client.DeleteAttributeValue(fqn, attributeValue.Content.StringValue);

//            client.GetAttributes().Result.ReadAsAsync().Result.Items.Count.ShouldEqual(0);
//            client.GetAttributeVocabularyValues(fqn).Result.ReadAsAsync().Result.Items.Count.ShouldEqual(0);
//        }

//        public InMemoryAttributeWebApiClient GetClient()
//        {
//            var ctx = Substitute.For<IApiContext>();
//            var cache = new MemoryCache("foo");
//            return new InMemoryAttributeWebApiClient(ctx, cache);
//        }
//    }
//}

