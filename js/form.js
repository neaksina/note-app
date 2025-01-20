const form = document.getElementById("signup-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

   
  let users = JSON.parse(localStorage.getItem("users")) || [];

 
  users.push({ email, password });

   
  localStorage.setItem("users", JSON.stringify(users));
 
  Swal.fire({
    title: "Welcome!",
    text: "Your account has been successfully created in Local Storage.",
    icon: "success",
    confirmButtonText: "OK",
  }).then(() => {
     
    const firebaseConfig = {
      databaseURL: "https://note-cbdc4-default-rtdb.asia-southeast1.firebasedatabase.app"
    };

     
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

     
    const userRef = database.ref('users');  
    const newUserRef = userRef.push();  
    newUserRef.set({
      email: email,
      password: password
    }).then(() => {
      Swal.fire({
        title: 'Success!',
        text: 'Your data has been saved to Firebase!',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        
        window.location.href = "../pages/feature.html";
      });
       
      form.reset();
    }).catch((error) => {
      console.error('Error saving data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an issue saving your data.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });
  });
});




