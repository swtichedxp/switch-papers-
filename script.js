document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRender();
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-links-container').classList.toggle('active');
    });
});

let wallpaperData;
const WALLPAPERS_PER_PAGE = 12;

const fetchDataAndRender = async () => {
    try {
        const response = await fetch('wallpapers.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        wallpaperData = await response.json();
        renderCategories(wallpaperData.categories);
        renderHomePage();
    } catch (error) {
        console.error('There was a problem fetching the data:', error);
    }
};

const renderCategories = (categories) => {
    const navLinksContainer = document.getElementById('nav-links-container');
    navLinksContainer.innerHTML = '';

    const homeLink = document.createElement('li');
    homeLink.innerHTML = `<a href="#" data-page="home">Home</a>`;
    navLinksContainer.appendChild(homeLink);

    categories.forEach((category) => {
        const navLinkItem = document.createElement('li');
        navLinkItem.innerHTML = `<a href="#" data-page="category" data-category-id="${category.id}">${category.name}</a>`;
        navLinksContainer.appendChild(navLinkItem);
    });

    navLinksContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const pageType = e.target.dataset.page;
            if (pageType === 'home') {
                renderHomePage();
            } else if (pageType === 'category') {
                const categoryId = e.target.dataset.categoryId;
                renderCategoryPage(categoryId, 1);
            }
        }
    });
};

const renderHomePage = () => {
    const mainContent = document.querySelector('.content');
    mainContent.innerHTML = `
        <header class="homepage-header">
            <h2 class="homepage-title">Switchpaper</h2>
            <p class="homepage-subtitle">Discover the perfect wallpaper for your screen.</p>
        </header>
        <section class="category-grid" id="category-grid-container"></section>
    `;
    document.body.style.backgroundImage = 'none';

    const categoryGridContainer = document.getElementById('category-grid-container');
    const categories = wallpaperData.categories;

    categories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.style.animationDelay = `${index * 0.1}s`;
        categoryCard.innerHTML = `
            <a href="#" data-page="category" data-category-id="${category.id}">
                <img src="${category.category_image_url}" alt="${category.name}">
                <div class="category-info">
                    <h3>${category.name}</h3>
                </div>
            </a>
        `;
        categoryGridContainer.appendChild(categoryCard);
    });

    categoryGridContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                e.preventDefault();
                const categoryId = e.target.closest('a').dataset.categoryId;
                renderCategoryPage(categoryId, 1);
            }
        });
    });
};

const renderCategoryPage = (categoryId, page = 1) => {
    const category = wallpaperData.categories.find(cat => cat.id === categoryId);
    if (!category) {
        console.error('Category not found:', categoryId);
        return;
    }

    const mainContent = document.querySelector('.content');
    const start = (page - 1) * WALLPAPERS_PER_PAGE;
    const end = start + WALLPAPERS_PER_PAGE;
    const paginatedWallpapers = category.wallpapers.slice(start, end);

    mainContent.innerHTML = `
        <header class="category-page-header">
            <h2 class="category-title">${category.name} Wallpapers</h2>
        </header>
        <section class="wallpaper-grid" id="wallpaper-grid-container"></section>
        <div id="pagination-container" class="pagination"></div>
    `;

    document.body.style.backgroundImage = `url(${category.category_image_url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';

    const wallpaperGridContainer = document.getElementById('wallpaper-grid-container');
    paginatedWallpapers.forEach((wallpaper, index) => {
        const wallpaperCard = document.createElement('div');
        wallpaperCard.className = 'wallpaper-card';
        wallpaperCard.style.animationDelay = `${index * 0.1}s`;
        const fileName = wallpaper.url.split('/').pop().split('?')[0];
        wallpaperCard.innerHTML = `
            <img src="${wallpaper.url}" alt="${wallpaper.title}">
            <a href="${wallpaper.url}" download="${fileName}" class="download-btn">Download</a>
        `;
        wallpaperGridContainer.appendChild(wallpaperCard);
    });

    renderPagination(categoryId, page, category.wallpapers.length);
};

const renderPagination = (categoryId, currentPage, totalWallpapers) => {
    const totalPages = Math.ceil(totalWallpapers / WALLPAPERS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    if (totalPages > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.className = 'page-btn';
        if (currentPage === 1) prevButton.classList.add('disabled');
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) renderCategoryPage(categoryId, currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.className = 'page-btn';
        if (currentPage === totalPages) nextButton.classList.add('disabled');
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) renderCategoryPage(categoryId, currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
};
