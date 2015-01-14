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
using FSharpx.Collections;
using Microsoft.FSharp.Collections;
using Microsoft.FSharp.Core;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango;
using NDjango.Interfaces;
using NDjango.Misc;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [Name("partial_cache")]
    public class OutputCachingTag : ITag
    {
        private static readonly string[] g_keywords = {"as", "with", "as_param", "as_parameter", "and"};
        private const string partial_output_cache_stack_limit = "partial_output_cache_stack_limit";

        private string[] _keywords = g_keywords;
        public FSharpList<INodeImpl> InnerNodes { get; set; }

        public string[] KeyWords
        {
            get { return _keywords; }
            set { _keywords = value; }
        }


        protected virtual ArgumentCollection.ParseStrategy ArguemntParserStrategy { get; set; }

        public Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>>
            Perform(
            Lexer.BlockToken blockToken,
            IParsingContext parsingContext,
            LazyList<Lexer.Token> tokenList)
        {
            Tuple<FSharpList<INodeImpl>, LazyList<Lexer.Token>> parsedData = ((IParser) parsingContext.Provider).Parse(new FSharpOption<Lexer.BlockToken>(blockToken), tokenList, parsingContext.WithClosures(new FSharpList<string>("endpartial_cache", FSharpList<string>.Empty)));
            InnerNodes = parsedData.Item1;

            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, parsedData.Item1 , this);
            var resp = new Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>>(nodeImpl, parsingContext, parsedData.Item2);
            return resp;
        }

      
        public virtual bool is_header_tag { get; set; }


        protected virtual Walker Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk(templateManager, walker);
        }

        private class TagNodeImpl : ParserNodes.TagNode, IHyprNode
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
                get { return (OutputCachingTag) Tag; }
            }

            Walker IHyprNode.Walk(ITemplateManager templateManager, Walker walker)
            {
                return base.walk(templateManager, walker);
            }

            public override Walker walk(ITemplateManager manager, Walker walker)
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

                object epc = siteCtx.ThemeSettings["enablePartialCaching"];
                if (!Convert.ToBoolean(epc))
                {
                    return Uncached(walker);
                }


                var viewPath = _blockToken.Location.TemplateName;
                var loc = _blockToken.Location.Offset;
                var key = string.Format("{0}{1}{2}{3}{4}{5}", string.Join("|", arguments.Where(x => x.Value != null).Select(x => x.Value)), apiCtx.SiteId, siteCtx.HashString, viewPath, loc, (pageCtx.IsSecure ? "1" : "0"));
                var cachescope = GetCacheScope(apiCtx.MostSpecificContext);

                var output = TryGetOutputStrings(manager, walker, key, cachescope, settings);

                if (output.Length == 1)
                {
                    return StringWalker(walker, output[0]);
                }
                else
                {
                    return ChildNodeWalker(walker, output);
                }
            }

            private string[] TryGetOutputStrings(ITemplateManager manager, Walker walker, string key, CacheScope cachescope, ISettings settings)
            {
                var cache = walker.context.Resolve<ILiveModeOnlyCache>();
                var output = cache.Get<string[]>(key, cachescope);
                if (output != null) return output;
                output = TryRender(manager, walker, key, settings);
                cache.Set(key, output, cachescope);
                return output;
            }

            private string[] TryRender(ITemplateManager manager, Walker walker, string key, ISettings settings)
            {
                var req = walker.context.Resolve<HttpRequestMessage>();
                object callCount = 0;
                if (req != null)
                {
                    if (!req.Properties.TryGetValue(partial_output_cache_stack_limit, out callCount))
                    {
                        callCount = 0;
                    }

                    callCount = 1 + (int) callCount;
                    req.Properties[partial_output_cache_stack_limit] = callCount;
                }

                if ((int) callCount > 1)
                {
                    int maxStackCount;
                    if (!int.TryParse(settings.AppSettings(partial_output_cache_stack_limit), out maxStackCount))
                    {
                        maxStackCount = 100;
                    }
                    if ((int) callCount > maxStackCount)
                    {
                        throw new RenderingException("recursive cache detected", Token,
                            new FSharpOption<Exception>(new StackOverflowException(key)));
                    }
                }

                var innerWalker = new Walker(null, _childNodes, string.Empty, 0, walker.context);
                var renderer = new TemplateRenderer(manager, innerWalker);
                var output = Render(renderer);

                if (req != null)
                {
                    callCount = (int) callCount - 1;
                    req.Properties[partial_output_cache_stack_limit] = callCount;
                }
                return output;
            }

            private Walker ChildNodeWalker(Walker walker, string[] output)
            {
                var walkerNodes = output.Select(x => (INodeImpl) new CachedNode {Token = Token, Buffer = x}).ToFSharpList();
                return new Walker(new FSharpOption<Walker>(walker), walkerNodes, string.Empty, 0, walker.context);
            }

            private static Walker StringWalker(Walker walker, string output)
            {
                return new Walker(new FSharpOption<Walker>(walker), FSharpList<INodeImpl>.Empty, output, 0, walker.context);
            }

            private Walker Uncached(Walker parent)
            {
                return new Walker(new FSharpOption<Walker>(parent), _childNodes, string.Empty, 0, parent.context);
            }

            private static string[] Render(TemplateRenderer renderer)
            {
                var sb = StringBuilderPool.Default.Get();
                var sw = new StringWriter(sb);
                renderer.Render(sw);
                sw.Flush();
                string[] output;
                if (sb.Length > CharBufferPool.Default.MaxBufferSize)
                {
                    var strings = SplitBuilderIntoBufferredStrings(sb);
                    output =  strings.ToArray();
                }
                else
                {
                    output = new [] { sb.ToString() };
                }
                StringBuilderPool.Default.Put(sb);
                return output;
            }

            private static List<string> SplitBuilderIntoBufferredStrings(StringBuilder sb)
            {
                var charBuff = CharBufferPool.Default.Get();
                var strings = new List<string>();
                for (int i = 0; i < sb.Length; i = i + charBuff.Length)
                {
                    var l = Math.Min(sb.Length - i, charBuff.Length);
                    sb.CopyTo(i, charBuff, 0, l);
                    strings.Add(new string(charBuff, 0, l));
                }
                CharBufferPool.Default.Put(charBuff);
                return strings;
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
                public Walker walk(ITemplateManager manager, Walker walker)
                {
                    walker.buffer = Buffer;
                    return walker;
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