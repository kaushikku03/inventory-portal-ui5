sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History"
], function (
    Controller,
    UIComponent,
    History
) {
    "use strict";

    return Controller.extend("inventory.portal.controller.NotFound", {

        onNavBack: function () {
            sap.ui.core.UIComponent
                .getRouterFor(this)
                .navTo("List", {}, true);
        },
        onHomePress: function () {
            UIComponent.getRouterFor(this).navTo("List", {}, true);
        }

    });

});