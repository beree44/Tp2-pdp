import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

type Estado = "Pendiente" | "En curso" | "Terminada" | "Cancelada";

interface Tarea {
  titulo: string;
  descripcion: string;
  estado: Estado;
  dificultad: string;
  vencimiento: string;
  creacion: string;
}

let tareas: Tarea[] = [];
let nombre = "Olivia";

function preguntar(texto: string): Promise<string> {
  return new Promise((res) => rl.question(texto, res));
}

function limpiar(): void {
  console.clear();
}

async function pausar() {
  await preguntar("\nPresiona ENTER para continuar...");
}

async function menuPrincipal(): Promise<void> {
  limpiar();
  console.log(`Hola ${nombre}!\n`);
  console.log("1. Ver tareas");
  console.log("2. Buscar tarea");
  console.log("3. Crear tarea");
  console.log("0. Salir\n");

  const opcion = await preguntar("> ");

  if (opcion === "1") {
    await menuFiltrar();
  } else if (opcion === "2") {
    await buscarTarea();
  } else if (opcion === "3") {
    await crearTarea();
  } else if (opcion === "0") {
    console.log("Chau!");
    rl.close();
    process.exit(0);
  } else {
    console.log("Opción no válida");
    await pausar();
    await menuPrincipal();
  }
}

async function menuFiltrar(): Promise<void> {
  limpiar();
  console.log("1. Todas");
  console.log("2. Pendientes");
  console.log("3. En curso");
  console.log("4. Terminadas");
  console.log("0. Volver\n");

  const op = await preguntar("> ");

  if (op === "1") await listar();
  else if (op === "2") await listar("Pendiente");
  else if (op === "3") await listar("En curso");
  else if (op === "4") await listar("Terminada");
  else if (op === "0") {
    await menuPrincipal();
    return;
  } else {
    console.log("Opción no válida");
    await pausar();
  }

  await menuFiltrar();
}

async function listar(filtro?: Estado): Promise<void> {
  limpiar();
  console.log(filtro ? `Tareas ${filtro}` : "Todas tus tareas");
  console.log("---------------------------");

  const lista = tareas.filter((t) => !filtro || t.estado === filtro);

  if (lista.length === 0) {
    console.log("No hay tareas");
    await pausar();
    return;
  }

  lista.forEach((t, i) => {
    console.log(`[${i + 1}] ${t.titulo} | ${t.estado} | Vence: ${t.vencimiento}`);
  });

  const sel = await preguntar("\nVer detalle (número o 0 para volver): ");
  const n = parseInt(sel);
  if (n > 0 && n <= lista.length) {
    const tareaIndex = tareas.indexOf(lista[n - 1]);
    await verDetalle(tareaIndex);
  }
}

async function crearTarea(): Promise<void> {
  limpiar();
  const titulo = await preguntar("Título: ");
  const descripcion = await preguntar("Descripción: ");
  const vencimiento = await preguntar("Vencimiento (DD/MM/AAAA): ");

  const nueva: Tarea = {
    titulo,
    descripcion,
    estado: "Pendiente",
    dificultad: "+--",
    vencimiento,
    creacion: new Date().toLocaleDateString("es-AR"),
  };

  tareas.push(nueva);
  console.log("\nTarea creada!");
  await pausar();
  await menuPrincipal();
}

async function buscarTarea(): Promise<void> {
  limpiar();
  const texto = await preguntar("Buscar título: ");
  const resultados = tareas.filter((t) =>
    t.titulo.toLowerCase().includes(texto.toLowerCase())
  );

  if (resultados.length === 0) {
    console.log("No se encontraron tareas.");
    await pausar();
    await menuPrincipal();
    return;
  }

  console.log("\nResultados:\n");
  resultados.forEach((t, i) => console.log(`[${i + 1}] ${t.titulo}`));

  const sel = await preguntar("\nVer detalle (número o 0 para volver): ");
  const n = parseInt(sel);
  if (n > 0 && n <= resultados.length) {
    const tareaIndex = tareas.indexOf(resultados[n - 1]);
    await verDetalle(tareaIndex);
  } else {
    await menuPrincipal();
  }
}

async function verDetalle(i: number): Promise<void> {
  const t = tareas[i];
  limpiar();
  console.log("=== Detalle de la tarea ===");
  console.log(`Título: ${t.titulo}`);
  console.log(`Descripción: ${t.descripcion}`);
  console.log(`Estado: ${t.estado}`);
  console.log(`Dificultad: ${t.dificultad}`);
  console.log(`Vencimiento: ${t.vencimiento}`);
  console.log(`Creación: ${t.creacion}`);
  console.log("\n[E] Editar | [D] Eliminar | [0] Volver");

  const op = await preguntar("> ");

  if (op.toLowerCase() === "e") {
    await editarTarea(i);
    await verDetalle(i);
  } else if (op.toLowerCase() === "d") {
    const conf = await preguntar("¿Seguro? (s/n): ");
    if (conf.toLowerCase() === "s") {
      tareas.splice(i, 1);
      console.log("Tarea eliminada");
      await pausar();
    }
    await menuPrincipal();
  }
}

async function editarTarea(i: number): Promise<void> {
  const t = tareas[i];
  const desc = await preguntar(`Nueva descripción (actual: ${t.descripcion}): `);
  if (desc.trim() !== "") t.descripcion = desc;

  const est = await preguntar("Nuevo estado [P]endiente/[E]n curso/[T]erminada/[C]ancelada: ");
  if (est.toLowerCase() === "p") t.estado = "Pendiente";
  else if (est.toLowerCase() === "e") t.estado = "En curso";
  else if (est.toLowerCase() === "t") t.estado = "Terminada";
  else if (est.toLowerCase() === "c") t.estado = "Cancelada";

  const dif = await preguntar("Dificultad [1] fácil / [2] media / [3] difícil: ");
  if (dif === "1") t.dificultad = "+--";
  else if (dif === "2") t.dificultad = "++-";
  else if (dif === "3") t.dificultad = "+++";

  const venc = await preguntar(`Nuevo vencimiento (actual ${t.vencimiento}): `);
  if (venc.trim() !== "") t.vencimiento = venc;

  console.log("\nTarea actualizada!");
  await pausar();
}

menuPrincipal();
