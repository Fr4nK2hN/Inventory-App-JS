// 1. 建立完整的翻译字典
const translations = {
    en: {
        language: "Language:",
        appTitle: "Inventory App With JS & TailwindCSS",
        addCategoryTitle: "Add New Category",
        addProductTitle: "Add New Product",
        productListTitle: "Products List",
        
        // --- 新增的词汇 ---
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
        cookieAccept: "Accept"
    },
    zh: {
        language: "语言:",
        appTitle: "库存管理系统 (JS & Tailwind)",
        addCategoryTitle: "添加新分类",
        addProductTitle: "添加新产品",
        productListTitle: "产品列表",
        
        // --- 新增的词汇 ---
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
        cookieAccept: "接受"
    }
};

// 2. 升级版核心翻译函数
function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // 判断是不是输入框的占位符
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    localStorage.setItem('selectedLanguage', lang);
}
window.updateLanguage = updateLanguage;
// 3. 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('language-select');
    if (!langSelect) return; 

    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    langSelect.value = savedLang;
    updateLanguage(savedLang);

    langSelect.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });
// --- Cookie Banner 逻辑 ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookie');
    
    // 检查浏览器的 localStorage 里是不是已经有 'cookieConsent' 这个记录了
    const hasConsented = localStorage.getItem('cookieConsent');
    
    // 如果没有记录（说明是第一次来），就把 HTML 里的 'hidden' 样式删掉，让横幅显示出来
    if (cookieBanner && !hasConsented) {
        cookieBanner.classList.remove('hidden');
    }

    // 给“接受”按钮绑定点击事件
    if (acceptBtn && cookieBanner) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            // 直接用底层样式强制隐藏，绝对管用！
            cookieBanner.style.display = 'none'; 
        });
    }
});