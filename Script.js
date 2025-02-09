document.addEventListener("DOMContentLoaded", function () {
    checkLogin(); // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    setupEventListeners(); // إعداد الأحداث للأزرار

    // فتح قاعدة بيانات IndexedDB
    let db;
    const request = indexedDB.open("AccountsDB", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("accounts")) {
            db.createObjectStore("accounts", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
    };

    request.onerror = function (event) {
        console.error("خطأ في فتح قاعدة البيانات", event.target.error);
    };

    // التحقق من تسجيل الدخول
    function checkLogin() {
        if (sessionStorage.getItem("loggedIn") === "true") {
            document.getElementById("loginPage").style.display = "none";
            document.getElementById("accountsPage").style.display = "block";
        } else {
            document.getElementById("loginPage").style.display = "block";
            document.getElementById("accountsPage").style.display = "none";
        }
    }

    // تسجيل الدخول
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "Admin" && password === "771616315") {
            sessionStorage.setItem("loggedIn", "true");
            checkLogin();
        } else {
            document.getElementById("error-message").innerText = "اسم المستخدم أو كلمة المرور غير صحيحة!";
        }
    });

    // تسجيل الخروج
    document.getElementById("logout").addEventListener("click", function () {
        sessionStorage.removeItem("loggedIn");
        checkLogin();
    });

    // إضافة الحساب إلى قاعدة البيانات
    document.getElementById("accountForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const customerName = document.getElementById("customerName").value;
        const itemName = document.getElementById("itemName").value;
        const price = parseFloat(document.getElementById("price").value);
        const quantity = parseInt(document.getElementById("quantity").value);
        const date = document.getElementById("date").value;
        const total = price * quantity;

        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");
        const account = { customerName, itemName, price, quantity, date, total };

        store.add(account);

        transaction.oncomplete = function () {
            alert("تمت إضافة الحساب بنجاح!");
            document.getElementById("accountForm").reset();
        };

        transaction.onerror = function () {
            console.error("خطأ في إضافة الحساب");
        };
    });

    // عرض الحسابات
    document.getElementById("showAccounts").addEventListener("click", function () {
        const transaction = db.transaction(["accounts"], "readonly");
        const store = transaction.objectStore("accounts");
        const request = store.getAll();

        request.onsuccess = function () {
            const accounts = request.result;
            const tbody = document.querySelector("#accountsTable tbody");
            tbody.innerHTML = "";

            accounts.forEach(account => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><input type="checkbox" data-id="${account.id}"></td>
                    <td>${account.customerName}</td>
                    <td>${account.itemName}</td>
                    <td>${account.date}</td>
                    <td>${account.price}</td>
                    <td>${account.quantity}</td>
                    <td>${account.total}</td>
                `;
                tbody.appendChild(row);
            });
        };

        request.onerror = function () {
            console.error("خطأ في جلب البيانات");
        };
    });

    // حذف الحسابات المحددة
    document.getElementById("deleteSelected").addEventListener("click", function () {
        const checkboxes = document.querySelectorAll("#accountsTable tbody input[type='checkbox']:checked");
        if (checkboxes.length === 0) {
            alert("يرجى تحديد الحسابات المراد حذفها");
            return;
        }

        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");

        checkboxes.forEach(checkbox => {
            const id = parseInt(checkbox.getAttribute("data-id"));
            store.delete(id);
        });

        transaction.oncomplete = function () {
            alert("تم حذف الحسابات المحددة!");
            document.getElementById("showAccounts").click();
        };

        transaction.onerror = function () {
            console.error("خطأ في حذف الحسابات");
        };
    });

    // طباعة الحسابات المحددة
    document.getElementById("printSelected").addEventListener("click", function () {
        const checkboxes = document.querySelectorAll("#accountsTable tbody input[type='checkbox']:checked");
        if (checkboxes.length === 0) {
            alert("يرجى تحديد الحسابات للطباعة");
            return;
        }

        let printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write("<html><head><title>طباعة الحساب</title>");
        printWindow.document.write('<link rel="stylesheet" href="styles.css">');
        printWindow.document.write("</head><body>");
        printWindow.document.write("<h2>حساب بن سهيل</h2>");
        printWindow.document.write("<table border='1' width='100%'>");
        printWindow.document.write("<tr><th>اسم الزبون</th><th>اسم الصنف</th><th>التاريخ</th><th>السعر</th><th>العدد</th><th>الإجمالي</th></tr>");

        checkboxes.forEach(checkbox => {
            const row = checkbox.closest("tr");
            printWindow.document.write("<tr>");
            for (let i = 1; i < row.cells.length; i++) {
                printWindow.document.write(`<td>${row.cells[i].innerText}</td>`);
            }
            printWindow.document.write("</tr>");
        });

        printWindow.document.write("</table>");
        printWindow.document.write(`<p style="margin-top:20px; font-weight:bold;">${new Date().toLocaleString()}</p>`);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    });

    // ضبط الوقت والتاريخ في الفوتر
    function updateDateTime() {
        document.getElementById("dateTime").innerText = new Date().toLocaleString();
    }
    setInterval(updateDateTime, 1000);

    // إعداد الأحداث
    function setupEventListeners() {
        document.getElementById("showAccounts").click();
    }
});