Sos mi asistente para mantener la landing page de SOUTO S.A. (empresa constructora argentina: obras civiles, diseño y Dirección de Obra desde 1955). Yo no soy programador: explicame todo en español, simple y breve, y decime qué archivo y qué parte tocaste.

## PROYECTO
- Carpeta: "Pagina de SOUTO SA". Archivos: souto-sa-landing.html (toda la web: HTML + CSS + JS en un solo archivo), api/contact.js, vercel.json, .env.example, .gitignore, LEEME-contacto.md y los íconos en la raíz (favicon.ico, favicon-16x16/32x32/48x48/96x96.png, icon-192.png, apple-touch-icon.png).
- Publicación: GitHub -> Vercel. Cada git push a main se publica solo. NO hagas commit ni push: lo hago yo (git add . / git commit -m "mensaje" / git push). Si te pido publicar, pasame esos comandos.

## CUIDADO CON EL ARCHIVO HTML
souto-sa-landing.html pesa ~2,3 MB porque las imágenes están embebidas en base64 (líneas larguísimas). NUNCA lo leas entero ni imprimas esas líneas. Usá Grep para ubicar lo que necesitás y Read con offset/limit sobre rangos chicos. Al editar, usá reemplazos puntuales; no reescribas el archivo completo ni toques los base64.

## IDENTIDAD VISUAL (no cambiarla salvo que lo pida)
- Estilo: sobrio, corporativo, minimalista, esquinas rectas. Excepciones: el header (bordes redondeados 16px) y el botón "Contactar" (8px).
- Colores (variables en :root): --ink #1A1917, --ink-soft #2A2823, --concrete #EDEAE3, --paper #F7F5F0, --steel #565F63, --blueprint #1D4E5F, --blueprint-bright #2C7A94, --blueprint-tint #D9E6E9, --petroleum #0B2C34, --petroleum-deep #081F25. Usá siempre las variables, no colores sueltos.
- Tipografías: Archivo (títulos, peso 800/900), IBM Plex Sans (texto), IBM Plex Mono (etiquetas/kickers).
- Animaciones existentes (título del hero, línea de tiempo, contadores, reveal al scroll, hover en cards): mantenerlas.

## ESTRUCTURA (en orden)
1. Header fijo flotante, fondo petróleo, bordes redondeados, logo (isotipo + "SOUTO SA" en blanco) a la izquierda, links Nosotros / Dirección de Obra / Proyectos / Contacto y botón "Contactar" (blanco cálido). En <=900px pasa a menú hamburguesa con panel lateral.
2. Hero: foto de obra industrial a ancho completo + degradado petróleo oscuro a la izquierda que se aclara hacia la derecha (solo overlay CSS, no modificar la foto). Título, texto y 2 botones.
3. #nosotros: texto + imagen en dos columnas, badge "1955 / Hoy".
4. Stats con contadores animados (60+, 200+, 40.000 m², 213M).
5. #direccion-obra: servicio destacado (fondo oscuro, 4 ítems, CTA).
6. #proyectos: filtros (Industrial / Urbana / Residencial), proyecto destacado (puente en arco) y grilla de 9 obras. (La subsección "Diseños" fue eliminada a propósito.)
7. #clientes: "Clientes de Souto SA", 12 clientes numerados en grilla. No cambiar nombres ni agregar clientes.
8. Franja de certificaciones.
9. #contacto (footer): 2 columnas; izquierda título + datos (sitio web, ubicación, teléfono con ícono WhatsApp -> https://wa.me/5491168931517); derecha formulario.

## FORMULARIO DE CONTACTO
- JS hace fetch POST a /api/contact con { fname, fcompany, fphone, femail, fmsg }. Muestra #formSuccess o #formError. Campo anti-spam oculto: hp_contact_ref (no renombrarlo a nada tipo "website"/"url": los navegadores lo autocompletan y se pierden envíos).
- api/contact.js envía con Resend a josesoutou@gmail.com. Variables de entorno (SOLO en Vercel, nunca en el código ni en Git): RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL. Jamás escribas una clave real en ningún archivo.
- No cambiar el destino del mail sin que yo lo pida.

## RESPONSIVE
- Breakpoints: 900px (tablet, aparece el hamburguesa) y 600px (mobile). Los cambios de mobile/tablet van DENTRO de @media (max-width: ...) para que desktop NO cambie.
- Siempre sin scroll horizontal, sin textos cortados, imágenes dentro del ancho, botones fáciles de tocar. El header no debe tapar contenido (el hero tiene padding-top en mobile).

## REGLAS AL TRABAJAR
- Hacé SOLO lo que te pido. No cambies textos, diseño, colores ni secciones que no mencioné. Si algo no está claro, preguntame antes.
- Usá las fotos y el logo que yo proveo; no los reemplaces por imágenes generadas ni parecidas.
- Los links internos (#nosotros, etc.) navegan con JS (scrollIntoView). No pongas enlaces que abran avisos de "enlace externo".
- Después de cada cambio verificá que no se rompa el HTML (etiquetas <div> balanceadas, llaves del CSS balanceadas) y que desktop siga igual. Si podés, revisá a 1280px, 820px y 390px de ancho.
- Al terminar decime en 2-3 líneas qué cambiaste y qué debo revisar en el navegador.
