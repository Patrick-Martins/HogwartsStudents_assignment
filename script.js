window.addEventListener("DOMContentLoaded", init);

let studentsArray = [];
let currentStudentsList = [];
let expelledStudents = [];

let fullNameArray = [];

const settings = {
  filter: "all",
  sortType: "none",
  sortOrder: "desc",
  search: ""
};

const bloodStatuses = {
  half: "",
  pure: ""
};

const studentPrototype = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  imageFileName: "",
  house: "",
  bloodStatus: ""
};

function init() {
  getBloodFamilies();
  getStudents();

  console.log(bloodStatuses);

  document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", setFilter));
  document.querySelectorAll("[data-action=sort]").forEach(button => button.addEventListener("click", setSort));
  document.querySelector(".search-field").addEventListener("keyup", setSearch);
}

function getStudents() {
  fetch("https://petlatkea.dk/2020/hogwarts/students.json")
    .then(response => response.json())
    .then(analyseStudents);
}

function analyseStudents(students) {
  students.forEach(cleanStudent);
}

function getBloodFamilies() {
  fetch("https://petlatkea.dk/2020/hogwarts/families.json")
    .then(response => response.json())
    .then(analyseBloodFamilies);
}

function analyseBloodFamilies(bloodTypes) {
  bloodStatuses.half = bloodTypes.half;
  bloodStatuses.pure = bloodTypes.pure;
}

function cleanStudent(student) {
  //create new object
  let newStudent = Object.create(studentPrototype);

  //first name and last name
  let name = student.fullname;

  //verify and delete wrong characters and set to lowercase
  name = name.trim();
  fullNameArray = name.split(" ");
  fullNameArray.forEach(changeName);
  console.log(fullNameArray);

  //assign name values to the object

  if (fullNameArray.length > 2) {
    //need to join it to a string yet

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //check if there is a nickname
    fullNameArray.slice(1, fullNameArray.length - 1).forEach(aMiddleName => {
      console.log("MIDDLE NAME IS: " + aMiddleName);
      if (aMiddleName.charAt(0) == `"` && aMiddleName.charAt(aMiddleName.length - 1) == `"`) {
        aMiddleName = aMiddleName.substring(1, aMiddleName.length - 1);
        newStudent.nickName = aMiddleName.charAt(0).toUpperCase() + aMiddleName.substring(1);

        // console.log("NICKNAME IS: " + middlename);
        console.log("charAt 0 IS: " + aMiddleName.charAt(aMiddleName.length - 1));
        console.log("NICKNAME IS: " + newStudent.nickName);
      }
    });
    newStudent.firstName = fullNameArray[0];
    newStudent.lastName = fullNameArray[fullNameArray.length - 1];
    newStudent.middleName = fullNameArray.slice(1, fullNameArray.length - 1);
  } else if (fullNameArray.length == 2) {
    newStudent.firstName = fullNameArray[0];
    newStudent.lastName = fullNameArray[fullNameArray.length - 1];
    newStudent.middleName = null;
    newStudent.nickName = null;
  } else {
    newStudent.firstName = fullNameArray[0];
    newStudent.lastName = null;
    newStudent.middleName = null;
    newStudent.nickName = null;
  }
  newStudent.imageFileName = "student_image.png";
  newStudent.house = student.house.toLowerCase().trim();

  // checkBloodType(student);

  console.log(newStudent);

  checkBloodType(newStudent);

  newStudent.imageFileName = studentImageFile(newStudent);
  console.log("IMAGE: " + newStudent.imageFileName);

  //add new object to array
  studentsArray.push(newStudent);
  console.log(studentsArray);

  showStudents(newStudent);
}

function buildListOfStudents() {
  // clear the list
  document.querySelector(".listOfStudents_table tbody").innerHTML = "";
  currentStudentsList = studentsArray;

  currentStudentsList = searchedList(currentStudentsList);
  currentStudentsList = filterList(currentStudentsList);
  currentStudentsList = sortList(currentStudentsList);
  currentStudentsList.forEach(showStudents);
}

function showStudents(student) {
  //change textContent for each student in the table
  let studentDisplayName;

  const template = document.querySelector(".studentTemplate").content;
  const templateCopy = template.cloneNode(true);

  const studentTitle = templateCopy.querySelector(".studentName");
  const studentInfo = templateCopy.querySelector(".studentHouse");

  studentDisplayName = showFirstAndLastName(student.firstName, student.lastName);
  studentTitle.textContent = studentDisplayName;
  studentInfo.textContent = student.house;
  ////////////////////////////////////////////////////

  //add a data-house value for each tr
  const houseCurrentStudent = student.house;
  const studentContainer = templateCopy.querySelector(".studentName");

  //add eventlistener to each line of the table
  studentContainer.addEventListener("click", () => {
    studentOnClick(student, studentDisplayName);
  });
  templateCopy.querySelector("[data-field=expell]").addEventListener("click", () => {
    expellStudent(student);
  });

  document.querySelector(".listOfStudents_table tbody").appendChild(templateCopy);
}

function studentOnClick(student, studentFirstLastName) {
  //Show modal
  const modal = document.querySelector(".modalBG");
  modal.style.display = "block";

  //add background and text color for the modal depending on house
  //set a data-design attribute (in the .modal-container element) to the name of the students house
  const contentModal = document.querySelector(".modal_container");
  contentModal.setAttribute("data-design", student.house.toLowerCase());

  //Show content
  modal.querySelector(".modal_header .name").textContent = studentFirstLastName;
  //Show the image with the name of the house in the path
  modal.querySelector(".modal_header .house_image").src = `houses_imgs/${student.house.toLowerCase()}.png`;
  //////////////////////////////

  modal.querySelector(".studentImage").src = student.imageFileName;

  modal.querySelector(".studentInfo").textContent = "Information about this student-----------------------------------------";

  //Add EventListener to close modal
  modal.addEventListener("click", function() {
    modal.style.display = "none";
  });
}

function changeName(name, index) {
  //trim the entire string to remove spaces at beginning and end
  //charAt method

  //convert name to array
  let singleNameArray = Array.from(fullNameArray[index]);

  //delete or change character
  singleNameArray.forEach((character, index) => {
    // if (character === `"\"`) {
    //   singleNameArray[index] = "";
    // } else
    if (index == 0) {
      singleNameArray[0] = singleNameArray[0].toUpperCase();
    } else {
      singleNameArray[index] = singleNameArray[index].toLowerCase();
    }
  });

  //update that string in the fullNameArray after changing each character
  let singleNameString = singleNameArray.join("");
  fullNameArray[index] = singleNameString;
}

function capitalize(name) {}

function showFirstAndLastName(firstName, lastName) {
  if (firstName != null && lastName != null) {
    return `${firstName} ${lastName}`;
  } else {
    return `${firstName}`;
  }
}

function checkBloodType(student) {
  if (bloodStatuses.half.indexOf(student.lastName) !== -1) {
    student.bloodStatus = "half";
  } else if (bloodStatuses.pure.indexOf(student.lastName) !== -1) {
    student.bloodStatus = "pure";
  } else {
    student.bloodStatus = "muggle";
  }
}

//function capitalise
//readJSON->(JSON data)->prepareData->(array of students)->filter->(shorter array of students)->listStudents->(student)->showStudents

//filename path

// lastName.tolowercase() + " " + firstName[0].tolowercase + ".png";

// or charAt[0];
// substring[0,1];
// slice[1];

//loadStudents->PrepareObjects->countFiles->[if all files are loaded]->doBloodStatuses->displayList
//load Families->Prepare them->countFiles->[if all files are loaded]->doBloodStatuses->displayList

function setFilter() {
  const filterType = this.dataset.filter;
  settings.filter = filterType;
  buildListOfStudents();
}

function filterList(list) {
  return list.filter(student => settings.filter === "all" || settings.filter == student.house);
}

function setSort() {
  settings.sortOrder = this.dataset.sortDirection;
  settings.sortType = this.dataset.sort;
  console.log("Pressed sort" + settings.sortOrder);
  buildListOfStudents();
}

function sortList(list) {
  let dir;
  if (settings.sortOrder === "desc") {
    dir = 1;
  } else {
    dir = -1;
  }
  return list.sort((a, b) => (a[settings.sortType] < b[settings.sortType] ? dir * 1 : dir * -1));
}

function setSearch() {
  settings.search = this.value.toUpperCase();
  buildListOfStudents();
  console.log(settings.search);
}

function searchedList(list) {
  let fullName;
  return list.filter(student => {
    fullName = [];

    fullName.push(student.firstName);

    if (student.lastName != null) {
      fullName.push(student.lastName);
    }
    if (student.middleName != null) {
      fullName.push(student.middleName);
    }
    if (student.nickName != null) {
      fullName.push(student.nickName);
    }

    fullName = fullName.join(" ");
    fullName = fullName.toUpperCase();

    // console.log("FULL NAME IS " + fullName);

    if (fullName.toUpperCase().indexOf(settings.search) > -1) {
      return true;
    } else {
      return false;
    }
  });
}

function expellStudent(student) {
  indexOfStudent = studentsArray.indexOf(student);
  expelledStudents.push(student);
  studentsArray.splice(indexOfStudent, 1);
  buildListOfStudents();
}
//i have to join firstName, middleName and last name to a temporary array and check if the text searched equals any of those elements of the array

function studentImageFile(student) {
  if (student.lastName != null) {
    //if there is not another student with same last name
    if (studentsArray.filter(comparedStudent => comparedStudent.lastName == student.lastName).length == 0) {
      return `images/${student.lastName.toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
    } else {
      return `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
    }
  }
}
