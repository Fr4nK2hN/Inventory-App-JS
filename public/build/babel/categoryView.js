"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _storage = _interopRequireDefault(require("./storage.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var CategoryView = exports["default"] = /*#__PURE__*/function () {
  function CategoryView() {
    var _this = this;
    _classCallCheck(this, CategoryView);
    // variables
    this.ctgTitleInput = document.querySelector("#categoryTitle");
    this.ctgDescInput = document.querySelector("#categoryDescription");
    this.ctgCacelBtn = document.querySelector("#categoryCanelBtn");
    this.ctgAddBtn = document.querySelector("#categoryAddNewBtn");
    this.ctgSelect = document.querySelector("#categoriesSelect");
    // event listeners
    this.ctgAddBtn.addEventListener("click", function () {
      _this.addNewCategory();
    });
    this.ctgCacelBtn.addEventListener("click", function () {
      _this.ctgTitleInput.value = ' ';
      _this.ctgDescInput.value = ' ';
    });
  }
  return _createClass(CategoryView, [{
    key: "setupApp",
    value: function setupApp() {
      this.instantCtgUpdate(_storage["default"].getCategories());
    }
  }, {
    key: "normalizeCategoryTitle",
    value: function normalizeCategoryTitle(title) {
      return (title || "").trim();
    }
  }, {
    key: "getCategoryTitleKey",
    value: function getCategoryTitleKey(title) {
      return this.normalizeCategoryTitle(title).toLowerCase();
    }
  }, {
    key: "resetCategoryInputs",
    value: function resetCategoryInputs() {
      this.ctgTitleInput.value = ' ';
      this.ctgDescInput.value = ' ';
    }
  }, {
    key: "buildCategory",
    value: function buildCategory(title, description) {
      return {
        id: new Date().getTime(),
        title: title,
        description: description,
        createdAt: new Date().toISOString()
      };
    }
  }, {
    key: "findCategoryByTitleKey",
    value: function findCategoryByTitleKey(categories, titleKey) {
      var _this2 = this;
      return categories.find(function (category) {
        return _this2.getCategoryTitleKey(category.title) === titleKey;
      });
    }
  }, {
    key: "persistAndRefreshCategories",
    value: function persistAndRefreshCategories(categories) {
      _storage["default"].saveCategories(categories);
      this.instantCtgUpdate(categories);
    }
  }, {
    key: "addNewCategory",
    value: function addNewCategory() {
      var normalizedTitle = this.normalizeCategoryTitle(this.ctgTitleInput.value);
      var normalizedTitleKey = this.getCategoryTitleKey(normalizedTitle);
      if (normalizedTitle.length >= 2) {
        var categoryDescription = this.ctgDescInput.value;
        this.resetCategoryInputs();
        // save category to local storage
        var savedCategories = _storage["default"].getCategories();
        // edit => ... save
        // new => ... save
        var existedItem = this.findCategoryByTitleKey(savedCategories, normalizedTitleKey);
        if (existedItem) {
          // edit
          existedItem.title = normalizedTitle;
          existedItem.description = categoryDescription;
          alert("this category name has been added before so we will update the category description!");
        } else {
          // new
          var newCategory = this.buildCategory(normalizedTitle, categoryDescription);
          savedCategories.push(newCategory);
        }
        this.persistAndRefreshCategories(savedCategories);
      } else {
        alert("your entered title for category must be at least 2 characters!!!");
      }
    }
  }, {
    key: "instantCtgUpdate",
    value: function instantCtgUpdate(categories) {
      var _this3 = this;
      var ctgListTitles = categories.map(function (obj) {
        return (obj.title || "").trim();
      }).filter(Boolean);
      // create option for each category
      this.ctgSelect.innerHTML = " <option selected value=\"none\">- select category -</option>  ";
      ctgListTitles.forEach(function (option) {
        var newOption = document.createElement("option");
        newOption.value = option;
        newOption.textContent = option;
        // append new created option to select tg
        _this3.ctgSelect.append(newOption);
      });
    }
  }]);
}();
