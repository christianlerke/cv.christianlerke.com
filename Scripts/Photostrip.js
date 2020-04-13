/* 
Photostrip.js
Created by Christian Lerke 29 Nov 2011

Description:
Will display content in a strip moving through it preloading its contents before displaying them
It can move through it automatically using the slideshow method
!! Needs Preloader.js and Utilities.js to run properly !!

Methods:
initiate				: displaying the first photo
deactivate				: cleans up the object and prepares if for reuse
advance					: moves to the next photo in the Photostrip
reverse					: moves to the previous photo in the Photostrip
startSlideshow			: starts cycling through the Photostrip automatically immediately
activateSlideshow		: same as startSlideshow but does not start immediately but only after the displayTime has elapsed
stopSlideshow			: stops cycling though the Photostrip
gotoPhoto				: goes to the specified photo in the Photostrip

Events:
"slideshowRunning" 		: when the slideshow starts
"slideshowStopped" 		: then the slideshow ends
"startedMoving" 		: when photos are changing
"stoppedMoving" 		: when photos stopped changing
"repeatingPhotostrip"	: when the advance method results in a jump from photo 20 > 1 or 1 > 20
"preloading"			: when preloading of photo starts

Properties:
.numberOfPhotos 		: total number of photos in the Photostrip
.currentPhotoNumber		: currently displayed photo number
.displayDuration		: time that the photo is displayed
.transitionTime			: time the transition takes
.sourceFolder			: the folder that contains the photos
.PhotostripContainer	: the HMTML element that is the Photostrip
.resumeSlideshow		: if set the slideshow will resume after every transition
.preloadContent			: ensures that the content is preloaded before displaying it
.centerContent			: centers the content vertically, might not work correctly with preloading disabled
.loopPhotostrip			: decides weather the content can loop or not
.ignoreWhileChanging	: allwos commands that come in while the photostrip is moving to be ignored

*/

/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: Photostrip																									\\
//  Description: initialising the object and loading the first photo													//
\\  Expects: number of photos, the location of the photos, the HTML element that contains the Photostrip				\\
//				and the function that will provide the content															//
\\---------------------------------------------------------------------------------------------------------------------*/
function Photostrip ( photoNumber, photoSource, photoContainer, contentLoadingFunction, postLoadingFunction ) {
	
	this.currentPhotoNumber = 1;
	
	this.displayDuration = 5000;
	this.transitionTime = 1000;
	
	this.resumeSlideshow = true;
	this.preloadContent = true;
	this.centerContent = true;
	this.loopPhotostrip = true;
	this.ignoreWhileChanging = false;
	
	//Do not change the variables below
	this.numberOfPhotos = photoNumber;
	this.sourceFolder = photoSource;
	this.PhotostripContainer = photoContainer;
	this.loadContent = contentLoadingFunction;
	this.postLoading = postLoadingFunction;
	this.contentPreloader = null;
	
	this._listeners = {};
	
	this.loading = false;
	this.changing = false;
	this.slideshowActive = false;
	this.latestVersion = 0;
	this.slideshowTimer = null;
	this.contentPreloader = null;
	
	// cleaning out old content
	this.PhotostripContainer.innerHTML = "";
	
}

/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: Photostrip.prototype																							\\
//  Description: setting up the methods of the Photostrip																//
//----------------------------------------------------------------------------------------------------------------------*/
Photostrip.prototype = {

    constructor: Photostrip,
	
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
	
	// displaying the first photo
	initiate: function() {
		
		this.preventPhotoSwitching();
		
		this.addContent( "initial" );
		
	},
	
	// cleans up the object and prepares if for reuse
	deactivate: function() {
		
		this.stopSlideshow();
		
		this.preventPhotoSwitching();
		
		this.removeOldPhoto();
		
// needs to reset all timers and timeouts and remove the preloader		
		
	},
	
	// moves to the next photo
	advance: function() {
		
		if ( this.changing == false ) {
			
			if( this.currentPhotoNumber >= this.numberOfPhotos ) {
				
				if ( this.loopPhotostrip == false )
					return;
				
				this.currentPhotoNumber = 1;
				this.fire( "repeatingPhotostrip" );
			
			} else
				this.currentPhotoNumber ++;
			
			this.preventPhotoSwitching();
			
			this.addContent( "right" );
		
		}
		
	},
	
	// moves to the previous photo
	reverse: function() {
		
		if ( this.changing == false ) {
			
			if( this.currentPhotoNumber <= 1 ) {
				
				if ( this.loopPhotostrip == false )
					return;
				
				this.currentPhotoNumber = this.numberOfPhotos;
				this.fire( "repeatingPhotostrip" );
			
			} else
				this.currentPhotoNumber --;
			
			this.preventPhotoSwitching();
			
			this.addContent( "left" );
			
		}
		
	},
	
	// starts the slideshow
	startSlideshow: function() {
		
		if ( this.slideshowActive == false ) {
		
			this.fire("slideshowRunning");
			
			this.slideshowActive = true;
			
			this.advance();
			
		}
		
	},
	
	// starts the slideshow
	activateSlideshow: function() {
		
		if ( this.slideshowActive == false ) {
			
			this.fire("slideshowRunning");
			
			clearTimeout( this.slideshowTimer );
			
			this.slideshowTimer = setTimeout( function(inputPhotostrip) { if ( inputPhotostrip.slideshowActive ) inputPhotostrip.advance(); }, this.displayDuration, this );
			
			this.slideshowActive = true;
			
		}
		
	},
	
	// stops the slideshow
	stopSlideshow: function() {
		
		if ( this.slideshowActive )
			this.fire("slideshowStopped");
			
		this.slideshowActive = false;
		
	},
	
	// prevents the photos from switching during an ongoing transition
	preventPhotoSwitching: function() {
		
		this.changing = true;
		
	},
	
	// allows the photos to switching after a trnasition
	allowPhotoSwitching: function() {
		
		this.changing = false;
		this.fire("stoppedMoving");
		
	},
	
	// creates the HTML for the incoming photo
	addContent: function( direction ) {
		
		var newDiv = document.createElement("div");
		newDiv.className = "photostripDiv";
		
		if ( direction == "initial" )
			addClassName ( newDiv, "right" );
		else
			addClassName ( newDiv, direction );
		
		var newDiv = this.loadContent( newDiv, this );
		
		this.PhotostripContainer.appendChild( newDiv );
		
		window.setTimeout( function( thisPhotostrip ) {
			
			if ( thisPhotostrip.preloadContent ) {
				
				thisPhotostrip.preloadDivContent ( newDiv, direction );
					
			} else {
				
				thisPhotostrip.movePhotos( direction );
				
			}
			
		}, 0, this );
		
	},
	
	// preloads the entire content of the newDiv
	preloadDivContent: function( container, direction ) {
		
		var allPhotos = container.getElementsByTagName("img");
		
		var photoArray = new Array();
		
		var appended = false;
		
		if ( allPhotos.length > 0 ) {
			
			for ( i = 0; i < allPhotos.length; i++ )
				photoArray[i] = allPhotos[i].src;
			
		} else {
			
// needs to check all divs contained within
			
			photoArray[0] = container.style.backgroundImage;
			
		}
		
		if ( this.contentPreloader == null )
			this.contentPreloader = new Preloader( photoArray );
		else {
			this.contentPreloader.appendPreloader( photoArray );
			appended = true;
		}
		
		this.contentPreloader.removeAllListeners();
		
		var thisHerePhotostrip = this;
		
		this.contentPreloader.addListener( "complete", function(){ window.setTimeout( function() { thisHerePhotostrip.movePhotos( direction ); }, 0); } );
		
		//this.contentPreloader.addListener( "complete", function(this){ window.setTimeout( function(this) { this.movePhotos( direction ); }, 0, this); } );
		
		this.loading = true;
		this.fire("preloading");
		
		this.contentPreloader.multiFileLoad = true;
		
		if ( appended )
			this.contentPreloader.loadRemaining();
		else
			this.contentPreloader.startLoading();
		
	},
	
	// moves the Photostrip into the desired direction
	movePhotos: function( direction ) {
		
		this.loading = false;
		
		this.fire("startedMoving");
		
		if ( direction == "initial" ) {
			
			var newPhoto = this.PhotostripContainer.getElementsByTagName("div")[0];
		
		} else {
			
			var oldPhoto = this.PhotostripContainer.getElementsByTagName("div")[0];
			var newPhoto = this.PhotostripContainer.getElementsByTagName("div")[1];
			
			if( direction == "left" )
				addClassName ( oldPhoto, "right" );
			else
				addClassName ( oldPhoto, "left" );
		
		}
		
		if ( this.centerContent )
			this.centerPhoto( newPhoto );
		
		if ( this.postLoading )
			this.postLoading( newPhoto );
		
		removeClassName ( newPhoto, "right" );
		removeClassName ( newPhoto, "left" );
		
		window.setTimeout( function(inputPhotostrip) {
			
			inputPhotostrip.removeOldPhoto();
			
		}, ( this.transitionTime + ( this.transitionTime / 2 ) ), this);
		
	},
	
	// centers the photo vertically if necessary
	centerPhoto: function( photoContainer ) {
		
		var allPhotos = photoContainer.getElementsByTagName("img");
		
		if ( allPhotos.length == 1 ) {
			
			var picture = allPhotos[0];
			
			if( ( this.PhotostripContainer.offsetHeight - picture.offsetHeight ) != 0) {
				
				picture.style.margin = ( ( this.PhotostripContainer.offsetHeight - picture.offsetHeight ) / 2 ) + "px 0px";
				
			}
		
		}
		
	},
	
	// goes directly to a photo in the Photostrip
	gotoPhoto: function( target , version ) {
		
		if ( this.changing == false ) {
			
			if ( target < 1 )
				target == 1;
			
			if ( target > this.numberOfPhotos )
				target == this.numberOfPhotos;
			
			this.stopSlideshow();
			
			if( parseInt(this.currentPhotoNumber) < parseInt(target) ) {
				
				this.currentPhotoNumber = parseInt(target) - 1;
				this.advance();
				
			} else if( parseInt(this.currentPhotoNumber) > parseInt(target) ) {
				
				this.currentPhotoNumber = parseInt(target) + 1;
				this.reverse();
				
			}
			
			this.latestVersion = 0;
			
		} else {
			
			if ( this.ignoreWhileChanging )
				return;
			
			if ( version == 0 || version == null ) {
				
				this.latestVersion ++;
				
				version = this.latestVersion;
				
			}
				
			if ( version >= this.latestVersion ) {
				
				window.setTimeout ( function(inputPhotostrip){ inputPhotostrip.gotoPhoto( target, version ); }, 100, this );
				
			}
			
		}
		
	},
	
	// removes the old photo
	removeOldPhoto: function() {
		
		var activeElements = this.PhotostripContainer.getElementsByClassName( "photostripDiv" );
		
		while ( activeElements.length > 1 ) {
			
			this.PhotostripContainer.removeChild( activeElements[0] );
			
		}
		
		if ( this.slideshowActive ) {
			
			clearTimeout( this.slideshowTimer );
		
			this.slideshowTimer = setTimeout( function(inputPhotostrip) { if ( inputPhotostrip.slideshowActive ) inputPhotostrip.advance(); }, this.displayDuration, this );
			
		} else {
		
			if ( this.resumeSlideshow )
				this.activateSlideshow();
		
		}
		
		this.allowPhotoSwitching();
		
	}
	
};