window.addEventListener("DOMContentLoaded", init);

const studentsArray = [];

let fullNameArray = {};

const studentPrototype = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  imageFileName: "",
  house: ""
};

function init() {
  getStudents();
}

function getStudents() {
  fetch("https://petlatkea.dk/2020/hogwarts/students.json")
    .then(response => response.json())
    .then(analyseStudents);
}

function analyseStudents(students) {
  students.forEach(cleanStudent);
}

function cleanStudent(student) {
  //create new object
  let newStudent = Object.create(studentPrototype);

  //first name and last name
  let name = student.fullname;

  //verify and delete wrong characters and set to lowercase
  fullNameArray = name.split(" ");

  fullNameArray.forEach(changeName);
  console.log(fullNameArray);

  //assign name values to the object
  newStudent.firstName = fullNameArray[0];
  newStudent.lastName = fullNameArray[fullNameArray.length - 1];
  if (fullNameArray.length > 2) {
    newStudent.middleName = fullNameArray.slice(1, fullNameArray.length - 1);
    newStudent.nickName = fullNameArray.slice(1, fullNameArray.length - 1);
  }
  newStudent.imageFileName = "student_image.png";
  newStudent.house = student.house.toLowerCase();

  console.log(newStudent);

  //add new object to array
  studentsArray.push(newStudent);
  console.log(studentsArray);

  showStudents(newStudent);
}

function getArrayOfStudents() {
  studentsArray.forEach(showStudents);
  console.log("ARRAY 0 IS: " + studentsArray[0]);
}

function showStudents(student) {
  let studentFullName;

  const template = document.querySelector(".studentTemplate").content;
  const templateCopy = template.cloneNode(true);

  const studentTitle = templateCopy.querySelector(".studentName");
  const studentInfo = templateCopy.querySelector(".studentHouse");

  studentFullName = `${student.firstName} ${student.lastName}`;
  studentTitle.textContent = studentFullName;
  studentInfo.textContent = student.house;

  //add a data-house value for each tr
  const houseCurrentStudent = student.house;
  const studentContainer = templateCopy.querySelector("tr");

  //add eventlistener to each line of the table
  studentContainer.addEventListener("click", function() {
    //Show modal
    const modal = document.querySelector(".modalBG");
    modal.style.display = "block";

    //add background and text color for the modal depending on house
    //set a data-design attribute (in the .modal-container element) to the name of the students house
    const contentModal = document.querySelector(".modal_container");
    contentModal.setAttribute("data-design", student.house.toLowerCase());

    //Show content
    modal.querySelector(".modal_header .name").textContent = studentFullName;
    //Show the image with the name of the house in the path
    modal.querySelector(".modal_header .house_image").src = `houses_imgs/${student.house.toLowerCase()}.png`;
    //////////////////////////////

    modal.querySelector(".studentInfo").textContent = "Information about this student-----------------------------------------";

    //Add EventListener to close modal
    modal.addEventListener("click", function() {
      modal.style.display = "none";
    });
  });

  document.querySelector(".listOfStudents_table tbody").appendChild(templateCopy);
}

function changeName(name, index) {
  //if the first name is empty
  if (fullNameArray[0] == "") {
    fullNameArray.shift(); //delete the first element of the array
  }

  //if the last name is empty
  if (fullNameArray[fullNameArray.length - 1] == "") {
    fullNameArray.pop(); //delete the first element of the array
  }

  //convert name to array
  let singleNameArray = Array.from(fullNameArray[index]);

  //delete or change character
  singleNameArray.forEach((character, index) => {
    if (character == '"' || character == `"\"`) {
      singleNameArray[index] = "";
    } else if (index == 0) {
      singleNameArray[0] = singleNameArray[0].toUpperCase();
    } else {
      singleNameArray[index] = singleNameArray[index].toLowerCase();
    }
  });

  //update that string in the fullNameArray after changing each character
  let singleNameString = singleNameArray.join("");
  fullNameArray[index] = singleNameString;
}
