// Await for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const searchToggle = document.querySelector('.search-toggle');
    const searchContainer = document.querySelector('.search-container');
    const siteName = document.querySelector('.site-name');
    const searchInput = document.querySelector('.search-input');
    const autocompleteResults = document.querySelector('.autocomplete-results');
    const searchClose = document.querySelector('.search-close');
    const wallpaperGrid = document.querySelector('.wallpaper-grid');
    const categoryContainer = document.getElementById('category-container');
    const heroSection = document.querySelector('.hero-section');
    
    // Function to render categories
    const renderCategories = (categories) => {
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            categories.forEach(category => {
                const card = document.createElement('a');
                card.classList.add('glass-card');
                card.href = `/category/${category.name.toLowerCase()}`;
                card.innerHTML = `
                    <img src="${category.imageUrl}" alt="${category.name} wallpapers">
                    <h3>${category.name}</h3>
                `;
                categoryContainer.appendChild(card);
            });
        }
    };
    
    // Placeholder function to fetch data
    // This will need to be connected to your working backend
    const fetchData = async () => {
        try {
            // Replace with your actual backend endpoint
            const response = await fetch('/api/categories');
            const data = await response.json();
            renderCategories(data.categories);
        } catch (error) {
            console.error('Error fetching data:', error);
            // You can add a user-friendly message here
            if (categoryContainer) {
                 categoryContainer.innerHTML = '<p>Failed to load categories. Please try again later.</p>';
            }
        }
    };
    
    // Call the data fetching function
    // fetchData();
    
    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Toggle search bar
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            const isSearchActive = searchContainer.classList.contains('active');
            if (!isSearchActive) {
                // Open search
                searchContainer.classList.add('active');
                siteName.style.opacity = '0';
                siteName.style.visibility = 'hidden';
                searchToggle.innerHTML = '<i class="fas fa-times"></i>';
                searchInput.focus();
                // Close nav menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            } else {
                // Close search
                searchContainer.classList.remove('active');
                siteName.style.opacity = '1';
                siteName.style.visibility = 'visible';
                searchToggle.innerHTML = '<i class="fas fa-search"></i>';
            }
        });
    }

    // Handle closing search with the dedicated close button
    if (searchClose) {
        searchClose.addEventListener('click', () => {
            searchContainer.classList.remove('active');
            siteName.style.opacity = '1';
            siteName.style.visibility = 'visible';
            searchToggle.innerHTML = '<i class="fas fa-search"></i>';
        });
    }

    // Event listeners for autocomplete search
    if (searchInput) {
        searchInput.addEventListener('input', async () => {
            const query = searchInput.value;
            if (query.length > 2) {
                // This is a placeholder for your autocomplete logic
                // Replace this with a fetch call to your backend
                console.log('Fetching autocomplete for:', query);
                autocompleteResults.classList.add('active');
            } else {
                autocompleteResults.classList.remove('active');
            }
        });
    }

    // Close autocomplete on outside click
    document.addEventListener('click', (e) => {
        if (autocompleteResults && !autocompleteResults.contains(e.target) && !searchInput.contains(e.target)) {
            autocompleteResults.classList.remove('active');
        }
    });

});
