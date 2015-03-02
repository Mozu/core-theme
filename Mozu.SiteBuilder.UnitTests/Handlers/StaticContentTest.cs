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


namespace Mozu.SiteBuilder.UnitTests.Handlers
{
    [TestFixture]
    [Category("StaticContent")]
    class StaticContentTests: UnitTestsFor<ResourceController>
    {
        string staticContentPath;
        string devcenterpath;
        string file;

        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            devcenterpath = System.IO.Path.GetTempPath() + "bar/baz/";
            staticContentPath = devcenterpath + "../../staticContent/";
            file = "file.html";
            System.IO.Directory.CreateDirectory(devcenterpath);
            System.IO.Directory.CreateDirectory(staticContentPath);

            if (!System.IO.File.Exists(staticContentPath + file))
            {
                System.IO.File.Create(staticContentPath + file).Close();
            }

        }

        [TestFixtureTearDown]
        public void Kill()
        {
            System.IO.File.Delete(file);
            System.IO.Directory.Delete(staticContentPath, true);
        }

       
        [Test, TestCaseSource("GetCases")]
        public async Task TestRunner(string path, HttpStatusCode expected)
        {
            // Arrange
            var settings = MockContainer.ResolveAndSubstituteFor<ISettings>();
            settings.AppSettings("DevPackageFileShare").Returns(devcenterpath);
            
            //Act
            InitObjectUnderTest();
            ObjectUnderTest.Request = HttpRequestMessageHelpers.CreateFromContainer(MockContainer.Container);

            //Assert
          
            var response = await ObjectUnderTest.StaticContentShare(path);
            response.StatusCode.ShouldEqual(expected);
        }

        private IEnumerable<object[]> GetCases()
        {
            yield return new object []{"notafile.jpg", HttpStatusCode.NotFound};
            yield return new object[]{ "../../notafile.jpg", HttpStatusCode.NotFound};
            yield return new object []{"file.html", HttpStatusCode.OK};
        }
    
        
    }
}
