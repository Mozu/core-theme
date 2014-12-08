// -----------------------------------------------------------------------
// <copyright file="ComplexEmptyTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.IO;
using System.Threading.Tasks;
using FSharpx.Collections;
using Microsoft.FSharp.Core;
using NDjango;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using NDjango.Interfaces;

    using System.Web.Routing;







    public interface IHyprNode
    {
        Walker Walk(ITemplateManager manager, Walker walker);
    }
 
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public abstract class SimpleTagBase : ITag
    {

        public Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
            Perform(
            NDjango.Lexer.BlockToken blockToken,
            IParsingContext parsingContext,
            LazyList<NDjango.Lexer.Token> tokenList)
        {
            var blockTokenArs = PreProcessArguments(blockToken.Args);
            ParamFilters = blockTokenArs.Select(x => new NDjango.Expressions.FilterExpression(parsingContext, x));
            //var arr = ParamFilters.ToArray();

            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, this);
            var resp = new PerformRespnose(nodeImpl, parsingContext, tokenList);
            return resp;

        }

        

        static string[] g_keywords = new string[] { "as", "with", "as_param", "as_parameter" , "and"};
        string[] _keywords = g_keywords;

        public string[] KeyWords
        {
            get { return _keywords; }
            set { _keywords = value; }
        }

        protected virtual IEnumerable<NDjango.Lexer.TextToken> PreProcessArguments(IEnumerable<NDjango.Lexer.TextToken> tokens)
        {
            return tokens;
        }

        protected abstract void  ProcessTag(ArgumentCollection arguments, ref  IContext context , out string buffer , out string templateName );

        protected virtual ArgumentCollection.ParseStrategy ArguemntParserStrategy { get; set; }


        IEnumerable<NDjango.Expressions.FilterExpression> ParamFilters;

        class TagNodeImpl : NDjango.ParserNodes.TagNode, IHyprNode
        {

            public SimpleTagBase TagBase
            {
                get{ return (SimpleTagBase)this.Tag;}
            }

            public TagNodeImpl(IParsingContext parsingContext, NDjango.Lexer.BlockToken blockToken, SimpleTagBase tag)
                : base(parsingContext, blockToken, tag)
            {
                BlockToken = blockToken;
                ParsingContext = parsingContext;
            }
            IParsingContext ParsingContext;
            NDjango.Lexer.BlockToken BlockToken;

            public override Walker walk(ITemplateManager manager, Walker walker)
            {
                var arguments = ProcessArguments(walker);
                if (TagBase.ArguemntParserStrategy != null)
                {
                    arguments = TagBase.ArguemntParserStrategy(arguments);
                }
                var ctx = walker.context;



                string buffer;
                string templateName;
                TagBase.ProcessTag(arguments, ref ctx, out buffer, out templateName);
                if (arguments.OutputVariableName != null)
                {
                    if (arguments.OutputValue == null)
                    {
                        arguments.OutputValue = buffer;
                        buffer = string.Empty;
                    }
                    ctx = ctx.add(new Tuple<string, object>(arguments.OutputVariableName, arguments.OutputValue));
                }
                bool walked = false;
                if (!string.IsNullOrEmpty(buffer))
                {
                    buffer = string.IsNullOrEmpty(walker.buffer) ? buffer : walker.buffer + buffer;
                    walker = new Walker(walker.parent, walker.nodes, buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;
                }
                if (!string.IsNullOrEmpty(templateName))
                {
                    ITemplate template = null;
                    try
                    {
                       template =  manager.GetTemplate(templateName);
                    }
                    catch (Exception  ex )
                    {
                        throw new NDjango.Interfaces.RenderingException(ex.Message, this.Token, null);

                    }
                    
                    walker = new Walker(new FSharpOption<Walker>(walker), template.Nodes, walker.buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;
                    
                }
                if (!walked)
                {
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                }
                return walker;




                


            }

            static string[] g_emptyStringArray = new string[0];
            private ArgumentCollection ProcessArguments(Walker walker)
            {
                ArgumentCollection arguments = new ArgumentCollection();
                var kwords = ((SimpleTagBase)this.Tag).KeyWords ?? g_emptyStringArray;
                foreach (var arg in BlockToken.Args)
                {

                    TagArgument tagArg = new TagArgument()
                    {
                        TokenValue = arg.Value
                    };

                    var idx = Array.IndexOf<string>(kwords, arg.Value);
                    if (idx > -1)
                    {
                        tagArg.Name = arg.Value;
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.Keyword;
                    }
                    else if (arg.Value.Contains("="))
                    {
                        var parts = arg.Value.Split('=');
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.NamedArgument;
                        tagArg.Name = parts[0];
                        tagArg.Value = new NDjango.Expressions.FilterExpression(this.ParsingContext, arg.WithValue(parts[1], null)).Resolve(walker.context, true).Item1.Value;
                    }
                    else
                    {
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.ValueArgument;
                        tagArg.Name = "na";
                        tagArg.Value = new NDjango.Expressions.FilterExpression(this.ParsingContext, arg).Resolve(walker.context, true).Item1.Value;
                    }
                    var jarr = tagArg.Value as JArray;
                    var jval = tagArg.Value as JValue;
                    if (jval != null)
                    {
                        tagArg.Value = jval.Value;
                    }
                    else if (jarr != null )
                    {
                        tagArg.Value= jarr.Cast<object>().ToList();
                        //todo turn into some type of colletion or array.

                    }
                    arguments.Add(tagArg);
                }
                return arguments;
            }

            Walker IHyprNode.Walk(ITemplateManager templateManager, Walker walker)
            {
                return base.walk( templateManager, walker);
            }
        }

        public virtual bool is_header_tag { get; set; }

        public class PerformRespnose : Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
        {
            public PerformRespnose(INodeImpl nodeImpl, IParsingContext parseContext, LazyList<NDjango.Lexer.Token> tokenList)
                : base(nodeImpl, parseContext, tokenList)
            {

            }
        }


        protected virtual Walker Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk( templateManager, walker);
          
        }
    }


    public abstract class SimpleTagBaseAsync : ITag
    {

        public Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
            Perform(
            NDjango.Lexer.BlockToken blockToken,
            IParsingContext parsingContext,
            LazyList<NDjango.Lexer.Token> tokenList)
        {
            var blockTokenArs = PreProcessArguments(blockToken.Args);
            ParamFilters = blockTokenArs.Select(x => new NDjango.Expressions.FilterExpression(parsingContext, x));
            //var arr = ParamFilters.ToArray();

            var nodeImpl = new TagNodeImplAsync(parsingContext, blockToken, this);
            var resp = new PerformRespnose(nodeImpl, parsingContext, tokenList);
            return resp;

        }

        public class ProcessTagResult
        {
            public ProcessTagResult(IContext context)
            {
                this.Context = context;
            }
            public string Template { get; set; }
            public string Buffer { get; set; }
            public NDjango.Interfaces.IContext Context { get; set; }
        }

        static string[] g_keywords = new string[] { "as", "with", "as_param", "as_parameter", "and" };
        string[] _keywords = g_keywords;

        public string[] KeyWords
        {
            get { return _keywords; }
            set { _keywords = value; }
        }

        protected virtual IEnumerable<NDjango.Lexer.TextToken> PreProcessArguments(IEnumerable<NDjango.Lexer.TextToken> tokens)
        {
            return tokens;
        }

        

        protected virtual ArgumentCollection.ParseStrategy ArguemntParserStrategy { get; set; }


        IEnumerable<NDjango.Expressions.FilterExpression> ParamFilters;

        class TagNodeImplAsync : NDjango.ParserNodes.TagNode, IHyprNode, NDjango.Interfaces.INodeImplAsync
        {

            public SimpleTagBaseAsync TagBase
            {
                get { return (SimpleTagBaseAsync)this.Tag; }
            }

            public TagNodeImplAsync(IParsingContext parsingContext, NDjango.Lexer.BlockToken blockToken, SimpleTagBaseAsync tag)
                : base(parsingContext, blockToken, tag)
            {
                BlockToken = blockToken;
                ParsingContext = parsingContext;
            }
            IParsingContext ParsingContext;
            NDjango.Lexer.BlockToken BlockToken;


            public async Task<Walker> asyncWalk(ITemplateManager manager, Walker walker)
            {
                var arguments = ProcessArguments(walker);
                if (TagBase.ArguemntParserStrategy != null)
                {
                    arguments = TagBase.ArguemntParserStrategy(arguments);
                }
                var ctx = walker.context;




                var result = await TagBase.ProcessTagAsync(arguments, ctx).ConfigureAwait(false);
                var buffer = result.Buffer;
                var templateName = result.Template;
                ctx = result.Context;
                if (arguments.OutputVariableName != null)
                {
                    if (arguments.OutputValue == null)
                    {
                        arguments.OutputValue = buffer;
                        buffer = string.Empty;
                    }
                    ctx = ctx.add(new Tuple<string, object>(arguments.OutputVariableName, arguments.OutputValue));
                }
                bool walked = false;
                if (!string.IsNullOrEmpty(buffer))
                {
                    buffer = string.IsNullOrEmpty(walker.buffer) ? buffer : walker.buffer + buffer;
                    walker = new Walker(walker.parent, walker.nodes, buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;
                }
                if (!string.IsNullOrEmpty(templateName))
                {
                    ITemplate template = null;
                    try
                    {
                        template = manager.GetTemplate(templateName);
                    }
                    catch (Exception ex)
                    {
                        throw new NDjango.Interfaces.RenderingException(ex.Message, this.Token, null);

                    }

                    walker = new Walker(new FSharpOption<Walker>(walker), template.Nodes, walker.buffer, walker.bufferIndex, ctx);
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                    walked = true;

                }
                if (!walked)
                {
                    walker = TagBase.Walk(arguments, ctx, manager, walker, this);
                }
                return walker;

            }


            public override Walker walk(ITemplateManager manager, Walker walker)
            {
                var res = this.asyncWalk(manager, walker).ConfigureAwait(false).GetAwaiter().GetResult();
              //  task.Wait();
                return res;


            }

            static string[] g_emptyStringArray = new string[0];
            private ArgumentCollection ProcessArguments(Walker walker)
            {
                ArgumentCollection arguments = new ArgumentCollection();
                var kwords = ((SimpleTagBaseAsync )this.Tag).KeyWords ?? g_emptyStringArray;
                foreach (var arg in BlockToken.Args)
                {

                    TagArgument tagArg = new TagArgument()
                    {
                        TokenValue = arg.Value
                    };

                    var idx = Array.IndexOf<string>(kwords, arg.Value);
                    if (idx > -1)
                    {
                        tagArg.Name = arg.Value;
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.Keyword;
                    }
                    else if (arg.Value.Contains("="))
                    {
                        var parts = arg.Value.Split('=');
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.NamedArgument;
                        tagArg.Name = parts[0];
                        tagArg.Value = new NDjango.Expressions.FilterExpression(this.ParsingContext, arg.WithValue(parts[1], null)).Resolve(walker.context, true).Item1.Value;
                    }
                    else
                    {
                        tagArg.ArgumentType = TagArgument.ArgumentTypes.ValueArgument;
                        tagArg.Name = "na";
                        tagArg.Value = new NDjango.Expressions.FilterExpression(this.ParsingContext, arg).Resolve(walker.context, true).Item1.Value;
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

            Walker IHyprNode.Walk(ITemplateManager templateManager, Walker walker)
            {
                return base.walk(templateManager, walker);
            }

           
          
        }

        public virtual bool is_header_tag { get; set; }

        public class PerformRespnose : Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
        {
            public PerformRespnose(INodeImpl nodeImpl, IParsingContext parseContext, LazyList<NDjango.Lexer.Token> tokenList)
                : base(nodeImpl, parseContext, tokenList)
            {

            }
        }


        protected virtual Walker Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk(templateManager, walker);

        }
        


        protected abstract Task<ProcessTagResult> ProcessTagAsync(ArgumentCollection arguments,  IContext ctx);

    }
}
