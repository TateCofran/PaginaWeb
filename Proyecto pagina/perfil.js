document.addEventListener('DOMContentLoaded', () => {
    const userCreationSection = document.getElementById('user-creation-section');
    const loggedInSections = document.getElementById('logged-in-sections');

    // Verificar si hay un usuario registrado en localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        // Mostrar las secciones de información personal e historial de pedidos
        userCreationSection.classList.add('hidden');
        loggedInSections.classList.remove('hidden');
    } else {
        // Mostrar solo la sección de creación de usuario
        userCreationSection.classList.remove('hidden');
        loggedInSections.classList.add('hidden');
    }

    // Manejar la creación de usuario
    const userCreationForm = document.getElementById('user-creation-form');
    userCreationForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = userCreationForm.email.value;
        const password = userCreationForm.password.value;
        localStorage.setItem('user', JSON.stringify({ email, password }));
        alert('Usuario creado con éxito.');
        location.reload(); // Recargar la página para mostrar las secciones correspondientes
    });

    // Cargar información personal
    const personalInfoForm = document.getElementById('personal-info-form');
    personalInfoForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const personalInfo = Object.fromEntries(new FormData(personalInfoForm).entries());
        localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
        alert('Información personal guardada con éxito.');
    });

    personalInfoForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const personalInfo = Object.fromEntries(new FormData(personalInfoForm).entries());
        localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
        alert('Información personal guardada con éxito.');
    });
    
    // Cargar historial de pedidos
    const orderHistoryList = document.getElementById('order-history-list');
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
    orderHistory.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.textContent = `Pedido #${order.id}: ${order.items} - Total: $${order.total}`;
        orderHistoryList?.appendChild(orderElement);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const orderHistoryList = document.getElementById('order-history-list');
    const orderHistory = [
        {
            id: 12345,
            date: '15/01/2025',
            total: 4590.00,
            shipping: { method: 'FLEX', price: 720.00 },
            products: [
                { id: 1, name: 'Producto 1', price: 1500.00, quantity: 2 },
                { id: 2, name: 'Producto 2', price: 1200.00, quantity: 1 },
            ],
        },
    ];

    // Mostrar historial de pedidos
    function displayOrderHistory() {
        orderHistory.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.innerHTML = `
                <h3>Pedido #${order.id}</h3>
                <p>Fecha: ${order.date}</p>
                <p>Total: $${order.total.toFixed(2)}</p>
                <p>Formato de Envío: ${order.shipping.method} - $${order.shipping.price.toFixed(2)}</p>
                <div class="products-list">
                    <ul>
                        ${order.products
                            .map(
                                product => `
                                <li>
                                    <a href="productoDetalles.html?id=${product.id}" class="product-link">${product.name}</a> - $${product.price.toFixed(2)} (x${product.quantity})
                                </li>
                            `
                            )
                            .join('')}
                    </ul>
                </div>
                <button class="reorder-button" data-order-id="${order.id}">Volver a Comprar</button>
            `;
            orderHistoryList.appendChild(orderItem);
        });
    }

    // Volver a comprar productos
    function reorderProducts(orderId) {
        const order = orderHistory.find(o => o.id === parseInt(orderId));
        if (order) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            order.products.forEach(product => {
                const existingProduct = cart.find(item => item.id === product.id);
                if (existingProduct) {
                    existingProduct.quantity += product.quantity;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: product.quantity,
                        image: `${product.id}/${product.id}1.jpg`,
                    });
                }
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Los productos han sido agregados al carrito.');
            window.location.href = 'cart.html'; // Redirigir al carrito
        }
    }

    // Agregar eventos a los botones de "Volver a Comprar"
    orderHistoryList.addEventListener('click', (event) => {
        if (event.target.classList.contains('reorder-button')) {
            const orderId = event.target.dataset.orderId;
            reorderProducts(orderId);
        }
    });

    displayOrderHistory();
});
