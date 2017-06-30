/**************************************
Copyright ConryClan 2008
**************************************/
function UsageCalculator() {}

/**************************************
CalcPercentUsed
**************************************/
UsageCalculator.CalcPercentUsed = function( iQuota, iUsed ) {
	return Math.round( ( iUsed / iQuota ) * 100 );
}

/**************************************
CalcPercentOfPeriod
**************************************/
UsageCalculator.CalcPercentOfPeriod = function( sResetDate, sFormat ) {
	
	var g_oToday = new Date();
	
	var oDate;
	switch( sFormat ) {
		case "YYYY-MM-DD":
			oDate = new Date( sResetDate.substr( 0,4 ), parseInt( sResetDate.substr( 5,2 ), 10 )-1, sResetDate.substr( 8,4 ) );
		
		break;
	}
	
	var daysInBillingPeriod = UsageCalculator.GetDaysInBillingPeriod( oDate, g_oToday );
	var elapsedDays = UsageCalculator.GetElapsedDays( oDate, g_oToday );
	var remainingDays = daysInBillingPeriod - elapsedDays;
	
	return Math.round( ( elapsedDays / daysInBillingPeriod ) * 100 );
}

/**************************************
getDaysInBillingPeriod
**************************************/
UsageCalculator.GetDaysInBillingPeriod = function( oResetDate, oToday ) {
		
	var aDaysInMonth = new Array( 31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ); //Dec at position 0 and 12
	
	if ( oResetDate.getDate() > oToday.getDate() ) {
		//anniversary hasn't arrived yet, use last months day count
		return aDaysInMonth[ oToday.getMonth() ];
	}
	else {
		//anniversary has passed, use this months day count
		return aDaysInMonth[ oToday.getMonth()+1 ];
	}
}
	
/**************************************
GetElapsedDays
**************************************/
UsageCalculator.GetElapsedDays = function( oResetDate, oToday ) {
		
	if ( oResetDate.getDate() > oToday.getDate() ) {
		//anniversary hasn't arrived yet, use last months day count
		return UsageCalculator.GetDaysInBillingPeriod( oResetDate, oToday ) - ( oResetDate.getDate() - oToday.getDate() );
	}
	else {
		//anniversary has passed, use this months day count
		return oToday.getDate() - oResetDate.getDate();
	}
}

/**************************************
GetRemainingDays
**************************************/
UsageCalculator.GetRemainingDays = function( oResetDate, oToday ) {
		
	var iDaysInPeriod = UsageCalculator.GetDaysInBillingPeriod( oResetDate, oToday );
	
	return iDaysInPeriod - UsageCalculator.GetElapsedDays( oResetDate, oToday );
}


	
	