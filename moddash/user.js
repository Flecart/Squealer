(function () {
    const USERS_TEMPLATE_ID = 'users-page-template';
    const USERS_CARD_ID = 'user-card-template';

    const source = document.getElementById(USERS_TEMPLATE_ID).innerHTML;
    const template = Handlebars.compile(source);
    let users = [];
    const context = { loading: true, users: null, error: null };

    const html = template(context);
    document.getElementById('main-content').innerHTML = html;

    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');

    const searchUser = (event) => {
        const searchValue = event.target.value;
        const filteredUsers = users.filter((user) => {
            return user.username.toLowerCase().includes(searchValue.toLowerCase());
        });
        context.users = filteredUsers;

        document.getElementById('main-content').innerHTML = template(context);
        document.getElementById('search-user').onchange = searchUser;
    };

    fetch(`/api/moddash/users`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
    })
        .then(async (response) => {
            const jsonResponse = await response.json();
            context.loading = false;
            users = jsonResponse;
            context.users = jsonResponse;
            document.getElementById('main-content').innerHTML = template(context);
            document.getElementById('search-user').onchange = searchUser;
        })
        .catch((error) => {
            context.error = error;
            document.getElementById('main-content').innerHTML = template(context);
        });

    const userCardSource = document.getElementById(USERS_CARD_ID).innerHTML;
    const userCardTemplate = Handlebars.compile(userCardSource);

    Handlebars.registerPartial('user-card', (a) => {
        console.log(a);
        return userCardTemplate(a);
    });
})();

function suspendUser(username, suspended) {
    const authState = JSON.parse(localStorage.getItem('auth') ?? 'null');
    suspended = !suspended;
    fetch(`/api/moddash/suspend/${username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authState.token,
        },
        body: JSON.stringify({ suspended }),
    })
        .then(async () => {
            window.location.reload();
        })
        .catch((error) => {
            console.log(error);
        });
}
