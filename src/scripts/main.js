/**************************************
Copyright ConryClan 2008
**************************************/
var g_sVersionUrl = "http://conryclan.com/projects/NetUsage/Version.txt";
var g_oConfig;
var g_oTimerId;

/**************************************
Main display
**************************************/

function window_OnLoad() {

	System.Gadget.settingsUI = "Settings.html";
   System.Gadget.Flyout.file = "Flyout.html";
	
	g_oConfig = initConfig();
	
	System.Gadget.onSettingsClosed = settingsClosed;
	window.detachEvent( "onload", window_OnLoad );
	
	//Update every hour
	g_oTimerId = window.setInterval(Update, 1000 * 60 * 60);
	
	//And update now.
	Update();
	
	
}

function Update() {
	g_oConfig.Isp.RequestUsage();
}

function window_OnClick() {
	showFlyout();
}

function SetDisplay( oUsage, bFromCache ) {
	
	var iPctUsed = UsageCalculator.CalcPercentUsed( oUsage.Quota, oUsage.Consumed );
	var iPctPeriod = UsageCalculator.CalcPercentOfPeriod( oUsage.RolloverDate, "YYYY-MM-DD" );
	
	serviceName.innerText = System.Gadget.Settings.readString( "name" );
	serviceName.title = "Last Updated: " + oUsage.LastUpdate;
	serviceName.style.color = bFromCache ? "#CCCCCC" : "#FFFFFF";
	
	iMeterWidth = 110; //meterBack.style.width;
	iMeterOffset = 10; //meterBack.style.left;
	
	usageMeter.style.width = ( scaleUsage( iPctUsed ) / 100 ) * iMeterWidth;
	dateMarker.style.left = ((iPctPeriod / 100) * iMeterWidth) + iMeterOffset - 3; 
	
	if( iPctUsed >= 100 ) {
		usageMeter.src = "images/barred.png";
	}
	else if (iPctUsed > iPctPeriod) {
		usageMeter.src = "images/barorange.png";
	}
	else{
		usageMeter.src = "images/bargreen.png";
	}
	
	//Check the version to see if there's a newer version available
	if( newVersionAvailable() ) {
		updateLink.style.display = "block";
	}
	else{
		updateLink.style.display = "none";
	}
}

/**************************************
Settings
**************************************/
function settingsClosed( p_event ) {
    
    if (p_event.closeAction == p_event.Action.commit) {

    	g_oConfig = initConfig();

    	Update();
    }
}

function initConfig() {
		
		var oConfig = new Config();
    		
    	try {
    		oConfig.Load( System.Gadget.Settings.readString("configJson") );
    		
    	}
    	catch (ex) {
    	}
    	
    	oConfig.Isp.UsageRetrievedSuccess.subscribe( isp_UsageRetrievedSuccess );
    	oConfig.Isp.UsageRetrievedFailure.subscribe( isp_UsageRetrievedFailure );
    	
    	return oConfig;
}

/**************************************
isp_UsageRetrievedSuccess
**************************************/
function isp_UsageRetrievedSuccess( oSender, oArgs ) {
	
	var oUsage = oArgs.Data;
	
	SetDisplay( oUsage, false );
		
	//Now save the usage so it's available if we have no connection.
	g_oConfig.Isp.Usage = oUsage;
	System.Gadget.Settings.writeString("configJson", Json.Encode(g_oConfig));
}

/**************************************
isp_UsageRetrievedFailure
**************************************/
function isp_UsageRetrievedFailure( oSender, oArgs ) {
	
	try{
	SetDisplay( g_oConfig.Isp.Usage, true );
	}
	catch( ex ){
	}
}

/**************************************
Flyout
**************************************/
function showFlyout(){
  
	System.Gadget.Flyout.show = !System.Gadget.Flyout.show;
}

/**************************************
Common functions
**************************************/
