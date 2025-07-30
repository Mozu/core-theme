using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Logging;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Hypr.Tags;
using NDjango.Interfaces;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Tags
{
    [TestFixture]
    public class InlineStyleTests
    {
        private InlineStyle _inlineStyle;
        private IContext _mockContext;
        private IStorefrontCache _mockCache;
        private IPageContext _mockPageContext;
        private ILogger<InlineStyle> _mockLogger;
        private ArgumentCollection _mockArguments;
        private HyprViewContext _mockViewContext;
        private IServiceProvider _mockLifetimeScope;

        [SetUp]
        public void Setup()
        {
            _inlineStyle = new InlineStyle();
            _mockContext = Substitute.For<IContext>();
            _mockCache = Substitute.For<IStorefrontCache>();
            _mockPageContext = Substitute.For<IPageContext>();
            _mockLogger = Substitute.For<ILogger<InlineStyle>>();
            _mockArguments = new ArgumentCollection();
            _mockLifetimeScope = Substitute.For<IServiceProvider>();

            // Setup default returns for mocks
            _mockPageContext.CdnCacheBustKey.Returns("test-cache-key");
            
            // Create a real HyprViewContext with real dependencies
            var mockHttpContext = Substitute.For<HttpContext>();
            var modelMetadataProvider = new EmptyModelMetadataProvider();
            var modelStateDictionary = new ModelStateDictionary();
            var viewData = new ViewDataDictionary(modelMetadataProvider, modelStateDictionary);
            _mockViewContext = new HyprViewContext(mockHttpContext, viewData);
            _mockViewContext.LifetimeScope = _mockLifetimeScope;
            
            // Setup the dependency chain for IContext.Resolve()
            // IContext.tryfind("_vc") should return the HyprViewContext
            var viewContextOption = FSharpOption<object>.Some(_mockViewContext);
            _mockContext.tryfind("_vc").Returns(viewContextOption);
            
            // Setup the service provider to resolve our dependencies
            _mockLifetimeScope.GetService(typeof(IStorefrontCache)).Returns(_mockCache);
            _mockLifetimeScope.GetService(typeof(IPageContext)).Returns(_mockPageContext);
            _mockLifetimeScope.GetService(typeof(ILogger<InlineStyle>)).Returns(_mockLogger);
        }

        [Test]
        public void GenerateCacheKey_WithValidPathAndPageContext_ReturnsFormattedKey()
        {
            // Arrange
            var path = "styles/main.css";
            var cacheBustKey = "v123";
            _mockPageContext.CdnCacheBustKey.Returns(cacheBustKey);

            // Use reflection to call the private static method
            var method = typeof(InlineStyle).GetMethod("GenerateCacheKey", 
                BindingFlags.NonPublic | BindingFlags.Static);

            // Act
            var cacheKey = (string)method.Invoke(null, new object[] { path, _mockPageContext });

            // Assert
            Assert.AreEqual($"InlineStyle_CSS_{path}_{cacheBustKey}", cacheKey);
        }

        [Test]
        public void ProcessTag_WithValidPath_CallsCacheGet()
        {
            // Arrange
            var cssPath = "styles/test.css";
            var expectedCss = "body { margin: 0; }";
            
            var tagArgument = new TagArgument { Value = cssPath };
            _mockArguments.Add(tagArgument);
            
            _mockCache.Get<string>(Arg.Any<string>(), Arg.Any<CacheScope>(), Arg.Any<StorefrontCacheTypes>())
                     .Returns(expectedCss);

            // Use reflection to call the protected method
            var method = typeof(InlineStyle).GetMethod("ProcessTag", 
                BindingFlags.NonPublic | BindingFlags.Instance);

            // Act
            var result = (IEnumerable<WalkResult>)method.Invoke(_inlineStyle, 
                new object[] { _mockArguments, _mockContext, null });

            // Assert
            Assert.IsNotNull(result);
            var resultArray = result as WalkResult[] ?? System.Linq.Enumerable.ToArray(result);
            Assert.AreEqual(1, resultArray.Length);
            
            // Verify cache was checked
            _mockCache.Received(1).Get<string>(
                Arg.Is<string>(s => s.StartsWith("InlineStyle_CSS_")), 
                CacheScope.Global, 
                StorefrontCacheTypes.CatalogIndependent);
        }

        [Test]
        public void ProcessTag_CacheHit_LogsInformation()
        {
            // Arrange
            var cssPath = "styles/test.css";
            var cachedCss = "/* cached css */";
            
            var tagArgument = new TagArgument { Value = cssPath };
            _mockArguments.Add(tagArgument);
            
            _mockCache.Get<string>(Arg.Any<string>(), Arg.Any<CacheScope>(), Arg.Any<StorefrontCacheTypes>())
                     .Returns(cachedCss);

            // Use reflection to call the protected method
            var method = typeof(InlineStyle).GetMethod("ProcessTag", 
                BindingFlags.NonPublic | BindingFlags.Instance);

            // Act
            method.Invoke(_inlineStyle, new object[] { _mockArguments, _mockContext, null });

            // Assert
            _mockLogger.Received(1).LogInformation($"InlineStyle cache HIT for path: {cssPath}");
        }

        [Test]
        public void ProcessTag_WithException_ReturnsErrorComment()
        {
            // Arrange
            var cssPath = "invalid/path.css";
            
            var tagArgument = new TagArgument { Value = cssPath };
            _mockArguments.Add(tagArgument);
            
            // Make the cache.Get throw an exception to simulate a real error scenario
            _mockCache.When(x => x.Get<string>(Arg.Any<string>(), Arg.Any<CacheScope>(), Arg.Any<StorefrontCacheTypes>()))
                     .Do(x => { throw new Exception("Test exception"); });

            // Use reflection to call the protected method
            var method = typeof(InlineStyle).GetMethod("ProcessTag", 
                BindingFlags.NonPublic | BindingFlags.Instance);

            // Act
            var result = (IEnumerable<WalkResult>)method.Invoke(_inlineStyle, 
                new object[] { _mockArguments, _mockContext, null });

            // Assert
            Assert.IsNotNull(result);
            var resultArray = result as WalkResult[] ?? System.Linq.Enumerable.ToArray(result);
            Assert.AreEqual(1, resultArray.Length);
            // The result should contain an error comment
            Assert.IsTrue(resultArray[0].ToString().Contains("error rendering stylesheet"));
        }

        [Test]
        public void ProcessTag_WithNullArgument_HandlesGracefully()
        {
            // Arrange
            var tagArgument = new TagArgument { Value = null };
            _mockArguments.Add(tagArgument);

            // Use reflection to call the protected method
            var method = typeof(InlineStyle).GetMethod("ProcessTag", 
                BindingFlags.NonPublic | BindingFlags.Instance);

            // Act
            var result = (IEnumerable<WalkResult>)method.Invoke(_inlineStyle, 
                new object[] { _mockArguments, _mockContext, null });

            // Assert
            Assert.IsNotNull(result);
            var resultArray = result as WalkResult[] ?? System.Linq.Enumerable.ToArray(result);
            Assert.AreEqual(1, resultArray.Length);
        }

        [Test]
        public void ProcessTag_WithValidCacheBustKey_IncludesInCacheKey()
        {
            // Arrange
            var cssPath = "styles/test.css";
            var cacheBustKey = "v2.0.1";
            var expectedCacheKey = $"InlineStyle_CSS_{cssPath}_{cacheBustKey}";
            
            _mockPageContext.CdnCacheBustKey.Returns(cacheBustKey);
            
            var tagArgument = new TagArgument { Value = cssPath };
            _mockArguments.Add(tagArgument);
            
            _mockCache.Get<string>(Arg.Any<string>(), Arg.Any<CacheScope>(), Arg.Any<StorefrontCacheTypes>())
                     .Returns("/* cached css */");

            // Use reflection to call the protected method
            var method = typeof(InlineStyle).GetMethod("ProcessTag", 
                BindingFlags.NonPublic | BindingFlags.Instance);

            // Act
            method.Invoke(_inlineStyle, new object[] { _mockArguments, _mockContext, null });

            // Assert
            _mockCache.Received(1).Get<string>(
                expectedCacheKey,
                CacheScope.Global, 
                StorefrontCacheTypes.CatalogIndependent);
        }

        [Test]
        public void InlineStyleClass_InheritsFromSimpleTagBase()
        {
            // Arrange & Act
            var baseType = typeof(InlineStyle).BaseType;

            // Assert
            Assert.AreEqual(typeof(SimpleTagBase), baseType);
        }

        [Test]
        public void InlineStyleClass_HasCorrectNameAttribute()
        {
            // Arrange & Act
            var attributes = typeof(InlineStyle).GetCustomAttributes(false);
            var nameAttribute = attributes.FirstOrDefault(a => a.GetType().Name == "NameAttribute");

            // Assert
            Assert.IsNotNull(nameAttribute);
            // Note: We can verify the attribute exists but accessing its value would require 
            // reflection since NameAttribute is from NDjango and may not be directly accessible
        }
    }
}