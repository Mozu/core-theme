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
using System.Runtime.Caching;
using FSharpx.Collections;
using Magnum.Extensions;
using Microsoft.FSharp.Collections;
using Microsoft.FSharp.Core;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango;
using NDjango.Interfaces;
using NDjango.Misc;
using Newtonsoft.Json.Linq;

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
            
            private static readonly string[] g_emptyStringArray = new string[0];
            private readonly Lexer.BlockToken BlockToken;
            private readonly IParsingContext ParsingContext;
        
            private FSharpList<INodeImpl> _childNodes;
            private OutputCachingTag outputCachingTag;

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, OutputCachingTag tag)
                : base(parsingContext, blockToken, tag)
            {
                BlockToken = blockToken;
                ParsingContext = parsingContext;
            }

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, FSharpList<INodeImpl> fSharpList, OutputCachingTag outputCachingTag)
                : base(parsingContext, blockToken, outputCachingTag)
            {
                // TODO: Complete member initialization
                this.ParsingContext = parsingContext;
                this.BlockToken = blockToken;
                this._childNodes = fSharpList;
                this.outputCachingTag = outputCachingTag;
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
                var sc = walker.context.Resolve<SiteContext>();
                
                var pc = walker.context.Resolve<PageContext>();

                object epc = sc.ThemeSettings["enablePartialCaching"];
                if (pc.IsEditMode || apiCtx.DataViewMode == DataViewModeType.Pending || !Convert.ToBoolean(epc))
                {
                    var parent = new FSharpOption<Walker>(walker);
                    return new Walker(parent, _childNodes, string.Empty, 0, walker.context);
                }

                

                ArgumentCollection arguments = ProcessArguments(walker);
                if (TagBase.ArguemntParserStrategy != null)
                {
                    arguments = TagBase.ArguemntParserStrategy(arguments);
                }
                int configDuration = 0;
                var settings = walker.context.Resolve<ISettings>();
                if (!int.TryParse(settings.AppSettings("partial_caching_default_duration"), out configDuration))
                {
                    configDuration = 0;
                }


                var duration = arguments.GetValueOrDefault("duration", configDuration);

                if (duration == 0)
                {
                    var parent = new FSharpOption<Walker>(walker);
                    return new Walker(parent, _childNodes, string.Empty, 0, walker.context);
                }

                string viewPath = BlockToken.Location.TemplateName;
                int loc = BlockToken.Location.Offset;



                string key = string.Join("|", arguments.Where(x => x.Value != null).Select(x => x.Value)) + apiCtx.SiteId + sc.HashString + viewPath + loc + (pc.IsSecure ?"1":"0");
                var output = MemoryCache.Default[key] as string[];
                
                if (output == null)
                {
                    var innerWalker = new Walker(null, _childNodes, string.Empty, 0, walker.context);

                    var renderer = new TemplateRenderer(manager, innerWalker);
                    var sb = StringBuilderPool.Default.Get();

                    var req = walker.context.Resolve<HttpRequestMessage>();
                    object callCount = 0;
                    if (req != null )
                    {
                        if (!req.Properties.TryGetValue(partial_output_cache_stack_limit, out callCount))
                        {
                            callCount = 0;
                        }

                        callCount = 1 + (int) callCount;
                        req.Properties[partial_output_cache_stack_limit] = callCount;
                    }

                    if ((int)callCount > 1 )
                    {
                        int maxStackCount = 100;
                        if (!int.TryParse(settings.AppSettings(partial_output_cache_stack_limit), out maxStackCount))
                        {
                            maxStackCount = 100;
                        }
                        if ((int) callCount > maxStackCount)
                        {
                            throw new RenderingException("recursive cache detected", this.Token, new FSharpOption<Exception>(new StackOverflowException(key)));
                        }
                        
                    }

                    var sw = new StringWriter(sb);
                    renderer.Render(sw);
                    sw.Flush();

                    if (req != null)
                    {
                        callCount = (int) callCount - 1;
                        req.Properties[partial_output_cache_stack_limit] = callCount;
                    }

                    if ( sb.Length > CharBufferPool.Default.MaxBufferSize )
                    {
                        var charBuff = CharBufferPool.Default.Get();
                        var strings = new List<string>();
                        for (int i = 0; i < sb.Length; i = i + charBuff.Length)
                        {
                            var l = Math.Min(sb.Length - i, charBuff.Length);
                            sb.CopyTo(i, charBuff, 0, l);
                            strings.Add(new string(charBuff,0,l));
                        }
                        CharBufferPool.Default.Put(charBuff);
                        output = strings.ToArray();
                    }
                    else
                    {
                        output = new string[1] {sb.ToString()};
                    }
                    StringBuilderPool.Default.Put(sb);

                    MemoryCache.Default.Set(new CacheItem(key, output), new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddSeconds(duration), Priority = CacheItemPriority.Default });

                }
                if (output.Length == 1)
                {
                    walker.buffer = output[0];
                    return walker;
                }
                else
                {
                    return walker = new Walker(new FSharpOption<Walker>(walker), output.Select(x => (INodeImpl)new CachedNode() {Token = this.Token, Buffer = x}).ToFSharpList(), string.Empty, 0, walker.context);
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

            private ArgumentCollection ProcessArguments(Walker walker)
            {
                var arguments = new ArgumentCollection();
                string[] kwords = (TagBase).KeyWords ?? g_emptyStringArray;
                foreach (Lexer.TextToken arg in BlockToken.Args)
                {
                    var tagArg = new TagArgument
                                 { 
                                     TokenValue = arg.Value
                                 };

                    int idx = Array.IndexOf(kwords, arg.Value);
                    if (idx > -1)
                    {
                        tagArg.Name = arg.Value;
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.Keyword;
                    }
                    else if (arg.Value.Contains("="))
                    {
                        string[] parts = arg.Value.Split('=');
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.NamedArgument;
                        tagArg.Name = parts[0];
                        tagArg.Value = new Expressions.FilterExpression(ParsingContext, arg.WithValue(parts[1], null)).Resolve(walker.context, true).Item1.Value;
                    }
                    else
                    {
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.ValueArgument;
                        tagArg.Name = "na";
                        tagArg.Value = new Expressions.FilterExpression(ParsingContext, arg).Resolve(walker.context, true).Item1.Value;
                    }
                    var jarr = tagArg.Value as JArray;
                    var jval = tagArg.Value as JValue;
                    if (jval != null)
                    {
                        tagArg.Value = jval.Value;
                    }
                    else if (jarr != null)
                    {
                        tagArg.Value = jarr.Cast<object>().ToList();
                        //todo turn into some type of colletion or array.
                    }
                    arguments.Add(tagArg);
                }
                return arguments;
            }
        }
    }
}