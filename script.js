// Global variables
let wallpaperData = { categories: [] };
let currentPage = 1;
const itemsPerPage = 20;

// DOM elements
const mainContent = document.getElementById('dynamic-content-container');
const searchInput = document.getElementById('search-input');
const autocompleteResults = document.getElementById('autocomplete-results');

// Header & Navigation DOM elements
const header = document.querySelector('.header');
const menuToggle = document.getElementById('menu-toggle');
const searchToggle = document.getElementById('search-toggle');
const searchContainer = document.getElementById('search-container');
const searchClose = document.getElementById('search-close');
const heroSection = document.querySelector('.hero-section');

// New sidebar elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarClose = document.getElementById('sidebar-close');

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

        if (window.location.hash) {
            handleHashChange();
        } else {
            renderHomePage();
        }

    } catch (error) {
        console.error('Could not fetch wallpaper data:', error);
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">Failed to load wallpapers. Please check your internet connection and try again.</div>';
    }
};

// New function to render the contact page
const renderContactPage = () => {
    window.location.hash = '#contact';
    mainContent.innerHTML = `
        <h2>Contact</h2>
        <div class="contact-container">
            <a href="https://zed-hlac.onrender.com/" class="contact-card" target="_blank">
                <i class="fas fa-link contact-icon"></i>
                <div class="contact-info">
                    <h3>My Portfolio</h3>
                    <p>zed-hlac.onrender.com</p>
                </div>
                <i class="fas fa-chevron-right contact-arrow"></i>
            </a>
            <a href="https://github.com/swtichedxp" class="contact-card" target="_blank">
                <i class="fab fa-github contact-icon"></i>
                <div class="contact-info">
                    <h3>GitHub Repo</h3>
                    <p>github.com/swtichedxp</p>
                </div>
                <i class="fas fa-chevron-right contact-arrow"></i>
            </a>
            <a href="https://t.me/zedside" class="contact-card" target="_blank">
                <i class="fab fa-telegram-plane contact-icon"></i>
                <div class="contact-info">
                    <h3>Telegram</h3>
                    <p>t.me/zedside</p>
                </div>
                <i class="fas fa-chevron-right contact-arrow"></i>
            </a>
            <a href="https://twitter.com/switchedxp" class="contact-card" target="_blank">
                <i class="fab fa-twitter contact-icon"></i>
                <div class="contact-info">
                    <h3>Twitter</h3>
                    <p>@switchedxp</p>
                </div>
                <i class="fas fa-chevron-right contact-arrow"></i>
            </a>
            <a href="https://wa.me/212684255286" class="contact-card" target="_blank">
                <i class="fab fa-whatsapp contact-icon"></i>
                <div class="contact-info">
                    <h3>WhatsApp</h3>
                    <p>Chat with me</p>
                </div>
                <i class="fas fa-chevron-right contact-arrow"></i>
            </a>
        </div>
    `;
    heroSection.style.display = 'none';
};

const renderHomePage = () => {
    window.location.hash = '#home';
    mainContent.innerHTML = '';
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
    mainContent.appendChild(categoryGrid);
};

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

const renderSearchResults = (query, page = 1) => {
    const results = [];
    if (query) {
        const lowerCaseQuery = query.toLowerCase();
        wallpaperData.categories.forEach(category => {
            category.wallpapers.forEach(wallpaper => {
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

const handleHashChange = () => {
    const hash = window.location.hash;
    closeSidebar();
    closeSearchBar();
    
    // Check for contact page first
    if (hash === '#contact') {
        renderContactPage();
        return;
    }
    
    if (hash === '#home' || !hash) {
        heroSection.style.display = 'flex';
        renderHomePage();
    } else if (hash.startsWith('#category-')) {
        heroSection.style.display = 'none';
        const categoryId = hash.substring(10);
        renderCategoryPage(categoryId);
    } else if (hash.startsWith('#search')) {
        heroSection.style.display = 'none';
        const params = new URLSearchParams(hash.substring(hash.indexOf('?')));
        const query = params.get('q');
        renderSearchResults(query);
    } else {
        // Default to home page if hash is invalid
        renderHomePage();
    }
};

window.addEventListener('hashchange', handleHashChange);

document.body.addEventListener('click', (e) => {
    // Handle navigation links, including the new 'Contact' link
    if (e.target.matches('.nav-link-item, .nav-link-item *')) {
        e.preventDefault();
        const navLink = e.target.closest('.nav-link-item');
        const linkId = navLink.dataset.id;
        
        if (linkId === 'home' || linkId === 'categories') {
            window.location.hash = '#home';
        } else if (linkId === 'contact') {
            window.location.hash = '#contact';
        }
        
        closeSidebar();
    } else if (e.target.matches('.nav-links-desktop a')) {
        const linkId = e.target.dataset.id;
        if (linkId === 'home' || linkId === 'categories') {
            window.location.hash = '#home';
        } else if (linkId === 'contact') {
            window.location.hash = '#contact';
        }
    }
    
    if (e.target.matches('.glass-card, .glass-card *')) {
        e.preventDefault();
        const cardLink = e.target.closest('.glass-card');
        const categoryId = cardLink.getAttribute('href').substring(10);
        window.location.hash = `#category-${categoryId}`;
    }

    if (e.target.matches('.preview-btn')) {
        const url = e.target.dataset.url;
        modal.querySelector('.modal-image').src = url;
        modal.classList.add('active');
    }

    if (e.target.matches('.download-btn')) {
        e.preventDefault();
        const imageUrl = e.target.href;
        const fileName = e.target.download;
        
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

        popup.querySelector('.popup-close-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                document.body.removeChild(popup);
            }
        });
    }

    if (e.target.matches('.modal-close') || e.target.matches('.modal-close i') || e.target === modal) {
        modal.classList.remove('active');
    }

    if (e.target.matches('.hero-section .primary-btn')) {
        window.location.hash = '#home';
        window.scrollTo({ top: heroSection.offsetHeight, behavior: 'smooth' });
    }
    if (e.target.matches('.secondary-btn')) {
        console.log('Random button clicked');
    }
});

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
            window.location.hash = `#search?q=${encodeURIComponent(query)}`;
            autocompleteResults.classList.remove('active');
            searchContainer.classList.remove('active');
        }
    }
});

const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    searchContainer.classList.remove('active');
};

const closeSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
};

const closeSearchBar = () => {
    searchContainer.classList.remove('active');
    autocompleteResults.classList.remove('active');
};

menuToggle.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    closeSidebar();
    if (searchContainer.classList.contains('active')) {
        searchInput.focus();
    }
});

searchClose.addEventListener('click', closeSearchBar);

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

fetchDataAndRender();
