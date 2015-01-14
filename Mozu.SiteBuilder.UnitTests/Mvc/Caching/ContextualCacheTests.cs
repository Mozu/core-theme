using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.UX.Models;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Caching
{
    [TestFixture]
    public class ContextualCacheTests
    {
        [TestCaseSource("Cases")]
        [Test]
        public void When_Context_Is_In_Edit_Mode_Nothing_Is_Cached(bool isEditMode, DataViewModeType dvm,  bool expectedNull)
        {
            var pageCtx = Substitute.For<IEditableContext>();
            pageCtx.IsEditMode.Returns(isEditMode);
            var context = Substitute.For<IApiContext>();
            context.DataViewMode.Returns(dvm);

            // preload cache with an item
            var backingCache = new TestCache();
            var key = new Random().Next().ToString();
            backingCache.Set(key, 5);

            var contextCache = new LiveModeOnlyCacheInternal(context, pageCtx,  backingCache);
            var cachedItem = contextCache.Get<int?>(key);
            Assert.AreEqual((cachedItem == null), expectedNull); 
        }

        private static readonly bool[] Bools = {true, false};
        private static readonly IEnumerable<DataViewModeType> Dvms = Enum.GetValues(typeof(DataViewModeType)).Cast<DataViewModeType>();

        private readonly IEnumerable<object[]> Cases =
            from isEditMode in Bools
            from dvm in Dvms
            //from partialCacheEnabled in Bools
            select
                new object[]
                {
                    isEditMode, dvm,
                    isEditMode || dvm == DataViewModeType.Pending 
                };
    }

    internal class TestCache : IStorefrontCache
    {
        private struct ScopedName
        {
            public string key { get; set; }
            public CacheScope scope { get; set; }
        }

        private readonly Dictionary<ScopedName, object> _cache = new Dictionary<ScopedName,object>();
 
        public T Get<T>(string key, CacheScope scope = CacheScope.Site)
        {
            var inKey = new ScopedName {key = key, scope = scope};
            if (_cache.ContainsKey(inKey)) return (T) _cache[inKey];
            return default(T);
        }

        public void Set(string key, object value, CacheScope scope = CacheScope.Site)
        {
            var inKey = new ScopedName{key = key, scope = scope};
            _cache[inKey] = value;
        }
    }
}
