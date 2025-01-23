// Configuración inicial
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAvK5nfFeHy-if0aFNn39I0MShdQP8FFU0",
    authDomain: "fotograd-28f16.firebaseapp.com",
    projectId: "fotograd-28f16",
    storageBucket: "fotograd-28f16.firebasestorage.app",
    messagingSenderId: "318160126664",
    appId: "1:318160126664:web:4e9ffe420705d02fc0dbfd"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
// Inicializa Firestore
const db = getFirestore(app);

// Elementos del DOM
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const cursorGlow = document.getElementById("cursorGlow");
const formSubirImagen = document.getElementById("contenedorFormAfot");
const btnAgregarFoto = document.getElementById("btnAgregarFoto");
const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const contenedorEditarPerfil = document.getElementById("contenedorEditarPerfil");
const formEditarPerfil = document.getElementById("formEditarPerfil");
const btnGuardarC = document.getElementById("btnGuardarC");

// Evento para mostrar u ocultar el formulario de edición
btnEditarPerfil.addEventListener("click", async () => {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        alert("No se encontró información de usuario. Por favor, inicia sesión nuevamente.");
        return;
    }

    try {
        const docRef = doc(db, "usuarios", usuarioId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            if (contenedorEditarPerfil.style.display === "none" || contenedorEditarPerfil.classList.contains("oculto")) {
                contenedorEditarPerfil.classList.remove("oculto");
                contenedorEditarPerfil.style.display = "block";

                // Rellenar los campos del formulario con los datos del usuario
                const usuarioData = docSnap.data();
                document.getElementById("nombreUsuario").value = usuarioData.nombre || "";
                document.getElementById("apellidoUsuario").value = usuarioData.apellido || "";
                document.getElementById("emailUsuario").value = usuarioData.email || "";
                document.getElementById("contrasena").value = usuarioData.contrasena || "";
            } else {
                contenedorEditarPerfil.classList.add("oculto");
                contenedorEditarPerfil.style.display = "none";
            }
        } else {
            alert("No se encontraron datos del usuario.");
        }
    } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        alert("Hubo un problema al cargar los datos del usuario.");
    }
});

// Nuevo evento para el botón de guardar cambios
btnGuardarC.addEventListener("click", async () => {
    // Obtener los nuevos datos del formulario
    const nombreUsuario = document.getElementById("nombreUsuario").value;
    const apellidoUsuario = document.getElementById("apellidoUsuario").value;
    const emailUsuario = document.getElementById("emailUsuario").value;
    const contrasena = document.getElementById("contrasena").value;

    // Validar los datos
    if (!nombreUsuario || !apellidoUsuario || !emailUsuario || !contrasena) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        alert("No se encontró información de usuario. Por favor, inicia sesión nuevamente.");
        return;
    }

    try {
        // Actualizar los datos del usuario en Firestore
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, {
            nombre: nombreUsuario,
            apellido: apellidoUsuario,
            email: emailUsuario,
            contrasena: contrasena
        });

        alert("Datos actualizados correctamente.");
        contenedorEditarPerfil.style.display = "none";
    } catch (error) {
        console.error("Error al actualizar los datos del usuario:", error);
        alert("Hubo un problema al actualizar los datos.");
    }
});


// Detecta el movimiento del mouse y posiciona el destello
document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = `${e.pageX}px`;
    cursorGlow.style.top = `${e.pageY}px`;
    cursorGlow.style.opacity = 1; // Asegúrate de que sea visible mientras se mueve
});


// Opción: Oculta el destello si el mouse deja la página
document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = 0;
});


// Evento para cerrar sesión
btnCerrarSesion.addEventListener("click", () => {
    localStorage.clear();
    alert("Sesión cerrada exitosamente.");
    window.location.href = "index.html"; // Redirigir al inicio
});



// Evento para mostrar u ocultar el formulario para subir una imagen y de acuerdo a
// ello hacer el proceso de subida de la imagen.
document.addEventListener("DOMContentLoaded", () => {
    // Oculta el formulario al cargar la página
    formSubirImagen.style.display = "none";

    // Evento para mostrar el formulario al presionar el botón
    btnAgregarFoto.addEventListener("click", () => {
        if (formSubirImagen.style.display === "none") {
            formSubirImagen.style.display = "flex";
        } else {
            formSubirImagen.style.display = "none"; // Ocultar el formulario si ya está visible
        }
    });

    // Evento para mostrar el nombre del archivo seleccionado
    const archivoImagen = document.getElementById("archivoImagen");
    const nombreArchivo = document.getElementById("nombreArchivo");

    archivoImagen.addEventListener("change", () => {
        if (archivoImagen.files.length > 0) {
            nombreArchivo.textContent = archivoImagen.files[0].name;
        } else {
            nombreArchivo.textContent = "Sin archivos seleccionados";
        }
    });

    // Evento para subir la imagen
    formSubirImagen.addEventListener("submit", async (e) => {
        e.preventDefault();
        const archivoImagen = document.getElementById("archivoImagen");
        const archivo = archivoImagen.files[0];

        if (!archivo) {
            alert("Por favor, selecciona una imagen.");
            return;
        }

        try {
            const usuarioId = localStorage.getItem("usuarioId");
            if (!usuarioId) {
                alert("No se encontró información de usuario. Por favor, inicia sesión nuevamente.");
                return;
            }

            // Subir la imagen a Firebase Storage
            const storageRef = ref(storage, `imagenes/${usuarioId}/${archivo.name}`);
            const snapshot = await uploadBytes(storageRef, archivo);

            // Obtener la URL de descarga
            const urlImagen = await getDownloadURL(snapshot.ref);

            // Actualizar Firestore con la URL de la imagen
            await updateDoc(doc(db, "usuarios", usuarioId), {
                imagen: urlImagen,
            });

            alert("Imagen subida exitosamente.");
            archivoImagen.value = ""; // Limpiar el campo

            // Ocultar el formulario después de subir la imagen
            formSubirImagen.style.display = "none";
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            alert("Hubo un problema al subir la imagen. La base de datos no admite archivos de imagen.");
        }
    });
});



// Obtener el botón y el contenedor de fotos
const btnVerFotos = document.getElementById("btnVerFotos");
const contenedorFotos = document.createElement("div");
btnVerFotos.addEventListener("click", () => {
    if (contenedorFotos.style.display === "none" || contenedorFotos.classList.contains("oculto")) {
        contenedorFotos.classList.remove("oculto");
        contenedorFotos.style.display = "block";
    } else {
        contenedorFotos.classList.add("oculto");
        contenedorFotos.style.display = "none";
    }
});

// Configurar el contenedor de imágenes
contenedorFotos.id = "contenedorFotos";
contenedorFotos.style.display = "none"; // Oculto inicialmente
contenedorFotos.style.gridTemplateColumns = "repeat(auto-fit, minmax(150px, 1fr))";
contenedorFotos.style.gap = "10px";
contenedorFotos.style.padding = "20px";
document.body.appendChild(contenedorFotos);

// Función para obtener las imágenes del usuario desde Firestore
async function obtenerImagenesUsuario() {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
        alert("No se encontró información de usuario. Por favor, inicia sesión nuevamente.");
        return [];
    }

    try {
        // Consulta las imágenes en la colección "imagenes" filtrando por el ID del usuario
        const imagenesQuery = query(collection(db, "imagenes"), where("usuarioId", "==", usuarioId));
        const querySnapshot = await getDocs(imagenesQuery);

        const urls = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.url) {
                urls.push(data.url);
            }
        });

        return urls;
    } catch (error) {
        console.error("Error al obtener las imágenes del usuario:", error);
        alert("Hubo un problema al obtener las imágenes.");
        return [];
    }
}

// Evento para mostrar las fotos del usuario
btnVerFotos.addEventListener("click", async () => {
    // Obtener las imágenes desde Firestore
    const imagenes = await obtenerImagenesUsuario();

    // Limpiar el contenedor de fotos y mostrarlo
    contenedorFotos.innerHTML = "";
    contenedorFotos.style.display = "grid";

    if (imagenes.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No se encontraron fotos. ¡Sube tus primeras fotos!";
        mensaje.style.textAlign = "center";
        mensaje.style.color = "#555";
        contenedorFotos.appendChild(mensaje);
        return;
    }

    // Añadir cada imagen al contenedor
    imagenes.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Foto del usuario";
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        contenedorFotos.appendChild(img);
    });
});

