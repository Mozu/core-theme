using FSharpx.Collections;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Text;
    using NDjango.Interfaces;
    using Microsoft.FSharp.Collections;
    using NDjango.FiltersCS.Compatibility;
    using System.Collections.Generic;
    using System.Linq;
    [NDjango.ParserNodes.Description("sets varaible s in the current scope")]
    [Name("set_var")]
    public class SetVarTag : SimpleTagBase
    {

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunc)
        {
            var name = arguments[0].TokenValue;
            object value = null;
            if (arguments.Count == 1)
            {
                name = arguments[0].Name;
                value = arguments[0].Value;
            }
            else
            {
                value = arguments[1].Value;
            }

            context.addGlobal(new Tuple<string, object>(name, value));
            return Enumerable.Empty<WalkResult>();

        }
    }

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    [NDjango.ParserNodes.Description("forgoes the parsing of internal tags")]
    [Name("raw")]
    public class RawTag : ITag
    {
        public Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
            Perform(
            NDjango.Lexer.BlockToken blockToken,
            IParsingContext parsingContext,
            LazyList<NDjango.Lexer.Token> tokenList)
        {
            var endPos = 0;
            var sb = new StringBuilder();
            foreach (var token in tokenList)
            {
                endPos++;
                if (token.IsBlock && ((NDjango.Lexer.Token.Block) token).Item.Verb.Value == "endraw")
                {
                    break;
                }

                sb.Append(token.TextToken.RawText);
            }

            tokenList = LazyListModule.skip(endPos + 1, tokenList);
            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, this, sb.ToString());
            return new PerformResponse(nodeImpl, parsingContext, tokenList);
        }


        public bool is_header_tag
        {
            get { return false; }
        }

        private class TagNodeImpl : NDjango.ParserNodes.TagNode
        {
            public TagNodeImpl(IParsingContext parsingContext, NDjango.Lexer.BlockToken blockToken, RawTag tag, string txt)
                : base(parsingContext, blockToken, tag)
            {
                Text = txt;
            }

            public string Text { get; set; }

            public override FSharpList<WalkResult> walk(ITemplateManager manager, Walker walker)
            {
                return WalkResultHelpers.Buffer(Text).ToFSharpList();
            }
        }
    }
}