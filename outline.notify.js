/*
 * outline - https://github.com/mah0x211/outline
 * outline.notify.js
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

var OBSERVERS = {
    __proto__: null
};

function onListen( notify, imp, fnName )
{
    if( !ol.is.str( name ) ){
        throw new TypeError( 'notify must be type of string' );
    }
    else
    {
        var obs = OBSERVERS[notify],
            isObj = ( arguments.length > 2 ),
            invoke;
        
        if( !ol.is.arr( obs ) ){
            obs = [];
            OBSERVERS[notify] = obs;
        }
        
        if( isObj )
        {
            if( !imp ){
                throw new TypeError( 'imp must be type of object' );
            }
            else if( !ol.is.str( fnName ) ){
                throw new TypeError( 'fnName must be type of string' );
            }
            else if( !ol.is.func( imp[fnName] ) ){
                throw new TypeError( 'imp.' + fnName + ' must be type of function' );
            }
            
            invoke = function(){
                this.imp[this.fnName].apply( 
                    this.imp, Array.prototype.slice.call( arguments )
                );
            };
        }
        else if( !ol.is.func( imp ) ){
            throw new TypeError( 'imp must be type of function' );
        }
        else {
            invoke = function(){
                this.imp.apply( 
                    this.imp, Array.prototype.slice.call( arguments )
                );
            };
        }
        // check existing
        for( var i = 0, len = obs.length; i < len; i++ )
        {
            if( isObj )
            {
                if( obs[i].imp === imp && obs[i].fnName === fnName  ){
                    return false;
                }
            }
            else if( obs[i].imp === imp ) {
                return false;
            }
        }
        
        // add observer
        obs.push({
            imp: imp,
            fnName: fnName,
            invoke: invoke
        });
    }
    
    return true;
}

// notification
ol.notify = {
    __proto__: null,
    listen: onListen
};

function notify( ev )
{
    var elm = ev.target,
        name = ol.getKV( elm, '_notify.name' ),
        obs;
    
    if( !ol.is.str( name ) ){
        unwatch( elm );
    }
    else if( ( obs = OBSERVERS[name] ) )
    {
        var args = ol.getKV( elm, '_notify.args' );
        
        obs.forEach(function( listener ){
            listener.invoke( ev, args );
        });
    }
}

function watch( elm )
{
    var attr = ol.elm.attr( elm, 'data-notify' ).split('|'),
        name = attr[0],
        evts = ( attr[1] || '' ).split(','),
        args = ( attr[2] || '' ).split(',');
    
    if( attr.length < 2 || attr.length > 3 )
    {
        throw new SyntaxError( 
            'data-notify format must be notificationName|event,...|arg,...' 
        );
    }
    
    // add events
    evts.forEach(function(ev){
        ol.evt.add( elm, ev, notify );
    });
    // save context
    elm._notify = {
        name: name,
        evts: evts,
        args: args
    };
}

function unwatch( elm )
{
    if( elm._notify )
    {
        // remove events
        elm._notify.evts.forEach(function(ev){
            ol.evt.remove( elm, ev, notify );
        });
        // void context
        elm._notify = null;
    }
}


// mutation event handler
function evMutation( ev )
{
    var elm = ev.target;
    
    if( ol.is.elm( elm ) )
    {
        var data = ol.elm.attr( elm, 'data-notify' );
        
        if( ol.is.obj( elm._notify ) && !data ){
            unwatch( elm );
        }
        else if( data ){
            watch( elm );
        }
    }
};


function enableDOMAttrModified( prop )
{
    var args = 'name, val',
        tmpl = 'var e = document.createEvent( "MutationEvents" ), ' +
               '    prev = this.getAttribute( name ); ' + 
               'this.__$( name, val ); ' + 
               'e.initMutationEvent( ' + 
               '  "DOMAttrModified", true, true, null, prev, val, name, 2 ' + 
               '); ' + 
               'this.dispatchEvent( e );';
    
    SVGElement.prototype['__' + prop] = HTMLElement.prototype['__' + prop] = Element.prototype[prop];
    Element.prototype[prop] = new Function( args, tmpl.replace( '$', prop ) );
}

// set event monitor
/*
// DOM4
if( window.MutationObserverA ){
    console.log( 'mutation' );
}
// DOM3
else */if( window.MutationEvent ){
    'setAttribute,removeAttribute'.split(',').forEach( enableDOMAttrModified );
}


function initMonitor()
{
    var body = ol.body;
    
    ol.evt.remove( window, 'load', initMonitor );
    // add notifier
    Array.prototype.slice.call( ol.selectAll('*[data-notify]') )
    .forEach( watch );
    
    // register MutationEvent events
    'DOMNodeInserted,DOMAttrModified'.split(',')
    .forEach(function(name){
        ol.evt.add( body, name, evMutation, false );
    });
    
    // run initializer
    (ol.init||[]).forEach(function(fn){
        fn();
    });
}

ol.evt.add( window, 'load', initMonitor, false );

}());

