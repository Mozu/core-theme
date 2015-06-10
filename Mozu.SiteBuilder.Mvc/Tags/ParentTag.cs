using System;
using System.Collections.Generic;
using System.Linq;
using NDjango.Interfaces;
using Microsoft.FSharp.Collections;
using NDjango.FiltersCS.Compatibility;
using System.Reflection;
using FSharpx.Collections;
using NDjango;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///    retnrns the output of the parent template block.
    ///     equal to {{ block.super }} 
    ///     needed to support parity with hyperlive templates
    /// </summary>
    [ParserNodes.Description("tbd")]
    [Name("parent")]
    public class ParentTag : ITag
    {
        static PropertyInfo _superProperty = 
                typeof(Lexer.BlockToken).Assembly.GetType("NDjango.ASTNodes+SuperBlockPointer")
                .GetProperty("super", BindingFlags.Instance | BindingFlags.NonPublic);

        public virtual bool is_header_tag { get; set; }

        public Tuple<INodeImpl, IParsingContext, LazyList<Lexer.Token>> Perform(
            Lexer.BlockToken blockToken, 
            IParsingContext parsingContext, 
            LazyList<Lexer.Token> tokenList)
        {
            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, this) as INodeImpl;
            return Tuple.Create(nodeImpl, parsingContext, tokenList);
        }

        class TagNodeImpl : ParserNodes.TagNode
        {

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, ParentTag tag)
                : base(parsingContext, blockToken, tag)
            {
            }

            public override FSharpList<WalkResult> walk(ITemplateManager manager, Walker walker)
            {
                var ctx = walker.context;
                var block = walker.context.tryfind("block");
                
                if (Microsoft.FSharp.Core.OptionModule.IsNone(block))
                {
                    return base.walk(manager, walker);
                }

                var nodesToRender = (_superProperty.GetValue(block.Value) as ParserNodes.TagNode).nodelist;
                return new List<WalkResult> { WalkResultHelpers.ContextDeletions(new[] { "block" }), WalkResultHelpers.Nodes(nodesToRender) }.AsEnumerable().ToFSharpList();
            }
        }
    }
}


