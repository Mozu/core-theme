using System;
using NUnit.Framework;
using NSubstitute;
using Mozu.Core.Settings;
using Mozu.Core.Test;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UnitTests.Utils;
using FluentAssertions;
using Should;
using System.Net;
using System.Collections.Generic;
using Mozu.Core;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;


namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    [Category("StaticContent")]
    class StaticContentTests: UnitTestsFor<ResourceController>
    {
        string staticContentPath;
        string devcenterpath;
        string file;

        [OneTimeSetUp]
        public void FixtureSetup()
        {
            devcenterpath = System.IO.Path.GetTempPath();
            staticContentPath = devcenterpath + "/t-12345/";
            file = "file.html";
            System.IO.Directory.CreateDirectory(devcenterpath);
            System.IO.Directory.CreateDirectory(staticContentPath);

            if (!System.IO.File.Exists(staticContentPath + file))
            {
                System.IO.File.Create(staticContentPath + file).Close();
            }

        }

        [OneTimeTearDown]
        public void Kill()
        {
            System.IO.Directory.Delete(staticContentPath, true);
        }

       
        [Test, TestCaseSource("GetCases")]
        public async Task TestRunner(string path, HttpStatusCode expected, int tenandId)
        {
            // Arrange
            var settings = MockContainer.ResolveAndSubstituteFor<ISettings>();
            var apiContext = MockContainer.ResolveAndSubstituteFor<IApiContext>();
            settings.AppSettings("SiteBuilderStaticContent").Returns(devcenterpath);
            apiContext.TenantId.Returns(tenandId);
            
            //Act
            InitObjectUnderTest();
            ObjectUnderTest.ControllerContext = new ControllerContext
            {
                HttpContext = HttpContextHelpers.CreateFromContainer(MockContainer.Container)
            };

            //Assert  
            var response = ObjectUnderTest.StaticContentShare(path);
            if (expected == HttpStatusCode.NotFound)
            {
                Assert.True(response is NotFoundResult);
            }
            else
            {
                Assert.True(response is FileStreamResult);
                (response as FileStreamResult).FileStream.Dispose();
            }
        }

        private IEnumerable<object[]> GetCases()
        {
            yield return new object []{"notafile.jpg", HttpStatusCode.NotFound, 12345};
            yield return new object[]{ "../../notafile.jpg", HttpStatusCode.NotFound, 12345};
            yield return new object[] { "file.html", HttpStatusCode.OK, 12345 };
            yield return new object[] { "file.html", HttpStatusCode.NotFound, 23456};
        }
    
        
    }
}
