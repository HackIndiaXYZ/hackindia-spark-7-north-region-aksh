const axios = require("axios");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWVjNTRiODVhMjRhNjk2YzQwMWQ1YzIiLCJpYXQiOjE3NzcwOTU4OTZ9.gq6FDZerm5HBweEUkz5IJPLW_UHjo0Y57Id_3QSXTjA";

axios.post("http://localhost:3000/getPayout", {}, {
  headers: {
    "Authorization": token,
    "Content-Type": "application/json"
  }
}).then(res => {
  console.log("Success:", res.status, res.data);
}).catch(err => {
  console.log("Error:", err.response ? err.response.status : err.message);
  console.log("Data:", err.response ? err.response.data : "");
});
