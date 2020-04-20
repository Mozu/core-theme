using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Hypr.Tags;
using NDjango.Interfaces;
using NSubstitute;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Test;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Tags
{
    [Category("Hypr")]
    [Ignore("test is not finished yet")]
    [TestFixture]
    public class IncludeDocumentTagTests : TemplateTestBase
    {
        [Test, TestCaseSource(nameof(GetTests))]
        public void Run(TestDescriptor desc)
        {
            RunTemplate(desc);
        }

        private static IEnumerable<TestDescriptor> GetTests()
        {
            yield return new TestDescriptor
            {
                Name = "can parse all params",
                Template = @"{% include_documents ""test"" with viewName=""blah"" pageWithUrl=true sortWithUrl=true startIndex=1 pageSize=20 query=""I am a query"" sortBy=""I am a sort by"" list=""default"" view=""testview"" ids=""1,2,3,4,5"" id=""10"" effectivityDated=true %}",
                Context = new Dictionary<string, object>(),
                ExpectedFunc = TestDescriptor.CompareLiteral(string.Empty) // empty string because a fetched script gets added to the render context
            };
        }
    }


    [TestFixture]
    public class IncludeEntitiesTagTests
    {

        [Test]
        public void Inlude_entites_parses_ids()
        {
            var lts = new AutoSubstitute();
            var tag = new IncludeEntitiesTag();
            var client = Substitute.For<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient>();
            var context = Substitute.For<IContext>();
            var sc = Substitute.For<ISiteContext>();
            var hvc = Substitute.For<HyprViewContext>(null, null, null);

            lts.Provide<ISiteContext>(sc);
            lts.Provide<Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient>(client);
            var ret = new Microsoft.FSharp.Core.FSharpOption<object>(hvc);
            context.tryfind("_vc").Returns(ret);
            hvc.LifetimeScope = lts.ServiceProvider;
            object obj;

            // lts.TryResolveService(Arg.Any<Service>(), out obj)

            var args = new ArgumentCollection
            {
                new TagArgument()
                {
                    Name = "viewName", ArgumentType = TagArgument.ArgumentTypes.NamedArgument, Value = "foo"
                },
                new TagArgument()
                {
                    Name = "ids",
                    ArgumentType = TagArgument.ArgumentTypes.NamedArgument,
                    Value = new string[] {"a", "b", "c"}
                }
            };
            try
            {
                //id eq "a" or id eq "b" or id eq "c"
                new IncludeEntitiesTagMock().Test(args, context);
            }
            catch
            {
                //await service.GetEntities(entityListFullName: list, filter: query, sortBy: sortBy, pageSize: pageSize, startIndex: startIndex).ConfigureAwait(false);
                client.Received().GetEntities(entityListFullName: null,
                    filter: @"id eq ""a"" or id eq ""b"" or id eq ""c""",
                    pageSize: 15,
                    startIndex: 0
                    );

            }

            args = new ArgumentCollection
            {
                new TagArgument()
                {
                    Name = "viewName", ArgumentType = TagArgument.ArgumentTypes.NamedArgument, Value = "foo"
                },
                new TagArgument()
                {
                    Name = "ids",
                    ArgumentType = TagArgument.ArgumentTypes.NamedArgument,
                    Value = new string[] {"a"}
                }
            };
            client.ClearReceivedCalls();
            try
            {
                //id eq "a" or id eq "b" or id eq "c"
                new IncludeEntitiesTagMock().Test(args, context);
            }
            catch
            {
                //await service.GetEntities(entityListFullName: list, filter: query, sortBy: sortBy, pageSize: pageSize, startIndex: startIndex).ConfigureAwait(false);
                client.Received().GetEntity(entityListFullName: null,
                    id: "a"
                    );

            }

        }

        public class IncludeEntitiesTagMock : IncludeEntitiesTag
        {
            public void Test(ArgumentCollection collection, IContext contexgt)
            {

                base.ProcessTagAsync(collection, contexgt, (x) => null).Wait();

                return;
            }
        }
    }
}
