



let productos = [], usuarioActual = null, carrito = [], historial = [], vistaActual = 'login', usuariosRegistrados = [];



const usuarios = [
    { username: "ClienteUCV", password: "Central_123", rol: "cliente", nombre: "Maria González", email: "maria.gonzalez@ucv.ve", puntos: 150 },
    { username: "caja_01", password: "Cajero#123", rol: "caja", nombre: "Pedro Martínez", email: "pedro.martinez@ucv.ve" },
    { username: "adminRoot", password: "cafetinAdmin", rol: "admin", nombre: "Administrador", email: "admin@cafetincentral.ve" }
];

const productosIniciales = [
    { id: 1, nombre: "Café Negro", precio: 2.50, imagen: "https://via.placeholder.com/200/6F4E37/FFFFFF?text=Caf%C3%A9+Negro", categoria: "bebidas" },
    { id: 2, nombre: "Café con Leche", precio: 3.00, imagen: "https://via.placeholder.com/200/D4A574/FFFFFF?text=Caf%C3%A9+Leche", categoria: "bebidas" },
    { id: 3, nombre: "Capuccino", precio: 3.50, imagen: "https://via.placeholder.com/200/8B4513/FFFFFF?text=Capuccino", categoria: "bebidas" },
    { id: 4, nombre: "Sandwich de Jamón", precio: 4.50, imagen: "https://via.placeholder.com/200/FFA500/FFFFFF?text=Sandwich", categoria: "comidas" },
    { id: 5, nombre: "Croissant", precio: 2.00, imagen: "https://via.placeholder.com/200/DAA520/FFFFFF?text=Croissant", categoria: "reposteria" },
    { id: 6, nombre: "Brownie", precio: 2.50, imagen: "https://via.placeholder.com/200/8B4513/FFFFFF?text=Brownie", categoria: "reposteria" },
    { id: 7, nombre: "Jugo Natural", precio: 3.00, imagen: "https://via.placeholder.com/200/FF6347/FFFFFF?text=Jugo", categoria: "bebidas" },
    { id: 8, nombre: "Agua Mineral", precio: 1.50, imagen: "https://via.placeholder.com/200/87CEEB/FFFFFF?text=Agua", categoria: "bebidas" }
];

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    verificarSesion();
    configurarEventos();
    document.addEventListener('click', handleDynamicClick);
    document.addEventListener('keypress', handleKeyPress);
});

function handleDynamicClick(e) {
}

function handleKeyPress(e) {
}

function cargarDatos() {
    try {
        productos = JSON.parse(localStorage.getItem('cafetin_productos')) || [...productosIniciales];
        historial = JSON.parse(localStorage.getItem('cafetin_historial')) || [];
        usuariosRegistrados = JSON.parse(localStorage.getItem('cafetin_usuarios'));
        
        if (!usuariosRegistrados || !Array.isArray(usuariosRegistrados) || usuariosRegistrados.length === 0) {
            usuariosRegistrados = [...usuarios];
            localStorage.setItem('cafetin_usuarios', JSON.stringify(usuariosRegistrados));
        }
    } catch (e) {
        console.error('Error loading data:', e);
        productos = [...productosIniciales];
        historial = [];
        usuariosRegistrados = [...usuarios];
    }
}

function verificarSesion() {
    try {
        const usuarioGuardado = localStorage.getItem('cafetin_usuario');
        if (usuarioGuardado) {
            const parsed = JSON.parse(usuarioGuardado);
            const exists = usuariosRegistrados.find(u => u.username === parsed.username);
            if (exists) {
                usuarioActual = parsed;
                mostrarDashboard();
                return;
            }
        }
    } catch (e) {
        console.error('Session error:', e);
        localStorage.removeItem('cafetin_usuario');
    }
    mostrarLogin();
}

function guardarDatos() {
    try {
        localStorage.setItem('cafetin_productos', JSON.stringify(productos));
        if (usuarioActual) {
            localStorage.setItem('cafetin_usuario', JSON.stringify(usuarioActual));
        }
        localStorage.setItem('cafetin_carrito', JSON.stringify(carrito));
        localStorage.setItem('cafetin_historial', JSON.stringify(historial));
        localStorage.setItem('cafetin_usuarios', JSON.stringify(usuariosRegistrados));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function configurarEventos() {
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('closeReceiptBtn')?.addEventListener('click', cerrarRecibo);
}



function handleLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    const username = usernameInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const loginError = document.getElementById('loginError');
    
    if (loginError) {
        loginError.classList.remove('show');
    }
    
    if (!username || !password) {
        if (loginError) {
            loginError.textContent = 'Por favor complete todos los campos';
            loginError.style.display = 'block';
            setTimeout(() => loginError.classList.add('show'), 10);
        }
        return;
    }
    
    const usuario = usuariosRegistrados.find(u => u.username === username && u.password === password);
    
    if (usuario) {
        usuarioActual = { ...usuario };
        localStorage.setItem('cafetin_usuario', JSON.stringify(usuarioActual));
        mostrarNotificacion('¡Bienvenido, ' + usuario.nombre + '!', 'success');
        setTimeout(() => mostrarDashboard(), 300);
    } else {
        if (loginError) {
            loginError.textContent = 'Usuario o contraseña incorrectos';
            loginError.style.display = 'block';
            setTimeout(() => loginError.classList.add('show'), 10);
        }
    }
}

function handleLogout() {
    const nombre = usuarioActual?.nombre || 'Usuario';
    usuarioActual = null;
    carrito = [];
    
    localStorage.removeItem('cafetin_carrito');
    
    chatbotOpen = false;
    const toggle = document.getElementById('chatbotToggle');
    const container = document.getElementById('chatbotContainer');
    if (toggle) toggle.style.display = 'flex';
    if (container) container.classList.remove('show');
    
    mostrarNotificacion('¡Hasta luego, ' + nombre + '!', 'info');
    setTimeout(() => mostrarLogin(), 300);
}



function handleRegister(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('regNombre')?.value.trim() || '';
    const email = document.getElementById('regEmail')?.value.trim() || '';
    const username = document.getElementById('regUsername')?.value.trim() || '';
    const password = document.getElementById('regPassword')?.value || '';
    const confirmPassword = document.getElementById('regConfirmPassword')?.value || '';
    const errorMsg = document.getElementById('registerError');
    
    if (errorMsg) {
        errorMsg.classList.remove('show');
        errorMsg.style.display = 'none';
    }
    
    if (!nombre || !email || !username || !password || !confirmPassword) {
        if (errorMsg) {
            errorMsg.textContent = 'Todos los campos son obligatorios';
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.classList.add('show'), 10);
        }
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (errorMsg) {
            errorMsg.textContent = 'Ingrese un correo electrónico válido';
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.classList.add('show'), 10);
        }
        return;
    }
    
    if (password.length < 4) {
        if (errorMsg) {
            errorMsg.textContent = 'La contraseña debe tener al menos 4 caracteres';
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.classList.add('show'), 10);
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (errorMsg) {
            errorMsg.textContent = 'Las contraseñas no coinciden';
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.classList.add('show'), 10);
        }
        return;
    }
    
    if (usuariosRegistrados.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        if (errorMsg) {
            errorMsg.textContent = 'El nombre de usuario ya está en uso';
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.classList.add('show'), 10);
        }
        return;
    }
    
    if (usuariosRegistrados.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        if (errorMsg) {
            errorMsg.textContent = 'El correo electrónico ya está registrado';
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.classList.add('show'), 10);
        }
        return;
    }
    
    const nuevoUsuario = { 
        username, 
        password, 
        rol: 'cliente', 
        nombre, 
        email, 
        puntos: 0,
        fechaRegistro: new Date().toISOString()
    };
    
    usuariosRegistrados.push(nuevoUsuario);
    guardarDatos();
    
    usuarioActual = { ...nuevoUsuario };
    localStorage.setItem('cafetin_usuario', JSON.stringify(usuarioActual));
    
    mostrarNotificacion('¡Registro exitoso! Bienvenido ' + nombre, 'success');
    setTimeout(() => mostrarDashboard(), 500);
}

function mostrarRegistro() {
    vistaActual = 'registro';
    document.getElementById('app').innerHTML = getRegisterHTML();
    configurarEventos();
}

function mostrarLogin() {
    vistaActual = 'login';
    document.getElementById('app').innerHTML = getLoginHTML();
    configurarEventos();
}

function mostrarDashboard() {
    vistaActual = 'dashboard';
    switch(usuarioActual.rol) {
        case 'cliente': mostrarVistaCliente(); break;
        case 'caja': mostrarVistaCaja(); break;
        case 'admin': mostrarVistaAdmin(); break;
    }
}

function mostrarVista(view) {
    if (view === 'login') {
        mostrarLogin();
    } else if (view === 'logout') {
        handleLogout();
    } else if (usuarioActual) {
        switch(usuarioActual.rol) {
            case 'cliente': renderClienteView(view); break;
            case 'caja': renderCajaView(view); break;
            case 'admin': renderAdminView(view); break;
        }
    }
}



function mostrarVistaCliente() {
    vistaActual = 'cliente';
    document.getElementById('app').innerHTML = getClienteLayoutHTML();
    configurarEventos();
    renderClienteView('catalogo');
    actualizarContadorCarrito();
}

function renderClienteView(view) {
    const content = document.getElementById('mainContent');
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById(`nav-${view}`)?.classList.add('active');
    
    const views = {
        catalogo: () => { content.innerHTML = getCatalogoHTML(); renderCatalogo(); },
        carrito: () => { content.innerHTML = getCarritoHTML(); renderCarrito(); },
        historial: () => { content.innerHTML = getHistorialHTML(); },
        perfil: () => { content.innerHTML = getPerfilHTML(); }
    };
    views[view]?.();
}

function renderCatalogo() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = productos.map(p => `
        <div class="product-card">
            <img src="${p.imagen}" alt="${p.nombre}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${p.nombre}</h3>
                <p class="product-price">$${p.precio.toFixed(2)}</p>
                <button class="btn btn-primary btn-block" onclick="agregarAlCarrito(${p.id})">
                    Añadir al Carrito
                </button>
            </div>
        </div>
    `).join('');
}

function agregarAlCarrito(productoId) {
    if (!productoId) {
        mostrarNotificacion('Producto inválido', 'error');
        return;
    }
    
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    const item = carrito.find(item => item.id === productoId);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
    }
    
    guardarDatos();
    actualizarContadorCarrito();
    mostrarNotificacion(producto.nombre + ' añadido al carrito', 'success');
}

function actualizarContadorCarrito() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        badge.textContent = total;
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }
}

function renderCarrito() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (carrito.length === 0) {
        container.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Tu carrito está vacío</p><button class="btn btn-primary" onclick="mostrarVista('catalogo')">Ver Catálogo</button></div>`;
        return;
    }
    
    container.innerHTML = carrito.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info"><div class="cart-item-name">${item.nombre}</div><div class="cart-item-price">${item.precio.toFixed(2)} c/u</div></div>
            <div class="cart-item-quantity"><button class="quantity-btn" onclick="cambiarCantidad(${index}, -1)">-</button><span>${item.cantidad}</span><button class="quantity-btn" onclick="cambiarCantidad(${index}, 1)">+</button></div>
            <div class="cart-item-subtotal">${(item.precio * item.cantidad).toFixed(2)}</div>
            <button class="cart-item-remove" onclick="eliminarDelCarrito(${index})">×</button>
        </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('cartTotal').textContent = `${total.toFixed(2)}`;
}

function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        eliminarDelCarrito(index);
    } else {
        guardarDatos();
        renderCarrito();
        actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarDatos();
    renderCarrito();
    actualizarContadorCarrito();
}

function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const puntosGanados = Math.floor(total);
    
    historial.unshift({ 
        id: historial.length + 1, 
        fecha: new Date().toISOString().split('T')[0], 
        hora: new Date().toTimeString().slice(0, 5), 
        items: [...carrito], 
        total, 
        puntosGanados 
    });
    
    if (usuarioActual.rol === 'cliente') {
        usuarioActual.puntos = (usuarioActual.puntos || 0) + puntosGanados;
    }
    
    const itemsCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const itemsText = itemsCount === 1 ? '1 producto' : itemsCount + ' productos';
    
    carrito = [];
    guardarDatos();
    actualizarContadorCarrito();
    renderCarrito();
    mostrarNotificacion(`¡Compra exitosa! +${puntosGanados} puntos (${itemsText})`, 'success');
}



function mostrarVistaCaja() {
    vistaActual = 'caja';
    document.getElementById('app').innerHTML = getCajaLayoutHTML();
    configurarEventos();
    renderCajaView('venta');
}

function renderCajaView(view) {
    const content = document.getElementById('mainContent');
    if (view === 'venta') { content.innerHTML = getCajaVentaHTML(); renderCarritoCaja(); }
}

function buscarProductos(termino) {
    const lista = document.getElementById('cashierProductList');
    if (!lista) return;
    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(termino.toLowerCase()));
    lista.innerHTML = filtrados.map(p => `<div class="cashier-product" onclick="agregarACaja(${p.id})"><img src="${p.imagen}" alt="${p.nombre}" class="cashier-product-image"><div class="cashier-product-name">${p.nombre}</div><div class="cashier-product-price">${p.precio.toFixed(2)}</div></div>`).join('');
}

function agregarACaja(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    const item = carrito.find(item => item.id === productoId);
    if (item) { item.cantidad++; } else { carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }); }
    renderCarritoCaja();
}

function renderCarritoCaja() {
    const container = document.getElementById('cashierCartItems');
    if (!container) return;
    
    if (carrito.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-light);">Seleccione productos</p>';
    } else {
        container.innerHTML = `<div style="max-height: 300px; overflow-y: auto;">${carrito.map((item, index) => `<div class="cart-item"><div class="cart-item-info"><div class="cart-item-name">${item.nombre}</div><div class="cart-item-price">${item.precio.toFixed(2)} x ${item.cantidad}</div></div><div class="cart-item-subtotal">${(item.precio * item.cantidad).toFixed(2)}</div><button class="cart-item-remove" onclick="eliminarDeCaja(${index})">×</button></div>`).join('')}</div>`;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('cashierTotal').textContent = `${total.toFixed(2)}`;
}

function eliminarDeCaja(index) { carrito.splice(index, 1); renderCarritoCaja(); }

function finalizarVenta() {
    if (carrito.length === 0) { mostrarNotificacion('No hay productos', 'error'); return; }
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const modal = document.getElementById('receiptModal');
    const receiptDetails = document.getElementById('receiptDetails');
    receiptDetails.innerHTML = `<h3 style="text-align: center; margin-bottom: 15px;">Cafetería UCV</h3><p style="text-align: center; margin-bottom: 10px;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p><hr style="margin: 10px 0;">${carrito.map(item => `<div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>${item.cantidad}x ${item.nombre}</span><span>${(item.precio * item.cantidad).toFixed(2)}</span></div>`).join('')}<hr style="margin: 10px 0;"><div class="receipt-total">Total: ${total.toFixed(2)}</div>`;
    modal.classList.add('show');
    carrito = [];
    renderCarritoCaja();
}

function cerrarRecibo() { document.getElementById('receiptModal').classList.remove('show'); }



function mostrarVistaAdmin() {
    vistaActual = 'admin';
    document.getElementById('app').innerHTML = getAdminLayoutHTML();
    configurarEventos();
    renderAdminView('productos');
}

function renderAdminView(view) {
    const content = document.getElementById('mainContent');
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${view}`)?.classList.add('active');
    
    const views = {
        productos: () => { content.innerHTML = getAdminProductosHTML(); renderAdminProductos(); },
        agregar: () => { content.innerHTML = getAdminAgregarHTML(); }
    };
    views[view]?.();
}

function renderAdminProductos() {
    const lista = document.getElementById('adminProductList');
    if (!lista) return;
    lista.innerHTML = productos.map(p => `<div class="admin-product-item"><img src="${p.imagen}" alt="${p.nombre}" class="admin-product-image"><div class="admin-product-info"><div class="admin-product-name">${p.nombre}</div><div class="admin-product-price">${p.precio.toFixed(2)}</div></div><div class="admin-product-actions"><button class="btn btn-danger btn-sm" onclick="eliminarProducto(${p.id})">Eliminar</button></div></div>`).join('');
}

function eliminarProducto(productoId) {
    if (!confirm('¿Eliminar este producto?')) return;
    productos = productos.filter(p => p.id !== productoId);
    guardarDatos();
    renderAdminProductos();
    mostrarNotificacion('Producto eliminado', 'success');
}

function handleAgregarProducto(e) {
    e.preventDefault();
    
    const nombreInput = document.getElementById('productName');
    const precioInput = document.getElementById('productPrice');
    const imagenInput = document.getElementById('productImage');
    
    const nombre = nombreInput?.value.trim() || '';
    const precio = parseFloat(precioInput?.value);
    const imagen = imagenInput?.value.trim() || '';
    
    if (!nombre) {
        mostrarNotificacion('El nombre del producto es requerido', 'error');
        return;
    }
    
    if (isNaN(precio) || precio <= 0) {
        mostrarNotificacion('Ingrese un precio válido', 'error');
        return;
    }
    
    const imageUrl = imagen || `https://via.placeholder.com/200/6F4E37/FFFFFF?text=${encodeURIComponent(nombre)}`;
    
    const newId = Math.max(...productos.map(p => p.id), 0) + 1;
    productos.push({ 
        id: newId, 
        nombre, 
        precio, 
        imagen: imageUrl, 
        categoria: 'general' 
    });
    
    guardarDatos();
    
    if (nombreInput) nombreInput.value = '';
    if (precioInput) precioInput.value = '';
    if (imagenInput) imagenInput.value = '';
    
    mostrarNotificacion('Producto agregado exitosamente', 'success');
}

function mostrarNotificacion(mensaje, tipo) {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${tipo || 'info'}`;
    notification.textContent = mensaje;
    
    notification.style.position = 'fixed';
    notification.style.top = '90px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.color = '#fff';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '2000';
    notification.style.transform = 'translateX(400px)';
    notification.style.transition = 'all 0.3s ease';
    
    if (tipo === 'success') {
        notification.style.background = '#4CAF50';
    } else if (tipo === 'error') {
        notification.style.background = '#F44336';
    } else if (tipo === 'warning') {
        notification.style.background = '#FF9800';
    } else {
        notification.style.background = '#6F4E37';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
}


function getLoginHTML() {
    return `
        <div class="login-container">
            <div class="login-box">
                <div class="login-logo">
                    <h1>☕ Cafetería UCV</h1>
                    <p>Ingrese sus credenciales</p>
                </div>
                <form id="loginForm">
                    <div class="login-error" id="loginError">
                        Usuario o contraseña incorrectos
                    </div>
                    <div class="form-group">
                        <label for="username">Usuario</label>
                        <input type="text" id="username" placeholder="Ingrese su usuario" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" placeholder="Ingrese su contraseña" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
                </form>
                <div class="register-link">
                    <p>¿No tienes una cuenta? <a href="#" onclick="mostrarRegistro()">Regístrate aquí</a></p>
                </div>
                <div class="demo-accounts">
                    <h4>Cuentas de Prueba</h4>
                    <ul class="demo-list">
                        <li><strong>Cliente:</strong> ClienteUCV / Central_123</li>
                        <li><strong>Caja:</strong> caja_01 / Cajero#123</li>
                        <li><strong>Admin:</strong> adminRoot / cafetinAdmin</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getRegisterHTML() {
    return `
        <div class="login-container">
            <div class="login-box">
                <div class="login-logo">
                    <h1>☕ Cafetería UCV</h1>
                    <p>Crear una nueva cuenta</p>
                </div>
                <form id="registerForm">
                    <div class="login-error" id="registerError">
                        Error en el registro
                    </div>
                    <div class="form-group">
                        <label for="regNombre">Nombre Completo</label>
                        <input type="text" id="regNombre" placeholder="Ingrese su nombre completo" required>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Correo Electrónico</label>
                        <input type="email" id="regEmail" placeholder="correo@ejemplo.com" required>
                    </div>
                    <div class="form-group">
                        <label for="regUsername">Usuario</label>
                        <input type="text" id="regUsername" placeholder="Elige un nombre de usuario" required>
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Contraseña</label>
                        <input type="password" id="regPassword" placeholder="Mínimo 4 caracteres" required>
                    </div>
                    <div class="form-group">
                        <label for="regConfirmPassword">Confirmar Contraseña</label>
                        <input type="password" id="regConfirmPassword" placeholder="Repita su contraseña" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Crear Cuenta</button>
                </form>
                <div class="register-link">
                    <p>¿Ya tienes una cuenta? <a href="#" onclick="mostrarLogin()">Inicia sesión aquí</a></p>
                </div>
            </div>
        </div>
    `;
}

function getClienteLayoutHTML() {
    return `
        <header class="header">
            <div class="container header-content">
                <div class="logo">
                    <span class="logo-icon">☕</span>
                    <span>Cafetería UCV</span>
                </div>
                <nav class="nav">
                    <span style="color: white;">👤 ${usuarioActual.nombre}</span>
                    <span class="cart-badge" id="cartBadge" style="display: none;">0</span>
                    <button class="btn btn-secondary btn-sm" id="logoutBtn" onclick="handleLogout()">Cerrar Sesión</button>
                </nav>
            </div>
        </header>
        <main class="dashboard container">
            <div class="sidebar-nav">
                <a href="#" class="nav-link active" id="nav-catalogo" onclick="mostrarVista('catalogo')">Catálogo</a>
                <a href="#" class="nav-link" id="nav-carrito" onclick="mostrarVista('carrito')">Carrito</a>
                <a href="#" class="nav-link" id="nav-historial" onclick="mostrarVista('historial')">Historial</a>
                <a href="#" class="nav-link" id="nav-perfil" onclick="mostrarVista('perfil')">Mi Perfil</a>
            </div>
            <div id="mainContent"></div>
        </main>
        ${getChatbotHTML()}
    `;
}

function getCatalogoHTML() {
    return `
        <h2 class="section-title">Catálogo de Productos</h2>
        <div class="product-grid" id="productGrid"></div>
    `;
}

function getCarritoHTML() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    return `
        <h2 class="section-title">Mi Carrito</h2>
        <div class="cart-container">
            <div class="cart-header">
                <h3>Productos en el Carrito</h3>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-summary">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cartTotal">$${total.toFixed(2)}</span>
                </div>
                <div class="cart-actions">
                    <button class="btn btn-primary" onclick="finalizarCompra()">Finalizar Compra</button>
                    <button class="btn btn-outline" onclick="carrito = []; renderCarrito(); actualizarContadorCarrito();">Vaciar Carrito</button>
                </div>
            </div>
        </div>
    `;
}

function getHistorialHTML() {
    return `
        <h2 class="section-title">Historial de Compras</h2>
        <div class="history-container">
            ${historial.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3 class="empty-state-title">Sin compras realizadas</h3>
                    <p>Tu historial aparecerá aquí</p>
                </div>
            ` : historial.map(h => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-date">📅 ${h.fecha} - ${h.hora}</span>
                        <span class="history-total">$${h.total.toFixed(2)}</span>
                    </div>
                    <div class="history-items-list">
                        ${h.items.map(item => `<div class="history-item-name">• ${item.cantidad}x ${item.nombre}</div>`).join('')}
                    </div>
                    <div class="history-points">+${h.puntosGanados} puntos ganados</div>
                </div>
            `).join('')}
        </div>
    `;
}

function getPerfilHTML() {
    return `
        <h2 class="section-title">Mi Perfil</h2>
        <div class="points-card">
            <div class="points-value">${usuarioActual.puntos || 150}</div>
            <div class="points-label">Puntos de Lealtad</div>
        </div>
        <div class="card">
            <h3 class="card-title">Información Personal</h3>
            <p><strong>Nombre:</strong> ${usuarioActual.nombre}</p>
            <p><strong>Email:</strong> ${usuarioActual.email}</p>
            <p><strong>Rol:</strong> Cliente</p>
        </div>
    `;
}

function getCajaLayoutHTML() {
    return `
        <header class="header">
            <div class="container header-content">
                <div class="logo">
                    <span class="logo-icon">☕</span>
                    <span>Cafetería UCV - Caja</span>
                </div>
                <nav class="nav">
                    <span style="color: white;">👤 ${usuarioActual.nombre}</span>
                    <button class="btn btn-secondary btn-sm" id="logoutBtn" onclick="handleLogout()">Cerrar Sesión</button>
                </nav>
            </div>
        </header>
        <main class="dashboard container">
            <div class="dashboard-header">
                <div class="welcome-message">
                    <h2>Punto de Venta</h2>
                    <p>Registre las solicitudes de la clientela</p>
                </div>
            </div>
            <div id="mainContent"></div>
        </main>
        ${getChatbotHTML()}
    `;
}

function getCajaVentaHTML() {
    return `
        <div class="cashier-container">
            <div class="cashier-products">
                <h3 class="section-title">Productos</h3>
                <div class="cashier-search">
                    <input type="text" placeholder="Buscar producto..." onkeyup="buscarProductos(this.value)">
                </div>
                <div class="cashier-product-list" id="cashierProductList">
                    ${productos.map(p => `
                        <div class="cashier-product" onclick="agregarACaja(${p.id})">
                            <img src="${p.imagen}" alt="${p.nombre}" class="cashier-product-image">
                            <div class="cashier-product-name">${p.nombre}</div>
                            <div class="cashier-product-price">$${p.precio.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="cashier-cart">
                <h3 class="section-title">Venta Actual</h3>
                <div id="cashierCartItems">
                    <p class="text-center" style="color: var(--text-light);">Seleccione productos</p>
                </div>
                <div class="cart-summary">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span id="cashierTotal">$0.00</span>
                    </div>
                    <div class="cart-actions">
                        <button class="btn btn-success btn-block" onclick="finalizarVenta()">Finalizar Venta</button>
                        <button class="btn btn-outline btn-block" onclick="carrito = []; renderCarritoCaja();">Limpiar</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="receipt-modal" id="receiptModal">
            <div class="receipt-content">
                <div class="receipt-icon">✓</div>
                <h2 class="receipt-title">Recibo Emitido</h2>
                <p class="receipt-message">¡Gracias por su compra!</p>
                <div class="receipt-details" id="receiptDetails"></div>
                <button class="btn btn-primary" id="closeReceiptBtn">Aceptar</button>
            </div>
        </div>
    `;
}

function getAdminLayoutHTML() {
    return `
        <header class="header">
            <div class="container header-content">
                <div class="logo">
                    <span class="logo-icon">☕</span>
                    <span>Cafetería UCV - Admin</span>
                </div>
                <nav class="nav">
                    <span style="color: white;">👤 ${usuarioActual.nombre}</span>
                    <button class="btn btn-secondary btn-sm" id="logoutBtn" onclick="handleLogout()">Cerrar Sesión</button>
                </nav>
            </div>
        </header>
        <main class="dashboard container">
            <div class="dashboard-header">
                <div class="welcome-message">
                    <h2>Gestión del Menú</h2>
                    <p>Administre los productos del cafetín</p>
                </div>
            </div>
            <div class="admin-tabs">
                <button class="admin-tab active" id="tab-productos" onclick="mostrarVista('productos')">Ver Productos</button>
                <button class="admin-tab" id="tab-agregar" onclick="mostrarVista('agregar')">Agregar Producto</button>
            </div>
            <div id="mainContent"></div>
        </main>
        ${getChatbotHTML()}
    `;
}

function getAdminProductosHTML() {
    return `
        <div class="admin-container">
            <h3 class="section-title">Productos del Menú</h3>
            <div class="admin-product-list" id="adminProductList"></div>
        </div>
    `;
}

function getAdminAgregarHTML() {
    return `
        <div class="admin-container">
            <h3 class="section-title">Agregar Nuevo Producto</h3>
            <form class="add-product-form" onsubmit="handleAgregarProducto(event)">
                <div class="form-group">
                    <label for="productName">Nombre del Producto</label>
                    <input type="text" id="productName" placeholder="Ej: Té Verde" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="productPrice">Precio ($)</label>
                        <input type="number" id="productPrice" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="productImage">URL de Imagen</label>
                        <input type="url" id="productImage" placeholder="https://...">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Agregar al Menú</button>
            </form>
        </div>
    `;
}

window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.finalizarCompra = finalizarCompra;
window.mostrarVista = mostrarVista;
window.mostrarRegistro = mostrarRegistro;
window.mostrarLogin = mostrarLogin;
window.buscarProductos = buscarProductos;
window.agregarACaja = agregarACaja;
window.eliminarDeCaja = eliminarDeCaja;
window.finalizarVenta = finalizarVenta;
window.eliminarProducto = eliminarProducto;
window.handleAgregarProducto = handleAgregarProducto;
window.cerrarRecibo = cerrarRecibo;
window.handleLogout = handleLogout;



let chatbotOpen = false;

const chatbotFAQ = {
    'menu': {
        respuesta: `¡Con gusto te cuento sobre nuestro <strong>menú</strong>!Tenemos una gran variedad de productos:`,
        productos: [
            '☕ <strong>Café Negro</strong> - $2.50',
            '🥛 <strong>Café con Leche</strong> - $3.00',
            '☕ <strong>Capuccino</strong> - $3.50',
            '🥪 <strong>Sandwich de Jamón</strong> - $4.50',
            '🥐 <strong>Croissant</strong> - $2.00',
            '🍫 <strong>Brownie</strong> - $2.50',
            '🧃 <strong>Jugo Natural</strong> - $3.00',
            '💧 <strong>Agua Mineral</strong> - $1.50'
        ],
        extra: '¡Y más coming soon!'
    },
    'productos': {
        respuesta: 'Estos son algunos de nuestros productos más populares:',
        productos: [
            '☕ Café Negro - $2.50',
            '🥛 Café con Leche - $3.00',
            '☕ Capuccino - $3.50',
            '🥪 Sandwich de Jamón - $4.50',
            '🥐 Croissant - $2.00'
        ]
    },
    'bebidas': {
        respuesta: '¡Nuestras bebidas!',
        productos: [
            '☕ Café Negro - $2.50',
            '🥛 Café con Leche - $3.00',
            '☕ Capuccino - $3.50',
            '🧃 Jugo Natural - $3.00',
            '💧 Agua Mineral - $1.50'
        ]
    },
    'comida': {
        respuesta: '¡Mira nuestra comida!',
        productos: ['🥪 Sandwich de Jamón - $4.50']
    },
    'reposteria': {
        respuesta: '¡Deliciosos dulces!',
        productos: ['🥐 Croissant - $2.00', '🍫 Brownie - $2.50']
    },
    
    'precio': {
        respuesta: '¡Aquí están nuestros <strong>precios</strong>!',
        productos: [
            '☕ Café Negro: $2.50',
            '🥛 Café con Leche: $3.00',
            '☕ Capuccino: $3.50',
            '🥪 Sandwich: $4.50',
            '🥐 Croissant: $2.00',
            '🍫 Brownie: $2.50'
        ],
        extra: '¡Todos los precios incluyen IVA!'
    },
    'precios': 'precio',
    'cuanto': 'precio',
    'cuesta': 'precio',
    
    'horario': {
        respuesta: '¡Nuestro <strong>horario</strong> de atención es:',
        productos: [
            '🕐 <strong>Lunes a Viernes:</strong> 7:00 AM - 6:00 PM',
            '🕐 <strong>Sábados:</strong> 8:00 AM - 6:00 PM',
            '🕐 <strong>Domingos:</strong> 9:00 AM - 2:00 PM'
        ]
    },
    'horarios': 'horario',
    'hora': 'horario',
    'abierto': 'horario',
    'cerrado': 'horario',
    
    'ubicacion': {
        respuesta: '¡Nos encontramos en una ubicación privilegiada! 🏛️',
        productos: [
            '📍 <strong>Universidad Central de Venezuela</strong>',
            '📍 Facultad de Ciencias',
            '📍 Caracas, Venezuela'
        ],
        extra: '¡Frente a la Biblioteca de Facultad!'
    },
    'direccion': 'ubicacion',
    'donde': 'ubicacion',
    'llegar': 'ubicacion',
    'ubicado': 'ubicacion',
    
    'contacto': {
        respuesta: '¡Contáctanos!',
        productos: [
            '📞 <strong>Teléfono:</strong> (0212) 555-1234',
            '📧 <strong>Email:</strong> info@cafetincentral.ve',
            '📱 <strong>Redes:</strong> @CafetinCentral'
        ]
    },
    'telefono': 'contacto',
    'email': 'contacto',
    
    'puntos': {
        respuesta: '🎁 <strong>Programa de Puntos</strong>\n¡Acumula puntos con cada compra!',
        productos: [
            '⭐ Por cada $1 = 1 punto',
            '⭐ 100 puntos = $5 de descuento',
            '⭐ Acumula y canjea recompensas'
        ],
        extra: 'Consulta tus puntos en la sección "Mi Perfil"'
    },
    'lealtad': 'puntos',
    'recompensa': 'puntos',
    
    'pedido': {
        respuesta: '¡Para hacer un <strong>pedido</strong>!',
        productos: [
            '1️⃣ Explora nuestro catálogo',
            '2️⃣ Añade productos al carrito',
            '3️⃣ Ve a "Carrito" y Finaliza'
        ],
        extra: '¡También puedes pedir en caja directamente!'
    },
    'comprar': 'pedido',
    'ordenar': 'pedido',
    
    'hola': {
        respuesta: '¡Hola! 👋 ¡Bienvenido a Cafetería UCV!',
        productos: ['¿En qué puedo ayudarte hoy?']
    },
    'buenos': 'hola',
    'buenas': 'hola',
    'saludos': 'hola',
    'hey': 'hola',
    
    'gracias': {
        respuesta: '¡De nada! 😊',
        productos: ['¿Hay algo más en lo que pueda ayudarte?']
    },
    'thank': 'gracias',
    'agradecido': 'gracias',
    
    'adios': {
        respuesta: '¡Hasta pronto! 👋',
        productos: ['Que tengas un excelente día ☕']
    },
    'chao': 'adios',
    'bye': 'adios',
    
    'ayuda': {
        respuesta: '¡Estoy aquí para ayudarte! 😊',
        productos: ['Puedo informarte sobre:',
            '📋 Nuestro menú y precios',
            '🕐 Horarios de atención',
            '📍 Nuestra ubicación',
            '🎁 Programa de puntos',
            '📞 Datos de contacto'
        ],
        extra: '¡Escribe tu pregunta!'
    },
    'ayudame': 'ayuda',
    'como': 'ayuda'
};

function getChatbotHTML() {
    return `
        <div class="chatbot-container" id="chatbotContainer">
            <div class="chatbot-header">
                <div class="chatbot-avatar">☕</div>
                <div class="chatbot-title">
                    <h3>Cafetería UCV</h3>
                    <p>Chatea con nosotros</p>
                </div>
                <button class="chatbot-close" id="chatbotCloseBtn">×</button>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="chatbot-welcome">
                    <div class="chatbot-welcome-icon">☕</div>
                    <h4>¡Hola! Bienvenido</h4>
                    <p>¿En qué puedo ayudarte?</p>
                </div>
            </div>
            <div class="chatbot-input-container">
                <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Escribe tu mensaje...">
                <button class="chatbot-send" id="chatbotSendBtn">➤</button>
            </div>
        </div>
        <button class="chatbot-toggle" id="chatbotToggle" style="display: flex;">
            💬
            <div class="notification-dot" id="chatbotNotification" style="display: none;"></div>
        </button>
    `;
}

function toggleChatbot() {
    const container = document.getElementById('chatbotContainer');
    const toggle = document.getElementById('chatbotToggle');
    
    if (!container || !toggle) return;
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        container.classList.add('show');
        toggle.style.display = 'none';
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        }, 300);
    } else {
        container.classList.remove('show');
        toggle.style.display = 'flex';
    }
}

function handleChatbotKeypress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
        event.preventDefault();
    }
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatbotMessage(message, 'user');
    input.value = '';
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        const response = getChatbotResponse(message);
        addChatbotMessage(response, 'bot');
    }, 1000);
}

function addChatbotMessage(message, type) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const welcome = messagesContainer.querySelector('.chatbot-welcome');
    if (welcome) welcome.remove();
    
    const icon = type === 'user' ? '👤' : '☕';
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}`;
    messageDiv.innerHTML = `
        <div class="chatbot-message-icon">${icon}</div>
        <div class="chatbot-message-content">${message}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'chatbotTyping';
    typingDiv.innerHTML = `
        <div class="chatbot-message-icon">☕</div>
        <div class="chatbot-typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typing = document.getElementById('chatbotTyping');
    if (typing) typing.remove();
}

function getChatbotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, value] of Object.entries(chatbotFAQ)) {
        if (lowerMessage.includes(key) && key.length > 2) {
            let data = value;
            if (typeof data === 'string') {
                data = chatbotFAQ[data];
            }
            
            if (!data || !data.respuesta) continue;
            
            let response = data.respuesta;
            
            if (data.productos && data.productos.length > 0) {
                response += '<ul>';
                data.productos.forEach(p => {
                    response += `<li>${p}</li>`;
                });
                response += '</ul>';
            }
            
            if (data.extra) {
                response += `<br><em>${data.extra}</em>`;
            }
            
            response += '<div class="chatbot-quick-replies">';
            response += '<button class="quick-reply" data-topic="menu">📋 Menú</button>';
            response += '<button class="quick-reply" data-topic="horario">🕐 Horarios</button>';
            response += '<button class="quick-reply" data-topic="ubicacion">📍 Ubicación</button>';
            response += '</div>';
            
            return response;
        }
    }
    
    return `<p>¡Entendido! 📝</p>
<p>No encontré información específica sobre "${message}".</p>
<p>Puedo ayudarte con:</p>
<ul><li>📋 Nuestro menú y precios</li><li>🕐 Horarios de atención</li><li>📍 Ubicación</li><li>🎁 Programa de puntos</li></ul>

<div class="chatbot-quick-replies">
    <button class="quick-reply" data-topic="menu">📋 Ver menú</button>
    <button class="quick-reply" data-topic="ayuda">❓ Ayuda</button>
</div>`;
}

function quickReply(topic) {
    if (!topic) return;
    
    addChatbotMessage(topic.charAt(0).toUpperCase() + topic.slice(1), 'user');
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        const response = getChatbotResponse(topic);
        addChatbotMessage(response, 'bot');
    }, 600);
}

function setupChatbotEvents() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-reply')) {
            const topic = e.target.getAttribute('data-topic');
            if (topic) {
                quickReply(topic);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        if (e.target.closest('.chatbot-toggle') || e.target.classList.contains('chatbot-toggle')) {
            toggleChatbot();
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (e.target.classList.contains('chatbot-close')) {
            toggleChatbot();
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (e.target.classList.contains('chatbot-send') || e.target.closest('.chatbot-send')) {
            sendChatbotMessage();
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    document.addEventListener('keypress', function(e) {
        if (e.target.id === 'chatbotInput' && e.key === 'Enter') {
            sendChatbotMessage();
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

setupChatbotEvents();


window.toggleChatbot = toggleChatbot;
window.sendChatbotMessage = sendChatbotMessage;
window.handleChatbotKeypress = handleChatbotKeypress;
window.quickReply = quickReply;
