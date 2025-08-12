// Global variables
let wallpaperData = { categories: [] };
let currentPage = 1;
const itemsPerPage = 20;

// DOM elements
const mainContent = document.querySelector('.content');
const searchInput = document.getElementById('search-input');
const autocompleteResults = document.getElementById('autocomplete-results');

// New Header & Navigation Toggles (Correctly referencing new HTML)
const header = document.querySelector('.header');
const menuToggle = document.getElementById('menu-toggle');
const navLinksContainer = document.querySelector('.main-nav');
const searchToggle = document.getElementById('search-toggle');
const searchContainer = document.getElementById('search-container');
const searchClose = document.getElementById('search-close');

// Setup modal element
const modal = document.createElement('div');
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

        // The navigation links are now part of the HTML structure,
        // so we don't need to dynamically render them unless you want to.
        // I've kept the function here in case you need to modify them later.
        // renderNavLinks(wallpaperData.categories); 
        renderHomePage();
    } catch (error) {
        console.error('Could not fetch wallpaper data:', error);
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">Failed to load wallpapers. Please check your internet connection and try again.</div>';
    }
};

// Function to render navigation links
const renderNavLinks = (categories) => {
    // This is now handled primarily by the HTML, but this function can
    // be used to add dynamic links if needed.
};

// Function to render the new home page
const renderHomePage = () => {
    window.location.hash = '#home';
    
    // The hero section is now hardcoded in the HTML, so we only need to
    // append the category grid.
    
    // Create the glassmorphic category cards
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'glass-card-grid';
    wallpaperData.categories.forEach(category => {
        const categoryCard = document.createElement('a');
        categoryCard.href = `#category-${category.id}`;
        categoryCard.className = 'glass-card';
        categoryCard.innerHTML = `
            <img src="${category.category_image_url}" alt="${category.name}">
            <h3>${category.name}</h3>
        `;
        categoryGrid.appendChild(categoryCard);
    });
    
    // Clear the main content and append only the category grid
    mainContent.innerHTML = ''; 
    
    // We append the hardcoded hero section from the HTML
    const heroSection = document.querySelector('.hero-section');
    mainContent.appendChild(heroSection);
    mainContent.appendChild(categoryGrid);
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

// Event listeners for navigation, search, and downloads
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

    // Handling download buttons
    if (e.target.matches('.download-btn')) {
        e.preventDefault(); // Prevent the default link behavior
        const imageUrl = e.target.href;
        const fileName = e.target.download;
        
        // --- POPUP LOGIC ---
        const popup = document.createElement('div');
        popup.className = 'download-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>Download Image</h3>
                <p>Sorry for the inconvenience. Our automatic download is temporarily unavailable.</p>
                <p>To save the image:</p>
                <p>1. On a mobile device, **press and hold** the image below.</p>
                <p>2. Select **"Download image"** from the menu that appears.</p>
                <img src="${imageUrl}" alt="${fileName}" class="popup-image">
                <button class="popup-close-btn">Close</button>
            </div>
        `;
        document.body.appendChild(popup);

        // Add a handler to close the popup
        popup.querySelector('.popup-close-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        // Add a handler to close the popup when clicking outside it
        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                document.body.removeChild(popup);
            }
        });
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

// Search bar toggle (for the sliding animation)
searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    navLinksContainer.classList.remove('active'); // Close mobile menu if open
    if (searchContainer.classList.contains('active')) {
        searchInput.focus();
    }
});

// Close search bar
searchClose.addEventListener('click', () => {
    searchContainer.classList.remove('active');
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
    searchContainer.classList.remove('active'); // Close search bar if open
});

// Close menu and search bar when clicking outside
document.addEventListener('click', (event) => {
    const isClickInsideHeader = header.contains(event.target);
    const isClickInsideNav = navLinksContainer.contains(event.target);
    const isClickInsideSearch = searchContainer.contains(event.target);
    
    // Check if the click is outside all relevant areas
    if (!isClickInsideHeader && !isClickInsideNav && !isClickInsideSearch) {
        navLinksContainer.classList.remove('active');
        searchContainer.classList.remove('active');
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Initialize app
fetchDataAndRender();
