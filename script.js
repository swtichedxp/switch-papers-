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
    mainContent.innerHTML = '';
    document.body.style.backgroundImage = 'none';

    const homepageHeader = document.createElement('header');
    homepageHeader.className = 'hero-section';
    homepageHeader.style.backgroundImage = `url(homepage-cover.jpg)`;
    homepageHeader.innerHTML = `
        <h2 class="hero-title">Discover the perfect wallpaper</h2>
    `;
    mainContent.appendChild(homepageHeader);

    const categoryGridContainer = document.createElement('section');
    categoryGridContainer.className = 'category-hero-grid';
    mainContent.appendChild(categoryGridContainer);

    const categories = wallpaperData.categories;

    categories.forEach((category) => {
        const categoryHero = document.createElement('a');
        categoryHero.className = 'category-hero';
        categoryHero.href = '#';
        categoryHero.dataset.page = 'category';
        categoryHero.dataset.categoryId = category.id;
        categoryHero.style.backgroundImage = `url(${category.category_image_url})`;
        categoryHero.innerHTML = `<h3>${category.name}</h3>`;
        categoryGridContainer.appendChild(categoryHero);

        categoryHero.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.target.dataset.categoryId;
            renderCategoryPage(categoryId, 1);
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
    mainContent.innerHTML = '';

    const categoryHeroHeader = document.createElement('header');
    categoryHeroHeader.className = 'hero-section';
    categoryHeroHeader.style.backgroundImage = `url(${category.category_image_url})`;
    categoryHeroHeader.innerHTML = `<h2 class="hero-title">${category.name} Wallpapers</h2>`;
    mainContent.appendChild(categoryHeroHeader);
    document.body.style.backgroundImage = `none`;

    const start = (page - 1) * WALLPAPERS_PER_PAGE;
    const end = start + WALLPAPERS_PER_PAGE;
    const paginatedWallpapers = category.wallpapers.slice(start, end);

    const wallpaperGridContainer = document.createElement('section');
    wallpaperGridContainer.className = 'wallpaper-grid';
    mainContent.appendChild(wallpaperGridContainer);

    paginatedWallpapers.forEach((wallpaper) => {
        const wallpaperCard = document.createElement('div');
        wallpaperCard.className = 'wallpaper-card';
        wallpaperCard.innerHTML = `
            <img src="${wallpaper.url}" alt="${wallpaper.title}">
            <button class="download-btn" data-url="${wallpaper.url}" data-filename="${wallpaper.title}.jpg">Download</button>
        `;
        wallpaperGridContainer.appendChild(wallpaperCard);
    });

    // New event listener for the download buttons
    mainContent.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const imageUrl = e.target.dataset.url;
            const filename = e.target.dataset.filename;

            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } catch (error) {
                console.error('Download failed:', error);
                alert('Could not download the image. Please try again.');
            }
        });
    });

    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'pagination';
    mainContent.appendChild(paginationContainer);

    renderPagination(categoryId, page, category.wallpapers.length);
};

const renderPagination = (categoryId, currentPage, totalWallpapers) => {
    const totalPages = Math.ceil(totalWallpapers / WALLPAPERS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
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
