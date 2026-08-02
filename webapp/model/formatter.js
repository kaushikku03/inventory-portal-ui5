sap.ui.define([
    "sap/ui/core/format/DateFormat"
],(DateFormat)=>{
    "use strict";
    return {
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

            switch (sStatus) {
                case "AVAILABLE":
                    return "Available";

                case "LOW":
                    return "Low Stock";

                case "OUT":
                    return "Out of Stock";

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