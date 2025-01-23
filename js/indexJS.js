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

//Código distinto a la configuración de nuestra Cloud Firestore
// Animación del fondo de la página inicial:
document.addEventListener("DOMContentLoaded", () => {
    const imagenes = document.querySelectorAll(".imagen");
    let indiceActual = 0;

    function cambiarImagen() {
        // Quitar la clase 'visible' de todas las imágenes
        imagenes.forEach((imagen) => imagen.classList.remove("visible"));

        // Añadir la clase 'visible' a la imagen actual
        imagenes[indiceActual].classList.add("visible");

        // Avanzar al siguiente índice
        indiceActual = (indiceActual + 1) % imagenes.length;
    }

    // Cambiar la imagen cada 5 segundos
    setInterval(cambiarImagen, 5500);

    // Iniciar la animación mostrando la primera imagen
    cambiarImagen();
});


const btnIniciarSesion = document.getElementById("btnIniciarSesion");
const btnRegistrarse = document.getElementById("btnRegistrarse");
const iniciarSesionForm = document.getElementById("iniciarSesionForm");
const registrarseForm = document.getElementById("registrarseForm");
const btnEnviarSesion = document.getElementById("btnEnviarSesion");
const btnEnviarRegistro = document.getElementById("btnEnviarRegistro");



btnRegistrarse.addEventListener("click", () => {
    if (registrarseForm.style.display === "none" || registrarseForm.classList.contains("oculto")) {
        registrarseForm.classList.remove("oculto");
        registrarseForm.style.display = "block";
    } else {
        registrarseForm.classList.add("oculto");
        registrarseForm.style.display = "none";
    }
});

// Registrar un usuario
btnEnviarRegistro.addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const email = document.getElementById("email").value;
    const contrasena = document.getElementById("contrasena").value;

    // Validación de campos vacíos
    if (!nombre || !apellido || !email || !contrasena) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        // Registrar al nuevo usuario en la base de datos
        await addDoc(collection(db, "usuarios"), {
            apellido,
            contrasena,
            email,
            nombre,
        });
        alert("¡Usuario registrado exitosamente!");
        limpiarCampos();  // Limpiar los campos después del registro
    } catch (error) {
        console.error("Error registrando usuario:", error);
        alert("Hubo un problema registrando el usuario.");
    }
});




// Mostrar u ocultar el formulario al hacer clic
btnIniciarSesion.addEventListener("click", () => {
    if (iniciarSesionForm.style.display === "none" || iniciarSesionForm.classList.contains("oculto")) {
        iniciarSesionForm.classList.remove("oculto");
        iniciarSesionForm.style.display = "block";  // Asegúrate de que el formulario se muestra
    } else {
        iniciarSesionForm.classList.add("oculto");
        iniciarSesionForm.style.display = "none";  // Ocultar el formulario
    }
});

// Iniciar sesión cuando el formulario es enviado
btnEnviarSesion.addEventListener("click", async () => {
    const correoSesion = document.getElementById("correoSesion").value;
    const contrasenaSesion = document.getElementById("contrasenaSesion").value;

    if (!correoSesion || !contrasenaSesion) {
        alert("Por favor, completa ambos campos.");
        return;
    }

    try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        let usuarioEncontrado = null;

        usuariosSnapshot.forEach((doc) => {
            const usuario = doc.data();
            if (usuario.email === correoSesion) {
                usuarioEncontrado = { ...usuario, id: doc.id };
            }
        });

        if (!usuarioEncontrado) {
            alert("Correo no encontrado. Verifica que estás registrado.");
            return;
        }

        if (usuarioEncontrado.contrasena === contrasenaSesion) {
            alert(`Bienvenid@, ${usuarioEncontrado.nombre}!`);

            // Guardar el ID del usuario en localStorage para usarlo en la nueva página
            localStorage.setItem("usuarioId", usuarioEncontrado.id);
            localStorage.setItem("usuarioEmail", usuarioEncontrado.email);

            // Redirigir a la nueva página
            window.location.href = "index2_inicio.html";
        } else {
            alert("Contraseña incorrecta. Intenta de nuevo.");
        }
    } catch (error) {
        console.error("Error iniciando sesión:", error);
        alert("Hubo un problema iniciando sesión.");
    }
});





document.addEventListener("DOMContentLoaded", () => {
    const selectUsuarios = document.getElementById("usuarioOpcions");
    const correoSesionInput = document.getElementById("correoSesion");

    // Función para cargar usuarios desde Firestore
    async function cargarUsuarios() {
        try {
            // Referencia a la colección "usuarios" en Firestore
            const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
            selectUsuarios.innerHTML = `<option value="">Usuarios registrados</option>`; // Opcional: para un estado inicial

            // Verifica si la colección contiene documentos
            if (!usuariosSnapshot.empty) {
                // Iterar por los documentos de la colección
                usuariosSnapshot.forEach((doc) => {
                    const usuario = doc.data(); // Obtenemos los datos del usuario
                    const option = document.createElement("option");
                    option.value = usuario.email; // Ajusta para el campo de correo en Firestore
                    option.textContent = usuario.email; // Ajusta si usas "nombre" o solo "email"
                    selectUsuarios.appendChild(option);
                });

                // Asegúrate de que el select sea visible
                selectUsuarios.style.display = "block";
            } else {
                // Si no hay usuarios, oculta el select
                selectUsuarios.style.display = "none";
                alert("No hay usuarios registrados en la base de datos.");
            }
        } catch (error) {
            console.error("Error al cargar usuarios desde Firestore:", error);
            alert("Hubo un error al cargar los usuarios. Intenta más tarde.");
        }
    }

    // Sincronizar el campo de correo con el select
    selectUsuarios.addEventListener("change", (event) => {
        correoSesionInput.value = event.target.value; // Copia el correo seleccionado al input
    });

    // Cargar usuarios cuando se carga la página
    cargarUsuarios();
});



// Referencia al botón eliminarUsuarios
const btnEliminarUsuario = document.getElementById("btnEliminarUsuario");

// Función para manejar la eliminación de un usuario
btnEliminarUsuario.addEventListener("click", async () => {
    const selectUsuarios = document.getElementById("usuariosAeliminar");

    try {
        // Cargar usuarios en el select si no están cargados
        if (selectUsuarios.options.length <= 1) {
            const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
            selectUsuarios.innerHTML = `<option value="">Selecciona un usuario</option>`;

            usuariosSnapshot.forEach((doc) => {
                const usuario = doc.data();
                const option = document.createElement("option");
                option.value = doc.id; // Almacena el ID del documento
                option.textContent = usuario.email;
                selectUsuarios.appendChild(option);
            });

            selectUsuarios.style.display = "block";
        }

        // Verificar si se seleccionó un usuario
        const usuarioSeleccionadoId = selectUsuarios.value;
        if (!usuarioSeleccionadoId) {
            alert("Por favor, selecciona un usuario para eliminar.");
            return;
        }

        // Obtener el texto del usuario seleccionado para mostrarlo en la alerta
        const usuarioSeleccionadoTexto = selectUsuarios.options[selectUsuarios.selectedIndex].textContent;

        // Confirmar la eliminación del usuario
        const confirmar = confirm(`¿Estás seguro de que deseas eliminar a "${usuarioSeleccionadoTexto}"?`);
        if (!confirmar) {
            return;
        }

        // Eliminar al usuario seleccionado de la base de datos
        await deleteDoc(doc(db, "usuarios", usuarioSeleccionadoId));
        alert(`El usuario "${usuarioSeleccionadoTexto}" ha sido eliminado exitosamente.`);

        // Actualizar el select eliminando al usuario eliminado
        selectUsuarios.remove(selectUsuarios.selectedIndex);

        // Ocultar el select si no hay más usuarios
        if (selectUsuarios.options.length <= 1) {
            selectUsuarios.style.display = "none";
        }
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Hubo un problema al intentar eliminar al usuario.");
    }
});




// Clear input fields
function limpiarCampos() {
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("email").value = "";
    document.getElementById("contrasena").value = "";
    document.getElementById("correoSesion").value = "";
    document.getElementById("contrasenaSesion").value = "";
}