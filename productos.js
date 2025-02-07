// Cargar productos desde el archivo JSON
document.addEventListener('DOMContentLoaded', () => {
    fetch('productosList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo JSON');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('products-container');
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
                productImage.src = imagePaths[0]; // Imagen inicial
                productImage.alt = product.titulo;
                imageContainer.appendChild(productImage);
       
                // Iniciar transición de imágenes al pasar el mouse
                imageContainer.addEventListener('mouseenter', () => {
                    productInterval = setInterval(() => {
                        currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
                        productImage.src = imagePaths[currentImageIndex];
                    }, 1000); // Cambiar imagen cada 10 segundos
                });
       
                // Detener transición de imágenes al salir el mouse
                imageContainer.addEventListener('mouseleave', () => {
                    clearInterval(productInterval);
                    productImage.src = imagePaths[0]; // Restablecer a la primera imagen
                });
       
                // Crear contenedor para la información
                const infoContainer = document.createElement('div');
                infoContainer.classList.add('info-container');
                infoContainer.innerHTML = `
                    <h3>${product.titulo}</h3>
                    <p>${product.pack}<p>
                    <h3>$${product.precio}</h3>
                    <div class="product-actions">
                        <button class="more-details" onclick="redirectToDetails('${product.titulo}', ${product.precio}, '${product.id}')">
                            Más detalles
                        </button>
                    </div>
                `;
       
                // Agregar contenedores al producto
                productElement.appendChild(imageContainer);
                productElement.appendChild(infoContainer);

                // Agregar el producto al contenedor principal
                container.appendChild(productElement);
            });
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
});


// Redirigir a la página de detalles con los parámetros correctos
function redirectToDetails(name, price, id) {
    console.log('Nombre:', name);
    console.log('Precio:', price);
    console.log('ID:', id);

    const params = new URLSearchParams({
        id: id,
        name: name,
        price: price
    });

    window.location.href = `productosDetalles.html?${params.toString()}`;
}