///<reference path="Isp.js"/>
///<reference path="Internode.js"/>
///<reference path="jquery.js"/>
///<reference path="scriptlibrary.js"/>

/**************************************
Document ready
**************************************/

var g_oConfig;

$(document).ready(function() {

	g_oConfig = new Config();
	
	try {
		g_oConfig.Load( System.Gadget.Settings.readString("configJson") );
	}
	catch (ex) {}

	$("#txtTitle").val(g_oConfig.Title);
	$("#txtUsername").val(g_oConfig.Isp.Username);
	$("#txtPassword").val(g_oConfig.Isp.Password);
	$("#txtlimit").val(g_oConfig.Isp.Quota);
	$("#cboIsp").val(g_oConfig.Isp.Name);
	
	if( g_oConfig.Isp.Service.length > 0 ) {
		var aServices = [];
		aServices[g_oConfig.Isp.Service] = g_oConfig.Isp.Service;
		PopulateServices( aServices );
		$("#cboService").val(g_oConfig.Isp.Service);
	}
	
	$("#version").html(System.Gadget.version);

	$("img#imgLoad").hide();

	SetBindings();

	$("#cboService").val(g_oConfig.Isp.Service);

});



/**************************************
Event handlers
**************************************/
function SetBindings() {

	$("input#txtUsername").change( resetServiceCbo );
	$("input#txtPassword").change( resetServiceCbo );
	$("select#cboService").bind( "focus", RetrieveServices );
	
	g_oConfig.Isp.ServicesRetrievedSuccess.subscribe( isp_ServicesRetrievedSuccess );
	g_oConfig.Isp.ServicesRetrievedFailure.subscribe( isp_ServicesRetrievedFailure );
	
}

/**************************************
isp_ServicesRetrievedSuccess
**************************************/
function isp_ServicesRetrievedSuccess( oSender, oArgs ) {
	
	PopulateServices( oArgs.Data );
	$("select#cboService").unbind( "focus", RetrieveServices );
	$("img#imgLoad").hide();
}

/**************************************
isp_ServicesRetrievedSuccess
**************************************/
function isp_ServicesRetrievedFailure( oSender, oArgs ) {
	
	ServiceError( oArgs.Error );
	$("img#imgLoad").hide();
}

function RetrieveServices() {
	var oIsp = g_oConfig.Isp;
	
	//Only continue if there is a username and password
	oIsp.Username = $("#txtUsername").val();
	oIsp.Password = $("#txtPassword").val();
	if( oIsp.Username + oIsp.Password === "" ) { return; }

	var cboService = $("select#cboService");
	cboService.attr( "disabled", "disabled" );
	
	$("img#imgLoad").show();

	oIsp.RequestServices();
	
}

function resetServiceCbo() {
	
	var cboService = $("select#cboService");
	cboService.bind( "focus", RetrieveServices );
	cboService.html("");
	cboService.removeAttr("disabled");
	$("img#imgLoad").hide();
}

/**************************************
PopulateServices
**************************************/
function PopulateServices( aServices ) {
	
	var sb = new StringBuilder();
	
	for( key in aServices ) {
		sb.Append( '<option value="' + key + '">' + 
			key + ': ' + aServices[ key ] + '</option>' );
	}
	
	var cboService = $("select#cboService");
	cboService.html( sb.ToString() );
	cboService.removeAttr("disabled");
}

/**************************************
ServiceError
**************************************/
function ServiceError( sError ) {
	
	var sb = new StringBuilder();
	
	var cboService = $("select#cboService");
	cboService.html( '<option value="">' + sError + '</option>' );
	cboService.attr( "disabled", "disabled" );
}

/**************************************
OnClose
**************************************/
System.Gadget.onSettingsClosing = function(event) {

	if (event.closeAction == event.Action.commit) {

		g_oConfig.Title = $("#txtTitle").val();
		g_oConfig.Isp.Service = $("select#cboService").val();
		
		System.Gadget.Settings.writeString("configJson", Json.Encode(g_oConfig));

		System.Gadget.Settings.writeString("name", $("#txtTitle").val());

		event.cancel = false;
	}
};
