const { createApp } = Vue;

createApp({
  data() {
    return {
      user: {},
      loading: true,
      profilePicture: null,
      searchQuery: '',
      users: [],
    };
  },
  methods: {
    async getUserData() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // Fetch user data from the server
        const response = await fetch('/api/user');
        const data = await response.json();
        this.loading = false;
        return data;
      } catch (error) {
        throw new Error('Error fetching user data');
      }
    },
    logoutUser() {
      fetch("https://techguyry.com/logout")
        .then(response => response.json())
        .then(json => {
          if (json.redirectUrl) {
            window.location.replace(`https://techguyry.com/${json.redirectUrl}`);
          } else {
            console.log("Redirect URL not found in response");
          }
        });
    },
    async fetchProfilePicture() {
      try {
        const response = await fetch('/api/download');
        if (!response.ok) {
          throw new Error('Failed to fetch profile picture');
        }

        const pictureBlob = await response.blob();
        const pictureUrl = URL.createObjectURL(pictureBlob);

        // Update the image source with the retrieved profile picture URL
        this.profilePicture = pictureUrl;
        return this.profilePicture;
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        // Handle the error case
      }
    },
    async searchUsers() {
      const trimmedQuery = this.searchQuery.trim();
      try {
        const response = await fetch(`/api/search/users?query=${encodeURIComponent(trimmedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          this.users = data;
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    },
    closeModal() {
      this.users = []; // Clear the users array to close the modal
    },
    uploadFile() {
      const fileInput = document.getElementById('file');
      const file = fileInput.files[0];
    
      if (!file) {
        return;
      }
    
      const formData = new FormData();
      formData.append('file', file);
    
      fetch('https://techguyry.com/api/upload', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          const registrationMessage = data.message;
          alert(alertMessageStatus(registrationMessage));
          window.location.replace(`https://techguyry.com/${data.redirectUrl}`);
        })
        .catch(error => {
          console.error("Error:", error);
        });
    },    
    logoutUser() {
      fetch("https://techguyry.com/logout", {
        method: "POST",
      })
        .then(response => response.json())
        .then(json => {
          if (json.redirectUrl) {
            window.location.replace(`https://techguyry.com/${json.redirectUrl}`);
          } else {
            console.log("Redirect URL not found in response");
          }
        });
    },
  },
  async mounted() {
    try {
      // Fetch user data from the server and assign it to the user object
      const userData = await this.getUserData();
      this.user = userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    this.fetchProfilePicture();
  },
}).mount("#app");

const dropdownBtn = document.querySelectorAll(".dropdown-btn");
const dropdown = document.querySelectorAll(".dropdown");
const hamburgerBtn = document.getElementById("hamburger");
const navMenu = document.querySelector(".menu");
const links = document.querySelectorAll(".dropdown a");

function setAriaExpandedFalse() {
  dropdownBtn.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
}

function closeDropdownMenu() {
  dropdown.forEach((drop) => {
    drop.classList.remove("active");
    drop.addEventListener("click", (e) => e.stopPropagation());
  });
}

function toggleHamburger() {
  navMenu.classList.toggle("show");
}

dropdownBtn.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const dropdownIndex = e.currentTarget.dataset.dropdown;
    const dropdownElement = document.getElementById(dropdownIndex);

    dropdownElement.classList.toggle("active");
    dropdown.forEach((drop) => {
      if (drop.id !== btn.dataset["dropdown"]) {
        drop.classList.remove("active");
      }
    });
    e.stopPropagation();
    btn.setAttribute(
      "aria-expanded",
      btn.getAttribute("aria-expanded") === "false" ? "true" : "false"
    );
  });
});

// close dropdown menu when the dropdown links are clicked
links.forEach((link) =>
  link.addEventListener("click", () => {
    closeDropdownMenu();
    setAriaExpandedFalse();
    toggleHamburger();
  })
);

// close dropdown menu when you click on the document body
document.documentElement.addEventListener("click", () => {
  closeDropdownMenu();
  setAriaExpandedFalse();
});

// close dropdown when the escape key is pressed
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDropdownMenu();
    setAriaExpandedFalse();
  }
});

hamburgerBtn.addEventListener("click", toggleHamburger);

const imgElement = document.getElementById('profile-pic');
imgElement.addEventListener('load', () => {
  imgElement.classList.add('loaded');
});

function alertMessageStatus(message) {
  return message;
}
