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
                // Crear elemento del producto
                const productElement = document.createElement('div');
                productElement.classList.add('product-item');

                // Construir la ruta de la imagen principal
                const imagePath = `images/products/${product.id}/${product.id}1.jpg`;

                // Crear contenedor para la imagen
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');
                imageContainer.innerHTML = `<img src="${imagePath}" alt="${product.titulo}">`;

                // Crear contenedor para la información
                const infoContainer = document.createElement('div');
                infoContainer.classList.add('info-container');
                infoContainer.innerHTML = `
                    <h3>${product.titulo}</h3>
                    <p>$${product.precio}</p>
                    <div class="product-actions">
                        <!-- Botón Más detalles -->
                        <button class="more-details" onclick="redirectToDetails('${product.titulo}', ${product.precio}, '${product.id}')">
                            Más detalles
                        </button>
                    </div>
                `;

                // Agregar los contenedores al producto
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