///<reference path="Isp.js"/>
/**************************************
Internode class
**************************************/
Internode.prototype = new ISP();
Internode.prototype.constructor = Internode;
var internodeLocal;

function Internode() {
	internodeLocal = this;
	
	this.ApiUrl = "https://customer-webtools-api.internode.on.net/api/v1.5/";
	this.Service = "";
	this.Name = "";
	this.Username = "";
	this.Password = "";
	this.UserAgent = "";
	this.Usage = {};
	
	this.ServicesRetrievedSuccess = new CustomEvent( "Services Retrieved Success" );
	this.ServicesRetrievedFailure = new CustomEvent( "Services Retrieved Failure" );
	this.UsageRetrievedSuccess = new CustomEvent( "Usage Retrieved Success" );
	this.UsageRetrievedFailure = new CustomEvent( "Usage Retrieved Failure" );
	this.HistoryRetrievedSuccess = new CustomEvent( "History Retrieved Success" );
	this.HistoryRetrievedFailure = new CustomEvent( "History Retrieved Failure" );
	this.InfoRetrievedSuccess = new CustomEvent( "Info Retrieved Success" );
	this.InfoRetrievedFailure = new CustomEvent( "Info Retrieved Failure" );
	
	/**************************************
	RequestUsage
	**************************************/
	Internode.prototype.RequestUsage = function() {
		this.RequestData(this.ApiUrl + this.Service + "/usage",
			this.UsageSuccess, this.UsageFailure);
	};
	
	/**************************************
	RequestInfo
	**************************************/
	Internode.prototype.RequestInfo = function() {
		this.RequestData(this.ApiUrl + this.Service + "/service",
			this.InfoSuccess, this.InfoFailure);
	};
	
	/**************************************
	Requests the services accociated with the specified account
	**************************************/
	Internode.prototype.RequestServices = function() {

		this.RequestData(this.ApiUrl, this.ServicesSuccess, this.ServicesFailure );

		
	};
	
	Internode.prototype.ServicesSuccess = function( oData, sStatus ) {

		var aServices = [];
		
		$(oData).find("service").each(function() {
			var marker = $(this);
			aServices[marker.text()] = marker.attr("type");
		});
			
		internodeLocal.ServicesRetrievedSuccess.fire( internodeLocal, {
			Data: aServices,
			Status: sStatus
			});
	};
	
	Internode.prototype.ServicesFailure = function( oHttp, sErrorType, ex ) {

		internodeLocal.ServicesRetrievedFailure.fire( this, {
			Error: oHttp.statusText
			});
	};
	
	Internode.prototype.UsageSuccess = function( oData, sStatus ) {

		var oUsage = {};
		
		var oNode = $(oData).find("traffic[name='total']");
		
		//If we didn't find the usage data, throw the error.
		if( oNode.length === 0 ) {
			internodeLocal.UsageRetrievedFailure.fire( internodeLocal, {
			Error: "Usage data not returned"
			});
			
			return;
		}
		
		oUsage.RolloverDate = oNode.attr( "rollover" );
		oUsage.Interval = oNode.attr( "plan-interval" );
		oUsage.Quota = oNode.attr( "quota" );
		oUsage.Units = oNode.attr( "unit" );
		oUsage.Consumed = oNode.text();
		
		switch( oUsage.Units ) {
			case "bytes":
				oUsage.QuotaMb = (oUsage.Quota/1000/1000).toFixed();
				oUsage.ConsumedMb = (oUsage.Consumed/1000/1000).toFixed();
				oUsage.QuotaGb = (oUsage.Quota/1000/1000/1000).toFixed(2);
				oUsage.ConsumedGb = ( oUsage.Consumed/1000/1000/1000).toFixed(2);
			
				break;
				
			default:
				oUsage.QuotaMb = oUsage.Quota;
				oUsage.ConsumedMb = oUsage.Consumed;
				oUsage.QuotaGb = oUsage.Quota;
				oUsage.ConsumedGb = oUsage.Consumed;
				break;
		}
		
		var now = new Date();
		oUsage.LastUpdate = now.toTextDate();
		
		internodeLocal.UsageRetrievedSuccess.fire( internodeLocal, {
			Data: oUsage
			});
	};
	
	Internode.prototype.UsageFailure = function( oHttp, sErrorType, ex ) {
		internodeLocal.UsageRetrievedFailure.fire( internodeLocal, {
			Error: oHttp.statusText
			});
	};
	
	Internode.prototype.RequestHistory = function() {
		this.RequestData(this.ApiUrl + this.Service + "/history",
			this.HistorySuccess, this.HistoryFailure );
	};
	
	Internode.prototype.HistorySuccess = function( oData, sStatus ) {
		
		var aData = [];
		
		$(oData).find("usage").each(function() {
			var marker = $(this);
			
			oTotalNode = marker.find( "traffic[name='total']" );
			
			var oRecord = {};
			oRecord.Day = marker.attr( "day" );
			oRecord.Total = marker.find( "traffic[name='total']" ).text();
			
			aData.push( oRecord );
		});
		
		internodeLocal.HistoryRetrievedSuccess.fire( internodeLocal, {
			Data: aData
			});
	};
	
	Internode.prototype.HistoryFailure = function( oHttp, sErrorType, ex ) {
		internodeLocal.HistoryRetrievedFailure.fire( internodeLocal, {
			Error: oHttp.statusText
			});
	};
	
	Internode.prototype.InfoSuccess = function( oData, sStatus ) {
		
		var oOutput = {};
		
		
		$(oData).find("service").children().each( function() {
			var marker = $(this);
			
			oOutput[marker[0].nodeName] = marker.text();
			
		});
		
		internodeLocal.InfoRetrievedSuccess.fire( internodeLocal, {
			Data: oOutput
			});
	};
	
	Internode.prototype.InfoFailure = function( oHttp, sErrorType, ex ) {
		
		internodeLocal.InfoRetrievedFailure.fire( internodeLocal, {
			Error: oHttp.statusText
			});
	};
	
	/**************************************
	Generic REST requester
	**************************************/
	Internode.prototype.RequestData = function( sUrl, fSuccessCallback, fFailCallback ) {

		$.ajax({	async: true,
			type: "POST",
			url: sUrl,
			username: this.Username,
			password: this.Password,
			datatype: "xml",
			success: fSuccessCallback,
			error: fFailCallback,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("User-Agent", "NetUsage/" + System.Gadget.version + "(Vista/Win7 Gadget)");
				}
		});
		
		
	};
	
}