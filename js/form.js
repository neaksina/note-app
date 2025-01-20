const form = document.getElementById("signup-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Retrieve existing users or initialize as an empty array
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Add the new user to the list
  users.push({ email, password });

  // Save updated users list to Local Storage
  localStorage.setItem("users", JSON.stringify(users));

  // Show success alert for local storage save
  Swal.fire({
    title: "Welcome!",
    text: "Your account has been successfully created in Local Storage.",
    icon: "success",
    confirmButtonText: "OK",
  }).then(() => {
    // Firebase configuration
    const firebaseConfig = {
      databaseURL: "https://note-cbdc4-default-rtdb.asia-southeast1.firebasedatabase.app",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Save user data to Firebase Realtime Database
    const userRef = database.ref("users");
    const newUserRef = userRef.push();
    newUserRef
      .set({ email, password })
      .then(() => {
        // Show success alert for Firebase save
        Swal.fire({
          title: "Success!",
          text: "Your data has been saved to Firebase!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Redirect to another page
          window.location.href = "../pages/feature.html";
        });

        // Reset the form
        form.reset();
      })
      .catch((error) => {
        // Handle Firebase save error
        console.error("Error saving data:", error);
        Swal.fire({
          title: "Error!",
          text: "There was an issue saving your data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  });
});
