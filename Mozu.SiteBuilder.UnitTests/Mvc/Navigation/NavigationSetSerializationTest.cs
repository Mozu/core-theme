using System;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Navigation
{
    [TestFixture]
    public class NavigationSetSerializationTest
    {
        private static readonly NavigationSet _emptySet;
        private static readonly NavigationSet _testSet;
        private static readonly NavigationSet.Converter _converter = new NavigationSet.Converter();
        private static readonly string _nodeJson1 = "{id: \"page^^foo^^home\", originalId: \"home\", originalCollection: \"foo\", parentId: \"_default\", name: \"Home Page\", url: \"/p/home\", index: 3, nodeType: \"page\"}";
        private static readonly string _nodeJson2 = "{id: \"page^^foo^^bar\", originalId: \"bar\", originalCollection: \"foo\", parentId: \"_default\", name: \"Bar Page\", url: \"/p/bar\", index: 7, nodeType: \"page\"}";
        private static readonly string _newFormatJson = "[" + _nodeJson1 + "," + _nodeJson2 + "]";
        private static readonly string _jsonNoOriginalId = "[{id: \"page^^foo^^bar\", originalCollection: \"foo\", parentId: \"_default\", name: \"Bar Page\", url: \"/p/bar\", index: 7, nodeType: \"page\"}]";
        private static readonly string _oldFormatJson = "{\"nodes\":[{\"id\":\"page^^pages^^0818cc78-19b3-4ed7-bbd1-1f5218403fef\",\"parentId\":\"_navigation\",\"name\":\"home\",\"index\":1,\"leaf\":false,\"isHidden\":false,\"originalId\":\"0818cc78-19b3-4ed7-bbd1-1f5218403fef\",\"originalCollection\":\"pages\",\"nodeType\":\"page\",\"url\":\"/default\"}]}";
        private static readonly string _weirdNodeTypeJson = "{\"nodes\":[{\"id\":\"page^^pages^^0818cc78-19b3-4ed7-bbd1-1f5218403fef\",\"parentId\":\"_navigation\",\"name\":\"home\",\"index\":1,\"leaf\":false,\"isHidden\":false,\"originalId\":\"0818cc78-19b3-4ed7-bbd1-1f5218403fef\",\"originalCollection\":\"pages\", \"NodeType\":{\"nodeType\":\"page\"},\"url\":\"/default\"}]}";


        static NavigationSetSerializationTest()
        {
            _emptySet = new NavigationSet();
            _testSet = new NavigationSet();
            _testSet.Add(new SimpleNavigationNode
            {
                Id = "page^^foo^^home",
                OriginalId = "home",
                OriginalCollection = "foo",
                ParentId = "_default",
                Name = "Home Page",
                Url = "/p/home",
                Index = 3,
                NodeType = NavigationNodeType.Page
            });
        }

        [Test]
        public void Test_Serialize_empty()
        {
            string result = JsonConvert.SerializeObject(_emptySet, _converter);
            Assert.AreEqual("[]", result);
        }

        [Test]
        public void Test_Serialize_and_deserialize()
        {
            var result = JsonConvert.SerializeObject(_testSet, _converter);
            Assert.True(!string.IsNullOrEmpty(result));

            var deserialized = JsonConvert.DeserializeObject<NavigationSet>(result, _converter);
            Assert.AreEqual(_testSet[0].Id, deserialized[0].Id);
            Assert.AreEqual(_testSet[0].OriginalId, deserialized[0].OriginalId);
            Assert.AreEqual(_testSet[0].OriginalCollection, deserialized[0].OriginalCollection);
            Assert.AreEqual(_testSet[0].ParentId, deserialized[0].ParentId);
            Assert.AreEqual(_testSet[0].Name, deserialized[0].Name);
            Assert.AreEqual(_testSet[0].Url, deserialized[0].Url);
            Assert.AreEqual(_testSet[0].Index, deserialized[0].Index);
            Assert.AreEqual(_testSet[0].NodeType, deserialized[0].NodeType);
        }

        [Test]
        public void Test_Deserialize()
        {
            NavigationSet set = JsonConvert.DeserializeObject<NavigationSet>(_newFormatJson, _converter);

            Assert.That(set.Count == 2);

            Assert.AreEqual("page^^foo^^home", set[0].Id);
            Assert.AreEqual("home", set[0].OriginalId);
            Assert.AreEqual("foo", set[0].OriginalCollection);
            Assert.AreEqual("_default", set[0].ParentId);
            Assert.AreEqual("Home Page", set[0].Name);
            Assert.AreEqual("/p/home", set[0].Url);
            Assert.AreEqual(3, set[0].Index);
            Assert.AreEqual(NavigationNodeType.Page, set[0].NodeType);

            Assert.AreEqual("page^^foo^^bar", set[1].Id);
            Assert.AreEqual("bar", set[1].OriginalId);
            Assert.AreEqual("foo", set[1].OriginalCollection);
            Assert.AreEqual("_default", set[1].ParentId);
            Assert.AreEqual("Bar Page", set[1].Name);
            Assert.AreEqual("/p/bar", set[1].Url);
            Assert.AreEqual(7, set[1].Index);
            Assert.AreEqual(NavigationNodeType.Page, set[1].NodeType);
        }

        //[Test]
        //public void Test_Deserialize_old_string()
        //{
        //    NavigationSet set = JsonConvert.DeserializeObject<NavigationSet>(_oldFormatJson, _converter);

        //    Assert.That(set.Count == 1);

        //    Assert.AreEqual("page^^pages^^0818cc78-19b3-4ed7-bbd1-1f5218403fef", set[0].Id);
        //    Assert.AreEqual("0818cc78-19b3-4ed7-bbd1-1f5218403fef", set[0].OriginalId);
        //    Assert.AreEqual("pages@mozu", set[0].OriginalCollection);
        //    Assert.AreEqual("_navigation", set[0].ParentId);
        //    Assert.AreEqual("home", set[0].Name);
        //    Assert.AreEqual("/default", set[0].Url);
        //    Assert.AreEqual(1, set[0].Index);
        //    Assert.AreEqual(NavigationNodeType.Page, set[0].NodeType);
        //}

        [Test]
        public void Test_Deserialize_weird_nodetype()
        {
            NavigationSet set = JsonConvert.DeserializeObject<NavigationSet>(_weirdNodeTypeJson, _converter);

            Assert.AreEqual(1, set.Count);
            Assert.AreEqual(NavigationNodeType.Page, set[0].NodeType);
        }

        [Test]
        public void Test_Deserialize_Infers_OriginalId()
        {
            NavigationSet set = JsonConvert.DeserializeObject<NavigationSet>(_jsonNoOriginalId, _converter);

            Assert.AreEqual(1, set.Count);
            Assert.AreEqual("bar", set[0].OriginalId);
        }
    }
}
