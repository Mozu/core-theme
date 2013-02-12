using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using NSubstitute;
using NUnit.Framework;
using Should;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class CmsPublishingControllerTests
    {
        private IDocumentWebApiClient _documentClient;
        CmsPublishingController _testedController;
        private readonly DC.PagedCollection<DC.Document> _mocks = new DC.PagedCollection<DC.Document>
        {
            Items = new List<DC.Document> {
                new DC.Document {
                    Id = "12345",
                    Name = "Test Document 1"
                },
                new DC.Document {
                    Id = "56789",
                    Name = "Test Document 2"
                }
            }
        };

        [SetUp]
        public void SetUp()
        {
            _documentClient = Substitute.For<IDocumentWebApiClient>();
            _testedController = new CmsPublishingController(_documentClient);

            // set up Get mock.
            _documentClient.Get(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>()).Returns(
                x => {
                    string documentId = (string)x[1];
                    DC.Document doc = _mocks.Items.First(d => d.Id == documentId);
                    return new TestResponse<DC.Document>(doc).Task;
                }
            );
            
            // set up GetDrafts mock.
            _documentClient.GetDrafts(Arg.Any<string>(), Arg.Any<String>(), Arg.Any<int?>(), Arg.Any<int?>()).Returns(
                x => new TestResponse<DC.PagedCollection<DC.Document>>(_mocks).Task
            );
        }

        [Test]
        public void Get_list_with_an_id_should_give_one_record_back()
        {
            var pagingParams = new PagingParamaters { id = _mocks.Items.Last().Id };
            var extFilter = new FilterCollection();
            Response<List<Document>> response = _testedController.ListDirtyDocuments(pagingParams, extFilter).Result;

            response.Items.Count.ShouldEqual(1);
            response.Items[0].Id.ShouldEqual(pagingParams.id);
        }

        [Test]
        public void Get_should_give_us_the_whole_list_back()
        {
            var pagingParams = new PagingParamaters();
            var extFilter = new FilterCollection();
            Response<List<Document>> response = _testedController.ListDirtyDocuments(pagingParams, extFilter).Result;

            response.Items.Count.ShouldEqual(_mocks.Items.Count);
            response.Items[0].Id.ShouldEqual(_mocks.Items[0].Id);
            response.Items[0].Name.ShouldEqual(_mocks.Items[0].Name);
        }

        // TODO: some more testing
    }
}