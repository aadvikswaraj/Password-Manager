const noPwdsDisplay = `<tr><td colspan='4' class='nopwd-display'>No Passwords Found!</td></tr>`;

function updateTime() {
  let d = new Date();
  document.querySelector("#time-cnt>span").innerText = d.toTimeString().split(" ")[0];
};

setInterval(updateTime, 1000);

function copyToClipboard(txt) {
  navigator.clipboard.writeText(txt);
};

// Master Function for Rendering and Searching Passwords in DOM
function paintResults() {
  let pwdsCnt = document.querySelector(".pwds");
  pwdsCnt.innerHTML = "";
  // add Password Display Element Function
  function addPwdItemInList(userid, site, pwd, searchVal) {
    let pwdItem = document.createElement("tr");
    pwdItem.classList.add("pwd");
    pwdItem.innerHTML = `
        <td>
            <span class='userid-preview preview-txt'></span>
            <div class='copy-btn tooltip'>Copy
                <span class='tooltiptext'>Click to Copy</span>
            </div>
        </td>
        <td>
            <a target="_blank" class='site-preview preview-txt' title="Click to open in new tab"></a>
        </td>
        <td>
            <span class='pwd-preview preview-txt'></span>
            <div class='copy-btn tooltip'>Copy
                <span class='tooltiptext'>Click to Copy</span>
            </div>
        </td>
        <td>
            <div class='actions'>
                <button class='btn secondary2 edit-btn'>Edit</button>
                <button class='btn secondary2 del-btn'>Delete</button>
            </div>
        </td>`;
    let useridPreview = pwdItem.querySelector(".userid-preview");
    
    // Search Highlight
    if (searchVal !== "") {
      useridPreview.innerHTML = userid.replaceAll(searchVal,`<span class='highlighted-txt'>${searchVal}</span>`);
    } else {
      useridPreview.innerText = userid;
    };

    pwdItem.querySelector(".pwd-preview").innerText = pwd;
    let sitePreview = pwdItem.querySelector('.site-preview');
    sitePreview.innerText = site;
    sitePreview.setAttribute('href', site);
    
    pwdItem.querySelector(".edit-btn").addEventListener("click", function () {
      let element = this.parentElement.parentElement.parentElement;
      openEditPwd(element.querySelector(".userid-preview").innerText,element.querySelector(".pwd-preview").innerText);
    });

    pwdItem.querySelector(".del-btn").addEventListener("click", function () {
      deletePwd(this.parentElement.parentElement.parentElement.querySelector(".userid-preview").innerText);
    });

    pwdItem.querySelectorAll(".copy-btn").forEach((element) => {
      element.addEventListener("click", () => {
        copyToClipboard(
          element.parentElement.querySelector(".preview-txt").innerText
        );
        element.querySelector(".tooltiptext").innerText = "Copied!";
        setTimeout(() => {
          element.querySelector(".tooltiptext").innerText = "Click to Copy";
        }, 1000);
      });
    });
    pwdsCnt.append(pwdItem);
  }

  // Fetching All Passwords from localstorage & Executing Search
  let pwds = JSON.parse(localStorage.getItem("pwds"));
  if (pwds === null) {
    pwds = {};
    pwdsCnt.innerHTML = noPwdsDisplay;
  }
  let userIds = Object.keys(pwds);
  let searchVal = document.querySelector("#search").value;
  let pwdHeader = document.querySelector(".pwd-header");
  let searchBtn = document.querySelector("#search-btn");
  let clearSearchBtn = document.querySelector("#clear-search-btn");
  if (searchVal === "") {
    pwdHeader.innerText = "Passwords";
    if (searchBtn.classList.contains("d-none-imp")) {
      searchBtn.classList.toggle("d-none-imp");
    };
    if (!clearSearchBtn.classList.contains("d-none-imp")) {
      clearSearchBtn.classList.toggle("d-none-imp");
    };
  } else {
    if (!searchBtn.classList.contains("d-none-imp")) {
      searchBtn.classList.toggle("d-none-imp");
    };
    if (clearSearchBtn.classList.contains("d-none-imp")) {
      clearSearchBtn.classList.toggle("d-none-imp");
    };
    pwdHeader.innerText = "Password Search - " + searchVal;
    userIds.forEach((element) => {
      if (!element.toLowerCase().includes(searchVal)) {
        delete pwds[element];
      };
    });
  }
  if (Object.keys(pwds).length === 0) {
    pwdsCnt.innerHTML = noPwdsDisplay;
    return;
  };
  for (let pwdUserid in pwds) {
    let pwdObj = pwds[pwdUserid];
    addPwdItemInList(pwdUserid, pwdObj.site, pwdObj.pwd, searchVal);
  };
};

// Add/Edit Passowrds on Form Submit
function addEditPwd(e) {
  e.preventDefault();
  let pwds = JSON.parse(localStorage.getItem("pwds"));
  if (pwds === null) {
    pwds = {};
  };
  let userIds = Object.keys(pwds);
  let userid = document.querySelector("#userid").value;
  let curentUserid = document
    .querySelector("#pwd-frm")
    .getAttribute("data-userid");
  let actionType = document
    .querySelector("#pwd-frm")
    .getAttribute("data-action");
  if (userIds.includes(userid) & (actionType === "add" || curentUserid !== userid)) {
    alert("User ID already exits!");
    return;
  };
  pwds[userid] = {
    pwd: document.querySelector("#pwd").value,
    site: document.querySelector("#site").value,
    timeStamp: new Date().toDateString(),
  };
  localStorage.setItem("pwds", JSON.stringify(pwds));
  paintResults();
  togglePwdFrm();
};

// Delete Password
function deletePwd(title) {
  if (window.confirm("Are you sure to delete it?")) {
    let pwds = JSON.parse(localStorage.getItem("pwds"));
    delete pwds[title];
    if (Object.keys(pwds).length === 0) {
      localStorage.removeItem("pwds");
      paintResults();
      return;
    };
    localStorage.setItem("pwds", JSON.stringify(pwds));
    paintResults();
  };
};

// Toggle Add/Edit Password Form
function togglePwdFrm(close) {
  if (
    close &
    !document.querySelector("#pwd-frm-cnt").classList.contains("d-none-imp")
  ) {
    document.querySelector("#pwd-frm-cnt").classList.add("d-none-imp");
    return;
  } else if (close !== true) {
    document.querySelector("#pwd-frm-cnt").classList.toggle("d-none-imp");
  };
};

// Open Add Password Form
function openAddPwd() {
  let userid = document.querySelector("#userid");
  document.querySelector("#pwd-frm").setAttribute("data-action", "add");
  document.querySelector("#pwd-frm-title").innerText = "Add Password";
  userid.value = "";
  document.querySelector("#pwd").value = "";
  document.querySelector("#site").value = "";
  togglePwdFrm();
  userid.focus();
}

// Open Edit Password Form
function openEditPwd(userid, pwd) {
  document.querySelector("#pwd-frm").setAttribute("data-action", "edit");
  document.querySelector("#pwd-frm").setAttribute("data-userid", userid);
  document.querySelector("#pwd-frm-title").innerText = "Edit Password";
  document.querySelector("#userid").value = userid;
  document.querySelector("#pwd").value = pwd;
  togglePwdFrm();
}

// Toggle BackupData Form
function toggleBackupFrm() {
  if (
    close &
    !document.querySelector("#backup-frm-cnt").classList.contains("d-none-imp")
  ) {
    document.querySelector("#backup-frm-cnt").classList.add("d-none-imp");
    return;
  } else if (close !== true) {
    document.querySelector("#backup-frm-cnt").classList.toggle("d-none-imp");
    let backupData = document.querySelector("#backupdata");
    let pwds = JSON.parse(localStorage.getItem("pwds"));
    if (pwds === null) {
      backupData.value = "";
    } else {
      backupData.value = JSON.stringify(pwds);
    }
  }
}

// Toggle BackupData From Configure on Form Submit
function configureBackup(e) {
  e.preventDefault();
  if (confirm("Are you sure to execute it?")) {
    let backupData = document.querySelector("#backupdata").value;
    try {
      if (backupData !== "") {
        let pwds = JSON.parse(backupData);
        localStorage.setItem("pwds", JSON.stringify(pwds));
      } else {
        localStorage.removeItem("pwds");
      }
      toggleBackupFrm();
      paintResults();
    } catch (err) {
      alert("Your Backup JSON Data is Invalid!");
    }
  }
}

// Light/Dark Theme toggler
function toggleTheme(enabler) {
  let bodyDOM = document.querySelector("body");
  let themeBtn = document.querySelector("#theme-btn");
  let theme = localStorage.getItem('theme');
  if (theme === null) {
    theme = 'light';
  };
  if (enabler === true) {
    if (theme === "light") {
      themeBtn.innerText = "Dark Mode";
      localStorage.setItem('theme', 'light');
    }
    else{
      themeBtn.innerText = "Light Mode";
      localStorage.setItem('theme', 'dark');
      bodyDOM.classList.toggle("dark-mode");
    };
    return;
  }
  else {
    if (theme === "light") {
      themeBtn.innerText = "Light Mode";
      bodyDOM.setAttribute("data-theme", "dark");
      localStorage.setItem('theme', 'dark');
    }
    else{
      themeBtn.innerText = "Dark Mode";
      bodyDOM.setAttribute("data-theme", "light");
      localStorage.setItem('theme', 'light');
    };
    bodyDOM.classList.toggle("dark-mode");
  };
};

// All Event Listners

document
  .querySelector("#copy-backup-btn")
  .addEventListener("click", function () {
    copyToClipboard(document.querySelector("#backupdata").value);
    this.querySelector(".tooltiptext").innerText = "Copied!";
    setTimeout(() => {
      this.querySelector(".tooltiptext").innerText = "Click to Copy";
    }, 1000);
  });

document.querySelector("#pwd-add-btn").addEventListener("click", openAddPwd);
document
  .querySelector("#pwd-frm-close-btn")
  .addEventListener("click", togglePwdFrm);
document.querySelector("#pwd-frm").addEventListener("submit", addEditPwd);

document
  .querySelector("#backup-btn")
  .addEventListener("click", toggleBackupFrm);
document
  .querySelector("#backup-frm-close-btn")
  .addEventListener("click", toggleBackupFrm);
document
  .querySelector("#backup-frm")
  .addEventListener("submit", configureBackup);

document.querySelector('#theme-btn').addEventListener('click', toggleTheme);

// Configuring onclick events of "/" and "esc"
document.addEventListener("keydown", (e) => {
  let searchinp = document.querySelector("#search");
  let pwdFrmCnt = document.querySelector("#pwd-frm-cnt");
  let backupFrmCnt = document.querySelector("#backup-frm-cnt");
  if (e.key === "Escape") {
    if (!pwdFrmCnt.classList.contains("d-none-imp")) {
      togglePwdFrm(true);
    };
    if (!backupFrmCnt.classList.contains("d-none-imp")) {
      toggleBackupFrm(true);
    };
  } else if ((e.key === "/") & (document.activeElement.tagName !== "INPUT")) {
    e.preventDefault();
    searchinp.focus();
  } else if ((e.key.toLowerCase() === "n") & (document.activeElement.tagName !== "INPUT")) {
    if (pwdFrmCnt.classList.contains("d-none-imp")) {
      e.preventDefault();
      openAddPwd();
    };
  };
});

// Configuring Search with DOM
document.querySelector("#search").addEventListener("input", paintResults);
document.querySelector("#clear-search-btn").addEventListener("click", () => {
  document.querySelector("#search").value = "";
  paintResults();
});

paintResults(); //Painting Results
toggleTheme(true); // Theme toggler