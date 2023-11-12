const { createApp } = Vue;

createApp({
  data() {
    return {
      name: null,
      email: null,
      password: null,
      showRegister: false,
      authenticated: false,

    };
  },
  methods: {
    registerUser() {
      fetch("https://techguyry.com/register", {
        method: "POST",
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.registered) {
            alert(alertMessageStatus(data.message));
            window.location.replace(`https://techguyry.com${data.redirectUrl}`);
          } else {
            alert(alertMessageStatus(data.message));
          }
        })
        .catch(error => {
          console.error("Error:", error);
        });
    },
    loginUser() {
      fetch("https://techguyry.com/login", {
        method: "POST",
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          window.location.replace(`https://techguyry.com/${data.redirectUrl}`);
        })
        .catch(error => {
          console.error("Error:", error);
        });
    },
    createAccount() {
      this.showRegister = !this.showRegister;
      if (this.showRegister) {
        document.getElementById("createAccountButton").innerHTML = "CANCEL";
      } else {
        document.getElementById("createAccountButton").innerHTML =
          "CREATE ACCOUNT";
      }
    },
  },
}).mount("#app");

function alertMessageStatus(message) {
  return message;
}
