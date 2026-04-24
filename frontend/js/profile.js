const token = localStorage.getItem("edubot_token");


if (!token) {
  alert("Please login first");
  window.location.href = "index.html";
}

fetch("/api/auth/profile", {
  headers: {
    "Authorization": "Bearer " + token
  }
})
.then(res => res.json())
.then(data => {
  const user = data.user || data;

  document.getElementById("name").innerText =
    user.full_name || user.username || "N/A";

  document.getElementById("email").innerText =
    user.email || "N/A";
})
.catch(err => {
  console.error(err);
  alert("Error loading profile");
});

function logout() {
  localStorage.removeItem("edubot_token");
  localStorage.removeItem("edubot_user");
  window.location.href = "index.html";
}

console.log(data);