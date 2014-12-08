using FSharpx.Collections;
using NDjango.Tags;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    using Mozu.SiteBuilder.Mvc;
    using System.Web.Routing;
    using NDjango.Interfaces;
    
    using Microsoft.FSharp.Collections;


    [NDjango.ParserNodes.Description("sets varaible s in the current scope")]
    [NDjango.Interfaces.Name("set_var")]
    public class SetVarTag : SimpleTagBase
    {

        protected override void ProcessTag(ArgumentCollection arguments, ref IContext context, out string buffer, out string templateName)
        {
            var name = arguments[0].TokenValue;
            var value = arguments[1].Value;
            
            context.add2(new Tuple<string, object>(name, value));
            buffer = "";
            templateName = null;
        }
    }

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("forgoes the parsing of internal tags")]
    [NDjango.Interfaces.Name("raw")]
    public class RawTag : ITag
    {


        public Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
            Perform(
            NDjango.Lexer.BlockToken blockToken,
            IParsingContext parsingContext,
            LazyList<NDjango.Lexer.Token> tokenList)
        {
            

            int endPos = 0;
            var sb = new StringBuilder();
            foreach ( var token in tokenList )
            {
                endPos++;
                if (token.IsBlock && ((NDjango.Lexer.Token.Block)token).Item.Verb.Value == "endraw")
                {
                    break;
                }
                
                sb.Append(token.TextToken.RawText);
                
            }

            tokenList = LazyListModule.skip<NDjango.Lexer.Token>(endPos + 1, tokenList);
            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, this, sb.ToString ());
            return   new PerformRespnose(nodeImpl, parsingContext, tokenList);
            
            
        }
       

        public bool is_header_tag
        {
            get { return false ; }
        }

        class TagNodeImpl : NDjango.ParserNodes.TagNode
        {
            public TagNodeImpl(IParsingContext parsingContext, NDjango.Lexer.BlockToken blockToken, RawTag tag, string txt)
                : base(parsingContext, blockToken, tag)
            {
                Text = txt;
            }

            public string Text
            {
                get;
                set;
            }
            public override Walker walk(ITemplateManager manager, Walker walker)
            {


                walker = new Walker(walker.parent, walker.nodes, Text, walker.bufferIndex, walker.context);

                return base.walk(manager, walker);
            }
          
        }
        public class PerformRespnose : Tuple<INodeImpl, IParsingContext, LazyList<NDjango.Lexer.Token>>
        {
            public PerformRespnose(INodeImpl nodeImpl, IParsingContext parseContext, LazyList<NDjango.Lexer.Token> tokenList)
                : base(nodeImpl, parseContext, tokenList)
            {
                
            }
            
        }
    }

}
