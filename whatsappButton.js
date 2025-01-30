document.addEventListener("DOMContentLoaded", function () {
    let lastScrollTop = 0;
    const whatsappButton = document.querySelector(".whatsapp-button");

    if (whatsappButton) {
        window.addEventListener("scroll", function () {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop) {
                // Scroll hacia abajo → Mostramos el botón
                whatsappButton.classList.add("visible");
            } else {
                // Scroll hacia arriba → Ocultamos el botón
                whatsappButton.classList.remove("visible");
            }

            lastScrollTop = scrollTop;
        });
    }
});
