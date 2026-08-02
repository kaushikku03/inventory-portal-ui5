sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "inventory/portal/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    formatter,
    MessageBox,
    MessageToast,
    UIComponent,
    History,
    Fragment,
    JSONModel
) {
    "use strict";

    return Controller.extend("inventory.portal.controller.Detail", {

        formatter: formatter,

        // ------------------------------------------------
        // Lifecycle
        // ------------------------------------------------

        onInit: function () {

            const oRouter = UIComponent.getRouterFor(this);

            oRouter.getRoute("Detail")
                .attachPatternMatched(this._onObjectMatched, this);

        },

        // ------------------------------------------------
        // Route Handling
        // ------------------------------------------------

        _onObjectMatched: function (oEvent) {

            const sProductId = oEvent.getParameter("arguments").productId;

            const oModel = this.getOwnerComponent().getModel("products");

            const aProducts = oModel.getProperty("/products");

            const iIndex = aProducts.findIndex(function (oProduct) {
                return oProduct.productId === sProductId;
            });

            if (iIndex === -1) {
                MessageBox.error("Product not found.");
                return;
            }

            this.getView().bindElement({
                path: "/products/" + iIndex,
                model: "products"
            });

        },

        // ------------------------------------------------
        // Navigation
        // ------------------------------------------------

        onNavBack: function () {

            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                UIComponent.getRouterFor(this).navTo("List", {}, true);
            }

        },

        // ------------------------------------------------
        // Edit
        // ------------------------------------------------

        onEdit: async function () {

            // Load the dialog if it hasn't been loaded yet
            if (!this._oProductDialog) {

                this._oProductDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "inventory.portal.fragment.ProductDialog",
                    controller: this
                });

                this.getView().addDependent(this._oProductDialog);
            }

            const oContext = this.getView().getBindingContext("products");

            const oProduct = {
                ...oContext.getObject()
            };

            oProduct.editPath = oContext.getPath();

            oProduct.dialogTitle = "Edit Product";

            oProduct.validation = {
                nameState: "None",
                categoryState: "None",
                skuState: "None",
                priceState: "None",
                stockState: "None",
                reorderState: "None"
            };

            const oFormModel = new JSONModel(oProduct);

            this.getView().setModel(oFormModel, "form");

            this._oProductDialog.open();
        },

        onDelete: function () {

            MessageBox.confirm(
                "Are you sure you want to delete this product?",
                {
                    title: "Delete Product",

                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO
                    ],

                    emphasizedAction: MessageBox.Action.NO,

                    onClose: function (sAction) {

                        if (sAction !== MessageBox.Action.YES) {
                            return;
                        }

                        const oContext = this.getView().getBindingContext("products");

                        const sPath = oContext.getPath();

                        const iIndex = parseInt(
                            sPath.split("/")[2],
                            10
                        );

                        const oModel = this.getOwnerComponent().getModel("products");

                        const aProducts = oModel.getProperty("/products");

                        aProducts.splice(iIndex, 1);

                        oModel.refresh(true);

                        MessageToast.show("Product deleted.");

                        UIComponent.getRouterFor(this)
                            .navTo("List");

                    }.bind(this)

                }
            );

        },
        onReorder: function () {

            const oContext = this.getView().getBindingContext("products");
            const oModel = oContext.getModel();
            const sPath = oContext.getPath();

            const iCurrentStock = oModel.getProperty(sPath + "/stock");
            const iThreshold = oModel.getProperty(sPath + "/reorderThreshold");

            const iBatchSize = 25;
            const iNewStock = iCurrentStock + iBatchSize;

            // Update stock
            oModel.setProperty(sPath + "/stock", iNewStock);

            // Recalculate stock status
            oModel.setProperty(
                sPath + "/stockStatus",
                formatter.stockStatus(iNewStock, iThreshold)
            );
            MessageToast.show(
                "Stock increased by " + iBatchSize + " units."
            );
        },
        onCancelProduct: function () {

            this._oProductDialog.close();

        },
        onSaveProduct: function () {

            const oFormModel = this.getView().getModel("form");
            const oProduct = { ...oFormModel.getData() };

            // Convert numeric fields
            oProduct.price = Number(oProduct.price);
            oProduct.stock = Number(oProduct.stock);
            oProduct.reorderThreshold = Number(oProduct.reorderThreshold);

            // Save the edit path before deleting it
            const sEditPath = oProduct.editPath;

            // Remove UI-only properties
            delete oProduct.dialogTitle;
            delete oProduct.validation;
            delete oProduct.editPath;

            // Recalculate stock status
            oProduct.stockStatus = formatter.stockStatus(
                oProduct.stock,
                oProduct.reorderThreshold
            );

            const oProductsModel = this.getOwnerComponent().getModel("products");

            // Update the existing product
            oProductsModel.setProperty(sEditPath, oProduct);

            oProductsModel.refresh(true);

            this._oProductDialog.close();

            MessageToast.show("Product updated successfully.");

        }

    });

});