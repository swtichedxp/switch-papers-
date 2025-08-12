// Global variables
let wallpaperData = { categories: [] };
let currentPage = 1;
const itemsPerPage = 20;

// DOM elements
const mainContent = document.querySelector('.content');
const navLinksContainer = document.getElementById('nav-links-container');
const searchInput = document.getElementById('search-input');
const searchToggle = document.getElementById('search-toggle');
const searchContainer = document.getElementById('search-container');
const searchClose = document.getElementById('search-close');
const menuToggle = document.getElementById('menu-toggle');
const modal = document.createElement('div');
const autocompleteResults = document.getElementById('autocomplete-results');

// Setup modal element
modal.className = 'modal';
modal.innerHTML = `
    <img src="" class="modal-image" alt="Full-size wallpaper preview">
    <button class="modal-close"><i class="fas fa-times"></i></button>
`;
document.body.appendChild(modal);

// Function to safely extract keywords
const extractKeywords = (url) => {
    try {
        const fullFileName = url.split('/').pop();
        if (!fullFileName || fullFileName.includes('favicon')) {
            return [];
        }
        const fileNameWithoutExt = fullFileName.substring(0, fullFileName.lastIndexOf('.'));
        if (fileNameWithoutExt) {
            return fileNameWithoutExt.split('-').map(kw => kw.toLowerCase());
        }
    } catch (e) {
        console.error('Failed to extract keywords from URL:', url, e);
    }
    return [];
};

// Main function to fetch and render data
const fetchDataAndRender = async () => {
    try {
        const response = await fetch('wallpapers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        wallpaperData = await response.json();

        // Process data to include keywords from filenames
        wallpaperData.categories.forEach(category => {
            category.wallpapers.forEach(wallpaper => {
                const fileKeywords = extractKeywords(wallpaper.url);
                if (!wallpaper.keywords) {
                    wallpaper.keywords = [];
                }
                wallpaper.keywords.push(...fileKeywords);
            });
        });

        renderCategories(wallpaperData.categories);
        renderNavLinks(wallpaperData.categories);
        renderHomePage();
    } catch (error) {
        console.error('Could not fetch wallpaper data:', error);
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">Failed to load wallpapers. Please check your internet connection and try again.</div>';
    }
};

// Function to render navigation links
const renderNavLinks = (categories) => {
    navLinksContainer.innerHTML = '';
    const homeLink = document.createElement('li');
    homeLink.innerHTML = `<a href="#" data-id="home">Home</a>`;
    navLinksContainer.appendChild(homeLink);

    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#category-${category.id}" data-id="${category.id}">${category.name}</a>`;
        navLinksContainer.appendChild(li);
    });
};

// Function to render category hero section on the home page
const renderCategories = (categories) => {
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'category-hero-grid';
    categories.forEach(category => {
        const categoryHero = document.createElement('a');
        categoryHero.href = `#category-${category.id}`;
        categoryHero.className = 'category-hero';
        categoryHero.style.backgroundImage = `url('${category.category_image_url}')`;
        categoryHero.dataset.id = category.id;
        categoryHero.innerHTML = `<h3>${category.name}</h3>`;
        categoryGrid.appendChild(categoryHero);
    });
    mainContent.appendChild(categoryGrid);
};

// Function to render the home page
const renderHomePage = () => {
    window.location.hash = '#home';
    mainContent.innerHTML = `<div class="hero-section" style="background-image: url('https://c4.wallpaperflare.com/wallpaper/406/261/158/windows-10-wallpaper-preview.jpg');">
        <h2 class="hero-title">switchpaper</h2>
    </div>`;
    renderCategories(wallpaperData.categories);
};

// Function to render a single category's wallpapers
const renderCategoryPage = (categoryId, page = 1) => {
    const category = wallpaperData.categories.find(cat => cat.id === categoryId);
    if (!category) {
        mainContent.innerHTML = '<h2>Category not found!</h2>';
        return;
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const wallpapersToShow = category.wallpapers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(category.wallpapers.length / itemsPerPage);

    mainContent.innerHTML = `<h2>${category.name}</h2><div class="wallpaper-grid"></div>`;
    const wallpaperGrid = mainContent.querySelector('.wallpaper-grid');
    
    wallpapersToShow.forEach(wallpaper => {
        const card = document.createElement('div');
        card.className = 'wallpaper-card';
        card.innerHTML = `
            <img src="${wallpaper.url}" alt="${wallpaper.title}">
            <div class="button-container">
                <button class="preview-btn" data-url="${wallpaper.url}">Preview</button>
                <a href="${wallpaper.url}" class="download-btn" download="${wallpaper.title}.jpg">Download</a>
            </div>
        `;
        wallpaperGrid.appendChild(card);
    });

    renderPagination(categoryId, page, totalPages);
};

// Function to render search results
const renderSearchResults = (query, page = 1) => {
    const results = [];
    if (query) {
        const lowerCaseQuery = query.toLowerCase();
        wallpaperData.categories.forEach(category => {
            category.wallpapers.forEach(wallpaper => {
                // Check if the query matches the title or any of the keywords
                if (
                    wallpaper.title.toLowerCase().includes(lowerCaseQuery) ||
                    (wallpaper.keywords && wallpaper.keywords.some(kw => kw.includes(lowerCaseQuery)))
                ) {
                    results.push(wallpaper);
                }
            });
        });
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const resultsToShow = results.slice(startIndex, endIndex);
    const totalPages = Math.ceil(results.length / itemsPerPage);

    mainContent.innerHTML = `<h2>Search Results for "${query}"</h2><div class="wallpaper-grid"></div>`;
    const wallpaperGrid = mainContent.querySelector('.wallpaper-grid');

    if (results.length === 0) {
        mainContent.innerHTML += `<p style="text-align: center; font-size: 1.2rem; padding: 50px;">No wallpapers found for "${query}".</p>`;
        return;
    }

    resultsToShow.forEach(wallpaper => {
        const card = document.createElement('div');
        card.className = 'wallpaper-card';
        card.innerHTML = `
            <img src="${wallpaper.url}" alt="${wallpaper.title}">
            <div class="button-container">
                <button class="preview-btn" data-url="${wallpaper.url}">Preview</button>
                <a href="${wallpaper.url}" class="download-btn" download="${wallpaper.title}.jpg">Download</a>
            </div>
        `;
        wallpaperGrid.appendChild(card);
    });
    renderPagination('search', page, totalPages, query);
};

// Function to render pagination controls
const renderPagination = (viewId, currentPage, totalPages, query = '') => {
    if (totalPages <= 1) {
        return;
    }

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = 'Previous';
    if (currentPage === 1) prevBtn.disabled = true;

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next';
    if (currentPage === totalPages) nextBtn.disabled = true;

    prevBtn.addEventListener('click', () => {
        if (viewId === 'search') {
            renderSearchResults(query, currentPage - 1);
        } else {
            renderCategoryPage(viewId, currentPage - 1);
        }
        window.scrollTo(0, 0);
    });
    
    nextBtn.addEventListener('click', () => {
        if (viewId === 'search') {
            renderSearchResults(query, currentPage + 1);
        } else {
            renderCategoryPage(viewId, currentPage + 1);
        }
        window.scrollTo(0, 0);
    });
    
    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
    mainContent.appendChild(paginationContainer);
};

// Event listeners for navigation and search
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#home' || !hash) {
        renderHomePage();
    } else if (hash.startsWith('#category-')) {
        const categoryId = hash.substring(10);
        renderCategoryPage(categoryId);
    } else if (hash.startsWith('#search')) {
        const params = new URLSearchParams(hash.substring(hash.indexOf('?')));
        const query = params.get('q');
        renderSearchResults(query);
    }
});

document.body.addEventListener('click', (e) => {
    // Handling navigation links
    if (e.target.matches('.nav-links a')) {
        e.preventDefault();
        const categoryId = e.target.dataset.id;
        if (categoryId === 'home') {
            renderHomePage();
        } else {
            renderCategoryPage(categoryId);
        }
        // Close menu on mobile
        if (window.innerWidth < 768) {
            navLinksContainer.classList.remove('active');
        }
    }
    
    // Handling category hero links
    if (e.target.matches('.category-hero')) {
        e.preventDefault();
        const categoryId = e.target.dataset.id;
        renderCategoryPage(categoryId);
    }

    // Handling preview buttons
    if (e.target.matches('.preview-btn')) {
        const url = e.target.dataset.url;
        modal.querySelector('.modal-image').src = url;
        modal.classList.add('active');
    }

    // Handling modal close button
    if (e.target.matches('.modal-close') || e.target.matches('.modal-close i') || e.target === modal) {
        modal.classList.remove('active');
    }
});

// Autocomplete and search functionality
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    autocompleteResults.innerHTML = '';
    
    if (query.length > 1) {
        const allKeywords = new Set();
        wallpaperData.categories.forEach(category => {
            category.wallpapers.forEach(wallpaper => {
                if (wallpaper.keywords) {
                    wallpaper.keywords.forEach(kw => allKeywords.add(kw));
                }
            });
        });
        
        const matchingKeywords = Array.from(allKeywords)
            .filter(kw => kw.includes(query))
            .sort()
            .slice(0, 5);

        if (matchingKeywords.length > 0) {
            autocompleteResults.classList.add('active');
            matchingKeywords.forEach(kw => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = kw;
                item.addEventListener('click', () => {
                    searchInput.value = kw;
                    autocompleteResults.classList.remove('active');
                    renderSearchResults(kw);
                    window.location.hash = `#search?q=${encodeURIComponent(kw)}`;
                });
                autocompleteResults.appendChild(item);
            });
        } else {
            autocompleteResults.classList.remove('active');
        }
    } else {
        autocompleteResults.classList.remove('active');
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            renderSearchResults(query);
            window.location.hash = `#search?q=${encodeURIComponent(query)}`;
            autocompleteResults.classList.remove('active');
            searchContainer.classList.remove('active');
        }
    }
});

// Search toggle functionality
searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    if (searchContainer.classList.contains('active')) {
        searchInput.focus();
    }
});

searchClose.addEventListener('click', () => {
    searchContainer.classList.remove('active');
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});

// Initialize app
fetchDataAndRender();
