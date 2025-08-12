document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRender();
});

let wallpaperData; // Store the fetched data globally

const fetchDataAndRender = async () => {
    try {
        const response = await fetch('wallpapers.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        wallpaperData = await response.json();
        renderCategories(wallpaperData.categories);
        // Load a default page, e.g., the homepage
        renderHomePage();
    } catch (error) {
        console.error('There was a problem fetching the data:', error);
    }
};

const renderCategories = (categories) => {
    const navLinksContainer = document.getElementById('nav-links-container');
    navLinksContainer.innerHTML = ''; // Clear previous links

    categories.forEach((category) => {
        const navLinkItem = document.createElement('li');
        navLinkItem.innerHTML = `<a href="#" data-category-id="${category.id}">${category.name}</a>`;
        navLinksContainer.appendChild(navLinkItem);
    });

    // Add event listeners for the new links
    navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.target.dataset.categoryId;
            renderCategoryPage(categoryId);
        });
    });
};

const renderHomePage = () => {
    const mainContent = document.querySelector('.content');
    mainContent.innerHTML = `
        <header class="homepage-header">
            <h2 class="homepage-title">Eclectic Collection</h2>
            <p class="homepage-subtitle">Discover the perfect wallpaper for your screen.</p>
        </header>

        <section class="category-grid" id="category-grid-container"></section>
    `;

    const categoryGridContainer = document.getElementById('category-grid-container');
    const categories = wallpaperData.categories;

    categories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.style.animationDelay = `${index * 0.1}s`;
        categoryCard.innerHTML = `
            <a href="#" data-category-id="${category.id}">
                <img src="${category.category_image_url}" alt="${category.name}">
                <div class="category-info">
                    <h3>${category.name}</h3>
                </div>
            </a>
        `;
        categoryGridContainer.appendChild(categoryCard);

        categoryCard.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.target.dataset.categoryId;
            renderCategoryPage(categoryId);
        });
    });
};

const renderCategoryPage = (categoryId) => {
    const category = wallpaperData.categories.find(cat => cat.id === categoryId);
    if (!category) {
        console.error('Category not found:', categoryId);
        return;
    }

    const mainContent = document.querySelector('.content');
    mainContent.innerHTML = `
        <header class="category-page-header" style="background-image: url(${category.category_image_url});">
            <h2 class="category-title">${category.name} Wallpapers</h2>
        </header>

        <section class="wallpaper-grid" id="wallpaper-grid-container">
            </section>
    `;

    // Update body background for the specific category
    document.body.style.backgroundImage = `url(${category.category_image_url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';

    const wallpaperGridContainer = document.getElementById('wallpaper-grid-container');
    category.wallpapers.forEach((wallpaper, index) => {
        const wallpaperCard = document.createElement('div');
        wallpaperCard.className = 'wallpaper-card';
        wallpaperCard.style.animationDelay = `${index * 0.1}s`;
        wallpaperCard.innerHTML = `<img src="${wallpaper.url}" alt="${wallpaper.title}">`;
        wallpaperGridContainer.appendChild(wallpaperCard);
    });
};
