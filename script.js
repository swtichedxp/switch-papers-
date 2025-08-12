document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

const fetchData = async () => {
    try {
        const response = await fetch('wallpapers.json'); // Assumes wallpapers.json is in the root
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        renderCategories(data.categories);
    } catch (error) {
        console.error('There was a problem fetching the data:', error);
    }
};

const renderCategories = (categories) => {
    const navLinksContainer = document.getElementById('nav-links-container');
    const categoryGridContainer = document.getElementById('category-grid-container');

    categories.forEach((category, index) => {
        // Create Navbar Link
        const navLinkItem = document.createElement('li');
        navLinkItem.innerHTML = `<a href="#${category.id}">${category.name}</a>`;
        navLinksContainer.appendChild(navLinkItem);

        // Create Category Card for Homepage
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.style.animationDelay = `${index * 0.1}s`; // Staggered animation
        categoryCard.innerHTML = `
            <img src="${category.category_image_url}" alt="${category.name}">
            <div class="category-info">
                <h3>${category.name}</h3>
            </div>
        `;
        categoryGridContainer.appendChild(categoryCard);
    });
};
