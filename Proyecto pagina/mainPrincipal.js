document.addEventListener('DOMContentLoaded', function () {
    // --- MAIN SLIDER LOGIC ---
    const sliderImages = document.querySelectorAll('.slider-image');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    let sliderIndex = 0;

    function updateSlider() {
        sliderImages.forEach((image, index) => {
            image.style.opacity = index === sliderIndex ? '1' : '0';
        });
    }

    function nextImage() {
        sliderIndex = (sliderIndex + 1) % sliderImages.length; // Cicla entre las imágenes
        updateSlider();
    }

    function prevImage() {
        sliderIndex = (sliderIndex - 1 + sliderImages.length) % sliderImages.length; // Cicla hacia atrás
        updateSlider();
    }

    if (sliderImages.length > 0) {
        updateSlider(); // Inicializa con la primera imagen visible
        setInterval(nextImage, 5000); // Cambia automáticamente cada 5 segundos
    }

    if (nextButton) {
        nextButton.addEventListener('click', nextImage);
    }

    if (prevButton) {
        prevButton.addEventListener('click', prevImage);
    }
    
 // --- FEATURED PRODUCTS LOGIC ---
 fetch('productosList.json')
 .then(response => {
     if (!response.ok) {
         throw new Error('Error al cargar el archivo JSON');
     }
     return response.json();
 })
 .then(data => {
     const featuredContainer = document.getElementById('featured-products-container');

     // Limitar a los primeros 4 productos
     const featuredProducts = data.slice(0, 4);

     featuredProducts.forEach(product => {
         // Construir las rutas de las imágenes (asumiendo 3 imágenes por producto)
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
             }, 10000); // Cambiar imagen cada 10 segundos
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
             <p>$${product.precio}</p>
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
         featuredContainer.appendChild(productElement);
     });
 })
 .catch(error => {
     console.error('Error al cargar los productos destacados:', error);
 });

// Redirigir a la página de detalles con los parámetros correctos
window.redirectToDetails = function (name, price, id) {
 const params = new URLSearchParams({
     id: id,
     name: name,
     price: price
 });

 window.location.href = `productosDetalles.html?${params.toString()}`;
};
});