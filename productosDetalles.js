document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id'); // ID del producto

    if (!productId) {
        console.error('Error: Falta información del producto en los parámetros de la URL.');
        return;
    }

    // Cargar datos del JSON
    fetch('productosList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo JSON');
            }
            return response.json();
        })
        .then(data => {
            // Buscar el producto por ID
            const product = data.find(p => p.id === productId);

            if (!product) {
                console.error('Error: Producto no encontrado en el JSON.');
                return;
            }
            
            generateSimilarProducts(data, productId);

            // Ruta base de las imágenes del producto
            const productImagePath = product.images;

            // Actualizar la información del producto
            const productImageElement = document.getElementById('product-image');
            const thumbnailGallery = document.getElementById('thumbnail-gallery');

            // Configurar la imagen principal
            productImageElement.src = `${productImagePath}${productId}1.jpg`;
            productImageElement.alt = `Imagen principal de ${product.titulo}`;

            // Configurar el nombre, precio y descripción del producto
            document.getElementById('product-name').textContent = product.titulo;
            document.getElementById('product-price').textContent = `$${product.precio}`;
            document.getElementById('product-description').textContent = product.descripcion;
            
            // Mostrar descripción secundaria (si existe)
            if (product.descripcion2) {
                document.getElementById('product-description2').textContent = product.descripcion2;
            }

            if (product.pack) {
                document.getElementById('product-pack').textContent = product.pack;
            }
            // Mostrar colores si están disponibles
            const productColors = product.colores;
            if (productColors) {
                const colorList = document.getElementById('color-list');

                if (Array.isArray(productColors)) {
                    // Si los colores son un array simple
                    const colorsText = productColors.join(', '); // Une los colores con comas
                    const colorItem = document.createElement('p');
                    colorItem.textContent = `Colores: ${colorsText}`;
                    colorList.appendChild(colorItem);
                } else {
                    // Si los colores están organizados en categorías (e.g., pasteles, fuertes)
                    for (const [category, colors] of Object.entries(productColors)) {
                        // Crear título para la categoría
                        const categoryTitle = document.createElement('p');
                        categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}`;
                        categoryTitle.innerHTML = `<strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${colors.join(', ')}`;
                        colorList.appendChild(categoryTitle);
                    }
                }
            } else {
                document.getElementById('product-colors').style.display = 'none'; // Oculta la sección si no hay colores
            }

            // Generar las miniaturas dinámicamente
            for (let i = 1; i <= 3; i++) {
                const thumbnail = document.createElement('img');
                thumbnail.src = `${productImagePath}${product.id}${i}.jpg`;
                thumbnail.alt = `Miniatura ${i} de ${product.titulo}`;
                thumbnail.classList.add('thumbnail');
                thumbnail.onclick = () => updateMainImage(thumbnail.src);
                thumbnailGallery.appendChild(thumbnail);
            }
            // Mostrar la cantidad mínima y máxima
            const quantityRangeElement = document.getElementById('product-quantity-range');
            quantityRangeElement.textContent = `Cantidad mínima: ${product.cantidadMinima || 1}, máxima: ${product.cantidadMaxima || 100}`;

            const quantityInput = document.getElementById('product-quantity');
            minQuantity = product.cantidadMinima || 1;
            maxQuantity = product.cantidadMaxima || 100;

            quantityInput.min = minQuantity;
            quantityInput.max = maxQuantity;
            quantityInput.value = minQuantity;

            quantityInput.addEventListener('input', () =>{
                const currentValue = parseInt(quantityInput.value,10);
                if(isNaN(currentValue)||currentValue < minQuantity){
                    quantityInput.value = minQuantity;
                }else if(currentValue > maxQuantity){
                    quantityInput.value = maxQuantity;
                }
            })
            configureButtons(product, quantityInput);
        })
        .catch(error => {
            console.error('Error al cargar los datos del producto:', error);
        });
});
function configureButtons(product, quantityInput) {
    const addToCartButton = document.querySelector('.add-to-cart');
    const buyNowButton = document.querySelector('.buy-now');


    if (!product || !product.id || !product.titulo || !product.precio) {
        console.error('Datos del producto no están correctamente definidos.', product);
        return;
    }

    // Elementos del cuadro emergente
    const popup = document.getElementById('popup');
    const popupProductImage = document.getElementById('popup-product-image');
    const popupProductName = document.getElementById('popup-product-name');
    const popupQuantity = document.getElementById('popup-quantity');
    const popupTotal = document.getElementById('popup-total');
    const continueShoppingButton = document.getElementById('continue-shopping');
    const goToCartButton = document.getElementById('go-to-cart');

    // Ocultar el cuadro emergente
    continueShoppingButton.addEventListener('click', () => {
        popup.classList.add('hidden');
    });

    goToCartButton.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    // Lógica para Agregar al carrito
    addToCartButton.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value, 10);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Verificar si el producto ya está en el carrito
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.titulo,
                price: product.precio,
                quantity: quantity,
                image: `${product.id}/${product.id}1.jpg`,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        showPopup(product, quantity); // Mostrar el cuadro emergente
    });

    // Lógica para Compra directa
    buyNowButton.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value, 10);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Añadir el producto al carrito (similar a Agregar al carrito)
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.titulo,
                price: product.precio,
                quantity: quantity,
                image: `${product.id}/${product.id}1.jpg`,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Redirigir al carrito
        window.location.href = 'cart.html';
    });
}
    function showPopup(product, quantity) {
        const total = (product.precio * quantity).toFixed(2);
    
        // Actualizar la información del cuadro emergente
        const popupProductImage = document.getElementById('popup-product-image');
        const popupProductName = document.getElementById('popup-product-name');
        const popupQuantity = document.getElementById('popup-quantity');
        const popupTotal = document.getElementById('popup-total');
    
        popupProductImage.src = `images/products/${product.id}/${product.id}1.jpg`;
        popupProductName.textContent = product.titulo;
        popupQuantity.textContent = `Cantidad: ${quantity}`;
        popupTotal.textContent = `Total: $${total}`;
    
        // Mostrar el cuadro emergente
        const popup = document.getElementById('popup');
        const lottiePlayer = popup.querySelector('dotlottie-player');
    
        // Reiniciar la animación
        lottiePlayer.stop(); 
        lottiePlayer.play(); 
        
        popup.classList.remove('hidden');
    }
// Función para actualizar la imagen principal
function updateMainImage(src) {
    const mainImage = document.getElementById('product-image');
    mainImage.src = src;
}
function increaseQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    const currentValue = parseInt(quantityInput.value);

    if (currentValue < maxQuantity) {
        quantityInput.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    const currentValue = parseInt(quantityInput.value);

    if (currentValue > minQuantity) {
        quantityInput.value = currentValue - 1;
    }
}
/**
 * Función para generar productos similares dinámicamente.
 */
function generateSimilarProducts(data, currentProductId) {
    const similarContainer = document.getElementById('similares-container');

    if (!similarContainer) {
        console.error('Error: Contenedor de productos similares no encontrado.');
        return;
    }

    // Filtrar productos que no sean el actual
    const similarProducts = data.filter(product => product.id !== currentProductId);

    // Seleccionar 4 productos al azar
    const selectedProducts = similarProducts.sort(() => 0.5 - Math.random()).slice(0, 4);

    // Generar elementos para los productos similares
    selectedProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('similar-product');

        productElement.innerHTML = `
            <a href="productosDetalles.html?id=${product.id}">
                <img src="${product.images}${product.id}1.jpg" alt="${product.titulo}">
                <h4>${product.titulo}</h4>
                <p>$${product.precio}</p>
            </a>
        `;

        similarContainer.appendChild(productElement);
    });
}