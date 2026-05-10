const translations = {
    en: {
        language: "Language:",
        appTitle: "Inventory App With JS & TailwindCSS",
        addCategoryTitle: "Add New Category",
        addProductTitle: "Add New Product",
        productListTitle: "Products List",
        titleLabel: "Title",
        descLabel: "Description",
        cancelBtn: "Cancel",
        addCatBtn: "Add Category",
        quantityLabel: "Quantity",
        locationLabel: "Location",
        selectLocation: "- select location -",
        categoryLabel: "Category",
        selectCategory: "- select category -",
        addProdBtn: "Add Product",
        searchPlaceholder: "Search...",
        sortNewest: "Newest",
        sortOldest: "Oldest",
        cookieMsg: "We use localStorage to save your preferences and data. By continuing to use this site, you agree to our Privacy Policy.",
        privacyLink: "Privacy Policy",
        cookieAccept: "Accept",
    },
    zh: {
        language: "语言:",
        appTitle: "库存管理系统 (JS & Tailwind)",
        addCategoryTitle: "添加新分类",
        addProductTitle: "添加新产品",
        productListTitle: "产品列表",
        titleLabel: "标题",
        descLabel: "描述",
        cancelBtn: "取消",
        addCatBtn: "确认添加分类",
        quantityLabel: "数量",
        locationLabel: "存放位置",
        selectLocation: "- 请选择位置 -",
        categoryLabel: "所属分类",
        selectCategory: "- 请选择分类 -",
        addProdBtn: "确认添加产品",
        searchPlaceholder: "搜索产品...",
        sortNewest: "最新",
        sortOldest: "最旧",
        cookieMsg: "我们使用 localStorage 来保存您的偏好和数据。继续使用本网站即表示您同意我们的隐私政策。",
        privacyLink: "隐私政策",
        cookieAccept: "接受",
    },
}

function updateLanguage(lang) {
    const activeTranslations = translations[lang] || translations.en
    const elements = document.querySelectorAll("[data-i18n]")

    elements.forEach((element) => {
        const key = element.getAttribute("data-i18n")
        if (!activeTranslations[key]) {
            return
        }

        if (element.tagName === "INPUT" && element.hasAttribute("placeholder")) {
            element.placeholder = activeTranslations[key]
        } else {
            element.textContent = activeTranslations[key]
        }
    })

    localStorage.setItem("selectedLanguage", lang)
}

window.updateLanguage = updateLanguage

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("language-select")
    const savedLang = localStorage.getItem("selectedLanguage") || "en"

    if (langSelect) {
        langSelect.value = savedLang
        langSelect.addEventListener("change", (event) => {
            updateLanguage(event.target.value)
        })
    }

    updateLanguage(savedLang)

    const cookieBanner = document.getElementById("cookie-banner")
    const acceptButton = document.getElementById("accept-cookie")
    const hasConsented = localStorage.getItem("cookieConsent")

    if (cookieBanner && !hasConsented) {
        cookieBanner.classList.remove("hidden")
        cookieBanner.style.display = ""
    }

    if (acceptButton && cookieBanner) {
        acceptButton.addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "true")
            cookieBanner.style.display = "none"
        })
    }
})
