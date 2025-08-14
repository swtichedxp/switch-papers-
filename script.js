Document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const dynamicContentContainer = document.getElementById('dynamic-content-container');
    const contentTabsSection = document.querySelector('.content-tabs-section');
    const contactSection = document.getElementById('contact');
    const contentTabs = document.querySelector('.content-tabs');
    const heroSection = document.querySelector('.hero-section');
    const mobileHeroSection = document.querySelector('.mobile-hero-section');
    
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
    }
    
    // Fetch wallpapers data
    const fetchWallpapers = async () => {
        try {
            const response = await fetch('wallpapers.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            allCategories = data.categories;
            renderContent('categories');
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
        dynamicContentContainer.innerHTML = '';
    
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
    
        dynamicContentContainer.appendChild(categoryGrid);
    };

    // Render Wallpapers
    const renderWallpapers = (categoryId, page = 1) => {
        if (!dynamicContentContainer) return;
        dynamicContentContainer.innerHTML = '';
    
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

    // Main content rendering logic based on hash or clicks
    const renderContent = (type) => {
        if (!dynamicContentContainer || !contentTabsSection) return;
        
        // Hide all sections first
        contentTabsSection.style.display = 'none';
        dynamicContentContainer.style.display = 'none';
        if (contactSection) contactSection.style.display = 'none';
        
        // Show the relevant section
        if (type === 'categories' || type === 'home' || type === '') {
            contentTabsSection.style.display = 'block';
            dynamicContentContainer.style.display = 'block';
            renderCategories();
        } else if (type === 'search') {
            dynamicContentContainer.style.display = 'block';
            dynamicContentContainer.innerHTML = `
                <section class="search-page-section">
                    <h2 class="section-title">Search Wallpapers</h2>
                    <p class="search-intro">Find the perfect wallpaper for your device.</p>
                    <div class="search-container-desktop">
                        <input type="text" placeholder="Search wallpapers..." class="search-input" id="search-input-page">
                    </div>
                    <div id="search-results-container">
                        </div>
                </section>
            `;
            setupSearchFunctionality();
        } else if (type === 'contact') {
            if (contactSection) contactSection.style.display = 'block';
        }

        // Handle hero section visibility
        if (window.innerWidth <= 768) {
            mobileHeroSection.style.display = (type === 'categories' || type === 'home' || type === '') ? 'flex' : 'none';
            if (heroSection) heroSection.style.display = 'none';
        } else {
            mobileHeroSection.style.display = 'none';
            heroSection.style.display = (type === 'categories' || type === 'home' || type === '') ? 'flex' : 'none';
        }
    };

    // --- NEW SEARCH FUNCTIONALITY ---
    const setupSearchFunctionality = () => {
        const searchInput = document.getElementById('search-input-page');
        const searchResultsContainer = document.getElementById('search-results-container');
        
        const performSearch = (query) => {
            searchResultsContainer.innerHTML = '';
            const lowerCaseQuery = query.toLowerCase();
            const allWallpapers = [];
            
            // Flatten all wallpapers into a single array
            allCategories.forEach(category => {
                category.wallpapers.forEach(wallpaper => {
                    allWallpapers.push(wallpaper);
                });
            });

            // Filter wallpapers based on title
            const filteredWallpapers = allWallpapers.filter(wallpaper => 
                wallpaper.title.toLowerCase().includes(lowerCaseQuery)
            );

            if (filteredWallpapers.length === 0) {
                searchResultsContainer.innerHTML = '<p class="no-results">No wallpapers found matching your search.</p>';
                return;
            }

            // Render the results in a grid
            const searchGrid = document.createElement('div');
            searchGrid.className = 'wallpaper-grid';

            filteredWallpapers.forEach(wallpaper => {
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
                searchGrid.appendChild(wallpaperCard);
            });

            searchResultsContainer.appendChild(searchGrid);
        };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    performSearch(query);
                } else {
                    searchResultsContainer.innerHTML = '<p class="no-results">Type at least 3 characters to search.</p>';
                }
            });
        }
    };
    // --- END NEW SEARCH FUNCTIONALITY ---

    // Event listeners for new layout
    if (contentTabs) {
        contentTabs.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.target;
            if (tab.classList.contains('content-tab')) {
                document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.textContent === 'Categories') {
                    renderContent('categories');
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

    // Initial render based on URL hash
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        document.querySelectorAll('.nav-link-item').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.id === hash) {
                link.classList.add('active');
            }
        });

        if (hash === 'categories' || hash === 'home' || hash === '') {
            renderContent('categories');
        } else if (hash === 'search') {
            renderContent('search');
        } else if (hash === 'contact') {
            renderContent('contact');
        }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('resize', handleHashChange);

    // Initial calls
    fetchWallpapers();
    handleHashChange();
});
