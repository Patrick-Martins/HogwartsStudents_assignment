window.addEventListener("DOMContentLoaded", init);

let studentsArray = [];
let currentStudentsList = [];
let expelledStudents = [];
let inquisitorialList = [];

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
  gender: "",
  imageFileName: "",
  house: "",
  bloodStatus: "",
  prefect: false,
  inquisitorialSquad: false,
  expelled: "not expelled"
};

function init() {
  getBloodFamilies();
  getStudents();
  setTimeout(setupPage, 1000);
}

function setupPage() {
  studentsArray.forEach(studentImageFile);
  buildListOfStudents();

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
    //because of Justin Finch-Fletchey
    if (fullNameArray[1].indexOf("-") > 0) {
      newStudent.lastName = fullNameArray[1].substring(fullNameArray[1].indexOf("-") + 1);
      newStudent.middleName = fullNameArray[1].substring(0, fullNameArray[1].indexOf("-"));
      //guarantee that lastName and middleName are capital
      newStudent.middleName = newStudent.middleName.charAt(0).toUpperCase() + newStudent.middleName.substring(1).toLowerCase();
      newStudent.lastName = newStudent.lastName.charAt(0).toUpperCase() + newStudent.lastName.substring(1).toLowerCase();
    } else {
      newStudent.lastName = fullNameArray[fullNameArray.length - 1];
      newStudent.middleName = null;
    }

    newStudent.nickName = null;
  } else {
    newStudent.firstName = fullNameArray[0];
    newStudent.lastName = null;
    newStudent.middleName = null;
    newStudent.nickName = null;
  }
  newStudent.imageFileName = "student_image.png";
  newStudent.house = student.house.toLowerCase().trim();
  newStudent.gender = student.gender.trim();

  // checkBloodType(student);

  console.log(newStudent);

  checkBloodType(newStudent);

  //add new object to array
  studentsArray.push(newStudent);
  console.log(studentsArray);

  // showStudents(newStudent);
}

function buildListOfStudents() {
  // clear the list
  document.querySelector(".listOfStudents_table tbody").innerHTML = "";
  currentStudentsList = studentsArray;

  if (settings.filter === "expelled") {
    currentStudentsList = filterList(expelledStudents);
  } else {
    currentStudentsList = filterList(currentStudentsList);
  }
  currentStudentsList = searchedList(currentStudentsList);
  currentStudentsList = sortList(currentStudentsList);
  currentStudentsList.forEach(showStudents);

  displayAbout();
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
    studentOnClick(student);
  });

  //only be able to expell if student is not expelled
  if (student.cannotBeExpelled === true) {
    templateCopy.querySelector("[data-field=expell]").classList.add("inactive");
  } else if (student.expelled === "not expelled") {
    templateCopy.querySelector("[data-field=expell]").addEventListener("click", () => {
      expellStudent(student);
    });
  }

  //show prefect symbol dependin if its a prefect or not
  const setPrefectElement = templateCopy.querySelector("[data-field=prefect]");
  setPrefectElement.setAttribute("data-prefect", student.prefect);
  //if it is a prefect display colors of that house
  //show it is a prefect

  setPrefectElement.setAttribute("data-prefect", student.prefect);
  // if (student.prefect === true) {
  //   templateCopy.querySelector("tr").setAttribute("data-design", student.house);
  // }
  setPrefectElement.addEventListener("click", () => {
    makeStudentPrefect(student);
  });

  document.querySelector(".listOfStudents_table tbody").appendChild(templateCopy);
}

function studentOnClick(student) {
  //Show modal
  const modal = document.querySelector(".modalBG");
  // modal.style.display = "block";
  // modal.classList.remove("close");
  showContainer(modal);

  //add background and text color for the modal depending on house
  //set a data-design attribute (in the .modal-container element) to the name of the students house
  const contentModal = document.querySelector(".modal_container");
  contentModal.setAttribute("data-design", student.house.toLowerCase());

  //Show content
  modal.querySelector(".modal_header .name").textContent = showFirstAndLastName(student.firstName, student.lastName);
  //Show the image with the name of the house in the path
  modal.querySelector(".modal_header .house_image").src = `houses_imgs/${student.house.toLowerCase()}.png`;
  //////////////////////////////

  modal.querySelector(".studentImage").src = student.imageFileName;

  //show correct text on button depending if he is or not part of Inquisitorial Squad
  buttonInquisitorialText(student);

  //check if student is already in Inquisitorial Squad or not
  modal.querySelector(".addInquisitorial").addEventListener("click", function() {
    addStudentToInquisitorialSquad(student);
  });

  // if (student.inquisitorialSquad === false) {
  //   modal.querySelector(".addInquisitorial").classList.remove("close");
  //   modal.querySelector(".addInquisitorial").addEventListener("click", function() {
  //     addStudentToInquisitorialSquad(student);
  //     modal.querySelector(".addInquisitorial").classList.add("close");
  //   });
  // } else {
  //   modal.querySelector(".addInquisitorial").classList.add("close");
  // }
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
  return list.filter(student => settings.filter === "all" || settings.filter === student.house || settings.filter === student.expelled);
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
  student.expelled = "expelled";
  student.cannotBeExpelled = true;
  indexOfStudent = studentsArray.indexOf(student);
  expelledStudents.push(student);
  studentsArray.splice(indexOfStudent, 1);
  buildListOfStudents();
}
//i have to join firstName, middleName and last name to a temporary array and check if the text searched equals any of those elements of the array

function studentImageFile(student) {
  if (student.lastName != null) {
    //if there is not another student with same last name
    if (studentsArray.filter(comparedStudent => comparedStudent.lastName == student.lastName && comparedStudent.firstName != student.firstName).length == 0) {
      student.imageFileName = `images/${student.lastName.toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.png`;
    } else {
      student.imageFileName = `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
    }
  }
}

function makeStudentPrefect(student) {
  console.log("CLICKED ON PREFECTER");

  //check if the animal is already a winner and remove if clicked

  //if it is a winner its going to add that animal to array winners
  const prefectsFromHouse = studentsArray.filter(studentToCheck => studentToCheck.house === student.house && studentToCheck.prefect === true);

  console.table(prefectsFromHouse);
  if (student.prefect === true) {
    student.prefect = false;
  } else {
    //returns true if there is an element in the prefectsFromHouse array with same gender as the selected student
    if (prefectsFromHouse.some(prefect => prefect.gender === student.gender)) {
      const sameGenderPrefect = prefectsFromHouse.filter(prefect => prefect.gender === student.gender)[0];

      //showModal
      showContainer(document.getElementById("onlyonekind"));
      //change modal text
      changePrefectBoxText(sameGenderPrefect);
      //add event listener to button to remove and after close the modal
      document.querySelector("#onlyonekind .dialogcontent p button").addEventListener("click", function() {
        removePrefect(sameGenderPrefect, student);
        closeContainer(document.getElementById("onlyonekind"));
        buildListOfStudents();
      });
    } else {
      student.prefect = true;
    }
  }
  buildListOfStudents();
}
function changePrefectBoxText(currentPrefect) {
  document.querySelector("#onlyonekind .dialogcontent p .student").textContent =
    showFirstAndLastName(currentPrefect.firstName, currentPrefect.lastName) + " as a prefect of " + currentPrefect.house.charAt(0).toUpperCase() + currentPrefect.house.substring(1);
}
function removePrefect(currentPrefect, newPrefect) {
  //the index of the animal which is a winner that should be removed as a winner in allAnimals array
  studentsArray[studentsArray.indexOf(currentPrefect)].prefect = false;
  studentsArray[studentsArray.indexOf(newPrefect)].prefect = true;
  console.log("REMOVE PREFECT");
}

function showContainer(element) {
  element.classList.remove("close");

  //Add EventListener to close modal
  element.querySelector(".closebutton").addEventListener("click", function() {
    closeContainer(element);
  });
}

function closeContainer(element) {
  element.classList.add("close");
}

function displayAbout() {
  const gryffindorStudents = studentsArray.filter(student => student.house === "gryffindor");
  const hufflepuffStudents = studentsArray.filter(student => student.house === "hufflepuff");
  const ravenclawStudents = studentsArray.filter(student => student.house === "ravenclaw");
  const slytherinStudents = studentsArray.filter(student => student.house === "slytherin");

  document.querySelector(".about .studentsEachHouse .gryffindor").textContent = `Gryffindor: ${gryffindorStudents.length} students`;
  document.querySelector(".about .studentsEachHouse .hufflepuff").textContent = `Hufflepuff: ${hufflepuffStudents.length} students`;
  document.querySelector(".about .studentsEachHouse .ravenclaw").textContent = `Ravenclaw: ${ravenclawStudents.length} students`;
  document.querySelector(".about .studentsEachHouse .slytherin").textContent = `Slytherin: ${slytherinStudents.length} students`;
  document.querySelector(".about .allStudents").textContent = `All students: ${studentsArray.length} students`;
  document.querySelector(".about .expelledStudents").textContent = `Expelled students: ${expelledStudents.length} students`;
  document.querySelector(".about .displayedStudents").textContent = `Displayed students: ${currentStudentsList.length} students`;
}
function buttonInquisitorialText(student) {
  if (student.inquisitorialSquad == false) {
    modal.querySelector(".addInquisitorial").textContent = "Add to Inquisitorial Squad";
  } else {
    modal.querySelector(".addInquisitorial").textContent = "Remove from Inquisitorial Squad";
  }
}

function addStudentToInquisitorialSquad(student) {
  if (student.inquisitorialSquad == false) {
    student.inquisitorialSquad = true;
    inquisitorialList.push(student);
    modal.querySelector(".addInquisitorial").textContent = "Remove from Inquisitorial Squad";
    studentOnClick(student);
  } else {
    student.inquisitorialSquad = false;
    //remove from inquisitorial
    inquisitorialList.splice(inquisitorialList.indexOf(student), 1);
    modal.querySelector(".addInquisitorial").textContent = "Add to Inquisitorial Squad";
    studentOnClick(student);
  }
  // //update information on modal
  // studentOnClick(student);
  console.log(inquisitorialList);
}

let systemHacked = false;
function hackTheSystem() {
  let me = Object.create(studentPrototype);

  me.firstName = "Patrick";
  me.middleName = "Jensen";
  me.lastName = "Martins";
  me.nickName = "Coder";
  me.gender = "boy";
  me.house = "slytherin";
  me.bloodStatus = "pure";
  me.prefect = true;
  me.inquisitorialSquad = true;
  me.expelled = "not expelled";
  me.imageFileName = "images/patrickm.jpeg";

  studentsArray.push(me);

  me.cannotBeExpelled = true;

  buildListOfStudents();

  systemHacked = true;

  console.log("Hacked the system");
}
