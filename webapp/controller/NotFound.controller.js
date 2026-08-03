sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("inventory.portal.controller.NotFound", {

        onInit: function () {

            const oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("DetailNotFound")
                .attachPatternMatched(this._onDetailNotFound, this);

            oRouter.getRoute("CatchAll")
                .attachPatternMatched(this._onAppNotFound, this);

        },
        onNavBack: function () {

            this.getOwnerComponent()
                .getRootControl()
                .byId("fcl")
                .setLayout("OneColumn");

            this.getOwnerComponent()
                .getRouter()
                .navTo("List", {}, true);

        },

        onHomePress: function () {

            this.getOwnerComponent()
                .getRootControl()
                .byId("fcl")
                .setLayout("OneColumn");

            this.getOwnerComponent()
                .getRouter()
                .navTo("List", {}, true);

        },

        _onDetailNotFound: function () {
            this.getOwnerComponent()
                .getRootControl()
                .byId("fcl")
                .setLayout("TwoColumnsMidExpanded");
        },

        _onAppNotFound: function () {
            this.getOwnerComponent()
                .getRootControl()
                .byId("fcl")
                .setLayout("OneColumn");
        }

    });
});