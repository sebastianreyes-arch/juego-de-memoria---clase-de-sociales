exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  
  // Guarda temporalmente en un archivo JSON (para pruebas)
  console.log("Nuevo puntaje:", data);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Puntaje recibido", data }),
  };
};
