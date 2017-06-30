/**************************************
Copyright ConryClan 2008
**************************************/
var g_aPointBuffer = [];
var g_aDateBuffer = [];

var g_oConfig;

var g_bMoreInfo = false;

function window_OnLoad() {
	window.detachEvent( "onload", window_OnLoad );
	
	g_oConfig = initConfig();
	
	if( System.Gadget.Settings.readString("configJson") === "" ) {
		return;
	}
	
	setText();
	
	g_oConfig.Isp.RequestInfo();
	g_oConfig.Isp.RequestHistory();
}

function formatUsage( sUsageHistory ) {
	
	var iMarker;
	
	var aParts = sUsageHistory.split( "\n" );
	for( var cI=0; cI<aParts.length; cI++ ) {
		
		var aPoints = aParts[ cI ].split( " " );
		
		iMarker = parseInt( aPoints[1], 10 );
		if( isNaN( iMarker ) ) {
	
			continue;
		}
		
		g_aPointBuffer.push( iMarker );
		g_aDateBuffer.push( aPoints[0].substr( 4,2 ) + "/" + aPoints[0].substr( 2,2 ) + "/" + aPoints[0].substr( 0,2 ) );
	
	}
		
	 	
}

function chartLine( aData, aThinnedData, iWidth, iHeight ) {

	var aValues = [];
	for( var cI=0; cI< aData.length; cI++ ) {
		aValues.push( Math.round( aData[cI].Total/1024/1024 ) );
	}
	
	var aLabels = [];
	for( var cJ=0; cJ< aThinnedData.length; cJ++ ) {
		aLabels.push( aThinnedData[cJ].Day.substr( 8,2) + " " + 
			getMonthShortName( aThinnedData[cJ].Day.substr( 5,2) ) );
	}
	
	//find the maximum point value for scaling
	var iMaxMarker = findMax( aValues );
	
	//generate the chart
	var retValue = "http://chart.apis.google.com/chart?";
	retValue += "cht=lc";
	retValue += "&chco=4d89f9";
	retValue += "&chs=" + iWidth + "x" + iHeight;
	retValue += "&chxt=y";
	retValue += "&chxr=0,0," + iMaxMarker;
	retValue += "&chds=0," + iMaxMarker;
	retValue += "&chd=t:" + aValues.join( "," );
	retValue += "&chl=" + aLabels.join( "|" );
	
	return retValue;
	
}

function chartBar( aPoints, aXAxis, iWidth, iHeight ) {
	
	//find the maximum point value for scaling
	var iMaxMarker = findMax( aPoints );
	
	//generate the chart
	var retValue = "http://chart.apis.google.com/chart?";
	retValue += "cht=bvs";
	retValue += "&chs=" + iWidth + "x" + iHeight;
	retValue += "&chxt=y";
	retValue += "&chxr=0,0," + iMaxMarker;
	retValue += "&chds=0," + iMaxMarker;
	retValue += "&chd=t:" + aPoints.join( "," );
	retValue += "&chl=" + aXAxis.join( "|" );
	
	return retValue;
	
}

function findMax( aArray ) {
	
	var fMax = 0;
	
	for( var cI=0; cI<aArray.length; cI++ ) {
			
		if( aArray[cI] > fMax ) {
			fMax = aArray[cI];
		}
	}
	
	return fMax;
}

function copyLast( aSource, iNumber ) {

	if( aSource.length <= iNumber ) {
		return aSource;
	}
	
	var aOutput = [];
	var iStart = aSource.length - iNumber;
	
	for( vRecord in aSource ) {
		//loop to the starting point
		for( var cI=0; cI<iStart; cI++ ) {
			continue;
		}
		
		aOutput[vRecord] = aSource[vRecord];
	}
	
	return aOutput;
	
}

function thin( aSource, iNthToKeep ) {

	var aOutput = [];
	
	for( var cI=0; cI<aSource.length; cI+=iNthToKeep ) {
		aOutput.push( aSource[cI] );
	}
	
	return aOutput;
	
}

function aggregateMonth( aInData ) {

	var iTotal = 0;
	var sControl = "";
	var oData = {};
	var iYearMonth;
	var aOutput = [];
	
	//build up the totals for each month
	for( var cI=0; cI<aInData.length; cI++ ) {
		
		iYearMonth = parseInt( aInData[cI].Day.substr( 0,4 ) + "" + aInData[cI].Day.substr( 5,2 ), 10 );
		if( aOutput[iYearMonth] === undefined ) {
			aOutput[iYearMonth] = 0;
		}
		
		aOutput[ iYearMonth ] += parseInt( aInData[cI].Total/1024/1024, 10);
		
	}
	
	return aOutput;
	
}

function setText() {
	
	var oUsage = g_oConfig.Isp.Usage;
	
	var elapsedDays = UsageCalculator.GetElapsedDays( MakeDate( oUsage.RolloverDate, "YYYY-MM-DD" ), new Date() );
	var daysInPeriod = UsageCalculator.GetDaysInBillingPeriod( MakeDate( oUsage.RolloverDate, "YYYY-MM-DD" ), new Date() );
	
	$("#txtPctQuota").html( UsageCalculator.CalcPercentUsed( oUsage.Quota, oUsage.Consumed ) );
	$("#txtQuota").html( (oUsage.QuotaGb-0).toFixed() );
	$("#txtConsumed").html( (oUsage.ConsumedGb -0).toFixed(2) );
	$("#txtRemaining").html( (oUsage.QuotaGb - oUsage.ConsumedGb).toFixed(2) );
	$("#avgUsed").html( parseInt( (oUsage.ConsumedMb / ((elapsedDays > 0)? elapsedDays:1) ), 10 ));
	$("#avgRemaining").html( parseInt( (oUsage.QuotaMb - oUsage.ConsumedMb) / (daysInPeriod - elapsedDays), 10 ) );
	$("#txtDaysLeft").html( daysInPeriod - elapsedDays );
	$("#version").html( System.Gadget.version );
}

function checkNaN( vVal ) {
	return isNaN( vVal ) ? 1:0; 
}

function initConfig() {
		
		var oConfig = new Config();
    		
    	try {
    		oConfig.Load( System.Gadget.Settings.readString("configJson") );
    		
    	}
    	catch (ex) {
    	}
    	
    	oConfig.Isp.HistoryRetrievedSuccess.subscribe( isp_HistoryRetrievedSuccess );
    	oConfig.Isp.HistoryRetrievedFailure.subscribe( isp_HistoryRetrievedFailure );
    	
    	oConfig.Isp.InfoRetrievedSuccess.subscribe( isp_InfoRetrievedSuccess );
    	oConfig.Isp.InfoRetrievedFailure.subscribe( isp_InfoRetrievedFailure );
    	
    	return oConfig;
}

/**************************************
isp_UsageRetrievedSuccess
**************************************/
function isp_HistoryRetrievedSuccess( oSender, oArgs ) {
	
	
	//triggerImage( $("#chartLast30") );
	//triggerImage( $("#chartMonth12") );
	
	//setText();
	var aRecentHistory = buildLast30Days( copyLast( oArgs.Data, 30 ) );
	var jChart30Div = $("#chartLast30");
	var s30Src = chartLine( aRecentHistory, thin( aRecentHistory, 5 ), jChart30Div.width(), jChart30Div.height() );
	
	preloadImage( jChart30Div, s30Src );
	
	var aMonthTotals = aggregateMonth( oArgs.Data );
	var aMonthlyHistory = buildLast12Months( copyLast( aMonthTotals, 12 ) );
	var aTotals = [];
	var aLabels = [];
	splitArray( aMonthlyHistory, aLabels, aTotals );
	
	var jChart12Div = $("#chartMonth12");
	var s12Src = chartBar( aTotals, aLabels, jChart12Div.width(), jChart12Div.height() );
	preloadImage( jChart12Div, s12Src );
}

/**************************************
isp_UsageRetrievedFailure
**************************************/
function isp_HistoryRetrievedFailure( oSender, oArgs ) {
	
	
}/**************************************
isp_InfoRetrievedSuccess
**************************************/
function isp_InfoRetrievedSuccess( oSender, oArgs ) {
	
	var oData = oArgs.Data;
	
	for( oProp in oData ) {
		$("#" + oProp).html( oData[oProp] );
	}
}

/**************************************
isp_InfoRetrievedFailure
**************************************/
function isp_InfoRetrievedFailure( oSender, oArgs ) {
	
}

/**************************************
toggleMoreInfo
**************************************/
function toggleMoreInfo() {
	
	if( g_bMoreInfo ) {
		$('#moreInfo').slideUp( "fast" );
		$('#moreInfoLink').html( " more..." );
	}
	else{
		$('#moreInfo').slideDown( "fast" );
		$('#moreInfoLink').html( " less..." );	
	}
	
	g_bMoreInfo = !g_bMoreInfo;
}

function triggerImage( jImage ) {
	jImage.load( display12Image );
}

function preloadImage( jTarget, sSource ) {
	 $("<img class='hidden' />").attr('src', sSource).load(function(){
			jTarget.append( $(this) );
    		$(this).fadeIn();
    });
}

/**************************************
buildLast30Days

Ensures that there is a record for every day, even if not provided by the API
**************************************/
function buildLast30Days( oData ) {

	//build data into an object
	var oFormattedData = [];
	for( var cI=0; cI<oData.length; cI++ ) {
		oFormattedData[ oData[cI].Day ] = oData[cI].Total;
	}
	
	var oToday = new Date();
	
	var aOutput = [];
	for( cI=-30; cI<=0; cI++ ) {
		var oDate = new Date(oToday.getYear(), oToday.getMonth(), oToday.getDate()-0+cI);
		var sDate = oDate.toInternode();
		var oRecord = {};
		oRecord.Day = sDate;
		oRecord.Total = oFormattedData[ sDate ] || 0;
		
		aOutput.push( oRecord );
	}
	
	return aOutput;
}

/**************************************
buildLast12Months

Ensures that there is a record for every day, even if not provided by the API
**************************************/
function buildLast12Months( oData ) {
	//debugger	
	var oToday = new Date();
	//debugger
	var aOutput = [];
	for( cI=-11; cI<=0; cI++ ) {
		var oDate = new Date(oToday.getYear(), oToday.getMonth()-0+cI, oToday.getDate());
		aOutput[ getMonthShortName( oDate.getMonth()+1 ) ] = 
			oData[ oDate.getYear() + "" + (oDate.getMonth()+1).toString().padLeft( "0", 2 ) ] || 0;
		
	}
	
	return aOutput;
}

//Build up the month names and totals into single dimention arrays
function splitArray( aSource, aKeys, aValues ) {
	for( vRecord in aSource ) {
		aKeys.push( vRecord );
		aValues.push( aSource[ vRecord ] );
	}
}