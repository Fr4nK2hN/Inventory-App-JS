import Storage from "./storage.js";

export default class ProductView {
    constructor() {
        // variables
        this.pdtTitle = document.querySelector("#productTitle")
        this.pdtIncQty = document.querySelector("#incQty")
        this.pdtDecQty = document.querySelector("#decQty")
        this.pdtLocation = document.querySelector("#productLocations")
        this.ctgSelect = document.querySelector("#categoriesSelect")
        this.pdtAddNew = document.querySelector("#addNewProductBtn")
        this.pdtQty = document.querySelector("#productQuantity")
        this.productCenter = document.querySelector("#productsCenter")
        this.toggleBtns = document.querySelectorAll(".toggleBtn")
        this.searchInput = document.querySelector("#searchInput")
        this.sortSelect = document.querySelector("#sort")

        // event listeners
        this.pdtAddNew.addEventListener("click", () => {
            this.addNewProduct()
        })
        this.toggleBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.toggleProductQty(e)
            })
        })
        this.searchInput.addEventListener("keyup", (e) => {
            this.searchProducts(e.target.value)
        })
        this.sortSelect.addEventListener("change", (e) => {
            this.sortBySelect(e.target.value)
        })
    }

    setupApp() {
        this.showListedProducts(Storage.getProducts)
        this.sortBySelect(this.sortSelect.value)
    }

    // ==================== Member B: 产品校验核心功能 ====================
    addNewProduct() {
        const title = this.pdtTitle.value.trim();
        const quantity = Number(this.pdtQty.innerText);
        const location = this.pdtLocation.value;
        const category = this.ctgSelect.value;

        // 完整校验
        if (title.length < 2) {
            alert("Title must be at least 2 characters!");
            return;
        }
        if (location === "none") {
            alert("Please select a location!");
            return;
        }
        if (category === "none") {
            alert("Please select a category!");
            return;
        }
        if (quantity < 0) {
            alert("Quantity cannot be negative!");
            return;
        }

        // 创建新产品（quantity 作为数字保存）
        const newProduct = {
            id: Date.now(),
            title: title,
            quantity: quantity,                    // ← 改为数字
            location: location,
            category: category,
            persianDate: new Date().toLocaleDateString("fa-IR")
        };

        // 保存到 localStorage
        const pdtList = Storage.getProducts;
        pdtList.push(newProduct);
        Storage.saveProducts(pdtList);

        // 成功反馈 + 重置表单
        alert("Product added successfully!");
        this.resetForm();

        // 刷新列表
        this.sortBySelect(this.sortSelect.value);
        this.showListedProducts(pdtList);
    }

    toggleProductQty(e) {
        switch (e.currentTarget.id) {
            case "incQty":
                this.pdtQty.innerText = Number(this.pdtQty.innerText) + 1;
                break;
            case "decQty":
                let current = Number(this.pdtQty.innerText);
                if (current > 0) {
                    this.pdtQty.innerText = current - 1;
                }
                break;
        }
    }

    resetForm() {
        this.pdtTitle.value = '';
        this.pdtQty.innerText = '0';
        this.pdtLocation.value = "none";
        this.ctgSelect.value = "none";
    }
    // ==================== 原有功能保持不变 ====================

    showListedProducts(productList) {
        this.productCenter.replaceChildren(...productList.map((product) => this.createProductListItem(product)))
        this.productsAction()
    }

    createProductListItem(product) {
        const listItem = document.createElement("li")
        listItem.className = "flex items-center justify-between  w-full py-2 bg-blue-400/ text-white font-medium ss:min-w-[500px] ss:overflow-x-auto "

        listItem.append(
            this.createTextColumn(product.title),
            this.createTextColumn(product.location),
            this.createTextColumn(product.category),
            this.createTextColumn(product.persianDate, "font-vazir"),
            this.createQuantityColumn(product.quantity),
            this.createDeleteIcon(product.id)
        )

        return listItem
    }

    createTextColumn(value, extraClass = "") {
        const column = document.createElement("p")
        column.className = `basis-[16%] ww:text-base xx:text-[15px] dd:text-[14px] ss:text-[13px] ${extraClass}`.trim()
        column.textContent = value ?? ""
        return column
    }

    createQuantityColumn(value) {
        const column = document.createElement("p")
        column.className = "border-2 border-slate-400 p-1 rounded-2xl ww:text-base xx:text-[15px] dd:text-[14px] ss:text-[13px] "
        column.textContent = value ?? ""
        return column
    }

    createDeleteIcon(productId) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.id = String(productId)
        svg.classList.add("pdt-dlt-btn", "stroke-red-500", "dd:h-6", "dd:w-6", "ss:h-5", "ss:w-5", "cursor-pointer")
        svg.setAttribute("fill", "none")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("stroke-width", "1.5")
        svg.setAttribute("stroke", "currentColor")

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("stroke-linecap", "round")
        path.setAttribute("stroke-linejoin", "round")
        path.setAttribute("d", "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0")

        svg.append(path)
        return svg
    }

    productsAction() {
        const removeBtns = [...document.querySelectorAll(".pdt-dlt-btn")]
        removeBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.deleteProduct(e)
            })
        })
    }

    deleteProduct(e) {
        const productId = Number(e.currentTarget.id)
        Storage.removeProduct(productId)
        this.showListedProducts(Storage.getProducts)
        this.sortBySelect(this.sortSelect.value)
    }

    searchProducts(searchTerm) {
        const addedProducts = Storage.getProducts
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        const filteredProducts = addedProducts.filter((product) =>
            product.title.toLowerCase().trim().includes(normalizedSearchTerm)
        );
        this.sortBySelect(this.sortSelect.value)
        this.showListedProducts(filteredProducts);
    }

    sortBySelect(sortType) {
        let saveProducts = Storage.getProducts
        let sortedProducts = [];
        if (sortType === "newest") {
            sortedProducts = saveProducts.slice().sort((a, b) => b.id - a.id);
        } else if (sortType === "oldest") {
            sortedProducts = saveProducts.slice().sort((a, b) => a.id - a.id);
        } else if (sortType === "A-Z") {
            sortedProducts = saveProducts.slice().sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
        } else if (sortType === "Z-A") {
            sortedProducts = saveProducts.slice().sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase())).reverse()
        } else {
            sortedProducts = saveProducts.slice();
        }
        this.showListedProducts(sortedProducts);
    }
}