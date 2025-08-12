document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRender();
    
    const menuToggle = document.getElementById('menu-toggle');
    const navLinksContainer = document.getElementById('nav-links-container');
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const autocompleteResults = document.getElementById('autocomplete-results');

    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        searchContainer.classList.remove('active');
    });
    
    searchToggle.addEventListener('click', () => {
        searchContainer.classList.toggle('active');
        navLinksContainer.classList.remove('active');
    });
    
    searchClose.addEventListener('click', () => {
        searchContainer.classList.remove('active');
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length > 0) {
            const suggestions = getAutocompleteSuggestions(query);
            renderSuggestions(suggestions);
        } else {
            autocompleteResults.classList.remove('active');
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.toLowerCase().trim();
            performSearch(query);
            autocompleteResults.classList.remove('active');
            searchContainer.classList.remove('active');
        }
    });

    autocompleteResults.addEventListener('click', (e) => {
        if (e.target.classList.contains('autocomplete-item')) {
            const selectedQuery = e.target.textContent;
            searchInput.value = selectedQuery;
            performSearch(selectedQuery);
            autocompleteResults.classList.remove('active');
            searchContainer.classList.remove('active');
        }
    });
});

let wallpaperData;
const WALLPAPERS_PER_PAGE = 12;

const KEYWORD_MAPPING = {
    'cars': 'cars', 'vehicle': 'cars', 'sport': 'cars', 'speed': 'cars', 'mad': 'cars',
    'anime': 'anime', 'gojo': 'anime',
    'windows': 'windows', 'laptops': 'windows', 'computer': 'windows', 'pc': 'windows'
};

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
            const navLinksContainer = document.getElementById('nav-links-container');
            navLinksContainer.classList.remove('active');

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
    homepageHeader.style.backgroundImage = `url(${wallpaperData.homepage_cover_url})`;
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
        const fileName = wallpaper.url.split('/').pop();
        wallpaperCard.innerHTML = `
            <img src="${wallpaper.url}" alt="${wallpaper.title}">
            <button class="download-btn" data-url="${wallpaper.url}" data-filename="${fileName}">Download</button>
        `;
        wallpaperGridContainer.appendChild(wallpaperCard);
    });

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

const performSearch = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (normalizedQuery === 'all') {
        renderSearchResults(getAllWallpapers(), 'All Wallpapers');
        return;
    }

    // Check for category keyword mapping
    const mappedCategory = KEYWORD_MAPPING[normalizedQuery];
    if (mappedCategory) {
        renderCategoryPage(mappedCategory, 1);
        return;
    }

    // Search by wallpaper title
    const results = [];
    wallpaperData.categories.forEach(category => {
        category.wallpapers.forEach(wallpaper => {
            if (wallpaper.title.toLowerCase().includes(normalizedQuery)) {
                results.push(wallpaper);
            }
        });
    });

    if (results.length > 0) {
        renderSearchResults(results, `Search results for "${query}"`);
    } else {
        alert('No wallpapers found. Showing categories instead.');
        renderHomePage();
    }
};

const renderSearchResults = (wallpapers, title) => {
    const mainContent = document.querySelector('.content');
    mainContent.innerHTML = '';
    document.body.style.backgroundImage = 'none';

    const resultsHeader = document.createElement('header');
    resultsHeader.className = 'hero-section';
    resultsHeader.style.backgroundImage = `url(./images/search-results-cover.jpg)`;
    resultsHeader.innerHTML = `<h2 class="hero-title">${title}</h2>`;
    mainContent.appendChild(resultsHeader);
    
    const wallpaperGridContainer = document.createElement('section');
    wallpaperGridContainer.className = 'wallpaper-grid';
    mainContent.appendChild(wallpaperGridContainer);

    wallpapers.forEach((wallpaper) => {
        const wallpaperCard = document.createElement('div');
        wallpaperCard.className = 'wallpaper-card';
        const fileName = wallpaper.url.split('/').pop();
        wallpaperCard.innerHTML = `
            <img src="${wallpaper.url}" alt="${wallpaper.title}">
            <button class="download-btn" data-url="${wallpaper.url}" data-filename="${fileName}">Download</button>
        `;
        wallpaperGridContainer.appendChild(wallpaperCard);
    });
    
    // Add event listeners for new download buttons
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
};

const getAllWallpapers = () => {
    const allWallpapers = [];
    wallpaperData.categories.forEach(category => {
        allWallpapers.push(...category.wallpapers);
    });
    return allWallpapers;
};

const getAutocompleteSuggestions = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = new Set();
    const maxSuggestions = 5;

    // Add category keywords
    for (const keyword in KEYWORD_MAPPING) {
        if (keyword.startsWith(normalizedQuery)) {
            suggestions.add(keyword);
        }
        if (suggestions.size >= maxSuggestions) break;
    }

    // Add wallpaper titles
    wallpaperData.categories.forEach(category => {
        category.wallpapers.forEach(wallpaper => {
            if (wallpaper.title.toLowerCase().startsWith(normalizedQuery)) {
                suggestions.add(wallpaper.title);
            }
            if (suggestions.size >= maxSuggestions) return;
        });
        if (suggestions.size >= maxSuggestions) return;
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
};

const renderSuggestions = (suggestions) => {
    const autocompleteResults = document.getElementById('autocomplete-results');
    autocompleteResults.innerHTML = '';

    if (suggestions.length > 0) {
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = suggestion;
            autocompleteResults.appendChild(item);
        });
        autocompleteResults.classList.add('active');
    } else {
        autocompleteResults.classList.remove('active');
    }
};
