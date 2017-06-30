/**************************************
Copyright ConryClan 2008
**************************************/
function saveRemoteFile( sFrom, sTo ){ 

	var oXmlHttp = getXMLHTTP();
	
	oXmlHttp.open( "GET", sFrom, false ); 
	
	oXmlHttp.send(); 
	
	if (oXmlHttp.status == 200) { 
	
		var oStream = new ActiveXObject("Adodb.Stream"); 
		
		oStream.type = 1; //Binary 
		
		oStream.open(); 
		
		oStream.write( oXmlHttp.responseBody ); 
		
		oStream.saveToFile( sTo, 2 ); //Create if needed and overwrite if necessary 
		
		oStream.close(); 
		
		return true;
	} 
	else { 
	
		return false;
	
	} 
}


/**************************************
Create an ActiveX object, given an array of options to try
**************************************/
function createActiveXObject( aVersions ) {
	
	//Loop through versions, trying to create each one.	When success, exit
	for (var cI = 0; cI < aVersions.length; cI++) {
	
		try{
			return new ActiveXObject( aVersions[ cI ] );
			
		}
		catch( ex ) {}
	}
	
	throw ex;
}

/**************************************
MSXML DOMDocument
**************************************/
function getXMLDOMDocument() {
	
	//List of all possible versions
	var aVersions = [ "MSXML2.DOMDocument.6.0", 
										"MSXML2.DOMDocument.5.0", 
										"MSXML2.DOMDocument.4.0", 
										"MSXML2.DOMDocument.3.0", 
										"MSXML2.DOMDocument.2.0",
										"MSXML2.DOMDocument",
										"Microsoft.XMLDOM" ];
	
	try {
		return createActiveXObject( aVersions );
	}
	catch( ex ) {
		throw "Could not create DOMDocument: " + ex;
	}
}

/**************************************
MSXML DOMDocument
**************************************/
function getXMLHTTP() {
	
	//List of all possible versions
	var aVersions = [ "MSXML2.XMLHTTP.6.0", 
										"MSXML2.XMLHTTP.5.0", 
										"MSXML2.XMLHTTP.4.0", 
										"MSXML2.XMLHTTP.3.0", 
										"MSXML2.XMLHTTP.2.0",
										"MSXML2.XMLHTTP",
										"Microsoft.XMLHTTP" ];
	
	try {
		return createActiveXObject( aVersions );
	}
	catch( ex ) {
		throw "Could not create XmlHttp: " + ex;
	}
}

/**************************************
If the script is not being run through CScript, restart it as such.
**************************************/
function forceCScript() {
	var sType = WScript.FullName;
	sType = sType.substr( sType.length - 11 );
	sType = sType.toUpperCase();
	
	//Only bother if we're in the wrong mode.
	if( sType == "WSCRIPT.EXE" ) {
		
		//Build a list of the args
		var sArgs = "";
		
		for (var cI = 0; cI < WScript.Arguments.length; cI++) {
			sArgs += WScript.Arguments( cI ) + " ";
		}
		
		//Run the script again as a cscript
		var oShell = new ActiveXObject( "WScript.Shell" );
		oShell.Run( oShell.ExpandEnvironmentStrings("%COMSPEC%") + " /C cscript.exe \"" + WScript.ScriptFullName + "\" " + sArgs, 1, false ); 
		
		//Exit the script, as execution will now be handled by the cscript process
		oShell = null;
		WScript.Quit();
	}
}

function getMonthShortName( iMonth ) {

	var aMonthNames = new Array( "Jan", "Feb", "Mar", "April", "May", "June", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" );
	
	return aMonthNames[ iMonth -1 ];
	
}

function StringBuilder() {

	var g_aBuffer = [];
	
	this.seperator = "";
	
	this.Append = function( sValue ) {
		g_aBuffer.push( sValue );
	}
	
	this.ToString = function() {
		return g_aBuffer.join( this.seperator );
	}	
}

if (typeof Date.prototype.toIso !== 'function') {

	Date.prototype.toIso = function() {
		return this.getYear() + "" +
			( this.getMonth() + 1 ).toString().padLeft( "0", 2 ) + "" +
			this.getDate().toString().padLeft( "0", 2 ) + "" +
			this.getHours().toString().padLeft( "0", 2 ) + "" +
			this.getMinutes().toString().padLeft( "0", 2 ) + "" +
			this.getSeconds().toString().padLeft( "0", 2 );
	};
}

if (typeof Date.prototype.toShortDateTime !== 'function') {

	Date.prototype.toShortDateTime = function() {
		return this.getYear() + "-" +
			( this.getMonth() + 1 ).toString().padLeft( "0", 2 ) + "-" +
			this.getDate().toString().padLeft( "0", 2 ) + " " +
			this.getHours().toString().padLeft( "0", 2 ) + ":" +
			this.getMinutes().toString().padLeft( "0", 2 );
	};
}

if (typeof Date.prototype.toTextDate !== 'function') {

	Date.prototype.toTextDate = function() {
		return this.getHours().toString().padLeft( "0", 2 ) + ":" +
			this.getMinutes().toString().padLeft( "0", 2 ) + " " +
			this.getDate().toString().padLeft( "0", 2 ) + "/" +
			( this.getMonth() + 1 ).toString().padLeft( "0", 2 );
			
	};
}

if (typeof Date.prototype.toInternode !== 'function') {

	Date.prototype.toInternode = function() {
		return this.getYear() + "-" +
			( this.getMonth() + 1 ).toString().padLeft( "0", 2 ) + "-" +
			this.getDate().toString().padLeft( "0", 2 );
	};
}

if (typeof String.prototype.padLeft !== 'function') {

	String.prototype.padLeft = function( sChar, iTotalLength ) {
		
		var tempVal = "";
		for( var cI=0; cI<iTotalLength; cI++ ) {
			tempVal += sChar;
		}
		
		tempVal += this;
		
		return tempVal.substr( tempVal.length - iTotalLength );
	};
}

function scaleUsage( iSize ) {
	if( iSize > 100 ) {
		return 100;
	}
	else{
		return iSize;
	}
}

function newVersionAvailable() {

	var oHttp = getXMLHTTP();
	
	//We randomise the URL to stop the version file being cached.
	var sRandUrl = g_sVersionUrl + "?" + (new Date()).toIso();
	
	oHttp.open( "GET", sRandUrl, false );
	oHttp.send();
	
	if (oHttp.status != 200) { 
		throw( "Error retrieving latest version: " + oHttp.statusText );
	}
	
	var fLatestVer = parseFloat( oHttp.responseText );
	if( isNaN( fLatestVer ) ) { 
		throw( "Invalid latest version data: " + oHttp.statusText );
	}
		
	if( fLatestVer > parseFloat( System.Gadget.version ) ) {
		return true;
	}
	else{
		return false;
	}
}

function getLoadedIsp() {

	var oIsp;
	
	switch( System.Gadget.Settings.readString("isp") ) {
		case "Internode":
		
			oIsp = new Internode();
			break;

		case "Vodafone":
		
			oIsp = new Vodafone();
			break;

		default:

			return null;
	}

	oIsp.Username = System.Gadget.Settings.readString("username");
	oIsp.Password = System.Gadget.Settings.readString("password");

	return oIsp;
	
}

/**
*
*	Base64 encode / decode
*	http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

function makeBasicAuthToken( sUsername, sPassword ) {
	var tok = sUsername + ':' + sPassword;
	var hash = Base64.encode(tok);
	return "Basic " + hash;
}

/**************************************
JSON
**************************************/
function Json() {}

Json.Decode = function( sJson ) {
	try{
		var retVal = eval( "(" + sJson + ")" );
		return retVal;
	}
	catch( ex ) {
		throw( "Invalid Json: " + fullDescription( ex ) );
	}
};
	
Json.Encode = function( vValue ) {
	
	if( vValue === null || vValue === undefined ) {
		return "null";	
	}
	
	switch( typeOf( vValue ) ) {
	
		case "number":
			return isFinite( vValue ) ? String( vValue ) : "null";
			break;
			
		case "string":
			return '"' + vValue.replace( /"/g, '\"' ) + '"';
			break;
			
		case "boolean":
			return String( vValue );
			break;
			
		case "array":
			var sb = new StringBuilder();
			sb.Append( "[" );
			
			var bFirstA = true;
			for( vKey in vValue ) {
				
				if( bFirstA ) {
					bFirstA = false;
				} 
				else{
					
					sb.Append( "," );
				}
				
				sb.Append( this.Encode( vValue[ vKey ] ) );
			}
			
			sb.Append( "]" );
			
			return sb.ToString();
			break;
			
		case "object":
			var sbO = new StringBuilder();
			sbO.Append( "{" );
			
			var bFirstO = true;
			for( vKey in vValue ) {
				
				if( typeof( vValue[ vKey ] ) === 'function' ) {
					continue;
				}
				
				if( bFirstO ) {
					bFirstO = false;
				} 
				else{
					
					sbO.Append( "," );
				}
				
				sbO.Append( '"' + String( vKey ) + '":' );
				sbO.Append( this.Encode( vValue[ vKey ] ) );
			}
			
			sbO.Append( "}" );
			
			return sbO.ToString();
			break;
			
		default:
			return vValue;
		
	}
	
	return "null";
	
	
};
/**************************************
Object extensions
**************************************/
function fullDescription( oValue ) {
		
	var sReturn = "";
	
	for( sProp in oValue ) {
		
		if( typeof( oValue[ sProp ] ) === 'function' ) {
			continue;	
		}
		
		sReturn += "\n" + sProp + ": " + oValue[ sProp ];
		
	}
	
	try{
		sReturn += "\n" + oValue;
	}
	catch(ex){}
	
	return sReturn;

}

/**************************************
JSON
**************************************/
function Json() {

	Json.prototype.Decode = function(sJson) {
		
		try {
			var retVal = eval("(" + sJson + ")");
			
			return retVal;
		}
		catch (ex) {
			throw ("Invalid Json: " + fullDescription(ex));
		}
	};
	

	
	Json.prototype.Encode = function(vValue) {

		if (vValue === null || vValue === undefined) {
			return "null";
		}

		switch (typeOf(vValue)) {

			case "number":
				return isFinite(vValue) ? String(vValue) : "null";
				break;

			case "string":
				return '"' + vValue.replace(/"/g, '\"') + '"';
				break;

			case "boolean":
				return String(vValue);
				break;

			case "array":
				var sb = new StringBuilder();
				sb.Append("[");

				var bFirstA = true;
				for (vKey in vValue) {

					if (bFirstA) {
						bFirstA = false;
					}
					else {

						sb.Append(",");
					}

					sb.Append(this.Encode(vValue[vKey]));
				}

				sb.Append("]");

				return sb.ToString();
				break;

			case "object":
				var sbO = new StringBuilder();
				sbO.Append("{");

				var bFirstO = true;
				for (vKey in vValue) {

					if (typeof (vValue[vKey]) === 'function') {
						continue;
					}

					if (bFirstO) {
						bFirstO = false;
					}
					else {

						sbO.Append(",");
					}

					sbO.Append('"' + String(vKey) + '":');
					sbO.Append(this.Encode(vValue[vKey]));
				}

				sbO.Append("}");

				return sbO.ToString();
				break;

			default:
				return vValue;

		}

		return "null";


	};
}

var JSON = new Json();

/**************************************
typeOf
**************************************/
function typeOf(obj) {

	var sType = typeof (obj);

	if (typeof (obj) == "object") {
		if (obj.length) {
			return "array";
		}
		else {
			return "object";
		}
	}
	else {
		return sType;
	}
}

/**************************************
Hydrate
**************************************/
function Hydrate( oSource, oTarget ) {
	for( sProp in oSource ) {
		
		if( oSource[sProp] === null || oSource[sProp] === undefined ) {
			continue;
		}
		
		switch (typeOf(oSource[sProp])) {
			case "function":
				continue;
				break;
				
			case "object":
				Hydrate( oSource[sProp], oTarget[sProp] );
				break;
				
			default:
				oTarget[sProp] = oSource[sProp];

		}
	}	
}

/**************************************
Custom Event
**************************************/
var CustomEvent = function() {
	//name of the event
	this.eventName = arguments[0];
	var mEventName = this.eventName;

	//function to call on event fire
	var eventAction = null;

	//subscribe a function to the event
	this.subscribe = function(fn) {
		eventAction = fn;
	};

	//fire the event
	this.fire = function(sender, eventArgs) {
		this.eventName = mEventName;
		if(eventAction != null) {
			eventAction(sender, eventArgs);
		}
		else {
			alert('There was no function subscribed to the ' + mEventName + ' event!');
		}
	};
};

/**************************************
MakeDate
**************************************/
function MakeDate( sDate, sFormat ) {
	switch( sFormat ) {
		case "YYYY-MM-DD":
			return new Date( sDate.substr( 0,4 ), parseInt( sDate.substr( 5,2 ), 10 )-1, sDate.substr( 8,4 ) );
		
		break;
	}	
}
