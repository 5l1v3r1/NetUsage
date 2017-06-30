/**************************************
Copyright ConryClan 2008
**************************************/

/**************************************
Base ISP Class
**************************************/
function ISP() {
	this.Username = "bobo@bigtop.com";
	this.Password = "bobotheclown";
	this.ApiUrl = "";
	this.Usage = null;
	this.UserAgent = "";
}

ISP.GetServices = function() {
	return [];
};

ISP.IspFactory = function( sIspName ) {
	
	switch( sIspName ) {
		case "Internode":
		
			oIsp = new Internode();
			break;

		case "Vodafone":
		
			oIsp = new Vodafone();
			break;

		default:

			return null;
	}	
	
	return oIsp;
};


