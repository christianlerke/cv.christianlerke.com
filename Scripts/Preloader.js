/* 
Preloader.js
Version: 1.0
	Created by Christian Lerke 15 Oct 2011
Version: 1.1
	11 Jun 2012 add finished loading for JavaScript and multiload capability
	
Description:
It takes an array of strings with the links to pictures, javascript or cascading style sheets and loads these one by one or all at once

Methods:
startLoading	: starts photo loading
loadObjectNumber: load specified object
appendPreloader : add items that need to be preloaded
loadRemaining   : loads all unloaded objects
pauseLoading	: pauses the loading once the currently loading photo has finished loading
resumeLoading	: resumes the loading process where it left of
cancel      	: clean up before deallocation

Events:
"change" 		: every time a photos finished loading
"complete" 		: when all photos finished loadingStatus

Properties:
.timeout 		: the timeout between the checks if a picture has finished loading
.loadPercentage	: the percentage of loaded photos
.loadingStatus	: lets you see the state of the loader "initialised", "active", "paused", "canceled"
.multiFileLoad	: if true all files will be loaded at once
*/

/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: Preloader																										\\
//  Description: initialising the object, this does not start the loading process										//
\\  Expects: array of strings with the location of the objects to load													\\
//----------------------------------------------------------------------------------------------------------------------*/
function Preloader ( inputList ){
	
	this.timeout = 10;
	
	this.objectList = inputList;  // list of all files
	this.numberOfItems = inputList.length;
	this.photoLoader = new Array(this.numberOfItems); // stores the photo data so that the data is not lossed
	this._listeners = {};
	this.loadPercentage = 0;
	this.loadedItemsNumber = 0;
	this.itemStatus = new Array(this.numberOfItems); // state of each item in the list ( "loading", "loaded" )
	this.arrayPosition = 0; // position of currently added item
	this.loadingStatus = "initialised";
	this.multiFileLoad = false;
}

/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: Preloader.prototype																							\\
//  Description: setting up the methods of the PhotoPreloader															//
//----------------------------------------------------------------------------------------------------------------------*/
Preloader.prototype = {

    constructor: Preloader,
	
	//take care of events
    addListener: function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },
    fire: function(event){
        if (typeof event == "string"){
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }

        if (!event.type){  //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event);
            }
        }
    },
    removeListener: function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    },
	removeAllListeners: function() {
		
		this._listeners = {};
		
	},
	
	cancel: function() {
		
// clean up
		
	},
	
	// starts loading the photos
	startLoading: function() {
		
		if ( this.loadingStatus != "active" ) {
			
			this.loadingStatus = "active";
			
			this.arrayPosition = 0;
						
			if ( this.multiFileLoad ) {
				
				for ( i = 0; i < this.numberOfItems; i++ )
					this.loadObjectNumber( i );
				
			} else {
				
				this.loadNextObject();
				
			}
			
		}
				
	},
	
	// add items to the preloader
	appendPreloader: function( inputList ) {
		
		for ( var i = 0; i < inputList.length; i++ ) {
			
			var exsists = false;
			
			for ( var j = 0; j < this.objectList.length; j++ ) {
				
				if ( inputList[i] == this.objectList[j] )
					exsists = true;
				
			}
			
			if ( !exsists ) {
				
				this.objectList.push( inputList[i] );
				
				this.numberOfItems++;
				
			}
			
		}
		
		this.photoLoader.length = this.numberOfItems;
		this.itemStatus.length = this.numberOfItems;
		
	},
	
	// loads the remaining items
	loadRemaining: function() {
				
		var unloaded = false;
		
		for ( var i = 0; i < this.itemStatus.length; i++ ) {
			
			if ( this.itemStatus[i] != "loaded" ) {
				
				unloaded = true;
				
				this.loadObjectNumber(i);
				
			}
			
		}
		
		if ( !unloaded ) this.fire("complete");
		
	},
	
	// loads the specified file
	loadObjectNumber: function( objectNumber ) {
		
		this.loadObject( this.objectList[objectNumber], objectNumber );
		
	},
	
	// loads next file
    loadNextObject: function() {
		
		if ( this.loadingStatus != "active" ) return;
		
		if ( this.arrayPosition + 1 > this.numberOfItems ) return;
		
		this.loadObject( this.objectList[this.arrayPosition], this.arrayPosition );
		
	},
	
	loadObject: function( currentItem, itemNumber ) {
		
	// check for url(...)
		if ( currentItem.substring( 0, 4 ) == "url(" )
			currentItem = currentItem.substring( 4, currentItem.length - 1 );
		
	// check for ' or " around the link
		if ( currentItem.substring( 0, 1 ) == '"' || currentItem.substring( 0, 1 ) == "'" )
			currentItem = currentItem.substring( 1, currentItem.length - 1 );
		
	// set the file extension
		var fileExtention = currentItem.substring( currentItem.length - 4 );
		
		this.fire("started");
		
	// check data type
		if ( fileExtention == ".jpg" || fileExtention == ".png" || fileExtention == ".svg" ) {
			
			this.loadPicture( currentItem, itemNumber );
			
		} else if ( fileExtention.substring( 1 ) == ".js" ) {
			
			this.loadJS( currentItem, itemNumber );
			
		} else if ( fileExtention == ".css" ) {
			
			this.loadCSS( currentItem, itemNumber );
			
		} else {
			
			//unknown item
			console.log("unknown filetype");
			
		}
				
	},
	
	// loads a picture
	loadPicture: function( filename, itemNumber ) {
		
		this.itemStatus[itemNumber] = "loading";
		
		this.photoLoader[itemNumber] = new Image();
		
		this.photoLoader[itemNumber].src = filename;
		
		this.pictureLoaded ( this.photoLoader[itemNumber], itemNumber );
		
	},
	
	// determins when a picture has finished loading
	pictureLoaded: function( pictureElement, itemNumber ){
		
		if( pictureElement.complete == true ) {
			
			this.itemLoaded( itemNumber );
			
		} else {
			
			if ( this.loadingStatus == "pause" )
				return;
			
			window.setTimeout( function( thisLoader ) {
				
				thisLoader.pictureLoaded( pictureElement, itemNumber );

			}, this.timeout, this );
			
		}
			
	},
	
	// loads a javascript file
	loadJS: function( filename, itemNumber ) {
		
		this.itemStatus[itemNumber] = "loading";
		
		var javascriptFile = document.createElement("script");
		
		javascriptFile.setAttribute( "type", "text/javascript" );
		
		javascriptFile.setAttribute( "src", filename );
		
		document.getElementsByTagName("head")[0].appendChild( javascriptFile );
		
		this.jsLoaded( javascriptFile, itemNumber );
		
	},
	
	// determins when a javascript file is loaded
	jsLoaded: function( jsElement, itemNumber ) {
		
		var jsLoaded = false;
		
	// retrieve the javascript file name
		var functionname = jsElement.getAttribute( "src" );
		
		functionname = functionname.substring( 0, functionname.length - 3 );
		functionname = functionname.split("/");
		functionname = functionname[functionname.length - 1];
		
		try {

			if ( typeof eval(functionname) == 'function' )
				jsLoaded = true;
			
		}
		
		catch( err ) {
			//no error handling needed cssLoaded will remain false
		}
		
		if ( jsLoaded ) {
			
			this.itemLoaded( itemNumber );

		} else {
			
			window.setTimeout( function( thisLoader ) {
			
				thisLoader.jsLoaded( jsElement, itemNumber );

			}, this.timeout, this );
			
		}

	},
	
	// load a cascading style sheet
	loadCSS: function( filename, itemNumber ) {
		
		this.itemStatus[itemNumber] = "loading";
		
		var cssFile = document.createElement("link");
		
		cssFile.setAttribute( "rel", "stylesheet" );
		
		cssFile.setAttribute( "type", "text/css" );
		
		cssFile.setAttribute( "href", filename );
		
		document.getElementsByTagName("head")[0].appendChild( cssFile );
		
		this.cssLoaded( cssFile, itemNumber );
		
	},
	
	// determins when a css file is loaded
	cssLoaded: function( cssElement, itemNumber ) {

		var cssLoaded = false;
		
		try {

			if ( cssElement.sheet && cssElement.sheet.cssRules.length > 0 )
				cssLoaded = true;
			else if ( cssElement.styleSheet && cssElement.styleSheet.cssText.length > 0 )
				cssLoaded = true;
			else if ( cssElement.innerHTML && cssElement.innerHTML.length > 0 )
				cssLoaded = true;

		}
		
		catch( err ) {
			//no error handling needed cssLoaded will remain false
		}
		
		if ( cssLoaded ) {
			
			this.itemLoaded( itemNumber );

		} else {
			
			window.setTimeout( function( thisLoader ) {
				
				thisLoader.cssLoaded( cssElement, itemNumber );
				
			}, this.timeout, this );
			
		}
		
	},
	
	// is called when an item sinished loading
	itemLoaded: function( itemNumber ) {
		
		this.itemStatus[itemNumber] = "loaded";
		
		this.loadedItemsNumber ++;
		
		this.loadPercentage = Math.round(( this.loadedItemsNumber / this.numberOfItems ) * 100);

		this.fire("change");
		
		if ( this.loadedItemsNumber < this.numberOfItems ) {
			
			if ( !this.multiFileLoad )
				this.loadNextObject();
			
		} else {
			
			this.fire("complete");
			
		}
		
	},
	
	// pauses the loading process
	pauseLoading: function(){
		
	// find all items that are still loading
		for ( var i = 0; i < this.itemStatus.length; i++ ) {
			
			if ( this.itemStatus[i] == "loading" ) {
				
			// stop loading all these photos other items cannot be stoped
				//this.photoLoader[i].delete;
				//console.log("works");
				
			}
			
			
		}
		
		this.loadingStatus = "pause";
		
	},
	
	// resumes the loading process
	resumeLoading: function(){
		
		if ( this.loadingStatus != "active" ) {
		
			this.loadingStatus = "active";
			
			if ( !this.multiFileLoad )
				this.loadNextObject();
			else
				this.loadRemaining();
		
		}
		
	}
	
};


/* example of how to use it
function tester( input ) {
	
	// this is important if the same array is reused with different data
	var arraytoload = null;
	
	arraytoload = new Array();
	arraytoload[0] = "../Data/Portfolio/portrait/10.jpg";
	arraytoload[1] = "../Data/Portfolio/portrait/2.jpg";
	arraytoload[2] = "../Data/Portfolio/portrait/3.jpg";
	arraytoload[3] = "../Data/Portfolio/portrait/4.jpg";
	arraytoload[4] = "../Data/Portfolio/portrait/5.jpg";
		
	// this is important if the same object is reused with different data
	var myPreloader = null;
	myPreloader = new Preloader( arraytoload );
	
	myPreloader.addListener("complete", handleEvent);
	
	myPreloader.addListener("change", handleEvent);
	
	myPreloader.startLoading();
	
}
*/
//example