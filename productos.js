document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loading-overlay').style.display = 'flex';

    const container = document.getElementById('products-container');
    const icons = document.querySelectorAll('.view-mode-icon');

    // Vista predeterminada (x4)
    let cols = localStorage.getItem('productsCols') || '4';
    container.classList.add(`x${cols}`);
    icons.forEach(icon => {
        if (icon.dataset.cols === cols) icon.classList.add('active');
        icon.addEventListener('click', function() {
            icons.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            container.classList.remove('x3', 'x4', 'x5');
            container.classList.add(`x${this.dataset.cols}`);
            localStorage.setItem('productsCols', this.dataset.cols);
        });
    });

    // --- ORDENAMIENTO ---
    let productosOriginal = [];
    let productosOrdenados = [];
    let currentSort = 'alphabetic';

    const sortBtns = document.querySelectorAll('.sort-mode-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sortBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort;
            ordenarYRenderizar();
        });
    });

    // Fetch productos
    fetch('productosList.json')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar el archivo JSON');
            return response.json();
        })
        .then(data => {
            productosOriginal = data;
            ordenarYRenderizar(); // Render inicial alfabético

            // OCULTAR loader después de renderizar
            setTimeout(() => {
                document.getElementById('loading-overlay').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-overlay').style.display = 'none';
                }, 400);
            }, 200); // Le doy un mínimo delay para que no desaparezca "de golpe"
        })
        .catch(error => {
            document.getElementById('loading-overlay').innerHTML = "<p>Error al cargar productos</p>";
            console.error('Error al cargar los productos:', error);
        });

    function ordenarYRenderizar() {
        productosOrdenados = [...productosOriginal];
        if (currentSort === 'alphabetic') {
            productosOrdenados.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
        } else if (currentSort === 'price-asc') {
            productosOrdenados.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
        } else if (currentSort === 'price-desc') {
            productosOrdenados.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
        }
        renderizarProductos(productosOrdenados);
    }

    function renderizarProductos(data) {
        container.innerHTML = '';
        data.forEach(product => {
            const imagePaths = [
                `images/products/${product.id}/${product.id}1.jpg`,
                `images/products/${product.id}/${product.id}2.jpg`,
                `images/products/${product.id}/${product.id}3.jpg`
            ];

            let currentImageIndex = 0;
            let productInterval;

            // Crear elemento del producto
            const productElement = document.createElement('div');
            productElement.classList.add('product-item');

            // Crear contenedor para la imagen
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            const productImage = document.createElement('img');
            productImage.src = imagePaths[0];
            productImage.alt = product.titulo;
            imageContainer.appendChild(productImage);

            // Transición de imágenes
            imageContainer.addEventListener('mouseenter', () => {
                productInterval = setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
                    productImage.src = imagePaths[currentImageIndex];
                }, 1000);
            });
            imageContainer.addEventListener('mouseleave', () => {
                clearInterval(productInterval);
                productImage.src = imagePaths[0];
            });

            // Contenedor de info
            const infoContainer = document.createElement('div');
            infoContainer.classList.add('info-container');
            infoContainer.innerHTML = `
                <h3>${product.titulo}</h3>
                <p>${product.pack ? product.pack : 'Precio por unidad'}</p>
                <h3>$${product.precio}</h3>
                <div class="product-actions">
                    <button class="more-details" onclick="redirectToDetails('${product.titulo}', ${product.precio}, '${product.id}')">
                        Más detalles
                    </button>
                </div>
            `;

            productElement.appendChild(imageContainer);
            productElement.appendChild(infoContainer);

            container.appendChild(productElement);
        });
    }
});

// Redirigir a la página de detalles con los parámetros correctos
function redirectToDetails(name, price, id) {
    const params = new URLSearchParams({
        id: id,
        name: name,
        price: price
    });
    window.location.href = `productosDetalles.html?${params.toString()}`;
}
