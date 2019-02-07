# Kevin Peña - Prueba Técnica para MoaDW

Este repositorio es una prueba técnica para el cargo de backend developer.

Puede ver un demo en [este servidor en vivo](http://moadw-prueba.kevinpena.com).
Ver la [seccion de endpoints](#endpoints) en este readme para ver los endpoints
disponibles.

Este repositorio fue inicializado como un git clone a
[este](https://github.com/kebien6020/mongoose-skeleton) repositorio creado por
mi, como un esqueleto general basico para aplicaciones en node con mongodb.

Nota: Este archivo es el único archivo en el repositorio con contenido en
español. Los mensajes de commit, comentarios, nombres de variables, entre otros
están en ingles.

## Descripción

De la siguiente base de datos
"[mongodb+srv://root:O7DgnKqSqCFmvC6n@tests-0eeni.mongodb.net/test](mongodb+srv://root:O7DgnKqSqCFmvC6n@tests-0eeni.mongodb.net/test)"
contiene colecciones (users,hats) que poseen la siguiente informacion:

**users**
```
_id:string
email:string
hats:hats
```

**hats**
```
_id:string
name:string
price:number
material:string
```

1. Crear un endpoint que responde un query con el email de los usuarios y lo que
gasto en sobreros, ordenar de mayor a menor gasto, paginar cada 50 usuarios
(serverside).

2. Del anterior endpoint crear un filtro de rango de precios en el lado del
servidor.

3. Crear un endpoint que pintara una tabla que poseerá el email de los usuarios
mas 3 recomendaciones de sombreros que cumplan con sus gustos y generen mayor
ganancia a la empresa, paginar cada 50 usuarios (serverside).

4. Guardar la información anterior en 2 colecciones diferentes.

**NOTA:** No usar callbacks, código legible, diseño agradable, estructura del
código entendible, usar Mongoose,express, Los endpoints deben poder usarse como
API.

## Requerimientos

- Para este proyecto se usa NodeJS minimo version 8. Revisar con `node -v`.
- Para el servidor local de pruebas MongoDB minimo versión 3.6.
  Revisar con `mongod --version`.
- Gestor de paquetes [yarn](https://yarnpkg.com/en/) version 1.13.0.

## Configuración

Para usar esta codebase seguir los siguientes pasos:

1. Verificar versiones de node y mongodb
```sh
node -v
mongod --version
```

2. Clonar el repositorio:
```sh
git clone https://github.com/kebien6020/moadw-prueba-tecnica
```

3. Instalar dependencias:
```sh
yarn
```

### Servidor de pruebas/desarrollo

Para el servidor de desarrollo se debe alimentar la base de datos con datos de
prueba (seed). Para esto usar el siguiente comando:

```sh
yarn seed
```

Luego iniciar el servidor en modo autoreload con:
```sh
yarn watch
# para mas informacion en la consola usar este comando en su lugar
DEBUG=app:*,server:*,db:* yarn watch
# o en windows
npx cross-env DEBUG=app:*,server:*,db:* yarn watch
```

Por defecto se inicia en el puerto 8100, configurable con la variable de entorno
PORT.

### Servidor en modo producción

El servidor en modo producción se inicia con el siguiente comando:
```sh
yarn prod
# para mas informacion en la consola usar este comando en su lugar
DEBUG=app:*,server:*,db:* yarn prod
# o en windows
npx cross-env DEBUG=app:*,server:*,db:* yarn prod
```

Por defecto se inicia en el puerto 8100, configurable con la variable de entorno
PORT.

## Endpoints

### Requerimiento 1

Para el requerimiento 1 se destinó el endpoint `/users/paginated`.

En el servidor en vivo se puede ver accediendo a
http://moadw-prueba.kevinpena.com/users/paginated.

Dado que es un endpoint paginado las diferentes paginas se pueden acceder
mediante el parámetro pages en la url, por ejemplo
http://moadw-prueba.kevinpena.com/users/paginated?page=2

### Requerimiento 2

Para el requerimiento 2 se usa el mismo endpoint del requerimiento 1 con
dos parámetros GET adicionales: minSpent y maxSpent, que filtran los usuarios
por cantidad gastada, por ejemplo `/users/paginated?minSpent=10&maxSpent=500`.

En el servidor en vivo se puede ver accediendo a
http://moadw-prueba.kevinpena.com/users/paginated?minSpent=10&maxSpent=500.

La vista sigue siendo paginada por los que el parámetro page se puede usar
junto con minSpent y maxSpent.

### Requerimiento 3

Para el requerimiento 3 se designa el endpoint `/users/recommendations`.

En el servidor en vivo se puede ver accediendo a
http://moadw-prueba.kevinpena.com/users/recommendations.

Esta vista también está paginada mediante el parámetro GET.

### Requerimiento 4

Dado que las recomendaciones se aplican con un algoritmo de decisión
multicriterio llamado Weighted Sum Model (WSM), el cual se corre por cada
usuario.

Como este proceso tarda varios segundos en completarse, se corre
una sola vez al iniciar el server. Sin embargo también hay un endpoint designado
a recalcular las recomendaciones: `/users/refreshRecommendations`.

Al iniciar el server o al llamar al endpoint mencionado se calculan las
recomendaciones y se guardan en una colección llamada `recommendations`.

### Archivos en JSON

Se designó un endpoint para causar que el servidor guarde las recomendaciones
en un archivo JSON. `/users/recommendations/save`.

Este endpoint recibe los mismos parametros que `/users/recommendations` pero el
resultado lo guarda en archivos json en la ruta /storage.

Vale la pena aclarar que estos archivos no son accesibles al publico mediante
la api, pero un snapshot de los archivos que se producen usando la base de
datos de producción fue cargada en este repo en la [carpeta storage](storage).

## Otras características de esta codebase

- Extensivos unit tests, principalmente en
  [tests/users.test.js](tests/users.test.js).
- Se usa el git hook pre-commit para correr el linter y los tests antes de cada
  commit.
- Implementa Continuous Integration mediante Travis-CI.
- Excepciones inesperadas no crashean el servidor, sino que envían una respuesta
  en JSON con `{success: false, error: /* informacion del error */}` y status
  code 500. Además de registrar el error en el log.
