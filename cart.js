document.addEventListener('DOMContentLoaded', () => {
    
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const flexListContainer = document.getElementById('flex-list-container');
    const flexLocationSelect = document.getElementById('flex-location');
    const clearCartButton = document.getElementById('clear-cart');

    const orderIdElement = document.getElementById('order-id'); // Elemento para el número único del pedido
    const SEND_ORDER_KEY = 'orderSent'; // Clave para indicar si el pedido fue enviado

    let flexPrice = 0;
    let flexData = []; // Variable global para almacenar los datos de flexList.json
    let productLimits = {}; // Almacenará los límites de cantidad desde productList.json
    const personalInfo = JSON.parse(localStorage.getItem('personalInfo')) || {};

    // Función para rellenar automáticamente los campos del formulario
    function populatePersonalInfo() {
        const fields = [
            'full-name',
            'email',
            'phone',
            'dni',
            'province',
            'street',
            'street-number',
            'address',
            'floor',
            'apartment',
            'locality',
            'postal-code',
        ];

        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && personalInfo[field]) {
                input.value = personalInfo[field]; // Rellenar el campo si hay información guardada
            }
        });
    }

    // Llamar a la función para rellenar los campos
    populatePersonalInfo();

    // Generar un número único de cinco dígitos
    function generateOrderId() {
        return Math.floor(10000 + Math.random() * 90000); // Genera un número aleatorio entre 10000 y 99999
    }

    // Obtener o establecer un número de pedido persistente
    function getOrderId() {
        let orderId = localStorage.getItem('orderId');

        // Si no existe un número o el pedido fue enviado, generar uno nuevo
        if (!orderId || localStorage.getItem(SEND_ORDER_KEY) === 'true') {
            orderId = generateOrderId();
            localStorage.setItem('orderId', orderId);
            localStorage.setItem(SEND_ORDER_KEY, 'false'); // Reinicia el estado de envío
        }

        return orderId;
    }

    // Marcar el pedido como enviado
    function markOrderAsSent() {
        localStorage.setItem(SEND_ORDER_KEY, 'true');
    }


    
    // Cargar límites de cantidad desde productList.json
    function loadProductLimits() {
        return fetch('productosList.json')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar productosList.json');
                return response.json();
            })
            .then(data => {
                data.forEach(product => {
                    productLimits[product.id] = {
                        min: product.cantidadMinima || 1,
                        max: product.cantidadMaxima || Infinity,
                    };
                });
            })
            .catch(error => console.error('Error:', error));
    }
    
    function displayCartItems() {
        console.log("Ejecutando displayCartItems...");
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Verificar que los elementos existan en el DOM antes de usarlos
        const cartItemsList = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('subtotal');
    
        if (!cartItemsList || !cartTotalElement) {
            console.error("Error: Elementos del carrito no encontrados en el DOM.");
            return;
        }
    
        cartItemsList.innerHTML = '';
    
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p>El carrito está vacío.</p>';
            cartTotalElement.innerHTML = '<p><strong>TOTAL:</strong> $0.00</p>';
            return;
        }
    
        let subtotal = 0;
        let detalleHTML = '<p></p><ul>';
    
        cart.forEach(item => {
            const limits = productLimits[item.id] || { min: 1, max: Infinity };
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;
    
            // Crear contenedor para cada producto
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('cart-item');
    
            itemContainer.innerHTML = `
                <div class="item-image">
                    <img src="images/products/${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <p><strong>${item.name}</strong></p>
                    <label for="quantity-${item.id}">Cantidad:</label>
                    <input type="number" id="quantity-${item.id}" class="quantity-input" value="${item.quantity}" min="${limits.min}" max="${limits.max}">
                </div>
                <div class="item-price">
                    <p>$${itemSubtotal.toFixed(2)}</p>
                </div>
                <div class="item-actions">
                    <button class="remove-item" data-id="${item.id}">🗑</button>
                </div>
            `;
    
            cartItemsList.appendChild(itemContainer);
    
            // Agregar evento para actualizar cantidad
            const quantityInput = itemContainer.querySelector(`#quantity-${item.id}`);
            quantityInput.addEventListener('change', (e) => {
                let newQuantity = parseInt(e.target.value, 10);
    
                // Verificar los límites
                if (newQuantity < limits.min) {
                    alert(`La cantidad mínima para este producto es ${limits.min}.`);
                    newQuantity = limits.min;
                } else if (newQuantity > limits.max) {
                    alert(`La cantidad máxima para este producto es ${limits.max}.`);
                    newQuantity = limits.max;
                }
    
                e.target.value = newQuantity;
                item.quantity = newQuantity;
                updateCart(cart);
                displayCartItems();
            });
    
            // Agregar evento para eliminar producto
            const removeButton = itemContainer.querySelector('.remove-item');
            removeButton.addEventListener('click', () => {
                removeItemFromCart(item.id);
            });
        });
    
        // Aplicar descuento del 15% - 20% hasta el 7/4
        let discount = subtotal * 0.20;
        let discountedTotal = subtotal - discount;
    
        // Agregar costo de envío si existe
        if (flexPrice > 0) {
            //detalleHTML += `<p><strong>Envío:</strong> $${flexPrice.toFixed(2)}</p>`;
            discountedTotal += flexPrice;
        }
    
        detalleHTML += `</ul>
            <p><strong></strong> $${subtotal.toFixed(2)}</p>`;
    
        // Mostrar el total desglosado en la sección "TU PEDIDO"
        cartTotalElement.innerHTML = detalleHTML;
    }
    
    // Función para eliminar un producto del carrito
    function removeItemFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== itemId); // Eliminar el producto por su id
        updateCart(cart);
        displayCartItems(); // Actualizar la vista
    }

    function clearCart() {
        localStorage.removeItem('cart'); // Eliminar el carrito del localStorage
        displayCartItems(); // Actualizar la vista
        //alert('El carrito ha sido vaciado.');
    }
    clearCartButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            clearCart();
        }
    });

    // Función para cargar el archivo flexList.json y manejar la selección
    function loadFlexLocations() {
        fetch('flexList.json')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar flexList.json');
                return response.json();
            })
            .then(data => {
                flexData = data; // Almacena los datos cargados globalmente
                flexLocationSelect.innerHTML = '<option value="">Selecciona tu ubicación</option>';
                data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.flex;
                    option.setAttribute('data-precio', location.precio);
                    option.textContent = `${location.flex} - $${location.precio}`;
                    flexLocationSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Manejar la selección de ubicación Flex
    flexLocationSelect.addEventListener('change', () => {
        const selectedOption = flexLocationSelect.options[flexLocationSelect.selectedIndex];
        flexPrice = parseFloat(selectedOption.getAttribute('data-precio')) || 0;
        displayCartItems(); // Actualizar el total
    });

    // Función para actualizar el carrito en localStorage
    function updateCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Inicializar la lista de productos y precio total al cargar la página
    loadProductLimits().then(() => {
        displayCartItems();
        loadFlexLocations();
    });

    const flexCheckbox = document.getElementById('flex-delivery');
    const shippingOptions = document.querySelectorAll('input[name="shipping-option"]');

    function loadFlexLocations() {
        fetch('flexList.json')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar flexList.json');
                return response.json();
            })
            .then(data => {
                if (!data || data.length === 0) {
                    throw new Error("El archivo flexList.json está vacío o no tiene datos válidos.");
                }
    
                flexData = data; // Guardar los datos en la variable global
    
                flexLocationSelect.innerHTML = '<option value="">Selecciona tu ubicación</option>';
                data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.flex;
                    option.setAttribute('data-precio', location.precio);
                    option.textContent = `${location.flex} - $${location.precio}`;
                    flexLocationSelect.appendChild(option);
                });
    
                console.log("Datos de flex cargados correctamente:");
            })
            .catch(error => {
                console.error("Error al cargar flexList.json:", error);
                alert("No se pudieron cargar las opciones de envío. Intenta nuevamente.");
            });
    }
    

    // Mostrar u ocultar la lista desplegable según el checkbox
    flexCheckbox.addEventListener('change', () => {
        if (flexCheckbox.checked) {
            // Mostrar la lista y cargar opciones
            flexListContainer.classList.remove('hidden');
            loadFlexLocations();
            // Desmarcar otros checkboxes
            shippingOptions.forEach(option => {
                if (option !== flexCheckbox) option.checked = false;
            });
        } else {
            // Ocultar la lista
            flexListContainer.classList.add('hidden');
            flexPrice = 0; // Restablecer el precio del envío
            updateCartTotal();
        }
    });

    // Asegurar que solo un checkbox esté seleccionado
    shippingOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.checked && option !== flexCheckbox) {
                flexCheckbox.checked = false;
                flexListContainer.classList.add('hidden');
                flexPrice = 0; // Restablecer el precio del envío
                updateCartTotal();
            }
        });
    });

    // Actualizar el precio total al seleccionar una ubicación Flex
    flexLocationSelect.addEventListener('change', () => {
        const selectedOption = flexLocationSelect.options[flexLocationSelect.selectedIndex];
        flexPrice = parseFloat(selectedOption.getAttribute('data-precio')) || 0;
        updateCartTotal();
    });

    // Función para actualizar el precio total
    function updateCartTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let discount = subtotal * 0.20;
        let discountedTotal = subtotal - discount;
        let total = discountedTotal + flexPrice; // Agregar el costo de envío
    
        // Actualizar valores en la UI
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
        document.getElementById('envio').textContent = `$${flexPrice.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
        displayCartItems();
    }
    
    

    // Inicializar el precio total al cargar la página
    updateCartTotal();

    const sendToWhatsAppButton = document.getElementById('send-to-whatsapp');
    const wantInvoiceCheckbox = document.getElementById('want-invoice');
    const invoiceFields = document.getElementById('factura-section');

    const phoneNumber = '+5491156130340'; // Número de WhatsApp

    // Mostrar/ocultar campos de factura al marcar el checkbox
    if (wantInvoiceCheckbox) {
        wantInvoiceCheckbox.addEventListener('change', () => {
            if (wantInvoiceCheckbox.checked) {
                invoiceFields.classList.remove('hidden');
                invoiceFields.querySelectorAll('input, select').forEach(field => {
                    field.setAttribute('required', 'required');
                });
            } else {
                invoiceFields.classList.add('hidden');
                invoiceFields.querySelectorAll('input, select').forEach(field => {
                    field.removeAttribute('required');
                });
            }
        });
    }

    sendToWhatsAppButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Obtener datos del formulario
        //const orderId = getOrderId(); // Obtener el número de pedido actual

        const formData = new FormData(document.getElementById('shipping-form'));
        const data = {
            firstName: formData.get('full-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            dni: formData.get('dni'),
            province: formData.get('province'),
            locality: formData.get('locality'),
            postalCode: formData.get('postal-code'),
            street: formData.get('street'),
            streetNumber: formData.get('street-number'),
            floor: formData.get('floor'),
            apartment: formData.get('apartment'),
            wantInvoice: wantInvoiceCheckbox?.checked || false,
            cuitCuil: formData.get('cuit-cuil'),
            businessName: formData.get('business-name'),
            invoiceType: formData.get('invoice-type'),
        };

        // Validar campos obligatorios y resaltar errores
        const requiredFields = ['full-name', 'email', 'phone', 'dni', 'province', 'locality', 'postal-code','street','street-number'];
        let allFieldsValid = true;

        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (!formData.get(fieldName)) {
                field.classList.add('field-error');
                allFieldsValid = false;
            } else {
                field.classList.remove('field-error');
            }
        });

        if (!allFieldsValid) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Validar selección de envío
        const shippingOptions = document.querySelectorAll('input[name="shipping-option"]');
        const selectedShippingOption = Array.from(shippingOptions).find(option => option.checked);
        if (!selectedShippingOption) {
            alert('Por favor, selecciona una opción de envío.');
            return;
        }
        loadFlexLocations();
        // Validar Envío Flex
// Inicializar valores de envío
let flexLocation = '';
let flexPrice = 0;

if (selectedShippingOption.id === 'flex-delivery') {
    flexLocation = flexLocationSelect.value.trim(); // Asegurar que no haya espacios en blanco

    if (!flexLocation) {
        alert('Por favor, selecciona tu ubicación en la lista de Envío Flex.');
        return;
    }

    // Asegurar que flexData está cargado antes de buscar el precio
    if (flexData.length === 0) {
        console.error("Error: Los datos de flexList.json no han sido cargados.");
        alert('Error al cargar las opciones de envío. Intenta nuevamente.');
        return;
    }

    // Buscar el precio del Envío Flex en flexData
    const selectedFlex = flexData.find(flex => flex.flex === flexLocation);
    if (selectedFlex && selectedFlex.precio !== undefined) {
        flexPrice = parseFloat(selectedFlex.precio);
    } else {
        console.warn("Advertencia: No se encontró el precio para la ubicación seleccionada.");
        flexPrice = 0; // Asignar un valor predeterminado en caso de error
    }
}

// Generar mensaje para WhatsApp
let message = `👋 Hola, quiero realizar el siguiente pedido:\n\n`;
message += `📋 Datos del comprador:\n`;
message += `- Nombre: ${data.firstName}\n`;
message += `- Email: ${data.email}\n`;
message += `- Teléfono: ${data.phone}\n`;
message += `- CUIT/CUIL/DNI: ${data.dni}\n`;
message += `- Dirección: ${data.street} ${data.streetNumber}\n`;
message += `- Piso/Depto: ${data.floor ? `${data.floor}/` : ''}${data.apartment}\n`;
message += `- Localidad: ${data.locality}, ${data.province}\n`;
message += `- Código Postal: ${data.postalCode}\n`;

if (data.wantInvoice) {
    message += `\n📄 Facturación:\n`;
    message += `- CUIT/CUIL: ${data.cuitCuil}\n`;
    message += `- Razón Social: ${data.businessName}\n`;
    message += `- Tipo de Factura: ${data.invoiceType}\n`;
}

message += `\n🚚 Método de envío:\n- ${selectedShippingOption.value}`;
if (flexLocation) message += ` (Ubicación: ${flexLocation})`;
message += `\n`;

message += `\n🛒 Pedido:\n`;
let subtotal = 0;
cart.forEach(item => {
    message += `- ${item.quantity}x ${item.name} ($${item.price} c/u) = $${(item.price * item.quantity).toFixed(2)}\n`;
    subtotal += item.price * item.quantity;
});

// Aplicar descuento del 15% - 20 hasta el 7 de abriñ
let discount = subtotal * 0.20;
let discountedTotal = subtotal - discount;

// Sumar el envío
let total = discountedTotal + flexPrice;

// Agregar detalle de precios
message += `\n💵 Detalle del pedido:\n`;
message += `- Subtotal: $${subtotal.toFixed(2)}\n`;
message += `- Descuento (20%): -$${discount.toFixed(2)}\n`;
message += `- Envío: $${flexPrice.toFixed(2)}\n`; // Ahora se mostrará correctamente el costo de envío
message += `\n💰 Total Final: $${total.toFixed(2)}\n`;

// Mostrar mensaje en consola para depuración
console.log("Mensaje generado para WhatsApp:", message);
console.log("flexLocation:", flexLocation);
console.log("flexPrice:", flexPrice);

        // Redirigir a WhatsApp
        //alert(`Pedido #${orderId} enviado a WhatsApp.`);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        markOrderAsSent(); // Marcar el pedido como enviado
        
        // Retrasar la recarga de la página
        setTimeout(() => {
            location.reload(); // Recargar la página después de un pequeño retraso
            clearCart();
        }, 1000); // Retraso de 1 segundo (ajustable si es necesario)
        clearCart()
        });
});