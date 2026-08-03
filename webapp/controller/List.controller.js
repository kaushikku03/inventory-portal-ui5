sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "inventory/portal/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment" ,
    "sap/m/MessageToast"
], (Controller,formatter,Filter,FilterOperator,JSONModel,Sorter,Fragment,MessageToast) => {
    "use strict";
    return Controller.extend("inventory.portal.controller.List", {
        formatter: formatter,
        onInit: function () {
            const oViewModel = new JSONModel({
                    visibleCount: 0
                });
            this.getView().setModel(oViewModel, "view");

            this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            formatter.setResourceBundle(this._oBundle);
        },
        onUpdateFinished: function (oEvent) {
            this.getView().getModel("view").setProperty(
                "/visibleCount",
                oEvent.getSource().getItems().length
            );
        },
        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            const oTable = this.byId("productsTable");
            const oBinding = oTable.getBinding("items");
            if (!sQuery) {
                oBinding.filter([]);
                return;
            }
            const aFilters = [
                new Filter("name", FilterOperator.Contains, sQuery),
                new Filter("category", FilterOperator.Contains, sQuery)
            ];
            const oFilter = new Filter({
                filters: aFilters,
                and: false
            });
            oBinding.filter(oFilter);
        },
        onAdd: async function () {
            // Load fragment only once
            if (!this._oProductDialog) {
                this._oProductDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "inventory.portal.fragment.AddEditProduct",
                    controller: this
                });
                this.getView().addDependent(this._oProductDialog);
            }
            // Create empty form model
            const oFormModel = new JSONModel({
                dialogTitle: this._oBundle.getText("addProduct"),
                productId: this._generateProductId(),
                name: "",
                category: "",
                sku: "",
                supplier: "",
                warehouse: "",
                description: "",
                price: 0,
                currency: "USD",
                stock: 0,
                reorderThreshold: 0,
                lastUpdated: new Date().toISOString().split("T")[0],
                validation: {
                    nameState: "None",
                    categoryState: "None",
                    skuState: "None",
                    priceState: "None",
                    stockState: "None",
                    reorderState: "None"

                }

            });
            this.getView().setModel(oFormModel, "form");
            this._oProductDialog.open();
        },
        onProductPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext("products");
            this.getOwnerComponent().getRouter().navTo("Detail", {
                productId: oContext.getProperty("productId")
            });
        },
        onSort: function () {
            this._openViewSettings("sort");
        },
        onFilter: function () {
            this._openViewSettings("filter");
        },
        onGroup: function () {
            this._openViewSettings("group");
        },
        _openViewSettings: async function (sPage) {
            if (!this._oDialog) {
                this._oDialog = await this.loadFragment({
                    name: "inventory.portal.fragment.ViewSettings"
                });
            }
            this._oDialog.open(sPage);
        },
        onViewSettingsConfirm: function (oEvent) {
            const oTable = this.byId("productsTable");
            const oBinding = oTable.getBinding("items");
            const aSorters = [];
            const aFilters = [];
            const oSortItem = oEvent.getParameter("sortItem");
            if (oSortItem) {
                const bDescending = oEvent.getParameter("sortDescending");
                aSorters.push(
                    new Sorter(
                        oSortItem.getKey(),
                        bDescending
                    )
                );
            }
            const oGroupItem = oEvent.getParameter("groupItem");
            if (oGroupItem) {
                aSorters.unshift(
                    new Sorter(
                        oGroupItem.getKey(),
                        false,
                        true
                    )
                );
            }
            const aFilterItems = oEvent.getParameter("filterItems");
            aFilterItems.forEach(function (oItem) {
                switch (oItem.getKey()) {
                    case "available":
                        aFilters.push(
                            new Filter("stockStatus", FilterOperator.EQ, "AVAILABLE")
                        );
                        break;

                    case "low":
                        aFilters.push(
                            new Filter("stockStatus", FilterOperator.EQ, "LOW")
                        );
                        break;

                    case "out":
                        aFilters.push(
                            new Filter("stockStatus", FilterOperator.EQ, "OUT")
                        );
                        break;
                    case "0-50":
                        aFilters.push(
                            new Filter("price", FilterOperator.BT, 0, 50)
                        );
                        break;

                    case "50-100":
                        aFilters.push(
                            new Filter("price", FilterOperator.BT, 50, 100)
                        );
                        break;

                    case "100+":
                        aFilters.push(
                            new Filter("price", FilterOperator.GT, 100)
                        );
                        break;
                }
            });
            oBinding.sort(aSorters);
            oBinding.filter(aFilters);
        },
        _generateProductId: function () {
            const aProducts = this.getOwnerComponent()
                .getModel("products")
                .getProperty("/products");
            const iNext = aProducts.length + 1001;
            return "P-" + iNext;
        },
        onCancelProduct: function () {
            this._oProductDialog.close();
        },
        onValidateForm: function () {
            this._validateForm();
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
            // Remove UI-only properties
            delete oProduct.dialogTitle;
            delete oProduct.validation;
            // Calculate stock status
            oProduct.stockStatus = formatter.stockStatus(
                oProduct.stock,
                oProduct.reorderThreshold
            );
            // Add to products model
            const oProductsModel = this.getOwnerComponent().getModel("products");
            const aProducts = oProductsModel.getProperty("/products");
            aProducts.push(oProduct);
            oProductsModel.refresh(true);
            this._oProductDialog.close();
            MessageToast.show(this._oBundle.getText("productAdded"));
        },
        _validateForm: function () {
            const oFormModel = this.getView().getModel("form");
            const oData = oFormModel.getData();
            const oValidation = oData.validation;
            let bValid = true;
            // Name
            oValidation.nameState =
                oData.name.trim() ? "None" : "Error";
            if (oValidation.nameState === "Error") {
                bValid = false;
            }
            // Category
            oValidation.categoryState =
                oData.category.trim() ? "None" : "Error";
            if (oValidation.categoryState === "Error") {
                bValid = false;
            }

            // SKU
            oValidation.skuState =
                oData.sku.trim() ? "None" : "Error";
            if (oValidation.skuState === "Error") {
                bValid = false;
            }

            // Price
            oValidation.priceState =
                Number(oData.price) >= 0 ? "None" : "Error";
            if (oValidation.priceState === "Error") {
                bValid = false;
            }

            // Stock
            oValidation.stockState =
                Number(oData.stock) >= 0 ? "None" : "Error";
            if (oValidation.stockState === "Error") {
                bValid = false;
            }

            // Reorder Threshold
            oValidation.reorderState =
                Number(oData.reorderThreshold) >= 0 ? "None" : "Error";
            if (oValidation.reorderState === "Error") {
                bValid = false;
            }
            oFormModel.refresh(true);
            return bValid;
        }
    });
});