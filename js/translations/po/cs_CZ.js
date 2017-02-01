angular.module("gettext").run(['gettextCatalog', function (gettextCatalog) {
    gettextCatalog.setStrings('cs_CZ', {"Current Server: {{ server }}":"Aktuální server: {{ server }}","Login":"Přihlásit","MyService":"Můj servis","Password:":"Heslo:","Server Address":"Adresa serveru","Switch Server":"Změnit server","User Name:":"Uživ. jméno:"});

}]);