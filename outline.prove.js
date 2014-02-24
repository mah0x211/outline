/*
 * outline - https://github.com/mah0x211/outline
 * outline.prove.js
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

// constants
var RE_EMAIL = null,
    RE_EMAIL_LOOSE = null,
    RE_URL = null,
    URL_PART = {
        INPUT: 0,
        SCHEME: 1,
        HOSTNAME: 2,
        PORT: 3,
        PATH: 4,
        QUERY: 5,
        FRAGMENT: 6
    };


function init_regexp_email()
{
    // EMAIL REGEXP
    // ATOM: a-z A-Z 0-9 ! # $ % & ' * + - / = ? ^ _ ` { | } ~
    var atext = "[-a-zA-Z0-9!#$%&'*+/=?^_`{|}~]",
        dot_atom = "(?:" + atext + "+(?:\\." + atext + "+)*)",
        dot_atom_loose = "(?:" + atext + "+(?:\\.|" + atext + ")*)",
        qtext = "(?:\"(?:\\[^\\r\\n]|[^\\\"])*\")",
        local_part = "(?:" + dot_atom + "|" + qtext + ")",
        local_part_loose = "(?:" + dot_atom_loose + "|" + qtext + ")",
        /*
        [\x21-\x5a\x5e-\x7e]
        \x21-\x2f = [!"#$%&'()*+,=./]
        \x30-\x39 = [0-9]
        \x3a-\x40 = [:;<=>?@]
        \x41-\x5a = [A-Z]
        \x5e-\x60 = [^_`]
        \x61-\x7a = [a-z]
        \x7b-\x7e = [{|}~]
        */
        domain_lit = "\\[(?:\\S|[\x21-\x5a\x5e-\x7e])*\\]",
        domain_part = "(?:" + dot_atom + "|" + domain_lit + ")",
        valid = "^(?:" + local_part + "@" + domain_part + ")$",
        loose = "^(?:" + local_part_loose + "@" + domain_part + ")$";
        
    RE_EMAIL = new RegExp( valid );
    RE_EMAIL_LOOSE = new RegExp( loose );
}

function init_regexp_url()
{
    // URL REGEXP(not include userinfo)
    // [input,scheme,hostname,port,path,query,fragment]
        // scheme
    var scheme = "(https?)://",
        // host name
        domain_label = "[a-z0-9](?:[-a-z0-9]*[a-z0-9])?",
        top_label = "[a-z](?:[-a-z0-9]*[a-z0-9])?",
        hostname = "(?:" + domain_label + "\\.)*" + top_label + "\\.?",
        // IPv4
        ipv4addr = "(?:[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+)",
        // host
        host = "(" + hostname + "|" + ipv4addr + ")",
        // port
        port = "(?::([0-9]*))?",
        // path_segments
        param = "(?:[-_.!~*'()a-z0-9:@&=+$,]|%[0-9a-f][0-9a-f])",
        segment = param + "*(?:;" + param + ")*",
        path_segments = "(/" + segment + "(?:/" + segment + ")*)?",
        // [ reserved[;:@&=+$,]| unreserved[a-zA-Z0-9] | mark[\/-_.!~*'()]] | escaped
        uric = "(?:[;:@&=+$,?a-z0-9/\\_.!~*'()-]|%[0-9a-f][0-9a-f])*",
        uris = "(?:(?:[;:@&=+$,?a-z0-9/\\_.!~*'()-]+|%[0-9a-f][0-9a-f])*)",
        // query
        query = "(\\?" + uris + ")?",
        // fragment
        fragment = "(#" + uris + ")?",
        // absolute uri
        absolute_uri = scheme + host + port + path_segments + query,
        // uri reference
        uri_reference = absolute_uri + fragment;

    RE_URL = new RegExp( "\\b" + uri_reference, 'i' );
}
init_regexp_email();
init_regexp_url();


function isTypeOf( args, type )
{
    var i = 0,
        len = args.length,
        notObj = function( arg ){
            return !arg || typeof arg !== 'object';
        },
        notNum = function( arg ){
            return !isFinite( arg );
        };
    
    if( typeof type === 'string' )
    {
        for(; i < len; i++ )
        {
            switch( type )
            {
                case 'object':
                    if( notObj( args[i] ) ){
                        return false;
                    }
                break;
                case 'number':
                    if( notNum( args[i] ) ){
                        return false;
                    }
                break;
                //case 'string':
                default:
                    if( typeof args[i] !== type ){
                        return false;
                    }
            }
        }
    }
    else 
    {
        for(; i < len; i++ )
        {
            if( !( args[i] instanceof type ) ){
                return false;
            }
        }
    }
    
    return true;
}


function isBoolean( arg )
{
    var argc = arguments.length;
    
    if( argc < 2 ){
        return typeof arg === 'boolean';
    }
    else if( typeof arguments[0] === 'object' )
    {
        arg = ol.getKV( arguments[0], arguments[1] );
        if( typeof arg !== 'boolean' ){
            return false;
        }
        
        return ( argc < 3 || ( arg === arguments[2] ) );
    }
    
    return ( typeof arg === 'boolean' && arg === arguments[1] );
}

function isString( arg )
{
    var argc = arguments.length;
    
    if( argc < 2 ){
        return typeof arg === 'string';
    }
    else if( typeof arguments[0] === 'object' )
    {
        arg = ol.getKV( arguments[0], arguments[1] );
        if( typeof arg !== 'string' ){
            return false;
        }
        
        return ( argc < 3 || arg === arguments[2] );
    }
    
    return ( typeof arg === 'string' && arg === arguments[1] );
}

function isNumber( arg )
{
    var argc = arguments.length;
    
    if( argc < 2 ){
        return isFinite( arg );
    }
    else if( typeof arguments[0] === 'object' )
    {
        arg = ol.getKV( arguments[0], arguments[1] );
        if( !isFinite( arg ) ){
            return false;
        }
        
        return ( argc < 3 || arg === arguments[2] );
    }
    
    return ( isFinite( arg ) && arg === arguments[1] );
}

function isFunction( arg )
{
    return 'function' === typeof(
        arguments.length < 2 ? arg :
        ol.getKV( arguments[0], arguments[1] )
    );
}

function isObject( arg )
{
    arg = arguments.length < 2 ? arg :
          ol.getKV( arguments[0], arguments[1] );

    return ( arg && ( arg.constructor === Object || typeof arg === 'object' ) );
}

function isArray( arg )
{
    arg = arguments.length < 2 ? arg :
          ol.getKV( arguments[0], arguments[1] );
    
    return ( arg && arg.constructor === Array );
}

function isDate( arg )
{
    arg = arguments.length < 2 ? arg :
          ol.getKV( arguments[0], arguments[1] );
    
    return ( arg && arg.constructor === Date );
}

function isRegExp( arg )
{
    arg = arguments.length < 2 ? arg :
          ol.getKV( arguments[0], arguments[1] );
    
    return ( arg && arg.constructor === RegExp );
}

function isEmail( arg )
{
    arg = arguments.length < 2 ? arg :
          ol.getKV( arguments[0], arguments[1] );

    return ( typeof arg === 'string' && RE_EMAIL.test( arg ) );
}

function isEmailLoose( arg )
{
    arg = arguments.length < 2 ? arg :
          ol.getKV( arguments[0], arguments[1] );

    return ( typeof arg === 'string' && RE_EMAIL_LOOSE.test( arg ) );
}

function isURL( arg )
{
    var argc = arguments.length;
    
    if( argc < 2 ){
        return ( typeof arg === 'string' && RE_URL.test( arg ) );
    }
    
    arg = ol.getKV( arguments[0], arguments[1] );
    if( typeof arg !== 'string' ){
        return false;
    }
    else if( argc < 3 ){
        return RE_URL.test( arg );
    }
    else
    {
        var url = RE_URL.exec( arg );
        
        if( url )
        {
            var hostname = ( url[URL_PART.HOSTNAME] ) ? 
                            url[URL_PART.HOSTNAME].split('.') :
                            [],
                port = +( url[URL_PART.PORT] || 0 );
        
            if( url[URL_PART.SCHEME] && 
                hostname.length >= 2 &&
                port >= 0 && port <= 65535 ){
                return ( arguments[2] ) ? url : true;
            }
        }
    }
    
    return false;
}

// element types
function isHTML( arg ){
    return arg instanceof HTMLElement;
};
function isSVG( arg ){
    return arg instanceof SVGElement;
};
function isElm( arg ){
    return isHTML( arg ) || isSVG( arg );
};
function isNode( arg ){
    return isElm( arg ) && arg.nodeType === Node.ELEMENT_NODE;
};
function isNodeAttr( arg ){
    return isElm( arg ) && arg.nodeType === Node.ATTRIBUTE_NODE;
};
function isNodeText( arg ){
    return isElm( arg ) && arg.nodeType === Node.TEXT_NODE;
};

// exports
ol.is = {
    __proto__: null,
    type: isTypeOf,
    bool: isBoolean,
    str: isString,
    num: isNumber,
    func: isFunction,
    obj: isObject,
    arr: isArray,
    date: isDate,
    regexp: isRegExp,
    email: isEmail,
    emailLoose: isEmailLoose,
    url: isURL,
    // element types
    elmHtml: isHTML,
    elmSvg: isSVG,
    elm: isElm,
    node: isNode,
    nodeAttr: isNodeAttr,
    nodeText: isNodeText
};

}());


