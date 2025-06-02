document.addEventListener('DOMContentLoaded', () => {

    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const flexListContainer = document.getElementById('flex-list-container');
    const flexLocationSelect = document.getElementById('flex-location');
    const clearCartButton = document.getElementById('clear-cart');
    const SEND_ORDER_KEY = 'orderSent';
    let flexPrice = 0;
    let flexData = [];
    let productLimits = {};
    const personalInfo = JSON.parse(localStorage.getItem('personalInfo')) || {};

    // ---- AUTOCOMPLETADO DE DATOS PERSONALES ----
    function populatePersonalInfo() {
        const fields = [
            'full-name', 'email', 'phone', 'dni', 'province',
            'street', 'street-number', 'address', 'floor', 'apartment',
            'locality', 'postal-code',
        ];
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && personalInfo[field]) input.value = personalInfo[field];
        });
    }
    populatePersonalInfo();

    // ---- LIMITES DE CANTIDAD ----
    function loadProductLimits() {
        return fetch('productosList.json')
            .then(r => r.json())
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

    // ---- MOSTRAR CARRITO ----
    function displayCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cartItemsList) return;
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p>El carrito está vacío.</p>';
            document.getElementById('subtotal').textContent = '$0.00';
            document.getElementById('discount').textContent = '-$0.00';
            document.getElementById('envio').textContent = '$0.00';
            document.getElementById('total').textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        cart.forEach(item => {
            const limits = productLimits[item.id] || { min: 1, max: Infinity };
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

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

            // Evento para actualizar cantidad
            const quantityInput = itemContainer.querySelector(`#quantity-${item.id}`);
            quantityInput.addEventListener('change', (e) => {
                let newQuantity = parseInt(e.target.value, 10);
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

            // Evento para eliminar producto
            const removeButton = itemContainer.querySelector('.remove-item');
            removeButton.addEventListener('click', () => {
                removeItemFromCart(item.id);
            });
        });

        // Cálculo de descuento, envío y total
        let discount = subtotal * 0.15;
        let discountedTotal = subtotal - discount;
        let total = discountedTotal + flexPrice;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
        document.getElementById('envio').textContent = `$${flexPrice.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    // ---- BORRAR UN PRODUCTO DEL CARRITO ----
    function removeItemFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        updateCart(cart);
        displayCartItems();
    }

    // ---- VACIAR CARRITO ----
    function clearCart() {
        localStorage.removeItem('cart');
        displayCartItems();
    }
    clearCartButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) clearCart();
    });

    // ---- CARGA FLEX ----
    function loadFlexLocations() {
        fetch('flexList.json')
            .then(r => r.json())
            .then(data => {
                flexData = data || [];
                flexLocationSelect.innerHTML = '<option value="">Selecciona tu ubicación</option>';
                data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.flex;
                    option.setAttribute('data-precio', location.precio);
                    option.textContent = `${location.flex} - $${location.precio}`;
                    flexLocationSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error al cargar flexList.json:", error);
                alert("No se pudieron cargar las opciones de envío. Intenta nuevamente.");
            });
    }

    // ---- FLEX: cambiar ubicación ----
    flexLocationSelect.addEventListener('change', () => {
        const selectedOption = flexLocationSelect.options[flexLocationSelect.selectedIndex];
        flexPrice = parseFloat(selectedOption.getAttribute('data-precio')) || 0;
        displayCartItems();
    });

    // ---- ACTUALIZAR CART ----
    function updateCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // ---- INICIALIZAR ----
    loadProductLimits().then(() => {
        displayCartItems();
        loadFlexLocations();
    });

    // ---- ENVÍO FLEX: mostrar/ocultar y exclusividad ----
    const flexCheckbox = document.getElementById('flex-delivery');
    const shippingOptions = document.querySelectorAll('input[name="shipping-option"]');

    flexCheckbox.addEventListener('change', () => {
        if (flexCheckbox.checked) {
            flexListContainer.classList.remove('hidden');
            loadFlexLocations();
            shippingOptions.forEach(option => { if (option !== flexCheckbox) option.checked = false; });
        } else {
            flexListContainer.classList.add('hidden');
            flexPrice = 0;
            displayCartItems();
        }
    });

    shippingOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.checked && option !== flexCheckbox) {
                flexCheckbox.checked = false;
                flexListContainer.classList.add('hidden');
                flexPrice = 0;
                displayCartItems();
            }
        });
    });

    // ---- ENVIAR A WHATSAPP ----
    const sendToWhatsAppButton = document.getElementById('send-to-whatsapp');
    const phoneNumber = '+5491156130340';

    sendToWhatsAppButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
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
            apartment: formData.get('apartment')
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

        // Flex: asegurar ubicación seleccionada y precio
        let flexLocation = '';
        flexPrice = 0;
        if (selectedShippingOption.id === 'flex-delivery') {
            flexLocation = flexLocationSelect.value.trim();
            if (!flexLocation) {
                alert('Por favor, selecciona tu ubicación en la lista de Envío Flex.');
                return;
            }
            if (flexData.length === 0) {
                alert('Error al cargar las opciones de envío. Intenta nuevamente.');
                return;
            }
            const selectedFlex = flexData.find(flex => flex.flex === flexLocation);
            if (selectedFlex && selectedFlex.precio !== undefined) {
                flexPrice = parseFloat(selectedFlex.precio);
            } else {
                flexPrice = 0;
            }
        }
        // 1. Obtener el mensaje opcional
        const optionalMessage = document.getElementById('optional-message').value.trim();

        // --- MENSAJE DE WHATSAPP ---
        let message = `Hola, quiero realizar el siguiente pedido:\n\n`;
        message += `Datos del comprador:\n`;
        message += `- Nombre: ${data.firstName}\n`;
        message += `- Email: ${data.email}\n`;
        message += `- Teléfono: ${data.phone}\n`;
        message += `- CUIT/CUIL/DNI: ${data.dni}\n`;
        message += `- Dirección: ${data.street} ${data.streetNumber}\n`;
        message += `- Piso/Depto: ${data.floor ? `${data.floor}/` : ''}${data.apartment}\n`;
        message += `- Localidad: ${data.locality}, ${data.province}\n`;
        message += `- Código Postal: ${data.postalCode}\n`;

        // 3. Si hay mensaje opcional, lo agregás
        if (optionalMessage) {
            message += `\n📝 Mensaje opcional:\n"${optionalMessage}"\n`;
        }
        message += `\nMétodo de envío:\n- ${selectedShippingOption.value}`;
        if (flexLocation) message += ` (Ubicación: ${flexLocation})`;
        message += `\n`;

        message += `\nPedido:\n`;
        let subtotal = 0;
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} ($${item.price} c/u) = $${(item.price * item.quantity).toFixed(2)}\n`;
            subtotal += item.price * item.quantity;
        });

        // Descuento y total
        let discount = subtotal * 0.15;
        let discountedTotal = subtotal - discount;
        let total = discountedTotal + flexPrice;
        message += `\nDetalle del pedido:\n`;
        message += `- Subtotal: $${subtotal.toFixed(2)}\n`;
        message += `- Descuento (15%): -$${discount.toFixed(2)}\n`;
        message += `- Envío: $${flexPrice.toFixed(2)}\n`;
        message += `\nTotal Final: $${total.toFixed(2)}\n`;

        // Redirigir a WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        setTimeout(() => {
            location.reload();
            clearCart();
        }, 1000);
        clearCart();
    });
});
