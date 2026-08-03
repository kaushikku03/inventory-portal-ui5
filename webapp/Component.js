sap.ui.define([
    "sap/ui/core/UIComponent",
    "inventory/portal/model/formatter"
], (UIComponent,formatter) => {
    "use strict";

    return UIComponent.extend("inventory.portal.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            const oProductsModel = this.getModel("products");

            oProductsModel.attachRequestCompleted(() => {

                const aProducts = oProductsModel.getProperty("/products") || [];

                aProducts.forEach((oProduct) => {
                    oProduct.stockStatus = formatter.stockStatus(
                        oProduct.stock,
                        oProduct.reorderThreshold
                    );
                });

                oProductsModel.refresh(true);

            });

            // enable routing
            this.getRouter().initialize();
        }
    });
});