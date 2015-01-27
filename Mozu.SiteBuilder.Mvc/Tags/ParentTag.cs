// -----------------------------------------------------------------------
// <copyright file="ParentTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using FSharpx.Collections;
using Microsoft.FSharp.Core;
using NDjango;
using NDjango.Interfaces;
using Newtonsoft.Json.Linq;





namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using NDjango.Interfaces;

    using System.Web.Routing;
    using Microsoft.FSharp.Collections;








    /// <summary>
    ///    retnrns the output of the parent template block.
    ///     equal to {{ block.super }} 
    ///     needed to support parity with hyperlive templates
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("parent")]
    public  class ParentTag : ITag
    {

        private static PropertyInfo _superProperty;
        static ParentTag()
        {
            var ass = typeof(NDjango.Lexer.BlockToken).Assembly;
            var sbpType = ass.GetType("NDjango.ASTNodes+SuperBlockPointer");
            _superProperty = sbpType.GetProperty("super", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);

        }


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
            var resp = new PerformResponse(nodeImpl, parsingContext, tokenList);
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

       
        protected virtual ArgumentCollection.ParseStrategy ArguemntParserStrategy { get; set; }


        IEnumerable<NDjango.Expressions.FilterExpression> ParamFilters;

        class TagNodeImpl : NDjango.ParserNodes.TagNode
        {

            public ParentTag  TagBase
            {
                get{ return (ParentTag)this.Tag;}
            }

            public TagNodeImpl(IParsingContext parsingContext, NDjango.Lexer.BlockToken blockToken, ParentTag  tag)
                : base(parsingContext, blockToken, tag)
            {
                BlockToken = blockToken;
                ParsingContext = parsingContext;
            }
            IParsingContext ParsingContext;
            NDjango.Lexer.BlockToken BlockToken;

            public override FSharpList<WalkResult> walk(ITemplateManager manager, Walker walker)
            {
              
                var ctx = walker.context;            
                var block = walker.context.tryfind("block");
                if (block == null)
                {
                    return base.walk(manager, walker);
                }

                var super = _superProperty.GetValue(block.Value ) as NDjango.ParserNodes.TagNode;
                return super.walk(manager, walker);
            }
        }

        public virtual bool is_header_tag { get; set; }

        public class PerformResponse : Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
        {
            public PerformResponse(INodeImpl nodeImpl, IParsingContext parseContext, LazyList<NDjango.Lexer.Token> tokenList)
                : base(nodeImpl, parseContext, tokenList)
            {

            }
        }


        protected virtual FSharpList<WalkResult> Walk(ArgumentCollection arguments, IContext context, ITemplateManager templateManager, Walker walker, IHyprNode tagNode)
        {
            return tagNode.Walk( templateManager, walker);
          
        }
    }
}


