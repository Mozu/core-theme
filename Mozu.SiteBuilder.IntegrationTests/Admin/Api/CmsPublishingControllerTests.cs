//using System;
//using System.Collections.Generic;
//using System.Linq;
//using AutoMapper;
//using Mozu.Content.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc.Models.CMS;
//using Mozu.SiteBuilder.UX.Admin.Api;
//using Mozu.SiteBuilder.UX.Admin.Api.Models;
//using Mozu.SiteBuilder.UX.Admin.MockServices;
//using Mozu.SiteBuilder.UX.Models.Admin.CMS;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using DC = Mozu.Content.Contracts;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
//{
//    [TestFixture]
//    public class CmsPublishingControllerTests
//    {
//        private IDocumentListWebApiClient _documentClient;
//        CmsPublishingController _testedController;
//        private readonly DC.DocumentDraftSummaryPagedCollection  _mocks = new DC.DocumentDraftSummaryPagedCollection()
//        {

//            Items = new List<DC.DocumentDraftSummary > {
//                new DC.DocumentDraftSummary {
//                    Id = Guid.NewGuid(),
//                    Name = "Test Document 1",
//                    ListFQN = "Pages1"

//                },
//                new DC.DocumentDraftSummary {
//                    Id = Guid.NewGuid(),
//                    Name = "Test Document 2",
//                    ListFQN = "Pages2"
//                }
//            }
//        };

//        [SetUp]
//        public void SetUp()
//        {
//            _documentClient = Substitute.For<IMoreAwesomeDocumentWebApiClient>();
//            _testedController = new CmsPublishingController((IMoreAwesomeDocumentWebApiClient)_documentClient);

//            // set up GetDrafts mock.
//            _documentClient.GetDrafts().Returns(
//                args => new TestResponse<DC.DocumentDraftSummaryPagedCollection >(_mocks).Task
//            );

//            // set up PublishDocuments mock.
//            _documentClient.PublishDocuments(Arg.Any<string>(), Arg.Any<List<string>>()).Returns(
//                args => new TestResponse<List<string>>((List<string>)args[1]).Task
//            );

//            // set up Discard mock.
//            _documentClient.Discard(Arg.Any<string>(), Arg.Any<List<string>>()).Returns(
//                args => new TestResponse<List<string>>((List<string>)args[1]).Task
//            );
//        }

//        [Test]
//        public void Get_list_with_an_id_should_fail()
//        {
//            var pagingParams = new PagingParamaters { id = _mocks.Items.Last().Id.ToString( ) };
//            var extFilter = new FilterCollection();
//            Response<List<DocumentDraft>> response = _testedController.ListDirtyDocuments(pagingParams, extFilter).Result;

//            response.Success.ShouldBeFalse();
//        }

//        [Test]
//        public void Get_should_give_us_the_whole_list_back()
//        {
//            var pagingParams = new PagingParamaters();
//            var extFilter = new FilterCollection();
//            Response<List<DocumentDraft>> response = _testedController.ListDirtyDocuments(pagingParams, extFilter).Result;

//            response.Items.Count.ShouldEqual(_mocks.Items.Count);
//            response.Items[0].Id.ShouldEqual(_mocks.Items[0].Id.ToString( ));
//            response.Items[0].Name.ShouldEqual(_mocks.Items[0].Name);
//        }

//        [Test]
//        public void Publish_item_should_work()
//        {
//            DocumentDraft d = Mapper.Map<DocumentDraft>(_mocks.Items[0]);

//            List<DocumentDraft> itemlist = new List<DocumentDraft> { d };

//            var response = _testedController.Publish(itemlist).Result;
//            _documentClient.Received(1).PublishDocuments(d.ListFQN, Arg.Is<List<string>>(arg => arg.Count == 1 && arg[0] == d.Id));

//            response.Success.ShouldBeTrue();
//            response.Items[0].ShouldEqual(d.Id);
//        }

//        [Test]
//        public void Publish_all_should_work()
//        {
//            var emptyArgs = new PublishArgs();
//            var response = _testedController.PublishAll(emptyArgs).Result;

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(_mocks.Items.Count);
//        }

//        [Test]
//        public void Discard_item_should_work()
//        {
//            DocumentDraft d = Mapper.Map<DocumentDraft>(_mocks.Items[0]);

//            List<DocumentDraft> itemlist = new List<DocumentDraft> { d };

//            var response = _testedController.Discard(itemlist).Result;

//            _documentClient.Received(1).Discard(d.ListFQN, Arg.Is<List<string>>(arg => arg.Count == 1 && arg[0] == d.Id));

//            response.Success.ShouldBeTrue();
//            response.Items[0].ShouldEqual(d.Id);
//        }

//        [Test]
//        public void Discard_all_should_work()
//        {
//            var emptyArgs = new PublishArgs();
//            var response = _testedController.DiscardAll(emptyArgs).Result;

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(_mocks.Items.Count);
//        }
//        // TODO: some more testing
//    }
//}

