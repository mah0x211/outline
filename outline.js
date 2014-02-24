/*
 * outline - https://github.com/mah0x211/outline
 * outline.js
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

function getKV( obj, keys )
{
    var prev = obj,
        val;
    
    if( typeof keys === 'string' ){
        keys = keys.split('.');
    }
    else if( !( keys instanceof Array ) ){
        throw new TypeError('invalid keys');
    }
    
    for( var idx = 0, len = keys.length; idx < len; idx++ )
    {
        val = prev[keys[idx].trim()];
        if( !val ){
            return null;
        }
        prev = val;
    }
    
    return val;
}

function setKV( obj, keys, val )
{
    var prev = obj,
        next;
    
    if( typeof keys === 'string' ){
        keys = keys.split('.');
    }
    else if( !( keys instanceof Array ) ){
        throw new TypeError('invalid keys');
    }
    
    for( var idx = 0, len = keys.length; idx < len; idx++ )
    {
        if( len - idx === 1 ){
            prev[keys[idx]] = val;
            break;
        }
        
        next = prev[keys[idx]];
        if( !next )
        {
            next = {};
            prev[keys[idx]] = next;
            idx++;
            len--;
            for(; idx < len; idx++ ){
                prev = {};
                next[keys[idx]] = prev;
                next = prev;
            }
            next[keys[idx]] = val;
            break;
        }
        prev = next;
    }
}

function select( qry, elm )
{
    return ( elm || document ).querySelector( qry );
}

function selectAll( qry, elm )
{
    return ( elm || document ).querySelectorAll( qry );
}

// define property
function define( obj, props )
{
    for( var name in props ){
        Object.defineProperty( obj, name, props[name] );
    }
}

var inits = [],
    outline = {
        __proto__: null,
        MAX_NUM: 1 << 24,
        TOUCHABLE: ( 'ontouchstart' in window ),
        get body(){
            return select('body');
        },
        set init( fn )
        {
            if( inits ){
                inits.push( fn );
            }
        },
        get init(){
            var val = inits;
            
            inits = null;
            return val;
        },
        select: select,
        selectAll: selectAll,
        getKV: getKV,
        setKV: setKV,
        define: define
    };

window.ol = outline;

}());
