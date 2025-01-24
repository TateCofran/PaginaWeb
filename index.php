<?php
// Mostrar errores (solo para desarrollo)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Procesar la URL solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$queryString = $_SERVER['QUERY_STRING'];
$cleanPath = trim(str_replace("?" . $queryString, "", $requestUri), "/");

// Rutas básicas
switch ($cleanPath) {
    case "":
        // Página de inicio
        require_once "index1.html";
        break;
    case "productos":
        // Página de productos
        require_once "productos.html";
        break;
    case "productos-detalles":
        // Página de detalles del producto
        require_once "productosDetalles.html";
        break;
    case "preguntas-frecuentes":
        // Página de preguntas frecuentes
        require_once "preguntasFrecuentes.html";
        break;
    case "perfil":
        // Página de perfil del usuario
        require_once "perfil.html";
        break;
    case "cart":
        // Página del carrito
        require_once "cart.html";
        break;
    default:
        // Página 404
        http_response_code(404);
        echo "<h1>404 - Página no encontrada</h1>";
        break;
}
