var rootURL = "http://cv.christianlerke.com/";

var lovevents = new Array(5,"http://lovevents.de");
var medcl = new Array(4, "http://med-c-l.com");
var btbab = new Array(6, "http://btbab.org");
var viktorlerke = new Array(6, "http://viktorlerke.com");

function startSlideshow ( name, source, element ) {
	
	var PhotoCollection = document.getElementById("PhotostripCollection");
	
	removeClassName ( PhotoCollection, "lovevents" );
	removeClassName ( PhotoCollection, "btbab" );
	removeClassName ( PhotoCollection, "viktorlerke" );
	removeClassName ( PhotoCollection, "medcl" );
	
	addClassName ( PhotoCollection, name );
	
	var navElements = document.getElementById("webNav").getElementsByTagName("li");
	
	for ( i = 0; i < navElements.length; i++ ) {
		
		removeClassName ( navElements[i], "active" );
		
	}
	
	addClassName ( element.parentNode, "active" );
	
	document.getElementById("websiteLink").href = source[1];
	
}

function initiateSlideshow () {
	
	if ( document.getElementById("Preview-Box-lovevents") ) {
		
		numberOfPhotos = lovevents[0];
		
		PhotostripContainer = document.getElementById("Preview-Box-lovevents");
		PhotostripFolder = rootURL + "images/lovevents";
		
		// this is important if the same object is reused with different data
		var loveventsPhotostrip = new Photostrip( numberOfPhotos, PhotostripFolder, PhotostripContainer, populateDivForPreview );
		//previewPhotostrip.addListener( "startedMoving", changeButtons);
		loveventsPhotostrip.centerContent = false;
		
		loveventsPhotostrip.displayDuration = 2000;
		loveventsPhotostrip.transitionTime = 1500;
		
		loveventsPhotostrip.initiate();
		loveventsPhotostrip.activateSlideshow();
		
	}
	
	if ( document.getElementById("Preview-Box-btbab") ) {
		
		numberOfPhotos = btbab[0];
		
		PhotostripContainer = document.getElementById("Preview-Box-btbab");
		PhotostripFolder = rootURL + "images/btbab";
		
		// this is important if the same object is reused with different data
		var btbabPhotostrip = new Photostrip( numberOfPhotos, PhotostripFolder, PhotostripContainer, populateDivForPreview );
		//previewPhotostrip.addListener( "startedMoving", changeButtons);
		btbabPhotostrip.centerContent = false;
		
		btbabPhotostrip.displayDuration = 2000;
		btbabPhotostrip.transitionTime = 1500;
		
		btbabPhotostrip.initiate();
		btbabPhotostrip.activateSlideshow();
		
	}
	
	if ( document.getElementById("Preview-Box-viktorlerke") ) {
		
		numberOfPhotos = viktorlerke[0];
		
		PhotostripContainer = document.getElementById("Preview-Box-viktorlerke");
		PhotostripFolder = rootURL + "images/viktorlerke";
		
		// this is important if the same object is reused with different data
		var viktorlerkePhotostrip = new Photostrip( numberOfPhotos, PhotostripFolder, PhotostripContainer, populateDivForPreview );
		//previewPhotostrip.addListener( "startedMoving", changeButtons);
		viktorlerkePhotostrip.centerContent = false;
		
		viktorlerkePhotostrip.displayDuration = 2000;
		viktorlerkePhotostrip.transitionTime = 1500;
		
		viktorlerkePhotostrip.initiate();
		viktorlerkePhotostrip.activateSlideshow();
		
	}
	
	if ( document.getElementById("Preview-Box-medcl") ) {
		
		numberOfPhotos = medcl[0];
		
		PhotostripContainer = document.getElementById("Preview-Box-medcl");
		PhotostripFolder = rootURL + "images/medcl";
		
		// this is important if the same object is reused with different data
		var medclPhotostrip = new Photostrip( numberOfPhotos, PhotostripFolder, PhotostripContainer, populateDivForPreview );
		//previewPhotostrip.addListener( "startedMoving", changeButtons);
		medclPhotostrip.centerContent = false;
		
		medclPhotostrip.displayDuration = 2000;
		medclPhotostrip.transitionTime = 1500;
		
		medclPhotostrip.initiate();
		medclPhotostrip.activateSlideshow();
		
	}
	
}

// loads the content for the Photostrip and puts it in the div
function populateDivForPreview( container, photostripObject ) {
	
	container.style.backgroundImage = "url('" + photostripObject.sourceFolder + "/" + photostripObject.currentPhotoNumber + ".jpg')";
	
	return container;
	
}