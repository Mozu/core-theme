// -----------------------------------------------------------------------
// <copyright file="ComplexEmptyTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FSharpx.Collections;
using Microsoft.AspNetCore.Http;
using Microsoft.FSharp.Collections;
using Microsoft.FSharp.Control;
using Microsoft.FSharp.Core;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango;
using NDjango.Interfaces;
using NDjango.Misc;
using NDjango.FiltersCS.Compatibility;
using System.Threading;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.Mvc.Tags
{

    [Name("partial_cache")]
    public class OutputCachingTag : ITag
    {
        private static readonly string[] g_keywords = { "as", "with", "as_param", "as_parameter", "and" };
        private const string partial_output_cache_stack_limit = "partial_output_cache_stack_limit";

        private string[] _keywords = g_keywords;
        public FSharpList<INodeImpl> InnerNodes { get; set; }

        public string[] KeyWords
        {
            get { return _keywords; }
            set { _keywords = value; }
        }


        protected virtual ArgumentCollection.ParseStrategy ArguemntParserStrategy { get; set; }

        public Tuple<INodeImpl, IParsingContext, FSharpx.Collections.LazyList<Lexer.Token>>
            Perform(
            Lexer.BlockToken blockToken,
            IParsingContext parsingContext,
            FSharpx.Collections.LazyList<Lexer.Token> tokenList)
        {
            Tuple<FSharpList<INodeImpl>, FSharpx.Collections.LazyList<Lexer.Token>> parsedData = ((IParser)parsingContext.Provider).Parse(new FSharpOption<Lexer.BlockToken>(blockToken), tokenList, parsingContext.WithClosures(new FSharpList<string>("endpartial_cache", FSharpList<string>.Empty)));
            InnerNodes = parsedData.Item1;

            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, parsedData.Item1, this);
            var resp = new Tuple<INodeImpl, IParsingContext, FSharpx.Collections.LazyList<Lexer.Token>>(nodeImpl, parsingContext, parsedData.Item2);
            return resp;
        }


        public virtual bool is_header_tag { get; set; }


        protected virtual FSharpList<WalkResult> Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk(templateManager, walker);
        }

        private class TagNodeImpl : ParserNodes.TagNode, IHyprNode, INodeImplAsync
        {

            private readonly Lexer.BlockToken _blockToken;
            private readonly IParsingContext _parsingContext;
            private readonly FSharpList<INodeImpl> _childNodes;

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, OutputCachingTag tag)
                : base(parsingContext, blockToken, tag)
            {
                _blockToken = blockToken;
                _parsingContext = parsingContext;
                _childNodes = FSharpList<INodeImpl>.Empty;
            }

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, FSharpList<INodeImpl> nodes, OutputCachingTag outputCachingTag)
                : base(parsingContext, blockToken, outputCachingTag)
            {
                _parsingContext = parsingContext;
                _blockToken = blockToken;
                _childNodes = nodes;
            }

            public OutputCachingTag TagBase
            {
                get { return (OutputCachingTag)Tag; }
            }

            FSharpList<WalkResult> IHyprNode.Walk(ITemplateManager templateManager, Walker walker)
            {
                var res = FSharpAsync.RunSynchronously(asyncWalk(templateManager, walker), FSharpOption<int>.None, FSharpOption<CancellationToken>.None);
                return res;
            }
            public override FSharpList<WalkResult> walk(ITemplateManager templateManager, Walker walker)
            {
                var res = FSharpAsync.RunSynchronously(asyncWalk(templateManager, walker), FSharpOption<int>.None, FSharpOption<CancellationToken>.None);
                return res;
            }
            public override FSharpList<INode> elements => base.elements;
            public override FSharpList<INodeImpl> nodelist => base.nodelist;
            public override FSharpMap<string, IEnumerable<INode>> Nodes => base.Nodes;
            public override NodeType node_type => base.node_type;

            public FSharpAsync<FSharpList<WalkResult>> asyncWalk(ITemplateManager manager, Walker walker)
            {
                return FSharpAsync.AwaitTask(AsyncWalkInternal(manager, walker));
            }

            public async Task<FSharpList<WalkResult>> AsyncWalkInternal(ITemplateManager manager, Walker walker)
            {

                var apiCtx = walker.context.Resolve<ISiteBuilderApiContext>();
                var siteCtx = walker.context.Resolve<SiteContext>();
                var pageCtx = walker.context.Resolve<PageContext>();
                
                var arguments = ProcessArguments(walker);
                if (TagBase.ArguemntParserStrategy != null)
                {
                    arguments = TagBase.ArguemntParserStrategy(arguments);
                }

                int configDuration;
                var settings = walker.context.Resolve<ISettings>();
                if (!int.TryParse(settings.AppSettings("partial_caching_default_duration"), out configDuration))
                {
                    configDuration = 0;
                }

                var duration = arguments.GetValueOrDefault("duration", configDuration);
                if (duration == 0)
                {
                    return Uncached(walker);
                }

                bool disabled = IsDisabled(arguments, pageCtx, siteCtx ); 




                object epc = siteCtx.ThemeSettings["enablePartialCaching"];
                if (!Convert.ToBoolean(epc) || disabled)
                {
                    return Uncached(walker);
                }


                var viewPath = _blockToken.Location.TemplateName;
                var loc = _blockToken.Location.Offset;
                var key = string.Format("{0}{1}{2}{3}{4}{5}{6}{7}", string.Join("|", arguments.Where(x => x.Value != null).Select(x => x.Value)), apiCtx.SiteId, siteCtx.HashString, viewPath, loc, (pageCtx.IsSecure ? "1" : "0"), apiCtx.PriceListCode, apiCtx.CurrencyCodeOverride);
                var cachescope = GetCacheScope(apiCtx.MostSpecificContext);

                var output = await AsyncTryGetOutputStrings(manager, walker, key, cachescope, settings);

                if (output.Length == 1)
                {
                    return StringWalker(output[0]);
                }
                else
                {
                    return ChildNodeWalker(output);
                }
            }



            private bool IsDisabled(ArgumentCollection arguments, PageContext pageCtx, SiteContext siteCtx)
            {


                var disabledObj = arguments.FirstOrDefault(x => x.Name == "disabled");

                if (disabledObj != null)
                {
                    var value = disabledObj.Value;
                    if (value == null)
                    {
                        return true;
                    }
                    if (value is int && ((int)value) == 0)
                    {
                        return true;
                    }
                    if (value is double && ((double)value) == 0)
                    {
                        return true;
                    }
                    if (value is decimal && ((decimal)value) == 0)
                    {
                        return true;
                    }
                    if (value is string && (string.IsNullOrWhiteSpace((string)value)))
                    {
                        return true;
                    }
                    if (!(value is string) && value is System.Collections.IList && ((System.Collections.IList)value).Count == 0)
                    {
                        return true;
                    }
                }
                else
                {

                    //work around for peops using just page paras for faceting...
                    return arguments.Any(x =>
                    {
                        var sp = x.Value as SortingParameters;
                        if (sp != null && (!string.IsNullOrWhiteSpace(sp.Sort) && sp.Sort != (siteCtx.ThemeSettings["defaultSort"] ?? "").ToString()))
                        {
                            return true;
                        }//siteContext.ThemeSettings["defaultPageSize"]
                        var pp = x.Value as PagingParameters;
                        if (pp != null && (pp.StartIndex.GetValueOrDefault(0) > 0 || (pp.PageSize.HasValue && pp.StartIndex.GetValueOrDefault(0).ToString() != (siteCtx.ThemeSettings["defaultPageSize"] ?? "").ToString())))
                        {
                            return true;
                        }
                        if (pageCtx.Search.Facets.Count > 0)
                        {
                            return true;
                        }
                        if (!string.IsNullOrEmpty(pageCtx.Search.Query))
                        {
                            return true;
                        }
                        var segments = x.Value as List<string>;
                        return segments != null && pageCtx.User?.Segments != null && segments.Count > 0 && segments.SequenceEqual(pageCtx.User.Segments);
                    });

                }
                return false;


            }

            private async Task<string[]> AsyncTryGetOutputStrings(ITemplateManager manager, Walker walker, string key, CacheScope cachescope, ISettings settings)
            {
                var cache = walker.context.Resolve<ILiveModeOnlyCache>();
                var output = cache.Get<string[]>(key, cachescope, StorefrontCacheTypes.PartialOutput);
                if (output != null) return output;
                output = await AsyncTryRender(manager, walker, key, settings);
                cache.Set(key, output, cachescope, StorefrontCacheTypes.PartialOutput);
                return output;
            }

            private async Task<string[]> AsyncTryRender(ITemplateManager manager, Walker walker, string key, ISettings settings)
            {
                var context = walker.context.Resolve<HttpContext>();
                object callCount = 0;
                if (context != null)
                {
                    if (!context.Items.TryGetValue(partial_output_cache_stack_limit, out callCount))
                    {
                        callCount = 0;
                    }

                    callCount = 1 + (int)callCount;
                    context.Items[partial_output_cache_stack_limit] = callCount;
                }

                if ((int)callCount > 1)
                {
                    if (!int.TryParse(settings.AppSettings(partial_output_cache_stack_limit), out var maxStackCount))
                    {
                        maxStackCount = 100;
                    }
                    if ((int)callCount > maxStackCount)
                    {
                        throw new RenderingException("recursive cache detected", Token,
                            new FSharpOption<Exception>(new StackOverflowException(key)));
                    }
                }

                var innerWalker = new Walker(null, _childNodes, string.Empty, 0, walker.context);
                var renderer = new TemplateRenderer(manager, innerWalker);
                var output = await AsyncRender(renderer);

                if (context == null) return output;

                callCount = (int)callCount - 1;
                context.Items[partial_output_cache_stack_limit] = callCount;

                return output;
            }

            private FSharpList<WalkResult> ChildNodeWalker(string[] output)
            {
                var walkerNodes = output.Select(x => (INodeImpl)new CachedNode { Token = Token, Buffer = x }).ToFSharpList();
                return WalkResultHelpers.Nodes(walkerNodes).ToFSharpList();
            }

            private static FSharpList<WalkResult> StringWalker(string output)
            {
                return WalkResultHelpers.Buffer(output).ToFSharpList();
            }

            private FSharpList<WalkResult> Uncached(Walker parent)
            {
                return WalkResultHelpers.Nodes(_childNodes).ToFSharpList();
            }

            private static async Task<string[]> AsyncRender(TemplateRenderer renderer)
            {
                var sb = StringBuilderPool.Default.Get();
                var sw = new StringWriter(sb);
                await renderer.AsyncRender(sw);
                await sw.FlushAsync();
                string[] output;
                if (sb.Length > CharBufferPool.Default.MaxBufferSize)
                {
                    var strings = SplitBuilderIntoBufferredStrings(sb);
                    output = strings.ToArray();
                }
                else
                {
                    output = new[] { sb.ToString() };
                }
                StringBuilderPool.Default.Put(sb);
                return output;
            }

            private static List<string> SplitBuilderIntoBufferredStrings(StringBuilder sb)
            {
                var strings = new List<string>();
                foreach (var c in sb.GetChunks())
                {
                    strings.Add(c.ToString());
                }
                return strings;

                //var charBuff = CharBufferPool.Default.Get();

                //for (int i = 0; i < sb.Length; i = i + charBuff.Length)
                //{
                //    var l = Math.Min(sb.Length - i, charBuff.Length);
                //    sb.CopyTo(i, charBuff, 0, l);
                //    strings.Add(new string(charBuff, 0, l));
                //}
                //CharBufferPool.Default.Put(charBuff);
                //return strings;
            }

            private static CacheScope GetCacheScope(ContextLevelType mostSpecificContext)
            {
                switch (mostSpecificContext)
                {
                    case ContextLevelType.Tenant:
                        return CacheScope.Tenant;
                    case ContextLevelType.Catalog:
                    case ContextLevelType.MasterCatalog:
                        return CacheScope.Catalog;
                    case ContextLevelType.NotSpecified:
                    case ContextLevelType.Site:
                    default:
                        return CacheScope.Site;
                }
            }


            class CachedNode : INodeImpl
            {

                public Lexer.Token Token
                {
                    get; set;
                }
                public string Buffer { get; set; }
                public FSharpList<WalkResult> walk(ITemplateManager manager, Walker walker)
                {
                    return WalkResultHelpers.Buffer(Buffer).ToFSharpList();
                }
            }

            //TODO: figure out why this tag is reimplementing SimpleTagBase
            static readonly string[] EmptyStringArray = new string[0];
            private ArgumentCollection ProcessArguments(Walker walker)
            {
                var arguments = new ArgumentCollection();
                var kwords = ((OutputCachingTag)Tag).KeyWords ?? EmptyStringArray;
                arguments.AddRange(_blockToken.Args.Select(arg => TagHandling.GenerateTagArgument(walker, _parsingContext, arg, kwords)));
                return arguments;
            }
        }
    }
}