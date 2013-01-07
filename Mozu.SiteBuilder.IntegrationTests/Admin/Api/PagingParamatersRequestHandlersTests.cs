using System;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;
using NSubstitute;
using NUnit.Framework;
using Should;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    public class PagingParamatersRequestHandlersTests
    {
        [Test]
        public void PagingParameters_should_have_sensible_defaults()
        {
            var handler = new PagingParamatersRequestHandlers();
            var message = new HttpRequestMessage { RequestUri = new Uri("http://localhost:8080") };

            var pagingParameters = handler.BuildPagingParameters(message.RequestUri);

            pagingParameters.pageIndex.ShouldEqual(1);
            pagingParameters.pageSize.ShouldEqual(25);
            pagingParameters.startIndex.ShouldEqual(0);
        }

        [Test]
        public void PagingParameters_should_assign_QueryString_values()
        {
            var handler = new PagingParamatersRequestHandlers();
            var qs = "?id=234&productCode=abc&page=2&start=3&limit=4&sort=[{ \"property\": \"name\", \"direction\": \"DESC\" }]";
            var message = new HttpRequestMessage { RequestUri = new Uri("http://localhost:8080" + qs) };

            var pagingParameters = handler.BuildPagingParameters(message.RequestUri);

            pagingParameters.id.ShouldEqual("234");
            pagingParameters.productCode.ShouldEqual("abc");
            pagingParameters.pageIndex.ShouldEqual(2);
            pagingParameters.pageSize.ShouldEqual(4);
            pagingParameters.startIndex.ShouldEqual(3);
            pagingParameters.sort[0].property.ShouldEqual("name");
            pagingParameters.sort[0].direction.ShouldEqual("DESC");
        }
    }
}