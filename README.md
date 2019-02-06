# Kevin Peña - Prueba Técnica para MoaDW

Este repositorio es una prueba técnica para el cargo de backend developer.

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
# Con npm
npm install
# o con yarn
yarn
```

### Servidor de pruebas/desarrollo

Para el servidor de desarrollo se debe alimentar la base de datos con datos de
prueba (seed). Para esto usar el siguiente comando:

```sh
# Pendiente
```

Luego iniciar el servidor en modo autoreload con:
```sh
npm run watch
# o
yarn watch
```

### Servidor en modo producción

El servidor en modo producción se inicia con el siguiente comando:
```sh
# Pendiente
```
