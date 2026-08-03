sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "inventory/portal/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function ( Controller, formatter, MessageBox, MessageToast, UIComponent, History, Fragment, JSONModel ) {
    "use strict";
    return Controller.extend("inventory.portal.controller.Detail", {
        formatter: formatter,
        onInit: function () {

            const oRouter = UIComponent.getRouterFor(this);

            oRouter.getRoute("Detail")
                .attachPatternMatched(this._onObjectMatched, this);
            this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            formatter.setResourceBundle(this._oBundle);
        },
        _onObjectMatched: function (oEvent) {
            const sProductId = oEvent.getParameter("arguments").productId;
            const oModel = this.getOwnerComponent().getModel("products");
            const aProducts = oModel.getProperty("/products");
            const iIndex = aProducts.findIndex(function (oProduct) {
                return oProduct.productId === sProductId;
            });
            if (iIndex === -1) {
                UIComponent.getRouterFor(this).navTo("NotFound");
                return;
            }
            this.getView().bindElement({
                path: "/products/" + iIndex,
                model: "products"
            });

        },
        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                UIComponent.getRouterFor(this).navTo("List", {}, true);
            }
        },
        onEdit: async function () {
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
            oProduct.dialogTitle = this._oBundle.getText("editProduct");
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
                this._oBundle.getText("deleteConfirm"),
                {
                    title: this._oBundle.getText("deleteProduct"),
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
                        MessageToast.show(this._oBundle.getText("productDeleted"));
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
                this._oBundle.getText("stockIncreased", [iBatchSize])
            );
        },
        onCancelProduct: function () {
            this._oProductDialog.close();
        },
        onSaveProduct: function () {
            if (!this._validateForm()) {
                MessageToast.show(this._oBundle.getText("correctHighlightedFields"));
                return;
            }
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
            MessageToast.show(this._oBundle.getText("productUpdated"));
        },
        _validateForm: function () {
            const oFormModel = this.getView().getModel("form");
            const oData = oFormModel.getData();
            const oValidation = oData.validation;
            let bValid = true;
            // Product Name
            oValidation.nameState =
                oData.name && oData.name.trim()
                    ? "None"
                    : "Error";
            if (oValidation.nameState === "Error") {
                bValid = false;
            }
            // Category
            oValidation.categoryState =
                oData.category && oData.category.trim()
                    ? "None"
                    : "Error";
            if (oValidation.categoryState === "Error") {
                bValid = false;
            }
            // SKU
            oValidation.skuState =
                oData.sku && oData.sku.trim()
                    ? "None"
                    : "Error";
            if (oValidation.skuState === "Error") {
                bValid = false;
            }
            // Price
            oValidation.priceState =
                oData.price !== "" &&
                !isNaN(oData.price) &&
                Number(oData.price) >= 0
                    ? "None"
                    : "Error";
            if (oValidation.priceState === "Error") {
                bValid = false;
            }
            // Stock
            oValidation.stockState =
                oData.stock !== "" &&
                !isNaN(oData.stock) &&
                Number(oData.stock) >= 0
                    ? "None"
                    : "Error";
            if (oValidation.stockState === "Error") {
                bValid = false;
            }
            // Reorder Threshold
            oValidation.reorderState =
                oData.reorderThreshold !== "" &&
                !isNaN(oData.reorderThreshold) &&
                Number(oData.reorderThreshold) >= 0
                    ? "None"
                    : "Error";
            if (oValidation.reorderState === "Error") {
                bValid = false;
            }
            oFormModel.checkUpdate(true);
            return bValid;
        }
    });
});