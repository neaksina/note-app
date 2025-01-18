// Step 1: Open or Create an IndexedDB Database
const request = indexedDB.open('NoteTakerDB', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  // Create an object store called 'subscriptions' with an auto-incrementing key
  if (!db.objectStoreNames.contains('subscriptions')) {
    db.createObjectStore('subscriptions', { keyPath: 'id', autoIncrement: true });
  }
};

request.onsuccess = function (event) {
  const db = event.target.result;

  // Step 2: Add Event Listener for the Form Submission
  document.querySelector('#form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const emailInput = document.querySelector('input[type="email"]');
    const emailValue = emailInput.value;

    // Step 3: Validate the Email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(emailValue)) {
      // Invalid Email: Show SweetAlert
      Swal.fire({
        title: 'Invalid Email',
        text: 'Please enter a valid email address!',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    } else {
      // Step 4: Store the Email in IndexedDB
      const transaction = db.transaction('subscriptions', 'readwrite');
      const subscriptionsStore = transaction.objectStore('subscriptions');

      subscriptionsStore.add({
        email: emailValue,
        timestamp: new Date().toISOString(),
      });

      transaction.oncomplete = function () {
        Swal.fire({
          title: 'Subscription Successful!',
          text: 'Your email has been saved successfully!',
          icon: 'success',
          confirmButtonText: 'Okay',
        });

        // Clear the input field after success
        emailInput.value = '';
      };

      transaction.onerror = function () {
        Swal.fire({
          title: 'Error',
          text: 'There was an issue saving your subscription. Please try again.',
          icon: 'error',
          confirmButtonText: 'Retry',
        });
      };
    }
  });
}; 
 