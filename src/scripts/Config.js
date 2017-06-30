/**************************************
Copyright ConryClan 2009
**************************************/

/**************************************
Config Class
**************************************/
function Config() {
	this.Title = "";
	this.Isp = new Internode();
	
	/**************************************
	Load from json
	**************************************/
	Config.prototype.Load = function( sJson ) {

		var tempConfig = Json.Decode(sJson);
    		
    	Hydrate( tempConfig, this );
	};
	
}

