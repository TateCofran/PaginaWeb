let minQuantity = 1;
let maxQuantity = 100;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loading-overlay').style.display = 'flex';

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id'); // ID del producto

    if (!productId) {
        console.error('Error: Falta información del producto en los parámetros de la URL.');
        // Ocultar loader si hay error de URL
        document.getElementById('loading-overlay').innerHTML = "<p>Error: Producto no especificado.</p>";
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
            const productVideoPath = `${productImagePath}videos/${product.id}1.mp4`;

            // Elementos del DOM (validando que existan)
            const productImageElement = document.getElementById('product-image');
            const thumbnailGallery = document.getElementById('thumbnail-gallery');
            const productNameElem = document.getElementById('product-name');
            const productPriceElem = document.getElementById('product-price');
            const productDescElem = document.getElementById('product-description');
            const productDesc2Elem = document.getElementById('product-description2');
            const productPackElem = document.getElementById('product-pack');
            const colorSection = document.getElementById('product-colors');
            const colorList = document.getElementById('color-list');
            const quantityRangeElement = document.getElementById('product-quantity-range');
            const quantityInput = document.getElementById('product-quantity');

            // Configurar la imagen principal
            if (productImageElement) {
                productImageElement.src = `${productImagePath}${productId}1.jpg`;
                productImageElement.alt = `Imagen principal de ${product.titulo}`;
            }

            // Configurar el nombre, precio y descripción del producto
            if (productNameElem) productNameElem.textContent = product.titulo;
            if (productPriceElem) productPriceElem.textContent = `$${product.precio}`;
            if (productDescElem) productDescElem.textContent = product.descripcion;
            if (productDesc2Elem && product.descripcion2) productDesc2Elem.textContent = product.descripcion2;

            // Mostrar el pack, o valor por defecto
            if (productPackElem) {
                productPackElem.textContent = product.pack ? product.pack : 'Consulta por packs';
            }

            // Mostrar colores si están disponibles
            if (product.colores && colorList) {
                colorList.innerHTML = ""; // Limpia antes de agregar nuevos
                if (Array.isArray(product.colores)) {
                    // Si los colores son un array simple
                    const colorsText = product.colores.join(', ');
                    const colorItem = document.createElement('p');
                    colorItem.textContent = `Colores: ${colorsText}`;
                    colorList.appendChild(colorItem);
                } else {
                    // Si los colores están organizados en categorías
                    for (const [category, colors] of Object.entries(product.colores)) {
                        const categoryTitle = document.createElement('p');
                        categoryTitle.innerHTML = `<strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${colors.join(', ')}`;
                        colorList.appendChild(categoryTitle);
                    }
                }
                if (colorSection) colorSection.style.display = '';
            } else if (colorSection) {
                colorSection.style.display = 'none'; // Oculta la sección si no hay colores
            }

            // Generar las miniaturas dinámicamente
            if (thumbnailGallery) {
                thumbnailGallery.innerHTML = ""; // Limpia antes de agregar
                for (let i = 1; i <= 3; i++) {
                    const thumbnail = document.createElement('img');
                    thumbnail.src = `${productImagePath}${product.id}${i}.jpg`;
                    thumbnail.alt = `Miniatura ${i} de ${product.titulo}`;
                    thumbnail.classList.add('thumbnail');
                    thumbnail.onclick = () => updateMainImage(thumbnail.src);
                    thumbnailGallery.appendChild(thumbnail);
                }
                // Agregar miniatura del video si existe
                checkAndGenerateVideoThumbnail(productVideoPath, thumbnailGallery);
            }

            // Mostrar la cantidad mínima y máxima
            minQuantity = product.cantidadMinima || 1;
            maxQuantity = product.cantidadMaxima || 100;
            if (quantityRangeElement) {
                quantityRangeElement.textContent = `Cantidad mínima: ${minQuantity}, máxima: ${maxQuantity}`;
            }
            if (quantityInput) {
                quantityInput.min = minQuantity;
                quantityInput.max = maxQuantity;
                quantityInput.value = minQuantity;

                quantityInput.addEventListener('input', () => {
                    const currentValue = parseInt(quantityInput.value, 10);
                    if (isNaN(currentValue) || currentValue < minQuantity) {
                        quantityInput.value = minQuantity;
                    } else if (currentValue > maxQuantity) {
                        quantityInput.value = maxQuantity;
                    }
                });
            }

            configureButtons(product, quantityInput);
            setTimeout(() => {
                document.getElementById('loading-overlay').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-overlay').style.display = 'none';
                }, 400);
            }, 200);
        })
        .catch(error => {
            document.getElementById('loading-overlay').innerHTML = "<p>Error al cargar los datos del producto.</p>";
            console.error('Error al cargar los datos del producto:', error);
        });
});

// Función para generar la miniatura del video a partir del primer fotograma
function checkAndGenerateVideoThumbnail(videoPath, container) {
    fetch(videoPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                const video = document.createElement('video');
                video.src = videoPath;
                video.crossOrigin = "anonymous";
                video.preload = "metadata";
                video.muted = true;
                video.playsInline = true;

                video.addEventListener('loadeddata', () => {
                    // Crear un canvas para capturar el primer fotograma
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = video.videoWidth / 2; // Reducimos tamaño
                    canvas.height = video.videoHeight / 2;

                    video.currentTime = 0.1; // Tomamos el primer fotograma

                    video.addEventListener('seeked', () => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const thumbnailImage = new Image();
                        thumbnailImage.src = canvas.toDataURL('image/jpeg'); // Convertimos a imagen
                        thumbnailImage.classList.add('thumbnail');
                        thumbnailImage.alt = "Vista previa del video";
                        thumbnailImage.onclick = () => updateMainVideo(videoPath);

                        container.appendChild(thumbnailImage);
                    });
                });
            }
        })
        .catch(error => console.error('Error verificando el video:', error));
}

// Función para actualizar el video en la sección principal
function updateMainVideo(videoSrc) {
    const mainContainer = document.querySelector('.product-image');

    // Eliminar cualquier imagen activa
    const mainImage = document.getElementById('product-image');
    if (mainImage) mainImage.style.display = 'none';

    // Eliminar cualquier video previo
    let existingVideo = document.getElementById('product-video');
    if (existingVideo) {
        existingVideo.remove();
    }

    // Crear nuevo elemento de video
    const videoElement = document.createElement('video');
    videoElement.id = 'product-video';
    videoElement.src = videoSrc;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.classList.add('product-video');
    videoElement.volume = 0;
    videoElement.setAttribute('muted', '');

    // Siempre mantenerlo muteado aunque toquen el volumen
    videoElement.addEventListener('volumechange', () => {
        if (!videoElement.muted || videoElement.volume !== 0) {
            videoElement.muted = true;
            videoElement.volume = 0;
        }
    });

    mainContainer.appendChild(videoElement);
}

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

        updateCartCount(); // Actualizar el contador después de agregar

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
    mainImage.style.display = 'block'; // Asegura que se muestre
    const mainVideo = document.getElementById('product-video');
    if (mainVideo) mainVideo.remove(); // Elimina el video si estaba en reproducción
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