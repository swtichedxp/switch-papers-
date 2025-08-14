document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const dynamicContentContainer = document.getElementById('dynamic-content-container');
    const searchToggle = document.getElementById('search-toggle');
    const searchBarContainer = document.getElementById('search-bar-container');
    const contentTabs = document.querySelector('.content-tabs');
    const desktopSearchInput = document.getElementById('search-input');
    const sidebarNavLinks = document.getElementById('nav-links-container');
    const desktopNavLinks = document.querySelector('.main-nav-desktop .nav-links-desktop');

    let allCategories = [];
    let currentPage = 1;
    const wallpapersPerPage = 10;
    let currentCategory = 'all';

    // Sidebar functionality
    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            body.style.overflow = 'hidden';
        });

        const closeSidebar = () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            body.style.overflow = '';
        };
        
        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
        
        // Hide sidebar on nav link click for mobile
        if(sidebarNavLinks) {
            sidebarNavLinks.addEventListener('click', (e) => {
                if(e.target.closest('a')) {
                    closeSidebar();
                }
            });
        }
    }

    // Search bar toggle functionality for mobile
    if (searchToggle && searchBarContainer) {
        searchToggle.addEventListener('click', () => {
            searchBarContainer.classList.toggle('active');
        });
    }

    // Set active link based on URL
    const setActiveLink = () => {
        const path = window.location.pathname.split('/').pop();
        const hash = window.location.hash.substring(1);
        
        document.querySelectorAll('.nav-link-item, .nav-links-desktop a').forEach(link => {
            link.classList.remove('active');
        });

        if (path === 'contact.html') {
            document.querySelectorAll('[data-id="contact"]').forEach(link => link.classList.add('active'));
        } else {
            if (hash === 'categories' || hash === '' || hash === 'home') {
                 document.querySelectorAll('[data-id="home"]').forEach(link => link.classList.add('active'));
                 document.querySelectorAll('[data-id="categories"]').forEach(link => link.classList.add('active'));
            } else if (hash === 'search') {
                // Not needed anymore with the new search bar
            }
        }
    };
    
    // Fetch wallpapers data
    const fetchWallpapers = async () => {
        try {
            const response = await fetch('wallpapers.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            allCategories = data.categories;
            renderCategories();
        } catch (error) {
            console.error('Failed to fetch wallpapers:', error);
            if (dynamicContentContainer) {
                dynamicContentContainer.innerHTML = '<p>Failed to load wallpapers. Please try again later.</p>';
            }
        }
    };

    // Render Categories
    const renderCategories = () => {
        if (!dynamicContentContainer) return;
        
        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'glass-card-grid';

        allCategories.forEach(category => {
            const categoryCard = document.createElement('a');
            categoryCard.href = '#';
            categoryCard.className = 'glass-card';
            categoryCard.dataset.category = category.id;

            const categoryImage = document.createElement('img');
            categoryImage.src = category.category_image_url;
            categoryImage.alt = `${category.name} wallpapers`;

            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.name;

            categoryCard.appendChild(categoryImage);
            categoryCard.appendChild(categoryTitle);
            categoryGrid.appendChild(categoryCard);
        });

        dynamicContentContainer.innerHTML = '';
        dynamicContentContainer.appendChild(categoryGrid);
    };

    // Render Wallpapers
    const renderWallpapers = (categoryId, page = 1) => {
        if (!dynamicContentContainer) return;
    
        const selectedCategory = allCategories.find(cat => cat.id === categoryId);
        const wallpapersToRender = selectedCategory ? selectedCategory.wallpapers : [];

        const startIndex = (page - 1) * wallpapersPerPage;
        const endIndex = startIndex + wallpapersPerPage;
        const wallpapersToDisplay = wallpapersToRender.slice(startIndex, endIndex);

        const wallpaperGrid = document.createElement('div');
        wallpaperGrid.className = 'wallpaper-grid';

        wallpapersToDisplay.forEach(wallpaper => {
            const wallpaperCard = document.createElement('div');
            wallpaperCard.className = 'wallpaper-card';
            wallpaperCard.dataset.id = wallpaper.id;

            const wallpaperImage = document.createElement('img');
            wallpaperImage.src = wallpaper.url;
            wallpaperImage.alt = wallpaper.title;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const previewBtn = document.createElement('button');
            previewBtn.className = 'preview-btn';
            previewBtn.textContent = 'Preview';
            previewBtn.dataset.url = wallpaper.url;

            const downloadBtn = document.createElement('a');
            downloadBtn.href = wallpaper.url;
            downloadBtn.className = 'download-btn';
            downloadBtn.download = `${wallpaper.title}.jpg`;
            downloadBtn.textContent = 'Download';

            buttonContainer.appendChild(previewBtn);
            buttonContainer.appendChild(downloadBtn);
            wallpaperCard.appendChild(wallpaperImage);
            wallpaperCard.appendChild(buttonContainer);
            wallpaperGrid.appendChild(wallpaperCard);
        });

        dynamicContentContainer.innerHTML = '';
        dynamicContentContainer.appendChild(wallpaperGrid);
        renderPagination(wallpapersToRender.length, page);
    };

    // Pagination
    const renderPagination = (totalItems, currentPage) => {
        const totalPages = Math.ceil(totalItems / wallpapersPerPage);
        if (totalPages <= 1) return;

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.className = 'page-btn';
        if (currentPage === 1) prevBtn.classList.add('disabled');
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                renderWallpapers(currentCategory, currentPage - 1);
            }
        });

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.className = 'page-btn';
        if (currentPage === totalPages) nextBtn.classList.add('disabled');
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                renderWallpapers(currentCategory, currentPage + 1);
            }
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(nextBtn);
        dynamicContentContainer.appendChild(paginationContainer);
    };
    
    // Event listeners for category navigation and tabs
    if (contentTabs) {
        contentTabs.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.target;
            if (tab.classList.contains('content-tab')) {
                document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.textContent === 'Categories') {
                    renderCategories();
                } else if (tab.textContent === 'New' || tab.textContent === 'Popular') {
                    if (allCategories.length > 0) {
                        currentCategory = allCategories[0].id;
                        renderWallpapers(currentCategory);
                    }
                }
            }
        });
    }

    if (dynamicContentContainer) {
        dynamicContentContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.glass-card');
            if (card) {
                e.preventDefault();
                currentCategory = card.dataset.category;
                renderWallpapers(currentCategory);
            }
        });
    }

    // Initial calls
    if (dynamicContentContainer) { // Only fetch wallpapers if on the index page
        fetchWallpapers();
    }
    setActiveLink();
});
