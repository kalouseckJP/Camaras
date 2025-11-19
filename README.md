# QUE ES
La intención es lograr crear una aplicación de navegador en la que se pueda visualizar cámaras.  
# Iniciar
El proyecto se divide en dos partes: **Servidor** (Backend) y **Cliente** (Frontend). Necesitarás ejecutar ambos para que el sistema funcione correctamente.

### 2. Iniciar el cliente (Frontend)
Una vez descargado los archivos, se abre una terminal de comandos en la carpeta descargada y se ingresan los siguientes comandos:
```
cd cliente
npm install
```
Esto permitirá la descarga de todos los paquetes necesarios para el funcionamiento.  
Luego:
```
npm dev run
```  
Esto iniciara la aplicación web de forma local y a su vez haciendo posible su acceso dentro de la misma red.

### 2. Iniciar el Servidor (Backend)
Abre una terminal, navega a la carpeta del servidor e instala las dependencias.  
```
cd servidor
npm install
```
**Nota:** Asegúrate de haber creado el archivo `.env` con tus credenciales de base de datos antes de iniciar.

Esto permitirá la descarga de todos los paquetes necesarios para el funcionamiento.  
Luego:
```
node src/server.js
```  