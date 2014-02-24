/*
 * outline - https://github.com/mah0x211/outline
 * outline.elm.js
 *
 * Copyright (c) 2014, Masatoshi Teruya
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 * 
 *   Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * 
 *   Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * 
 *   Neither the name of the {organization} nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */

(function(){
'use strict';

// DOM node types
if( !window.Node )
{
    var i = 1;
    
    window.Node = { __proto__: null };
    'ELEMENT_NODE,ATTRIBUTE_NODE,TEXT_NODE,CDATA_SECTION_NODE,ENTITY_REFERENCE_NODE,ENTITY_NODE,PROCESSING_INSTRUCTION_NODE,COMMENT_NODE,DOCUMENT_NODE,DOCUMENT_TYPE_NODE,DOCUMENT_FRAGMENT_NODE,NOTATION_NODE'
    .split(',').forEach(function(name){
        window.Node[name] = i++;
    });
};


/* element class property */
ol.elm = {
    __proto__: null,
    create: function( name )
    {
        return document.createElement( name );
    },
    attr: function( elm, name, val )
    {
        if( arguments.length < 3 ){
            return elm.getAttribute( name );
        }
        elm.setAttribute( name, val );
        
        return val;
    },
    removeAttr: function( elm, name )
    {
        elm.removeAttribute( name );
    },
    hasAttr: function( elm, name )
    {
        return elm.hasAttribute( name );
    },
    className: function( elm, className, remove )
    {
        var names = (this.attr( elm, 'class' ) || '')
                    .replace( /\s+/g, ' ' )
                    .replace( /(?:^\s+|\s+$)/g, '' );
        
        if( arguments.length > 1 )
        {
            var arr = names.split( /\s+/ ),
                idx = arr.indexOf( className );
            
            if( remove === true && idx !== -1 ){
                arr.splice( idx, 1 );
                names = this.attr( elm, 'class', arr.join( ' ' ) );
            }
            else if( idx === -1 ){
                arr.push( className );
                names = this.attr( elm, 'class', arr.join( ' ' ) );
            }
        }
        
        return names;
    }
};

}());

