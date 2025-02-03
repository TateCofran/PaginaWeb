
var navLinks = document.getElementById("navLinks");

function showMenu(){
    navLinks.style.right = "0";
}
function hideMenu(){
    navLinks.style.right = "-200";
}

document.addEventListener('DOMContentLoaded', () => {
    const addButtons = document.querySelectorAll('.add-to-cart');
    const cartIcon = document.querySelector('.cart-icon');

    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Recuperar carrito del localStorage

    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Abrir nueva ventana para el carrito al hacer clic en el ícono
    cartIcon.addEventListener('click', (event) => {
        
        window.location.href = 'cart.html';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-bar');
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'search-results-container';
    searchResultsContainer.classList.add('hidden'); // Ocultar inicialmente
    document.body.appendChild(searchResultsContainer);
    let productList = [];

    // Función para cargar los productos desde productosList.json
    function loadProducts() {
        return fetch('productosList.json')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar productosList.json');
                return response.json();
            })
            .then(data => {
                productList = data;
            })
            .catch(error => console.error('Error al cargar los productos:', error));
    }

    // Función para renderizar los resultados de búsqueda
    function renderSearchResults(filteredProducts) {
        searchResultsContainer.innerHTML = ''; // Limpiar contenido anterior

        const productsSection = document.createElement('div');
        productsSection.classList.add('products-section');

        const buttonSection = document.createElement('div');
        buttonSection.classList.add('button-section');

        if (filteredProducts.length === 0) {
            const noResultsMessage = document.createElement('p');
            noResultsMessage.textContent = 'No se encontraron productos.';
            noResultsMessage.classList.add('no-results-message');
            productsSection.appendChild(noResultsMessage);
        } else {
            const maxResults = 5;
            const resultsRow = document.createElement('div');
            resultsRow.classList.add('search-results-row');

            filteredProducts.slice(0, maxResults).forEach(product => {
                const productElement = document.createElement('div');
                productElement.classList.add('search-result-item');

                const imagePath = `${product.images}${product.id}1.jpg`;

                productElement.innerHTML = `
                    <img src="${imagePath}" alt="${product.titulo}">
                    <div class="product-info">
                        <h3 class="product-link" data-id="${product.id}">${product.titulo}</h3>
                        <p>Precio: $${product.precio}</p>
                    </div>
                `;
                resultsRow.appendChild(productElement);
            });

            productsSection.appendChild(resultsRow);
        }

        // Botón "Ver más productos"
        const viewMoreButton = document.createElement('button');
        viewMoreButton.textContent = 'Ver más productos';
        viewMoreButton.classList.add('view-more-button');
        viewMoreButton.onclick = () => {
            window.location.href = 'productos.html';
        };

        buttonSection.appendChild(viewMoreButton);

        // Agregar las secciones al contenedor principal
        searchResultsContainer.appendChild(productsSection);
        searchResultsContainer.appendChild(buttonSection);

        // Mostrar u ocultar el contenedor según el estado
        if (filteredProducts.length > 0) {
            searchResultsContainer.classList.remove('hidden');
        } else {
            searchResultsContainer.classList.add('hidden');
        }
    }

    // Función para buscar productos
    function searchProducts(query) {
        const filteredProducts = productList.filter(product =>
            product.titulo.toLowerCase().includes(query.toLowerCase())
        );
        renderSearchResults(filteredProducts);
    }

    // Delegar eventos para los nombres de productos
    searchResultsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('product-link')) {
            const productId = e.target.getAttribute('data-id');
            window.location.href = `productosDetalles.html?id=${productId}`;
        }
    });

    // Evento de entrada en el campo de búsqueda
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query === '') {
            searchResultsContainer.classList.add('hidden'); // Ocultar si no hay búsqueda
        } else {
            searchProducts(query);
        }
    });

    // Inicializar la carga de productos
    loadProducts();
    
    const menuIcon = document.querySelector(".menu-icon");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    menuIcon.addEventListener("click", () => {
        dropdownMenu.classList.toggle("active"); // Activa/desactiva el menú
    });
});
// Obtener el contador del carrito
const cartCountElement = document.getElementById('cart-count');

// Función para obtener la cantidad de productos del carrito (suponiendo que usás localStorage)
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartCountElement.textContent = cart.length;
}

// Llamar a la función al cargar la página para mostrar la cantidad actual
document.addEventListener('DOMContentLoaded', updateCartCount);

// Cada vez que agregues un producto, actualizá el contador
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();  // Actualizá el número del carrito
}