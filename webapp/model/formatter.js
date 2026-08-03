sap.ui.define([
    "sap/ui/core/format/DateFormat"
],(DateFormat)=>{
    "use strict";
    let oBundle = null;

    return {
        setResourceBundle: function (oResourceBundle) {
            oBundle = oResourceBundle;
        },

        stockStatus: function (iStock, iReorderThreshold) {

            if (iStock === 0) {
                return "OUT";
            }

            if (iStock <= iReorderThreshold) {
                return "LOW";
            }

            return "AVAILABLE";
        },
        stockText: function (sStatus) {
            if (!oBundle) {
                return sStatus;
            }
            switch (sStatus) {
                case "AVAILABLE":
                    return oBundle.getText("available");

                case "LOW":
                    return oBundle.getText("lowStock");

                case "OUT":
                    return oBundle.getText("outOfStock");

                default:
                    return "";
            }
        },
        stockState: function (sStatus) {
            switch (sStatus) {
                case "AVAILABLE":
                    return "Success";

                case "LOW":
                    return "Warning";

                case "OUT":
                    return "Error";

                default:
                    return "None";
            }
        },
        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            const oFormatter = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd MMM yyyy"
            });
            return oFormatter.format(new Date(sDate));
        }
    };
});