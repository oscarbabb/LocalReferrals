// Test script to create a demo user
const userData = {
  username: "demo.usuario",
  email: "demo@test.com",
  password: "demo123", 
  fullName: "Usuario Demo",
  address: "Condominio Las Flores",
  section: "Demo",
  apartment: "101", 
  building: "Edificio Demo",
  phone: "+1234567899",
  isProvider: false
};

fetch('http://localhost:5000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(userData)
})
.then(response => response.json())
.then(data => {
  if (data.id) {
    console.log('✅ Usuario demo creado:', data.fullName, 'ID:', data.id);
  } else {
    console.log('❌ Error:', data.message || 'Error desconocido');
  }
})
.catch(error => {
  console.error('❌ Error de conexión:', error.message);
});