/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: addClassName																									\\
//  Description: add the newClassName to the element																	//
\\  Expects: OBJECT element, STRING new class name																		\\
//  Returns: OBJECT element																								//
\\	Note: Modified version from: http://www.prototypejs.org/															\\
//----------------------------------------------------------------------------------------------------------------------*/
function addClassName (element, newClassName) {
	
	if (!hasClassName(element, newClassName))
		
		element.className += (element.className ? ' ' : '') + newClassName;
	
	return element;
	
}


/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: removeClassName																								\\
//  Description: remove the newClassName from the element																//
\\  Expects: OBJECT element, STRING remove class name																	\\
//  Returns: OBJECT element																								//
\\	Note: Modified version from: http://www.prototypejs.org/															\\
//----------------------------------------------------------------------------------------------------------------------*/
function removeClassName (element, removeClassName) {
	
	element.className = element.className.replace(new RegExp("(^|\\s+)" + removeClassName + "(\\s+|$)"), ' ').trim();
	
	return element;
	
}


/*----------------------------------------------------------------------------------------------------------------------//
\\  Name: hasClassName																									\\
//  Description: checks if the class name is assigned to the element													//
\\  Expects: OBJECT element, STRING class name to check																	\\
//  Returns: true or false																								//
\\	Note: Modified version from: http://www.prototypejs.org/															\\
//----------------------------------------------------------------------------------------------------------------------*/
function  hasClassName (element, checkClassName) {
    
	return (element.className.length > 0 && (element.className == checkClassName || new RegExp("(^|\\s)" + checkClassName + "(\\s|$)").test(element.className)));

}



//check if the next sibliElementng node is an element node
function get_nextsibling(n) {

	x=n.nextSibling;
	
	try{
	
		while (x.nodeType!=1) {
		
			x=x.nextSibling;
		
		}
	
	}
	
	catch(err){
	
		return -1;
	
	}
	
	return x;

}

function get_prevsibling(n) {

	x=n.previousSibling;
	
	try{
	
		while (x.nodeType!=1) {
		
			x=x.previousSibling;
		
		}
	
	}
	
	catch(err){
	
		return -1;
	
	}
	
	return x;

}



function addLeadingZero( number, length ) {
   
    var newNumber = "" + number;
    
    while (	newNumber.length < length ) {
    
        newNumber = "0" + newNumber;
    
    }
   
    return newNumber;

}


String.prototype.capitalize = function(){
	return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
}

function isPortrait ( targetImage ) {

	if ( targetImage.width/targetImage.height < 1080/600 )
		return true;
	else
		return false;

}

function eventHandler(e) {
	console.log(this);
	console.log(e);
}