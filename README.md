# Inventory Portal

A responsive **Inventory Management Portal** built using **SAP UI5** following the MVC architecture. The application allows users to manage inventory products with features such as CRUD operations, searching, filtering, sorting, grouping, localization, and responsive master-detail navigation.

---

## Tech Stack

- SAP UI5
- JavaScript (ES6)
- XML Views
- JSON Model
- SAP Fiori Controls
- MVC Architecture
- SAP Business Application Studio (BAS)

---

## Features

### Product Management
- View all inventory products
- Add new products
- Edit existing products
- Delete products
- Product details page

### Search & Filter
- Live search by product name
- Filter products
- Sort products
- Group products

### Responsive Layout
- Master-Detail Navigation
- Responsive UI

### Localization (i18n)
- English
- Hindi
- Easily extendable to additional languages

### User Experience
- Fragment-based dialogs
- Validation
- Toast messages
- Confirmation dialogs

---

# Project Structure

```
Inventory-Portal/
│
├── webapp/
│   ├── controller/
│   │   ├── App.controller.js
│   │   ├── List.controller.js
│   │   ├── Detail.controller.js
│   │   └── NotFound.controller.js
│   │
│   ├── view/
│   │   ├── App.view.xml
│   │   ├── List.view.xml
│   │   ├── Detail.view.xml
│   │   └── NotFound.view.xml
│   │
│   ├── model/
│   │   ├── formatter.js
│   │   └── products.json
│   │
│   ├── i18n/
│   │   ├── i18n.properties
│   │   ├── i18n_en.properties
│   │   └── i18n_hi.properties
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── AddEditProduct.fragment.xml
│   ├── ViewSettings.fragment.xml
│   ├── Component.js
│   ├── manifest.json
│   └── index.html
│
└── README.md
```

---

# Architecture

The project follows the SAP UI5 MVC architecture.

- **Model**
  - JSON Model (`products.json`)
  - Formatter (`formatter.js`)

- **View**
  - XML Views
  - XML Fragments

- **Controller**
  - Business logic
  - Navigation
  - CRUD operations
  - Event handling

---

# How to Run in SAP Business Application Studio (BAS)

## Prerequisites

- SAP Business Application Studio
- Node.js
- UI5 CLI
- SAP Fiori Tools Extension Pack

---

## Steps

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Open the project in BAS

Open the project folder inside SAP Business Application Studio.

---

### 3. Install dependencies

```bash
npm install
```

---

### 4. Start the application

Using Fiori Tools:

```
Right Click Project
→ Preview Application
```

or

```bash
npm start
```

or

```bash
ui5 serve
```

---

### 5. Open in Browser

The application launches automatically.

If not, open

```
http://localhost:8080
```

---

# Routing

The application uses routing defined in **manifest.json**.

Routes include:

- Product List
- Product Detail
- Not Found

---

# Data Source

Current application uses a local JSON Model.

```
webapp/model/products.json
```

---

# Localization

Localization files are available in:

```
webapp/i18n/
```

Supported languages:

- English
- Hindi

---

# Main Components

| Component | Purpose |
|----------|----------|
| List View | Displays inventory products |
| Detail View | Shows selected product details |
| Add/Edit Fragment | Add or edit products |
| View Settings Fragment | Sorting, Filtering, Grouping |
| Formatter | Data formatting |
| JSON Model | Local product data |

---

# Concepts Covered

- MVC Architecture
- XML Views & Controllers
- JSON Model & Data Binding
- Routing & Navigation
- Search, Sort, Filter & Group
- Fragments & Dialogs
- Formatter
- Internationalization (i18n)
- Responsive Design
- Manifest Configuration

---

# Screens Included

- Product List
- Product Detail
- Add Product Dialog
- Edit Product Dialog
- Sort / Filter / Group Dialog

---

# Author

**Kaushik K U**
---