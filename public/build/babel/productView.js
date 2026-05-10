"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _storage = _interopRequireDefault(require("./storage.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ProductView = exports["default"] = /*#__PURE__*/function () {
  function ProductView() {
    var _this = this;
    _classCallCheck(this, ProductView);
    this.pdtTitle = document.querySelector("#productTitle");
    this.pdtIncQty = document.querySelector("#incQty");
    this.pdtDecQty = document.querySelector("#decQty");
    this.pdtLocation = document.querySelector("#productLocations");
    this.ctgSelect = document.querySelector("#categoriesSelect");
    this.pdtAddNew = document.querySelector("#addNewProductBtn");
    this.pdtQty = document.querySelector("#productQuantity");
    this.productCenter = document.querySelector("#productsCenter");
    this.toggleBtns = document.querySelectorAll(".toggleBtn");
    this.searchInput = document.querySelector("#searchInput");
    this.sortSelect = document.querySelector("#sort");
    this.viewState = {
      searchTerm: "",
      sortType: "newest"
    };
    this.pdtAddNew.addEventListener("click", function () {
      _this.addNewProduct();
    });
    this.toggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        _this.toggleProductQty(e);
      });
    });
    this.searchInput.addEventListener("input", function (e) {
      _this.searchProducts(e.target.value);
    });
    this.searchInput.addEventListener("keyup", function (e) {
      _this.searchProducts(e.target.value);
    });
    this.sortSelect.addEventListener("change", function (e) {
      _this.sortBySelect(e.target.value);
    });
    this.productCenter.addEventListener("click", function (e) {
      var deleteButton = e.target.closest(".pdt-dlt-btn");
      if (!deleteButton) {
        return;
      }
      _this.deleteProduct(deleteButton.id);
    });
  }
  return _createClass(ProductView, [{
    key: "setupApp",
    value: function setupApp() {
      this.syncViewStateFromControls();
      this.refreshProductsList();
    }
  }, {
    key: "getAllProducts",
    value: function getAllProducts() {
      return _storage["default"].getProducts;
    }
  }, {
    key: "syncViewStateFromControls",
    value: function syncViewStateFromControls() {
      this.viewState = {
        searchTerm: this.searchInput.value,
        sortType: this.sortSelect.value
      };
    }
  }, {
    key: "setViewStateAndRender",
    value: function setViewStateAndRender(nextPartialState) {
      var nextState = _objectSpread(_objectSpread({}, this.viewState), nextPartialState);
      var hasStateChanged = nextState.searchTerm !== this.viewState.searchTerm || nextState.sortType !== this.viewState.sortType;
      if (!hasStateChanged) {
        return;
      }
      this.viewState = nextState;
      this.refreshProductsList();
    }
  }, {
    key: "normalizeSearchTerm",
    value: function normalizeSearchTerm(searchTerm) {
      return (searchTerm || "").toLowerCase().trim();
    }
  }, {
    key: "normalizeProductTitle",
    value: function normalizeProductTitle(title) {
      return (title || "").toLowerCase().trim();
    }
  }, {
    key: "compareByTitle",
    value: function compareByTitle(a, b) {
      return this.normalizeProductTitle(a.title).localeCompare(this.normalizeProductTitle(b.title));
    }
  }, {
    key: "getSortComparator",
    value: function getSortComparator(sortType) {
      var _this2 = this;
      var comparators = {
        newest: function newest(a, b) {
          return b.id - a.id;
        },
        oldest: function oldest(a, b) {
          return a.id - b.id;
        },
        "A-Z": function AZ(a, b) {
          return _this2.compareByTitle(a, b);
        },
        "Z-A": function ZA(a, b) {
          return _this2.compareByTitle(b, a);
        }
      };
      return comparators[sortType] || null;
    }
  }, {
    key: "matchesSearchTerm",
    value: function matchesSearchTerm(product, normalizedSearchTerm) {
      return this.normalizeProductTitle(product.title).includes(normalizedSearchTerm);
    }
  }, {
    key: "filterProducts",
    value: function filterProducts(products, searchTerm) {
      var _this3 = this;
      var normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
      if (!normalizedSearchTerm) {
        return products.slice();
      }
      return products.filter(function (product) {
        return _this3.matchesSearchTerm(product, normalizedSearchTerm);
      });
    }
  }, {
    key: "sortProducts",
    value: function sortProducts(products, sortType) {
      var comparator = this.getSortComparator(sortType);
      if (!comparator) {
        return products.slice();
      }
      return products.slice().sort(comparator);
    }
  }, {
    key: "deriveVisibleProducts",
    value: function deriveVisibleProducts(products, searchTerm, sortType) {
      var filteredProducts = this.filterProducts(products, searchTerm);
      return this.sortProducts(filteredProducts, sortType);
    }
  }, {
    key: "refreshProductsList",
    value: function refreshProductsList() {
      var allProducts = this.getAllProducts();
      var finalProducts = this.deriveVisibleProducts(allProducts, this.viewState.searchTerm, this.viewState.sortType);
      this.showListedProducts(finalProducts);
    }
  }, {
    key: "resetProductInputs",
    value: function resetProductInputs() {
      this.pdtTitle.value = "";
      this.pdtQty.innerText = "0";
      this.pdtLocation.value = "none";
      this.ctgSelect.value = "none";
    }
  }, {
    key: "getProductFormValues",
    value: function getProductFormValues() {
      return {
        title: this.pdtTitle.value.trim(),
        quantity: Number(this.pdtQty.innerText),
        location: this.pdtLocation.value,
        category: this.ctgSelect.value
      };
    }
  }, {
    key: "validateProductForm",
    value: function validateProductForm(_ref) {
      var title = _ref.title,
        quantity = _ref.quantity,
        location = _ref.location,
        category = _ref.category;
      if (title.length < 2) {
        return "Title must be at least 2 characters!";
      }
      if (location === "none") {
        return "Please select a location!";
      }
      if (category === "none") {
        return "Please select a category!";
      }
      if (!Number.isFinite(quantity) || quantity < 0) {
        return "Quantity cannot be negative!";
      }
      return null;
    }
  }, {
    key: "buildProduct",
    value: function buildProduct(_ref2) {
      var title = _ref2.title,
        quantity = _ref2.quantity,
        location = _ref2.location,
        category = _ref2.category;
      return {
        id: Date.now(),
        title: title,
        quantity: quantity,
        location: location,
        category: category,
        persianDate: new Date().toLocaleDateString("fa-IR")
      };
    }
  }, {
    key: "saveProduct",
    value: function saveProduct(product) {
      var savedProducts = _storage["default"].getProducts;
      savedProducts.push(product);
      _storage["default"].saveProducts(savedProducts);
    }
  }, {
    key: "addNewProduct",
    value: function addNewProduct() {
      var formValues = this.getProductFormValues();
      var validationMessage = this.validateProductForm(formValues);
      if (validationMessage) {
        alert(validationMessage);
        return;
      }
      var newProduct = this.buildProduct(formValues);
      this.saveProduct(newProduct);
      this.resetProductInputs();
      this.refreshProductsList();
    }
  }, {
    key: "toggleProductQty",
    value: function toggleProductQty(e) {
      switch (e.currentTarget.id) {
        case "incQty":
          this.pdtQty.innerText = Number(this.pdtQty.innerText) + 1;
          break;
        case "decQty":
          var current = Number(this.pdtQty.innerText);
          if (current > 0) {
            this.pdtQty.innerText = current - 1;
          }
          break;
      }
    }
  }, {
    key: "showListedProducts",
    value: function showListedProducts(productList) {
      var _this$productCenter,
        _this4 = this;
      (_this$productCenter = this.productCenter).replaceChildren.apply(_this$productCenter, _toConsumableArray(productList.map(function (product) {
        return _this4.createProductListItem(product);
      })));
    }
  }, {
    key: "createProductListItem",
    value: function createProductListItem(product) {
      var listItem = document.createElement("li");
      listItem.className = "flex items-center justify-between  w-full py-2 bg-blue-400/ text-white font-medium ss:min-w-[500px] ss:overflow-x-auto ";
      listItem.append(this.createTextColumn(product.title), this.createTextColumn(product.location), this.createTextColumn(product.category), this.createTextColumn(product.persianDate, "font-vazir"), this.createQuantityColumn(product.quantity), this.createDeleteIcon(product.id));
      return listItem;
    }
  }, {
    key: "createTextColumn",
    value: function createTextColumn(value) {
      var extraClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var column = document.createElement("p");
      column.className = "basis-[16%] ww:text-base xx:text-[15px] dd:text-[14px] ss:text-[13px] ".concat(extraClass).trim();
      column.textContent = value !== null && value !== void 0 ? value : "";
      return column;
    }
  }, {
    key: "createQuantityColumn",
    value: function createQuantityColumn(value) {
      var column = document.createElement("p");
      column.className = "border-2 border-slate-400 p-1 rounded-2xl ww:text-base xx:text-[15px] dd:text-[14px] ss:text-[13px] ";
      column.textContent = value !== null && value !== void 0 ? value : "";
      return column;
    }
  }, {
    key: "createDeleteIcon",
    value: function createDeleteIcon(productId) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = String(productId);
      svg.classList.add("pdt-dlt-btn", "stroke-red-500", "dd:h-6", "dd:w-6", "ss:h-5", "ss:w-5", "cursor-pointer");
      svg.setAttribute("fill", "none");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("stroke-width", "1.5");
      svg.setAttribute("stroke", "currentColor");
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("d", "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0");
      svg.append(path);
      return svg;
    }
  }, {
    key: "deleteProduct",
    value: function deleteProduct(productId) {
      var numericProductId = Number(productId);
      if (Number.isNaN(numericProductId)) {
        return;
      }
      _storage["default"].removeProduct(numericProductId);
      this.refreshProductsList();
    }
  }, {
    key: "searchProducts",
    value: function searchProducts(searchTerm) {
      this.setViewStateAndRender({
        searchTerm: searchTerm
      });
    }
  }, {
    key: "sortBySelect",
    value: function sortBySelect(sortType) {
      this.setViewStateAndRender({
        sortType: sortType
      });
    }
  }]);
}();
