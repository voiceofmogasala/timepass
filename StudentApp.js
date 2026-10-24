// Student ID: S12345

// ---------- Class to store all fields ----------
class Student {
  constructor(name, dob, age, mobile, email) {
    this.name = name;
    this.dob = dob;
    this.age = age;
    this.mobile = mobile;
    this.email = email;
  }
}

// ---------- Element references ----------
const nameEl = document.getElementById("name");
const dobEl = document.getElementById("dob");
const ageEl = document.getElementById("age");
const mobileEl = document.getElementById("mobile");
const emailEl = document.getElementById("email");

function setError(id, msg) {
  document.getElementById(id).textContent = msg;
}

// ---------- Validators (return true if valid) ----------
function validateName() {
  const v = nameEl.value;
  if (v.trim() === "") {
    setError("nameErr", "Name cannot be blank.");
    return false;
  }
  if (!/^[a-zA-Z ]+$/.test(v)) {
    setError("nameErr", "Name must contain only alphabets and spaces.");
    return false;
  }
  setError("nameErr", "");
  return true;
}

function parseDob(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  const date = new Date(y, mo - 1, d);
  // reject impossible dates like 31/02/2007
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  if (date > new Date()) return null;
  return date;
}

function calculateAge(birth) {
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age;
}

function validateDob() {
  const v = dobEl.value.trim();
  ageEl.value = "";
  if (v === "") {
    setError("dobErr", "Date of birth cannot be blank.");
    return false;
  }
  const birth = parseDob(v);
  if (!birth) {
    setError("dobErr", "Use dd/mm/yyyy format with a valid past date.");
    return false;
  }
  setError("dobErr", "");
  ageEl.value = calculateAge(birth);
  return true;
}

function validateMobile() {
  const v = mobileEl.value;
  if (v === "" || !/^[1-9][0-9]*$/.test(v)) {
    setError("mobileErr", "Digits only, not blank, cannot start with 0.");
    mobileEl.value = "";           // clear field on error
    return false;
  }
  setError("mobileErr", "");
  return true;
}

function validateEmail() {
  const v = emailEl.value.trim();
  const ok = v.includes("@") && !v.startsWith("@") && (v.endsWith(".com") || v.endsWith(".in"));
  if (!ok) {
    setError("emailErr", "Must contain @, not start with @, and end with .com or .in.");
    emailEl.value = "";            // clear field on error
    return false;
  }
  setError("emailErr", "");
  return true;
}

// ---------- onfocusout events ----------
nameEl.addEventListener("focusout", validateName);
dobEl.addEventListener("focusout", validateDob);
mobileEl.addEventListener("focusout", validateMobile);
emailEl.addEventListener("focusout", validateEmail);

// ---------- Cookie helpers ----------
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

function getCookie(name) {
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (part.substring(0, idx) === name) {
      return decodeURIComponent(part.substring(idx + 1));
    }
  }
  return null;
}

// ---------- Submit ----------
document.getElementById("appForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // run every validator (no short-circuit so all errors show)
  const results = [validateName(), validateDob(), validateMobile(), validateEmail()];
  if (results.includes(false)) {
    alert("Please correct the errors before submitting.");
    return;
  }

  const student = new Student(
    nameEl.value.trim(),
    dobEl.value.trim(),
    ageEl.value,
    mobileEl.value,
    emailEl.value.trim()
  );

  setCookie("student_" + student.mobile, JSON.stringify(student), 7);

  // "navigate" to next page
  document.getElementById("formPage").classList.add("hidden");
  document.getElementById("retrievePage").classList.remove("hidden");
});

// ---------- Retrieve ----------
document.getElementById("retrieveBtn").addEventListener("click", function () {
  const mobile = document.getElementById("searchMobile").value.trim();
  if (mobile === "") {
    alert("Please enter a mobile number.");
    return;
  }

  const data = getCookie("student_" + mobile);
  if (!data) {
    alert("No details found for this mobile number.");
    return;
  }

  const s = JSON.parse(data);
  alert(
    "Name: " + s.name +
    "\nDate of Birth: " + s.dob +
    "\nAge: " + s.age +
    "\nMobile: " + s.mobile +
    "\nEmail: " + s.email
  );
});
