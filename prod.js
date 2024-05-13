 
function toggleMenu() {
    var nav = document.getElementById("nav");
    var menuIcon = document.getElementById("menu-icon");

    if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuIcon.classList.remove("open");
        menuIcon.style.zIndex = "1"; // Bring menu icon to the back when menu is closed
    } else {
        nav.classList.add("open");
        menuIcon.classList.add("open");
        menuIcon.style.zIndex = "2"; // Bring menu icon to the front when menu is open
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isloggedin) {
        let cartItems = currentUser.cartItems || [];
        updateCart(cartItems);
        updateTotal(cartItems);
        checkSelectAllCheckbox(cartItems);
    }
});
 
function addToCart(productId) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isloggedin) {
        addCartItem(productId);
    } else {
        alert("Please log in to add items to your cart.");
        openAccountModal();
    }
}

function addCartItem(productId) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isloggedin) {
        let cartItems = currentUser.cartItems || [];
        const productName = document.querySelector(`#product${productId} h3`).textContent;
        const price = parseFloat(document.querySelector(`#product${productId} .price`).textContent.replace("Price: $", ""));
        const size = document.getElementById(`size${productId}`).value;
        let quantity = parseInt(document.getElementById(`quantity${productId}`).value);

        // Ensure quantity is at least 1
        quantity = Math.max(1, quantity);

        const totalPrice = price * quantity;
        const imgSrc = document.querySelector(`#product${productId} img`).src;

        const existingItemIndex = cartItems.findIndex(item => item.name === productName && item.size === size);

        if (existingItemIndex !== -1) {
            cartItems[existingItemIndex].quantity += quantity;
        } else {
            const newItem = {
                name: productName,
                price: price,
                size: size,
                quantity: quantity,
                totalPrice: totalPrice,
                image: imgSrc,
                checked: false
            };
            cartItems.push(newItem);
        }

        currentUser.cartItems = cartItems;
        updateCurrentUser(currentUser);

        updateCart(cartItems);
        updateTotal(cartItems);
        checkSelectAllCheckbox(cartItems);

        const cartIcon = document.querySelector('.cart-icon');
        cartIcon.classList.add('add-to-cart-animation');

        setTimeout(() => {
            cartIcon.classList.remove('add-to-cart-animation');
        }, 500);

        saveCartToLocalStorage(cartItems); // Save cart items to local storage
    } else {
        alert("Please log in to add items to your cart.");
        openAccountModal();
    }
}

function saveCartToLocalStorage(cartItems) {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser")) || {};
}
function updateCurrentUser(user) {
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const updatedAccounts = accounts.map(account => {
        if (account.email === user.email) {
            return user;
        } else {
            return account;
        }
    });
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser")) || {};
}

function updateCart(cartItems) {
    const cartList = document.getElementById("cart-items");
    cartList.innerHTML = "";

    if (cartItems.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.textContent = "Your cart is empty.";
        emptyMessage.classList.add("empty-cart-message");
        cartList.appendChild(emptyMessage);
    } else {
        cartItems.forEach((item, index) => {
            const li = document.createElement("li");
            li.classList.add("cart-item");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.checked;
            checkbox.dataset.index = index;
            checkbox.onchange = () => {
                toggleItemCheckbox(index);
                checkSelectAllCheckbox(cartItems);
            };
            li.appendChild(checkbox);

            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.name;
            li.appendChild(img);

            const details = document.createElement("div");
            details.innerHTML = `<strong>${item.name}</strong> - Size: ${item.size} - Quantity: <input type="number" class="quantity-input" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)" min="1"> - Price: $${item.totalPrice.toFixed(2)}`;
            li.appendChild(details);
    
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteItem(index);
            li.appendChild(deleteButton);
    
            cartList.appendChild(li);
        });
    }
}

function deleteItem(index) {
    const currentUser = getCurrentUser();
    let cartItems = currentUser.cartItems || [];
    cartItems.splice(index, 1); // Remove the item at the specified index
    currentUser.cartItems = cartItems;
    updateCurrentUser(currentUser);
    updateCart(cartItems); // Update the cart display
    updateTotal(); // Update the total after deleting the item
    saveCartToLocalStorage(cartItems); // Save updated cartItems to localStorage
}




function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity);
    const currentUser = getCurrentUser();
    let cartItems = currentUser.cartItems || [];
    if (newQuantity <= 0) {
        cartItems.splice(index, 1);
    } else {
        const item = cartItems[index];
        item.quantity = newQuantity;
        item.totalPrice = item.price * newQuantity;
    }
    currentUser.cartItems = cartItems;
    updateCurrentUser(currentUser);
    updateCart(cartItems);
    updateTotal(); // Update total after changing quantity
}
 

function toggleItemCheckbox(index, isChecked) {
    const cartItems = getCartItemsFromLocalStorage();
    if (cartItems[index]) { // Check if the cart item at the given index exists
        cartItems[index].checked = isChecked !== undefined ? isChecked : !cartItems[index].checked; // Toggle the checked status
        saveCartItemsToLocalStorage(cartItems);
        updateTotal(); // Update total after toggling checkbox status
    }
}


// Function to update the total based on checked items
function updateTotal() {
    const cartItems = getCartItemsFromLocalStorage();
    let total = 0;
    cartItems.forEach(item => {
        if (item.checked) {
            total += item.price * item.quantity;
        }
    });
    document.getElementById("cart-total").textContent = `Total: $${total.toFixed(2)}`;
}

// Function to handle checkbox change
function handleCheckboxChange(event) {
    const index = parseInt(event.target.dataset.index);
    toggleItemCheckbox(index, event.target.checked);
    updateTotal(); // Update total whenever any checkbox changes
}

// Function to add event listeners to checkboxes
function addCheckboxEventListeners() {
    const checkboxes = document.querySelectorAll('#cart-items input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

// Function to handle "Select All" checkbox change
function handleSelectAllChange(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('#cart-items input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = isChecked;
        toggleItemCheckbox(index, isChecked);
    });
    updateTotal(); // Update total after toggling "Select All"
}
// Function to add event listener to "Select All" checkbox
function addSelectAllEventListener() {
    const selectAllCheckbox = document.getElementById("select-all-checkbox");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAllChange);
    }
}

function getCartItemsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("cartItems")) || [];
}

// Function to save cart items to local storage
function saveCartItemsToLocalStorage(cartItems) {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

document.addEventListener("DOMContentLoaded", function() {
    initialize();
    checkSelectAllCheckbox();
    updateTotal(); // Update total when the DOM is loaded
});


function initialize() {
    addCheckboxEventListeners();
    addSelectAllEventListener();
    addQuantityChangeListeners(); // Add event listeners for quantity changes
    updateTotal();
}
 
document.addEventListener("DOMContentLoaded", initialize);
function addQuantityChangeListeners() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach((input, index) => {
        input.addEventListener('change', function() {
            updateQuantity(index, input.value);
        });
    });
}

 
// Call initialize function when the DOM is ready
document.addEventListener("DOMContentLoaded", initialize);

// Define function to update "Select All" checkbox
function checkSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById("select-all-checkbox");
    const allItemCheckboxes = document.querySelectorAll('#cart-items input[type="checkbox"]');

    selectAllCheckbox.checked = Array.from(allItemCheckboxes).every(checkbox => checkbox.checked);

    selectAllCheckbox.addEventListener('change', function () {
        const isChecked = this.checked;
        allItemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const index = parseInt(checkbox.dataset.index);
            toggleItemCheckbox(index, isChecked);
        });
        updateTotal(); // Update total when "Select All" checkbox changes
    });

    allItemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const allChecked = Array.from(allItemCheckboxes).every(checkbox => checkbox.checked);
            selectAllCheckbox.checked = allChecked;
            updateTotal(); // Update total when any individual checkbox changes
        });
    });
}


function toggleCart() {
    const cart = document.querySelector(".cart");
    cart.classList.toggle("active");
    if (cart.classList.contains("active")) {
        const cartItems = getCartItemsFromLocalStorage();
        updateCart(cartItems);
        updateTotal();
    } else {
        // If cart is not active, clear the cart items
        const cartList = document.getElementById("cart-items");
        if (cartList) {
            cartList.innerHTML = "";
        }
    }
}

// Call toggleCart function when the DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    const cartToggleButton = document.getElementById("toggle-cart-button");
    cartToggleButton.addEventListener("click", toggleCart);
});

 
 
 

//////-----------------------end of js for add to cart--------------------------//




    function showSignup() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        clearInputFields(); // Clear input fields
    }

    function showLogin() {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        clearInputFields(); // Clear input fields
    }

    // Function to handle signup
    // Function to handle signup
    // Function to handle signup
    function signup() {
        const firstname = document.getElementById("signup-firstname").value;
        const lastname = document.getElementById("signup-lastname").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
    
        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const existingAccount = accounts.find(account => account.email === email);
    
        if (existingAccount) {
            alert("An account with this email already exists.");
            return;
        }
    
        const newUser = { firstname, lastname, email, password, isloggedin: true }; // Set isloggedin to true upon signup
        accounts.push(newUser);
        localStorage.setItem("accounts", JSON.stringify(accounts));
        alert("Successful sign up!");
    
        // Reload the page
        location.reload();
    }
    
    // Function to retrieve current user from local storage
    function getCurrentUser() {
        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const loggedInUser = accounts.find(account => account.isloggedin === true);
        return loggedInUser;
    }
    
    // Function to handle login
     
    function login() {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
    
        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const matchedAccount = accounts.find(account => account.email === email && account.password === password);
    
        if (matchedAccount) {
            matchedAccount.isloggedin = true; // Set isloggedin to true upon login
            localStorage.setItem("accounts", JSON.stringify(accounts)); // Update accounts data
            alert("Login successful");
    
            // Reload the page
            location.reload();
        } else {
            alert("Incorrect email or password");
        }
    }
    
    function showWelcomeMessage(user) {
        console.log("showWelcomeMessage called with user:", user);
        const welcomeMessage = document.getElementById('welcomemessage');
        const userNameElement = document.getElementById('user-name');
        const userAddressElement = document.getElementById('user-address');
    
        if (user) {
            welcomeMessage.style.display = 'block';
            userNameElement.textContent = user.firstname;
            if (user.address && user.city && user.province && user.country && user.postalCode && user.phone) {
                const completeAddress = user.address + ', ' + user.city + ', ' + user.province + ', ' + user.country + ', ' + user.postalCode + ', ' + user.phone;
                userAddressElement.textContent = completeAddress;
            } else {
                userAddressElement.textContent = "No Adress!";
            }
        } else {
            welcomeMessage.style.display = 'none';
        }
    }
    
    

    // Call the showWelcomeMessage function on page load
    document.addEventListener("DOMContentLoaded", function() {
        const currentUser = getCurrentUser();
        showWelcomeMessage(currentUser);
    });
    
    function logout() {
        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const currentUserIndex = accounts.findIndex(account => account.isloggedin === true); // Find the index of the logged-in user
        if (currentUserIndex !== -1) {
            accounts[currentUserIndex].isloggedin = false; // Set isloggedin to false upon logout
            localStorage.setItem("accounts", JSON.stringify(accounts)); // Update accounts data
            alert("Logged out successfully!");
    
            // Hide welcome message and display login form
            document.getElementById('welcomemessage').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        }
    }
     
    // Add event listener to the account icon
    document.addEventListener("DOMContentLoaded", function() {
        const accountIcon = document.querySelector('.account-icon');
        if (accountIcon) {
            accountIcon.addEventListener('click', openAccountModal);
            console.log("Event listener added to account icon.");
        }
    });
    
    // Function to toggle password visibility
    function togglePassword(inputId) {
        const passwordInput = document.getElementById(inputId);
        const toggleBtn = passwordInput.nextElementSibling;
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            toggleBtn.textContent = "Show";
        }
    }

    // Function to clear input fields
    function clearInputFields() {
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('signup-firstname').value = '';
        document.getElementById('signup-lastname').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
    }

    function openAccountModal() {
        console.log("Account icon clicked.");
        const accountModal = document.getElementById('account-modal');
        const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        const isLoggedIn = accounts.find(account => account.isloggedin === true);
    
        if (isLoggedIn) {
            // If user is logged in, show the welcome message
            const currentUser = accounts.find(account => account.isloggedin === true);
            document.getElementById('welcomemessage').style.display = 'block';
            document.getElementById('user-name').textContent = currentUser.firstname + ' ' +currentUser.lastname;
            accountModal.style.display = 'block';
        } else {
            // If user is not logged in, show the login form
            const loginForm = document.getElementById('login-form');
            document.getElementById('welcomemessage').style.display = 'none';
            loginForm.style.display = 'block';
            accountModal.style.display = 'block'; // Ensure that the modal is displayed
        }
    }
    
    document.addEventListener("DOMContentLoaded", function() {
        const accountIcon = document.querySelector('.account-icon');
        if (accountIcon) {
            accountIcon.addEventListener('click', openAccountModal);
            console.log("Event listener added to account icon.");
        }
    });
    

     // Function to show the address form
     function showAddressForm() {
        // Hide the welcome message and any other elements
        document.getElementById('welcomemessage').style.display = 'none';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'none';
    
        // Show the address form
        document.getElementById('address-form').style.display = 'block';
    }
    
    
    // Add event listener to the "Edit Address" link
    document.addEventListener("DOMContentLoaded", function() {
        const editAddressLink = document.getElementById('edit-address-link');
        if (editAddressLink) {
            editAddressLink.addEventListener('click', showAddressForm);
        }
    });
    function updateAddress() {
        // Retrieve updated address information from the form
        const address = document.getElementById("address").value;
        const city = document.getElementById("city").value;
        const country = document.getElementById("country").value;
        const province = document.getElementById("province").value;
        const postalCode = document.getElementById("postal-code").value;
        const phone = document.getElementById("phone").value;
    
        // Retrieve current logged-in user
        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const loggedInUser = accounts.find(account => account.isloggedin === true);
    
        if (loggedInUser) {
            // Update user's address
            loggedInUser.address = address;
            loggedInUser.city = city;
            loggedInUser.country = country;
            loggedInUser.province = province;
            loggedInUser.postalCode = postalCode;
            loggedInUser.phone = phone;
    
            // Update user's data in localStorage
            localStorage.setItem("accounts", JSON.stringify(accounts));
    
            // Show welcome message with updated data
            showWelcomeMessage(loggedInUser);
        }
    
        // Reload the page
        location.reload();
    }
    
    
    

    
   
//////---------------animation for scrolling------------////////

  // Define the function for animation
function animateElementsOnScroll() {
  var header = document.querySelector('header');
  var section = document.querySelector('section');
  var sectionContent = document.querySelectorAll('section div');

  var scrollPosition = window.scrollY;

  // Adjust these values as needed, depending on when you want the animations to trigger
  var headerTriggerPosition = 100; // For example, trigger animation when the user scrolls 100 pixels down for the header
  var sectionTriggerPosition = 200; // For example, trigger animation when the user scrolls 200 pixels down for the section

  if (scrollPosition > headerTriggerPosition) {
    header.classList.add('fadeInAnimation');
  } else {
    header.classList.remove('fadeInAnimation');
  }

  if (scrollPosition > sectionTriggerPosition) {
    section.classList.add('slideInFromLeftAnimation');
    sectionContent.forEach(function(element) {
      element.classList.add('fadeInAnimation');
    });
  } else {
    section.classList.remove('slideInFromLeftAnimation');
    sectionContent.forEach(function(element) {
      element.classList.remove('fadeInAnimation');
    });
  }
}

// Call the function initially
animateElementsOnScroll();

// Call the function on every scroll event
window.addEventListener('scroll', function() {
  requestAnimationFrame(animateElementsOnScroll);
});

// Add functionality to handle scrolling up
var lastScrollTop = 0;
window.addEventListener('scroll', function() {
  var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop) {
    // Scrolling down
    // Add any additional animations for scrolling down here
  } else {
    // Scrolling up
    // Add any additional animations for scrolling up here
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
});
 
 // Function to show the address form
function showAddressForm() {
    // Hide the welcome message
    document.getElementById('welcomemessage').style.display = 'none';

    // Show the address form
    document.getElementById('address-form').style.display = 'block';
}

// Function to hide the address form
function hideAddressForm() {
    // Hide the address form
    document.getElementById('address-form').style.display = 'none';
}

// Function to handle the close button of the account modal
function closeAccountModal() {
    // Hide the account modal
    document.getElementById('account-modal').style.display = 'none';
    location.reload();
}

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the "Edit Address" link
    const editAddressLink = document.querySelector('#welcomemessage a');
    if (editAddressLink) {
        editAddressLink.addEventListener('click', showAddressForm);
    }
    
    // Add event listener to the close button of the account modal
    const closeModalButton = document.querySelector('.close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeAccountModal);
    }
});





 
 



 
// -----------------js for carousel effect--------------------//




// JavaScript for auto-sliding
let currentIndex = 0;
const slides = document.querySelectorAll('.carousel img');
const totalSlides = slides.length;

function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
}

function updateCarousel() {
    const offset = -currentIndex * 50; /* Change value for 3D sliding effect */
    document.querySelector('.carousel').style.transform = `translateX(${offset}%)`;
}

setInterval(nextSlide, 3000); // Change slide every 3 seconds

messageInput.addEventListener('keydown',(event) => {

    if (event.key === 'Enter') {
    sendMessage();
    }
}); 

 