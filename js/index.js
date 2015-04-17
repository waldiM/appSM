/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var index = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        // PETEY'S SOLUTION, WRAPPED IN CODE TO CHECK FOR ANDROID PRE 4.2
        // ALSO MODIFIED TO USE DEVICE PIXEL RATIO, INSTEAD OF CONTENTWIDTH
        if( index.isAndroid() ) {
            var matches = device.version.match( /[0-9]+(\.[0-9]+)?/i );

            if( matches.length && parseFloat( matches[ 0 ] ) < 4.2 ) {
                document.body.style.zoom = 1 / window.devicePixelRatio;
            }
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //device is ready
    },

    //resize home page in bottom 
    stickBottom: function(){
        $('article.homePage').height($(window).height());
    },
    
    //popUp company menu
    companyMenu: function(){
        $('.navCompany i').click(function(){
           $(this).parent().next('.popupMenu').show();
        });
        $('.popupMenu .barMenu').click(function(){
           $(this).parent('.popupMenu').hide();
        });
    },
    
    isAndroid: function() {
        if( device.platform.match( /android/i ) ) {    
            return true;
        }

        return false;
    }
};

index.initialize();