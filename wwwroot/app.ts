

document.addEventListener('DOMContentLoaded', () => {

    // --- Variables para GET ---
    const loadButton = document.getElementById('loadFlavorsButton');
    const flavorList = document.getElementById('flavorList');

    // ▼▼▼ AÑADE ESTAS VARIABLES NUEVAS ▼▼▼
    const createButton = document.getElementById('createFlavorButton');
    const flavorNameInput = document.getElementById('flavorNameInput');
    // ▲▲▲ ▲▲▲ ▲▲▲

    // --- Event Listener para GET (Cargar Sabores) ---
    loadButton.addEventListener('click', () => {
        // ¡Cambiamos esto! Ya no necesitamos 'async' aquí
        // porque la función 'renderFlavorList' será la asíncrona.
        renderFlavorList();
    });
    
    // ▼▼▼ FUNCIÓN COMPLETAMENTE NUEVA ▼▼▼
    /**
     * Pide los sabores y los pinta en la lista
     */
    async function renderFlavorList() {
        flavorList.innerHTML = '<li>Cargando...</li>';
        
        try {
            const response = await fetch('/api/flavors');
            if (!response.ok) throw new Error('Error al pedir los datos');
            const flavors = await response.json();
            
            flavorList.innerHTML = ''; // Limpia la lista

            flavors.forEach(flavor => {
                // 'createFlavorLi' es una nueva función "ayudante"
                const li = createFlavorLi(flavor);
                flavorList.appendChild(li);
            });

        } catch (error) {
            console.error('Falló la petición GET:', error);
            flavorList.innerHTML = '<li>Error al cargar los sabores.</li>';
        }
    }

    // ▼▼▼ FUNCIÓN COMPLETAMENTE NUEVA ▼▼▼
    /**
     * Crea y devuelve un <li> para un sabor
     * @param {object} flavor - El objeto de sabor (ej. {id: 1, name: "Chocolate"})
     */
    function createFlavorLi(flavor) {
        const li = document.createElement('li');
        // Usamos data-id para guardar el ID en el HTML
        li.dataset.id = flavor.id; 
        
        // 1. Contenedor para la vista "normal"
        const viewDiv = document.createElement('div');
        viewDiv.className = 'view-mode';
        
        const textNode = document.createTextNode(
            `ID: ${flavor.id} - Sabor: ${flavor.name} `
        );
        viewDiv.appendChild(textNode);

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Actualizar';
        updateButton.style.marginLeft = '10px';
        updateButton.addEventListener('click', () => {
            // Llama a una función para "cambiar a modo edición"
            switchToEditMode(li, flavor);
        });
        viewDiv.appendChild(updateButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Borrar';
        deleteButton.style.marginLeft = '5px';
        deleteButton.addEventListener('click', () => {
            deleteFlavor(flavor.id); // Esta función ya la teníamos
        });
        viewDiv.appendChild(deleteButton);

        li.appendChild(viewDiv); // Añade la vista normal al <li>

        // 2. Contenedor para la vista "edición" (oculto por defecto)
        const editDiv = document.createElement('div');
        editDiv.className = 'edit-mode';
        editDiv.style.display = 'none'; // ¡Oculto!

        const input = document.createElement('input');
        input.type = 'text';
        input.value = flavor.name;
        editDiv.appendChild(input);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.style.marginLeft = '10px';
        saveButton.addEventListener('click', async () => {
            // Al guardar, llama a la API
            const newName = input.value;
            await saveUpdate(flavor.id, newName);
        });
        editDiv.appendChild(saveButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.style.marginLeft = '5px';
        cancelButton.addEventListener('click', () => {
            // Al cancelar, solo cambia de vuelta
            switchToViewMode(li);
        });
        editDiv.appendChild(cancelButton);

        li.appendChild(editDiv); // Añade la vista de edición al <li>

        return li;
    }

    // ▼▼▼ FUNCIONES AYUDANTES PARA CAMBIAR VISTAS ▼▼▼

    function switchToEditMode(li, flavor) {
        li.querySelector('.view-mode').style.display = 'none'; // Oculta vista normal
        li.querySelector('.edit-mode').style.display = 'block'; // Muestra vista edición
        // Ponemos el valor original en el input (por si cancela)
        li.querySelector('.edit-mode input').value = flavor.name; 
    }

    function switchToViewMode(li) {
        li.querySelector('.view-mode').style.display = 'block'; // Muestra vista normal
        li.querySelector('.edit-mode').style.display = 'none'; // Oculta vista edición
    }


    // ▼▼▼ AÑADE ESTE NUEVO EVENT LISTENER PARA POST ▼▼▼

    // 3. Dile al nuevo botón "Guardar" que escuche por un clic
    createButton.addEventListener('click', async () => {
        
        // 1. Obtén el texto del input
        const newName = flavorNameInput.value;

        // 2. Valida que no esté vacío
        if (!newName) {
            alert('Por favor, escribe un nombre para el sabor.');
            return; // Detiene la función
        }

        console.log(`Enviando nuevo sabor: ${newName}`);

        // 3. Crea el objeto de datos que enviaremos
        const flavorData = {
            name: newName
            // Nota: No enviamos el ID, el backend lo genera
        };

        try {
            // 4. ¡AQUÍ ESTÁ EL FETCH (POST)!
            const response = await fetch('/api/flavors', {
                method: 'POST', // Le decimos que es un POST
                headers: {
                    // Le decimos al backend que estamos enviando JSON
                    'Content-Type': 'application/json' 
                },
                // El 'body' es nuestro objeto convertido a un string JSON
                body: JSON.stringify(flavorData) 
            });

            if (!response.ok) {
                throw new Error('Falló al crear el sabor');
            }

            // 5. El backend nos devuelve el sabor recién creado
            const createdFlavor = await response.json();
            
            console.log('Sabor creado:', createdFlavor);

            // 6. Limpiamos el input
            flavorNameInput.value = '';

            // 7. Opcional: Recargamos la lista para ver el nuevo sabor
            // (Podríamos solo añadir el nuevo, pero esto es más fácil)
            loadButton.click(); // Simulamos un clic en el botón "Cargar Sabores"

        } catch (error) {
            console.error('Error en la petición POST:', error);
            alert('No se pudo crear el sabor.');
        }
    });



    // ▼▼▼ AÑADE ESTA NUEVA FUNCIÓN PARA BORRAR ▼▼▼

    /**
     * Llama a la API para borrar un sabor por su ID
     * @param {number} id - El ID del sabor a borrar
     */
    async function deleteFlavor(id) {
        
        // 1. Pedimos confirmación al usuario
        if (!confirm(`¿Estás seguro de que quieres borrar el sabor ID: ${id}?`)) {
            return; // Si dice "Cancelar", no hacemos nada
        }

        console.log(`Borrando sabor ID: ${id}...`);

        try {
            // 2. ¡AQUÍ ESTÁ EL FETCH (DELETE)!
            // La URL incluye el ID, y el método es 'DELETE'
            const response = await fetch(`/api/flavors/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                // response.status nos daría el 404 si no lo encuentra
                throw new Error(`Falló al borrar. Status: ${response.status}`);
            }

            // 3. ¡Éxito! (El backend devolvió 204 No Content)
            console.log(`Sabor ${id} borrado.`);

            // 4. Recargamos la lista para que desaparezca
            loadButton.click(); // Simulamos clic en "Cargar Sabores"

        } catch (error) {
            console.error('Error en la petición DELETE:', error);
            alert('No se pudo borrar el sabor.');
        }
    }





    // ▼▼▼ AÑADE ESTA NUEVA FUNCIÓN PARA ACTUALIZAR ▼▼▼

    /**
     * Llama a la API para actualizar un sabor por su ID
     * @param {number} id - El ID del sabor a actualizar
     * @param {string} currentName - El nombre actual (para mostrarlo)
     */
    async function updateFlavor(id, currentName) {
        
        // 1. Preguntamos al usuario por el nuevo nombre
        // 'prompt()' muestra una caja de texto.
        // El segundo parámetro es el valor por defecto (el nombre actual)
        const newName = prompt('Escribe el nuevo nombre para el sabor:', currentName);

        // 2. Si el usuario presiona "Cancelar" (newName es null)
        // o deja el campo vacío, no hacemos nada.
        if (!newName) {
            return; 
        }

        console.log(`Actualizando sabor ${id} a "${newName}"...`);

        // 3. Preparamos el objeto de datos que enviaremos
        const updatedFlavor = {
            id: id,
            name: newName
        };

        try {
            // 4. ¡AQUÍ ESTÁ EL FETCH (PUT)!
            // La URL incluye el ID. El método es 'PUT'.
            // Y enviamos el 'body' con los datos.
            const response = await fetch(`/api/flavors/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFlavor)
            });

            if (!response.ok) {
                throw new Error(`Falló al actualizar. Status: ${response.status}`);
            }

            // 5. ¡Éxito! (El backend devolvió 204 No Content)
            console.log(`Sabor ${id} actualizado.`);

            // 6. Recargamos la lista para ver el cambio
            loadButton.click(); // Simulamos clic en "Cargar Sabores"

        } catch (error) {
            console.error('Error en la petición PUT:', error);
            alert('No se pudo actualizar el sabor.');
        }
    }
    
    // ▼▼▼ FUNCIÓN COMPLETAMENTE NUEVA ▼▼▼
    /**
     * Crea y devuelve un <li> para un sabor
     * @param {object} flavor - El objeto de sabor (ej. {id: 1, name: "Chocolate"})
     */
    function createFlavorLi(flavor) {
        const li = document.createElement('li');
        // Usamos data-id para guardar el ID en el HTML
        li.dataset.id = flavor.id; 
        
        // 1. Contenedor para la vista "normal"
        const viewDiv = document.createElement('div');
        viewDiv.className = 'view-mode';
        
        const textNode = document.createTextNode(
            `ID: ${flavor.id} - Sabor: ${flavor.name} `
        );
        viewDiv.appendChild(textNode);

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Actualizar';
        updateButton.style.marginLeft = '10px';
        updateButton.addEventListener('click', () => {
            // Llama a una función para "cambiar a modo edición"
            switchToEditMode(li, flavor);
        });
        viewDiv.appendChild(updateButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Borrar';
        deleteButton.style.marginLeft = '5px';
        deleteButton.addEventListener('click', () => {
            deleteFlavor(flavor.id); // Esta función ya la teníamos
        });
        viewDiv.appendChild(deleteButton);

        li.appendChild(viewDiv); // Añade la vista normal al <li>

        // 2. Contenedor para la vista "edición" (oculto por defecto)
        const editDiv = document.createElement('div');
        editDiv.className = 'edit-mode';
        editDiv.style.display = 'none'; // ¡Oculto!

        const input = document.createElement('input');
        input.type = 'text';
        input.value = flavor.name;
        editDiv.appendChild(input);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.style.marginLeft = '10px';
        saveButton.addEventListener('click', async () => {
            // Al guardar, llama a la API
            const newName = input.value;
            await saveUpdate(flavor.id, newName);
        });
        editDiv.appendChild(saveButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.style.marginLeft = '5px';
        cancelButton.addEventListener('click', () => {
            // Al cancelar, solo cambia de vuelta
            switchToViewMode(li);
        });
        editDiv.appendChild(cancelButton);

        li.appendChild(editDiv); // Añade la vista de edición al <li>

        return li;
    }

    // ▼▼▼ FUNCIONES AYUDANTES PARA CAMBIAR VISTAS ▼▼▼

    function switchToEditMode(li, flavor) {
        li.querySelector('.view-mode').style.display = 'none'; // Oculta vista normal
        li.querySelector('.edit-mode').style.display = 'block'; // Muestra vista edición
        // Ponemos el valor original en el input (por si cancela)
        li.querySelector('.edit-mode input').value = flavor.name; 
    }

    function switchToViewMode(li) {
        li.querySelector('.view-mode').style.display = 'block'; // Muestra vista normal
        li.querySelector('.edit-mode').style.display = 'none'; // Oculta vista edición
    }

    // ▼▼▼ REEMPLAZA TU FUNCIÓN 'updateFlavor' CON ESTA 'saveUpdate' ▼▼▼
    
    /**
     * Llama a la API (PUT) para guardar el cambio
     * @param {number} id - El ID del sabor
     * @param {string} newName - El nuevo nombre del input
     */
    async function saveUpdate(id, newName) {
        if (!newName) {
            alert('El nombre no puede estar vacío');
            return;
        }

        console.log(`Actualizando sabor ${id} a "${newName}"...`);
        
        const updatedFlavor = { id: id, name: newName };

        try {
            const response = await fetch(`/api/flavors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFlavor)
            });

            if (!response.ok) {
                throw new Error(`Falló al actualizar. Status: ${response.status}`);
            }

            console.log(`Sabor ${id} actualizado.`);

            // ¡Éxito! Recargamos toda la lista
            // (Es más fácil que actualizar solo este <li>)
            renderFlavorList(); 

        } catch (error) {
            console.error('Error en la petición PUT:', error);
            alert('No se pudo actualizar el sabor.');
        }
    }


    // ... (Tu listener de 'createButton' y tu función 'deleteFlavor'
    // ...  pueden quedarse exactamente como están.
    // ...  Solo asegúrate de que 'createButton' llame a 'renderFlavorList()'
    // ...  en lugar de 'loadButton.click()' para recargar)

    // Solo haz este pequeño cambio en tu 'createButton' listener:
    // Reemplaza:
    // loadButton.click();
    // Con:
    // renderFlavorList();
    


});