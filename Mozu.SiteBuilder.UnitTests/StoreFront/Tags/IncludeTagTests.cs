using System;
using System.Collections.Generic;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Tags;
using NDjango.Interfaces;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Tags
{
    [TestFixture]
    public class IncludeTagTests
    {
        [Test]
        public void IncludeTag_RecursionTest()
        {
            var ff = new IncludeTag();
            var context = Substitute.For<IContext>();
            var templateName = "foo/bar.html";
            var additionalState = new Dictionary<string, object>();
            IncludeTag.RecursionTest(context, templateName, additionalState);
            Assert.IsTrue(additionalState.ContainsKey(nameof(IncludeTag.RecursionTest)));
        }
        
        [Test]
        public void RecursionTest_FirstTemplate_AddsToTracker()
        {
            // Arrange
            var context = Substitute.For<IContext>();
            context.Items.Returns(new List<Tuple<string, object>>());
            
            var additionalState = new Dictionary<string, object>();
            const string templateName = "template1.html";

            // Act
            IncludeTag.RecursionTest(context, templateName, additionalState);

            // Assert
            Assert.IsTrue(additionalState.ContainsKey(nameof(IncludeTag.RecursionTest)));
            var tracker = additionalState[nameof(IncludeTag.RecursionTest)] as HashSet<string>;
            Assert.IsNotNull(tracker);
            Assert.IsTrue(tracker.Contains(templateName));
            Assert.AreEqual(1, tracker.Count);
        }

        [Test]
        public void RecursionTest_NewTemplate_AddsToExistingTracker()
        {
            // Arrange
            var context = Substitute.For<IContext>();
            var existingTracker = new HashSet<string> { "previousTemplate.html" };
            var contextItems = new List<Tuple<string, object>> 
            { 
                new Tuple<string, object>(nameof(IncludeTag.RecursionTest), existingTracker) 
            };
            context.Items.Returns(contextItems);

            var additionalState = new Dictionary<string, object>();
            const string templateName = "template1.html";

            // Act
            IncludeTag.RecursionTest(context, templateName, additionalState);

            // Assert
            Assert.IsTrue(additionalState.ContainsKey(nameof(IncludeTag.RecursionTest)));
            var tracker = additionalState[nameof(IncludeTag.RecursionTest)] as HashSet<string>;
            Assert.IsNotNull(tracker);
            Assert.IsTrue(tracker.Contains(templateName));
            Assert.IsTrue(tracker.Contains("previousTemplate.html"));
            Assert.AreEqual(2, tracker.Count);
        }

        [Test]
        public void RecursionTest_RecursiveTemplate_ThrowsException()
        {
            // Arrange
            var context = Substitute.For<IContext>();
            const string recursiveTemplate = "recursive.html";
            var existingTracker = new HashSet<string> { "template1.html", recursiveTemplate };
            var contextItems = new List<Tuple<string, object>> 
            { 
                new Tuple<string, object>(nameof(IncludeTag.RecursionTest), existingTracker) 
            };
            context.Items.Returns(contextItems);

            var additionalState = new Dictionary<string, object>();

            // Act & Assert
            var ex = Assert.Throws<Exception>(() => 
                IncludeTag.RecursionTest(context, recursiveTemplate, additionalState));
            
            Assert.IsTrue(ex.Message.Contains("Infinite loop detected"));
            Assert.IsTrue(ex.Message.Contains(recursiveTemplate));
        }
    }
}
